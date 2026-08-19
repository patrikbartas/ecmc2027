#!/usr/bin/env python3
"""Zloží smerové pásy od grafika do jedného sprite sheetu pre sandbox.

    python3 tools/zloz-sheet.py

Vstup:  assets/sprites/bike-city-direction-strips-v1/  – päť pásov po troch snímkach
Výstup: assets/sprites/bike-city-96-v1.png             – 3 stĺpce × 5 riadkov po 96 px

Výstup má dve vrstvy pod sebou v jednom súbore: horná polovica je telo, dolná
vidlica. Obe sú biele masky na priehľadnom, aby sa dali v sandboxe vyfarbiť
ľubovoľnou dvojicou farieb bez čítania pixelov (getImageData padá na file://).

Čisto stdlib, žiadne závislosti. Nie je to build krok – Vercel len servíruje
hotové PNG. Spúšťa sa ručne, keď grafik dodá nové pásy.
"""
import os, struct, zlib

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASY  = os.path.join(KOREN, 'assets/sprites/bike-city-direction-strips-v1')
VYSTUP= os.path.join(KOREN, 'assets/sprites/bike-city-96-v1.png')

# Poradie riadkov vo výslednom sheete. Musí sedieť s SADY.nova.riadok v sandbox.html.
SMERY = ['up', 'up-right', 'right', 'down-right', 'down']

# Pásy sú každý v inom zväčšení. RASTER je nameraná veľkosť jedného „art pixela"
# v zdroji, MIERKA je ručná korekcia – v pásoch sú šikmé a čelné pohľady nakreslené
# väčšie než bok, takže by bicykel pri otáčaní rástol. Bok je referencia.
RASTER = {'up':11.20, 'up-right':7.10, 'right':10.22, 'down-right':7.86, 'down':11.76}
MIERKA = {'up':0.75,  'up-right':0.82, 'right':1.00,  'down-right':0.82, 'down':0.80}

BUNKA = 96
SNIMOK = 3
# nad týmto prahom sa pixel počíta ako vidlica; drží ju viditeľnú aj keď je tenká
PRAH_VIDLICE = 0.30


def nacitaj(cesta):
    """Prečíta PNG (8-bit, bez prekladania) a vráti (šírka, výška, RGBA bytes)."""
    d = open(cesta, 'rb').read()
    i, idat, ihdr, plte, trns = 8, b'', None, None, None
    while i < len(d):
        dlzka = struct.unpack('>I', d[i:i+4])[0]
        typ, data = d[i+4:i+8], d[i+8:i+8+dlzka]
        if   typ == b'IHDR': ihdr = struct.unpack('>IIBBBBB', data)
        elif typ == b'IDAT': idat += data
        elif typ == b'PLTE': plte = data
        elif typ == b'tRNS': trns = data
        i += 12 + dlzka
    W, H, hlbka, ctyp, _, _, prekladane = ihdr
    if hlbka != 8 or prekladane:
        raise SystemExit(f'{cesta}: čakám 8-bit neprekladané PNG')
    kanalov = {0:1, 2:3, 3:1, 4:2, 6:4}[ctyp]
    krok = W * kanalov
    raw = zlib.decompress(idat)
    out, pred, pos = bytearray(krok*H), bytearray(krok), 0
    for y in range(H):
        f = raw[pos]; pos += 1
        r = bytearray(raw[pos:pos+krok]); pos += krok
        if f == 1:
            for x in range(kanalov, krok): r[x] = (r[x] + r[x-kanalov]) & 255
        elif f == 2:
            for x in range(krok): r[x] = (r[x] + pred[x]) & 255
        elif f == 3:
            for x in range(krok):
                a = r[x-kanalov] if x >= kanalov else 0
                r[x] = (r[x] + ((a + pred[x]) >> 1)) & 255
        elif f == 4:
            for x in range(krok):
                a = r[x-kanalov] if x >= kanalov else 0
                b, c = pred[x], (pred[x-kanalov] if x >= kanalov else 0)
                p = a + b - c
                pa, pb, pc = abs(p-a), abs(p-b), abs(p-c)
                r[x] = (r[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        out[y*krok:(y+1)*krok] = r
        pred = r
    px = bytearray(W*H*4)
    for j in range(W*H):
        if   ctyp == 6: px[j*4:j*4+4] = out[j*4:j*4+4]
        elif ctyp == 2: px[j*4:j*4+3] = out[j*3:j*3+3]; px[j*4+3] = 255
        elif ctyp == 3:
            k = out[j]
            px[j*4:j*4+3] = plte[k*3:k*3+3]
            px[j*4+3] = trns[k] if trns and k < len(trns) else 255
        else: raise SystemExit(f'{cesta}: nepodporovaný typ farieb {ctyp}')
    return W, H, px


def zapis(cesta, W, H, rgba):
    surove = bytearray()
    for y in range(H):
        surove.append(0)
        surove += rgba[y*W*4:(y+1)*W*4]
    def kus(typ, data):
        return (struct.pack('>I', len(data)) + typ + data
                + struct.pack('>I', zlib.crc32(typ + data) & 0xffffffff))
    with open(cesta, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(kus(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 6, 0, 0, 0)))
        f.write(kus(b'IDAT', zlib.compress(bytes(surove), 9)))
        f.write(kus(b'IEND', b''))


def snimky(smer):
    """Rozreže pás na tri snímky orezané na vlastný bbox.

    Snímky sú v pásoch posunuté doľava (2. o ~15 px, 3. o ~30 px), ale majú
    zhodné rozmery – čiže je to artefakt exportu, nie pohyb. Orez podľa bboxu
    ho odstráni presne, inak by bicykel pri šliapaní poskakoval do strany.
    """
    W, H, px = nacitaj(os.path.join(PASY, f'bike-city-{smer}-v1.png'))
    V = bytearray(W*H)
    for j in range(W*H):
        if px[j*4+3]:
            V[j] = 2 if px[j*4] > 150 else 1     # svetlý pixel = vidlica
    sirka, vysledok = W // SNIMOK, []
    for f in range(SNIMOK):
        x0 = f * sirka
        xs = [x for x in range(x0, x0+sirka) if any(V[y*W+x] for y in range(H))]
        ys = [y for y in range(H) if any(V[y*W+x] for x in range(x0, x0+sirka))]
        w, h = xs[-1]-xs[0]+1, ys[-1]-ys[0]+1
        sub = bytearray(w*h)
        for y in range(h):
            r = (ys[0]+y)*W + xs[0]
            sub[y*w:(y+1)*w] = V[r:r+w]
        vysledok.append((w, h, sub))
    return vysledok


def zmensi(w, h, sub, ow, oh):
    """Zmenší plochovým priemerom a prahom späť na tri hodnoty."""
    out = bytearray(ow*oh)
    for oy in range(oh):
        y0, y1 = oy*h/oh, (oy+1)*h/oh
        for ox in range(ow):
            x0, x1 = ox*w/ow, (ox+1)*w/ow
            telo = vidlica = celkom = 0.0
            y = int(y0)
            while y < y1:
                fy = min(y+1, y1) - max(y, y0)
                x = int(x0)
                while x < x1:
                    plocha = (min(x+1, x1) - max(x, x0)) * fy
                    celkom += plocha
                    v = sub[y*w+x]
                    if   v == 1: telo += plocha
                    elif v == 2: vidlica += plocha
                    x += 1
                y += 1
            if celkom and (telo + vidlica) / celkom >= 0.5:
                out[oy*ow+ox] = 2 if vidlica >= PRAH_VIDLICE*(telo+vidlica) else 1
    return out


def main():
    W, H = SNIMOK*BUNKA, len(SMERY)*BUNKA
    vrstva = {1: bytearray(W*H), 2: bytearray(W*H)}
    for r, smer in enumerate(SMERY):
        m = (BUNKA/64.0) / RASTER[smer] * MIERKA[smer]
        for c, (w, h, sub) in enumerate(snimky(smer)):
            ow, oh = max(1, round(w*m)), max(1, round(h*m))
            bunka = zmensi(w, h, sub, ow, oh)
            dx, dy = (BUNKA-ow)//2, (BUNKA-oh)//2      # stred bicykla do stredu bunky
            for y in range(oh):
                for x in range(ow):
                    v = bunka[y*ow+x]
                    if v: vrstva[v][(r*BUNKA+dy+y)*W + c*BUNKA+dx+x] = 1
        print(f'  {smer:11s} mierka {m:.4f}')

    rgba = bytearray(W*H*2*4)
    for i, v in enumerate((vrstva[1], vrstva[2])):
        posun = i*W*H
        for j in range(W*H):
            if v[j]:
                k = (posun+j)*4
                rgba[k] = rgba[k+1] = rgba[k+2] = rgba[k+3] = 255
    zapis(VYSTUP, W, H*2, rgba)
    print(f'zapísané {VYSTUP}  {W} × {H*2} px'
          f'  (telo {sum(vrstva[1])} px, vidlica {sum(vrstva[2])} px)')


if __name__ == '__main__':
    main()

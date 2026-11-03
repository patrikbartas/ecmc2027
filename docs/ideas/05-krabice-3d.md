# Rozsypané krabice v 3D

**Stav:** 🔨 Prototyp — test v [`lab/krabice/`](../../lab/krabice/) od 3. 11. 2026 (fáza 1 + animácia v1)
**Súvisí s:** plagátový smer z 2. 11. 2026 (postava z fotky, krabice ako smajlíky),
[02-avatar-jazdca.md](02-avatar-jazdca.md) — krabica s ovocím je prirodzený „náklad na cargu"

## O čo ide

Fotka, z ktorej vychádza plagát: kamarátovi sa z cargo vozíka vysypali krabice s ovocím.
Chceme ju postaviť v 3D v prehliadači, **presne tak, ako je na fotke, vrátane uhla pohľadu**:

- **stav A:** krabice naskladané na plošine vozíka
- **stav B:** rozsypané presne ako na fotke
- **animácia A → B:** ako sa tam dostali

Čo sa stane po kliknutí, pri scrolle a kde to na webe bude, sa rozhodne, až to bude fungovať.

## Vstupy

| Čo | Poznámka |
|---|---|
| Fotka `WhatsApp Image 2026-11-02 at 13.32.06.jpeg` | 1600 × 1200, **WhatsApp zmazal EXIF** — nevieme ohniskovú vzdialenosť |
| Verzia z Drive | tiež 1600 × 1200, len inak prekomprimovaná, bez údajov o fotoaparáte. Zmazaná 3. 11. 2026 — nahradil ju originál. |
| **Originál** `assets/boxes/IMG_20191118_081300.jpg` | **4160 × 3120**, rovnaký záber ako zmenšené verzie. **18. 11. 2019 8:13**, Bratislava (mapa ukazuje okolie Zimného štadióna). Stiahnutý súbor má EXIF orezaný (len dátum a rozmer), údaje o fotoaparáte sú z Google Fotiek: **Xiaomi Redmi 4X, 4,12 mm, f/2,0, 1/50 s, ISO 127.** Test ho používa ako pozadie. |
| Anotovaný výrez `assets/boxes/pocet-krabic.png` | 1350 × 848, je to orez a zmenšenie — **merať sa smie len na fotke 1600 × 1200**, nie na výreze |

Číslovanie z anotácie:

- **na vozíku:** 1, 2 (spodok), 3 na 1, 4 na 2 (posunutá), 5 na 3, 15 za nimi pri bicykli
- **na zemi:** 6–14
- **skoro celé skryté:** 12 (za 10), 14 (vzadu), 15 (za 4 a 5) — ich pózu budeme hádať,
  na výslednej snímke ich takmer nevidno, ale v stave A a počas animácie áno

## Čo potrebujeme od kamaráta

1. ✅ **Ohnisko je známe** (3. 11. 2026). Redmi 4X má 13 Mpx snímač s pixelom 1,12 µm:

   ```
   f = 4,12 mm / 0,00112 mm = 3 679 px    pri 4160 px šírke
     = 3 679 · 1600 / 4160  = 1 415 px    pri 1600 px šírke
   fov = 2 · atan(600 / 1415) = 46,0°     vertikálne
   ```

   Ekvivalent 35 mm ≈ 31 mm. Pixel 1,12 µm je typický pre 13 Mpx snímače veľkosti 1/3"
   (S5K3L8, OV13855), nie z EXIF — ak by bol iný, uhol sa posunie o ~1°. Originál je
   v repe, 2,6× viac pixelov na klikanie rohov.
2. **Ďalšie fotky alebo video z tej chvíle.** Druhý uhol pohľadu by vyriešil skryté krabice.
3. **Rozmer jednej krabice** — stačí meter. Nie sú to banánovky: tie sú dvojdielne s vekom
   (cca 53,5 × 40 × 24,5 cm), tieto majú klapky. Podľa Patrika vyzerá ako papierová
   debnička z [Farmove](https://www.farmove.sk/makke-kusky-prikrmova-debnicka-6m-1), rozmer
   tam ale nie je. Pomer strán dopočítame z fotky, absolútnu veľkosť nie — a tú potrebuje
   animácia. Test zatiaľ predpokladá mobil vo výške 1,55 m, z čoho vychádza krabica
   ~30 × 23 × 40 cm.
4. ~~**Ako boli naložené**~~ — vieme, viď [Stav A](#6-stav-a). Ostáva: **čo sa stalo** —
   zákruta, obrubník, brzdenie?
5. ✅ **Súhlas s použitím fotky** — máme (3. 11. 2026).

## Matematika

### 1. Model kamery

Dierková kamera. Bod v priestore `X` sa premietne na pixel `(u, v)`:

```
λ · [u, v, 1]ᵀ = K · (R · X + t)

K = | f  0  cx |      f      ohnisková vzdialenosť v pixeloch
    | 0  f  cy |      cx, cy hlavný bod — predpoklad: stred obrázka (800, 600)
    | 0  0  1  |      R, t   natočenie a poloha kamery
```

Predpoklady: štvorcové pixely, bez skosenia, skreslenie objektívu zanedbateľné (ak nie,
pridá sa jeden koeficient `k₁`). Neznáme kamery: `f` + 3 rotácia + 3 posun = **7**.

Svet: cesta je rovina `z = 0`, jednotky sú metre.

Ak bude EXIF, `f` sa vypočíta priamo. Ekvivalent 35 mm je definovaný cez uhlopriečku
(43,27 mm pri plnom formáte):

```
f_px = f_35mm · √(W² + H²) / 43,27
```

### 2. Kalibrácia kamery z úbežníkov (počiatočný odhad)

Rovnobežné hrany sa na fotke zbiehajú do úbežníka. V homogénnych súradniciach:

```
priamka cez dva body:     l = p₁ × p₂
úbežník dvoch priamok:    v = l₁ × l₂
úbežník z viacerých:      najmenší singulárny vektor matice [l₁; l₂; …; lₙ]
```

Dva úbežníky **na seba kolmých** smerov `v₁`, `v₂` dávajú ohniskovú vzdialenosť
(`c` je hlavný bod):

```
(v₁ − c) · (v₂ − c) + f² = 0     →     f = √( −(v₁ − c) · (v₂ − c) )
```

Smery osí sveta v kamere sú `rᵢ = K⁻¹ · vᵢ / ‖K⁻¹ · vᵢ‖` a `R = [r₁ r₂ r₃]`
(ortonormalizovať cez SVD, znamienka podľa toho, kam os smeruje).

Kde vo fotke sú čiary: hrany krabíc 1–5 (stoja rovno na vozíku), čiary na ceste, a na plnej
fotke budova v pozadí — rímsy, rady okien, pilastre.

⚠️ **Slabé miesto.** Keď je úbežník veľmi ďaleko (čiary skoro rovnobežné), vzorec je zle
podmienený. Tu to hrozí: kamera je sklonená len mierne, takže zvislé hrany sa zbiehajú
ďaleko pod obrázkom, a čelá krabíc 1 a 2 sú skoro kolmo na kameru. Preto je EXIF cenný
a odhad z úbežníkov berieme len ako štart pre krok 4. Krížová kontrola:
[fSpy](https://fspy.io) — open-source nástroj presne na toto.

### 3. Poloha každej krabice (PnP)

Krabica je kváder `w × d × h`. Jej 8 rohov v jej vlastných súradniciach:

```
Xₖ = (±w/2, ±d/2, ±h/2)
```

Poloha krabice `i` v svete je rotácia `Rᵢ` a posun `pᵢ` (6 neznámych):

```
X = Rᵢ · Xₖ + pᵢ
```

Na fotke klikneme viditeľné rohy (aspoň 4) a ku každému povieme, ktorý roh to je.
Pri známom `K` to vyrieši `cv2.solvePnP` (problém Perspective-n-Point).

- **Roh nie je vidno** (zakrytý, otvorené klapky)? Klikne sa hrana ako priamka a chyba je
  vzdialenosť premietnutého rohu od tej priamky.
- **Symetria:** kváder otočený o 180° okolo ktorejkoľvek osi vyzerá rovnako. Ktorá strana je
  ktorá, určí držiak a dierky. Pre animáciu je to dôležité — krabica musí dopadnúť správnou
  stranou.

### 4. Spoločné doladenie (bundle adjustment)

Kroky 2 a 3 dávajú len odhady. Na záver sa všetko ladí naraz:

```
θ = { f, R_kamera, t_kamera, w:d:h, h_plošiny, (Rᵢ, pᵢ) pre i = 1 … 15 }

min_θ   Σᵢₖ ρ( ‖ π(θ; Xᵢₖ) − uᵢₖ ‖² )   +   Σ λ · (fyzikálne podmienky)²
```

- `π` je premietnutie z kroku 1, `uᵢₖ` kliknutý bod, `ρ` Huberova strata — jeden zle kliknutý
  bod nepokazí všetko
- **fyzikálne podmienky** ako mäkké penalty: krabica na zemi → jej najnižší roh má `z = 0`;
  1 a 2 stoja na plošine → spodok v `z = h_plošiny`; 3 leží na 1, 5 na 3 → plochy sa dotýkajú
- **čo je pevné:** cesta určuje rovinu `z = 0`, krabica 1 počiatok a smer osi `x`, jeden
  nameraný rozmer mierku
- **počty:** ~7 + 3 + 1 + 15 · 6 ≈ **100 neznámych**; ~12 viditeľných krabíc × ~5 rohov × 2
  súradnice ≈ **120 rovníc** plus podmienky. Preurčené, `scipy.optimize.least_squares`
  to spočíta za sekundu.
- **cieľ:** priemerná chyba pod 2 px na 1600 px šírky. Kontrola očami: drôtený model cez fotku.

**Prečo treba meter.** Keď celú scénu aj vzdialenosť kamery zväčšíme k-krát, fotka vyzerá
rovnako — absolútnu veľkosť z nej nezistíme. Obrazu je to jedno, animácii nie: pád z výšky
`h` trvá `√(2h/g)`, z 1 m ≈ 0,45 s. Mierka zlá 2× → pád vyzerá √2-krát pomalší alebo rýchlejší.

### 5. Kontrola, že stav B je pokojový

Na stav B pustíme fyziku s gravitáciou. Nič sa nesmie pohnúť. Ak sa napríklad krabica 10
(opretá o ostatné) zošmykne, póza je fyzikálne nemožná a treba ju doladiť — inak animácia
nikdy neskončí v B.

### 6. Stav A

Podľa Patrika (3. 11. 2026): **15 krabíc, 3 rady za sebou po dĺžke vozíka.** Každý rad má
v priereze pyramídu — 2 krabice vedľa seba dole, 2 na nich, 1 navrchu na stred. Vrstvy:
6 + 6 + 3 = 15. Celé je to „jednostranná pyramída", teda hranol.

```
rad r ∈ {0, 1, 2} (po dĺžke), stĺpec s ∈ {−½, +½} (po šírke), vrstva k ∈ {0, 1, 2}

vrstva 0, 1:  p = p₀ + (r · d,  s · w,  h_plošiny + k · h + h/2)
vrstva 2:     p = p₀ + (r · d,  0,      h_plošiny + 2 · h + h/2)     ← na stred
```

**Fotka to potvrdzuje:** rad 1–5 je presne jeden celý rad — 2 a 1 dole, 4 a 3 na nich,
5 navrchu zhruba v strede medzi 4 a 3 (4 je trochu posunutá). Plošina medzi ním a kamerou
je prázdna a dlhá zhruba na jeden rad.

**Hypotéza priradenia:**

- **stredný rad** zostal celý: 1–5
- **zadný rad** (bližšie ku kamere) spadol celý: 5 krabíc
- **predný rad** (pri bicykli): zostala 15, spadli 4 — 13 a 14 ležia bližšie k bicyklu,
  takže sú asi odtiaľto

Spolu spadlo 5 + 4 = 9, čo sedí s krabicami 6–14 na zemi. Presné priradenie pre test
nevadí.

### 7. Animácia A → B

Tri cesty od najjednoduchšej:

**a) Balistika + slerp — v1.** Každá krabica letí po parabole, ktorá presne končí v B:

```
p(t) = p_A + v₀ · t + ½ · g · t²       v₀ = (p_B − p_A − ½ · g · T²) / T
q(t) = slerp(q_A, q_B, t / T)          konštantná uhlová rýchlosť
```

Každá krabica má vlastný začiatok a čas letu `T` — horné padajú prvé. Trafí B presne
a je to pár riadkov. Ale bez nárazov a šmýkania pôsobí kreslene a krabice sa vo vzduchu
môžu prekrývať.

**b) Fyzika + dorovnanie — v2.** Simulácia s gravitáciou, trením a nárazmi. Sama nikdy
nedopadne presne do B, lebo je to chaotický systém. Preto:

1. **Hľadanie:** tisíce simulácií s rôznym spúšťačom — smer a sila bočného zrýchlenia,
   trvanie, malé odchýlky v naskladaní. Skóre = súčet vzdialeností konečných póz od B
   (poloha + uhol). Hľadá sa náhodne alebo CMA-ES.
2. **Dorovnanie zvyšku** pre najlepšiu simuláciu, plynule v posledných snímkach:

```
Δp = p_B − p_sim(T)          Δq = q_B · q_sim(T)⁻¹          w(t) = smoothstep(t₁, T, t)

p(t) = p_sim(t) + w(t) · Δp
q(t) = slerp(1, Δq, w(t)) · q_sim(t)
```

Odchýlku pár centimetrov a pár stupňov oko nevidí. Keď je väčšia, hľadá sa ďalej.

**c) Ručne v Blendri** — fSpy → kamera v Blendri → rigid body → ručné kľúčové snímky.
Najrýchlejšie bez vlastnej matematiky, ale nevznikne kód, s ktorým sa dá ďalej pracovať.

**Odporúčanie:** najprv (a), aby fungovala celá cesta od fotky po prehliadač. (b) až keď
(a) pôsobí lacno.

**Výsledok sa zapečie.** Pre každú krabicu poloha + kvaternión na snímku: 30 fps × 3 s × 15
krabíc ≈ 1 350 záznamov, desiatky kB. Prehliadač len prehráva — žiadna fyzika v prehliadači,
rovnaký výsledok na každom mobile, dá sa posúvať scrollom aj prehrať pozpätku.

**Živá fyzika** („rozbi si to sám") je iný režim: zakaždým to skončí inak, nie ako na fotke.
Dá sa mať oboje — najprv zapečená animácia, potom sa pustí fyzika.

**Hypotéza, čo sa stalo** (overiť s kamarátom): krabice sú vľavo od vozíka a cesta pred ním
zatáča doprava → v zákrute sa náklad zosunul von zo zákruty. Krabice ležia trochu za
vozíkom → vozík ešte kus prešiel, kým zastal. Podľa toho sa nastaví spúšťač v (b).

## Ako to dostať do obrazu

**1. Fotorealisticky** — fotka ako pozadie, 3D krabice cez ňu:

- **Čistý podklad** (clean plate): fotka bez krabíc, ovocia a kamaráta — retuš alebo AI
  inpainting. V stave A musí byť na ceste prázdno.
- **Textúra z fotky projekciou:** v stave B vieme o každom vrchole krabice, kam padne na
  fotke → `UV = π(vrchol) / rozmer obrázka`. Zapečie sa do textúry krabice, takže sa hýbe
  s ňou. **Posledná snímka = fotka, pixel na pixel.** Strany, ktoré na fotke nevidno,
  dostanú všeobecnú kartónovú textúru.
- **Zakrytie:** rám a koleso vozíka sú pred niektorými krabicami. Jednoduchý model vozíka,
  ktorý zapisuje len hĺbku (`colorWrite: false`) — fotka presvitá a krabice za ním sa správne
  schovajú.
- **Tiene:** neviditeľná zem a plošina so `ShadowMaterial` — krabice hádžu tieň do fotky.
  Je zamračené, takže stačia mäkké tiene a netreba ladiť smer slnka.

**2. Štylizovane** — kartónová farba + rastrovací (halftone) shader, pozadie tiež prerastrované.
Netreba čistý podklad ani projekciu a ladí to s plagátom aj s pixelovými bicyklami. Uhol
pohľadu a polohy ostanú presne ako na fotke.

Rozhodne sa po v1 — všetko pred týmto krokom je pre obe cesty rovnaké.

**Prenos kamery do three.js:**

- zorný uhol `fov = 2 · atan(H / 2f)` (vo stupňoch), pomer strán `W / H`
- iný výrez (napr. bez kamaráta) = tá istá kamera, len iné okno:
  `camera.setViewOffset(1600, 1200, x, y, šírka, výška)`
- OpenCV má kameru otočenú inak (pozerá do `+z`, `y` dole), three.js do `−z`, `y` hore →
  `R_three = diag(1, −1, −1) · R_cv`

## Detail krabíc — až po kvádroch

- **Stena** ako `THREE.Shape` s otvormi — držiak je zaoblený obdĺžnik, vetracie dierky
  kruhy — a `ExtrudeGeometry` s hrúbkou kartónu ~4–5 mm.
- **Klapky:** 4 dosky na kĺbe hornej hrany, každá s vlastným uhlom. Otvorené sú pri 6–11.
  Animujú sa, nesimulujú.
- **Pomačkanie** (10, 7) sa nerieši. Projekcia textúry ho čiastočne „namaľuje".
- **Fyzika** potrebuje len kváder ako kolízny tvar. Detail je iba na vykreslenie.

## Stack

Toto je prvá vec, ktorú čisté HTML pohodlne neutiahne: matematika v Pythone a 3D
v TypeScripte s build krokom. **Landing page ostáva bez buildu** — všetko žije bokom.

- **`lab/krabice/`** — samostatný priečinok s vlastným `package.json` a `pyproject.toml`
- **Python** (numpy, scipy, opencv-python): kalibrácia, PnP, bundle adjustment, neskôr
  hľadanie simulácie. Výstup `scene.json` (kamera, rozmery, pózy A a B) a `anim.json`.
  Beží len na počítači, nikdy na webe. Repo už má Python nástroj v `tools/`.
- **TypeScript + Vite + three.js:** prehrávanie, overlay fotky, vykresľovanie.
- **Rapier** (`@dimforge/rapier3d`, Rust skompilovaný do WASM) pre v2: ten istý engine pobeží
  v Node na offline hľadanie aj v prehliadači na živú fyziku. Pre rovnaké výsledky na rôznych
  počítačoch existuje `-deterministic` build.
- **Klikač:** malá stránka v tom istom TS projekte — fotka, klik = bod, číslo = roh, ukladá
  JSON. Po každom prepočte ukáže drôtený model cez fotku, takže je to zároveň hlavný debug
  pohľad.
- **Prečo nie všetko v TS:** `least_squares` a `solvePnP` sú v Pythone hotové a odladené,
  v TS by sme si solver písali sami. Rust by šiel (nalgebra, argmin), ale pomalšie sa v ňom
  skúša.
- **Nasadenie:** výsledok je statický balík (`dist/`) do sandboxu. Vercel dnes nič nebuilduje —
  či sa `dist/` commitne, alebo pôjde o samostatný Vercel projekt, sa rozhodne pri prvom
  nasadení.
- **Fotka** je v `assets/boxes/` — kamarát s použitím súhlasil.

## Fázy

0. **Dáta od kamaráta** — rozmer krabice, čo sa stalo, súhlas. Rozpis už máme, originál nie.
1. **Test — ručne, bez solvera** (dohodnuté 3. 11. 2026). Fotka ako pozadie, kamera
   s posuvníkmi (zorný uhol od 53°, výška, sklon, natočenie, poloha), mriežka na zemi,
   plošina vozíka, 15 sivých kvádrov v pyramíde. Stav B sa poukladá ručne gizmom
   a uloží do JSON. Klikač a solver (kroky 2–4 v Matematike) prídu, až keď ručné ladenie
   nebude stačiť.
2. **Stav A + animácia v1** (balistika) v prehliadači, sivé kvádre na fotke.
3. **Detail krabíc** — dierky, držiaky, klapky.
4. **Vzhľad** — fotorealisticky alebo štylizovane.
5. *(voliteľne)* **Fyzika v2** + dorovnanie.
6. **Interakcia a miesto na webe** — klik, scroll, živá fyzika → `sandbox.html`.

## Otvorené otázky

- fotorealisticky, alebo štylizovane?
- čo spustí animáciu — načítanie, klik, scroll?
- kde na webe to bude a v akej veľkosti (mobil)
- ovocie: rozkotúľané jablko ako bodka za animáciou?

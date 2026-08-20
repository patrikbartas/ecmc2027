# Pixelové bicykle na pozadí

**Stav:** ✅ Nasadené na ostrej stránke 18. 8. 2026 (klávesa **B**)
**Kde:** [`index.html`](../../index.html) — zapína klávesa **B**, implicitne vypnuté.
**Ladenie:** [`sandbox.html`](../../sandbox.html) s panelom pod **H**.
**Grafika:** na stránke ostáva predchádzajúca trojica spritov. Nový vizuálny reštart má odsúhlasený bočný master [`bike-master-side-v1.png`](../../assets/sprites/bike-master-side-v1.png), päť smerových pásov v [`bike-city-direction-strips-v1/`](../../assets/sprites/bike-city-direction-strips-v1/) a z nich zložený sheet [`bike-city-96-v1.png`](../../assets/sprites/bike-city-96-v1.png). Nová sada beží **iba v sandboxe**, na ostrú stránku zatiaľ nejde.

## O čo ide

Po pozadí landing page sa pohybujú malé **pixelové bicykle**. Nie sú to postavičky s očami a rukami — sú to len bicykle, ale správajú sa živo: jazdia **všetkými smermi vrátane šikmých**, zastavia sa, chvíľu postoja, občas urobia niečo nečakané. Dajú sa chytiť myšou a presunúť.

Cieľ nie je „animácia na pozadí". Cieľ je **dojem, že stránka je plocha, po ktorej sa niečo pohybuje** — že to je miesto, nie obrázok.

Typy bicyklov: **cargo**, **obyčajný mestský**, **velociped** (vysoké koleso). Prípadne ďalšie.

## Vizuálny reštart — 19. 8. 2026

Najprv sa uzamkol jeden základný mestský bicykel zboku. Z neho sa následne odvodil prvý
smerový sheet pre jazdu.

- master: `assets/sprites/bike-master-side-v1.png`
- rozmer: 64 × 64 px, bicykel zaberá 56 × 32 px
- pozadie: `#000000`
- telo: `#414141`
- jediný akcent: predná vidlica `#e8e8e8`, aby bolo vždy jasné, kde je predok
- presne tri RGB farby, bez antialiasingu a polopriehľadných pixelov
- bez prehadzovačky, bŕzd, laniek, blatníkov, nosiča a ďalších detailov náročných na prekreslenie
- prvý zložený pokus `bike-city-directional-v1.png` je zamietnutý a zmazaný: zmenšenie
  a dodatočné natáčanie poškodili čistotu pôvodných pohľadov
- zdrojové smerové pásy: `assets/sprites/bike-city-direction-strips-v1/`
- každý smer je samostatný trojframový PNG v pôvodnom rozmere a bez dodatočného natáčania,
  centrovania alebo zmenšovania
- pásy používajú iba `#414141`, `#e8e8e8` a úplnú priehľadnosť; alfa je výhradne 0 alebo 255
- tri fázy jazdy na smer; menia sa iba kľuky a pedále — ❌ **prekonané, špice sa musia točiť**, viď zadanie pre grafika
- smery: hore, šikmo hore-doprava, doprava, šikmo dole-doprava, dole
- zrkadlením šikmých a bočného smeru vzniknú zostávajúce tri smery
- pohľad hore/zozadu a dole/spredu používa úzke zarovnané kolesá; svetlá vidlica ostáva
  rozpoznateľná ako dve paralelné čiary
- pásy zloží do mriežky skript [`tools/zloz-sheet.py`](../../tools/zloz-sheet.py), výsledok je `assets/sprites/bike-city-96-v1.png`

Predchádzajúce sprity zostávajú v repozitári a na stránke ako predchádzajúci pokus, kým sa nový
vizuálny smer nedokončí. V sandboxe sa sady prepínajú v paneli, aby sa nemiešali.

### Kontrola pásov — 19. 8. 2026

Technicky bez chyby: iba `#414141`, `#e8e8e8` a priehľadné pozadie, alfa výhradne 0 alebo 255,
nula medzitónov. Oproti zamietnutému prvému pokusu je opravená aj zapečená čierna.

Zmerané veľkosti — „art px" je prepočet cez nameranú hrúbku najtenšej rúrky v každom páse:

| smer | rozmer súboru | raster | bicykel v art px |
|---|---|---|---|
| right (bok) | 570 × 326 | ~10,2 | **56 × 32** |
| down-right | 515 × 414 | ~7,9 | 66 × 53 |
| up-right | 332 × 388 | ~7,1 | 47 × 55 |
| down | 238 × 545 | ~11,8 | 20 × 46 |
| up | 217 × 583 | ~11,2 | 19 × 52 |

Tri zistenia:

1. **Bok vyšiel presne 56 × 32, teda presne master.** Kresba teda nesie detail na zhruba
   56–66 pixelov na dĺžku, ale doteraz sa vtláčala do bunky 48. To bol ten problém s veľkosťou —
   nie priveľa detailov, ale dvakrát menšia mriežka, než na akej boli navrhnuté.
2. **Kresba nesedí na pixelovú mriežku** — odchýlka hrán od najlepšieho rastra je 10–22 %.
   Nie je to teda pixel art zväčšený celým číslom, ale hladká kresba vo vysokom rozlíšení.
   Zmenšenie je preto vždy prevzorkovanie s prahom a výsledok závisí od cieľovej veľkosti:
   pri bunke 64 vychádza tenko, **pri 96 je to čisté**.
3. **Päť smerov nie je z jednej kamery.** Bok je čistý profil bez akéhokoľvek skrátenia
   (56 art px = plná dĺžka bicykla), pohľady hore/dole sú takmer zhora a šikmé sú o 15–20 %
   väčšie než bok — čo je geometricky nemožné, trojštvrťový pohľad musí byť kratší než profil.
   Bicykel by pri otáčaní rástol a zmenšoval sa.

⚠️ **Bod 3 je zatiaľ zalepený, nie vyriešený.** Skript to dorovnáva tabuľkou piatich čísel
(`MIERKA` v `tools/zloz-sheet.py`, 0,75 – 1,00 podľa smeru). Skutočná oprava je prekresliť bok
mierne zhora, aby sedel k ostatným, alebo naopak stiahnuť ostatné smery k profilu.

Slabé miesto sady sú **pohľady hore a dole** — sú to úzke paličky a biela vidlica sa v nich takmer
stratí, takže pri jazde nahor/nadol nie je vidieť, kam bicykel mieri. Chcelo by to širšie
riadidlá a výraznejšie kolesá.

Ešte chýba **riadok trackstandu** (sada zatiaľ stojí na zmrazenom bočnom pohľade) a snímky sú
**tri namiesto štyroch**, takže cyklus šliapania je viditeľne trhanejší.

### Dvojfarebný bicykel — ako je to vyriešené

Nový bicykel je sivý s bledou vidlicou, čo rozbilo pôvodný trik s prefarbovaním: `filter:
brightness(0)` je jeden násobok na celý obrázok, takže dvojfarebný sprite ním zhasne celý naraz
aj s vidlicou.

Riešenie: **sprity sa prefarbujú v JS, nie CSS filtrom.** Sheet nesie dve vrstvy pod sebou —
horná polovica je telo, dolná vidlica, obe ako biele masky na priehľadnom. V kóde sa každá
vyfarbí cez `globalCompositeOperation` a zloží na seba. Prefarbený sheet sa cachuje, takže to
beží iba pri zmene farby, nie každý snímok.

Zámerne **bez `getImageData`** — na `file://` je plátno s načítaným obrázkom „tainted" a čítanie
pixelov by spadlo. Preto dve vrstvy v súbore namiesto jedného dvojfarebného obrázka.

**Farba tak prestala byť vlastnosťou PNG a stala sa parametrom kódu.** Grafik kreslí vzťah
(telo tmavšie, vidlica svetlejšia), konkrétne hodnoty dodáva panel. Na svetlom pozadí sa obe
farby obrátia, inak by sivá na bielej zmizla. Rovnakou cestou idú aj staré jednofarebné sprity,
takže `@keyframes sprite` aj posuvník tónu z CSS vypadli.

Preklápanie je viazané priamo na **`currentTime` CSS animácie pozadia** (`getAnimations()`), nie
na `performance.now()`. Inak sa to pri prvom zaváhaní rozíde a bicykle sa preklopia inokedy než
pozadie.

## Inšpirácia: vercel.com/ship

Na stránke Vercel Ship sa po pozadí pohybujú malé disketky s rukami, nohami a očami — chodia, mrkajú, pozorujú kurzor, dajú sa chytiť a ťahať. Pri prejdení myšou sa kurzor zmení na rukavicu à la Mickey Mouse.

### Čo sa reálne používa (overené z ich JS, 18. 8. 2026)

Stiahnutých 41 JS súborov (9,5 MB) a prehľadaných:

| Zistenie | Dôkaz |
|---|---|
| Three.js / WebGL | `WebGLRenderer` (40×), `THREE.` (72×) |
| 2D projekcia bez perspektívy | `OrthographicCamera` |
| Všetky postavičky na jedno vykreslenie | `InstancedMesh` |
| Sprite animácia | `drawImage`, `createImageBitmap`, `devicePixelRatio` |
| Ťahanie myšou | `pointerdown` (63×), `pointermove` (29×), `setPointerCapture` |
| Vlastný kurzor | **`cursor: none`** |

**Dôležité k tomu kurzoru:** natívny kurzor úplne skryjú a rukavicu si kreslia sami ako ďalší objekt v scéne. Preto sa dá animovať (otvorená dlaň → zovretá pri chytení) a preto pôsobí nakreslene, nie „nalepene".

**Dojem plochy nerobí 3D.** Robia ho tri veci: **pohyb do všetkých strán vrátane hore-dole**, všetky objekty v rovnakej veľkosti (žiadna perspektíva), a vykreslenie *za* obsahom. Zvyšok si domyslí mozog.

Práve ten pohyb hore-dole je to, čo z toho robí plochu a nie bočnú kulisu. Keby sa hýbali len doľava-doprava, čítalo by sa to ako pás, nie ako podlaha.

### Ako majú riešené sprity (overené z ich assetov)

Postavičky **nie sú kreslené kódom**. Sú to hotové obrázkové súbory od grafika, ktoré kód len prehráva. Z ich JS sa dá vyčítať celá štruktúra:

**Smery — 8, presne ako sme si povedali:**
`front`, `frontLeft`, `frontRight`, `back`, `backLeft`, `backRight`, `left`, `right`

**Pohľad:** súbory sa volajú `Isometric_*` — čiže **izometrický pohľad zhora**, nie z boku. Presne to, čo potrebujeme aj my.

**Stavy a animácie:**
- `resting` — pokoj
- `Duplication` — rozdvojenie (to, čo sa Patrikovi páčilo)
- `Isometric_Front_Celebrate`, `_Thinking`, `_HighFive`, `_TypeDance` (4 varianty), `_Transferingdata`, `_EyesTriangle`, `_AgentSpawn`
- Výrazy zvlášť: `Expresions_Front_Normal`, `_Confused`, `_Excited` — a to pre každý smer

**Kurzor je samostatná animovaná postava.** Len na ruku majú **25+ súborov**:
`CursorHand_PinchState_catch1/2`, `_catch_Idle`, `_catch_MoveLeft`, `_catch_MoveRight`,
`_catch_stopmoving1..5`, `_Drop_Fall1/2`, `_Drop_Fall_touchdown1..11`, `_Front_HighFive`

Preto tá rukavica pôsobí tak živo — nie je to obrázok, je to postava s vlastným stavovým automatom.

**Technicky:** používajú **animované WebP** (jeden súbor = jedna animácia s viacerými snímkami), dekódované cez `ImageDecoder` z WebCodecs, plus jednotlivé PNG pre kurzor. Konštanty `FRAME_W` / `FRAME_H` a `SPRITE_BASE` v ich kóde zodpovedajú našim `BUNKA` a sheetu.

**Čo si z toho vziať:**

1. **Pomenovanie `Smer_Animácia`** je čisté a škáluje. Prevezmime ho: `bike-city_right_ride.png`.
2. **Izometrický pohľad** — potvrdené, že to nie je bočný pohľad.
3. **Je toho veľa.** Ich produkcia má rádovo stovky ručne kreslených snímok. Naša prvá vlna 12 snímok je správne malá — najprv overiť, či to vôbec chceme, až potom kresliť.
4. My máme oproti nim výhodu: **bicykle nemajú oči ani výrazy**, takže nám odpadá celá vetva `Expresions_*`.

### Prečo to nekopírujeme

Three.js je ~600 KB. Vercel ho na stránke má aj kvôli iným 3D veciam, my by sme ho ťahali len kvôli dvadsiatim bicyklom. Rozbilo by to celý minimalistický prístup projektu.

## Odporúčaná technika

**Obyčajný 2D canvas, ~150 riadkov, nula závislostí.** Princíp je rovnaký ako u Vercelu, len bez WebGL.

1. Jeden `<canvas>` cez celú obrazovku, `position:fixed`, za obsahom
2. Každý bicykel je objekt: `{ x, y, dx, dy, typ, stav, snímka, časovač }` — smer je **vektor**, nie len vľavo/vpravo
3. **Stavový automat** — bicykel prepína medzi stavmi, každý má svoje trvanie
4. Smer sa prepočíta na **jeden z 8 sektorov po 45°** a podľa toho sa vyberie sprite
5. Pred vykreslením **zoradiť bicykle podľa `y`** — kto je nižšie, kreslí sa navrch (viď nižšie)
6. Slučka cez `requestAnimationFrame`: prepočítaj všetky → zmaž canvas → `drawImage` každý
7. `ctx.imageSmoothingEnabled = false` — **bez toho sa pixel art rozmaže**
8. Škálovanie podľa `devicePixelRatio`, inak to bude na retine rozmazané

### Pohľad zhora — nie z boku

Toto je najdôležitejší dôsledok pohybu do všetkých strán a treba to grafikovi povedať hneď na začiatku, inak prekreslí zbytočne veľa.

Ak sa bicykel hýbe aj hore a dole, **nemôže byť nakreslený z boku**. Bočný pohľad idúci nahor vyzerá pokazene. Musí to byť **pohľad zhora pod uhlom** — asi ako v starých hrách typu Zelda alebo GTA 1. Bicykel vidíš zhora a mierne spredu: pri jazde nahor mu vidíš zadné koleso a sedlo, pri jazde nadol predné koleso a riadidlá.

Nie je to nadhľad kolmo zhora (to by boli len dve kolesá a čiara), ale ani čistý bok. Niekde medzi — **cca 45° zhora**.

### Hĺbka: kto je nižšie, je vpredu

Aby to naozaj pôsobilo ako podlaha, musia sa bicykle pred vykreslením **zoradiť podľa `y`**. Kto je na obrazovke nižšie, kreslí sa cez toho, kto je vyššie — lebo je „bližšie".

Je to jeden riadok kódu (`bikes.sort((a,b) => a.y - b.y)`) a bez neho sa bicykle prekrývajú náhodne a ilúzia plochy sa rozpadne. Toto je detail, ktorý väčšina podobných efektov vynechá — a preto pôsobia ploché.

### Ako dosiahnuť „náhodnosť"

Toto je jadro celého efektu a najčastejšia chyba. Náhodnosť nesmie byť v pozíciách, ale **v časovaní**:

- Každý stav trvá náhodne dlho (napr. jazda 2–7 s, státie 1–5 s)
- Každý bicykel má vlastnú rýchlosť (±20 % od základnej)
- Vzácne udalosti majú malú pravdepodobnosť za sekundu, nie pevný interval
- Bicykle **nesmú štartovať naraz** — na začiatku dostane každý náhodný posun v čase
- Pri zmene smeru **neskákať o 180°** — vybrať susedný sektor alebo zatočiť postupne, inak to vyzerá ako porucha

Ak sú intervaly pevné, oko to do desiatich sekúnd odhalí a efekt je mŕtvy.

### Problém, ktorý Vercel nemá: rotujúce farby

Naše pozadie prechádza šiestimi farbami, takže bicykle musia preblikávať čierna/biela rovnako ako logo, inak zmiznú na žltej alebo bielej.

**Pôvodné riešenie:** sprity nakresliť **bielym na priehľadnom** a na canvas pustiť CSS
`filter: brightness(0)`, ktorý bielu zmení na čiernu a priehľadnosť nechá tak. Prepína sa tou
istou keyframe animáciou, akú už má text (`@keyframes fg`). Nula réžie navyše. Tak to funguje
na ostrej stránke dodnes.

❌ **S dvojfarebným bicyklom to prestalo stačiť — 19. 8. 2026.** `brightness()` je jeden násobok
na celý obrázok, takže dvojfarebný sprite ním zhasne celý naraz aj s vidlicou. Prefarbovanie sa
preto v sandboxe presunulo do JS, viď „Dvojfarebný bicykel" vyššie.

## Katalóg efektov

Stavy, medzi ktorými bicykel prepína. Priorita = čo stavať najskôr.

| Efekt | Popis | Priorita |
|---|---|---|
| **Jazda** | Pohyb doľava/doprava, otáčajú sa kolesá | 🔴 základ |
| **Státie (trackstand)** | Stojí na mieste a kýve sa dopredu-dozadu, ako pri trackstande | 🔴 základ |
| **Otočenie** | Zmena smeru | 🔴 základ |
| **Chytenie a ťahanie** | Dá sa chytiť myšou a presunúť inam | 🟡 dôležité |
| **Rozdvojenie** | Bicykel sa rozdelí na dva iné typy | 🟢 neskôr |
| **Pád a výbuch** | Spadne na zem, „vybuchne" a zmizne | 🟢 neskôr |

**Trackstand ako idle** je najlepší z nich — je to reálna disciplína ECMC, takže to nie je len ozdoba, ale odkaz na podujatie. Kto vie o čo ide, ocení to; kto nie, vidí len že sa bicykel pekne kýve.

❌ **Bliknutie svetla — zamietnuté 18. 8. 2026.** Bicykle sú monochromatické a svetlo by do toho
ťahalo farbu, ktorá tam nepatrí. Neriešiť.

**Pád a výbuch** potrebuje domyslieť: ak bicykle miznú, musia sa aj dopĺňať, inak sa stránka časom vyprázdni. Riešenie: po výbuchu sa po pár sekundách niekde na kraji objaví nový.

**Ďalšie efekty sa budú dopisovať** — Patrik nad tým ešte premýšľa. Pridávaj sem.

## Zadanie pre grafika

**Prepísané 19. 8. 2026** po rozbore prvej dodávky smerových pásov. Oproti pôvodnému zadaniu sa
menia štyri veci: bunka **48 → 96 px**, kresba **jednofarebná → dvojfarebná**, **špice sa musia
točiť** a kresliť sa má **rovno na cieľovú mriežku**. Zdôvodnenia sú nižšie — nie sú to
kozmetické preferencie, každá z nich zabila konkrétnu vec v prototype.

Toto je najdlhšia položka celého nápadu, tak nech to grafik vie zavčasu. Nič z toho sa nedá
dorobiť kódom.

### Pravidlo č. 1: kresliť rovno na cieľovú mriežku

Toto je najdôležitejší bod celého zadania a v prvej dodávke bol porušený.

Pásy prišli ako **hladká kresba vo vysokom rozlíšení** — 1 254 až 2 103 px na šírku, pričom hrany
nesedeli na žiadny raster (odchýlka od najlepšej mriežky 10–22 %). Nie je to teda pixel art
zväčšený celým číslom, ale obyčajná kresba, ktorú musí kód zmenšiť. A každé také zmenšenie je
**hádanie, ktorý pixel prežije** — o výslednej kresbe potom nerozhoduje grafik, ale prah
v skripte.

Preto: **kresliť priamo v 96 × 96 px, v mierke 1:1, so zapnutým rastrom.** Čiary hrubé 1 alebo
2 pixely. Žiadne zväčšovanie, žiadne dodatočné natáčanie ani zmenšovanie po nakreslení — jedna
otočka o 3° celú kresbu rozbije rovnako, ako keby bola nakreslená mimo mriežky.

Ak sa to dodrží, skript už len skladá bunky vedľa seba a **do kresby nesiahne ani jedným pixelom**.

### Rozmery

- Bunka **96 × 96 px** na snímku, teda **štvorec**
- Štvorec preto, že pri pohľade zhora je bicykel do boku široký, ale pri jazde hore/dole úzky
  a vyšší. Jedna štvorcová bunka pojme obe polohy bez menenia veľkosti.
- Mestský bicykel zboku má vyjsť zhruba **84 × 48 px**, koleso má priemer **~40 px**
- Bicykel nemusí bunku vypĺňať celú — dôležité je, aby bol **stred bicykla v strede bunky
  vo všetkých smeroch aj vo všetkých snímkach**, inak bude pri otáčaní a šliapaní poskakovať
- Prečo 96 a nie 48: pri 48 malo koleso ~20 px v priemere a otáčanie špíc sa doň fyzicky nezmestilo.
  Pri 96 sa zmestí. Zároveň sa ukázalo, že detail, ktorý grafik do bicykla už dnes kreslí,
  zodpovedá zhruba 56–66 pixelom na dĺžku — vtláčal sa teda do dvakrát menšej mriežky, než na
  akej reálne vznikol.

### Farba — dvojfarebný bicykel

- **Presne tri hodnoty v súbore:** priehľadné pozadie, telo, vidlica
- telo `#414141`, predná vidlica `#e8e8e8`
- **Alfa výhradne 0 alebo 255.** Žiadny antialiasing, žiadne poloprehľadné pixely, žiadne
  medzitóny. Buď je pixel telo, alebo vidlica, alebo priehľadný. Nič medzi tým.
- Priehľadné pozadie, **nie čierna podložka** — bicykle sa navzájom prekrývajú a zapečená čierna
  by vygumovala bicykel za nimi. Na čiernu sa treba pozerať cez vrstvu v editore, ktorá sa
  neexportuje.

Tie dve konkrétne hodnoty sú **iba značky**, podľa ktorých kód pixely roztriedi — vo výsledku sa
prefarbujú na to, čo je nastavené v paneli. Podstatný je teda len ten *vzťah*: telo tmavšie,
vidlica svetlejšia. Dôležité je, aby v súbore neboli žiadne iné odtiene, inak sa triedenie rozpadne.

Vidlica je jediný akcent a má jednu úlohu: **vždy musí byť jasné, kde je predok.** V pohľadoch
hore a dole je dnes príliš tenká a stráca sa — tam potrebuje pridať na hmote.

### Špice sa musia točiť

V prvej dodávke sa medzi snímkami menili kľuky, pedále a vidlica, ale **koleso malo vo všetkých
troch snímkach ten istý kríž v tej istej polohe**. Výsledok je, že bicykel po ploche kĺže, nie ide.

Zaviedol to bullet z reštartu 19. 8. („menia sa najmä kľuky a pedále, nie špice") — ktorý bol
v rozpore s tabuľkou počtu snímok nižšie, kde otáčanie kolies stálo od začiatku. Platí tabuľka.

Ako na to bez zbytočnej práce: pri **kríži zo štyroch špíc** má koleso symetriu 90°, takže
**4 snímky po 22,5°** sa dokonale zacyklia — piata snímka by už bola zase prvá. Štyri špice sú
pri priemere 40 px aj čitateľnejšie než osem.

- rovnaký počet špíc vo všetkých smeroch
- v pohľadoch **hore a dole** je koleso na hranu, špice nie sú vidieť — tam sa netočí nič
- v šikmých pohľadoch je koleso elipsa, špice sa točia v nej

### Formát súborov

- **Jeden PNG na smer**, štyri snímky vedľa seba zľava doprava → **384 × 96 px**
- Každá snímka vo vlastnej bunke 96 × 96, bicykel v nej vycentrovaný
- **Medzi snímkami sa bicykel nesmie posúvať.** V prvej dodávke bola každá ďalšia snímka
  odsunutá o ~15 px doľava; bolo to zjavne vecou exportu, ale kód to musel dorovnávať.
- Pomenovanie: `bike-city-<smer>-v2.png`, kde smer je `up`, `up-right`, `right`, `down-right`,
  `down`. Do priečinka `assets/sprites/bike-city-direction-strips-v2/`.

Zloženie do finálnej mriežky robí [`tools/zloz-sheet.py`](../../tools/zloz-sheet.py).

### Jedna kamera pre všetkých päť smerov

Toto je najdrahšia chyba, aká sa tu dá spraviť — keď sa pomýli, prekresľuje sa všetko. V prvej
dodávke sa pomýlila: bok bol nakreslený ako **čistý profil** bez akéhokoľvek skrátenia, pohľady
hore/dole boli takmer zhora, a šikmé vyšli o 15–20 % väčšie než bok, čo je geometricky nemožné —
trojštvrťový pohľad musí byť vždy kratší než profil. Bicykel preto pri otáčaní rástol
a zmenšoval sa.

**Skúška, ktorá to odhalí za minútu.** Dva rozmery sú zvislé, a tie sa pri otáčaní bicykla
okolo zvislej osi **nemenia vôbec**:

1. **priemer kolesa**
2. **výška sedla nad zemou**

Ak sú tieto dve čísla rovnaké vo všetkých piatich smeroch, kamera sedí. Skracovať sa smie **iba
dĺžka** bicykla — tá je vodorovná a s natočením sa mení. Celková výška obrázka teda vyjsť rovnako
nemusí (pri pohľade spredu sa do nej pripočíta skrátená dĺžka), ale koleso a sedlo áno.

Uhol pohľadu: **cca 45° zhora**, ako v starých hrách typu Zelda alebo GTA 1. Nie kolmo zhora
(to by boli dve kolesá a čiara), ale ani čistý bok.

### Smery

**Cieľ je 8 smerov** (4 hlavné + 4 šikmé). Kreslí sa **päť**, zvyšné tri vyrobí kód preklopením:

| Smer | Čo je vidieť | Preklopením vznikne |
|---|---|---|
| **doprava** → | bok | doľava ← |
| **dole** ↓ | spredu — riadidlá, predné koleso | — |
| **hore** ↑ | zozadu — sedlo, zadné koleso | — |
| **šikmo dole-doprava** ↘ | tričtvrte spredu | šikmo dole-doľava ↙ |
| **šikmo hore-doprava** ↗ | tričtvrte zozadu | šikmo hore-doľava ↖ |

**Nekresliť smery doľava.** Podmienka preklápania je, že bicykel nesmie mať nič asymetrické —
nápis, tašku na jednej strane, reťaz ani prehadzovačku. Mapovanie je v konštante `SEKTOR`
v `sandbox.html`.

Poradie riadkov vo finálnom sheete je `up`, `up-right`, `right`, `down-right`, `down`.

### Počet snímok

Počty sú **na jeden smer**.

| Stav | Snímok na smer | Smerov | Spolu | Čo má byť vidieť |
|---|---|---|---|---|
| Jazda | **4** | 5 | **20** | Otáčanie kolies — špice po 22,5°, plus kľuky a pedále |
| Trackstand | **4** | 1–2 | 4–8 | Kývanie na mieste, mierny náklon dopredu-dozadu |
| Pád a výbuch | 4–6 | 1 | 4–6 | Náklon → pád → rozpad → nič |

**Trackstand a výbuch nepotrebujú všetkých 5 smerov** — sú krátke a oko si smer nevšimne.
Trackstand zatiaľ neexistuje vôbec a v sandboxe sa za neho berie zmrazený bočný pohľad, takže
stojaci bicykel je nehybný. Je to najviditeľnejšia diera oproti starej sade.

### Veľkosť — všetky typy rovnako

Všetky typy bicyklov sa v kóde vykresľujú **v rovnakej mierke**. Rozdiel medzi nimi musí vzniknúť
**v kresbe**, nie zväčšovaním:

- **mestský** — referenčná veľkosť
- **velociped** — o niečo vyšší (veľké predné koleso)
- **cargo** — o niečo dlhší (predĺžený rám, debna vpredu)

Kresliť ich do rovnakej bunky, ale s rôznymi proporciami. Kód ich nebude škálovať.

### Čo nekresliť

Prehadzovačku, brzdy, lanká, blatníky, nosič a podobné detaily náročné na prekreslenie. Pri
20 snímkach na typ sa každý detail platí dvadsaťkrát.

### Postupnosť — v tomto poradí, nie naraz

Prvé dve vlny sú spolu **9 obrázkov** a rozhodnú o všetkom ostatnom. Nemá zmysel kresliť ďalej,
kým nie sú odsúhlasené.

1. **Kontrola kamery — 5 statických snímok**, po jednej na smer, mestský bicykel, žiadna
   animácia. Na tom sa overí, či bicykel pri otáčaní nerastie. Toto je najlacnejší spôsob, ako
   chytiť najdrahšiu chybu.
2. **Bok, 4 snímky, s točiacimi sa špicami.** Overí sa, či pohyb vyzerá ako jazda.
3. **Zvyšné štyri smery, po 4 snímkach.**
4. **Trackstand.**
5. **Velociped a cargo v tom istom jazyku.**
6. **Až nakoniec:** rozdvojenie a výbuch.

## Farebný režim — nezablokovať sa

Rotácia šiestich farieb **nemusí zostať navždy**. Zvažuje sa aj statické pozadie (čierne alebo
biele) s tmavosivými bicyklami, ako to má Vercel Ship.

✅ **Rozhodnuté 20. 8. 2026: v produkčnej verzii webu rotácia nebude.** Ostane len svetlý
a tmavý režim, šesťfarebná paleta sa z pozadia presunie na bicykle (viď
[02-avatar-jazdca.md](02-avatar-jazdca.md)). Rotácia je vec **súčasnej landing page**, takže
nižšie popísaný sandbox aj prepínač režimov platia ďalej — len vieme, kam to smeruje.

Preto je **systém bicyklov úplne nezávislý od farebnej animácie**. V `sandbox.html` sa dá režim
prepnúť v paneli:

| Režim | Ako to vyzerá |
|---|---|
| **rotácia farieb** | Bicykle sa preklápajú spolu s logom — na tmavom pozadí svetlé telo a biela vidlica, na svetlom obrátene |
| **statická čierna** | Čierne pozadie, biele logo, sivé bicykle |
| **statická biela** | Biele pozadie, čierne logo, sivé bicykle |

Farby sa ladia vzorkovníkmi **telo** a **vidlica** v paneli. Platia pre tmavé pozadie; na svetlom
sa obe obrátia.

**Dôsledok pre grafika: kresliť vzťah, nie farbu.** Telo tmavšie, vidlica svetlejšia, presne dve
nepriehľadné hodnoty v súbore. Konkrétne odtiene sú len značky — kód ich prefarbí. Kresliť rovno
finálnu sivú by nás naopak zablokovalo.

~~⚠️ **Otvorené:** dnes je to jedna dvojica farieb a jej inverzia. Na čiernej sedí `#6b6b6b`
telo s bielou vidlicou, ale na žltej z toho vyjde `#949494`, čo je slabý kontrast. Ak sa rotácia
šiestich farieb udrží, budú na to nakoniec treba dve nezávislé dvojice.~~

✅ **Odpadá 20. 8. 2026** — rotácia v produkcii nebude, takže žltá, na ktorej to padalo,
neexistuje. Stačí jedna dvojica farieb a jej inverzia pre svetlý/tmavý režim. Na súčasnej landing
page sa tým nič nemení.

**Dôsledok pre kód:** prefarbovanie je v JS (`prefarbeny()` v `sandbox.html`), nie CSS filter —
dvojfarebný sprite sa jedným `brightness()` prefarbiť nedá.

## Kde to postavíme

**Nie na ostrej stránke.** Kým sa to ladí, mala by byť landing page čistá — teraz je tam len logo a to je zámer.

Prototyp pôjde do **`sandbox.html`** v roote, čiže bude dostupný na `ecmc2027.com/sandbox.html`. Náhodou to nikto nenájde, ale:

⚠️ **Nezabudnúť pridať `<meta name="robots" content="noindex">`** a `robots.txt`, inak to Google zaindexuje a začne sa to ukazovať vo vyhľadávaní vedľa ostrej stránky.

Keď to bude hotové a odsúhlasené, presunie sa to do `index.html`.

## Na rozhodnutie

- **Koľko bicyklov naraz?** Odhad 10–20. Viac pôsobí rušne, menej prázdno. Doladí sa v prototype.
- **Majú bicykle chodiť aj cez logo, alebo len okolo?** Cez logo je odvážnejšie, okolo bezpečnejšie.
- **Majú sa navzájom obchádzať, alebo môžu prechádzať cez seba?** Obchádzanie pôsobí živšie, ale je to výrazne viac kódu. Odporúčam začať bez neho.
- **Aj na mobile?** Menej kusov a bez ťahania (na dotyku nemá kurzor zmysel). Alebo úplne vypnúť.
- **Vlastný kurzor?** Rukavica ako u Vercelu, alebo len `cursor: grab`? Vlastný vyzerá lepšie, ale je to ďalší grafický podklad.
- **`prefers-reduced-motion`** — pri zapnutom nastavení animáciu vypnúť. To je povinnosť, nie voľba.

## Stav prototypu

Postavené a funkčné v `sandbox.html`:

- ✅ 8 smerov pohybu, sprite vyberaný podľa uhla, 3 smery preklápané
- ✅ Zoradenie podľa `y` — kto je nižšie, kreslí sa navrch
- ✅ Stavový automat jazda ↔ trackstand, náhodné trvania
- ✅ Chytenie a ťahanie myšou, hodenie zotrvačnosťou
- ✅ Klik = ťuknutie (bicykel blikne a zastane)
- ✅ Rozdvojenie a výbuch s časticami + automatická náhrada
- ✅ Všetky bicykle rovnako veľké
- ✅ Prepínanie režimu pozadia: rotácia farieb / statická čierna / statická biela
- ✅ Vlastný kurzor (`cursor:none` + kreslená rukavica), prepínateľný
- ✅ Prefarbovanie spolu s pozadím — v JS, viazané na `currentTime` CSS animácie pozadia
- ✅ `devicePixelRatio`, `imageSmoothingEnabled=false`
- ✅ Ovládací panel na ladenie počtu, rýchlosti, veľkosti a pauzy (klávesa **H** ho skryje)

Namerané ~120 fps pri 18 bicykloch.

### Prvá dodávka od grafika — skontrolovaná 18. 8. 2026

Prvá sada (`bike-city-v1.png`) — **192 × 288 px**, presne 4 stĺpce × 6 riadkov po 48 px.
Technicky bez chyby:

| Kontrola | Výsledok |
|---|---|
| Rozmer a mriežka | 4 snímky × 6 riadkov po 48 px ✅ |
| Farba | jediná farba `#ffffff` ✅ |
| Poloprehľadné pixely | **0** (0,00 %) ✅ |
| Priehľadné pozadie | áno ✅ |
| Všetky bunky naplnené | áno, 24/24 ✅ |
| Veľkosť súboru | 3,5 kB |

Poradie riadkov sedí s konštantou `RIADOK` v kóde — overené vizuálne:

| Riadok | Smer | Ako sa overilo |
|---|---|---|
| 0 | E (doprava) | sedlo vzadu vľavo, riadidlá vpredu vpravo |
| 1 | S (dole) | riadidlá bližšie k divákovi než sedlo |
| 2 | N (hore) | riadidlá v diaľke hore, sedlo blízko |
| 3 | SE (šikmo dole-doprava) | predok mieri dole-doprava |
| 4 | NE (šikmo hore-doprava) | predok mieri hore-doprava |
| 5 | trackstand | bok, kolesá stoja, mierne kývanie |

### Porovnanie verzií (18. 8. 2026)

Grafik dodal tri sady. Všetky sú technicky bezchybné — 192 × 288 px, jediná biela farba,
nula poloprehľadných pixelov. Líšia sa hustotou kresby:

| Sada | Nepriehľadných px | Bok a šikmé | Spredu / zozadu |
|---|---|---|---|
| v1 | 5 720 | tenké, súčiastky chýbajú | slabé |
| **v2** | **9 694** | **plné a jasné** | **plné a jasné** |
| variant-2 | 8 734 | plné, elegantnejšie | ⚠️ príliš tenké |

**Rozhodnutie Patrika 18. 8. 2026: vybraný je variant-2.** Je hranatejší, pokojnejší a má
najlepší celkový charakter. Jeho vizuálny jazyk sa preto použil aj pre cargo a velociped.

Neprijaté verzie sú **zmazané z repozitára** — rozhodnutie je zapísané tu a súbory sú v histórii
gitu, takže ich držať v `assets/` nemalo zmysel. Ostali len tie tri, ktoré web reálne načítava.

Finálna rodina:

| Typ | Súbor | Rozlišovací znak |
|---|---|---|
| mestský | `bike-city.png` | kompaktný diamond frame, rovnako veľké kolesá |
| velociped | `bike-velociped.png` | veľké predné a malé zadné koleso |
| cargo | `bike-cargo.png` | normálne zadné, menšie predné koleso a nízka plošina; opravené cargo V2 |

### Cargo V2 — oprava pohľadu a mriežky 18. 8. 2026

- zadný pohľad má obe kolesá zarovnané do úzkej zvislej čiary bez animovaných špíc
- smer NE je celý v bunke a bezpečne sa zrkadlí na NW
- trackstand je celý v bunke vrátane sedla a riadidiel
- stabilný názov používaný webom je `bike-cargo.png` a obsahuje V2

### Prepínač sád v sandboxe

Dočasná grafika generovaná kódom (`docasnySheet()`) je odstránená — všetky sady majú hotové PNG.

V paneli je pod **GRAFIKA → sada** prepínač: *iba nová (96 px)* / *iba stará (48 px)* /
*obe naraz*. Východiskovo beží iba nová, aby sa pri posudzovaní nemiešala so starou, ktorá je
pri rovnakej mierke viditeľne menšia. Sady sa líšia veľkosťou bunky, počtom snímok aj poradím
riadkov, takže si tú konfiguráciu každá nesie sama v konštante `SADY`.

| Sada | Bunka | Snímok | Riadkov | Farby |
|---|---|---|---|---|
| stará | 48 | 4 | 6 (5 smerov + trackstand) | jednofarebná |
| nová | 96 | 3 | 5 smerov | dvojfarebná |

### Čo ešte nie je

- Bicykle na seba nereagujú, prechádzajú cez seba
- Nová sada nemá trackstand ani štvrtú snímku šliapania
- Päť smerov novej sady nie je z jednej kamery (viď kontrola pásov vyššie)
- Nová sada je zatiaľ iba mestský bicykel — velociped a cargo v novom jazyku neexistujú
- Nie je doriešené správanie na mobile
- `prefers-reduced-motion` sa zatiaľ nerešpektuje (v sandboxe zámerne, na ostrej stránke bude musieť)

## Ďalší krok

Pozrieť novú sadu v pohybe v sandboxe (`sada` v paneli) a rozhodnúť dve veci: či ruší rozdiel
vo veľkosti medzi smermi, a či sú pohľady hore/dole dosť čitateľné. Podľa toho buď prekresliť,
alebo doplniť trackstand a zvyšné dva typy bicyklov.

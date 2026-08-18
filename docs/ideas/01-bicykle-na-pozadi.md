# Pixelové bicykle na pozadí

**Stav:** 🔨 Prototyp — založený 18. 8. 2026
**Kde:** [`sandbox.html`](../../sandbox.html) → živé na [ecmc2027.com/sandbox.html](https://ecmc2027.com/sandbox.html)
**Grafika:** zatiaľ dočasná, generovaná kódom. Čaká sa na sprity od grafika.

## O čo ide

Po pozadí landing page sa pohybujú malé **pixelové bicykle**. Nie sú to postavičky s očami a rukami — sú to len bicykle, ale správajú sa živo: jazdia **všetkými smermi vrátane šikmých**, zastavia sa, chvíľu postoja, občas urobia niečo nečakané. Dajú sa chytiť myšou a presunúť.

Cieľ nie je „animácia na pozadí". Cieľ je **dojem, že stránka je plocha, po ktorej sa niečo pohybuje** — že to je miesto, nie obrázok.

Typy bicyklov: **cargo**, **obyčajný mestský**, **velociped** (vysoké koleso). Prípadne ďalšie.

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

**Riešenie:** sprity nakresliť **bielym na priehľadnom** a na canvas pustiť CSS `filter: brightness(0)`, ktorý bielu zmení na čiernu a priehľadnosť nechá tak. Prepína sa tou istou keyframe animáciou, akú už má text (`@keyframes fg` v `index.html`). Nula réžie navyše, žiadne druhé sady spritov.

## Katalóg efektov

Stavy, medzi ktorými bicykel prepína. Priorita = čo stavať najskôr.

| Efekt | Popis | Priorita |
|---|---|---|
| **Jazda** | Pohyb doľava/doprava, otáčajú sa kolesá | 🔴 základ |
| **Státie (trackstand)** | Stojí na mieste a kýve sa dopredu-dozadu, ako pri trackstande | 🔴 základ |
| **Otočenie** | Zmena smeru | 🔴 základ |
| **Chytenie a ťahanie** | Dá sa chytiť myšou a presunúť inam | 🟡 dôležité |
| **Bliknutie svetla** | Predné svetlo krátko blikne | 🟢 neskôr |
| **Rozdvojenie** | Bicykel sa rozdelí na dva iné typy | 🟢 neskôr |
| **Pád a výbuch** | Spadne na zem, „vybuchne" a zmizne | 🟢 neskôr |

**Trackstand ako idle** je najlepší z nich — je to reálna disciplína ECMC, takže to nie je len ozdoba, ale odkaz na podujatie. Kto vie o čo ide, ocení to; kto nie, vidí len že sa bicykel pekne kýve.

**Pád a výbuch** potrebuje domyslieť: ak bicykle miznú, musia sa aj dopĺňať, inak sa stránka časom vyprázdni. Riešenie: po výbuchu sa po pár sekundách niekde na kraji objaví nový.

**Ďalšie efekty sa budú dopisovať** — Patrik nad tým ešte premýšľa. Pridávaj sem.

## Zadanie pre grafika

Toto je najdlhšia položka celého nápadu, tak nech to vie zavčasu. Nič z toho sa nedá dorobiť kódom.

### Formát súborov

- **Jeden PNG na typ bicykla** (cargo / mestský / velociped)
- Snímky uložené **vedľa seba v jednom rade zľava doprava**
- Všetky snímky **presne rovnako veľké** — kód ich reže podľa pevnej mriežky
- **Priehľadné pozadie** (žiadna biela plocha)
- Pomenovanie: `bike-cargo.png`, `bike-city.png`, `bike-velociped.png`

### Rozmery

- Odporúčaná mriežka: **48 × 48 px** na snímku, teda **štvorec**
- Štvorec preto, že pri pohľade zhora je bicykel do boku široký, ale pri jazde hore/dole úzky a vyšší. Jedna štvorcová bunka pojme obe polohy bez menenia veľkosti.
- Bicykel nemusí bunku vypĺňať celú — dôležité je, aby bol **stred bicykla v strede bunky vo všetkých smeroch**, inak bude pri otáčaní poskakovať
- Kresliť v mierke 1:1, **nezväčšovať** — zväčšovanie zariadi kód

### Farba — dôležité

- **Čisto biela `#ffffff` na priehľadnom pozadí**
- **Žiadne šedé odtiene, žiadny antialiasing, žiadne poloprehľadné pixely**
- Buď je pixel biely, alebo priehľadný. Nič medzi tým.
- Dôvod: bicykle sa v kóde prefarbujú na čiernu alebo bielu podľa pozadia. Šedé pixely by v čiernom režime vyzerali špinavo.

### Počet snímok

Počty sú **na jeden smer**. Pri piatich kreslených smeroch treba vynásobiť piatimi.

| Stav | Snímok na smer | Smerov | Spolu | Čo má byť vidieť |
|---|---|---|---|---|
| Jazda | **4** | 5 | **20** | Otáčanie kolies — špice v 4 fázach, aby sa to plynulo opakovalo |
| Trackstand | **4** | 1–2 | 4–8 | Kývanie na mieste, mierny náklon dopredu-dozadu |
| Bliknutie svetla | 2 | 1–2 | 2–4 | Svetlo zhasnuté / rozsvietené |
| Pád a výbuch | 4–6 | 1 | 4–6 | Náklon → pád → rozpad → nič |

**Trackstand a výbuch nepotrebujú všetkých 5 smerov** — sú krátke a oko si smer nevšimne. Netreba to prekresľovať päťkrát.

### Smery — najväčšia časť práce, čítať pozorne

Bicykle sa hýbu do **8 smerov** (4 hlavné + 4 šikmé). To ale **neznamená 8 sád kresieb** — polovica sa vyrobí preklopením v kóde.

**Nakresliť treba 5 smerov:**

| Smer | Čo je vidieť | Preklopením vznikne |
|---|---|---|
| **doprava** → | čistý bok | doľava ← |
| **dole** ↓ | spredu — riadidlá, predné koleso | — |
| **hore** ↑ | zozadu — sedlo, zadné koleso | — |
| **šikmo dole-doprava** ↘ | tričtvrte spredu | šikmo dole-doľava ↙ |
| **šikmo hore-doprava** ↗ | tričtvrte zozadu | šikmo hore-doľava ↖ |

Smery **doprava, dole a hore** sú od seba vizuálne veľmi odlišné — bok je široký, pohľad spredu a zozadu úzky. Tak to má byť.

**Nekresliť smery doľava** — vyrobia sa preklopením. Pozor len na to, aby bicykel nemal nič, čo sa preklopením pokazí (nápis, asymetrická taška, prehadzovačka len na jednej strane). Ak niečo také má, treba to buď vynechať, alebo tie smery dokresliť zvlášť.

### Postupnosť — nekresliť všetko naraz

Je toho dosť, tak to rozdeľme:

1. **Prvá vlna:** jeden typ bicykla, smery **doprava + dole + hore**, 4 snímky jazdy = **12 snímok**. To stačí na prototyp a na rozhodnutie, či to vôbec chceme.
2. **Druhá vlna:** dokresliť šikmé smery.
3. **Tretia vlna:** zvyšné typy bicyklov a trackstand.
4. **Až nakoniec:** bliknutie, rozdvojenie, výbuch.

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
- ✅ Vlastný kurzor (`cursor:none` + kreslená rukavica), prepínateľný
- ✅ Prefarbovanie na čiernu/bielu spolu s pozadím cez `filter: brightness(0)`
- ✅ `devicePixelRatio`, `imageSmoothingEnabled=false`
- ✅ Ovládací panel na ladenie počtu, rýchlosti, veľkosti a pauzy (klávesa **H** ho skryje)

Namerané ~120 fps pri 18 bicykloch.

### Dočasná grafika

Sprity sú zatiaľ **generované kódom** vo funkcii `docasnySheet()`. Kreslí presne ten formát,
ktorý čakáme od grafika: bunky 48×48, 4 snímky v riadku, 6 riadkov (5 smerov + trackstand),
biele na priehľadnom.

**Až prídu skutočné PNG, zmaže sa celá funkcia `docasnySheet()`** a nahradí načítaním obrázka.
Zvyšok kódu sa nemení — konštanty `BUNKA`, `SNIMOK`, `RIADOK` a `SEKTOR` ostávajú.

### Čo ešte nie je

- Bicykle na seba nereagujú, prechádzajú cez seba
- Všetky tri typy vyzerajú rovnako, líšia sa len veľkosťou (dočasná grafika)
- Nie je doriešené správanie na mobile
- `prefers-reduced-motion` sa zatiaľ nerešpektuje (v sandboxe zámerne, na ostrej stránke bude musieť)

## Ďalší krok

Vyskúšať naživo, doladiť počet a rýchlosť posuvníkmi, a povedať čo zmeniť.
Až potom má zmysel zadávať grafikovi prvú vlnu spritov.

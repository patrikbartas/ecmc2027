# Formát pretekov a disciplíny

## Main Race — hlavné preteky

Jadro celého podujatia. Princíp: **simulácia bežného dňa cyklokuriéra**.

Ako to funguje (podľa Salzburgu 2025 a Berlína 2026):

- Jazdec dostane **manifest** — zoznam zásielok s adresami, časovými oknami a prioritami
- Na trati je sieť **checkpointov** (staníc), kde sa zásielky vyzdvihujú a doručujú
- Jazdec si sám plánuje poradie a trasu — **rozhoduje logistické myslenie, nielen nohy**
- Za splnené doručenia sa zbierajú body
- Nemecká Wikipédia to popisuje ako „Orientierungslauf" na bicykli — orientačný beh

Trať sa vedie po **reálnych mestských uliciach**. Salzburg to mal v štvrti Schallmoos medzi Baron-Schwarz-Park (HQ) a Cube Store, po priemyselných a obytných uliciach — explicitne „just like a day in the life of a courier".

Berlín 2026 to mal na **Tempelhofer Feld** — bývalé letisko, kilometre plôch v centre mesta.

### Priebeh

Dvojfázový:

| Fáza | Kedy | Čo |
|---|---|---|
| **Kvalifikácia** | Sobota, celý deň | Všetci účastníci, výber do finále |
| **Finále** | Nedeľa | Len kvalifikovaní |

Berlín 2026 mal finále ako **jeden štyrihodinový blok, všetci naraz** — bežné aj cargo bicykle spolu. Zraz 8:30, briefing 9:30, štart 10:00.

### Kategórie (Berlín 2026)

| Kategória | Počet jazdcov vo finále |
|---|---|
| Cargo WTNB | 6 |
| Cargo Open | 10 |
| Regular Bike WTNB | 20 |
| Regular Bike Open | 40+ |

Dve osi delenia: **typ bicykla** (bežný / cargo) × **rodová kategória** (WTNB / Open).

### Pravidlá

- **Prilba povinná** — „no helmet, no race", Berlín to mal ako tvrdú podmienku
- Odporúčaná kuriérska **taška a pero** (manifest sa vypĺňa ručne)
- **Fyzický náklad** — nie sú to prázdne jazdy, reálne sa vozia veci

## Cargo Race

Samostatné preteky na **cargo bicykloch**. Samostatná disciplína aj samostatná kategória v main race.

⚠️ neoverené: presný formát cargo race — či je to tiež manifest-based, alebo skôr o manipulácii s nákladom.

## Vedľajšie disciplíny

Zo Salzburgu 2025 (stránka výsledkov) a nemeckej Wikipédie:

| Disciplína | Čo to je |
|---|---|
| **Alleycat** | Neformálne mestské preteky z bodu do bodu, bez určenej trasy. Historicky predchodca celej kuriérskej pretekárskej kultúry. |
| **Goldsprint** | Šprint na valcoch/trenažéroch, dvaja proti sebe, obvykle 500 m. Krytá, večerná, divácky vďačná disciplína. |
| **Trackstand** | Kto najdlhšie ustojí na bicykli bez pohybu. Doména fixed-gear jazdcov. |
| **Footdown** | Vyraďovacia hra v ohraničenom priestore — kto položí nohu na zem, končí. |
| **Skid contest** | Kto urobí najdlhší šmyk na fixed-gear bicykli. |
| **Bunny hop** | Skok cez postupne zvyšovanú latku. |
| **Hill sprint** | Šprint do kopca. (Berlín 2026) |
| **Bike jousting** | Rytiersky súboj na bicykloch. (Berlín 2026) |
| **Track games** | Hry na dráhe. (Berlín 2026) |

## Nešportový program

Rovnako dôležitý ako preteky:

- **City rides** — spoločné vyjazdy po meste
- **Workshopy**
- **Koncerty, karaoke, párty** (Berlín mal párty v klube PANKE)
- **Spoločné stravovanie** — Berlín mal waste-based kuchyňu
- **Ubytovanie na HQ** — stanové mestečko, miesta na karimatku vo veľkých stanoch

## Dopad na web

Čo z toho vyplýva pre štruktúru webu:

1. **Program musí uniesť dva paralelné prúdy** — športový (preteky, kvalifikácie, finále) a sociálny (rides, workshopy, párty). Salzburg aj Berlín to mali ako `/program` s podstránkami.
2. **Timetable je kritický artefakt** — 4 dni × viac miest × viac disciplín naraz. Berlín naň odkazoval z FAQ, ale nemal ho priamo na stránke, čo je slabina.
3. **Mapa** — main race sa deje v reálnych uliciach, plus HQ, plus miesta vedľajších disciplín, plus párty. Toto je najsilnejší argument pre interaktívnu mapu.
4. **Výsledky** — potrebujeme stránku na výsledky po jednotlivých disciplínach. Salzburg mal `/results/`.
5. **Registrácia musí vedieť kategórie** — bicykel × WTNB/Open, plus cargo, plus ubytovanie ako samostatná položka.

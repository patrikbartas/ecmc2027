# Weby predchádzajúcich ročníkov

Rozbor dvoch posledných ročníkov. Nie sú to konkurenti — sú to kolegovia, ktorí si prešli presne tým, čo nás čaká, a ich weby sú najlepší dostupný podklad pre naše rozhodnutia.

Poznámka k tónu: obidva weby robili dobrovoľníci popri organizovaní celého podujatia, v komunite bez rozpočtu na vývoj. To, čo nižšie uvádzam ako „my to chceme inak", nie sú ich chyby — sú to miesta, kde máme tú výhodu, že web rieši niekto dedikovane a s predstihom. Väčšinu z toho vyriešili úplne racionálne vzhľadom na čas, ktorý na to mali.

## ECMC 2026 Berlín — [ecmc2026.com](https://www.ecmc2026.com/)

**Prístup:** jednostránkový, veľmi minimalistický. Navigácia má doslova dve položky: `INFO` a `INSTAGRAM`.

### Štruktúra

- Uvítací text od organizačného tímu
- Prehľad podujatia
- **FAQ ako hlavný nosič informácií**, členené: General, Registration, Volunteering, Housing, Food, Main Race, Berlin Info
- Sponzorská sekcia — 40+ log
- Sponzoring cez PDF + Tally formulár
- Dobrovoľníci cez e-mail (`volunteer@ecmc2026.com`)

### Registrácia a platby

Externý ticketing na `tickets.freilauf.camp`. Tri typy lístkov:

| Typ | Cena | Poznámka |
|---|---|---|
| Normal | 85–100 € | Odporúčaná 100 €, minimum 85 €, možnosť priplatiť viac |
| Late to the Game | 100 € | Len v hotovosti, na mieste v Berlíne |
| Housing | — | Miesta na stan / karimatku vo veľkom stane |

Platba bankovým prevodom s deadlinom. Štartovné čísla first-come-first-served. Zoznam prihlásených zverejnený ako PDF.

Pri registrácii sa súhlasí s podmienkami vrátane awareness konceptu.

### Čo prevziať

✅ **Solidárny cenový model** (min 85 / odporúčaných 100 / môžeš dať viac) — elegantné riešenie, ktoré presne sedí do étosu komunity. Toto by sme mali prevziať prakticky jedna k jednej.

✅ **FAQ ako hlavný informačný nosič** — pre podujatie, kde ľudia riešia praktické veci (kde budem spať, čo si mám vziať, ako sa tam dostanem), to funguje lepšie než rozvláčne stránky. Nepodceňovať.

✅ **Neskorá registrácia v hotovosti na mieste** — realistické, ľudia dorazia spontánne. Nezabudnúť na to.

✅ **Radikálna jednoduchosť navigácie** — dve položky v menu. Ak nemáme obsah, nerobme kostru pre obsah, ktorý neexistuje.

## ECMC 2025 Salzburg — [ecmc2025.com](https://www.ecmc2025.com/)

**Prístup:** klasický viacstránkový web, výrazne bohatšia štruktúra než Berlín.

### Štruktúra

- `/about/` — čo je ECMC, história, hodnoty
- `/program/` s podstránkami, napr. `/program/main-race/`
- `/results/` — výsledky po disciplínach (Cargo, Main Race, Alleycat, Goldsprint, Footdown, Trackstand)
- `/code-of-conduct/` — samostatná stránka
- Lokálne jazykové články (nemecký text o Salzburgu ako centre cyklokultúry)

### Čo prevziať

✅ **Samostatná stránka pre každú disciplínu** — dá sa na ňu odkazovať zvlášť, dá sa priebežne dopĺňať, ako sa detaily upresňujú.

✅ **`/results/` členené po disciplínach** — vďaka tomu sa web po podujatí nestane mŕtvym, ale archívom. Toto je dôvod, prečo sa dnes vieme učiť zo Salzburgu.

✅ **Code of Conduct ako plnohodnotná stránka**, nie odsek v pätičke. Zodpovedá tomu, akú váhu tomu dáva IFBMA.

✅ **Dvojjazyčnosť** — miestny jazyk + angličtina. Pre nás: SK + EN.

## Kde chceme ísť ďalej

Nasledujúce veci nemal ani jeden z dvoch ročníkov. Časť z toho sú veci, na ktoré pri dobrovoľníckej príprave jednoducho nezvýši čas — a práve preto sú to naše najlepšie príležitosti odlíšiť sa.

### 1. Timetable priamo na webe

Berlín naň z FAQ odkazoval mimo web, Salzburg mal program rozdelený po stránkach. Pri štyroch dňoch × viacerých miestach × paralelných disciplínach je časový harmonogram **najpoužívanejšia stránka celého webu** a ľudia ho otvárajú na mobile, počas podujatia, v zhone.

**Náš cieľ:** filtrovateľný timetable na webe, mobile-first, nie PDF.

### 2. Interaktívna mapa

Nemal ju ani jeden ročník. Pritom main race sa deje v reálnych mestských uliciach, k tomu HQ, ubytovanie, párty miesta, doprava.

**Náš cieľ:** jedna mapa so všetkým. MapLibre + OpenStreetMap.

### 3. Registrácia bez odchodu z webu

Berlín použil externý ticketing — úplne rozumná voľba, keď nemáš kapacitu stavať vlastné. My tú kapacitu máme.

**Náš cieľ:** registrácia na vlastnom webe, dáta pod našou kontrolou, plynulý UX.

### 4. Platba kartou namiesto prevodu

Bankový prevod s deadlinom znamená manuálne párovanie platieb — pre organizátorov administratívu navyše, pre účastníkov zo zahraničia pomalé.

**Náš cieľ:** Stripe s okamžitým potvrdením, pri zachovaní solidárneho cenového modelu aj možnosti prevodu pre tých, čo kartu nechcú.

### 5. Zoznam účastníkov ako živá stránka

Berlín ho zverejnil ako PDF — funkčné, ale nedá sa prehľadávať a na mobile je to nepohodlné.

**Náš cieľ:** normálna stránka s vyhľadávaním.

## Zhrnutie stratégie

**Štruktúra Salzburgu + cenový model a FAQ prístup Berlína + päť vecí vyššie.**

Toto sú konkrétne, obhájiteľné dôvody, prečo staviame vlastný web a nie hotovú šablónu. Zároveň je to zoznam toho, čo môžeme odovzdať ďalej — ak to spravíme poriadne, ročník 2028 nemusí začínať od nuly.

## Kontakt na predchádzajúcich organizátorov

Berlín 2026 aj Salzburg 2025 sú **najcennejší zdroj, aký máme** — prešli si tým pred pár mesiacmi. Weby nepopisujú veci ako presné bodovanie main race, reálne počty, čo sa pokazilo. To sa dá zistiť len rozhovorom.

- Berlín: `volunteer@ecmc2026.com`
- IFBMA: `ifbmacouncil@gmail.com`

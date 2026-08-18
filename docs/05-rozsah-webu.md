# Plánovaný rozsah webu

⚠️ Toto je **návrh na diskusiu**, nie schválený plán. Nič z toho zatiaľ nestaviame — teraz je live len landing page.

## Fázy

### Fáza 0 — teraz ✅

Landing page. Jeden `index.html`, rotujúce farby, odkaz na Instagram. Hotové, live na [ecmc2027.com](https://ecmc2027.com).

Zámerne minimalistické: kým nie je známy termín, viac informácií ani nemáme.

### Fáza 1 — keď bude známy termín a miesto

Stále statický web, ale s obsahom:

- Termín, mesto, HQ
- Čo je ECMC (pre lokálne publikum a médiá, ktoré to nepoznajú)
- Save the date / prihlás sa na newsletter
- Code of Conduct
- Kontakty (organizátori, sponzoring, dobrovoľníci)
- SK + EN

**Technicky:** tu je moment, kedy jeden HTML súbor prestane stačiť a prejdeme na framework.

### Fáza 2 — plnohodnotný web

- **Program / timetable** — 4 dni, filtrovateľný podľa dňa a typu (šport / sociálne)
- **Disciplíny** — stránka pre main race, cargo, alleycat, goldsprint, footdown, trackstand…
- **Mapa** — HQ, trať, checkpointy, ubytovanie, párty, doprava, bike shopy
- **Registrácia + platba**
- **Ubytovanie** — kapacity, rezervácia
- **Dobrovoľníci** — prihlasovací formulár
- **Sponzori** — logá, sponzorský balík na stiahnutie
- **Praktické info o Bratislave** — doprava, letisko/vlak z Viedne, kde jesť, bike shopy
- **FAQ**

### Fáza 3 — počas a po podujatí

- **Live výsledky** počas pretekov
- **Zoznam štartujúcich** so štartovnými číslami
- **Galéria**
- Archív — web zostáva ako referencia pre budúce ročníky

## Technologické odporúčania

### Stack

**Next.js na Verceli.** Dôvody: už na Verceli sme, deploy je vyriešený, a v momente keď potrebujeme registrácie a platby, potrebujeme serverovú časť — statický HTML to neutiahne.

Prechod z terajšieho `index.html` na Next.js je otázka hodiny, nič sa nestratí. Zatiaľ na to ale nie je dôvod.

### Registrácia a platby — Stripe

Áno, **Stripe je správna voľba**, a proti bankovému prevodu Berlína je to zásadné zlepšenie:

- Podporuje **solidárny cenový model** (pay-what-you-want s minimom) cez `custom_amount`
- Karty, Apple Pay, Google Pay
- Automatické potvrdenia, žiadne manuálne párovanie platieb
- Vie **Bancontact, iDEAL, SEPA** — dôležité, účastníci sú z celej Európy
- Poplatok ~1,5 % + 0,25 € pre európske karty

⚠️ Otvorené: či podujatie zastrešuje **právny subjekt** (občianske združenie / s.r.o.) — Stripe potrebuje entitu s IBAN-om. To je vec, ktorú treba vyriešiť skôr než technológiu.

Alternatíva pre menšie objemy: klasický prevod + faktúra ako záloha. Odporúčam mať **oboje** — Stripe ako default, prevod pre tých, čo kartu nechcú.

### Mapa

Odporúčam **MapLibre GL + OpenStreetMap dlaždice** namiesto Google Maps:

- Zadarmo, bez API kľúča a bez billing účtu
- OSM je komunitný projekt — sedí to k étosu podujatia lepšie než Google
- Plná kontrola nad štýlom (vieme použiť našu farebnú paletu)
- Vlastné pinky pre HQ, checkpointy, párty, ubytovanie

### Obsah a jazyky

**SK + EN**, pričom **EN je primárny** — účastníci sú z celej Európy. SK skôr pre médiá, mesto a sponzorov.

⚠️ Zvážiť DE — najväčšia časť komunity je nemecky hovoriaca (Nemecko 5 ročníkov, Rakúsko 3, Švajčiarsko 4). Salzburg mal nemecké články.

### Čo NEodporúčam

- **CMS hneď na začiatku** — kým je obsahu málo, je to réžia navyše. Ak bude treba, `.md` súbory v repe alebo neskôr Sanity.
- **Hotové šablóny (Squarespace / Wix)** — rýchly štart, ale narazíme na ne presne tam, kde chceme ísť ďalej: vlastná registrácia, mapa, filtrovateľný timetable. Ak by web nemal mať interaktívne časti, bola by to úplne legitímna voľba.
- Riešiť live výsledky skôr, než bude existovať program.

## Farebná identita

Z landing page (od grafika):

| Farba | Hex |
|---|---|
| Čierna | `#000000` |
| Biela | `#ffffff` |
| Červená | `#b2000e` |
| Žltá | `#fece00` |
| Fialová | `#410056` |
| Tyrkysová | `#0ec9ae` |

Šesťfarebná paleta bez jednej dominantnej — to je pre web netypické a treba na to myslieť pri návrhu. Na landing page to riešime rotáciou. Pri plnom webe bude treba určiť, ktorá je primárna a ktoré sú akcentové.

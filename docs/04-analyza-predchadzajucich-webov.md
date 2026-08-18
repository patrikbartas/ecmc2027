# Analýza webov predchádzajúcich ročníkov

Pozrel som si oba posledné ročníky. Sú to naši najbližší referenční konkurenti aj zdroj toho, čo funguje a čo nie.

## ECMC 2026 Berlín — [ecmc2026.com](https://www.ecmc2026.com/)

**Prístup:** jednostránkový, veľmi minimalistický. Navigácia má doslova len dve položky: `INFO` a `INSTAGRAM`.

### Štruktúra

- Uvítací text od organizačného tímu
- Prehľad podujatia
- **FAQ ako hlavný nosič informácií**, rozdelené do kategórií: General, Registration, Volunteering, Housing, Food, Main Race, Berlin Info
- Sponzorská sekcia — 40+ log
- Sponzoring cez PDF + Tally formulár
- Dobrovoľníci cez e-mail (`volunteer@ecmc2026.com`)

### Registrácia a platby

Externý ticketing na `tickets.freilauf.camp`. Tri typy lístkov:

| Typ | Cena | Poznámka |
|---|---|---|
| Normal | 85–100 € | Odporúčaná 100 €, minimum 85 €, možnosť priplatiť viac |
| Late to the Game | 100 € | **Len v hotovosti**, na mieste v Berlíne |
| Housing | — | Miesta na stan / karimatku vo veľkom stane |

Platba **bankovým prevodom** s deadlinom. Štartovné čísla first-come-first-served. Zoznam prihlásených zverejnený ako **PDF**.

Pri registrácii sa súhlasí s podmienkami vrátane awareness konceptu.

### Čo si vziať

✅ **Solidárny model ceny** (min 85 / odporúčaných 100 / môžeš dať viac) — presne sedí do étosu komunity. Toto by sme mali prevziať.
✅ **FAQ ako hlavný informačný nosič** — pre podujatie, kde ľudia riešia praktické veci (kde budem spať, čo si mám vziať), to funguje lepšie ako rozvláčne stránky.
✅ **Late registration v hotovosti na mieste** — realistické, ľudia dorazia spontánne.

### Čo urobiť lepšie

❌ **Žiadne ceny a odkazy na registráciu priamo na homepage** — informácie boli skryté vo FAQ a na externom ticketingu.
❌ **Timetable nebol na webe**, FAQ naň len odkazovalo inam. Pri 4-dňovom programe je to najpoužívanejšia stránka.
❌ **Zoznam účastníkov ako PDF** — nedá sa prehľadávať, na mobile nepoužiteľné.
❌ **Externý ticketing** znamená stratu kontroly nad dátami a rozbitý UX (odchod z webu).
❌ **Bankový prevod s deadlinom** — manuálne párovanie platieb, veľa administratívy pre organizátorov, pomalé pre účastníkov zo zahraničia.

## ECMC 2025 Salzburg — [ecmc2025.com](https://www.ecmc2025.com/)

**Prístup:** klasický viacstránkový web, oveľa bohatšia štruktúra než Berlín.

### Štruktúra

- `/about/` — čo je ECMC, história, hodnoty
- `/program/` s podstránkami, napr. `/program/main-race/`
- `/results/` — výsledky po disciplínach (Cargo, Main Race, Alleycat, Goldsprint, Footdown, Trackstand)
- `/code-of-conduct/` — samostatná stránka
- Aj lokálne jazykové články (napr. nemecký text o Salzburgu ako centre cyklokultúry)

### Čo si vziať

✅ **Samostatná stránka pre každú disciplínu** — dá sa na ňu odkazovať, dá sa priebežne dopĺňať.
✅ **`/results/` členené po disciplínach** — po podujatí sa web nestane mŕtvym, ale archívom.
✅ **Code of Conduct ako plnohodnotná stránka**, nie odsek v pätičke.
✅ **Dvojjazyčnosť** — miestny jazyk + angličtina. Pre nás relevantné: SK + EN.

### Čo urobiť lepšie

❌ Program neuvádzal detaily bodovania a pravidiel — ľudia sa museli pýtať organizátorov.
❌ Chýbala mapa trate a miest.

## Zhrnutie — naša stratégia

Kombinácia oboch: **štruktúra Salzburgu + solidárny cenový model a FAQ prístup Berlína**, a k tomu dorobiť to, čo nemal ani jeden:

1. **Interaktívna mapa** — HQ, trať, checkpointy, párty miesta, ubytovanie, doprava
2. **Timetable priamo na webe** — filtrovateľný, mobilný, nie PDF
3. **Registrácia na vlastnom webe** — bez odchodu na externý ticketing
4. **Platba kartou okamžite** (Stripe) namiesto bankového prevodu s manuálnym párovaním
5. **Zoznam účastníkov ako živá stránka**, nie PDF

Toto sú konkrétne, obhájiteľné dôvody, prečo staviame vlastný web a nie Squarespace šablónu.

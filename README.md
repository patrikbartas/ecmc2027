# ecmc2027

Web pre **European Cycle Messenger Championships 2027 Bratislava** — 31. ročník majstrovstiev
Európy cyklokuriérov, prvý na Slovensku.

Live na [ecmc2027.com](https://ecmc2027.com).

## Čo je teraz hotové

Landing page. Jeden statický `index.html` s inline CSS, bez JavaScriptu a bez závislostí —
vycentrované logo, ktoré rotuje šiestimi farbami. Deploy cez Vercel, automaticky pri push do
`main`.

## Čo je v repe

| | O čom to je |
|---|---|
| `index.html` | ostrá landing page |
| `sandbox.html` | ihrisko na prototypy (`noindex`), do ostrej stránky idú až po odsúhlasení |
| `logo.svg` | artwork od grafika, vykresľuje sa ako CSS maska |
| `assets/sprites/` | pixel art bicyklov pre nápad s pozadím |
| `tools/` | pomocné skripty (skladanie sprite sheetu) |
| `docs/` | znalostná báza o podujatí a o webe |
| `docs/ideas/` | produktové nápady, ktoré ešte nie sú rozhodnuté |
| `CHANGELOG.md` | zmeny, ktoré uvidí návštevník; verzie sú dátumy, nie čísla |
| `CLAUDE.md` | pravidlá projektu pre prácu s AI asistentom |

## Dokumentácia

[`docs/`](docs/) je kontext k podujatiu — čo je ECMC, formát pretekov, história ročníkov
1996–2026, rozbor webov Salzburg 2025 a Berlín 2026, plánovaný rozsah nášho webu a otvorené
otázky. Prehľad je v [`docs/README.md`](docs/README.md), odkazy na zdroje v
[`docs/zdroje.md`](docs/zdroje.md).

[`docs/ideas/`](docs/ideas/) sú nápady vo fáze rozprávania — bicykle na pozadí, avatar jazdca,
generátor spoke cards. Každý má stav (💡 nápad / 🔨 prototyp / ✅ nasadené / ❌ zamietnuté) a aj
dôvody, prečo sú niektoré cesty zamietnuté.

## Prečo je repo verejné

Zámerne, aby si organizátori budúcich ročníkov mohli vziať kód aj poznámky ako východisko a
nezačínali od nuly — tak, ako sme my čerpali zo Salzburgu a Berlína. Interné veci (rozpočty,
zmluvy, osobné údaje účastníkov) sem nepatria.

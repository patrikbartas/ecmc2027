# ECMC 2027 Bratislava

Web pre **European Cycle Messenger Championships 2027** — 31. ročník majstrovstiev Európy cyklokuriérov, prvý na Slovensku.

**Kontext o podujatí je v `docs/`.** Prečítaj si ho skôr, než začneš čokoľvek navrhovať — je tam čo je ECMC, formát pretekov, história ročníkov, rozbor webov 2025/2026 a otvorené otázky. Nerob rešerš odznova.

## Aktuálny stav

Landing page. **Jeden `index.html`, ~2,8 KB, nula JavaScriptu.** Vycentrované logo, ktoré rotuje šiestimi farbami. Žiadny viditeľný text.

Live na [ecmc2027.com](https://ecmc2027.com).

## Pravidlá

**Minimalistický stack.** Jeden HTML súbor s inline CSS, kým to stačí. Nesiahaj po frameworku, buildovacom nástroji ani závislostiach, kým nepríde konkrétna požiadavka, ktorú čisté HTML neutiahne (registrácia, platby, dynamický program). Keď ten moment príde, povedz to nahlas — nescaffolduj to dopredu.

**Logo sa nedotýkaj.** `logo.svg` je artwork od grafika. Vykresľuje sa ako CSS maska s `background-color: currentColor`, takže sa použije len jeho tvar a farba vnútri súboru je ignorovaná. Nová verzia loga = len prepísať `logo.svg`, nič iné. Neinlinuj ho do HTML a nekonvertuj mu výplne na `currentColor`. Musí ostať jednofarebné s priehľadným pozadím.

**Farby.** Šesť, rotujú v cykle: čierna `#000000`, červená `#b2000e`, žltá `#fece00`, fialová `#410056`, tyrkysová `#0ec9ae`, biela `#ffffff`. Text a logo sa preklápajú medzi čiernou a bielou tak, aby boli na každom pozadí čitateľné — logika je v `@keyframes fg`.

**DNS.** Doména je na WebSupporte a **nameservery tam musia zostať** — sú na nej MX záznamy s emailom. Na Vercel mieria len `A` záznamy pre `@` a `www` (`76.76.21.21`). Vercel bude v dashboarde ponúkať prechod na `ns1/ns2.vercel-dns.com` — ignoruj to, rozbilo by to email.

**Repo je verejné.** Zámerne, aby si z neho mohli budúce ročníky vziať kód aj poznámky. Nepatria sem rozpočty, zmluvy ani osobné údaje účastníkov — až príde registrácia, dáta idú mimo repo.

## Deploy

Push do `main` → Vercel nasadí automaticky za ~2 s. Žiadny build krok, žiadna konfigurácia.

## Čo blokuje ďalšiu prácu

Termín podujatia, miesto/HQ a existencia právneho subjektu (kvôli Stripe). Detaily v `docs/06-otvorene-otazky.md`.

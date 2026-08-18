# Changelog

Zmeny na webe ECMC 2027. Formát podľa [Keep a Changelog](https://keepachangelog.com/).

**Prečo tu nie sú čísla verzií:** semantické verziovanie (`1.2.3`) je stavané na knižnice
a API, kde číslo hovorí, či zmena rozbije cudzí kód. Web nikto neimportuje, takže by tie
čísla neniesli žiadnu informáciu. Namiesto toho sú tu **dátumy** — tie na weboch fungujú
lepšie a hneď z nich vidno, čo bolo naposledy.

Kategórie: **Pridané** · **Zmenené** · **Odstránené** · **Opravené**

---

## Nezaradené

_Sem sa píšu zmeny, ktoré ešte nie sú nasadené na produkcii._

---

## 2026-08-18

Prvý deň projektu. Od prázdneho priečinka po hotovú landing page s animáciou.

### Pridané

- **Landing page** — jeden `index.html`, pozadie rotuje šiestimi farbami značky
  (čierna, červená, žltá, fialová, tyrkysová, biela), 5 s stojí a 5 s trvá prechod
- **Logo od grafika** (`logo.svg`) — vykresľuje sa ako CSS maska, takže sa prefarbuje
  spolu s pozadím a farba v samotnom SVG sa ignoruje
- **Doména** `ecmc2027.com` + `www`, HTTPS s automatickým certifikátom od Let's Encrypt
- **Automatický deploy** — push do `main` nasadí na Vercel za ~2 s
- **Pixelové bicykle na pozadí** — mestský, velociped a cargo, 8 smerov, izometrický
  pohľad, trackstand ako pokojový stav, ťahanie myšou, rozdvojenie a výbuchy.
  Zapína sa klávesou **B**, implicitne je vypnuté a nikde to nie je napísané.
- **`sandbox.html`** — ladiace ihrisko s panelom pod klávesou **H** (počet, rýchlosť,
  veľkosť, pauzy, pomer typov, režim pozadia). Má `noindex` aj zákaz v `robots.txt`.
- **`docs/`** — rešerš o ECMC: čo to je, formát pretekov, história ročníkov,
  rozbor webov 2025 a 2026, plánovaný rozsah, otvorené otázky
- **`docs/ideas/`** — priestor na produktové nápady so stavmi 💡 🔨 ✅ ❌
- **`CLAUDE.md`** — kontext a pravidlá projektu pre kohokoľvek, kto s repom pracuje

### Zmenené

- Text „coming soon" odstránený zo stránky — logo hovorí všetko okrem toho, a to sa
  ukázalo ako zbytočné. Ostal len v `<title>` a v popise pre vyhľadávače.
- Všetky bicykle sa vykresľujú v rovnakej mierke; rozdiel medzi typmi robí kresba
- Mestský bicykel: použitá verzia `variant-2` (jemnejší rám)
- Cargo: nahradené novšou verziou s presnejšou nákladnou plošinou
- Pri zapnutom systémovom obmedzení pohybu (iOS „Obmedziť pohyb", Android
  „Odstrániť animácie") už stránka nezamrzne na fialovej. Riadi sa svetlým/tmavým
  režimom systému — tmavý dá čierne pozadie a biele logo, svetlý naopak.

### Odstránené

- **Bliknutie predného svetla** — zamietnuté, bicykle sú monochromatické a svetlo
  by do nich ťahalo farbu, ktorá tam nepatrí
- **Vlastný kurzor** (kreslená rukavica) — odložené, zatiaľ sa nerobí

### Opravené

- Logo sa na mobile zmršťovalo na šírku textu pod ním (kruhová závislosť v šírkach)
- Bicykle sa na telefónoch vôbec nespúšťajú — nie je klávesnica a je to zbytočná
  záťaž na batériu. Rovnako pri zapnutom obmedzení pohybu v systéme.

# Krabice — test

Rozsypané krabice z fotky v 3D. Plán a matematika: [`docs/ideas/05-krabice-3d.md`](../../docs/ideas/05-krabice-3d.md).

Fotka je pozadie a kamera v three.js je nastavená tak, aby sa s ňou kryla. 15 krabíc má dva stavy:
**A** — naskladané na vozíku, **B** — rozsypané ako na fotke. Medzi nimi beží animácia v1
(paraboly + slerp, `src/anim.ts`).

Toto nie je súčasť landing page. Má vlastný build a na web zatiaľ nejde.

## Spustenie

```sh
cd lab/krabice
npm install
npm run dev        # http://localhost:5180
```

Na web to nejde — `lab/` a `assets/boxes/` sú v `.vercelignore` v koreni repa.

## Ukladanie

- **Priebežne** sa všetko ukladá do prehliadača (`localStorage`). Prežije reload aj zatvorenie,
  ale len v tom istom prehliadači a na tej istej adrese — preto má dev server pevný port 5180.
- **Súbor → uložiť do scene.json** zapíše `public/scene.json`. To je to, čo ide do gitu.
  Pri štarte má prednosť `localStorage`. Súbor sa načíta, keď je prehliadač prázdny,
  alebo cez **Súbor → načítať scene.json**.
- **Commit** potom zachová `scene.json` v histórii, **push** ho dá na GitHub.

## Ovládanie

| | |
|---|---|
| klik na krabicu | výber — objaví sa gizmo |
| **W** / **E** | posun / rotácia |
| **Q** | gizmo v súradniciach krabice / sveta |
| **G** / **P** | polož na zem / na plošinu (najnižší roh) |
| **[** **]** | predošlá / ďalšia krabica |
| **Backspace** | zabudni úpravu krabice (vráti odhad alebo stav A) |
| **Esc** | zruš výber |
| **medzerník** | prehrať A → B |
| **A** / **B** | ukáž stav A / B |
| **F** | voľný pohľad — scéna zboku, vidno aj kameru fotky |
| **C** | vo voľnom pohľade: gizmo na kameru fotky (W posun, E rotácia) |
| **← →** / **↑ ↓** | natočenie / sklon kamery o 0,1° (so Shiftom 1°) |
| **PgUp** / **PgDn** | výška kamery o 1 cm (so Shiftom 10 cm) |
| **N** | skryť / ukázať čísla krabíc |

Panel vpravo: kamera, vozík, rozmer krabice, zobrazenie, čas animácie. Kamera, vozík aj
rozmer majú vlastné tlačidlo **↺ predvolené** — vráti len danú časť, úpravy stavu B ostanú.

## Postup ladenia

1. **Kamera.** Záber určuje 7 čísel, ale ladia sa len tri:
   - **zorný uhol** — nechaj 46°, je vypočítaný z ohniska mobilu
   - **sklon** (↑ ↓) a **náklon** — žltá čiara je horizont, výška oka. Vodorovné čiary
     fasády (rímsy, spodok budovy) sa musia zbiehať na nej. Náklon nechaj 0, kým zvislé
     hrany budovy ostávajú zvislé.
   - **výška** (PgUp / PgDn) — je to vlastne mierka. Vyššia kamera = väčšie krabice.
     Kým nepoznáme rozmer krabice, nechaj 1,55 m.
   - **natočenie, x, z** — to isté ako posunúť vozík opačným smerom. Pokiaľ ešte nie sú
     poukladané krabice v stave B, ladi radšej vozík a kameru nechaj na 0.
2. **Vozík.** Plošina a kolesá na fotku.
3. **Stav B.** Krabice 6–14 jednu po druhej: klik, W/E, G. Kontroluj ich z boku (F) —
   z pohľadu fotky nevidno, či krabica nevisí vo vzduchu alebo nie je zarytá v zemi.
4. **Uložiť do scene.json** v paneli → zapíše `public/scene.json`. Pracovná kópia je
   aj v `localStorage`, takže reload nič nestratí.

## Súbory

- `src/config.ts` — čo sa ladí a ukladá, predvolené hodnoty a odkiaľ sú
- `src/layout.ts` — stav A (pyramída 2 + 2 + 1 v troch radoch), odhad stavu B
- `src/anim.ts` — animácia A → B
- `src/textures.ts` — provizórne textúry (čísla, držiak, dierky)
- `src/main.ts` — scéna, panel, úprava, ukladanie
- fotka: `assets/boxes/` v koreni repa

# Bicykel, ktorý sleduje kurzor

**Stav:** 💡 Nápad — zapísané 29. 8. 2026, nič sa nestavia
**Stavia na:** [01-bicykle-na-pozadi.md](01-bicykle-na-pozadi.md) — je to nový stav v existujúcom
stavovom automate, nie nový systém
**Súvisí s:** [02-avatar-jazdca.md](02-avatar-jazdca.md) — otázka „čí bicykel to je" sa rieši tam

## O čo ide

Jeden z bicyklov si všimne kurzor a **ide za ním**. Keď myšou prejdeš po ploche, bicykel sa
pustí za tebou. Keď zastaneš, dobehne a postojí pri tebe. Keď sa dlho nič nedeje, stratí záujem
a vráti sa k tomu, čo robil predtým.

Skoro ako psík. Ale bicykel — a v tom je celý rozdiel, viď nižšie.

**Odpoveď na hlavnú otázku: áno, dá sa to, a je to lacné.** Engine z [01](01-bicykle-na-pozadi.md)
už má všetko potrebné — osem smerov, stavový automat, trackstand, `pointermove`. Chýba mu jeden
stav navyše a zhruba **50–60 riadkov**. **Nula nových obrázkov.** Nie je to nová vec, je to
odomknutie toho, čo tam už leží.

Drahé na tom nie je programovanie, ale **ladenie pocitu**. Rozdiel medzi „pekné" a „trápne" je
v šiestich číslach, ktoré sa dajú nájsť len skúšaním v sandboxe.

## Prečo to nie je „choď za kurzorom"

Toto je jediná dôležitá vec v celom zápise. Naivná verzia — každý snímok posuň bicykel kúsok
smerom ku kurzoru — je hotová za desať minút a **vyzerá zle**. Nie je to psík, je to
laserové ukazovátko: bicykel visí kurzoru na chvoste, kopíruje jeho trhanie a čítaš to ako
efekt, nie ako živú vec.

Psík pôsobí živo preto, že **nie je dokonalý**:

- drží si odstup a nelezie ti pod nohy
- mešká — vybieha až keď sa naozaj pohneš, a chvíľu mu trvá, kým naberie
- pri prudkej zmene smeru **prestrelí** a musí sa vracať
- keď stojíš, prestane riešiť teba a začne riešiť seba
- občas sa nechá rozptýliť

Všetkých päť sa dá vyrobiť z troch obmedzení: **strop rýchlosti**, **strop rýchlosti otáčania**
a **mŕtva zóna okolo kurzora**. Nič viac.

## Model riadenia: bicykel, nie pes

Pes sa vie otočiť na mieste. Bicykel nie — a práve to je tu **výhoda, nie prekážka**.

Bicykel má smer a rýchlosť. Kurzor smer **priťahuje**, ale otáčanie má strop (~200 °/s). Keď
mu dáš kurzor za chrbát, nezacúva — **opíše oblúk** a príde zboku. To vyzerá presne ako bicykel
a zadarmo z toho vypadne aj to najlepšie správanie psíka: keď je kurzor blízko, bicykel sa
otočiť nestihne a **krúži okolo neho**.

Druhý dôvod, prečo strop otáčania: **osem smerov spritu.** Bez neho by sa pri kurzore blízko
hranice sektora sprite preblikával medzi dvoma pohľadmi niekoľkokrát za sekundu. Riešia to
dve veci spolu:

1. **strop otáčania** — smer sa mení plynulo, nie skokom
2. **hysteréza na výbere sektora** — do susedného sektora sa prepne až keď ho uhol prekročí
   o ~6°, nie hneď na hranici

Toto isté je aj poistka proti tomu, aby sa kód nezvrhol na „bicykel je kurzor". Nikdy ho
nedobehne presne, lebo nemôže.

⚠️ **Pasca: večné krúženie.** Kombinácia mŕtvej zóny a oblúka vie skončiť tak, že bicykel
donekonečna obieha kurzor a nikdy sa neusadí. Poistka: pri malej vzdialenosti **a** malej
rýchlosti sa natvrdo prepne do trackstandu. A pri veľmi nízkej rýchlosti sa strop otáčania
uvoľní — bicykel v kroku sa pretočiť vie.

## Stavový automat

Dnes sú stavy dva (`ide`, `stoji`). Pribudnú dva a jeden časovač:

| Stav | Čo robí | Kedy z neho vypadne |
|---|---|---|
| `ide` / `stoji` | dnešné náhodné blúdenie | keď je vybraný za sledovača |
| **`sleduje`** | riadi sa ku kurzoru, rýchlosť podľa vzdialenosti | vzdialenosť < mŕtva zóna → `caka`; nuda → `ide` |
| **`caka`** | trackstand, otočený ku kurzoru, mierny drift | kurzor sa posunie o > ~40 px → `sleduje` |

**Nuda** je časovač: kurzor sa nehýbe ~3 s → bicykel stratí záujem a vráti sa do bežného
blúdenia. Bez toho ti pod kurzorom trvale parkuje bicykel, čo po minúte otravuje.

**Trackstand v `caka` je najlepší detail celého nápadu.** Nie je to výplň — je to reálna
disciplína ECMC a zároveň presne to, čo kuriér robí, keď na niekoho čaká na križovatke. Kto vie
o čo ide, ocení to. Kto nie, vidí len že sa bicykel pekne kýve pri kurzore.

### Čísla na začiatok

Nie sú to výsledky, sú to štartovacie pozície na doladenie v sandboxe.

| Parameter | Odhad | Prečo |
|---|---|---|
| mŕtva zóna (zastane) | ~90 px | bunka spritu je 96 px — menšie číslo a bicykel sedí pod kurzorom |
| všimne si ťa | ~250 px | alebo sa vyberie ako najbližší, viď nižšie |
| rýchlosť pri sledovaní | 2–3× bežná (~90–140 px/s) | kurzor je aj tak rýchlejší, a to je dobre |
| strop otáčania | ~200 °/s | menej = tanker, viac = zmizne rozdiel oproti psíkovi |
| hysteréza sektora | ~6° | proti preblikávaniu spritu |
| nuda | ~3 s bez pohybu kurzora | kratšie pôsobí neurotivo, dlhšie otravne |

**Kurzor bude vždy rýchlejší než bicykel a nesmie sa to opravovať.** To zaostávanie *je* ten
efekt. Keby ho dobiehal, je to kurzorový chvost.

## Koľko bicyklov a ktorý

Tri možnosti, odporúčanie je tretia:

| Varianta | Ako to pôsobí |
|---|---|
| všetky naraz | roj, ktorý ťa naháňa — chvíľu vtipné, potom nepríjemné, a stránka sa nedá používať |
| jeden natrvalo | dobré, ale po pár minútach je zjavné, že je to „ten jeden naprogramovaný" |
| **jeden, s odovzdávaním** | vždy sleduje **práve jeden**; po ~20 s stratí záujem a štafetu prevezme iný, ktorý je práve najbližšie |

Odovzdávanie stojí tri riadky a je to rozdiel medzi efektom a živou plochou. Nie je to
„bicykel, ktorý sleduje kurzor" — je to „**niektorý z nich si ťa vždy všimne**".

**Variant na neskôr: peloton.** Sledovač má za sebou jedného-dvoch, ktorí sa držia **jeho**, nie
kurzora. Kuriérsky háčik: ide sa v skupine. Kód navyše je minimálny (cieľ nie je myš, ale bicykel
pred ním), ale pridáva to riziko zhluku, tak až po tom, čo bude fungovať jeden.

## Otázky, ktoré si Patrik nechal otvorené

### Kde to bude

Tri kandidáti a každý znamená niečo iné:

| Kde | Čo to robí |
|---|---|
| **landing page** | zapadne bez práce — bicykle už tam sú, cez celú plochu, za obsahom |
| **Depo** ([02](02-avatar-jazdca.md)) | najsilnejšie: prejdeš po mriežke jazdcov a jeden sa pustí za tebou |
| **ohraničený výbeh** | vymedzený obdĺžnik v sekcii; pri okraji zatočí. Najbezpečnejšie, ale najmenej prekvapivé |

⚠️ **Zásadné obmedzenie na neskôr, keď na stránke pribudne text:** bicykel priťahuje oko a to je
pri čítaní chyba. Keď bude na stránke naozajstný obsah, sledovanie by sa malo **vypnúť, kým je
kurzor nad textom alebo odkazom**, a zapnúť v prázdnej ploche. Dnes je stránka prázdna, takže to
neprekáža — ale je to dôvod, prečo je „ohraničený výbeh" napokon možno lepší než celá plocha.

### Čí je to bicykel

Tu sa to zaujímavo prepája s [02-avatar-jazdca.md](02-avatar-jazdca.md) a dá sa to postaviť
na tri fázy, kde každá funguje samostatne:

1. **Teraz:** všetci majú rovnaký. Náhodný typ z existujúcich troch, nič sa nepamätá.
2. **Lacný medzikrok bez registrácie:** pri prvej návšteve sa vygeneruje seed do `localStorage`
   a z neho sa **odvodí bicykel** presne tou istou cestou ako v blobatarovej časti
   [02](02-avatar-jazdca.md) — `pick("typ", …)`, `pick("farba", …)`. Vráti sa ti pri ďalšej
   návšteve ten istý. **Nula backendu, nula osobných údajov, jeden riadok v `localStorage`.**
   Zároveň sa tým vopred otestuje odvodzovanie, ktoré avatar aj tak bude potrebovať.
3. **Po registrácii:** sleduje ťa **tvoj** bicykel — ten, ktorý si si zvolil. Na `/r/<slug>`
   je to samozrejmé pokračovanie zvýraznenia: ostatní zošedivejú, tvoj ostane farebný a ide
   za tebou.

Fáza 2 je zaujímavá aj sama o sebe: „ten istý bicykel ako minule" je prekvapivo silný pocit
za takmer nulovú cenu.

### Ako sa to zapína

Nerozhodnuté a nie je to blokujúce. Precedens už na stránke je: bicykle na ostrom webe zapína
klávesa **B** a implicitne sú vypnuté. Možnosti — klávesa, tlačidlo, alebo samo od seba po
chvíli nečinnosti. **Čo je povinné, nie voliteľné:**

- ✅ `prefers-reduced-motion` → sledovanie vypnuté. Toto je z pohybov na stránke ten
  najagresívnejší, lebo reaguje priamo na teba.
- ✅ dotykové zariadenia → kurzor neexistuje. Buď vypnúť, alebo bicykel ide na miesto ťuknutia.
  Druhá možnosť je milá, ale je to iná interakcia — treba ju posúdiť zvlášť, nie odvodiť.

## Pasce

| Pasca | Riešenie |
|---|---|
| Kurzor opustí okno | `pointerleave` → zastaviť na mieste a prejsť do blúdenia. Bez toho ti bicykel utečie do rohu za posledným známym smerom. |
| Sledovač sa dá chytiť a hodiť | Nechať — ale po dopade sa musí vrátiť k sledovaniu, nie zamrznúť. |
| Klik = 1 z 10 výbuch (dnes v sandboxe) | Bicykel, ktorý ťa práve sleduje, by výbuchom nemal skončiť — pôsobí to kruto a stratíš toho, na koho si si zvykol. Buď imunita, alebo hneď preberá štafetu iný. |
| Bicykel skončí pod kurzorom | Mŕtva zóna to má riešiť, ale pri hodení alebo skoku kurzora sa to stane. Vtedy odísť bokom, nie sa teleportovať. |
| Preblikávanie spritu | Hysteréza + strop otáčania, viď vyššie. Toto je najpravdepodobnejší dôvod, prečo prvá verzia bude vyzerať lacno. |
| Karta prehliadača v pozadí | `dt` sa po návrate nafúkne a bicykel preskočí pol obrazovky. Strop `dt` (napr. 0,05 s). |

## Čo na to chýba v grafike

Nič, čo by blokovalo prototyp — beží to na existujúcich spritoch. Ale dva známe nedostatky sady
sa práve tu prejavia najviac:

1. **Trackstand v novej 96 px sade neexistuje** (viď [01](01-bicykle-na-pozadi.md)). Čakajúci
   bicykel by tak stál nehybne — a keďže stojí priamo pri kurzore, kde sa naň pozeráš, je to
   presne to miesto, kde chýbajúce kývanie najviac vidno. Starej sade trackstand nechýba, tam to
   ide hneď.
2. **Trackstand je len bočný.** „Čaká otočený k tebe" preto nefunguje do všetkých strán — buď sa
   použije bočný pohľad preklopený podľa toho, na ktorej strane je kurzor, alebo by trackstand
   potreboval viac smerov. Bočný preklopený stačí, ale je dobré vedieť, že je to kompromis.

## Ďalší krok

Postaviť to v `sandbox.html` ako ďalší stav a dať do panela štyri posuvníky — mŕtva zóna, strop
otáčania, rýchlosť sledovania, nuda. Je to práca na jedno posedenie a rozhodne sa tým vec, ktorú
sa z textu rozhodnúť nedá: **či to pôsobí ako živá vec, alebo ako efekt.** Až podľa toho má
zmysel riešiť kde, čí bicykel a ako sa to zapína.

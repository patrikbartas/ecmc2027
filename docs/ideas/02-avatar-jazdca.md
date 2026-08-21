# Avatar jazdca — bicykel, ktorý ho zastupuje

**Stav:** 💡 Nápad — nič sa nestavia, nič nie je rozhodnuté
**Zapísané:** 20. 8. 2026, doplnené 21. 8. 2026
**Súvisí s:** [01-bicykle-na-pozadi.md](01-bicykle-na-pozadi.md) — stavia to na tom istom engine

⚠️ **Toto nie je plán a hlavne to nie je rozhodnutie o technológii.** Je to zápis rozpravy, aby
sa na to nezabudlo. Všetko technické nižšie je *odhad z augusta 2026* — kým na to príde reč,
môže sa ukázať jednoduchšie riešenie, iný stack alebo iný rozsah. Ber to ako poznámky
na pripomenutie, nie ako zadanie.

## O čo ide

Keď sa jazdec zaregistruje, zvolí si **bicykel, ktorý ho na webe zastupuje** — typ a farbu.
Ten bicykel sa potom objaví medzi ostatnými na pozadí. Čím viac prihlásených, tým viac bicyklov.

Zmysel nie je hra ani ozdoba. Je to **príslušnosť** — „to som ja, tam na tej stránke, spolu
s ostatnými, čakáme na preteky". Preto sa bicykel nedá ovládať a netreba k nemu nič vedieť hrať.

## Prečo to nie je hra — a prečo je to dôležité

Toto určuje celý rozsah: **nikto nič neovláda, nič sa nesynchronizuje v reálnom čase.** Je to
vykreslenie zoznamu, ktorý sa mení párkrát denne. Žiadny WebSocket, žiadny realtime, žiadne
riešenie konfliktov.

Pre engine z [01](01-bicykle-na-pozadi.md) to znamená jedinú zmenu:

```
dnes:   bicykel si parametre vyrobí sám       → Math.random()
potom:  bicykel parametre dostane zvonku      → [{typ, farba, ...}, ...]
```

**To je celá integrácia.** Preto sa oplatí engine na renderovanie z poľa konfigurácií prerobiť
kedykoľvek — aj dávno predtým, než niečo také existuje. V sandboxe sa to pole zatiaľ vygeneruje.

Vo chvíli, keď by sa bicykel dal ovládať, potrebujeme realtime, ochranu proti zneužitiu
a moderáciu — a začne to súperiť s tým, na čo web je. **Neovládateľnosť je funkcia, nie
obmedzenie.**

## Čo si jazdec volí

| Vlastnosť | Stav | Cena v grafike |
|---|---|---|
| **Typ** — fixka / cargo | dohodnuté, zatiaľ len tieto dva | celá sada snímok na typ |
| **Farba** — zo šiestich značkových | dohodnuté | **0 obrázkov** — prefarbuje sa v kóde |
| **Druhá farba** — vidlica nezávisle od tela | ⬜ návrh z 21. 8. 2026 | **0 obrázkov** — sheet už dve vrstvy nesie |
| Brašne — pod sedlo / do rámu / na riaditká | ⬜ možnosť, nie rozhodnutie | ~5 obrázkov na kus (nešliapu, stačí 1 na smer) |
| Riaditká — drops / bullhorn / flat | ⬜ možnosť, nie rozhodnutie | 15 obrázkov (3 typy × 5 smerov) |
| Náklad na cargu — stromček, palma, sud… | ⬜ možnosť, nie rozhodnutie | ~5 obrázkov na náklad |
| ~~Vozík s vlajočkou~~ | ❌ zamietnuté 21. 8. 2026 | — |

Cenník doplnkov aj pasce, ktoré k nim patria, sú v „Čo sa dá editovať" nižšie.

⚠️ **Nesúlad s [01](01-bicykle-na-pozadi.md), ktorý treba raz doriešiť:** zadanie pre grafika tam
počíta s trojicou *mestský / velociped / cargo*. Avatar hovorí o *fixke / cargu*. Fixka v sade
zatiaľ neexistuje. Nie je to konflikt, ktorý treba riešiť teraz — len nech to nezapadne, kým sa
kreslí ďalej.

### Pozadie v produkčnej verzii: light / dark, žiadna rotácia

**Povedané 20. 8. 2026.** Rotácia šiestich farieb je vec **súčasnej landing page**, nie
produkčného webu. Ten bude mať **len svetlý a tmavý režim** a šesťfarebná paleta na pozadí
nebude.

Nie je to detail, mení to niekoľko vecí naraz:

- Prefarbovanie bicyklov rieši **dve témy namiesto šiestich rotujúcich pozadí** — čiže menej
  kombinácií v cache a jednoduchšia logika (viď čísla nižšie).
- Padá otvorená otázka z [01](01-bicykle-na-pozadi.md), či bude treba **dve nezávislé dvojice
  farieb**, aby bicykle držali kontrast aj na žltej. Žltá tam nebude.
- Hustá mriežka Depa dostane pokojné pozadie, na aké je stavaná.
- Šesť značkových farieb sa presúva **z pozadia na bicykle**. Tam ostáva farebnosť podujatia
  žiť — a je to zmysluplnejšie, lebo je viazaná na konkrétneho človeka.

### Prečo šesť farieb a nie picker

Dva dôvody, oba praktické:

1. Voľná farba sa musí uniesť na svetlom aj tmavom pozadí. Šesť značkových sa dá odladiť raz;
   ľubovoľná hodnota z pickera nie.
2. Prefarbený sheet sa cachuje. Pri voľnej farbe je cache **per-jazdec**, nie per-kombináciu —
   a to je rádový rozdiel (viď čísla nižšie).

Navyše „tvoj bicykel je jedna zo šiestich farieb ECMC" je lepší produkt než RGB picker, ktorý
vyrobí hnedú.

### Ako nechať doplnky otvorené a nezaplatiť za to

Otvorené sa to nechá **vo formáte, nie v kreslení**. Ak sa s grafikom dohodne kontrakt na
vrstvu — bunka 96 px, pevný kotviaci bod, dve nepriehľadné hodnoty, alfa výhradne 0/255 —
akýkoľvek doplnok sa pridá neskôr bez zásahu do kódu. Nekreslí sa nič dopredu.

Poznámka k vozíku, ktorý je medzičasom zamietnutý — nech je dôvod zapísaný, keby sa k nemu raz
niekto vracal: je *za* bicyklom, takže ako jediný doplnok mení poradie vykreslenia — pri jazde
nahor sa kreslí **cez** bicykel, pri jazde nadol **pod** neho.

## Odvodený bicykel — inšpirácia blobatarom

**Zapísané 20. 8. 2026.** Zdroj: [blobatar.dev](https://blobatar.dev/),
[github.com/Alain00/blobatar](https://github.com/Alain00/blobatar), MIT. Prezreté vrátane
zdrojákov v npm balíku, nielen READMEčka.

Blobatar generuje avatar **z reťazca** — z prezývky, emailu, čohokoľvek. Rovnaký vstup dá vždy
rovnaký obrázok, nikde sa nič neukladá. Nás na ňom nezaujíma to, čo kreslí, ale **ako priraďuje
vlastnosti**, lebo to je presne odpoveď na náš default avatar (viď „Na čo nezabudnúť").

### Ako to funguje — tabuľka, ktorá neexistuje

Predstav si tabuľku, kde riadok je jazdec a stĺpec je vlastnosť:

```
              typ     farba   smer   brašne
pa3k          0.41    0.88    0.12   0.67
marek         0.93    0.05    0.71   0.30
```

Neukladá sa. Počíta sa zo slugu plus názvu stĺpca, a vyjde vždy rovnako. Číslo `0.41` sa potom
preloží na vlastnosť: `pick("typ", ["fixka", "cargo"])` → `0.41 × 2 = 0.83` → fixka.

Podstatné je, že číslo sa počíta **zo slugu a názvu stĺpca**, nie postupným čítaním zo
spoločného prúdu. Preto sú stĺpce navzájom nezávislé a nový stĺpec nepohne existujúcimi.

Zvyšné dve veci, ktoré tam riešia a inak by sa na ne zabudlo: podobné slugy musia dať úplne iné
čísla (`pa3k` vs `pa3l` nesmú mať skoro rovnaký bicykel — preto premiešavanie bitov, jednoduchý
hash tú vlastnosť nemá), a `Pa3k` vs `pa3k ` musí byť ten istý človek (normalizácia vstupu).

### Čo tým získame

**Default sa neprideľuje, odvodí sa zo slugu.** Nič sa neukladá — žiadny stĺpec v databáze,
žiadna migrácia, žiadny backfill pre tých, čo sa prihlásili skôr. Pri verejnom repe a GDPR je
neuložený údaj vždy lepší než uložený. A vyzerá to ako voľba, aj keď ju nikto neurobil.

**Editor je override nad odvodeným základom, nie druhý režim.** Keď si jazdec zvolí typ a farbu,
tie dve hodnoty sa dosadia a ostatné sa naďalej berú z odvodenia. Jeden renderer, jedna cesta
v kóde.

**Doplnky sa dajú pridať bez toho, aby sa niekomu zmenil bicykel.** V sekcii „Ako nechať doplnky
otvorené" je vyriešená grafická polovica problému (kontrakt na vrstvu). Toto je tá druhá: ak sa
brašne raz pridajú ako nový stĺpec, nikomu, kto si ich nezvolil, sa nič nezmení. Pri sekvenčnom
čítaní z hashu by sa v marci premiešali všetci — vrátane ľudí, čo už majú screenshot `/r/<slug>`
na Instagrame. Je to tá istá trieda chyby ako „štartové číslo ako ID v URL" v Zamietnutých:
tichý rozpad vecí, ktoré sú už vonku a nedajú sa opraviť.

**Stabilné maličkosti zadarmo.** Fázový posun trackstandu a smer zaparkovania v mriežke sú dnes
`Math.random()`, čiže iné pri každom načítaní. Odvodené zo slugu sú stále rovnaké — bicykel sa
kýve vždy tak isto a v mriežke stojí vždy rovnako otočený. Drobnosť, ale je to presne to
„to som ja". A keby sa raz renderovalo aj na serveri (OG obrázok, SSR), odpadá nesúlad medzi
serverom a klientom.

**Ich argument pre šesť farieb je lepší než náš.** V „Prečo šesť farieb a nie picker" máme dva
dôvody, oba technické (pamäť, kontrast). Blobatar necháva seed hýbať **iba odtieňom**, kým
svetlosť a sýtosť sú autorské konštanty — šesť ručne odladených tónov. Komentár v ich zdrojáku:
*nechať seed voľne behať po svetlosti a sýtosti je presne to, čo spôsobí, že generované palety
vyzerajú generovane.* To je estetický dôvod pre to isté rozhodnutie a stojí za to ho mať zapísaný.

### ⚠️ Pasca: zoznamy sa nesmú meniť

Ak k `["fixka", "cargo"]` pribudne tretí typ, tak `0.41 × 3 = 1.25` → index 1 → **cargo**. Ten
istý jazdec, nezmenený slug, a bicykel sa mu prevrátil — len preto, že sa zoznam predĺžil.

Takže: nové vlastnosti sa **pridávajú ako nové stĺpce** (to je bezpečné), ale existujúce zoznamy
a číselné rozsahy sa **zmrazia**. Priamo to súvisí s otvorenou otázkou, či fixka nahrádza mestský
a velociped, alebo k nim pribúda — **to sa musí rozhodnúť skôr, než sa pridelí prvý odvodený
bicykel**, lebo potom sa zoznam typov už nedá zmeniť bez premiešania všetkých.

### Čo z toho nepoužijeme

**Kreslenie.** Blobatar generuje tvar procedurálne z matematiky (jedna superelipsa
`|x/a|ⁿ + |y/b|ⁿ = 1`, kde „tvar hlavy" je len číslo `n`). My máme kreslené sprity od grafika
s pevným kontraktom. Žiadny vzorec nevyrobí bicykel, ktorý k tej sade sedí. Väčšina ich repa je
pre nás nepoužiteľná — berieme si z neho ~60 riadkov, nie knižnicu.

**A nerieši nám to opakovanie.** Blobatar vyzerá dobre, lebo má priestor v desiatkach tisíc
kombinácií. My máme 12 vzhľadov. Ak si požičiame mechanizmus a necháme 12 vzhľadov, riziko
tapety z „⚠️ Riziko: opakovanie" sa nezlepší ani o kúsok — to riešia ďalšie osi (smer
zaparkovania), nie odvodzovanie.

### Kedy to spraviť

**Dá sa hocikedy, aj teraz.** Nepotrebuje to backend ani registráciu — je to čistá funkcia zo
stringu. V sandboxe by sa pole konfigurácií generovalo zo zoznamu vymyslených slugov namiesto
`Math.random()`, čo je presne to, o čom hovorí sekcia „Prečo to nie je hra": engine sa oplatí
prerobiť na renderovanie z poľa konfigurácií dávno predtým, než to pole má odkiaľ prísť.

## Čo sa dá editovať — cenník a príklady

**Zapísané 21. 8. 2026.** Rozprava o tom, čo si jazdec na bicykli reálne prestaví.

⚠️ **Konkrétne kusy nižšie sú príklad smeru, nie zoznam na nakreslenie.** Čo sa naozaj nakreslí,
sa dohodne s grafikom. Podstatné je pravidlo, podľa ktorého sa dá o hocijakom ďalšom nápade
rozhodnúť za minútu, a dve pasce, do ktorých sa inak spoľahlivo spadne.

### Pravidlo: doplnok stojí 5 obrázkov, alebo 20

Doplnok, ktorý sa voči rámu **nehýbe**, stačí nakresliť raz na smer → **5 obrázkov**. Doplnok,
ktorý sa hýbe s kolesom alebo s kľukami, musí byť v každej snímke → **20**. Medzi tým nie je nič.

To je celý filter. Podľa neho vyzerá zoznam takto:

| Nula obrázkov | Päť obrázkov | Nekresliť |
|---|---|---|
| **druhá farba** (36 kombinácií) | brašňa pod sedlo | koleso (disk vs. špice) — musí prekryť točiace sa koleso |
| smer zaparkovania (×5) | brašňa do rámu | **spokecard** — točí sa s kolesom, čiže 20 snímok |
| fáza trackstandu | brašňa na riaditká | čokoľvek na jednom boku (viď pasca nižšie) |
| blikačka — 2 px bod, ktorý bliká kód v kotviacom bode | **riaditká** — drops / bullhorn / flat | |
| | U-zámok na ráme | |
| | vlajočka na sedlovke | |
| | **náklad do cargo debny** | |

### ⚠️ Pasca č. 1: doplnok smie byť len na osi bicykla

Toto je dôležitejšie než výber konkrétnych brašní. V [01](01-bicykle-na-pozadi.md) stojí pravidlo,
na ktorom je postavené, že sa kreslí päť smerov namiesto ôsmich:

> **Nekresliť smery doľava.** Podmienka preklápania je, že bicykel nesmie mať nič asymetrické —
> nápis, tašku na jednej strane, reťaz ani prehadzovačku.

Doplnok mimo osi teda **nezdraží o pár obrázkov, ale zdvihne celé kreslenie z 5 smerov na 8** —
a to spätne, pre všetky typy a všetky snímky.

| Doplnok | Na osi? |
|---|---|
| brašňa pod sedlom, do rámu, na riaditkách | ✅ |
| náklad v cargo debne | ✅ |
| bočné pannier-y | ❌ |
| kuriérska taška cez rameno | ❌ a navyše ju nemá kto niesť — na spritoch nie je jazdec |

Kuriérska taška je z toho najväčšia škoda, lebo je to ikona remesla. Visí ale na jednom boku.

⚠️ **Toto patrí aj do zadania pre grafika v [01](01-bicykle-na-pozadi.md)**, kým sa nezačnú kresliť
doplnky. Zatiaľ je to zapísané len tu.

### Druhá farba — 36 kombinácií za nula obrázkov

Sheet už dnes nesie dve vrstvy (telo, vidlica) a `prefarbeny(z, telo, vidlica)` v `sandbox.html`
už berie **dva** parametre — len im dnes podsúvame odvodenú dvojicu tmavá/svetlá. Ak sa vidlica
stane druhou voľbou jazdca, je to **6 × 6 = 36 kombinácií a nula nových spritov**. A je to reálne
fixkárske: kontrastná vidlica je vec, ktorú si ľudia na custom rámoch naozaj riešia.

Samo o sebe to zdvihne počet vzhľadov z 12 na ~28, a so smerom zaparkovania na ~140 — čím sa
riziko tapety z „⚠️ Riziko: opakovanie" vybaví skôr, než sa čokoľvek nakreslí.

Dve podmienky, bez ktorých to nefunguje:

1. **Neponúkať všetkých 36, ale ~14 autorovaných dvojíc.** Časť kombinácií na svetlom alebo
   tmavom pozadí zdochne a časť je jednoducho škaredá. Odladiť sa dá zoznam, nie súčin. Je to ten
   istý argument ako v „Prečo šesť farieb a nie picker", len o úroveň vyššie.
2. **Cache musí byť per-vrstva, nie per-dvojica.** Dnes je kľúč `telo|vidlica`; pri 36
   kombináciách by sa prefarbovalo každý snímok. Riešenie: 6 prefarbených tiel + 6 vidlíc a dva
   `drawImage` na bicykel. Pamäť ostane na ~8,6 MB z tabuľky Čísel, len sa kreslí dvakrát.

### Riaditká — a trik s povinnou vrstvou

Na fixke sú riaditká *tá* vec, o ktorej sa ľudia hádajú, a pri pohľade 45° zhora sa **drops /
bullhorn / flat** naozaj odlíšia. 3 typy × 5 smerov = **15 obrázkov**.

Trik, ktorý obchádza problém s prekrývaním: grafik nakreslí **základný bicykel bez riaditiek**
a riaditká sú **povinná vrstva**, nie voliteľný overlay. Odpadá tým hádanie, či doplnok spoľahlivo
prekryl to, čo je pod ním — pod ním nie je nič.

To isté platí pre cargo: **debna sa kreslí prázdna** a náklad je vrstva.

### Náklad na cargu

Vianočný stromček, palma, sud s pivom, paleta, gauč. Päť obrázkov na jeden náklad, takže začať
tromi a dokresliť neskôr (je to nový stĺpec, viď nižšie — nikomu sa tým nič nepokazí).

Náklad má oproti brašniam jednu výhodu, ktorá je pre Depo podstatná: **mení siluetu, nie detail.**
Na 40 px sa brašňa stratí, stromček nie.

### Ako to zapísať do stĺpcov

„Jedna brašňa, dve alebo tri" sa **nesmie** zapísať ako jeden stĺpec `pocet_brasni` s rozsahom
0–3. Keď raz pribudne štvrtá pozícia, rozsah sa predĺži a prehádže sa to všetkým — presne tá
pasca z „⚠️ Pasca: zoznamy sa nesmú meniť".

Správne je **každá pozícia ako vlastný stĺpec**, boolean:

```
brasna.sedlovka   → 0.41  → áno
brasna.ram        → 0.88  → nie
brasna.riaditka   → 0.12  → áno
```

Počet brašní je potom **dôsledok, nie vstup**, a štvrtá pozícia je o rok štvrtý stĺpec, ktorý
nikomu nič nepohne.

**Náklad takto nejde** — je zo svojej podstaty zoznam, takže sa musí zmraziť rovnako ako typ
bicykla, teda **pred pridelením prvého odvodeného bicykla**. To isté platí pre riaditká.

### Koľko volieb dať do editora

Návrh: **tri.** Typ → farba tela + vidlice → jeden podpisový prvok (na fixke brašne, na cargu
náklad). Zvyšok nech sa odvodí zo slugu.

Riaditká, smer zaparkovania a fáza trackstandu sú presne tie veci, ktoré nikoho nebaví voliť, ale
robia rozdiel medzi „tristo bicyklov" a „tristo ľudí".

## Depo — stránka, kde sú všetci

Pri 300 jazdcoch na titulke nastanú dva problémy naraz: je to vizuálny chaos a **nikto v tom
nenájde ten svoj**, čo je celá pointa. Preto rozdelené:

| Kde | Čo tam je |
|---|---|
| **Titulka** | posledných 10–20 prihlásených. Sľub „viac ľudí = viac bicyklov" ostáva cítiť. |
| **Depo** | všetci. Klik na bicykel = popisok. |

Pracovný názov je **Depo** — miesto, kde kuriéri čakajú medzi jazdami. Zvažovali sa aj *Manifest*
(v kuriérskom žargóne doslova zoznam zásielok) a *Dispatch*. **HQ nepoužívať** — to je v ECMC
svete fyzické miesto podujatia a bude na mape.

Vedľajší efekt „posledných 20" na titulke: keď sa prihlásiš, si na titulke. To je dôvod poslať
tam kamaráta hneď po registrácii aj vrátiť sa pozrieť, kto pribudol.

### Jedna obrazovka, nie mapa

Dohodnuté: **jedna obrazovka**, bicykle menšie. Posúvateľná mapa až keby sa ukázalo, že to inak
nejde — je to výrazne viac kódu a na mobile ďalšia vrstva problémov s gestami.

Na hustotu si treba dať pozor, to číslo prekvapí: **300 bicyklov po 60 px zaberie zhruba polovicu
bežnej obrazovky.** To už nie je dav, to je koberec. Pri 40 px je to ~20 %, čo sa ešte číta ako
skupina ľudí.

### Mriežka — východiskový režim Depa

**Dohodnuté 20. 8. 2026.** Depo má dva režimy a **mriežka je východisková**; voľný rozsyp je
druhý. Depo je adresár — ideš tam niekoho nájsť, a na to je mriežka lepšia. Voľný pohyb patrí
na titulku, kde je dvadsať bicyklov kulisou za obsahom.

![Referencia — denníková appka, kde je každý deň jedna kresba](02-referencia-mriezka.jpg)

*Referencia: screenshot cudzej denníkovej aplikácie (názov neznámy). Držaný tu ako vizuálna
poznámka, nie ako predloha na kopírovanie.*

Mriežka rieši dve veci, ktoré rozsyp nevie:

- **Bez prekrytí.** 300 bicyklov v rozsype zaberie ~47 % obrazovky a je z toho koberec.
  Mriežka ich uloží tesne vedľa seba a nič sa neprekrýva.
- **Mriežka je číslo.** Rozsyp skrýva, koľko ich je. Blok tristo bicyklov ten počet ukáže bez
  toho, aby ho niekto musel napísať.

A nájsť sa v nej dá — v rozsype je „ten farebný" k ničomu, ak je za logom; v mriežke má každý
pevné miesto.

#### ⚠️ Riziko: opakovanie

Referencia funguje preto, že **každý deň je iná kresba** — je tam dvesto unikátnych vecí a to je
celý pôvab.

My máme 2 typy × 6 farieb = **12 vzhľadov**. Pri 300 jazdcoch je to 25 kópií od každého, čo sa
neprečíta ako tristo ľudí, ale ako tapeta. **Toto je na mriežke to jediné, čo ju môže pokaziť,
a pri kreslení sa na to ľahko zabudne.**

Tri cesty von, dajú sa kombinovať:

1. **Smer zaparkovania ako ďalšia os.** Bicykel v boxe nemusí stáť vždy rovnako — 5 smerov × 12
   = 60 vzhľadov, a **nula nových spritov**, sady to už obsahujú. Najlacnejší zdroj rozmanitosti,
   aký existuje.
2. **Priznať opakovanie a zoradiť podľa neho.** Pri zoradení podľa farby a typu sú z opakovania
   zámerné bloky — vyzerá to ako vzorkovník, nie ako chyba.
3. Doplnky, ak na ne raz dôjde — každý ďalší prvok počet vzhľadov násobí.

Vedľajší dôsledok: smer zaparkovania je aj **rozhodnutie o balení**. Bicykel zboku je široký
a nízky, takže v štvorcovej bunke 96 px nechá polovicu výšky prázdnu; pohľady spredu/zozadu sú
úzke a vysoké. Buď sa tomu prispôsobí tvar bunky, alebo sa smery zvolia tak, aby mriežka sadla.

#### Statické neznamená mŕtve — trackstand

Úplne nehybná mriežka sa prečíta ako graf, nie ako „ľudia čakajú na preteky".

Riešenie je už v [01](01-bicykle-na-pozadi.md): **trackstand**. Každý bicykel stojí vo svojom boxe
a jemne sa kýve, každý s vlastným fázovým posunom. Tristo bicyklov držiacich trackstand
v mriežke je lepší obraz než čokoľvek, čo by robili v pohybe — a je to reálna disciplína ECMC,
takže to nie je ozdoba. Nula nových spritov nad rámec toho, čo je aj tak v zadaní.

#### Prechod medzi režimami — „zaparkovanie"

Nie „prepnúť zobrazenie", ale **zaparkovať**: bicykle sa z rozsypu rozídu na svoje miesta
v mriežke. Zmena zoradenia je to isté — prejdú do nových boxov.

Engine to už skoro vie, lebo vie ísť smerom k bodu; cieľ len prestane byť náhodný a stane sa ním
pridelený box. Je to zopár riadkov nad existujúcim kódom a je to presne tá vec, ktorú si ľudia
nahrajú a hodia na Instagram.

Tým sa zároveň vyrieši filter lepšie než zhlukmi — **zhluky sú neurčité, boxy sú presné.**

#### Východiskové zoradenie: poradie prihlásenia

Referencia je zoradená chronologicky, deň po dni. To sa dá vziať doslova: **poradie registrácie
je jediné zoradenie, ktoré máme vždy.** Krajiny sa dajú spočítať až keď je koho, štartové čísla
vzniknú mesiac pred pretekmi — ale poradie prihlásenia existuje od prvého jazdca a nikdy sa
nezmení.

Dá to jazdcovi ďalší osobný údaj, ktorý mu nikto nezoberie: *„prihlásil si sa ako 47."* Sedí to
k rozdeleniu slug / štartové číslo — je to fakt, nie pridelená hodnota.

#### Prázdne miesta = voľné kapacity

V referencii sú pod vyplnenou časťou bodky pre dni, ktoré ešte neprišli. U nás by to boli
**miesta, ktoré ešte nie sú obsadené** — a to nie je dekorácia, to je dôvod sa prihlásiť.

⚠️ **Podmienené stropom, ktorý zatiaľ nepoznáme.** Ak sa počet neobmedzuje, mriežka len rastie
a bodky nemajú čo znázorňovať. Patrik to preberie s organizačným tímom. A pozor na druhú stranu
tej istej mince: mriežka zverejní nielen počet prihlásených, ale aj **koľko miest sa nepredalo**
(viď „Počet je verejný údaj" nižšie).

#### Dva vedľajšie zisky

- **Mobil.** Referencia je screenshot z telefónu, a nie náhodou — mriežka sa scrolluje, rozsyp
  nie. `01` má správanie na mobile ako otvorenú dieru; toto je naň odpoveď.
- **`prefers-reduced-motion`.** Statická mriežka nie je ochudobnená verzia, ale plnohodnotný
  režim. Povinnosť sa tým mení na funkciu.

### Filtre, ktoré preskupujú

Toto je najlepšia príležitosť celej stránky a je skoro zadarmo, lebo engine už vie hýbať vecami:
filter neprekreslí zoznam, ale **rozoženie bicykle do zhlukov** — podľa krajiny, podľa typu.
Nemci k Nemcom. Vyhľadanie mena ide tou istou cestou ako unikátna URL nižšie.

**Odpočet do pretekov** na tej istej stránke — až keď bude známy termín (viď
[06-otvorene-otazky.md](../06-otvorene-otazky.md)).

Po podujatí sa Depo stane archívom s výsledkami. Web tak neumrie deň po pretekoch.

## Unikátna URL jazdca

`/r/<slug>` zvýrazní jeho bicykel: **ostatní zošedivejú, jeho ostane farebný.**

Technicky je to lacnejšie než bežné zobrazenie, nie drahšie — greyscale nie je filter, ale iná
dvojica farieb v tom istom prefarbovaní. Namiesto ~12 prefarbených sheetov stačia 2 sivé
a 1 farebný.

Tri detaily, ktoré ten moment rozhodnú:

1. **Greyscale nech nabehne až po sekunde.** Chvíľu vidí farebné pole, potom farba odtečie zo
   všetkých okrem jeho. To je ten „to som ja" moment. Šedá od prvého snímku sa prečíta ako
   „stránka je šedá".
2. **Zvýraznený bicykel musí byť nájditeľný** — nech štartuje v strede a nesie menovku. Farba
   potvrdzuje, poloha nájde. „Ten farebný" je pri 300 kusoch na nič, ak je za logom.
3. **Vlastný náhľadový obrázok pre každého jazdca** (OG image) — jeho bicykel farebne, meno,
   číslo. Tvarom by to mal byť **spokecard**: na alleycatoch je to trofej, ktorú si ľudia z pretekov
   nechávajú v kolese. Na sprite sa nezmestí (viď Zamietnuté), ale ako zdieľaný obrázok je to
   presne tá vec — a stojí nula spritov. To je to, čo sa reálne objaví na Instagrame; link bez náhľadu je polovičná vec.

To je zároveň jediný dôvod, prečo sa táto vec môže sama zaplatiť: **ľudia zdieľajú svoj bicykel
a tým lákajú ďalších.**

## Slug ≠ štartové číslo

Dve nezávislé veci, a je dôležité ich nemiešať:

| | Kedy vzniká | Mení sa? | Na čo |
|---|---|---|---|
| **slug** | pri registrácii | nikdy | `/r/<slug>`, to sa zdieľa |
| **štartové číslo** | ~mesiac pred pretekmi | áno | zobrazuje sa v popisku |

Prečo nie číslo ako ID: čísla sa prideľujú po uzávierke, ľudia odpadnú, kategórie sa preskupia,
a hlavne — main race, cargo a vedľajšie disciplíny môžu mať vlastné číslovanie, takže „142"
nemusí byť unikátne. Jeden človek môže mať dve čísla. Keby bolo číslo kľúčom v URL, prečíslovanie
rozbije všetky už zdieľané odkazy — vrátane tých na Instagrame, ktoré sa nedajú opraviť.

Bonus, ktorý si tým kúpime: `/r/142` môže byť **presmerovanie na aktuálneho držiteľa čísla 142**.
Počas pretekov niekto uvidí číslo na chrbte a vie si ho vyhľadať. Pri číselnom ID by to
nefungovalo, lebo tam je číslo zamrznuté v čase.

**Dôsledok pre dizajn: bicykel musí vyzerať hotovo aj bez čísla**, lebo pol roka žiadne nebude.

## Verejný popisok

Nick, krajina, štartové číslo, typ bicykla, tím / mesto. Ďalšie sa doplní, ak bude treba.

❌ **Číslo sa nekreslí na sprite.** Bicykel má na obrazovke 40–80 px na dĺžku, dvojciferné číslo
v ňom má výšku 5–6 px — neprečítateľné, a navyše by grafik musel v každom smere a každej snímke
rezervovať plochu na tabuľku. Číslo patrí do popisku pri kliknutí (tooltip) a pod zvýraznený
bicykel pri unikátnej URL. Tam je vysádzané normálnym písmom a stojí nula obrázkov.

## Technická poznámka — nezáväzná

⚠️ Toto je odhad z augusta 2026, nie voľba stacku. Keď na to príde rad, môže to vyzerať inak
a jednoduchšie.

Vtedajšia úvaha bola: Next.js na Verceli (už je odporúčaný v
[05-rozsah-webu.md](../05-rozsah-webu.md)), Supabase Postgres na dáta, prihlásenie cez **magic
link** namiesto hesiel (jednorazové podujatie — heslo, ktoré nikto nepoužije druhýkrát, je len
záťaž a únik navyše), Stripe na platbu. Renderer ostáva čistý modul s jedným `<canvas>`; bicykle
nikdy nepatria do React state.

Dáta sa nemenia často, takže **žiadny realtime** — statický JSON, preplatený po registrácii.
Dva súbory, nie jeden: malý pre titulku (posledných 20) a celý pre Depo. Titulka nemá sťahovať
300 jazdcov kvôli dvadsiatim.

## Čísla, ktoré sa oplatí pamätať

Aby sa k nim netreba prehrýzať znova:

| Čo | Koľko |
|---|---|
| Jeden prefarbený sheet novej sady (384 × 480 px) v pamäti | ~720 kB |
| Voľná farba, 300 jazdcov → cache per-jazdec | **~216 MB** — zabije mobil |
| 6 farieb × 2 typy v aktívnej téme → cache per-kombináciu | ~8,6 MB |
| Greyscale + jeden zvýraznený | **~2,2 MB** |
| Verejný JSON, 300 jazdcov | ~12 kB, po gzipe ~3 kB |
| 300 bicyklov po 60 px na bežnej obrazovke | ~47 % plochy — priveľa |
| 300 bicyklov po 40 px | ~21 % plochy — číta sa ako dav |

## Na čo nezabudnúť

- **Default avatar sa musí prideliť automaticky** po zaplatení. Väčšina ľudí editor nikdy
  neotvorí, a keby mali prázdny avatar, Depo by boli tri stovky identických bicyklov. Takto je
  každý na ploche hneď a úprava je bonus, nie podmienka. Ako na to bez ukladania čohokoľvek:
  viď „Odvodený bicykel — inšpirácia blobatarom".
- **Súhlas a GDPR.** Repo je verejné a dáta účastníkov v ňom nesmú byť (viď `CLAUDE.md`). Verejný
  JSON smie obsahovať len to, čo jazdec odklikol, že sa má ukázať. Voľba pri registrácii: meno /
  prezývka / anonymne. Tabuľku nevystavovať priamo do prehliadača.
- **Moderácia.** Prezývka je vstup od používateľa na verejnej stránke. Treba admin prepínač
  „skryť jazdca". Toto sa človek inak naučí po prvom vtipálkovi.
- **Počet je verejný údaj.** Bicykle prezradia, koľko ľudí sa prihlásilo. Ak sa v januári
  prihlásia štyria, stránka to bude kričať. Riešenie: zapnúť to až nad prahom, alebo doplniť
  „duchov" na minimálny počet.
- **`prefers-reduced-motion`** — rovnaká povinnosť ako pri [01](01-bicykle-na-pozadi.md).

## Zamietnuté

- ❌ **Vlastný chat** (20. 8. 2026) — moderácia, GDPR, ukladanie, spam a zodpovednosť 24/7,
  pričom 90 % času tam bude ticho. Komunita už niekde je (Instagram, prípadne skupina).
  Stačí **odkaz**: jeden riadok, nula kódu, nula rizika. Späť sa to dá pridať kedykoľvek,
  opačne nie.
- ❌ **Štartové číslo na sprite** (20. 8. 2026) — neprečítateľné, a zdraží každú snímku. Do
  popisku.
- ❌ **Voľná paleta / RGB picker** (20. 8. 2026) — pamäť, a čitateľnosť na svetlom aj tmavom
  pozadí sa nedá odladiť pre ľubovoľnú hodnotu.
- ❌ **Štartové číslo ako ID v URL** (20. 8. 2026) — prečíslovanie rozbije zdieľané odkazy.
- ❌ **Vozík s vlajočkou** (21. 8. 2026) — nie je to vec, ktorá by sa v tomto svete čítala ako
  reálna, a náklad v cargo debne robí to isté lacnejšie a bez logiky poradia vykreslenia.
  (Pre poriadok: trailery v cargo pretekoch reálne existujú, ale na obrazovke to tak nevyzerá.)
- ❌ **Spokecard na sprite** (21. 8. 2026) — točí sa s kolesom, čiže 20 snímok, a pri 40 px sú
  z neho tri pixely. Patrí na OG obrázok jazdca, nie na bicykel.
- ❌ **Doplnok mimo osi bicykla** (21. 8. 2026) — bočné brašne aj kuriérska taška cez rameno
  rozbijú preklápanie a zdvihnú kreslenie z 5 smerov na 8.

## Otvorené

- **Existuje strop počtu účastníkov?** Bez neho nedávajú prázdne miesta v mriežke zmysel.
  Patrik to preberie s organizačným tímom.
- Názov stránky — *Depo* je zatiaľ pracovný
- Či fixka nahrádza mestský a velociped, alebo pribúda k nim (viď nesúlad vyššie).
  ⚠️ Ak sa pôjde cestou odvodeného bicykla, **toto sa musí rozhodnúť skôr, než sa pridelí prvý
  odvodený bicykel** — potom sa zoznam typov nedá zmeniť bez premiešania všetkých.
- Doplnky — brašne, riaditká, náklad. Možnosť, nie rozhodnutie; konkrétne kusy sa dohodnú
  s grafikom.
- Či pôjde vidlica ako druhá voľba jazdca, a ktorých ~14 dvojíc farieb sa autoruje.
- Editor avatara pred registráciou (postav si bicykel, potom sa prihlás) vs. až po zaplatení

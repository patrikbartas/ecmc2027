# E-mail `info@ecmc2027.com`

Ako funguje oficiálny e-mail podujatia a ako ho napojiť na spoločný Gmail tímu.

## Stav (2. 11. 2026)

- ✅ Schránka `info@ecmc2027.com` existuje na WebSupporte. Doména je priradená k hostingu
  so „Štandardnou konfiguráciou (web + mail)“. Overené: server prijíma poštu na `info@`
  a neznáme adresy odmieta.
- ✅ DNS je pripravené: MX, SPF, DMARC aj DKIM (`mail._domainkey`) nastavil WebSupport.
  Web ostal na Verceli (`A 76.76.21.21` pre `@`, `www` a `*`).
- ⏳ Presmerovanie do spoločného Gmailu — [krok 1](#1-presmerovanie-na-websupporte)
- ⏳ Odosielanie ako `info@` zo spoločného Gmailu — [krok 3](#3-odosielanie-ako-info-v-spoločnom-gmaile)

## Ako to je navrhnuté a prečo

```
odosielateľ ──► info@ecmc2027.com (WebSupport) ──presmerovanie──► spoločný Gmail tímu
                        ▲                                                │
                        └──────────── odpoveď cez SMTP WebSupportu ◄─────┘
```

- **Jeden spoločný Gmail, nie súkromné Gmaily jednotlivcov.** Odoslaná pošta sa ukladá
  v Gmaile, z ktorého sa odpisovalo. Keby si `info@` pridal každý do svojho Gmailu,
  nikto by nevidel, čo už odpísali ostatní, a sponzor by mohol dostať dve odpovede alebo žiadnu.
- **Gmail poštu len prijíma presmerovaním, sám si ju nesťahuje.** Funkciu „Kontrolovať poštu
  z iných účtov“ (POP) a Gmailify Google v roku 2026 ruší.
  ⚠️ neoverené: zdroje sa líšia v presnom dátume.
- **Odosiela sa cez SMTP WebSupportu, nie cez Google.** Vďaka tomu mail prejde kontrolami SPF,
  DKIM a DMARC. DMARC je nastavený na `quarantine`, takže mail z `info@` odoslaný inak by
  skončil v spame.
- **Nič sa nekupuje.** Schránka je v cene hostingu a Gmail je zadarmo.

### Čo zvážiť do budúcna

- **Google Workspace** je skutočný Gmail na vlastnej doméne. Platí sa mesačne za používateľa,
  na spoločnú schránku stačí jeden.
- **Google for Nonprofits** dáva Workspace neziskovkám zadarmo. Podmienkou je právny subjekt
  (o. z.), ktorý je aj tak otvorenou otázkou, pozri [06-otvorene-otazky.md](06-otvorene-otazky.md).
  ⚠️ neoverené: či je Slovensko v zozname podporovaných krajín.
- Pri prechode na Workspace sa presunú len MX záznamy na Google. Nameservery ostávajú na
  WebSupporte a adresa `info@` sa nemení.

## Čo treba mať

- prístup do administrácie WebSupportu (Webadmin),
- prístup do spoločného Gmailu, ideálne na počítači,
- heslo schránky `info@ecmc2027.com`.

Heslá a adresu spoločného Gmailu do tohto súboru nepíš, repo je verejné.

## 1. Presmerovanie na WebSupporte

1. Prihlás sa na **admin.websupport.sk** a v službách klikni na **ecmc2027.com**.
2. V ľavom menu otvor **E-maily → Presmerovania, Aliasy**.
3. **Vytvoriť nové presmerovanie** z `info@ecmc2027.com` na adresu spoločného Gmailu.
4. Kópiu netreba riešiť. Pri existujúcej schránke podľa WebSupportu ostanú maily aj v nej,
   takže je to zároveň záloha.

⚠️ neoverené: návod WebSupportu je starší a názvy v menu sa môžu líšiť. Ak Webadmin nie je
k dispozícii, presmerovanie sa dá nastaviť aj ako filter vo webmaile WebSupportu. V tom prípade
sa však mail zo schránky presunie a kópia neostane.

## 2. Test prijímania

- Pošli mail na `info@` **z inej adresy než zo spoločného Gmailu**. WebSupport upozorňuje,
  že Gmail blokuje mail, ktorý sám odoslal a vráti sa mu presmerovaním, takže taký test zlyhá.
- Skontroluj spoločný Gmail aj priečinok **Spam**. Ak tam mail je, označ ho **Nie je spam**.
- Odporúčaný filter: *Komu* `info@ecmc2027.com` → **Nikdy neposielať do spamu**.

## 3. Odosielanie ako info@ v spoločnom Gmaile

1. ⚙️ → **Zobraziť všetky nastavenia** → **Účty a import** *(Accounts and Import)*.
2. **Odosielať poštu ako** → **Pridať ďalšiu e-mailovú adresu**
   *(Send mail as → Add another email address)*.
3. Meno `ECMC 2027 Bratislava`, adresa `info@ecmc2027.com`. Políčko „Považovať za alias“ nechaj tak, ako je.
4. Server SMTP:

   | | |
   |---|---|
   | Server | `smtp.m1.websupport.sk` |
   | Port | `465` |
   | Používateľ | `info@ecmc2027.com` |
   | Heslo | heslo schránky |
   | Zabezpečenie | SSL |

   **Nepoužívaj `smtp.ecmc2027.com`.** Jeho certifikát patrí inej adrese a Gmail spojenie
   odmietne. Overené 2. 11. 2026: `smtp.m1.websupport.sk` má platný certifikát
   `*.m1.websupport.sk`.
5. Gmail pošle overovací kód na `info@`. Vďaka kroku 1 príde do toho istého Gmailu,
   prípadne do Spamu. Zadaj ho.
6. Späť v **Účty a import**:
   - pri `info@ecmc2027.com` klikni **nastaviť ako predvolené**, aby nové maily neodchádzali
     z gmailovej adresy,
   - v časti „Pri odpovedaní na správu“ zvoľ **Odpovedať z adresy, na ktorú bola správa poslaná**.

## 4. Test odosielania

- Zo spoločného Gmailu pošli mail na svoju súkromnú adresu.
- Odosielateľ má byť `info@ecmc2027.com` a mail nemá skončiť v spame.
- V prijatej správe otvor **⋮ → Zobraziť originál**. Pri **SPF, DKIM aj DMARC** má byť **PASS**.

## Na čo myslieť v tíme

- **Prihlásenie z nového zariadenia.** Google pýta overovací kód na telefónne číslo účtu.
  Každý nový človek ho pri prvom prihlásení potrebuje od toho, kto má ten telefón.
- **Keď niekto z tímu odíde**, zmeňte heslo Gmailu.
- **Prístup len pre 2–3 ľudí**, ktorí vybavujú sponzoring a kontakt. Ostatným sa dajú
  preposielať kópie.
- **Varianta bez zdieľaného hesla:** Gmail vie dať prístup iným Gmail účtom (delegovanie,
  „Udeliť prístup k vášmu účtu“). ⚠️ neoverené: ako sa správa pri odosielaní ako `info@`
  a či funguje aj v mobilnej aplikácii. Najprv vyskúšať na jednom človeku.

## Čo nerobiť

- **Nemeniť nameservery** na Vercel, ani keď to Vercel v dashboarde ponúka. Rozbil by sa e-mail.
- **Nemazať ani neupravovať** MX, SPF/DMARC/DKIM (TXT) ani záznamy
  `mail/imap/smtp/pop3/webmail/autodiscover/autoconfig`.
- Po akejkoľvek zmene na WebSupporte skontrolovať, že `ecmc2027.com`, `www` a `*` majú
  `A 76.76.21.21` a **žiadny AAAA záznam**. Inak web prestane ísť cez Vercel.

## Zdroje

- [Aliasy a presmerovania e-mailov — Websupport centrum podpory](https://www.websupport.sk/podpora/kb/aliasy-a-presmerovania-e-mailov/)
- [E-mailové filtre — Websupport centrum podpory](https://www.websupport.sk/podpora/kb/e-mailove-filtre/)
- [Gmail POP / Check mail v roku 2026 — Captain DNS](https://www.captaindns.com/fr/blog/gmail-pop-checkmail-2026)

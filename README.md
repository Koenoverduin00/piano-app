# Piano Oefenen

Een webapp om piano te oefenen — volledig in de browser, zonder installatie of build-stap.

De app werkt alleen in **liggende stand**; op een staande telefoon of tablet vraagt hij je het scherm te draaien.

## Functies

- **Lessen** – een leerpad in Duolingo-stijl met 9 eenheden en 46 lessen (± 375 stappen): het klavier ontdekken, hoog/laag en vingerzetting, ritme, eerste melodietjes, noten lezen in viool- en bassleutel, zwarte toetsen, toonladders & akkoorden en gehoortraining.
  Vraagtypes: uitleg, meerkeuze (ook op gehoor of van de notenbalk), paren koppelen, op volgorde zetten, ritme meetikken, noten benoemen op de notenbalk, toetsen benoemen, noten/akkoorden spelen, van blad spelen en op gehoor naspelen.
  Het klavier verschijnt alleen bij vragen waarvoor je het nodig hebt. Je verdient sterren, XP en een dagenreeks; elke les ontgrendelt de volgende. Voortgang wordt in de browser opgeslagen.
- **Vrij spelen** – speel op het klavier (C2–C6) met muis, touch, je computertoetsenbord of een MIDI-keyboard. Inclusief metronoom (40–200 BPM, 2/4, 3/4, 4/4).
- **Noten lezen** – er verschijnt een noot op de notenbalk (viool-, bassleutel of beide); speel hem op de piano. Score, reeks en record worden bijgehouden.
- **Gehoortraining** – speel een gehoorde noot na, of herken intervallen (kleine secunde t/m octaaf).
- **Liedjes** – laat een liedje voorspelen of oefen het in wachtmodus: de volgende toets licht op en het liedje wacht tot je hem speelt. Persoonlijke records worden opgeslagen.
- **Toonladders** – majeur, mineur (natuurlijk/harmonisch), pentatonisch en chromatisch in alle 12 toonsoorten, omhoog en omlaag.

Notennamen kunnen als C D E, Do Re Mi of uit worden getoond.

## Toetsenbord

| Toets | A | W | S | E | D | F | T | G | Y | H | U | J | K | O | L | P | ; | ' |
|-------|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Noot  | C4 | C♯4 | D4 | D♯4 | E4 | F4 | F♯4 | G4 | G♯4 | A4 | A♯4 | B4 | C5 | C♯5 | D5 | D♯5 | E5 | F5 |

## Starten

Open `index.html` in een browser, of start een lokale server:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

MIDI-keyboards werken in browsers met Web MIDI (Chrome, Edge) via `localhost` of https.

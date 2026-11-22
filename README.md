# Piano Oefenen

Een webapp om piano te oefenen — volledig in de browser, zonder installatie of build-stap.

## Functies

- **Vrij spelen** – speel op het klavier (C3–C6) met muis, touch, je computertoetsenbord of een MIDI-keyboard. Inclusief metronoom (40–200 BPM, 2/4, 3/4, 4/4).
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

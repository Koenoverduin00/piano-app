'use strict';
/*
 * Lessen in Duolingo-stijl: een leerpad met eenheden; elke les bestaat uit korte stappen.
 *
 * Staptypes (piano zichtbaar = 🎹):
 *   info      uitleg. Optioneel: keys (🎹, toetsen markeren), staff, sound (+ chord)
 *   choice    meerkeuze: options, answer. Optioneel: staff, sound (+ chord), keys (🎹)
 *   match     paren koppelen: pairs [[links, rechts], …]
 *   order     op volgorde tikken: items (in de juiste volgorde)
 *   rhythm    ritme meetikken: pattern (tellen; negatief = rust), bpm, beats
 *   nameNote  noot op de notenbalk benoemen: clef ('treble'|'bass'|'both'), pool, rounds
 *   nameKey   🎹 oplichtende toets benoemen: pool, rounds
 *   play      🎹 noten in volgorde spelen: notes. hint:false = zonder oplichtende toets,
 *             anyOctave, labels (eigen tekst per noot), sound (naspelen op gehoor)
 *   chord     🎹 alle noten van een akkoord spelen (volgorde vrij)
 *   read      🎹 noten van de notenbalk spelen: notes of random+pool, clef, together (alles tegelijk tonen)
 *   ear       🎹 noot op gehoor zoeken: pool, rounds
 */

/* ---------- Korte schrijfwijzen voor de lesinhoud ---------- */
const N = str => str.trim().split(/\s+/);
const I = (text, o = {}) => ({ t: 'info', text, ...o });
const Q = (text, options, answer, o = {}) => ({ t: 'choice', text, options, answer, ...o });
const TF = (text, isTrue, o = {}) => Q(text, ['Waar', 'Niet waar'], isTrue ? 0 : 1, o);
const P = (text, notes, o = {}) => ({ t: 'play', text, notes: N(notes), ...o });
const CH = (text, notes, o = {}) => ({ t: 'chord', text, notes: N(notes), ...o });
const R = (text, notes, o = {}) => ({ t: 'read', text, notes: N(notes), ...o });
const RR = (text, pool, random, o = {}) => ({ t: 'read', text, pool: N(pool), random, ...o });
const NN = (text, pool, rounds, o = {}) => ({ t: 'nameNote', text, pool: N(pool), rounds, ...o });
const NK = (text, pool, rounds, o = {}) => ({ t: 'nameKey', text, pool: N(pool), rounds, ...o });
const M = (text, pairs) => ({ t: 'match', text, pairs });
const O = (text, items, o = {}) => ({ t: 'order', text, items, ...o });
const RH = (text, pattern, o = {}) => ({ t: 'rhythm', text, pattern, bpm: 80, beats: 4, ...o });
const E = (text, pool, rounds) => ({ t: 'ear', text, pool: N(pool), rounds });
const staff = (notes, clef = 'treble', chord = false) => ({ notes: notes ? N(notes) : [], clef, chord });
const UP_DOWN = ['Omhoog', 'Omlaag', 'Blijft gelijk'];
const FIRST_SECOND = ['De eerste', 'De tweede'];

/* ---------- Kleine notatie-afbeeldingen (ritme) ---------- */
function glyphSVG(d, x, y) {
  const v = Math.abs(d);
  if (d > 0) {
    const open = v >= 2;
    let s = `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" transform="rotate(-20 ${x} ${y})" fill="${open ? 'none' : 'currentColor'}" stroke="currentColor" stroke-width="2"/>`;
    if (v < 4) s += `<line x1="${x + 6}" y1="${y - 1}" x2="${x + 6}" y2="${y - 34}" stroke="currentColor" stroke-width="2"/>`;
    if (v === 0.5 || v === 0.75) s += `<path d="M${x + 6} ${y - 34} q2 10 10 14 q-3 -5 -10 -7z" fill="currentColor" stroke="currentColor" stroke-width="1.2"/>`;
    if (v === 3 || v === 1.5 || v === 0.75) s += `<circle cx="${x + 14}" cy="${y - 2}" r="2.6" fill="currentColor"/>`;
    return s;
  }
  if (v === 4) return `<rect x="${x - 8}" y="${y}" width="16" height="6" fill="currentColor"/>`;
  if (v === 2) return `<rect x="${x - 8}" y="${y - 6}" width="16" height="6" fill="currentColor"/>`;
  if (v === 1) return `<path d="M${x - 3} ${y - 20} l7 9 l-6 7 l7 8 c-7 -3 -10 2 -4 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>`;
  return `<circle cx="${x - 3}" cy="${y - 9}" r="3.2" fill="currentColor"/><line x1="${x + 4}" y1="${y - 11}" x2="${x - 1}" y2="${y + 10}" stroke="currentColor" stroke-width="2"/>`;
}
// Inline symbool, bijvoorbeeld in een koppel- of volgorde-oefening
const G = d => `<svg class="glyph" viewBox="0 0 36 56" width="24" height="38" aria-hidden="true">${d > 0 ? '' : '<line x1="4" y1="40" x2="32" y2="40" stroke="currentColor" stroke-width="1" opacity=".4"/>'}${glyphSVG(d, 16, 40)}</svg>`;

function rhythmSVG(pattern, beats) {
  let x = 44, acc = 0, parts = [], onset = 0;
  const y = 52;
  parts.push(`<text x="10" y="${y - 6}" font-size="17" font-weight="800" fill="currentColor">${beats}</text><text x="10" y="${y + 12}" font-size="17" font-weight="800" fill="currentColor">4</text>`);
  pattern.forEach((d, i) => {
    parts.push(`<g class="rg" ${d > 0 ? `data-i="${onset++}"` : ''}>${glyphSVG(d, x, y)}</g>`);
    x += 26 + Math.abs(d) * 18;
    acc += Math.abs(d);
    if (Math.abs(acc % beats) < 1e-6 && i < pattern.length - 1) {
      parts.push(`<line x1="${x - 12}" x2="${x - 12}" y1="${y - 22}" y2="${y + 22}" stroke="currentColor" stroke-width="1.5"/>`);
      x += 6;
    }
  });
  parts.push(`<line x1="${x - 12}" x2="${x - 12}" y1="${y - 22}" y2="${y + 22}" stroke="currentColor" stroke-width="3"/>`);
  const w = x;
  return `<svg class="rhythm-svg" viewBox="0 0 ${w} 90" style="max-width:${w * 1.6}px"><line x1="4" x2="${w - 12}" y1="${y}" y2="${y}" stroke="currentColor" stroke-width="1" opacity=".45"/>${parts.join('')}</svg>`;
}

/* ================= Lesinhoud ================= */
const UNITS = [
  {
    title: 'Het klavier ontdekken', desc: 'Zwarte en witte toetsen en de namen van alle witte toetsen.',
    color: '#3a9a5b', dark: '#2c7a47',
    lessons: [
      { id: 'k1', title: 'Witte en zwarte toetsen', icon: '🎹', steps: [
        I('Een piano heeft witte en zwarte toetsen. In deze lessen leer je stap voor stap de weg vinden op het klavier.', { title: 'Welkom!' }),
        I('De zwarte toetsen staan in groepjes. Hier zie je een groepje van <b>twee</b>.', { keys: N('C#4 D#4') }),
        I('En hier een groepje van <b>drie</b>. Twee, drie, twee, drie… zo gaat het het hele klavier over.', { keys: N('F#4 G#4 A#4') }),
        P('Speel het groepje van twee zwarte toetsen.', 'C#4 D#4'),
        P('Speel nu het groepje van drie.', 'F#4 G#4 A#4'),
        Q('Hoeveel zwarte toetsen zitten er in het kleinste groepje?', ['Eén', 'Twee', 'Drie'], 1),
        Q('En in het grootste groepje?', ['Twee', 'Drie', 'Vier'], 1),
        TF('Tussen elke twee witte toetsen zit een zwarte toets.', false),
        I('Klopt: op twee plekken zit <b>geen</b> zwarte toets tussen de witte toetsen. Zie je ze? Precies daar beginnen de groepjes.', { keys: N('E4 F4 B4 C5') }),
        P('Zoek zelf een groepje van twee, waar je maar wilt.', 'C#4 D#4', { hint: false, anyOctave: true }),
        P('En nu een groepje van drie.', 'F#4 G#4 A#4', { hint: false, anyOctave: true }),
      ] },
      { id: 'k2', title: 'De C vinden', icon: '🔍', steps: [
        I('De <b>C</b> is de witte toets direct <b>links van een groepje van twee</b> zwarte toetsen.', { keys: N('C4') }),
        P('Speel de C.', 'C4'),
        Q('Waar vind je de C?', ['Links van twee zwarte toetsen', 'Rechts van twee zwarte toetsen', 'Links van drie zwarte toetsen'], 0),
        I('Er zijn meerdere C\'s op de piano. De C in het midden heet de <b>centrale C</b>. Daar beginnen de meeste beginnersstukjes.', { keys: N('C2 C3 C4 C5 C6') }),
        P('Speel alle C\'s, van laag naar hoog.', 'C2 C3 C4 C5 C6'),
        TF('De C ligt rechts van het groepje van twee zwarte toetsen.', false),
        P('Vind een C zonder hulp. Welke C maakt niet uit.', 'C4', { hint: false, anyOctave: true }),
        P('Speel nu de centrale C zonder hulp.', 'C4', { hint: false }),
        Q('Hoe heet de C in het midden van de piano?', ['De lage C', 'De centrale C', 'De hoge C'], 1),
      ] },
      { id: 'k3', title: 'D en E', icon: '🎯', steps: [
        I('Na de C komt de <b>D</b>. Die zit precies <b>tussen</b> de twee zwarte toetsen.', { keys: N('D4') }),
        P('Speel de D.', 'D4'),
        I('Daarna komt de <b>E</b>, rechts van het groepje van twee.', { keys: N('E4') }),
        P('Speel de E.', 'E4'),
        P('Speel C – D – E.', 'C4 D4 E4'),
        Q('Welke witte toets zit tussen de twee zwarte toetsen?', ['C', 'D', 'E'], 1),
        NK('Welke toets licht op?', 'C4 D4 E4 C3 D5 E3', 5),
        P('Nu zonder hulp: E – D – C.', 'E4 D4 C4', { hint: false }),
        P('Vind een D, waar je maar wilt.', 'D4', { hint: false, anyOctave: true }),
        P('En een E.', 'E4', { hint: false, anyOctave: true }),
      ] },
      { id: 'k4', title: 'F en G', icon: '🌱', steps: [
        I('De <b>F</b> zit links van het groepje van <b>drie</b> zwarte toetsen.', { keys: N('F4') }),
        P('Speel de F.', 'F4'),
        I('Rechts van de F ligt de <b>G</b>, tussen de eerste en tweede zwarte toets van het groepje van drie.', { keys: N('G4') }),
        P('Speel de G.', 'G4'),
        Q('Waar ligt de F?', ['Links van twee zwarte toetsen', 'Links van drie zwarte toetsen', 'Rechts van drie zwarte toetsen'], 1),
        P('Speel C – D – E – F – G.', 'C4 D4 E4 F4 G4'),
        NK('Welke toets licht op?', 'C4 D4 E4 F4 G4 F3 G5', 6),
        P('Speel alle F\'s van laag naar hoog.', 'F2 F3 F4 F5'),
        P('Zonder hulp: G – F – E – D – C.', 'G4 F4 E4 D4 C4', { hint: false }),
        P('Vind een G, waar je maar wilt.', 'G4', { hint: false, anyOctave: true }),
      ] },
      { id: 'k5', title: 'A en B', icon: '🔤', steps: [
        I('Na de G komen <b>A</b> en <b>B</b>. De B ligt rechts van het groepje van drie.', { keys: N('A4 B4') }),
        P('Speel A en dan B.', 'A4 B4'),
        I('In de muziek gebruik je maar zeven letters: <b>C D E F G A B</b>. Na de B begint het gewoon opnieuw bij C.', { keys: N('C4 D4 E4 F4 G4 A4 B4 C5') }),
        Q('Welke noot komt na de B?', ['A', 'C', 'H'], 1),
        Q('Welke noot komt na de G?', ['F', 'A', 'B'], 1),
        O('Tik de noten in de goede volgorde, vanaf C.', N('C D E F G A B')),
        P('Speel de hele rij: C D E F G A B C.', 'C4 D4 E4 F4 G4 A4 B4 C5'),
        NK('Welke toets licht op?', 'C4 D4 E4 F4 G4 A4 B4 A3 B3', 6),
        P('Vind een A zonder hulp.', 'A4', { hint: false, anyOctave: true }),
        P('En een B.', 'B4', { hint: false, anyOctave: true }),
      ] },
      { id: 'k6', title: 'Herhaling: witte toetsen', icon: '🏁', steps: [
        M('Koppel de noot aan de plek op het klavier.', [['C', 'links van 2 zwarte'], ['D', 'tussen 2 zwarte'], ['E', 'rechts van 2 zwarte'], ['F', 'links van 3 zwarte'], ['B', 'rechts van 3 zwarte']]),
        NK('Welke toets licht op?', 'C3 D3 E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5', 8),
        P('Vind een F.', 'F4', { hint: false, anyOctave: true }),
        P('Vind een B.', 'B4', { hint: false, anyOctave: true }),
        P('Vind een D.', 'D4', { hint: false, anyOctave: true }),
        P('Vind een A.', 'A4', { hint: false, anyOctave: true }),
        TF('Na de G komt de A.', true),
        TF('Er zijn negen verschillende letters voor de witte toetsen.', false),
        P('Speel C – E – G zonder hulp.', 'C4 E4 G4', { hint: false }),
      ] },
    ],
  },
  {
    title: 'Hoog, laag & je handen', desc: 'Hoge en lage tonen, vingernummers en de C-positie.',
    color: '#1f9e9a', dark: '#16797a',
    lessons: [
      { id: 'h1', title: 'Hoog en laag', icon: '↕️', steps: [
        I('Links op de piano klinken de <b>lage</b> tonen, rechts de <b>hoge</b>. Luister maar.', { sound: 'C2 C6', keys: N('C2 C6') }),
        Q('Welke noot klinkt hoger?', FIRST_SECOND, 1, { sound: 'C4 G4' }),
        Q('Welke noot klinkt hoger?', FIRST_SECOND, 0, { sound: 'A4 D4' }),
        Q('Gaat deze melodie omhoog of omlaag?', UP_DOWN, 0, { sound: 'C4 D4 E4 F4 G4' }),
        Q('En deze?', UP_DOWN, 1, { sound: 'G4 F4 E4 D4 C4' }),
        Q('En deze?', UP_DOWN, 2, { sound: 'E4 E4 E4 E4' }),
        TF('Toetsen aan de rechterkant klinken lager.', false),
        P('Speel een lage C en dan een hoge C.', 'C2 C6'),
        P('Speel van hoog naar laag.', 'C6 C5 C4 C3 C2'),
        Q('Welke noot klinkt hoger?', FIRST_SECOND, 1, { sound: 'E4 F4' }),
      ] },
      { id: 'h2', title: 'Vingernummers', icon: '✋', steps: [
        I('Bij piano hebben je vingers nummers. Bij <b>beide</b> handen is de duim 1 en de pink 5.', { title: 'Vingers tellen' }),
        M('Koppel het nummer aan de vinger.', [['1', 'duim'], ['2', 'wijsvinger'], ['3', 'middelvinger'], ['4', 'ringvinger'], ['5', 'pink']]),
        Q('Welk nummer heeft je pink?', ['1', '4', '5'], 2),
        TF('Bij de linkerhand is de pink vinger 1.', false),
        I('Houd je vingers licht <b>gebogen</b>, alsof je een balletje vasthoudt. Speel met de toppen van je vingers.'),
        Q('Hoe houd je je hand op de toetsen?', ['Plat op de toetsen', 'Gebogen, alsof je een balletje vasthoudt', 'Als een vuist'], 1),
        Q('Je rechterduim ligt op C. Welke vinger ligt op E (twee toetsen verder)?', ['2', '3', '4'], 1),
        Q('En welke vinger ligt dan op G?', ['3', '4', '5'], 2),
        Q('Welke vinger is nummer 2?', ['Duim', 'Wijsvinger', 'Ringvinger'], 1),
      ] },
      { id: 'h3', title: 'Rechterhand in C-positie', icon: '👉', steps: [
        I('Leg je <b>rechterhand</b> op C D E F G: duim (1) op de centrale C, pink (5) op G. Elke vinger heeft zijn eigen toets.', { keys: N('C4 D4 E4 F4 G4') }),
        P('Speel omhoog: 1 2 3 4 5.', 'C4 D4 E4 F4 G4', { labels: N('C·1 D·2 E·3 F·4 G·5') }),
        P('En weer omlaag: 5 4 3 2 1.', 'G4 F4 E4 D4 C4', { labels: N('G·5 F·4 E·3 D·2 C·1') }),
        P('Speel met vinger 1, 3 en 5.', 'C4 E4 G4', { labels: N('C·1 E·3 G·5') }),
        Q('Welke vinger speelt de F in deze positie?', ['2', '3', '4'], 2),
        P('Speel C – D – E – D – C.', 'C4 D4 E4 D4 C4'),
        P('Speel E – F – G – F – E.', 'E4 F4 G4 F4 E4'),
        P('Zonder hulp: C D E F G.', 'C4 D4 E4 F4 G4', { hint: false }),
        P('Zonder hulp: G – E – C.', 'G4 E4 C4', { hint: false }),
      ] },
      { id: 'h4', title: 'Linkerhand in C-positie', icon: '👈', steps: [
        I('Je <b>linkerhand</b> speelt meestal lagere noten. Leg je pink (5) op de C onder de centrale C, en je duim (1) op G.', { keys: N('C3 D3 E3 F3 G3') }),
        P('Speel omhoog: 5 4 3 2 1.', 'C3 D3 E3 F3 G3', { labels: N('C·5 D·4 E·3 F·2 G·1') }),
        P('En weer omlaag: 1 2 3 4 5.', 'G3 F3 E3 D3 C3', { labels: N('G·1 F·2 E·3 D·4 C·5') }),
        Q('Welke vinger van je linkerhand speelt de C?', ['1 (duim)', '3 (middelvinger)', '5 (pink)'], 2),
        Q('Welke noot speelt je linkerduim?', ['C', 'E', 'G'], 2),
        P('Speel C – E – G met vinger 5, 3, 1.', 'C3 E3 G3'),
        P('Zonder hulp: G – F – E – D – C.', 'G3 F3 E3 D3 C3', { hint: false }),
        I('Nu om de beurt met <b>twee handen</b>: linkerhand op C3, rechterhand op de centrale C.', { keys: N('C3 C4') }),
        P('Wissel af tussen links en rechts.', 'C3 C4 E3 E4 G3 G4'),
      ] },
    ],
  },
  {
    title: 'Ritme', desc: 'De tel, notenwaarden, rusten en de maat.',
    color: '#d6455d', dark: '#ad2f45',
    lessons: [
      { id: 'r1', title: 'De tel', icon: '🥁', steps: [
        I('Muziek heeft een regelmatige puls: de <b>tel</b>. Net als je hartslag of het tikken van een klok.', { title: 'Voel de tel' }),
        I('Bij de ritme-oefeningen tel je eerst vier tikken af. Daarna tik je mee op de grote knop, de spatiebalk of een pianotoets.'),
        RH('Tik mee op elke tel.', [1, 1, 1, 1]),
        RH('Nu twee maten lang.', [1, 1, 1, 1, 1, 1, 1, 1]),
        I('Tellen worden gegroepeerd in <b>maten</b>. In een 4/4-maat tel je steeds 1 – 2 – 3 – 4. De eerste tel is het sterkst.'),
        Q('Hoeveel tellen zitten er in een 4/4-maat?', ['2', '3', '4'], 2),
        Q('Wat betekent BPM (bij de metronoom)?', ['Tellen per minuut', 'Noten per maat', 'Maten per minuut'], 0),
        RH('Iets sneller!', [1, 1, 1, 1, 1, 1, 1, 1], { bpm: 100 }),
        TF('In hetzelfde liedje blijft de tel even snel.', true),
      ] },
      { id: 'r2', title: 'Kwart- en halve noten', icon: '♩', steps: [
        I(`Dit is een <b>kwartnoot</b> ${G(1)}. Hij duurt <b>één tel</b>.`),
        I(`Dit is een <b>halve noot</b> ${G(2)}: een open bolletje met een stok. Hij duurt <b>twee tellen</b>.`),
        Q(`Hoeveel tellen duurt een halve noot ${G(2)}?`, ['1', '2', '4'], 1),
        RH('Tik bij elke noot. Bij de halve noot wacht je twee tellen.', [1, 1, 2]),
        RH('Twee halve noten.', [2, 2]),
        Q('Hoeveel kwartnoten duren samen even lang als één halve noot?', ['1', '2', '4'], 1),
        RH('Kwart, kwart, half – twee keer.', [1, 1, 2, 1, 1, 2]),
        M('Koppel de noot aan de duur.', [[G(1), '1 tel'], [G(2), '2 tellen']]),
        RH('Andersom!', [2, 1, 1, 2, 2]),
      ] },
      { id: 'r3', title: 'Hele en gepunteerde noten', icon: '⏱️', steps: [
        I(`Een <b>hele noot</b> ${G(4)} heeft geen stok en duurt <b>vier tellen</b>: een hele maat.`),
        RH('Tik op elke hele noot en tel rustig door.', [4, 4], { bpm: 90 }),
        I(`Een <b>punt</b> achter een noot maakt hem de helft langer. Een gepunteerde halve noot ${G(3)} duurt dus 2 + 1 = <b>drie tellen</b>.`),
        Q('Wat doet een punt achter een noot?', ['Hij wordt de helft langer', 'Hij wordt korter', 'Je speelt hem niet'], 0),
        M('Koppel de noot aan de duur.', [[G(1), '1 tel'], [G(2), '2 tellen'], [G(3), '3 tellen'], [G(4), '4 tellen']]),
        RH('Half, half, heel.', [2, 2, 4]),
        RH('Gepunteerd half en een kwart.', [3, 1, 3, 1]),
        O('Tik de noten van kort naar lang.', [G(1), G(2), G(3), G(4)]),
        RH('Alles door elkaar!', [1, 1, 2, 3, 1, 4]),
      ] },
      { id: 'r4', title: 'Rusten', icon: '🤫', steps: [
        I(`Een <b>rust</b> betekent stilte. Een kwartrust ${G(-1)} is één tel stil.`),
        RH('Tik op de noten, wees stil bij de rust.', [1, -1, 1, -1]),
        I(`Een halve rust ${G(-2)} ligt óp de lijn en duurt twee tellen. Een hele rust ${G(-4)} hangt ónder de lijn en duurt vier tellen.`),
        M('Koppel de rust aan de duur.', [[G(-1), '1 tel'], [G(-2), '2 tellen'], [G(-4), '4 tellen']]),
        TF('Tijdens een rust speel je niets, maar je blijft wel tellen.', true),
        RH('Twee noten en dan een halve rust.', [1, 1, -2]),
        RH('Let op de rust in het midden.', [2, -1, 1]),
        Q(`Hoeveel tellen is het stil bij ${G(-2)}?`, ['1', '2', '4'], 1),
        RH('Twee maten met rusten.', [1, -1, 1, 1, -2, 2]),
      ] },
      { id: 'r5', title: 'Achtste noten', icon: '♪', steps: [
        I(`Een <b>achtste noot</b> ${G(0.5)} heeft een vlaggetje en duurt een <b>halve tel</b>. Je telt: 1 – en – 2 – en…`),
        Q('Hoeveel achtste noten passen in één tel?', ['1', '2', '4'], 1),
        Q('Hoe tel je vier achtste noten?', ['1 en 2 en', '1 2 3 4', '1 1 2 2'], 0),
        RH('Snel – snel – snel – snel – lang – lang.', [0.5, 0.5, 0.5, 0.5, 1, 1], { bpm: 70 }),
        RH('Lang – snel snel – lang – snel snel.', [1, 0.5, 0.5, 1, 0.5, 0.5], { bpm: 70 }),
        M('Koppel de noot aan de duur.', [[G(0.5), 'halve tel'], [G(1), '1 tel'], [G(2), '2 tellen'], [G(4), '4 tellen']]),
        RH('Twee maten.', [0.5, 0.5, 1, 0.5, 0.5, 1, 2, 2], { bpm: 70 }),
        O('Tik van kort naar lang.', [G(0.5), G(1), G(2), G(4)]),
      ] },
      { id: 'r6', title: 'De 3/4-maat', icon: '💃', steps: [
        I('Niet alle muziek heeft vier tellen per maat. Een <b>wals</b> staat in 3/4: je telt 1 – 2 – 3, 1 – 2 – 3.'),
        Q('Hoeveel tellen heeft een 3/4-maat?', ['2', '3', '4'], 1),
        RH('Tik mee in 3/4.', [1, 1, 1, 1, 1, 1], { beats: 3, bpm: 90 }),
        RH('Half en kwart.', [2, 1, 2, 1], { beats: 3, bpm: 90 }),
        Q('Welke noot vult precies één hele 3/4-maat?', [G(2), G(3), G(4)], 1),
        RH('Een hele maat lang, dan drie korte.', [3, 1, 1, 1], { beats: 3, bpm: 90 }),
        TF('In een 3/4-maat past een hele noot (4 tellen).', false),
      ] },
    ],
  },
  {
    title: 'Eerste melodietjes', desc: 'Bekende liedjes, stukje voor stukje.',
    color: '#3a6ea5', dark: '#2c5684',
    lessons: [
      { id: 'm1', title: 'Mary Had a Little Lamb', icon: '🐑', steps: [
        I('We leren een bekend liedje in kleine stukjes. Luister eerst naar het begin.', { sound: 'E4 D4 C4 D4 E4 E4 E4' }),
        Q('Met welke noot begint het liedje?', ['C', 'D', 'E'], 2),
        P('Speel het eerste stukje.', 'E4 D4 C4 D4 E4 E4 E4'),
        RH('Tik het ritme van het eerste stukje.', [1, 1, 1, 1, 1, 1, 2], { bpm: 90 }),
        P('Het tweede stukje.', 'D4 D4 D4 E4 G4 G4'),
        P('En het slot.', 'E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4'),
        Q('Welke noot is het hoogst in het liedje?', ['E', 'F', 'G'], 2),
        P('Het begin zonder hulp.', 'E4 D4 C4 D4 E4 E4 E4', { hint: false }),
        P('Het tweede stukje zonder hulp.', 'D4 D4 D4 E4 G4 G4', { hint: false }),
      ] },
      { id: 'm2', title: 'Ode an die Freude', icon: '🎶', steps: [
        I('Deze melodie schreef Beethoven. Luister maar.', { sound: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4' }),
        Q('De melodie begint met E E F G. Gaat dat omhoog of omlaag?', UP_DOWN, 0),
        P('Speel de eerste helft.', 'E4 E4 F4 G4 G4 F4 E4 D4'),
        P('De tweede helft.', 'C4 C4 D4 E4 E4 D4 D4'),
        RH('Tik het ritme van de tweede helft.', [1, 1, 1, 1, 1.5, 0.5, 2], { bpm: 80 }),
        P('Nu het hele stuk, met het tweede slot.', 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4 C4 C4'),
        Q('Op welke noot eindigt het liedje?', ['C', 'D', 'G'], 0),
        P('De eerste helft zonder hulp.', 'E4 E4 F4 G4 G4 F4 E4 D4', { hint: false }),
      ] },
      { id: 'm3', title: 'Vader Jacob', icon: '🔔', steps: [
        I('Ken je Vader Jacob? Luister naar het begin.', { sound: 'C4 D4 E4 C4 C4 D4 E4 C4' }),
        P('"Vader Jacob, Vader Jacob"', 'C4 D4 E4 C4 C4 D4 E4 C4'),
        P('"Slaapt gij nog? Slaapt gij nog?"', 'E4 F4 G4 E4 F4 G4'),
        RH('Tik het ritme van "Slaapt gij nog? Slaapt gij nog?"', [1, 1, 2, 1, 1, 2], { bpm: 100 }),
        P('"Alle klokken luiden" – je hand schuift even op naar de A.', 'G4 A4 G4 F4 E4 C4'),
        P('"Bim bam bom" – de lage G ligt links van de centrale C.', 'C4 G3 C4'),
        Q('Hoe vaak hoor je elk zinnetje in Vader Jacob?', ['Eén keer', 'Twee keer', 'Vier keer'], 1),
        P('Het begin zonder hulp.', 'C4 D4 E4 C4 C4 D4 E4 C4', { hint: false }),
        P('"Slaapt gij nog?" zonder hulp.', 'E4 F4 G4 E4 F4 G4', { hint: false }),
      ] },
      { id: 'm4', title: 'Altijd is Kortjakje ziek', icon: '⭐', steps: [
        I('Dit liedje ken je ook als "Twinkle Twinkle Little Star". Luister.', { sound: 'C4 C4 G4 G4 A4 A4 G4' }),
        P('"Altijd is Kortjakje ziek"', 'C4 C4 G4 G4 A4 A4 G4'),
        Q('Van C naar G: is dat een stapje of een sprong?', ['Een stapje (naastliggende toets)', 'Een sprong'], 1),
        P('"Midden in de week maar \'s zondags niet"', 'F4 F4 E4 E4 D4 D4 C4'),
        P('"\'s Zondags gaat zij naar de kerk"', 'G4 G4 F4 F4 E4 E4 D4'),
        Q('Welke noot is de hoogste in dit liedje?', ['G', 'A', 'B'], 1),
        RH('Tik het ritme van de eerste regel.', [1, 1, 1, 1, 1, 1, 2], { bpm: 100 }),
        P('De eerste regel zonder hulp.', 'C4 C4 G4 G4 A4 A4 G4', { hint: false }),
        P('De tweede regel zonder hulp.', 'F4 F4 E4 E4 D4 D4 C4', { hint: false }),
      ] },
      { id: 'm5', title: 'Jingle Bells', icon: '🛷', steps: [
        I('Tijd voor een feestelijk liedje! Luister naar het refrein.', { sound: 'E4 E4 E4 E4 E4 E4 E4 G4 C4 D4 E4' }),
        P('"Jingle bells, jingle bells"', 'E4 E4 E4 E4 E4 E4'),
        P('"Jingle all the way"', 'E4 G4 C4 D4 E4'),
        RH('Tik het ritme van het begin.', [1, 1, 2, 1, 1, 2, 1, 1, 1.5, 0.5, 4], { bpm: 110 }),
        P('"Oh what fun it is to ride…"', 'F4 F4 F4 F4 F4 E4 E4 E4 E4'),
        P('"…in a one-horse open sleigh!"', 'D4 D4 E4 D4 G4'),
        Q('Welke noot hoor je het vaakst in het refrein?', ['C', 'E', 'G'], 1),
        P('"Jingle bells, jingle all the way" zonder hulp.', 'E4 E4 E4 E4 E4 E4 E4 G4 C4 D4 E4', { hint: false }),
      ] },
    ],
  },
  {
    title: 'Noten lezen: vioolsleutel', desc: 'De notenbalk, lijnen, ruimtes en hulplijnen.',
    color: '#8a5cc2', dark: '#6b43a0',
    lessons: [
      { id: 'n1', title: 'De notenbalk', icon: '🎼', steps: [
        I('Muziek schrijf je op een <b>notenbalk</b>. Hoe hoger een noot op de balk staat, hoe hoger hij klinkt.', { staff: staff('C4 E4 G4 C5') }),
        Q('Hoeveel lijnen heeft een notenbalk?', ['4', '5', '6'], 1),
        I('Een noot staat óp een lijn (de lijn gaat door het bolletje) of tússen twee lijnen, in een ruimte.', { staff: staff('E4 F4') }),
        Q('Staat deze noot op een lijn of in een ruimte?', ['Op een lijn', 'In een ruimte'], 0, { staff: staff('G4') }),
        Q('En deze?', ['Op een lijn', 'In een ruimte'], 1, { staff: staff('A4') }),
        Q('Welke noot klinkt het hoogst?', FIRST_SECOND, 1, { staff: staff('G4 D5') }),
        I('Het krulletje vooraan is de <b>vioolsleutel</b>, voor de hogere noten. Hij krult om de tweede lijn: daar staat de G.', { staff: staff('G4') }),
        I('Dit is de <b>centrale C</b>. Hij staat op een klein hulplijntje onder de notenbalk.', { staff: staff('C4') }),
        R('Speel de noot die je ziet.', 'C4 D4 E4'),
        Q('Welke noot is dit? Tip: één stapje boven de D.', ['C', 'E', 'G'], 1, { staff: staff('E4') }),
      ] },
      { id: 'n2', title: 'Lijnen: E G B D F', icon: '📏', steps: [
        I('De vijf lijnen zijn van onder naar boven <b>E – G – B – D – F</b>. Ezelsbruggetje: "<b>E</b>lke <b>G</b>oede <b>B</b>akker <b>D</b>oet <b>F</b>ijn werk".', { staff: staff('E4 G4 B4 D5 F5') }),
        Q('Welke noot staat op de onderste lijn?', ['C', 'E', 'G'], 1, { staff: staff('E4') }),
        Q('Welke noot staat op de middelste lijn?', ['G', 'B', 'D'], 1, { staff: staff('B4') }),
        M('Koppel de lijn aan de noot.', [['onderste lijn', 'E'], ['2e lijn', 'G'], ['middelste lijn', 'B'], ['4e lijn', 'D'], ['bovenste lijn', 'F']]),
        NN('Welke noot is dit?', 'E4 G4 B4 D5 F5', 6),
        R('Speel de noten op de lijnen.', 'E4 G4 B4 D5 F5'),
        R('Nu door elkaar.', 'G4 E4 D5 B4 F5'),
      ] },
      { id: 'n3', title: 'Ruimtes: F A C E', icon: '🧩', steps: [
        I('De vier ruimtes tussen de lijnen spellen samen het woord <b>FACE</b> (van onder naar boven).', { staff: staff('F4 A4 C5 E5') }),
        TF('De ruimtes van onder naar boven zijn F, A, C, E.', true),
        Q('Welke noot is dit?', ['F', 'A', 'C'], 1, { staff: staff('A4') }),
        Q('En deze?', ['A', 'C', 'E'], 1, { staff: staff('C5') }),
        NN('Welke noot is dit?', 'F4 A4 C5 E5', 6),
        R('Speel de noten in de ruimtes.', 'F4 A4 C5 E5'),
        NN('Lijnen en ruimtes door elkaar!', 'E4 F4 G4 A4 B4 C5 D5 E5 F5', 8),
        R('Speel ze ook.', 'C5 E4 A4 D5 F4 G4'),
      ] },
      { id: 'n4', title: 'Stappen en sprongen', icon: '🦘', steps: [
        I('Van een lijn naar de ruimte ernaast is een <b>stap</b>: op de piano de toets ernaast.', { staff: staff('E4 F4') }),
        I('Van lijn naar lijn (of ruimte naar ruimte) is een <b>sprong</b>: je slaat één toets over.', { staff: staff('E4 G4') }),
        Q('Stap of sprong?', ['Stap', 'Sprong'], 0, { staff: staff('C4 D4') }),
        Q('Stap of sprong?', ['Stap', 'Sprong'], 1, { staff: staff('G4 B4') }),
        Q('Stap of sprong?', ['Stap', 'Sprong'], 1, { staff: staff('A4 F4') }),
        Q('Stap of sprong?', ['Stap', 'Sprong'], 0, { staff: staff('D5 C5') }),
        Q('Hoor je een stap of een sprong?', ['Stap', 'Sprong'], 0, { sound: 'C4 D4' }),
        Q('En nu?', ['Stap', 'Sprong'], 1, { sound: 'C4 E4' }),
        R('Lees en speel dit melodietje.', 'C4 D4 E4 F4 G4', { together: true }),
        R('En dit melodietje met sprongen.', 'C4 E4 G4 E4 C4', { together: true }),
      ] },
      { id: 'n5', title: 'Hulplijnen', icon: '🪜', steps: [
        I('Noten die buiten de notenbalk vallen, krijgen kleine <b>hulplijnen</b>. De centrale C staat op het eerste hulplijntje onder de balk.', { staff: staff('C4 D4') }),
        I('Boven de balk gaat het ook verder: boven de bovenste lijn (F) hangt de <b>G</b>, en de <b>A</b> staat op een hulplijntje.', { staff: staff('F5 G5 A5') }),
        Q('Welke noot is dit?', ['C', 'D', 'B'], 0, { staff: staff('C4') }),
        Q('En deze?', ['F', 'G', 'A'], 2, { staff: staff('A5') }),
        Q('Welke noot hangt net onder de onderste lijn?', ['C', 'D', 'F'], 1, { staff: staff('D4') }),
        NN('Welke noot is dit?', 'C4 D4 E4 F5 G5 A5', 6),
        R('Speel deze noten.', 'C4 A5 D4 G5'),
      ] },
      { id: 'n6', title: 'Herhaling vioolsleutel', icon: '🏆', steps: [
        NN('Benoem zoveel mogelijk noten!', 'C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5', 10),
        RR('Speel de noot die je ziet.', 'C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5', 8),
        R('Lees en speel.', 'E4 D4 C4 D4 E4 E4', { together: true }),
        R('Lees en speel.', 'G4 G4 A4 A4 G4', { together: true }),
        Q('Welk ezelsbruggetje hoort bij de lijnen?', ['FACE', 'Elke Goede Bakker Doet Fijn werk', 'Alle Cowboys Eten Graag'], 1),
      ] },
    ],
  },
  {
    title: 'Noten lezen: bassleutel', desc: 'Lage noten lezen voor je linkerhand.',
    color: '#8d6e63', dark: '#6d5047',
    lessons: [
      { id: 'b1', title: 'De bassleutel', icon: '𝄢', steps: [
        I('Lage noten schrijf je met de <b>bassleutel</b>. Die gebruik je vooral voor je linkerhand.', { staff: staff('F3', 'bass') }),
        I('De twee puntjes van de bassleutel liggen om de <b>F-lijn</b> (de vierde lijn). Daarom heet hij ook wel F-sleutel.', { staff: staff('F3', 'bass') }),
        Q('Welke noot staat op de lijn tussen de twee puntjes?', ['C', 'F', 'G'], 1, { staff: staff('F3', 'bass') }),
        I('De <b>centrale C</b> staat in de bassleutel op een hulplijntje <b>boven</b> de balk.', { staff: staff('C4', 'bass') }),
        Q('Welke noot is dit?', ['A', 'B', 'C'], 2, { staff: staff('C4', 'bass') }),
        TF('In de bassleutel staan lagere noten dan in de vioolsleutel.', true),
        R('Speel de noten die je ziet (omlaag vanaf de centrale C).', 'C4 B3 A3 G3 F3', { clef: 'bass' }),
      ] },
      { id: 'b2', title: 'Bas-lijnen: G B D F A', icon: '📏', steps: [
        I('De lijnen van de bassleutel zijn van onder naar boven <b>G – B – D – F – A</b>: "<b>G</b>oede <b>B</b>oeren <b>D</b>oen <b>F</b>link <b>A</b>rbeid".', { staff: staff('G2 B2 D3 F3 A3', 'bass') }),
        Q('Welke noot staat op de onderste lijn?', ['E', 'G', 'A'], 1, { staff: staff('G2', 'bass') }),
        Q('En op de middelste lijn?', ['B', 'D', 'F'], 1, { staff: staff('D3', 'bass') }),
        M('Koppel de lijn aan de noot.', [['onderste lijn', 'G'], ['2e lijn', 'B'], ['middelste lijn', 'D'], ['4e lijn', 'F'], ['bovenste lijn', 'A']]),
        NN('Welke noot is dit?', 'G2 B2 D3 F3 A3', 6, { clef: 'bass' }),
        R('Speel de bas-lijnen.', 'G2 B2 D3 F3 A3', { clef: 'bass' }),
      ] },
      { id: 'b3', title: 'Bas-ruimtes: A C E G', icon: '🤠', steps: [
        I('De ruimtes van de bassleutel zijn <b>A – C – E – G</b>: "<b>A</b>lle <b>C</b>owboys <b>E</b>ten <b>G</b>raag".', { staff: staff('A2 C3 E3 G3', 'bass') }),
        TF('In de bassleutel staat de C in de tweede ruimte.', true, { staff: staff('C3', 'bass') }),
        Q('Welke noot is dit?', ['C', 'E', 'G'], 1, { staff: staff('E3', 'bass') }),
        NN('Welke noot is dit?', 'A2 C3 E3 G3', 6, { clef: 'bass' }),
        R('Speel de bas-ruimtes.', 'A2 C3 E3 G3', { clef: 'bass' }),
        NN('Lijnen en ruimtes door elkaar.', 'G2 A2 B2 C3 D3 E3 F3 G3 A3', 8, { clef: 'bass' }),
      ] },
      { id: 'b4', title: 'Twee sleutels', icon: '🔑', steps: [
        I('Pianomuziek heeft meestal twee balken: vioolsleutel boven (rechterhand) en bassleutel onder (linkerhand). De centrale C zit er precies tussenin.'),
        Q('Welke sleutel gebruik je meestal voor de linkerhand?', ['Vioolsleutel', 'Bassleutel'], 1),
        Q('Let op de sleutel! Welke noot is dit?', ['E', 'G', 'C'], 1, { staff: staff('G2', 'bass') }),
        Q('Let op de sleutel! Welke noot is dit?', ['E', 'G', 'C'], 0, { staff: staff('E4') }),
        NN('Let goed op de sleutel bij elke noot.', 'C3 D3 E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5', 10, { clef: 'both' }),
        RR('Speel de noot die je ziet.', 'G2 A2 B2 C3 D3 E3 F3 G3 A3 C4 D4 E4 F4 G4 A4 B4 C5', 8, { clef: 'both' }),
      ] },
    ],
  },
  {
    title: 'Zwarte toetsen', desc: 'Kruisen, mollen en halve en hele tonen.',
    color: '#d9822b', dark: '#b0651a',
    lessons: [
      { id: 'z1', title: 'Het kruis (♯)', icon: '♯', steps: [
        I('Een <b>kruis (♯)</b> maakt een noot een halve toon hoger: de toets er direct rechts van. C♯ is dus de zwarte toets rechts van C.', { keys: N('C4 C#4') }),
        P('Speel C♯.', 'C#4'),
        P('Speel F♯.', 'F#4'),
        Q('Waar ligt G♯?', ['De zwarte toets rechts van G', 'De zwarte toets links van G', 'De witte toets rechts van G'], 0),
        NK('Welke toets licht op?', 'C#4 D#4 F#4 G#4 A#4', 5, { sharps: true }),
        I('Op de notenbalk staat het kruis vóór de noot.', { staff: staff('F#4') }),
        R('Speel de noot die je ziet.', 'F#4 C#5 G#4'),
        P('Vind een D♯ zonder hulp.', 'D#4', { hint: false, anyOctave: true }),
      ] },
      { id: 'z2', title: 'De mol (♭)', icon: '♭', steps: [
        I('Een <b>mol (♭)</b> maakt een noot een halve toon lager: de toets er direct links van. B♭ is de zwarte toets links van B.', { keys: N('B4 A#4') }),
        P('Speel B♭.', 'A#4', { labels: ['B♭'] }),
        P('Speel E♭.', 'D#4', { labels: ['E♭'] }),
        I('Elke zwarte toets heeft dus <b>twee namen</b>. De toets tussen C en D is C♯ én D♭.', { keys: N('C#4') }),
        M('Koppel de namen die bij dezelfde toets horen.', [['C♯', 'D♭'], ['D♯', 'E♭'], ['F♯', 'G♭'], ['G♯', 'A♭'], ['A♯', 'B♭']]),
        TF('Een mol maakt een noot hoger.', false),
        Q('Welke naam hoort bij dezelfde toets als G♭?', ['F♯', 'G♯', 'A♭'], 0),
        P('Vind een A♭ zonder hulp.', 'G#4', { hint: false, anyOctave: true, labels: ['A♭'] }),
      ] },
      { id: 'z3', title: 'Halve en hele tonen', icon: '📐', steps: [
        I('Van een toets naar de <b>allerdichtstbijzijnde</b> toets is een <b>halve toon</b>, ook als die zwart is.', { keys: N('C4 C#4') }),
        I('Let op: tussen E en F, en tussen B en C zit geen zwarte toets. Dat zijn ook halve tonen!', { keys: N('E4 F4 B4 C5') }),
        I('Twee halve tonen samen is een <b>hele toon</b>, bijvoorbeeld C naar D.', { keys: N('C4 D4') }),
        Q('C naar C♯ is…', ['een halve toon', 'een hele toon'], 0),
        Q('E naar F is…', ['een halve toon', 'een hele toon'], 0),
        Q('F naar G is…', ['een halve toon', 'een hele toon'], 1),
        Q('B naar C is…', ['een halve toon', 'een hele toon'], 0),
        P('Speel een halve toon omhoog vanaf E.', 'E4 F4'),
        P('Speel een hele toon omhoog vanaf D.', 'D4 E4'),
        P('Speel alle toetsen van C tot G, zwart én wit: de chromatische toonladder.', 'C4 C#4 D4 D#4 E4 F4 F#4 G4'),
      ] },
      { id: 'z4', title: 'Posities met zwarte toetsen', icon: '🖐️', steps: [
        I('De vijf-vingerpositie van <b>D</b> heeft een zwarte toets: D – E – F♯ – G – A.', { keys: N('D4 E4 F#4 G4 A4') }),
        P('Speel de D-positie omhoog en omlaag.', 'D4 E4 F#4 G4 A4 G4 F#4 E4 D4'),
        I('De positie van <b>A</b>: A – B – C♯ – D – E.', { keys: N('A3 B3 C#4 D4 E4') }),
        P('Speel de A-positie.', 'A3 B3 C#4 D4 E4'),
        Q('Welke zwarte toets zit in de D-positie?', ['C♯', 'F♯', 'B♭'], 1),
        P('Speel "Mary had a little lamb" vanaf F♯.', 'F#4 E4 D4 E4 F#4 F#4 F#4'),
        P('De D-positie zonder hulp.', 'D4 E4 F#4 G4 A4', { hint: false }),
      ] },
    ],
  },
  {
    title: 'Toonladders & akkoorden', desc: 'Majeur, mineur en je eerste akkoordenreeks.',
    color: '#c79100', dark: '#9c7100',
    lessons: [
      { id: 't1', title: 'Toonladder van C', icon: '📶', steps: [
        I('Een <b>toonladder</b> is een rij van acht noten, van C tot de volgende C. De C-majeur toonladder gebruikt alleen witte toetsen.', { keys: N('C4 D4 E4 F4 G4 A4 B4 C5'), sound: 'C4 D4 E4 F4 G4 A4 B4 C5' }),
        I('Vingerzetting rechterhand: <b>1 2 3</b>, dan gaat je <b>duim onderdoor</b> naar de F, en verder <b>1 2 3 4 5</b>.'),
        Q('Na welke noot zet je je duim onderdoor?', ['D', 'E', 'G'], 1),
        P('Speel de toonladder omhoog.', 'C4 D4 E4 F4 G4 A4 B4 C5', { labels: N('C·1 D·2 E·3 F·1 G·2 A·3 B·4 C·5') }),
        P('En omlaag (vinger 3 gaat over de duim heen).', 'C5 B4 A4 G4 F4 E4 D4 C4', { labels: N('C·5 B·4 A·3 G·2 F·1 E·3 D·2 C·1') }),
        I('Het patroon van een majeur toonladder is altijd: <b>hele – hele – halve – hele – hele – hele – halve</b> toon.'),
        Q('Tussen welke noten zit in C-majeur een halve toon?', ['C–D en F–G', 'E–F en B–C', 'D–E en A–B'], 1),
        P('De toonladder omhoog zonder hulp.', 'C4 D4 E4 F4 G4 A4 B4 C5', { hint: false }),
      ] },
      { id: 't2', title: 'Toonladder van G', icon: '🎚️', steps: [
        I('De G-majeur toonladder volgt hetzelfde patroon. Daardoor heeft hij één zwarte toets: <b>F♯</b>.', { keys: N('G4 A4 B4 C5 D5 E5 F#5 G5'), sound: 'G4 A4 B4 C5 D5 E5 F#5 G5' }),
        Q('Welke zwarte toets hoort bij G-majeur?', ['B♭', 'C♯', 'F♯'], 2),
        P('Speel de G-majeur toonladder.', 'G4 A4 B4 C5 D5 E5 F#5 G5', { labels: N('G·1 A·2 B·3 C·1 D·2 E·3 F♯·4 G·5') }),
        P('En omlaag.', 'G5 F#5 E5 D5 C5 B4 A4 G4'),
        TF('G-majeur heeft dezelfde vingerzetting als C-majeur.', true),
        Q('Hoe klinkt de toonladder als je F speelt in plaats van F♯?', ['Precies hetzelfde', 'Anders – het patroon klopt dan niet'], 1, { sound: 'G4 A4 B4 C5 D5 E5 F5 G5' }),
        P('Zonder hulp.', 'G4 A4 B4 C5 D5 E5 F#5 G5', { hint: false }),
      ] },
      { id: 't3', title: 'Toonladder van F', icon: '🎛️', steps: [
        I('De F-majeur toonladder heeft één mol: <b>B♭</b>.', { keys: N('F4 G4 A4 A#4 C5 D5 E5 F5'), sound: 'F4 G4 A4 A#4 C5 D5 E5 F5' }),
        Q('Welke zwarte toets hoort bij F-majeur?', ['B♭', 'E♭', 'F♯'], 0),
        I('Let op de vingerzetting: <b>1 2 3 4</b>, dan duim onderdoor op de C, en <b>1 2 3 4</b>.'),
        P('Speel de F-majeur toonladder.', 'F4 G4 A4 A#4 C5 D5 E5 F5', { labels: N('F·1 G·2 A·3 B♭·4 C·1 D·2 E·3 F·4') }),
        P('En omlaag.', 'F5 E5 D5 C5 A#4 A4 G4 F4', { labels: N('F E D C B♭ A G F') }),
        Q('Bij welke noot gaat de duim onderdoor in F-majeur?', ['B♭', 'C', 'D'], 1),
        P('Zonder hulp.', 'F4 G4 A4 A#4 C5 D5 E5 F5', { hint: false, labels: N('F G A B♭ C D E F') }),
      ] },
      { id: 't4', title: 'Majeur-akkoorden', icon: '🎹', steps: [
        I('Een <b>akkoord</b> is een paar noten die samen klinken. C-majeur bestaat uit <b>C, E en G</b>: steeds één witte toets overslaan.', { keys: N('C4 E4 G4'), sound: 'C4 E4 G4', chord: true, staff: staff('C4 E4 G4', 'treble', true) }),
        CH('Speel C-majeur: C, E en G (tegelijk of na elkaar).', 'C4 E4 G4'),
        I('Schuif op naar <b>F-majeur</b>: F, A en C.', { keys: N('F4 A4 C5'), sound: 'F4 A4 C5', chord: true }),
        CH('Speel F-majeur.', 'F4 A4 C5'),
        I('En <b>G-majeur</b>: G, B en D.', { keys: N('G4 B4 D5'), sound: 'G4 B4 D5', chord: true }),
        CH('Speel G-majeur.', 'G4 B4 D5'),
        M('Koppel het akkoord aan de noten.', [['C-majeur', 'C E G'], ['F-majeur', 'F A C'], ['G-majeur', 'G B D']]),
        Q('Uit welke noten bestaat C-majeur?', ['C – D – E', 'C – E – G', 'C – F – A'], 1),
        Q('Welk akkoord staat hier?', ['C-majeur', 'F-majeur', 'G-majeur'], 2, { staff: staff('G4 B4 D5', 'treble', true) }),
      ] },
      { id: 't5', title: 'Mineur-akkoorden', icon: '🌧️', steps: [
        I('Een <b>mineur</b>-akkoord klinkt somberder dan majeur. A-mineur: <b>A, C en E</b>.', { keys: N('A4 C5 E5'), sound: 'A4 C5 E5', chord: true }),
        CH('Speel A-mineur.', 'A4 C5 E5'),
        I('Luister naar het verschil: eerst C-majeur (vrolijk), dan C-mineur (somber). Alleen de middelste noot zakt een halve toon.', { sound: 'C4 E4 G4 | C4 D#4 G4', chord: true }),
        Q('Klinkt dit akkoord vrolijk (majeur) of somber (mineur)?', ['Majeur', 'Mineur'], 1, { sound: 'C4 D#4 G4', chord: true }),
        Q('En dit akkoord?', ['Majeur', 'Mineur'], 0, { sound: 'F4 A4 C5', chord: true }),
        CH('Speel D-mineur: D, F en A.', 'D4 F4 A4'),
        CH('Speel E-mineur: E, G en B.', 'E4 G4 B4'),
        Q('Majeur of mineur?', ['Majeur', 'Mineur'], 1, { sound: 'D4 F4 A4', chord: true }),
        M('Koppel het akkoord aan de noten.', [['C-majeur', 'C E G'], ['A-mineur', 'A C E'], ['D-mineur', 'D F A'], ['G-majeur', 'G B D']]),
      ] },
      { id: 't6', title: 'Akkoordenreeks', icon: '🔁', steps: [
        I('Veel liedjes gebruiken de akkoorden <b>C – F – G – C</b>. Luister hoe de reeks "thuiskomt" op C.', { sound: 'C4 E4 G4 | F4 A4 C5 | G4 B4 D5 | C4 E4 G4', chord: true }),
        CH('Akkoord 1: C-majeur.', 'C4 E4 G4'),
        CH('Akkoord 2: F-majeur.', 'F4 A4 C5'),
        CH('Akkoord 3: G-majeur.', 'G4 B4 D5'),
        CH('En weer thuis: C-majeur.', 'C4 E4 G4'),
        Q('Welk akkoord voelt als "thuiskomen" in deze reeks?', ['C', 'F', 'G'], 0),
        I('Tip: de afstanden tussen de vingers blijven bij majeur-akkoorden op witte toetsen hetzelfde. Je hand schuift alleen op.'),
        CH('Zonder hulp: F-majeur.', 'F4 A4 C5', { hint: false }),
        CH('Zonder hulp: G-majeur.', 'G4 B4 D5', { hint: false }),
      ] },
    ],
  },
  {
    title: 'Gehoortraining', desc: 'Luisteren, herkennen en naspelen.',
    color: '#c2185b', dark: '#93114a',
    lessons: [
      { id: 'g1', title: 'Hoog of laag', icon: '👂', steps: [
        I('In deze eenheid train je je oren. Luister goed – je kunt alles zo vaak afspelen als je wilt.', { title: 'Oren gespitst!' }),
        Q('Welke noot klinkt hoger?', FIRST_SECOND, 0, { sound: 'G4 C4' }),
        Q('Welke noot klinkt hoger?', FIRST_SECOND, 1, { sound: 'D4 E4' }),
        Q('Welke noot klinkt hoger?', FIRST_SECOND, 1, { sound: 'B3 C4' }),
        Q('Gaat de melodie omhoog of omlaag?', UP_DOWN, 1, { sound: 'A4 G4 E4 C4' }),
        Q('En deze?', UP_DOWN, 0, { sound: 'C4 E4 G4 C5' }),
        Q('Hoeveel noten hoor je?', ['2', '3', '4'], 1, { sound: 'C4 E4 G4' }),
      ] },
      { id: 'g2', title: 'Stap of sprong', icon: '🦘', steps: [
        I('Bij een <b>stap</b> gaat de melodie naar de toon ernaast; bij een <b>sprong</b> slaat hij er minstens één over.', { sound: 'C4 D4 C4 G4' }),
        Q('Stap of sprong?', ['Stap', 'Sprong'], 0, { sound: 'E4 F4' }),
        Q('Stap of sprong?', ['Stap', 'Sprong'], 1, { sound: 'C4 G4' }),
        Q('Stap of sprong?', ['Stap', 'Sprong'], 1, { sound: 'D4 A4' }),
        Q('Stap of sprong?', ['Stap', 'Sprong'], 0, { sound: 'A4 G4' }),
        Q('Stap of sprong?', ['Stap', 'Sprong'], 1, { sound: 'E4 C4' }),
        Q('Welke melodie bestaat alleen uit stappen?', FIRST_SECOND, 0, { sound: 'C4 D4 E4 F4 | C4 E4 G4 C5' }),
      ] },
      { id: 'g3', title: 'Noten zoeken', icon: '🔎', steps: [
        I('Je hoort eerst een C als <b>referentie</b>, daarna een andere noot. Zoek die noot op het klavier. De mogelijke toetsen zijn gemarkeerd.'),
        E('Welke noot hoor je? C, E of G?', 'C4 E4 G4', 4),
        E('Nu met meer keuze: C, D, E, F of G.', 'C4 D4 E4 F4 G4', 5),
        E('Alle witte toetsen van C tot C!', 'C4 D4 E4 F4 G4 A4 B4 C5', 5),
      ] },
      { id: 'g4', title: 'Majeur of mineur', icon: '🎭', steps: [
        I('Majeur klinkt meestal <b>vrolijk</b>, mineur <b>somber</b>. Eerst majeur, dan mineur:', { sound: 'A3 C#4 E4 | A3 C4 E4', chord: true }),
        Q('Majeur of mineur?', ['Majeur', 'Mineur'], 0, { sound: 'C4 E4 G4', chord: true }),
        Q('Majeur of mineur?', ['Majeur', 'Mineur'], 1, { sound: 'A3 C4 E4', chord: true }),
        Q('Majeur of mineur?', ['Majeur', 'Mineur'], 1, { sound: 'E4 G4 B4', chord: true }),
        Q('Majeur of mineur?', ['Majeur', 'Mineur'], 0, { sound: 'G3 B3 D4', chord: true }),
        Q('Majeur of mineur?', ['Majeur', 'Mineur'], 0, { sound: 'D4 F#4 A4', chord: true }),
        Q('Majeur of mineur?', ['Majeur', 'Mineur'], 1, { sound: 'D4 F4 A4', chord: true }),
      ] },
      { id: 'g5', title: 'Melodietjes naspelen', icon: '🦜', steps: [
        I('Nu het echte werk: luister naar een kort melodietje en speel het na. Je begint steeds op de centrale C. Na twee fouten krijg je een hint.'),
        P('Speel na wat je hoort.', 'C4 D4 E4', { hint: false, sound: 'C4 D4 E4' }),
        P('Speel na wat je hoort.', 'C4 E4 G4', { hint: false, sound: 'C4 E4 G4' }),
        P('Speel na wat je hoort.', 'C4 D4 C4', { hint: false, sound: 'C4 D4 C4' }),
        P('Speel na wat je hoort.', 'C4 E4 D4 C4', { hint: false, sound: 'C4 E4 D4 C4' }),
        P('Speel na wat je hoort.', 'C4 G4 E4 C4', { hint: false, sound: 'C4 G4 E4 C4' }),
      ] },
    ],
  },
];

const ALL_LESSONS = UNITS.flatMap((u, ui) => u.lessons.map(l => ({ ...l, unit: ui })));

/* ================= Voortgang ================= */
const progress = {
  data: store.get('lessons', { stars: {}, xp: 0, streak: 0, lastDay: null }),
  save() { store.set('lessons', this.data); },
  day(offset = 0) { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; },
  currentStreak() {
    const { lastDay, streak } = this.data;
    return (lastDay === this.day() || lastDay === this.day(-1)) ? streak : 0;
  },
  complete(id, stars, xp) {
    const d = this.data;
    d.stars[id] = Math.max(d.stars[id] || 0, stars);
    d.xp += xp;
    const t = this.day();
    if (d.lastDay !== t) {
      d.streak = d.lastDay === this.day(-1) ? d.streak + 1 : 1;
      d.lastDay = t;
    }
    this.save();
  },
  isUnlocked(i) { return i === 0 || (this.data.stars[ALL_LESSONS[i - 1].id] || 0) > 0; },
};

/* ================= Hulpjes ================= */
const $ = id => document.getElementById(id);
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, not) => { let x; do { x = a[Math.floor(Math.random() * a.length)]; } while (a.length > 1 && x === not); return x; };
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const letterOf = m => NAMES[pc(m)][0];
const starHTML = n => [0, 1, 2].map(i => `<span class="${i < n ? '' : 'star-off'}">⭐</span>`).join('');
const PIANO_STEPS = new Set(['play', 'chord', 'read', 'ear', 'nameKey']);

/* ================= Leerpad ================= */
const ZIGZAG = [0, 55, 80, 55, 0, -55, -80, -55];

function renderPath() {
  const path = $('path');
  path.innerHTML = '';
  let idx = 0;
  const current = ALL_LESSONS.findIndex(l => !progress.data.stars[l.id]);
  UNITS.forEach((u, ui) => {
    const unit = document.createElement('div');
    unit.className = 'unit';
    unit.style.setProperty('--c', u.color);
    unit.style.setProperty('--cd', u.dark);
    const done = u.lessons.filter(l => progress.data.stars[l.id]).length;
    unit.innerHTML = `<div class="unit-banner" style="background:${u.color}">
      <div><small>Eenheid ${ui + 1} · ${done}/${u.lessons.length}</small><h3>${u.title}</h3><p>${u.desc}</p></div></div>`;
    const list = document.createElement('div');
    list.className = 'unit-path';
    u.lessons.forEach((l, li) => {
      const i = idx++;
      const stars = progress.data.stars[l.id] || 0;
      const unlocked = progress.isUnlocked(i);
      const node = document.createElement('div');
      node.className = 'node' + (stars ? ' done' : '') + (!unlocked ? ' locked' : '') + (i === current ? ' current' : '');
      node.style.transform = `translateX(${ZIGZAG[li % ZIGZAG.length]}px)`;
      const btn = document.createElement('button');
      btn.innerHTML = !unlocked ? '🔒' : stars ? '✓' : l.icon;
      btn.disabled = !unlocked;
      btn.title = unlocked ? `Start: ${l.title}` : 'Voltooi eerst de vorige les';
      btn.addEventListener('click', () => lesson.open(i));
      node.appendChild(btn);
      if (i === current) {
        const tip = document.createElement('div');
        tip.className = 'node-start';
        tip.textContent = progress.data.stars[ALL_LESSONS[0].id] ? 'Verder' : 'Start';
        node.prepend(tip);
      }
      const title = document.createElement('div');
      title.className = 'node-title';
      title.textContent = l.title;
      node.appendChild(title);
      const st = document.createElement('div');
      st.className = 'node-stars';
      st.innerHTML = unlocked ? starHTML(stars) : `<small>${l.steps.length} stappen</small>`;
      node.appendChild(st);
      list.appendChild(node);
    });
    unit.appendChild(list);
    path.appendChild(unit);
  });
  const totalStars = Object.values(progress.data.stars).reduce((a, b) => a + b, 0);
  const streak = progress.currentStreak();
  $('stat-streak').textContent = streak;
  $('stat-streak').nextElementSibling.textContent = streak === 1 ? 'dag' : 'dagen';
  $('stat-xp').textContent = progress.data.xp;
  $('stat-stars').textContent = totalStars;
  $('stat-stars-max').textContent = '/ ' + ALL_LESSONS.length * 3;
  if (current >= 0) requestAnimationFrame(() => path.querySelector('.node.current')?.scrollIntoView({ block: 'center' }));
}

/* ================= Les-speler ================= */
const lesson = {
  i: -1, l: null, step: 0, mistakes: 0, stepMistakes: 0, state: null, solved: false, timers: [],
  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },
  open(i) {
    this.i = i; this.l = ALL_LESSONS[i]; this.step = 0; this.mistakes = 0;
    $('path-view').hidden = true; $('lesson-done').hidden = true; $('lesson-view').hidden = false;
    $('tab-lessons').classList.add('in-lesson');
    $('main').scrollTop = 0;
    this.render();
  },
  close() {
    this.cleanup();
    this.l = null;
    $('lesson-view').hidden = true; $('lesson-done').hidden = true; $('path-view').hidden = false;
    $('tab-lessons').classList.remove('in-lesson');
    showPiano(false);
    renderPath();
  },
  cleanup() {
    clearMarks('mark', 'target');
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.state?.rhythm) this.state.rhythm.phase = 'idle';
  },
  get cur() { return this.l.steps[this.step]; },

  render() {
    this.cleanup();
    const s = this.cur;
    this.solved = false; this.stepMistakes = 0; this.state = {};
    const needsPiano = PIANO_STEPS.has(s.t) || !!s.keys;
    showPiano(needsPiano);
    $('lesson-progress').style.width = (100 * this.step / this.l.steps.length) + '%';
    $('lesson-mistakes').textContent = '❌ ' + this.mistakes;
    $('ls-title').innerHTML = s.title || '';
    $('ls-title').hidden = !s.title;
    $('ls-text').innerHTML = s.text;
    const extra = $('ls-extra');
    extra.innerHTML = '';
    const staffEl = $('ls-staff');
    const showStaff = on => staffEl.toggleAttribute('hidden', !on); // SVG kent .hidden niet
    showStaff(false);
    this.footer('', null);

    const sound = $('ls-sound');
    sound.hidden = !s.sound && s.t !== 'ear';
    sound.textContent = s.t === 'ear' ? '🔊 Nog een keer' : '🔊 Luister';
    sound.onclick = () => this.playSound();
    if (s.sound) this.later(() => this.playSound(), 400);

    if (s.keys) s.keys.forEach(k => setClass(parseNote(k), 'mark'));
    if (s.staff) {
      showStaff(true);
      drawStaff(staffEl, s.staff.clef, s.staff.notes.length ? s.staff.notes.map(parseNote) : null, null, { chord: s.staff.chord });
    }
    if (s.keys?.length) scrollToKey(parseNote(s.keys[Math.floor(s.keys.length / 2)]));

    switch (s.t) {
      case 'info':
        this.solved = true;
        this.footer('', null, 'Verder', true);
        break;
      case 'play':
        this.state = { pos: 0, notes: s.notes.map(parseNote) };
        if (s.notes.length > 1 || s.labels) extra.appendChild(this.chips(s.labels || s.notes.map(n => noteName(parseNote(n))), s.hint === false));
        this.showTarget();
        this.footer('', null, s.sound ? 'Speel na…' : 'Speel de noot…', false);
        break;
      case 'chord':
        this.state = { notes: s.notes.map(parseNote), got: new Set() };
        extra.appendChild(this.chips(s.notes.map(n => noteName(parseNote(n)))));
        if (s.hint !== false) this.state.notes.forEach(m => setClass(m, 'target'));
        scrollToKey(this.state.notes[1]);
        this.footer('', null, 'Speel het akkoord…', false);
        break;
      case 'read': {
        const notes = s.random ? Array.from({ length: s.random }, function () { return this.last = pick(s.pool, this.last); }, {}) : s.notes;
        const clefFor = m => s.clef === 'both' ? (m < 60 ? 'bass' : m > 60 ? 'treble' : (Math.random() < .5 ? 'bass' : 'treble')) : (s.clef || 'treble');
        this.state = { pos: 0, notes: notes.map(parseNote) };
        this.state.clefs = this.state.notes.map(clefFor);
        if (!s.together) extra.appendChild(this.chips(notes.map(() => '?'), true));
        showStaff(true);
        this.showRead();
        this.footer('', null, 'Speel de noot…', false);
        break;
      }
      case 'ear':
        this.state = { round: 0, pool: s.pool.map(parseNote) };
        this.state.pool.forEach(m => setClass(m, 'mark'));
        scrollToKey(this.state.pool[Math.floor(this.state.pool.length / 2)]);
        extra.appendChild(this.chips(Array(s.rounds).fill('?'), true));
        this.newEar();
        this.footer('', null, 'Speel de noot…', false);
        break;
      case 'choice': {
        const box = document.createElement('div');
        box.className = 'choices';
        s.options.forEach((o, oi) => {
          const b = document.createElement('button');
          b.innerHTML = `<kbd>${oi + 1}</kbd> ${o}`;
          b.addEventListener('click', () => this.answer(oi, b));
          box.appendChild(b);
        });
        extra.appendChild(box);
        this.footer('', null, 'Kies een antwoord', false);
        break;
      }
      case 'nameNote':
      case 'nameKey':
        this.renderNaming(s, extra, showStaff);
        break;
      case 'match':
        this.renderMatch(s, extra);
        break;
      case 'order':
        this.renderOrder(s, extra);
        break;
      case 'rhythm':
        this.renderRhythm(s, extra);
        break;
    }
    const body = $('lesson-view').querySelector('.lesson-body');
    body.classList.toggle('text-only', !extra.children.length && staffEl.hasAttribute('hidden'));
    body.classList.toggle('wide', ['match', 'order', 'rhythm'].includes(s.t));
  },

  chips(names, hidden = false) {
    const seq = document.createElement('div');
    seq.className = 'sequence';
    names.forEach((n, i) => {
      const sp = document.createElement('span');
      sp.dataset.i = i;
      sp.dataset.name = n;
      sp.textContent = hidden ? '?' : n;
      seq.appendChild(sp);
    });
    return seq;
  },
  markChips(pos) {
    $('ls-extra').querySelectorAll('.sequence span').forEach(sp => {
      const i = +sp.dataset.i;
      sp.classList.toggle('done', i < pos);
      sp.classList.toggle('current', i === pos);
    });
  },
  revealChip(i, text) {
    const sp = $('ls-extra').querySelector(`.sequence span[data-i="${i}"]`);
    if (sp) sp.textContent = text;
  },

  /* ---- spelen ---- */
  showTarget() {
    clearMarks('target');
    const { pos, notes } = this.state;
    if (pos >= notes.length) return;
    const showHint = this.cur.hint !== false || this.stepMistakes >= 2;
    if (showHint) setClass(notes[pos], 'target');
    if (showHint || pos === 0) scrollToKey(notes[pos]);
    this.markChips(pos);
  },
  showRead() {
    const { pos, notes, clefs } = this.state;
    const s = this.cur;
    if (s.together) {
      const colors = notes.map((_, i) => i < pos ? 'var(--good)' : i === pos ? 'var(--accent)' : null);
      drawStaff($('ls-staff'), clefs[0], notes, colors);
    } else {
      drawStaff($('ls-staff'), clefs[pos], notes[pos]);
      this.markChips(pos);
    }
    clearMarks('target');
    if (this.stepMistakes >= 2) { setClass(notes[pos], 'target'); scrollToKey(notes[pos]); }
  },
  newEar() {
    this.state.target = pick(this.state.pool, this.state.target);
    this.state.tries = 0;
    this.markChips(this.state.round);
    this.later(() => this.playSound(), 400);
  },
  playSound() {
    const s = this.cur;
    if (s.t === 'ear') {
      audio.note(60, 0, 0.6, 0.6);
      audio.note(this.state.target, 1.0, 0.9);
      return;
    }
    if (!s.sound) return;
    // "C4 E4 G4 | F4 A4 C5" = groepen na elkaar; met chord klinkt elke groep als akkoord
    const groups = s.sound.split('|').map(g => N(g).map(parseNote));
    const flash = !document.body.classList.contains('no-piano') && s.hint !== false;
    let t = 0;
    groups.forEach(g => {
      if (s.chord) {
        g.forEach(m => audio.note(m, t, 1.2, 0.55));
        if (flash) g.forEach(m => this.later(() => flashKey(m, 'active', 900), t * 1000));
        t += 1.3;
      } else {
        g.forEach(m => {
          audio.note(m, t, 0.5);
          if (flash) this.later(() => flashKey(m, 'active', 420), t * 1000);
          t += 0.5;
        });
        t += 0.6;
      }
    });
  },
  wrong(m, msg) {
    this.addMistake();
    if (m != null) flashKey(m, 'bad', 350);
    this.footer(msg, 'bad', $('ls-continue').textContent, false);
  },
  addMistake() {
    this.mistakes++; this.stepMistakes++;
    $('lesson-mistakes').textContent = '❌ ' + this.mistakes;
    const el = $('lesson-mistakes');
    el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
  },

  onNote(m) {
    if (!this.l || this.solved) return;
    const s = this.cur;
    const st = this.state;
    if (s.t === 'rhythm') return this.rhythmTap();
    const same = (a, b, any) => any ? pc(a) === pc(b) : a === b;
    if (s.t === 'play') {
      const want = st.notes[st.pos];
      if (same(m, want, s.anyOctave)) {
        flashKey(m, 'good', 250);
        if (s.hint === false) this.revealChip(st.pos, s.labels ? s.labels[st.pos] : noteName(want));
        st.pos++;
        if (st.pos >= st.notes.length) { this.markChips(st.pos); return this.success(); }
        this.footer('', null, s.sound ? 'Speel na…' : 'Speel de noot…', false);
        this.showTarget();
      } else {
        const nameWant = s.labels ? s.labels[st.pos] : noteName(want);
        let msg = `Dat was ${noteName(m)}. `;
        if (s.sound && s.hint === false && this.stepMistakes === 0) msg += 'Luister nog eens goed.';
        else if (this.stepMistakes >= 1) msg += `Zoek de ${nameWant} – hij licht nu op.`;
        else msg += 'Probeer opnieuw!';
        this.wrong(m, msg);
        this.showTarget();
      }
    } else if (s.t === 'chord') {
      if (st.notes.includes(m)) {
        st.got.add(m);
        setClass(m, 'target', false);
        flashKey(m, 'good', 250);
        $('ls-extra').querySelector(`.sequence span[data-i="${st.notes.indexOf(m)}"]`)?.classList.add('done');
        if (st.got.size === st.notes.length) {
          st.notes.forEach(n => audio.note(n, 0.25, 1.2, 0.5));
          this.success('Mooi akkoord!');
        }
      } else {
        this.wrong(m, `${noteName(m)} hoort niet in dit akkoord.`);
        if (this.stepMistakes >= 2) st.notes.filter(n => !st.got.has(n)).forEach(n => setClass(n, 'target'));
      }
    } else if (s.t === 'read') {
      const want = st.notes[st.pos];
      if (pc(m) === pc(want)) {
        flashKey(m, 'good', 250);
        if (!s.together) {
          drawStaff($('ls-staff'), st.clefs[st.pos], want, 'var(--good)');
          this.revealChip(st.pos, noteName(want));
        }
        st.pos++;
        this.stepMistakes = 0;
        if (st.pos >= st.notes.length) { if (s.together) this.showRead(); else this.markChips(st.pos); return this.success(); }
        this.footer(`Ja, dat is ${noteName(want)}!`, null, 'Speel de noot…', false);
        if (s.together) this.showRead(); else this.later(() => this.showRead(), 450);
      } else {
        this.wrong(m, this.stepMistakes >= 1 ? `Het is een ${noteName(want)}. Zie je de oplichtende toets?` : `Dat was ${noteName(m)}. Tel de lijnen nog eens.`);
        if (this.stepMistakes >= 2) { setClass(want, 'target'); scrollToKey(want); }
      }
    } else if (s.t === 'ear') {
      if (pc(m) === pc(st.target)) {
        flashKey(m, 'good', 300);
        clearMarks('target');
        this.revealChip(st.round, noteName(st.target));
        st.round++;
        if (st.round >= s.rounds) { this.markChips(st.round); return this.success(); }
        this.footer(`Goed gehoord, het was ${noteName(st.target)}!`, null, 'Speel de noot…', false);
        this.later(() => this.newEar(), 1100);
      } else {
        st.tries++;
        this.wrong(m, st.tries >= 2 ? `Het was ${noteName(st.target)}. Speel hem maar.` : 'Nog niet. Luister nog eens.');
        if (st.tries >= 2) setClass(st.target, 'target');
        else this.later(() => this.playSound(), 500);
      }
    }
  },

  /* ---- meerkeuze ---- */
  answer(oi, btn) {
    if (this.solved) return;
    const s = this.cur;
    const buttons = [...$('ls-extra').querySelectorAll('.choices button')];
    buttons.forEach(b => (b.disabled = true));
    buttons[s.answer].classList.add('good');
    if (oi === s.answer) this.success();
    else {
      btn.classList.add('bad');
      this.addMistake();
      this.solved = true;
      const plain = s.options[s.answer].replace(/<[^>]+>/g, '').trim();
      this.footer(plain ? `Juiste antwoord: ${plain}` : 'Helaas, het groene antwoord is goed.', 'bad', 'Verder', true);
    }
  },

  /* ---- noten/toetsen benoemen ---- */
  renderNaming(s, extra, showStaff) {
    const sharps = s.sharps;
    const names = sharps ? ['C♯', 'D♯', 'F♯', 'G♯', 'A♯'] : LETTERS;
    this.state = { round: 0, pool: s.pool.map(parseNote) };
    extra.appendChild(this.chips(Array(s.rounds).fill('?'), true));
    const box = document.createElement('div');
    box.className = 'letters';
    names.forEach(n => {
      const b = document.createElement('button');
      b.textContent = n;
      b.addEventListener('click', () => this.nameAnswer(n, b));
      box.appendChild(b);
    });
    extra.appendChild(box);
    if (s.t === 'nameNote') showStaff(true);
    this.footer('', null, 'Kies de naam', false);
    this.nextNaming();
  },
  nextNaming() {
    const s = this.cur, st = this.state;
    st.target = pick(st.pool, st.target);
    st.missed = false;
    $('ls-extra').querySelectorAll('.letters button').forEach(b => { b.disabled = false; b.className = ''; });
    this.markChips(st.round);
    if (s.t === 'nameNote') {
      const clef = st.clef = s.clef === 'both' ? (st.target < 60 ? 'bass' : st.target > 60 ? 'treble' : (Math.random() < .5 ? 'bass' : 'treble')) : (s.clef || 'treble');
      drawStaff($('ls-staff'), clef, st.target);
    } else {
      clearMarks('target');
      setClass(st.target, 'target');
      scrollToKey(st.target);
    }
  },
  nameAnswer(name, btn) {
    if (this.solved || this.state.wait) return;
    const s = this.cur, st = this.state;
    const right = s.sharps ? NAMES[pc(st.target)] : letterOf(st.target);
    if (name === right) {
      btn.classList.add('good');
      audio.note(st.target, 0, 0.6, 0.6);
      this.revealChip(st.round, right);
      st.round++;
      if (st.round >= s.rounds) { this.markChips(st.round); clearMarks('target'); return this.success(); }
      st.wait = true;
      this.footer(['Goed!', 'Ja!', 'Klopt!', 'Top!'][st.round % 4], null);
      if (s.t === 'nameNote') drawStaff($('ls-staff'), st.clef, st.target, 'var(--good)');
      this.later(() => { st.wait = false; this.footer('', null); this.nextNaming(); }, 550);
    } else {
      btn.classList.add('bad');
      btn.disabled = true;
      this.wrong(null, `Nee, dat is geen ${name}.` + (this.stepMistakes >= 2 ? ` Het is een ${right}.` : ''));
    }
  },

  /* ---- koppelen ---- */
  renderMatch(s, extra) {
    const grid = document.createElement('div');
    grid.className = 'match';
    const left = document.createElement('div'), right = document.createElement('div');
    this.state = { sel: null, done: 0 };
    const mk = (html, id, side) => {
      const b = document.createElement('button');
      b.innerHTML = html;
      b.dataset.id = id;
      b.dataset.side = side;
      b.addEventListener('click', () => this.matchClick(b));
      return b;
    };
    s.pairs.forEach(([a], i) => left.appendChild(mk(a, i, 'L')));
    shuffle(s.pairs.map(([, b], i) => [b, i])).forEach(([b, i]) => right.appendChild(mk(b, i, 'R')));
    // ook de linkerkolom husselen, zodat de volgorde niet hetzelfde is als de uitleg
    shuffle([...left.children]).forEach(b => left.appendChild(b));
    grid.append(left, right);
    extra.appendChild(grid);
    this.footer('', null, 'Koppel alle paren', false);
  },
  matchClick(b) {
    if (this.solved || b.disabled) return;
    const st = this.state;
    if (!st.sel || st.sel.dataset.side === b.dataset.side) {
      st.sel?.classList.remove('sel');
      st.sel = b; b.classList.add('sel');
      return;
    }
    const a = st.sel;
    a.classList.remove('sel');
    st.sel = null;
    if (a.dataset.id === b.dataset.id) {
      [a, b].forEach(x => { x.classList.add('good'); x.disabled = true; });
      audio.note(72 + st.done * 2, 0, 0.25, 0.4);
      st.done++;
      if (st.done === this.cur.pairs.length) this.success();
    } else {
      [a, b].forEach(x => { x.classList.add('bad'); setTimeout(() => x.classList.remove('bad'), 500); });
      this.wrong(null, 'Die horen niet bij elkaar.');
    }
  },

  /* ---- volgorde ---- */
  renderOrder(s, extra) {
    const slots = document.createElement('div');
    slots.className = 'order-slots';
    s.items.forEach((_, i) => {
      const sp = document.createElement('span');
      sp.dataset.i = i;
      slots.appendChild(sp);
    });
    const pool = document.createElement('div');
    pool.className = 'order-pool';
    shuffle(s.items.map((it, i) => [it, i])).forEach(([it, i]) => {
      const b = document.createElement('button');
      b.innerHTML = it;
      b.dataset.i = i;
      b.addEventListener('click', () => this.orderClick(b, i));
      pool.appendChild(b);
    });
    extra.append(slots, pool);
    this.state = { pos: 0 };
    this.footer('', null, 'Tik in de goede volgorde', false);
  },
  orderClick(b, i) {
    if (this.solved || b.disabled) return;
    const st = this.state;
    if (i === st.pos) {
      const slot = $('ls-extra').querySelector(`.order-slots span[data-i="${i}"]`);
      slot.innerHTML = b.innerHTML;
      slot.classList.add('filled');
      b.disabled = true; b.classList.add('used');
      audio.note(60 + [0, 2, 4, 5, 7, 9, 11, 12][i % 8], 0, 0.3, 0.4);
      st.pos++;
      if (st.pos === this.cur.items.length) this.success();
    } else {
      b.classList.add('bad');
      setTimeout(() => b.classList.remove('bad'), 450);
      this.wrong(null, 'Die komt nog niet. Probeer een andere.');
    }
  },

  /* ---- ritme ---- */
  renderRhythm(s, extra) {
    const wrap = document.createElement('div');
    wrap.className = 'rhythm';
    wrap.innerHTML = rhythmSVG(s.pattern, s.beats) +
      `<div class="rhythm-count" id="rh-count">Druk op <b>Start</b>, luister naar het aftellen en tik mee.</div>
       <div class="rhythm-controls">
         <button id="rh-demo" class="ghost-btn">🔊 Voorbeeld</button>
         <button id="rh-start" class="primary">▶ Start</button>
         <button id="rh-pad" class="tap-pad" disabled>TIK</button>
       </div>`;
    extra.appendChild(wrap);
    this.state = { rhythm: { phase: 'idle' } };
    wrap.querySelector('#rh-demo').onclick = () => this.rhythmRun(true);
    wrap.querySelector('#rh-start').onclick = () => this.rhythmRun(false);
    const pad = wrap.querySelector('#rh-pad');
    pad.addEventListener('pointerdown', e => { e.preventDefault(); this.rhythmTap(); });
    this.footer('', null, 'Tik het ritme', false);
  },
  rhythmRun(demo) {
    const s = this.cur, R = this.state.rhythm;
    if (R.phase !== 'idle') return;
    this.timers.forEach(clearTimeout); this.timers = [];
    document.activeElement?.blur(); // anders 'klikt' de spatiebalk op de knop
    const ctx = audio.ensure();
    const beat = 60 / s.bpm;
    const lat = (ctx.outputLatency || 0) + (ctx.baseLatency || 0);
    const t0 = ctx.currentTime + 0.25;
    const start = t0 + s.beats * beat;               // eerste tel van het ritme
    const total = s.pattern.reduce((a, d) => a + Math.abs(d), 0);
    const onsets = [];
    let acc = 0;
    s.pattern.forEach(d => { if (d > 0) onsets.push(start + acc * beat); acc += Math.abs(d); });
    const minDur = Math.min(...s.pattern.map(Math.abs));
    Object.assign(R, { phase: demo ? 'demo' : 'count', onsets, hit: onsets.map(() => false), extra: 0, lat, tol: Math.min(0.2, minDur * beat * 0.45) });
    const glyphs = [...$('ls-extra').querySelectorAll('.rg[data-i]')];
    glyphs.forEach(g => g.classList.remove('hit', 'miss', 'now'));
    $('ls-extra').querySelectorAll('.rhythm-controls button:not(.tap-pad)').forEach(b => (b.disabled = true));
    $('rh-pad').disabled = demo;
    const count = $('rh-count');
    // aftellen + metronoom tijdens het ritme
    const nBeats = s.beats + Math.ceil(total);
    for (let b = 0; b < nBeats; b++) {
      const t = t0 + b * beat;
      audio.click(t, b % s.beats === 0);
      this.later(() => {
        if (b < s.beats) { count.innerHTML = `<span class="big">${b + 1}</span>`; }
        else { count.innerHTML = `<span class="big muted">${((b - s.beats) % s.beats) + 1}</span>`; if (b === s.beats) R.phase = demo ? 'demo' : 'play'; }
      }, (t - ctx.currentTime) * 1000);
    }
    let a2 = 0;
    s.pattern.forEach(d => {
      if (d > 0) {
        const t = start + a2 * beat;
        const idx = onsets.indexOf(t);
        if (demo) audio.note(72, t - ctx.currentTime, Math.max(0.15, d * beat * 0.85), 0.6);
        this.later(() => glyphs[idx]?.classList.add('now'), (t - ctx.currentTime) * 1000);
        this.later(() => glyphs[idx]?.classList.remove('now'), (t - ctx.currentTime + Math.min(0.25, d * beat * 0.8)) * 1000);
      }
      a2 += Math.abs(d);
    });
    const end = start + total * beat;
    this.later(() => this.rhythmEnd(demo), (end - ctx.currentTime + 0.35) * 1000);
  },
  rhythmTap() {
    const R = this.state?.rhythm;
    if (!R || this.solved) return;
    const pad = $('rh-pad');
    if (pad) { pad.classList.remove('pulse'); void pad.offsetWidth; pad.classList.add('pulse'); }
    if (R.phase !== 'play' && R.phase !== 'count') return;
    const ctx = audio.ctx;
    const t = ctx.currentTime - R.lat;  // tik vergelijken met wat je hoort
    audio.note(84, 0, 0.12, 0.35);
    let best = -1, bestD = Infinity;
    R.onsets.forEach((o, i) => { const d = Math.abs(o - t); if (!R.hit[i] && d < bestD) { bestD = d; best = i; } });
    const glyphs = $('ls-extra').querySelectorAll('.rg[data-i]');
    if (best >= 0 && bestD <= R.tol) {
      R.hit[best] = true;
      glyphs[best]?.classList.add('hit');
    } else {
      R.extra++;
    }
  },
  rhythmEnd(demo) {
    const R = this.state.rhythm;
    if (!R || R.phase === 'idle') return;
    R.phase = 'idle';
    $('ls-extra').querySelectorAll('.rhythm-controls button').forEach(b => (b.disabled = false));
    $('rh-pad').disabled = true;
    const count = $('rh-count');
    if (demo) { count.textContent = 'Nu jij! Druk op Start en tik mee.'; return; }
    const glyphs = $('ls-extra').querySelectorAll('.rg[data-i]');
    R.hit.forEach((h, i) => { if (!h) glyphs[i]?.classList.add('miss'); });
    const good = R.hit.filter(Boolean).length;
    if (good === R.onsets.length && R.extra === 0) {
      count.textContent = 'Precies op tijd!';
      this.success('Strak ritme!');
    } else {
      count.textContent = `${good} van ${R.onsets.length} op tijd` + (R.extra ? `, ${R.extra} tik${R.extra > 1 ? 'ken' : ''} te veel` : '') + '.';
      this.wrong(null, this.stepMistakes >= 1 ? 'Tip: luister eerst naar het voorbeeld en tel hardop mee.' : 'Bijna! Probeer het nog eens.');
    }
  },

  /* ---- afronden ---- */
  success(msg) {
    this.solved = true;
    clearMarks('target');
    const praise = ['Goed zo!', 'Top!', 'Super!', 'Geweldig!', 'Uitstekend!', 'Netjes!', 'Knap!'];
    this.footer('✓ ' + (msg || praise[Math.floor(Math.random() * praise.length)]), 'good', 'Verder', true);
  },
  footer(msg, cls, btnText, enabled) {
    $('lesson-footer').className = 'lesson-footer' + (cls ? ' ' + cls : '');
    $('ls-feedback').textContent = msg;
    if (btnText !== undefined) {
      const b = $('ls-continue');
      b.textContent = btnText;
      b.disabled = !enabled;
    }
  },
  next() {
    if (!this.l || !this.solved) return;
    this.step++;
    if (this.step >= this.l.steps.length) return this.finish();
    this.render();
  },
  finish() {
    this.cleanup();
    this.solved = false;
    showPiano(false);
    const stars = this.mistakes <= 1 ? 3 : this.mistakes <= 4 ? 2 : 1;
    const xp = 10 + stars * 5;
    const wasDone = !!progress.data.stars[this.l.id];
    progress.complete(this.l.id, stars, xp);
    $('lesson-progress').style.width = '100%';
    $('lesson-view').hidden = true;
    $('lesson-done').hidden = false;
    $('done-title').textContent = this.mistakes === 0 ? 'Perfect!' : stars === 3 ? 'Super gedaan!' : 'Les voltooid!';
    $('done-stars').innerHTML = starHTML(stars);
    const streak = progress.currentStreak();
    const nextL = ALL_LESSONS[this.i + 1];
    $('done-text').innerHTML = `+${xp} XP · ${this.mistakes} ${this.mistakes === 1 ? 'fout' : 'fouten'}` +
      `<br>🔥 ${streak} ${streak === 1 ? 'dag' : 'dagen'} op rij geoefend` +
      (!wasDone && nextL ? `<br>🔓 Nieuwe les: <b>${nextL.title}</b>` : '') +
      (nextL && nextL.unit !== this.l.unit && !wasDone ? `<br>🎉 Nieuwe eenheid: <b>${UNITS[nextL.unit].title}</b>` : '');
    $('done-next').textContent = nextL ? 'Volgende les' : 'Naar het leerpad';
    [72, 76, 79, 84].forEach((m, k) => audio.note(m, k * 0.12, 0.3, 0.5)); // klein feestdeuntje
  },
};

$('ls-continue').addEventListener('click', () => lesson.next());
$('lesson-close').addEventListener('click', () => lesson.close());
$('done-retry').addEventListener('click', () => lesson.open(lesson.i));
$('done-next').addEventListener('click', () => {
  if (lesson.i + 1 < ALL_LESSONS.length) lesson.open(lesson.i + 1);
  else lesson.close();
});
window.addEventListener('keydown', e => {
  if (currentTab !== 'lessons' || !lesson.l || e.repeat) return;
  if (['INPUT', 'SELECT'].includes(document.activeElement?.tagName)) return;
  const s = lesson.cur;
  if (e.key === 'Enter') { e.preventDefault(); if (!$('lesson-done').hidden) $('done-next').click(); else lesson.next(); return; }
  if (s?.t === 'rhythm' && e.key === ' ') { e.preventDefault(); lesson.rhythmTap(); return; }
  const n = parseInt(e.key, 10);
  if (s?.t === 'choice' && n >= 1 && n <= s.options.length) {
    lesson.answer(n - 1, $('ls-extra').querySelectorAll('.choices button')[n - 1]);
  }
});
listeners.add(m => { if (currentTab === 'lessons') lesson.onNote(m); });
tabStops.lessons = () => { if (lesson.l) lesson.close(); else lesson.cleanup(); showPiano(true); };
tabStarts.lessons = () => { showPiano(false); renderPath(); };

showPiano(false);
renderPath();

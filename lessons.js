'use strict';
/*
 * Lessen in Duolingo-stijl: een leerpad met eenheden, elke les bestaat uit korte stappen.
 *
 * Staptypes:
 *   info   – uitleg; optioneel `keys` (toetsen markeren), `staff` ({clef, note}) en `sound`
 *   play   – speel `notes` in volgorde; `hint: false` = zonder oplichtende toets, `anyOctave` = octaaf maakt niet uit
 *   chord  – speel alle `notes` (tegelijk of na elkaar, volgorde maakt niet uit)
 *   choice – meerkeuzevraag: `options`, `answer` (index); optioneel `staff`, `keys`, `sound`
 *   read   – toon `notes` één voor één op de notenbalk; speel ze
 *   ear    – luister en speel na: `pool` (mogelijke noten), `rounds`
 */

const UNITS = [
  {
    title: 'Het klavier ontdekken', desc: 'Witte en zwarte toetsen, en de namen van de noten.',
    color: '#3a9a5b', dark: '#2c7a47',
    lessons: [
      { id: 'u1l1', title: 'Witte en zwarte toetsen', icon: '🎹', steps: [
        { t: 'info', title: 'Welkom!', text: 'Een piano heeft witte en zwarte toetsen. Druk maar eens op een paar toetsen hieronder.' },
        { t: 'info', text: 'De zwarte toetsen staan in groepjes. Hier zie je een groepje van <b>twee</b> zwarte toetsen.', keys: ['C#4', 'D#4'] },
        { t: 'info', text: 'En hier een groepje van <b>drie</b> zwarte toetsen. Twee, drie, twee, drie… zo gaat het het hele klavier over.', keys: ['F#4', 'G#4', 'A#4'] },
        { t: 'play', text: 'Speel het groepje van twee zwarte toetsen.', notes: ['C#4', 'D#4'] },
        { t: 'play', text: 'Speel nu het groepje van drie.', notes: ['F#4', 'G#4', 'A#4'] },
        { t: 'choice', text: 'Hoeveel zwarte toetsen zitten er in het kleinste groepje?', options: ['Eén', 'Twee', 'Drie'], answer: 1 },
      ] },
      { id: 'u1l2', title: 'De C vinden', icon: '🔍', steps: [
        { t: 'info', text: 'De <b>C</b> is de witte toets direct <b>links van een groepje van twee</b> zwarte toetsen.', keys: ['C4'] },
        { t: 'play', text: 'Speel de C.', notes: ['C4'] },
        { t: 'info', text: 'Er zijn meerdere C\'s op de piano. De C in het midden heet de <b>centrale C</b>.', keys: ['C3', 'C4', 'C5', 'C6'] },
        { t: 'play', text: 'Speel alle C\'s, van laag naar hoog.', notes: ['C3', 'C4', 'C5', 'C6'] },
        { t: 'choice', text: 'Waar vind je de C?', options: ['Links van twee zwarte toetsen', 'Rechts van twee zwarte toetsen', 'Links van drie zwarte toetsen'], answer: 0 },
        { t: 'play', text: 'Vind een C zonder hulp. Welke C maakt niet uit.', notes: ['C4'], hint: false, anyOctave: true },
      ] },
      { id: 'u1l3', title: 'D en E', icon: '🎯', steps: [
        { t: 'info', text: 'Na de C komt de <b>D</b>. Die zit precies <b>tussen</b> de twee zwarte toetsen.', keys: ['D4'] },
        { t: 'play', text: 'Speel de D.', notes: ['D4'] },
        { t: 'info', text: 'Daarna komt de <b>E</b>, rechts van het groepje van twee.', keys: ['E4'] },
        { t: 'play', text: 'Speel de E.', notes: ['E4'] },
        { t: 'play', text: 'Speel C – D – E.', notes: ['C4', 'D4', 'E4'] },
        { t: 'choice', text: 'Welke witte toets zit tussen de twee zwarte toetsen?', options: ['C', 'D', 'E'], answer: 1 },
        { t: 'play', text: 'Nu zonder hulp: E – D – C.', notes: ['E4', 'D4', 'C4'], hint: false },
      ] },
      { id: 'u1l4', title: 'F, G, A en B', icon: '🔤', steps: [
        { t: 'info', text: 'De <b>F</b> zit links van het groepje van <b>drie</b> zwarte toetsen.', keys: ['F4'] },
        { t: 'play', text: 'Speel de F.', notes: ['F4'] },
        { t: 'info', text: 'Daarna komen <b>G</b>, <b>A</b> en <b>B</b>. Na de B begint het alfabet opnieuw bij C.', keys: ['G4', 'A4', 'B4'] },
        { t: 'play', text: 'Speel F – G – A – B – C.', notes: ['F4', 'G4', 'A4', 'B4', 'C5'] },
        { t: 'choice', text: 'Welke noot komt na de G?', options: ['F', 'A', 'C'], answer: 1 },
        { t: 'play', text: 'Speel de hele rij: C D E F G A B C.', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
        { t: 'play', text: 'Vind de G zonder hulp.', notes: ['G4'], hint: false, anyOctave: true },
        { t: 'play', text: 'En de A?', notes: ['A4'], hint: false, anyOctave: true },
      ] },
    ],
  },
  {
    title: 'Eerste melodietjes', desc: 'Je rechterhand in positie en je eerste liedjes.',
    color: '#3a6ea5', dark: '#2c5684',
    lessons: [
      { id: 'u2l1', title: 'Handpositie in C', icon: '✋', steps: [
        { t: 'info', text: 'Leg je rechterhand op C D E F G. Je vingers hebben nummers: <b>1</b> = duim, <b>2</b> = wijsvinger, <b>3</b> = middelvinger, <b>4</b> = ringvinger, <b>5</b> = pink.', keys: ['C4', 'D4', 'E4', 'F4', 'G4'] },
        { t: 'play', text: 'Speel omhoog: 1 2 3 4 5.', notes: ['C4', 'D4', 'E4', 'F4', 'G4'] },
        { t: 'play', text: 'En weer omlaag: 5 4 3 2 1.', notes: ['G4', 'F4', 'E4', 'D4', 'C4'] },
        { t: 'choice', text: 'Welke vinger speelt de E in deze handpositie?', options: ['1 – duim', '3 – middelvinger', '5 – pink'], answer: 1 },
        { t: 'play', text: 'Speel met vinger 1, 3 en 5: C – E – G.', notes: ['C4', 'E4', 'G4'] },
        { t: 'play', text: 'Zonder hulp: C D E F G.', notes: ['C4', 'D4', 'E4', 'F4', 'G4'], hint: false },
      ] },
      { id: 'u2l2', title: 'Mary Had a Little Lamb', icon: '🐑', steps: [
        { t: 'info', text: 'We leren een bekend liedje in kleine stukjes. Luister eerst naar het begin.', sound: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'] },
        { t: 'play', text: 'Speel het eerste stukje.', notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'] },
        { t: 'play', text: 'Het tweede stukje.', notes: ['D4', 'D4', 'D4', 'E4', 'G4', 'G4'] },
        { t: 'play', text: 'En het slot.', notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'E4', 'D4', 'D4', 'E4', 'D4', 'C4'] },
        { t: 'play', text: 'Kun je het begin zonder hulp?', notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4'], hint: false },
      ] },
      { id: 'u2l3', title: 'Ode an die Freude', icon: '🎶', steps: [
        { t: 'info', text: 'Dit melodietje schreef Beethoven. Luister maar.', sound: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'] },
        { t: 'play', text: 'Speel de eerste helft.', notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4'] },
        { t: 'play', text: 'De tweede helft.', notes: ['C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'] },
        { t: 'play', text: 'Nu het hele stuk, met een ander slot.', notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'D4', 'C4', 'C4'] },
        { t: 'play', text: 'De eerste helft zonder hulp.', notes: ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4'], hint: false },
      ] },
      { id: 'u2l4', title: 'Vader Jacob', icon: '🔔', steps: [
        { t: 'info', text: 'Ken je Vader Jacob? Luister naar het begin.', sound: ['C4', 'D4', 'E4', 'C4', 'C4', 'D4', 'E4', 'C4'] },
        { t: 'play', text: '"Vader Jacob, Vader Jacob"', notes: ['C4', 'D4', 'E4', 'C4', 'C4', 'D4', 'E4', 'C4'] },
        { t: 'play', text: '"Slaapt gij nog? Slaapt gij nog?"', notes: ['E4', 'F4', 'G4', 'E4', 'F4', 'G4'] },
        { t: 'play', text: '"Alle klokken luiden" (je hand schuift even op naar de A)', notes: ['G4', 'A4', 'G4', 'F4', 'E4', 'C4'] },
        { t: 'play', text: '"Bim bam bom" – de lage G ligt links van de C.', notes: ['C4', 'G3', 'C4'] },
        { t: 'play', text: 'Het begin zonder hulp.', notes: ['C4', 'D4', 'E4', 'C4', 'C4', 'D4', 'E4', 'C4'], hint: false },
      ] },
    ],
  },
  {
    title: 'Noten lezen', desc: 'De notenbalk, lijnen en tussenruimtes.',
    color: '#8a5cc2', dark: '#6b43a0',
    lessons: [
      { id: 'u3l1', title: 'De notenbalk', icon: '🎼', steps: [
        { t: 'info', text: 'Muziek schrijf je op een <b>notenbalk</b> met vijf lijnen. Een noot staat óp een lijn of tússen twee lijnen. Hoe hoger de noot, hoe hoger de toon.', staff: { clef: 'treble', note: 'G4' } },
        { t: 'info', text: 'Het krulletje vooraan is de <b>vioolsleutel</b>. Die gebruik je meestal voor je rechterhand.', staff: { clef: 'treble' } },
        { t: 'info', text: 'Dit is de <b>centrale C</b>. Hij staat op een klein hulplijntje onder de notenbalk.', staff: { clef: 'treble', note: 'C4' }, keys: ['C4'] },
        { t: 'read', text: 'Speel de noot die je ziet.', notes: ['C4', 'D4', 'E4'] },
        { t: 'choice', text: 'Welke noot is dit? (tip: één stapje boven de D)', staff: { clef: 'treble', note: 'E4' }, options: ['C', 'E', 'G'], answer: 1 },
      ] },
      { id: 'u3l2', title: 'Lijnen: E G B D F', icon: '📏', steps: [
        { t: 'info', text: 'De vijf lijnen zijn van onder naar boven: <b>E – G – B – D – F</b>. Ezelsbruggetje: "<b>E</b>lke <b>G</b>oede <b>B</b>akker <b>D</b>oet <b>F</b>ijn werk".', staff: { clef: 'treble', note: 'E4' } },
        { t: 'read', text: 'Speel de noten op de lijnen.', notes: ['E4', 'G4', 'B4', 'D5', 'F5'] },
        { t: 'choice', text: 'Welke noot staat op de middelste lijn?', staff: { clef: 'treble', note: 'B4' }, options: ['G', 'B', 'D'], answer: 1 },
        { t: 'read', text: 'Nu door elkaar.', notes: ['G4', 'E4', 'D5', 'B4', 'F5'] },
      ] },
      { id: 'u3l3', title: 'Tussenruimtes: F A C E', icon: '🧩', steps: [
        { t: 'info', text: 'De vier ruimtes tussen de lijnen spellen samen het woord <b>FACE</b> (van onder naar boven).', staff: { clef: 'treble', note: 'F4' } },
        { t: 'read', text: 'Speel de noten in de tussenruimtes.', notes: ['F4', 'A4', 'C5', 'E5'] },
        { t: 'choice', text: 'Welke noot is dit?', staff: { clef: 'treble', note: 'A4' }, options: ['F', 'A', 'C'], answer: 1 },
        { t: 'read', text: 'Lijnen en ruimtes door elkaar!', notes: ['C4', 'E4', 'G4', 'A4', 'C5', 'D5', 'F4', 'B4'] },
      ] },
    ],
  },
  {
    title: 'Zwarte toetsen & akkoorden', desc: 'Kruisen, mollen en je eerste akkoorden.',
    color: '#d9822b', dark: '#b0651a',
    lessons: [
      { id: 'u4l1', title: 'Kruis en mol', icon: '♯', steps: [
        { t: 'info', text: 'Een <b>kruis (♯)</b> maakt een noot een halve toon hoger: de toets er direct rechts van. C♯ is dus de zwarte toets rechts van C.', keys: ['C4', 'C#4'] },
        { t: 'play', text: 'Speel C♯.', notes: ['C#4'] },
        { t: 'play', text: 'Speel F♯.', notes: ['F#4'] },
        { t: 'info', text: 'Een <b>mol (♭)</b> maakt een noot een halve toon lager. B♭ is de zwarte toets links van B. Dezelfde zwarte toets heeft dus twee namen: A♯ = B♭.', keys: ['B4', 'A#4'] },
        { t: 'play', text: 'Speel B♭.', notes: ['A#4'] },
        { t: 'choice', text: 'Welke naam hoort bij dezelfde toets als D♯?', options: ['E♭', 'C♭', 'F♯'], answer: 0 },
        { t: 'play', text: 'Vind F♯ zonder hulp.', notes: ['F#4'], hint: false, anyOctave: true },
      ] },
      { id: 'u4l2', title: 'Je eerste akkoorden', icon: '🎹', steps: [
        { t: 'info', text: 'Een <b>akkoord</b> is een paar noten die samen klinken. C-majeur bestaat uit <b>C, E en G</b>.', keys: ['C4', 'E4', 'G4'], sound: ['C4', 'E4', 'G4'], chord: true },
        { t: 'chord', text: 'Speel C-majeur: C, E en G (tegelijk of na elkaar).', notes: ['C4', 'E4', 'G4'] },
        { t: 'info', text: 'Schuif op naar <b>F-majeur</b>: F, A en C.', keys: ['F4', 'A4', 'C5'], sound: ['F4', 'A4', 'C5'], chord: true },
        { t: 'chord', text: 'Speel F-majeur.', notes: ['F4', 'A4', 'C5'] },
        { t: 'info', text: 'En <b>G-majeur</b>: G, B en D.', keys: ['G4', 'B4', 'D5'], sound: ['G4', 'B4', 'D5'], chord: true },
        { t: 'chord', text: 'Speel G-majeur.', notes: ['G4', 'B4', 'D5'] },
        { t: 'choice', text: 'Uit welke noten bestaat C-majeur?', options: ['C – D – E', 'C – E – G', 'C – F – A'], answer: 1 },
      ] },
      { id: 'u4l3', title: 'Spelen op gehoor', icon: '👂', steps: [
        { t: 'info', text: 'Je hoort eerst een C als <b>referentie</b>, daarna een andere noot. Zoek die noot op het klavier. De mogelijke toetsen zijn gemarkeerd.' },
        { t: 'ear', text: 'Welke noot hoor je? (C, E of G)', pool: ['C4', 'E4', 'G4'], rounds: 3 },
        { t: 'ear', text: 'Nu iets moeilijker: C, D, E, F of G.', pool: ['C4', 'D4', 'E4', 'F4', 'G4'], rounds: 3 },
        { t: 'choice', text: 'Welke klinkt hoger?', options: ['De eerste noot', 'De tweede noot'], answer: 1, sound: ['E4', 'A4'] },
      ] },
    ],
  },
];

const ALL_LESSONS = UNITS.flatMap((u, ui) => u.lessons.map(l => ({ ...l, unit: ui })));

/* ================= Voortgang ================= */
const progress = {
  data: store.get('lessons', { stars: {}, xp: 0, streak: 0, lastDay: null }),
  save() { store.set('lessons', this.data); },
  today() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; },
  yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; },
  currentStreak() {
    const { lastDay, streak } = this.data;
    return (lastDay === this.today() || lastDay === this.yesterday()) ? streak : 0;
  },
  complete(id, stars, xp) {
    const d = this.data;
    d.stars[id] = Math.max(d.stars[id] || 0, stars);
    d.xp += xp;
    const t = this.today();
    if (d.lastDay !== t) {
      d.streak = d.lastDay === this.yesterday() ? d.streak + 1 : 1;
      d.lastDay = t;
    }
    this.save();
  },
  isUnlocked(i) { return i === 0 || (this.data.stars[ALL_LESSONS[i - 1].id] || 0) > 0; },
};

/* ================= Leerpad ================= */
const $ = id => document.getElementById(id);
const ZIGZAG = [0, 55, 80, 55, 0, -55, -80, -55];

function renderPath() {
  const path = $('path');
  path.innerHTML = '';
  let idx = 0;
  let current = ALL_LESSONS.findIndex(l => !progress.data.stars[l.id]);
  UNITS.forEach((u, ui) => {
    const unit = document.createElement('div');
    unit.className = 'unit';
    unit.style.setProperty('--c', u.color);
    unit.style.setProperty('--cd', u.dark);
    unit.innerHTML = `<div class="unit-banner" style="background:${u.color}">
      <small>Eenheid ${ui + 1}</small><h3>${u.title}</h3><p>${u.desc}</p></div>`;
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
      const title = document.createElement('div');
      title.className = 'node-title';
      title.textContent = l.title;
      node.appendChild(title);
      const st = document.createElement('div');
      st.className = 'node-stars';
      st.innerHTML = unlocked ? starHTML(stars) : '';
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
  if (current >= 0) {
    // scroll de huidige les in beeld
    requestAnimationFrame(() => path.querySelector('.node.current')?.scrollIntoView({ block: 'center' }));
  }
}
const starHTML = n => [0, 1, 2].map(i => `<span class="${i < n ? '' : 'star-off'}">⭐</span>`).join('');

/* ================= Les-speler ================= */
const lesson = {
  i: -1, l: null, step: 0, mistakes: 0, stepMistakes: 0, state: null, solved: false,
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
    renderPath();
  },
  timers: [],
  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },
  cleanup() {
    clearMarks('mark', 'target');
    this.timers.forEach(clearTimeout);
    this.timers = [];
  },
  get cur() { return this.l.steps[this.step]; },
  render() {
    this.cleanup();
    const s = this.cur;
    this.solved = false; this.stepMistakes = 0; this.state = {};
    $('lesson-progress').style.width = (100 * this.step / this.l.steps.length) + '%';
    $('lesson-mistakes').textContent = '❌ ' + this.mistakes;
    $('ls-title').innerHTML = s.title || '';
    $('ls-title').hidden = !s.title;
    $('ls-text').innerHTML = s.text;
    const extra = $('ls-extra');
    extra.innerHTML = '';
    const staff = $('ls-staff');
    // SVG-elementen kennen de .hidden-eigenschap niet, dus via het attribuut
    const showStaff = on => staff.toggleAttribute('hidden', !on);
    showStaff(false);
    this.footer('', null);

    // geluid
    const sound = $('ls-sound');
    sound.hidden = !s.sound && s.t !== 'ear';
    sound.textContent = s.t === 'ear' ? '🔊 Nog een keer' : '🔊 Luister';
    sound.onclick = () => this.playSound();
    if (s.sound) this.later(() => this.playSound(), 350);

    if (s.keys) s.keys.forEach(k => setClass(parseNote(k), 'mark'));
    if (s.staff) { showStaff(true); drawStaff(staff, s.staff.clef, s.staff.note ? parseNote(s.staff.note) : null); }
    if (s.keys?.length) scrollToKey(parseNote(s.keys[0]));

    switch (s.t) {
      case 'info':
        this.solved = true;
        this.footer('', null, 'Verder', true);
        break;
      case 'play':
        this.state = { pos: 0, notes: s.notes.map(parseNote) };
        if (s.notes.length > 1) extra.appendChild(this.chips(s.notes, s.hint === false));
        this.showTarget();
        this.footer('', null, 'Speel de noot…', false);
        break;
      case 'chord':
        this.state = { notes: s.notes.map(parseNote), got: new Set() };
        extra.appendChild(this.chips(s.notes));
        this.state.notes.forEach(m => setClass(m, 'target'));
        scrollToKey(this.state.notes[1]);
        this.footer('', null, 'Speel het akkoord…', false);
        break;
      case 'read':
        this.state = { pos: 0, notes: s.notes.map(parseNote) };
        showStaff(true);
        this.showRead();
        this.footer('', null, 'Speel de noot…', false);
        break;
      case 'ear':
        this.state = { round: 0, pool: s.pool.map(parseNote) };
        this.state.pool.forEach(m => setClass(m, 'mark'));
        scrollToKey(this.state.pool[0]);
        extra.appendChild(this.chips(Array(s.rounds).fill('?'), true));
        this.newEar();
        this.footer('', null, 'Speel de noot…', false);
        break;
      case 'choice': {
        const box = document.createElement('div');
        box.className = 'choices';
        s.options.forEach((o, oi) => {
          const b = document.createElement('button');
          b.innerHTML = `${oi + 1}. ${o}`;
          b.addEventListener('click', () => this.answer(oi, b));
          box.appendChild(b);
        });
        extra.appendChild(box);
        this.footer('', null, 'Kies een antwoord', false);
        break;
      }
    }
    $('lesson-view').querySelector('.lesson-body').classList.toggle('text-only', !extra.children.length && staff.hasAttribute('hidden'));
  },
  chips(names, hidden = false) {
    const seq = document.createElement('div');
    seq.className = 'sequence';
    names.forEach((n, i) => {
      const sp = document.createElement('span');
      sp.dataset.i = i;
      sp.dataset.name = n;
      sp.textContent = hidden ? '?' : (n === '?' ? '?' : noteName(parseNote(n)));
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
  revealChip(i, m) {
    const sp = $('ls-extra').querySelector(`.sequence span[data-i="${i}"]`);
    if (sp) sp.textContent = noteName(m);
  },
  showTarget() {
    clearMarks('target');
    const { pos, notes } = this.state;
    if (pos >= notes.length) return;
    const showHint = this.cur.hint !== false || this.stepMistakes >= 2;
    if (showHint) setClass(notes[pos], 'target');
    if (this.cur.hint !== false || pos === 0) scrollToKey(notes[pos]);
    this.markChips(pos);
  },
  showRead() {
    const { pos, notes } = this.state;
    drawStaff($('ls-staff'), 'treble', notes[pos]);
    clearMarks('target');
    if (this.stepMistakes >= 2) setClass(notes[pos], 'target');
  },
  newEar() {
    const { pool } = this.state;
    let m;
    do { m = pool[Math.floor(Math.random() * pool.length)]; } while (m === this.state.target && pool.length > 1);
    this.state.target = m;
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
    const notes = s.sound.map(parseNote);
    if (s.chord) { notes.forEach(m => audio.note(m, 0, 1.5, 0.6)); return; }
    notes.forEach((m, i) => {
      audio.note(m, i * 0.45, 0.45);
      setTimeout(() => { if (this.l) flashKey(m, 'active', 380); }, i * 450);
    });
  },
  wrong(m, msg) {
    this.mistakes++; this.stepMistakes++;
    $('lesson-mistakes').textContent = '❌ ' + this.mistakes;
    flashKey(m, 'bad', 350);
    this.footer(msg, 'bad', $('ls-continue').textContent, false);
  },
  onNote(m) {
    if (!this.l || this.solved) return;
    const s = this.cur;
    const st = this.state;
    const same = (a, b, any) => any ? pc(a) === pc(b) : a === b;
    if (s.t === 'play') {
      const want = st.notes[st.pos];
      if (same(m, want, s.anyOctave)) {
        flashKey(m, 'good', 250);
        if (s.hint === false) this.revealChip(st.pos, want);
        st.pos++;
        if (st.pos >= st.notes.length) { this.markChips(st.pos); return this.success(); }
        this.footer('', null, 'Speel de noot…', false);
        this.showTarget();
      } else {
        this.wrong(m, `Dat was ${noteName(m)}. ${this.stepMistakes >= 1 ? 'Kijk naar de oplichtende toets.' : 'Probeer opnieuw!'}`);
        this.showTarget();
      }
    } else if (s.t === 'chord') {
      if (st.notes.includes(m)) {
        st.got.add(m);
        setClass(m, 'target', false);
        flashKey(m, 'good', 250);
        const sp = $('ls-extra').querySelector(`.sequence span[data-i="${st.notes.indexOf(m)}"]`);
        sp?.classList.add('done');
        if (st.got.size === st.notes.length) {
          st.notes.forEach(n => audio.note(n, 0.25, 1.2, 0.5));
          this.success('Mooi akkoord!');
        }
      } else {
        this.wrong(m, `${noteName(m)} hoort niet in dit akkoord.`);
      }
    } else if (s.t === 'read') {
      const want = st.notes[st.pos];
      if (pc(m) === pc(want)) {
        flashKey(m, 'good', 250);
        drawStaff($('ls-staff'), 'treble', want, 'var(--good)');
        st.pos++;
        this.stepMistakes = 0;
        if (st.pos >= st.notes.length) return this.success();
        this.footer(`Ja, dat is ${noteName(want)}!`, null, 'Speel de noot…', false);
        this.later(() => this.showRead(), 450);
      } else {
        this.wrong(m, this.stepMistakes >= 1 ? `Het is een ${noteName(want)}. Zie je de oplichtende toets?` : `Dat was ${noteName(m)}. Tel de lijnen nog eens.`);
        if (this.stepMistakes >= 2) setClass(want, 'target');
      }
    } else if (s.t === 'ear') {
      if (pc(m) === pc(st.target)) {
        flashKey(m, 'good', 300);
        clearMarks('target');
        this.revealChip(st.round, st.target);
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
  answer(oi, btn) {
    if (this.solved) return;
    const s = this.cur;
    const buttons = [...$('ls-extra').querySelectorAll('.choices button')];
    buttons.forEach(b => (b.disabled = true));
    buttons[s.answer].classList.add('good');
    if (oi === s.answer) this.success();
    else {
      btn.classList.add('bad');
      this.mistakes++;
      $('lesson-mistakes').textContent = '❌ ' + this.mistakes;
      this.solved = true;
      this.footer(`Juiste antwoord: ${s.options[s.answer]}`, 'bad', 'Verder', true);
    }
  },
  success(msg) {
    this.solved = true;
    clearMarks('target');
    const praise = ['Goed zo!', 'Top!', 'Super!', 'Geweldig!', 'Uitstekend!', 'Netjes!'];
    this.footer('✓ ' + (msg || praise[Math.floor(Math.random() * praise.length)]), 'good', 'Verder', true);
  },
  footer(msg, cls, btnText, enabled) {
    const f = $('lesson-footer');
    f.className = 'lesson-footer' + (cls ? ' ' + cls : '');
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
    this.solved = false; // voorkomt dat 'Verder' nog eens wordt uitgevoerd
    const stars = this.mistakes === 0 ? 3 : this.mistakes <= 3 ? 2 : 1;
    const xp = 10 + stars * 5;
    const wasDone = !!progress.data.stars[this.l.id];
    progress.complete(this.l.id, stars, xp);
    $('lesson-progress').style.width = '100%';
    $('lesson-view').hidden = true;
    $('lesson-done').hidden = false;
    $('done-title').textContent = stars === 3 ? 'Perfect!' : 'Les voltooid!';
    $('done-stars').innerHTML = starHTML(stars);
    const streak = progress.currentStreak();
    $('done-text').innerHTML = `+${xp} XP · ${this.mistakes} ${this.mistakes === 1 ? 'fout' : 'fouten'}` +
      `<br>🔥 ${streak} ${streak === 1 ? 'dag' : 'dagen'} op rij geoefend` +
      (!wasDone && this.i + 1 < ALL_LESSONS.length ? `<br>🔓 Nieuwe les: <b>${ALL_LESSONS[this.i + 1].title}</b>` : '');
    $('done-next').textContent = this.i + 1 < ALL_LESSONS.length ? 'Volgende les' : 'Naar het leerpad';
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
  if (currentTab !== 'lessons' || !lesson.l) return;
  if (e.key === 'Enter') { e.preventDefault(); lesson.next(); }
  const n = parseInt(e.key, 10);
  if (lesson.cur?.t === 'choice' && n >= 1 && n <= lesson.cur.options.length) {
    lesson.answer(n - 1, $('ls-extra').querySelectorAll('.choices button')[n - 1]);
  }
});
listeners.add(m => { if (currentTab === 'lessons') lesson.onNote(m); });
tabStops.lessons = () => { if (lesson.l) lesson.close(); else lesson.cleanup(); };
tabStarts.lessons = () => renderPath();

renderPath();

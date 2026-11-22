'use strict';

/* ================= Basis: noten ================= */
const LOW = 48;   // C3
const HIGH = 84;  // C6
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const SOLFEGE = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
const BLACK = new Set([1, 3, 6, 8, 10]);
const isBlack = m => BLACK.has(m % 12);
const octaveOf = m => Math.floor(m / 12) - 1;
const pc = m => ((m % 12) + 12) % 12;

let labelMode = 'letters';
const noteName = (m, withOctave = false) => {
  if (labelMode === 'solfege') return SOLFEGE[pc(m)] + (withOctave ? octaveOf(m) : '');
  return NAMES[pc(m)] + (withOctave ? octaveOf(m) : '');
};
// "C4", "F#3", "Bb4" -> midi
function parseNote(s) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(s);
  if (!m) throw new Error('Ongeldige noot: ' + s);
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]];
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return (parseInt(m[3], 10) + 1) * 12 + base + acc;
}

/* ================= Opslag ================= */
const store = {
  get(k, d) { try { const v = localStorage.getItem('piano.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('piano.' + k, JSON.stringify(v)); } catch { /* negeren */ } },
};

/* ================= Geluid ================= */
const audio = {
  ctx: null, master: null, volume: store.get('volume', 0.7),
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      const comp = this.ctx.createDynamicsCompressor();
      this.master.connect(comp).connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  setVolume(v) { this.volume = v; if (this.master) this.master.gain.value = v; store.set('volume', v); },
  // Eenvoudige piano-achtige klank: een paar boventonen met snelle aanslag en uitsterven.
  note(midi, when = 0, dur = 1.2, vel = 0.8) {
    const ctx = this.ensure();
    const t = ctx.currentTime + when;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const out = ctx.createGain();
    const decay = 2.5 * Math.pow(0.97, midi - 48); // lage noten klinken langer
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(0.35 * vel, t + 0.005);
    out.gain.exponentialRampToValueAtTime(0.12 * vel, t + 0.25);
    out.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, 0.3) + decay * 0.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(f * 8, 12000), t);
    filter.frequency.exponentialRampToValueAtTime(Math.min(f * 3, 8000), t + 0.6);
    filter.connect(out).connect(this.master);
    const partials = [[1, 1, 'triangle'], [2, 0.35, 'sine'], [3, 0.15, 'sine'], [4, 0.06, 'sine']];
    const stopAt = t + Math.max(dur, 0.3) + decay * 0.4 + 0.1;
    for (const [mult, amp, type] of partials) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = f * mult;
      o.detune.value = (Math.random() - 0.5) * 4;
      g.gain.value = amp;
      o.connect(g).connect(filter);
      o.start(t);
      o.stop(stopAt);
    }
  },
  click(when, accent) {
    const ctx = this.ensure();
    const t = when;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = accent ? 1600 : 1000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + 0.08);
  },
};

/* ================= Piano-klavier ================= */
// Computertoetsenbord -> MIDI (C4 = 'a')
const KEYMAP = {
  a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, h: 69, u: 70, j: 71,
  k: 72, o: 73, l: 74, p: 75, ';': 76, "'": 77,
};
const KEY_LABEL = Object.fromEntries(Object.entries(KEYMAP).map(([k, v]) => [v, k.toUpperCase()]));

const pianoEl = document.getElementById('piano');
const keyEls = new Map();
const listeners = new Set(); // functies die een gespeelde noot ontvangen

function buildPiano() {
  pianoEl.innerHTML = '';
  keyEls.clear();
  let whites = 0;
  for (let m = LOW; m <= HIGH; m++) {
    const el = document.createElement('div');
    el.className = 'key ' + (isBlack(m) ? 'black' : 'white');
    el.dataset.midi = m;
    // Posities in eenheden van de toetsbreedte (CSS-variabele), zodat het klavier meeschaalt.
    el.style.left = isBlack(m)
      ? `calc(var(--kw) * ${whites} - var(--kw) * .32)`
      : `calc(var(--kw) * ${whites++})`;
    const lbl = document.createElement('span');
    lbl.className = 'lbl';
    el.appendChild(lbl);
    if (KEY_LABEL[m]) {
      const kb = document.createElement('span');
      kb.className = 'kb';
      kb.textContent = KEY_LABEL[m];
      el.appendChild(kb);
    }
    pianoEl.appendChild(el);
    keyEls.set(m, el);
  }
  pianoEl.style.width = `calc(var(--kw) * ${whites})`;
  updateLabels();
}

function updateLabels() {
  for (const [m, el] of keyEls) {
    const lbl = el.querySelector('.lbl');
    if (labelMode === 'none') lbl.textContent = '';
    else if (isBlack(m)) lbl.textContent = '';
    else lbl.textContent = pc(m) === 0 ? noteName(m, true) : noteName(m);
  }
}

function press(m, source = 'user') {
  const el = keyEls.get(m);
  if (el) el.classList.add('active');
  audio.note(m);
  if (source === 'user') for (const fn of listeners) fn(m);
}
function release(m) {
  const el = keyEls.get(m);
  if (el) el.classList.remove('active');
}
function flashKey(m, cls, ms = 400) {
  const el = keyEls.get(m);
  if (!el) return;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}
function clearMarks(...classes) {
  for (const el of keyEls.values()) el.classList.remove(...classes);
}
function setClass(m, cls, on = true) {
  const el = keyEls.get(m);
  if (el) el.classList.toggle(cls, on);
}
function scrollToKey(m) {
  const el = keyEls.get(m);
  const sc = pianoEl.parentElement;
  if (!el) return;
  const left = el.offsetLeft - sc.clientWidth / 2 + el.offsetWidth / 2;
  sc.scrollTo({ left, behavior: 'smooth' });
}

// Muis/aanraking (pointer events, met glijden over de toetsen)
const pointerKeys = new Map();
pianoEl.addEventListener('pointerdown', e => {
  const k = e.target.closest('.key');
  if (!k) return;
  e.preventDefault();
  pianoEl.setPointerCapture?.(e.pointerId);
  const m = +k.dataset.midi;
  pointerKeys.set(e.pointerId, m);
  press(m);
});
pianoEl.addEventListener('pointermove', e => {
  if (!pointerKeys.has(e.pointerId)) return;
  const k = document.elementFromPoint(e.clientX, e.clientY)?.closest('.key');
  if (!k) return;
  const m = +k.dataset.midi;
  const prev = pointerKeys.get(e.pointerId);
  if (m !== prev) { release(prev); pointerKeys.set(e.pointerId, m); press(m); }
});
const endPointer = e => {
  if (!pointerKeys.has(e.pointerId)) return;
  release(pointerKeys.get(e.pointerId));
  pointerKeys.delete(e.pointerId);
};
pianoEl.addEventListener('pointerup', endPointer);
pianoEl.addEventListener('pointercancel', endPointer);

// Toetsenbord
const downKeys = new Set();
window.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName) && document.activeElement.type !== 'range') return;
  const k = e.key.toLowerCase();
  if (!(k in KEYMAP)) return;
  e.preventDefault();
  if (downKeys.has(k)) return;
  downKeys.add(k);
  press(KEYMAP[k]);
});
window.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (!(k in KEYMAP)) return;
  downKeys.delete(k);
  release(KEYMAP[k]);
});

// MIDI-keyboard
const midiStatus = document.getElementById('midi-status');
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(access => {
    const hook = () => {
      let n = 0;
      for (const input of access.inputs.values()) {
        n++;
        input.onmidimessage = ({ data }) => {
          const [st, note, vel] = data;
          const cmd = st & 0xf0;
          if (cmd === 0x90 && vel > 0) press(note);
          else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) release(note);
        };
      }
      midiStatus.textContent = n ? `🎛 MIDI verbonden (${n})` : '';
    };
    hook();
    access.onstatechange = hook;
  }).catch(() => {});
}

/* ================= Tabs ================= */
let currentTab = 'lessons';
const tabStops = {}; // tab -> functie om lopende oefening te stoppen
document.getElementById('tabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]');
  if (!b || b.dataset.tab === currentTab) return;
  tabStops[currentTab]?.();
  currentTab = b.dataset.tab;
  document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('active', x === b));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + currentTab));
  clearMarks('mark', 'target');
  if (currentTab === 'scales') scales.showMarks();
  tabStarts[currentTab]?.();
  document.getElementById('main').scrollTop = 0;
});
const tabStarts = {}; // tab -> functie bij openen

/* ================= Opties ================= */
const labelSel = document.getElementById('label-mode');
labelSel.value = labelMode = store.get('labels', 'letters');
labelSel.addEventListener('change', () => {
  labelMode = labelSel.value; store.set('labels', labelMode);
  updateLabels(); songs.render(); scales.render();
});
const vol = document.getElementById('volume');
vol.value = Math.round(audio.volume * 100);
vol.addEventListener('input', () => audio.setVolume(vol.value / 100));

/* ================= Vrij spelen + metronoom ================= */
const freeLast = document.getElementById('free-last');
listeners.add(m => { if (currentTab === 'free') freeLast.textContent = noteName(m, true); });

const metro = {
  bpm: 80, beats: 4, running: false, timer: null, next: 0, beat: 0,
  dots: document.getElementById('metro-dots'),
  renderDots() {
    this.dots.innerHTML = '';
    for (let i = 0; i < this.beats; i++) this.dots.appendChild(document.createElement('i'));
  },
  start() {
    const ctx = audio.ensure();
    this.running = true; this.beat = 0; this.next = ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.tick(), 25);
    document.getElementById('metro-toggle').textContent = 'Stop';
  },
  stop() {
    this.running = false; clearInterval(this.timer);
    document.getElementById('metro-toggle').textContent = 'Start';
    this.dots.querySelectorAll('i').forEach(d => d.classList.remove('on'));
  },
  tick() {
    const ctx = audio.ctx;
    while (this.next < ctx.currentTime + 0.1) {
      const b = this.beat % this.beats;
      audio.click(this.next, b === 0);
      const delay = Math.max(0, (this.next - ctx.currentTime) * 1000);
      setTimeout(() => {
        this.dots.querySelectorAll('i').forEach((d, i) => {
          d.classList.toggle('on', i === b);
          d.classList.toggle('first', i === 0);
        });
      }, delay);
      this.next += 60 / this.bpm;
      this.beat++;
    }
  },
};
metro.renderDots();
document.getElementById('metro-bpm').addEventListener('input', e => {
  metro.bpm = +e.target.value;
  document.getElementById('metro-bpm-val').textContent = metro.bpm;
});
document.getElementById('metro-beats').addEventListener('change', e => {
  metro.beats = +e.target.value; metro.renderDots();
});
document.getElementById('metro-toggle').addEventListener('click', () => metro.running ? metro.stop() : metro.start());

/* ================= Notenbalk (SVG) ================= */
const LETTER_STEP = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
const diatonic = m => octaveOf(m) * 7 + LETTER_STEP[pc(m)];
const svgNS = 'http://www.w3.org/2000/svg';
function svg(tag, attrs, parent) {
  const el = document.createElementNS(svgNS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (parent) parent.appendChild(el);
  return el;
}
function drawStaff(svgEl, clef, midi, color) {
  svgEl.innerHTML = '';
  const gap = 12;            // afstand tussen lijnen
  const bottom = 110;        // y van de onderste lijn
  const x0 = 20, x1 = 280;
  for (let i = 0; i < 5; i++) svg('line', { x1: x0, x2: x1, y1: bottom - i * gap, y2: bottom - i * gap, stroke: 'currentColor', 'stroke-width': 1.2 }, svgEl);
  // Sleutel
  const t = svg('text', {
    x: 26, y: clef === 'treble' ? bottom + 8 : bottom - 13,
    'font-size': clef === 'treble' ? 66 : 42, fill: 'currentColor',
    'font-family': '"Noto Music","Bravura","Segoe UI Symbol","Apple Symbols",serif',
  }, svgEl);
  t.textContent = clef === 'treble' ? '𝄞' : '𝄢';
  if (midi == null) return;
  const bottomStep = clef === 'treble' ? diatonic(parseNote('E4')) : diatonic(parseNote('G2'));
  const step = diatonic(midi) - bottomStep; // 0 = onderste lijn, 8 = bovenste lijn
  const y = bottom - step * gap / 2;
  const nx = 170;
  // Hulplijnen
  for (let s = -2; s >= step; s -= 2) svg('line', { x1: nx - 15, x2: nx + 15, y1: bottom - s * gap / 2, y2: bottom - s * gap / 2, stroke: 'currentColor', 'stroke-width': 1.2 }, svgEl);
  for (let s = 10; s <= step; s += 2) svg('line', { x1: nx - 15, x2: nx + 15, y1: bottom - s * gap / 2, y2: bottom - s * gap / 2, stroke: 'currentColor', 'stroke-width': 1.2 }, svgEl);
  // Nootkop + stok
  const fill = color || 'currentColor';
  svg('ellipse', { cx: nx, cy: y, rx: 7.5, ry: 5.6, transform: `rotate(-20 ${nx} ${y})`, fill }, svgEl);
  const up = step < 4;
  svg('line', {
    x1: up ? nx + 6.8 : nx - 6.8, x2: up ? nx + 6.8 : nx - 6.8,
    y1: y, y2: up ? y - 36 : y + 36, stroke: fill, 'stroke-width': 1.5,
  }, svgEl);
}

/* ================= Noten lezen ================= */
const reading = {
  active: false, target: null, clef: 'treble', streak: 0, right: 0, total: 0, waiting: false,
  best: store.get('read.best', 0),
  staff: document.getElementById('staff'),
  fb: document.getElementById('read-feedback'),
  score: document.getElementById('read-score'),
  pool(clef) {
    const [lo, hi] = clef === 'treble' ? ['C4', 'A5'] : ['C3', 'E4'];
    const out = [];
    for (let m = parseNote(lo); m <= parseNote(hi); m++) if (!isBlack(m)) out.push(m);
    return out;
  },
  start() {
    this.active = true; this.streak = 0; this.right = 0; this.total = 0;
    document.getElementById('read-start').textContent = 'Opnieuw';
    this.next();
  },
  next() {
    const sel = document.getElementById('read-clef').value;
    this.clef = sel === 'both' ? (Math.random() < 0.5 ? 'treble' : 'bass') : sel;
    const pool = this.pool(this.clef);
    let m;
    do { m = pool[Math.floor(Math.random() * pool.length)]; } while (m === this.target && pool.length > 1);
    this.target = m;
    this.waiting = false;
    drawStaff(this.staff, this.clef, m);
    this.fb.textContent = ''; this.fb.className = 'feedback';
    this.updateScore();
  },
  onNote(m) {
    if (!this.active || this.waiting) return;
    const exact = document.getElementById('read-octave').checked;
    const ok = exact ? m === this.target : pc(m) === pc(this.target);
    this.total++;
    if (ok) {
      this.right++; this.streak++;
      if (this.streak > this.best) { this.best = this.streak; store.set('read.best', this.best); }
      this.fb.textContent = `Goed! Dat is ${noteName(this.target, true)}`;
      this.fb.className = 'feedback good';
      flashKey(m, 'good');
      drawStaff(this.staff, this.clef, this.target, 'var(--good)');
      this.waiting = true;
      setTimeout(() => this.next(), 700);
    } else {
      this.streak = 0;
      this.fb.textContent = `Dat was ${noteName(m, exact)}. Probeer nog eens.`;
      this.fb.className = 'feedback bad';
      flashKey(m, 'bad');
    }
    this.updateScore();
  },
  updateScore() {
    const pct = this.total ? Math.round(100 * this.right / this.total) : 0;
    this.score.textContent = `Score: ${this.right}/${this.total} (${pct}%) · Reeks: ${this.streak} · Record: ${this.best}`;
  },
};
drawStaff(reading.staff, 'treble', null);
reading.updateScore();
document.getElementById('read-start').addEventListener('click', () => reading.start());
listeners.add(m => { if (currentTab === 'read') reading.onNote(m); });

/* ================= Gehoortraining ================= */
const INTERVALS = [
  [1, 'Kleine secunde'], [2, 'Grote secunde'], [3, 'Kleine terts'], [4, 'Grote terts'],
  [5, 'Reine kwart'], [6, 'Overmatige kwart'], [7, 'Reine kwint'], [8, 'Kleine sext'],
  [9, 'Grote sext'], [10, 'Kleine septiem'], [11, 'Grote septiem'], [12, 'Octaaf'],
];
const ear = {
  mode: 'note', q: null, answered: false, right: 0, total: 0, tries: 0,
  fb: document.getElementById('ear-feedback'),
  score: document.getElementById('ear-score'),
  choices: document.getElementById('ear-choices'),
  hint: document.getElementById('ear-hint'),
  setMode(mode) {
    this.mode = mode; this.q = null; this.choices.innerHTML = ''; this.fb.textContent = '';
    document.getElementById('ear-replay').disabled = true;
    this.hint.textContent = mode === 'note'
      ? 'Luister naar de noot en zoek hem op de piano (octaaf maakt niet uit). Tip: je krijgt eerst een C als referentie.'
      : 'Luister naar twee noten na elkaar en kies het juiste interval.';
  },
  newQuestion() {
    this.answered = false; this.tries = 0;
    this.fb.textContent = ''; this.fb.className = 'feedback';
    clearMarks('target');
    if (this.mode === 'note') {
      const m = 60 + Math.floor(Math.random() * 12);
      this.q = { notes: [m] };
      this.choices.innerHTML = '';
    } else {
      const [semi, name] = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
      const root = 55 + Math.floor(Math.random() * 10);
      this.q = { notes: [root, root + semi], answer: name };
      this.choices.innerHTML = '';
      for (const [, n] of INTERVALS) {
        const b = document.createElement('button');
        b.textContent = n;
        b.addEventListener('click', () => this.answerInterval(b, n));
        this.choices.appendChild(b);
      }
    }
    document.getElementById('ear-replay').disabled = false;
    this.play(true);
  },
  play(withRef = false) {
    if (!this.q) return;
    let t = 0;
    if (this.mode === 'note' && withRef) { audio.note(60, 0, 0.6, 0.6); t = 1.0; }
    for (const n of this.q.notes) { audio.note(n, t, 0.8); t += 0.8; }
  },
  answerInterval(btn, name) {
    if (this.answered) return;
    this.answered = true; this.total++;
    const ok = name === this.q.answer;
    if (ok) this.right++;
    for (const b of this.choices.children) {
      if (b.textContent === this.q.answer) b.classList.add('good');
      else if (b === btn) b.classList.add('bad');
    }
    this.fb.textContent = ok ? 'Goed!' : `Helaas, het was een ${this.q.answer.toLowerCase()}.`;
    this.fb.className = 'feedback ' + (ok ? 'good' : 'bad');
    this.updateScore();
    if (!ok) this.play();
  },
  onNote(m) {
    if (this.mode !== 'note' || !this.q || this.answered) return;
    const target = this.q.notes[0];
    if (pc(m) === pc(target)) {
      this.answered = true; this.total++;
      if (this.tries === 0) this.right++;
      flashKey(m, 'good');
      this.fb.textContent = `Goed! Het was ${noteName(target)}.` + (this.tries ? ` (na ${this.tries + 1} pogingen)` : '');
      this.fb.className = 'feedback good';
      this.updateScore();
      setTimeout(() => this.newQuestion(), 1400);
    } else {
      this.tries++;
      flashKey(m, 'bad');
      this.fb.textContent = this.tries >= 3 ? `Hint: het is ${noteName(target)}.` : 'Nog niet, luister nog eens.';
      this.fb.className = 'feedback bad';
      if (this.tries >= 3) setClass(target, 'target');
    }
  },
  updateScore() {
    const pct = this.total ? Math.round(100 * this.right / this.total) : 0;
    this.score.textContent = `Score: ${this.right}/${this.total} (${pct}%)`;
  },
};
ear.setMode('note');
ear.updateScore();
document.getElementById('ear-mode').addEventListener('change', e => ear.setMode(e.target.value));
document.getElementById('ear-start').addEventListener('click', () => ear.newQuestion());
document.getElementById('ear-replay').addEventListener('click', () => ear.play());
listeners.add(m => { if (currentTab === 'ear') ear.onNote(m); });

/* ================= Reeks-speler (liedjes & toonladders) ================= */
// Een reeks is een lijst van {m: midi, d: duur in tellen} of {bar: true}
class Sequencer {
  constructor(seqEl, fbEl) {
    this.seqEl = seqEl; this.fbEl = fbEl;
    this.items = []; this.idx = -1; this.mode = null; this.timers = [];
    this.errors = 0; this.bpm = 100; this.onDone = null;
  }
  load(items, bpm = 100) { this.stop(); this.items = items; this.bpm = bpm; this.render(); }
  notes() { return this.items.filter(i => !i.bar); }
  render() {
    this.seqEl.innerHTML = '';
    let n = 0;
    for (const it of this.items) {
      const s = document.createElement('span');
      if (it.bar) { s.className = 'bar'; s.textContent = '|'; }
      else {
        s.textContent = noteName(it.m);
        s.dataset.i = n;
        if (this.idx > n) s.classList.add('done');
        if (this.idx === n) s.classList.add('current');
        n++;
      }
      this.seqEl.appendChild(s);
    }
  }
  highlight(i) {
    this.seqEl.querySelectorAll('span[data-i]').forEach(s => {
      const k = +s.dataset.i;
      s.classList.toggle('done', k < i);
      s.classList.toggle('current', k === i);
    });
  }
  demo() {
    this.stop();
    this.mode = 'demo';
    const ctx = audio.ensure();
    const beat = 60 / this.bpm;
    let t = 0.15;
    this.notes().forEach((it, i) => {
      audio.note(it.m, t, it.d * beat * 0.95);
      const at = t * 1000;
      this.timers.push(setTimeout(() => {
        this.highlight(i);
        setClass(it.m, 'target');
        setTimeout(() => setClass(it.m, 'target', false), it.d * beat * 900);
      }, at));
      t += it.d * beat;
    });
    this.timers.push(setTimeout(() => { this.highlight(-1); this.mode = null; }, t * 1000 + 200));
    void ctx;
  }
  practice() {
    this.stop();
    this.mode = 'practice'; this.idx = 0; this.errors = 0; this.startTime = performance.now();
    this.fbEl.textContent = 'Speel de oplichtende toets.'; this.fbEl.className = 'feedback';
    this.showTarget();
  }
  showTarget() {
    clearMarks('target');
    const n = this.notes()[this.idx];
    if (!n) return;
    setClass(n.m, 'target');
    scrollToKey(n.m);
    this.highlight(this.idx);
  }
  onNote(m) {
    if (this.mode !== 'practice') return;
    const n = this.notes()[this.idx];
    if (m === n.m) {
      flashKey(m, 'good', 200);
      this.idx++;
      if (this.idx >= this.notes().length) return this.finish();
      this.showTarget();
    } else {
      this.errors++;
      flashKey(m, 'bad', 300);
      this.fbEl.textContent = `Fout: dat was ${noteName(m, true)}, zoek ${noteName(n.m, true)}.`;
      this.fbEl.className = 'feedback bad';
    }
  }
  finish() {
    const secs = Math.round((performance.now() - this.startTime) / 1000);
    const total = this.notes().length;
    const acc = Math.round(100 * total / (total + this.errors));
    this.mode = null;
    clearMarks('target');
    this.highlight(total);
    this.fbEl.textContent = `Klaar! ${total} noten in ${secs} s, ${this.errors} fout(en) — nauwkeurigheid ${acc}%.`;
    this.fbEl.className = 'feedback good';
    this.onDone?.({ secs, errors: this.errors, acc });
  }
  stop() {
    this.timers.forEach(clearTimeout); this.timers = [];
    this.mode = null; this.idx = -1;
    clearMarks('target');
    this.highlight(-1);
  }
}

/* ================= Liedjes ================= */
// Notatie: "C4:1 D4:1 | E4:2" — noot:tellen, "|" = maatstreep. Alle liedjes zijn traditioneel / publiek domein.
const SONGS = [
  { name: 'Vader Jacob', bpm: 110, notes:
    'C4:1 D4:1 E4:1 C4:1 | C4:1 D4:1 E4:1 C4:1 | E4:1 F4:1 G4:2 | E4:1 F4:1 G4:2 | ' +
    'G4:.5 A4:.5 G4:.5 F4:.5 E4:1 C4:1 | G4:.5 A4:.5 G4:.5 F4:.5 E4:1 C4:1 | C4:1 G3:1 C4:2 | C4:1 G3:1 C4:2' },
  { name: 'Altijd is Kortjakje ziek', bpm: 100, notes:
    'C4:1 C4:1 G4:1 G4:1 | A4:1 A4:1 G4:2 | F4:1 F4:1 E4:1 E4:1 | D4:1 D4:1 C4:2 | ' +
    'G4:1 G4:1 F4:1 F4:1 | E4:1 E4:1 D4:2 | G4:1 G4:1 F4:1 F4:1 | E4:1 E4:1 D4:2 | ' +
    'C4:1 C4:1 G4:1 G4:1 | A4:1 A4:1 G4:2 | F4:1 F4:1 E4:1 E4:1 | D4:1 D4:1 C4:2' },
  { name: 'Ode an die Freude (Beethoven)', bpm: 110, notes:
    'E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | E4:1.5 D4:.5 D4:2 | ' +
    'E4:1 E4:1 F4:1 G4:1 | G4:1 F4:1 E4:1 D4:1 | C4:1 C4:1 D4:1 E4:1 | D4:1.5 C4:.5 C4:2' },
  { name: 'Jingle Bells (refrein)', bpm: 130, notes:
    'E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1.5 D4:.5 | E4:4 | ' +
    'F4:1 F4:1 F4:1.5 F4:.5 | F4:1 E4:1 E4:1 E4:.5 E4:.5 | E4:1 D4:1 D4:1 E4:1 | D4:2 G4:2' },
  { name: 'Mary Had a Little Lamb', bpm: 110, notes:
    'E4:1 D4:1 C4:1 D4:1 | E4:1 E4:1 E4:2 | D4:1 D4:1 D4:2 | E4:1 G4:1 G4:2 | ' +
    'E4:1 D4:1 C4:1 D4:1 | E4:1 E4:1 E4:1 E4:1 | D4:1 D4:1 E4:1 D4:1 | C4:4' },
  { name: 'Für Elise (begin, Beethoven)', bpm: 90, notes:
    'E5:.5 D#5:.5 | E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 | A4:1.5 C4:.5 E4:.5 A4:.5 | B4:1.5 E4:.5 G#4:.5 B4:.5 | ' +
    'C5:1.5 E4:.5 E5:.5 D#5:.5 | E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 | A4:1.5 C4:.5 E4:.5 A4:.5 | B4:1.5 E4:.5 C5:.5 B4:.5 | A4:2' },
];
function parseSong(str) {
  return str.trim().split(/\s+/).map(tok => {
    if (tok === '|') return { bar: true };
    const [n, d] = tok.split(':');
    return { m: parseNote(n), d: parseFloat(d || '1') };
  });
}

const songSeq = new Sequencer(document.getElementById('song-seq'), document.getElementById('song-feedback'));
const songs = {
  sel: document.getElementById('song-select'),
  init() {
    SONGS.forEach((s, i) => {
      const o = document.createElement('option');
      o.value = i; o.textContent = s.name;
      this.sel.appendChild(o);
    });
    this.sel.addEventListener('change', () => this.load());
    this.load();
    songSeq.onDone = r => {
      const key = 'song.' + SONGS[this.sel.value].name;
      const best = store.get(key, null);
      if (!best || r.acc > best.acc || (r.acc === best.acc && r.secs < best.secs)) {
        store.set(key, r);
        songSeq.fbEl.textContent += ' 🏆 Nieuw persoonlijk record!';
      }
    };
  },
  load() {
    const s = SONGS[this.sel.value];
    songSeq.load(parseSong(s.notes), s.bpm);
    const best = store.get('song.' + s.name, null);
    songSeq.fbEl.className = 'feedback';
    songSeq.fbEl.textContent = best ? `Record: ${best.acc}% in ${best.secs} s` : '';
  },
  render() { songSeq.render(); },
};
songs.init();
document.getElementById('song-demo').addEventListener('click', () => songSeq.demo());
document.getElementById('song-practice').addEventListener('click', () => songSeq.practice());
document.getElementById('song-stop').addEventListener('click', () => songSeq.stop());
listeners.add(m => { if (currentTab === 'songs') songSeq.onNote(m); });
tabStops.songs = () => songSeq.stop();

/* ================= Toonladders ================= */
const SCALE_TYPES = {
  major: [2, 2, 1, 2, 2, 2, 1],
  minor: [2, 1, 2, 2, 1, 2, 2],
  harmonic: [2, 1, 2, 2, 1, 3, 1],
  penta: [2, 2, 3, 2, 3],
  chromatic: Array(12).fill(1),
};
const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const scaleSeq = new Sequencer(document.getElementById('scale-seq'), document.getElementById('scale-feedback'));
const scales = {
  rootSel: document.getElementById('scale-root'),
  typeSel: document.getElementById('scale-type'),
  init() {
    ROOTS.forEach((r, i) => {
      const o = document.createElement('option');
      o.value = i; o.textContent = r.replace('#', '♯').replace('b', '♭');
      this.rootSel.appendChild(o);
    });
    this.rootSel.addEventListener('change', () => this.load());
    this.typeSel.addEventListener('change', () => this.load());
    this.load();
  },
  notes() {
    const root = 60 + +this.rootSel.value;
    const up = [root];
    for (const step of SCALE_TYPES[this.typeSel.value]) up.push(up[up.length - 1] + step);
    return up;
  },
  load() {
    const up = this.notes();
    const down = up.slice(0, -1).reverse();
    const items = [...up.map(m => ({ m, d: 1 })), { bar: true }, ...down.map(m => ({ m, d: 1 }))];
    items[items.length - 1].d = 2;
    scaleSeq.load(items, 120);
    scaleSeq.fbEl.textContent = '';
    if (currentTab === 'scales') this.showMarks();
  },
  showMarks() {
    clearMarks('mark');
    for (const m of this.notes()) setClass(m, 'mark');
    scrollToKey(this.notes()[0] + 6);
  },
  render() { scaleSeq.render(); },
};
scales.init();
document.getElementById('scale-demo').addEventListener('click', () => scaleSeq.demo());
document.getElementById('scale-practice').addEventListener('click', () => scaleSeq.practice());
document.getElementById('scale-stop').addEventListener('click', () => scaleSeq.stop());
listeners.add(m => { if (currentTab === 'scales') scaleSeq.onNote(m); });
tabStops.scales = () => scaleSeq.stop();

/* ================= Volledig scherm + liggend vergrendelen ================= */
document.getElementById('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    await document.documentElement.requestFullscreen();
    await screen.orientation?.lock?.('landscape');
  } catch { /* niet ondersteund (bijv. iPhone) */ }
});
if (!document.documentElement.requestFullscreen) document.getElementById('fullscreen').hidden = true;

/* ================= Zoomen voorkomen (iOS negeert user-scalable=no) ================= */
['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault()));
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - lastTouchEnd < 350 && !e.target.closest('select, input')) e.preventDefault();
  lastTouchEnd = now;
}, { passive: false });
document.addEventListener('dblclick', e => e.preventDefault());

/* ================= Start ================= */
buildPiano();
scrollToKey(66);
window.addEventListener('orientationchange', () => setTimeout(() => scrollToKey(66), 300));

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const fullScript = scriptMatches.map(m => m[1]).join('\n');
const vm = require('vm');

class FakeElement {
  constructor(id='', tag='div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.style = {};
    this.classList = {
      _classes: new Set(['hidden']),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); }
    };
    this.children = [];
    this.innerHTML = '';
    this.textContent = '';
  }
  appendChild(c) { this.children.push(c); }
  querySelectorAll() { return []; }
  querySelector() { return new FakeElement(); }
  setAttribute() {}
  removeAttribute() {}
  addEventListener() {}
}

const elements = {};
function getEl(id) {
  if (!elements[id]) elements[id] = new FakeElement(id);
  return elements[id];
}

class FakeAudioContext {
  createGain() { return { gain: { value: 1 }, connect: () => {} }; }
  createOscillator() { return { type: '', frequency: { setValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
}

const dom = {
  Audio: class { constructor(){ this.volume=1; } play(){ return Promise.resolve(); } pause(){} },
  AudioContext: FakeAudioContext,
  webkitAudioContext: FakeAudioContext,
  document: {
    getElementById: (id) => getEl(id),
    querySelectorAll: (sel) => {
      // .modal-overlay:not(.hidden) を模倣
      if (sel.includes('.modal-overlay')) {
        return Object.values(elements).filter(el => !el.classList.contains('hidden'));
      }
      return [];
    },
    querySelector: () => new FakeElement(),
    createElement: (tag) => new FakeElement('', tag),
    addEventListener: () => {}
  },
  window: {
    getComputedStyle: (el) => ({ zIndex: el.style.zIndex || '0' }),
    AudioContext: FakeAudioContext,
    webkitAudioContext: FakeAudioContext,
    addEventListener: () => {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout: (fn) => fn(),
  console: console
};
dom.window.document = dom.document;

const ctx = vm.createContext(dom);
vm.runInContext(fullScript, ctx);

console.log('--- TEST 1: Open Save Slot Modal ---');
vm.runInContext('openSaveModal()', ctx);
const saveModal = getEl('save-slot-modal');
const saveZ = parseInt(saveModal.style.zIndex, 10);
console.log('save-slot-modal zIndex:', saveZ);

console.log('--- TEST 2: Click Settings Button from Save Slot Modal ---');
vm.runInContext('openSettingsModal()', ctx);
const settingsModal = getEl('settings-modal');
const settingsZ = parseInt(settingsModal.style.zIndex, 10);
console.log('settings-modal zIndex:', settingsZ);
console.log('settings-modal is hidden:', settingsModal.classList.contains('hidden'));
console.log('settings-modal display:', settingsModal.style.display);

if (settingsZ > saveZ) {
  console.log(`SUCCESS: settings-modal (${settingsZ}) is strictly in front of save-slot-modal (${saveZ})!`);
} else {
  console.error(`FAIL: settings-modal (${settingsZ}) is behind save-slot-modal (${saveZ})!`);
  process.exit(1);
}

console.log('--- TEST 3: Close Settings Modal ---');
vm.runInContext('closeModal("settings-modal")', ctx);
console.log('settings-modal closed. is hidden:', settingsModal.classList.contains('hidden'));
console.log('save-slot-modal still open:', !saveModal.classList.contains('hidden'));

console.log('--- TEST 4: Open Rank Modal ---');
vm.runInContext('openRankModal()', ctx);
const rankModal = getEl('rank-info-modal');
const rankZ = parseInt(rankModal.style.zIndex, 10);
console.log('rank-info-modal zIndex:', rankZ);
if (rankZ > saveZ) {
  console.log(`SUCCESS: rank-info-modal (${rankZ}) is strictly in front of save-slot-modal (${saveZ})!`);
} else {
  console.error('FAIL: rank modal is behind!');
  process.exit(1);
}

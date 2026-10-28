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
      _classes: new Set(),
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
    querySelectorAll: () => [],
    querySelector: () => new FakeElement(),
    createElement: (tag) => new FakeElement('', tag),
    addEventListener: () => {}
  },
  window: {
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

console.log('--- TEST 1: Splash Tap to Open Save Modal ---');
vm.runInContext('handleSplashTap()', ctx);
const saveModal = getEl('save-slot-modal');
console.log('Save modal display:', saveModal.style.display);

console.log('--- TEST 2: Close Save Modal (returnToTitleScreen) ---');
vm.runInContext('returnToTitleScreen()', ctx);
const titleBox = getEl('title-box-container');
const splash = getEl('splash-screen');
console.log('Title box display (should be none):', titleBox.style.display);
console.log('Splash display (should be flex):', splash.style.display);
console.log('Splash pointerEvents (should be auto):', splash.style.pointerEvents);
console.log('Splash zIndex (should be 10000):', splash.style.zIndex);

if (titleBox.style.display === 'none' && splash.style.display === 'flex' && splash.style.zIndex === '10000') {
  console.log('SUCCESS: Correctly returned to TAP TO START title screen!');
} else {
  console.error('FAIL: Not returned to splash screen correctly');
  process.exit(1);
}

console.log('--- TEST 3: Tap Splash Again ---');
vm.runInContext('handleSplashTap()', ctx);
console.log('Save modal display after 2nd tap:', saveModal.style.display);

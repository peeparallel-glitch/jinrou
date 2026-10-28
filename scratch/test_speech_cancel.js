const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const fullScript = scriptMatches.map(m => m[1]).join('\n');
const vm = require('vm');

let speechCanceledCount = 0;

class FakeElement {
  constructor(id='', tag='div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.style = {
      setProperty: (k, v) => { this.style[k] = v; }
    };
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
    createDocumentFragment: () => new FakeElement(),
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

// cancelSpeech の呼び出しを監視
const origCancel = ctx.cancelSpeech;
ctx.cancelSpeech = () => {
  speechCanceledCount++;
  origCancel();
};

console.log('--- TEST 1: proceedNextStoryChapter cancels speech ---');
speechCanceledCount = 0;
vm.runInContext('proceedNextStoryChapter()', ctx);
console.log('Speech canceled count:', speechCanceledCount);
if (speechCanceledCount >= 1) {
  console.log('SUCCESS: cancelSpeech called on proceedNextStoryChapter');
} else {
  console.error('FAIL: cancelSpeech was not called!');
  process.exit(1);
}

console.log('--- TEST 2: triggerGrandEndingTest cancels speech ---');
speechCanceledCount = 0;
vm.runInContext('triggerGrandEndingTest(100)', ctx);
console.log('Speech canceled count:', speechCanceledCount);
if (speechCanceledCount >= 1) {
  console.log('SUCCESS: cancelSpeech called on triggerGrandEndingTest');
} else {
  console.error('FAIL: cancelSpeech was not called!');
  process.exit(1);
}

console.log('--- TEST 3: closeModal("modal-overlay") cancels speech ---');
speechCanceledCount = 0;
vm.runInContext('closeModal("modal-overlay")', ctx);
console.log('Speech canceled count:', speechCanceledCount);
if (speechCanceledCount >= 1) {
  console.log('SUCCESS: cancelSpeech called on closeModal("modal-overlay")');
} else {
  console.error('FAIL: cancelSpeech was not called!');
  process.exit(1);
}

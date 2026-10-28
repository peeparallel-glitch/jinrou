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
  closest(sel) {
    if (this.id === 'splash-settings-btn' || sel.includes(this.id)) return this;
    return null;
  }
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

console.log('--- TEST 1: Click Settings Button on Title Screen ---');
// 設定ボタンを押した時のイベント
const settingsBtn = getEl('splash-settings-btn');
const settingsEvent = {
  target: settingsBtn,
  preventDefault: () => {},
  stopPropagation: () => {},
  stopImmediatePropagation: () => {}
};

// 設定ボタンのクリックハンドラー実行
ctx.settingsEvent = settingsEvent;
vm.runInContext('openSettingsModal(settingsEvent)', ctx);
const settingsModal = getEl('settings-modal');
console.log('settings-modal is open:', !settingsModal.classList.contains('hidden'));

// 親要素にイベントが届いたと仮定して handleSplashTap を呼んでもガードされるか？
vm.runInContext('handleSplashTap(settingsEvent)', ctx);
const isSplashHandled = vm.runInContext('isSplashHandled', ctx);
console.log('isSplashHandled (should be false):', isSplashHandled);

if (!settingsModal.classList.contains('hidden') && isSplashHandled === false) {
  console.log('SUCCESS: Settings modal opened, and splash transition was blocked!');
} else {
  console.error('FAIL: Splash transition was triggered!');
  process.exit(1);
}

console.log('--- TEST 2: Tap screen elsewhere (not settings button) ---');
const screenTapEvent = {
  target: getEl('splash-screen'),
  preventDefault: () => {},
  stopPropagation: () => {}
};
ctx.screenTapEvent = screenTapEvent;
vm.runInContext('handleSplashTap(screenTapEvent)', ctx);
const isSplashHandledAfter = vm.runInContext('isSplashHandled', ctx);
console.log('isSplashHandled after screen tap (should be true):', isSplashHandledAfter);

if (isSplashHandledAfter === true) {
  console.log('SUCCESS: Screen tap correctly transitioned to save slots!');
} else {
  console.error('FAIL: Screen tap did not trigger transition!');
  process.exit(1);
}

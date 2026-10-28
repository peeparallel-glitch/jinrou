const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// 全体構文チェック
const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
scriptMatches.forEach((s, idx) => {
  try {
    new Function(s[1]);
    console.log(`Script block ${idx}: Syntax OK`);
  } catch (e) {
    console.error(`Script block ${idx}: SYNTAX ERROR`, e.message);
    process.exit(1);
  }
});

// 模擬ブラウザでセーブデータあり（数値 currentChapter など）を流し込む
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

const testSaveData = {
  heroName: '勇者',
  currentChapter: 1, // 数値！以前はここで rawText.match is not a function が発生していた
  unlockChapter: 1,
  heroIQ: 100,
  totalScore: 0,
  playerTrust: 100,
  rankTitle: '新米審判者',
  clearedVillages: 0,
  monstersDefeated: 0,
  innocentVictims: 0,
  chapterRecords: { ch1: { cleared: false, highScore: 0 } },
  storySummary: '序章: [勇者] は村人を集めた。',
  aliveCount: 5,
  updatedAt: '2026/10/27 04:00'
};

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
    localStorage: {
      getItem: (k) => {
        if (k === 'hero_chronicle_book_1') return JSON.stringify(testSaveData);
        return null;
      },
      setItem: () => {},
      removeItem: () => {}
    }
  },
  localStorage: {
    getItem: (k) => {
      if (k === 'hero_chronicle_book_1') return JSON.stringify(testSaveData);
      return null;
    },
    setItem: () => {},
    removeItem: () => {}
  },
  setTimeout: (fn) => fn(),
  console: console
};
dom.window.document = dom.document;

const ctx = vm.createContext(dom);
vm.runInContext(fullScript, ctx);

// handleSplashTap を実行
vm.runInContext('handleSplashTap()', ctx);

console.log('--- TEST RESULTS ---');
const container = elements['save-slot-list-container'];
console.log('Slot cards generated count:', container.children.length);
if (container.children.length === 3) {
  console.log('SUCCESS: All 3 slots rendered successfully with real save data!');
} else {
  console.error('FAIL: Slots not rendered');
  process.exit(1);
}

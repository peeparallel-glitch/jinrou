const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
console.log('--- Checking CSS blocks ---');
let currentSelector = '';
for (let i = 0; i < 2311; i++) {
  const line = lines[i];
  if (line.includes('{')) {
    currentSelector = line.trim();
  }
  if (currentSelector.includes('.viewport-area') ||
      currentSelector.includes('.view-page') ||
      currentSelector.includes('.character-grid') ||
      currentSelector.includes('.interrogation-panel') ||
      currentSelector.includes('#game-screen') ||
      currentSelector.includes('.status-bar') ||
      currentSelector.includes('.nav-bar') ||
      currentSelector.includes('#title-screen') ||
      currentSelector.includes('.slot-') ||
      currentSelector.includes('.modal-content')) {
    if (line.includes('width') || line.includes('overflow') || line.includes('grid-template') || line.includes('min-') || line.includes('max-')) {
      console.log(`${i+1} [${currentSelector}]: ${line.trim()}`);
    }
  }
}

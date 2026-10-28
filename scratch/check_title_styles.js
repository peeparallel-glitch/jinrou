const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const tStart = html.indexOf('id="title-screen"');
const gStart = html.indexOf('id="game-screen"');
const titleScreen = html.substring(tStart, gStart);

// Let's check widths, flex, overflow in titleScreen
console.log('--- titleScreen CSS classes or style attributes ---');
const styleMatches = titleScreen.match(/style="[^"]*"/g) || [];
styleMatches.forEach(s => {
  if (s.includes('width') || s.includes('min-width') || s.includes('flex')) {
    console.log(s);
  }
});

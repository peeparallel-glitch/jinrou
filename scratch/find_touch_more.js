const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
console.log('Searching for touch and swipe...');
lines.forEach((line, idx) => {
  if (line.includes('touchstart') || line.includes('touchmove') || line.includes('touchend') || line.includes('switchView') || line.includes('carousel')) {
    if (idx > 2000 && idx < 4000) {
      console.log((idx+1) + ': ' + line.trim());
    }
  }
});

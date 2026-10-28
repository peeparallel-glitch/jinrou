const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
console.log('Searching for switchView implementation...');
lines.forEach((line, idx) => {
  if (line.includes('function switchView') || line.includes('switchView =')) {
    console.log((idx+1) + ': ' + line.trim());
    for (let j = idx; j < idx + 40; j++) {
      console.log((j+1) + ': ' + lines[j]);
    }
  }
});

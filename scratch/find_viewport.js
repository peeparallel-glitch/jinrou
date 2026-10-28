const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
console.log('Searching viewport meta:');
lines.slice(0, 30).forEach((l, i) => {
  if (l.includes('viewport')) console.log(`${i+1}: ${l}`);
});

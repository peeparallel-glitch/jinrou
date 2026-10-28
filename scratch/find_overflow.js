const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const lines = html.split('\n');
console.log('Searching .modal-content, .title-box, body, html, .screen...');
for (let i = 0; i < 2600; i++) {
  const line = lines[i];
  if (line.includes('overflow-x') || line.includes('overflow:')) {
    console.log((i+1) + ': ' + line.trim());
  }
}

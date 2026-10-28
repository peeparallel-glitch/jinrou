const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = [];
const regex = /width:\s*([0-9]+)px/g;
let m;
const lines = html.split('\n');
while ((m = regex.exec(html)) !== null) {
  if (parseInt(m[1]) > 350) {
    const lineNo = html.slice(0, m.index).split('\n').length;
    matches.push({ lineNo, line: lines[lineNo-1].trim() });
  }
}
console.log('Fixed widths > 350px in CSS/HTML:');
matches.forEach(item => console.log(`${item.lineNo}: ${item.line}`));

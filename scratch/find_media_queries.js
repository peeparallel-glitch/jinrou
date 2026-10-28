const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Find all @media in index.html
const matches = [];
const regex = /@media[^{]+\{/g;
let m;
while ((m = regex.exec(html)) !== null) {
  matches.push({ index: m.index, match: m[0] });
}

console.log('Media queries count:', matches.length);
matches.forEach(item => {
  const lineNo = html.slice(0, item.index).split('\n').length;
  console.log(`Line ${lineNo}: ${item.match}`);
});

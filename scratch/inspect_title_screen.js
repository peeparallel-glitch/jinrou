const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const tStart = html.indexOf('id="title-screen"');
const gStart = html.indexOf('id="game-screen"');
const titleScreen = html.substring(tStart, gStart);
console.log('Title Screen structure:');
// check child tags
const matches = titleScreen.match(/<[a-z0-9]+[^>]*class="[^"]*"[^>]*>/gi) || [];
matches.slice(0, 30).forEach(m => console.log(m));

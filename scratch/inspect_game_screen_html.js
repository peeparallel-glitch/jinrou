const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const gStart = html.indexOf('id="game-screen"');
const gEnd = html.indexOf('id="true-ending-fullscreen"');
console.log('game-screen start-end:', gStart, gEnd);
console.log(html.substring(gStart, gStart + 3000));

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Find all screen elements
const regex = /<div[^>]*id="([^"]+)"[^>]*class="[^"]*screen[^"]*"/g;
let match;
console.log('Screens:');
while ((match = regex.exec(html)) !== null) {
  console.log(match[1]);
}

// Check touch events
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('touchStartX') || line.includes('handleSwipe') || line.includes('switchView')) {
    if (idx < 2500) {
      console.log((idx+1) + ': ' + line.trim());
    }
  }
});

const fs = require('fs');

try {
  const html = fs.readFileSync('index.html', 'utf8');
  console.log('HTML loaded, length:', html.length);
  
  // Extract scripts to check JS syntax
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptCount = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    scriptCount++;
    const code = match[1];
    try {
      new Function(code);
    } catch (e) {
      console.error(`Script #${scriptCount} syntax error:`, e.message);
      process.exit(1);
    }
  }
  console.log(`All ${scriptCount} scripts passed JS syntax check successfully!`);
} catch (err) {
  console.error('Test error:', err);
  process.exit(1);
}

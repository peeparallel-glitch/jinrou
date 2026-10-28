const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const tIdx = html.indexOf('function translateSavedPhase(');
const tEnd = html.indexOf('function translateSavedSummary(');
const funcCode = html.substring(tIdx, tEnd);
const vm = require('vm');
try {
  const res = vm.runInNewContext(funcCode + '; translateSavedPhase(1, "ja");', {});
  console.log('Passed:', res);
} catch(e) {
  console.error('CRITICAL BUG FOUND IN translateSavedPhase:', e.message);
}

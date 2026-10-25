const { spawn } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');

const chromeProc = spawn(chromePath, [
  '--headless',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-sandbox',
  htmlPath
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9222/json');
    const tabs = await res.json();
    const gameTab = tabs.find(t => t.url.includes('index.html'));

    const ws = new WebSocket(gameTab.webSocketDebuggerUrl);
    ws.onopen = () => {
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 101,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              new Promise((resolve) => {
                const v = document.createElement('video');
                v.src = 'MOVE/ED!1NO1.avi';
                v.onloadedmetadata = () => resolve({ success: true, duration: v.duration });
                v.onerror = (e) => resolve({ success: false, error: v.error ? v.error.message || v.error.code : 'unknown' });
                setTimeout(() => resolve({ timeout: true }), 3000);
              })
            `,
            awaitPromise: true,
            returnByValue: true
          }
        }));
      }, 1000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 101) {
        console.log('REAL LOAD RESULT:', JSON.stringify(data.result, null, 2));
        chromeProc.kill();
        process.exit(0);
      }
    };
  } catch (e) {
    console.log('Error:', e.message);
    chromeProc.kill();
  }
}, 2000);

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
          id: 100,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (function() {
                const v = document.createElement('video');
                return {
                  aviSupport: v.canPlayType('video/avi') || v.canPlayType('video/x-msvideo') || 'none',
                  mp4Support: v.canPlayType('video/mp4')
                };
              })()
            `,
            returnByValue: true
          }
        }));
      }, 1000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 100) {
        console.log('VIDEO SUPPORT RESULT:', JSON.stringify(data.result, null, 2));
        chromeProc.kill();
        process.exit(0);
      }
    };
  } catch (e) {
    console.log('Error:', e.message);
    chromeProc.kill();
  }
}, 2000);

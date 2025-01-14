# FiveM Hot Reload System

> 🚀 **Exciting News!** This version includes experimental code that will soon be migrated to the VPS version! Using WebSocket technology with auto-reconnect capabilities, it can write to the txAdmin console even when the window is minimized or unfocused. No more need to keep txAdmin in focus! 🎯

This tool automatically triggers resource reloads in FiveM when files are changed.

**Designed for local usage without a VPS.**

![AutoPull New Demo](example.gif)

## Setup

1. Install Node.js if not already installedx
2. Modify the `config.js` file with the following structure:
```js
module.exports = {
  folders: [
    'path/to/your/resource1',
    'path/to/your/resource2'
  ]
};
```

3. Start the web server by running `node non-vps-version.js` or:
```bash
npm run non-vps-version
```

4. Load the following script in txAdmin:
```js
const wsAddress = 'ws://localhost:8424'; // Port can be configured manually on non-vps-version.js
function sendCommand(command) {
    console.log(`Running command: ${command}`);
    const input = document.querySelector('input[placeholder="Type a command..."]');
    input.value = command;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    ['keydown', 'keypress', 'keyup'].forEach(eventType => {
        input.dispatchEvent(new KeyboardEvent(eventType, {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
        }));
    });
}
setAutoPullEvents();
function setAutoPullEvents() {
    autoPullWS = new WebSocket(wsAddress);
    autoPullWS.onopen = () => {
        console.log("Connected to AutoPull!")
    };
    autoPullWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ensure') {
            console.log(`Ensuring resource: ${data.resource}`);
            sendCommand('refresh');
            setTimeout(() => sendCommand(`ensure ${data.resource}`), 1);
        }
    };
    autoPullWS.onclose = () => {
        console.log("Connection lost, attempting to reconnect...");
        setTimeout(() => setAutoPullEvents(), 3000);
    };
}
```

**Tip: To automate the process of pasting it to txAdmin every time simply use [this](https://chromewebstore.google.com/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld?hl=en&pli=1)**

5. Changes done to folders listed in `config.js` will trigger a refresh and ensure for that folder name in txAdmin!

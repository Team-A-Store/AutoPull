# FiveM Hot Reload System

This tool automatically triggers resource reloads in FiveM when files are changed.

**Designed for local usage without a VPS.**

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

3. Start the web server by running `node server.js` or:
```bash
npm run non-vps-version
```

4. Load the following script in txAdmin:
```js
const ws = new WebSocket('ws://localhost:8424');
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
ws.onopen = () => {
    console.log("Connected to AutoPull!")
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'ensure') {
            console.log(`Ensuring resource: ${data.resource}`);
            sendCommand('refresh');
            setTimeout(() => sendCommand(`ensure ${data.resource}`), 500);
        }
    };
};
```

5. Changes done to folders listed in `config.js` will trigger a refresh and ensure for that folder name in txAdmin!

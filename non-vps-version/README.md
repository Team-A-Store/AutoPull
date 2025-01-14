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
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => {
    console.log("Connected to AutoPull!")
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.action === 'ensure') {
            console.log(`Ensuring resource: ${data.resource}`);
        }
    };
};
```

5. Changes done to folders listed in `config.js` will trigger a refresh and ensure for that folder name in txAdmin!

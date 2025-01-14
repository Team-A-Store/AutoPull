const express = require('express');
const { WebSocketServer } = require('ws');
const chokidar = require('chokidar');
const config = require('./config.js');
const app = express();

// Create WebSocket server
const wss = new WebSocketServer({ port: 8424 });
console.log('WebSocket server running on port 8424');

wss.on('connection', (ws) => {
    console.log('TxAdmin console connected');
    ws.on('error', console.error);
    ws.on('close', () => console.log('TxAdmin console disconnected'));
});

// Setup watcher for each directory
config.folders.forEach(folder => {
    console.log(`Watching ${folder}`);
    chokidar.watch(folder, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true
    }).on('all', (event, path) => {
        const resourceName = folder.split('/').pop();
        console.log(`Change detected in ${resourceName}: ${event} ${path}`);
        // Broadcast to all connected clients
        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                type: 'ensure',
                resource: resourceName
            }));
        });
    });
});

app.listen(8425, () => {
    console.log('Now paste the script from README.md into your txAdmin console');
});

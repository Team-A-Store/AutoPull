const express = require('express');
const { WebSocketServer } = require('ws');
const chokidar = require('chokidar');
const config = require('./config.js');
const fs = require('fs');
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
    let lastContent = {};
    
    chokidar.watch(folder, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true
    }).on('all', (event, path) => {
        // Only proceed for file changes/additions
        if (event !== 'change' && event !== 'add') return;

        // Read file content
        try {
            const content = fs.readFileSync(path, 'utf8');
            // if (lastContent[path] === content) { // UNCOMMENT THESE 3 LINES IF YOU WANT TO DISABLE SENDING UPDATES WHEN FILE HASNT REALLY CHANGED AGAIN AND AGAIN - BUT IT CAN BE USEFUL TO RESTART FAST WITH SAVING AGAIN AND AGAIN IN SOME CASES
            //     return; // Content hasn't changed, ignore
            // }
            lastContent[path] = content;

            const resourceName = folder.split('/').pop();
            console.log(`Change detected in ${resourceName}: ${event} ${path}`);
            
            // Broadcast to all connected clients
            let clientCount = 0;
            wss.clients.forEach(client => {
                clientCount += 1;
                client.send(JSON.stringify({
                    type: 'ensure',
                    resource: resourceName
                }));
            });
            if (clientCount === 0) console.warn('No clients connected - changes detected but no txAdmin to notify');
        } catch (err) {
            console.error(`Error reading file ${path}:`, err);
        }
    });
});

app.listen(8425, () => {
    console.log('Now paste the script from README.md into your txAdmin console');
});

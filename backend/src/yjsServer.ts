import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/bin/utils';

// This file is intended to run as a separate process or server
const port = process.env.YJS_PORT || 1234;
const wss = new WebSocketServer({ port: Number(port) });

wss.on('connection', (conn, req) => {
    setupWSConnection(conn, req, { docName: req.url?.slice(1) || 'default' });
});

console.log(`Yjs WebSocket server running on port ${port}`);

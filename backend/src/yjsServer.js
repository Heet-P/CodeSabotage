const { WebSocketServer } = require('ws');
// Try standard import or fallback to specific path if needed, 
// but usually the bin utils are not for public consumption. 
// We should copy the utils logic or implementation if it's blocked.
// However, let's try a simpler approach manually handling connection if utils fail, 
// OR just use the y-websocket-server executable.

// Better approach: Use the CLI provided by y-websocket if available, 
// OR implement minimal server logic. 

const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');

const port = process.env.YJS_PORT || 1234;
const wss = new WebSocketServer({ port: Number(port) });

wss.on('connection', (conn, req) => {
    setupWSConnection(conn, req, { docName: req.url?.slice(1) || 'default' });
});

console.log(`Yjs WebSocket server running on port ${port}`);

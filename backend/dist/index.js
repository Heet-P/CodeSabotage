"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const lobbyRoutes_1 = __importDefault(require("./routes/lobbyRoutes"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/v1/lobby', lobbyRoutes_1.default);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use Service Role for backend
let supabase;
if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
}
else {
    console.warn('Supabase credentials not found. Database features will be disabled.');
}
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
const socketController_1 = require("./controllers/socketController");
(0, socketController_1.setupSocketHandlers)(io);
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

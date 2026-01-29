"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinLobby = exports.createLobby = void 0;
const lobbyService_1 = require("../services/lobbyService");
const lobbyManager = lobbyService_1.LobbyManager.getInstance();
const createLobby = (req, res) => {
    try {
        const { userId, username } = req.body;
        if (!userId || !username) {
            return res.status(400).json({ error: 'Missing userId or username' });
        }
        const lobby = lobbyManager.createLobby(userId, username);
        return res.status(201).json(lobby);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
exports.createLobby = createLobby;
const joinLobby = (req, res) => {
    try {
        const { lobbyId, userId, username } = req.body;
        if (!lobbyId || !userId || !username) {
            return res.status(400).json({ error: 'Missing parameters' });
        }
        const lobby = lobbyManager.joinLobby(lobbyId, userId, username);
        return res.status(200).json(lobby);
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
exports.joinLobby = joinLobby;

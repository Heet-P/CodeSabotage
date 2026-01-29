"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyManager = void 0;
class LobbyManager {
    constructor() {
        this.lobbies = new Map();
    }
    static getInstance() {
        if (!LobbyManager.instance) {
            LobbyManager.instance = new LobbyManager();
        }
        return LobbyManager.instance;
    }
    createLobby(hostId, hostUsername) {
        const lobbyId = this.generateLobbyCode();
        const newLobby = {
            id: lobbyId,
            hostId,
            players: [{
                    id: hostId,
                    username: hostUsername,
                    isHost: true,
                    isReady: false,
                    isAlive: true,
                    color: this.getRandomColor()
                }],
            settings: {
                maxPlayers: 10,
                imposterCount: 1,
                taskCount: 5,
                discussionTime: 60,
                votingTime: 30
            },
            status: 'waiting',
            createdAt: Date.now()
        };
        this.lobbies.set(lobbyId, newLobby);
        return newLobby;
    }
    getLobby(lobbyId) {
        return this.lobbies.get(lobbyId);
    }
    joinLobby(lobbyId, playerId, username) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby)
            throw new Error('Lobby not found');
        if (lobby.players.length >= lobby.settings.maxPlayers)
            throw new Error('Lobby is full');
        if (lobby.status !== 'waiting')
            throw new Error('Game already started');
        const newPlayer = {
            id: playerId,
            username,
            isHost: false,
            isReady: false,
            isAlive: true,
            color: this.getRandomColor()
        };
        lobby.players.push(newPlayer);
        return lobby;
    }
    removePlayer(lobbyId, playerId) {
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby)
            return null;
        lobby.players = lobby.players.filter(p => p.id !== playerId);
        if (lobby.players.length === 0) {
            this.lobbies.delete(lobbyId);
            return null;
        }
        // If host left, assign new host
        if (lobby.hostId === playerId) {
            lobby.players[0].isHost = true;
            lobby.hostId = lobby.players[0].id;
        }
        return lobby;
    }
    generateLobbyCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    getRandomColor() {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
exports.LobbyManager = LobbyManager;

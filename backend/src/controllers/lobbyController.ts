import { Request, Response } from 'express';
import { LobbyManager } from '../services/lobbyService';

const lobbyManager = LobbyManager.getInstance();

export const createLobby = (req: Request, res: Response) => {
    try {
        const { userId, username } = req.body;
        if (!userId || !username) {
            return res.status(400).json({ error: 'Missing userId or username' });
        }

        const lobby = lobbyManager.createLobby(userId, username);
        return res.status(201).json(lobby);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const joinLobby = (req: Request, res: Response) => {
    try {
        const { lobbyId, userId, username } = req.body;
        if (!lobbyId || !userId || !username) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const lobby = lobbyManager.joinLobby(lobbyId, userId, username);
        return res.status(200).json(lobby);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};

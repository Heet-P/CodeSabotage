import { Lobby } from '../types';
import { supabase } from '@/lib/supabaseClient';

const API_URL = 'http://localhost:3001/api/v1';

export const lobbyService = {
    createLobby: async (userId: string, username: string): Promise<Lobby> => {
        const response = await fetch(`${API_URL}/lobby/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, username }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create lobby');
        }

        return response.json();
    },

    joinLobby: async (lobbyId: string, userId: string, username: string): Promise<Lobby> => {
        const response = await fetch(`${API_URL}/lobby/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobbyId, userId, username }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to join lobby');
        }

        return response.json();
    }
};

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Lobby, Player } from '@/types';
import { socketService } from '@/services/socketService';
import { useAuth } from '@/context/AuthContext';
import { lobbyService } from '@/services/lobbyService';

export default function LobbyPage() {
    const params = useParams();
    const code = params.code as string;
    const { user } = useAuth();
    const [lobby, setLobby] = useState<Lobby | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!user || !code) return;

        const initLobby = async () => {
            try {
                // Ideally fetch initial state via REST if not passed, but socket join is enough for updates
                // For now, we rely on socket 'lobby:updated' after join
            } catch (e) {
                console.error(e);
            }
        };

        // Connect to socket
        const socket = socketService.connect();

        // Join room
        socketService.joinLobby(code);

        // Listen for updates
        socket.on('lobby:updated', (updatedLobby: Lobby) => {
            console.log('Lobby updated:', updatedLobby);
            setLobby(updatedLobby);
        });

        socket.on('error', (msg: string) => {
            alert(msg);
            router.push('/dashboard');
        });

        return () => {
            socketService.leaveLobby(code);
            socket.off('lobby:updated');
            socket.off('error');
        };
    }, [code, user, router]);

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        alert('Lobby code copied!');
    };

    if (!lobby) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                <div className="animate-pulse text-blue-500">Connecting to Lobby...</div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-950 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-white mb-2 flex items-center gap-4">
                                LOBBY <span className="text-blue-500 cursor-pointer" onClick={copyCode}>#{code}</span>
                                <span className="text-xs font-normal text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">CLICK TO COPY</span>
                            </h1>
                            <p className="text-gray-400">Waiting for players...</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800">
                                <span className="text-gray-500 text-sm block">STATUS</span>
                                <span className={`font-mono ${lobby.status === 'waiting' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {lobby.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Player List */}
                        <div className="md:col-span-2 space-y-4">
                            <h2 className="text-xl font-bold text-gray-300">PLAYERS ({lobby.players.length}/{lobby.settings.maxPlayers})</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {lobby.players.map((player) => (
                                    <div key={player.id} className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg"
                                            style={{ backgroundColor: player.color }}
                                        >
                                            {player.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold flex items-center gap-2">
                                                {player.username}
                                                {player.isHost && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/50">HOST</span>}
                                                {player.id === user?.id && <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded border border-blue-500/50">YOU</span>}
                                            </p>
                                            <p className="text-xs text-gray-500">{player.isReady ? 'READY' : 'NOT READY'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Game Settings */}
                        <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800 h-fit">
                            <h2 className="text-xl font-bold text-gray-300 mb-6">SETTINGS</h2>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Imposters</span>
                                    <span className="font-mono text-red-400">{lobby.settings.imposterCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tasks</span>
                                    <span className="font-mono">{lobby.settings.taskCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Discussion</span>
                                    <span className="font-mono">{lobby.settings.discussionTime}s</span>
                                </div>
                            </div>

                            {lobby.hostId === user?.id && (
                                <button className="w-full mt-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white transition-colors shadow-lg shadow-green-900/20">
                                    START GAME
                                </button>
                            )}
                            {lobby.hostId !== user?.id && (
                                <div className="w-full mt-8 py-3 text-center text-gray-500 italic">
                                    Waiting for host to start...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

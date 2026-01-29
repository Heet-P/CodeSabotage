'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Lobby, Player } from '@/types';
import { socketService } from '@/services/socketService';
import { useAuth } from '@/context/AuthContext';
import CodeEditor from '@/components/game/CodeEditor';
import TaskSidebar from '@/components/game/TaskSidebar';
import ProgressBar from '@/components/game/ProgressBar';
import SabotageMenu from '@/components/game/SabotageMenu';
import MeetingModal from '@/components/game/MeetingModal';
import GameOverScreen from '@/components/game/GameOverScreen';

import TaskCompletionConfetti from '@/components/ui/TaskCompletionConfetti';
import PageTransition from '@/components/ui/PageTransition';

export default function LobbyPage() {
    const params = useParams();
    const code = params.code as string;
    const { user } = useAuth();
    const [lobby, setLobby] = useState<Lobby | null>(null);
    const editorRef = useRef<any>(null);
    const [isFrozen, setIsFrozen] = useState(false); // Sabotage State
    const [showConfetti, setShowConfetti] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!user || !code) return;

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
            // router.push('/dashboard'); // Don't redirect on simple errors?
        });

        socket.on('task:success', (taskId: string) => {
            // Success animation
            setShowConfetti(true);
            // Play sound effect here if implemented
        });

        socket.on('task:error', (msg: string) => {
            alert(`Task Failed: ${msg}`);
        });

        socket.on('sabotage:effect', ({ abilityId, duration }) => {
            if (abilityId === 'freeze') {
                setIsFrozen(true);
                // Also set editor readonly if ref exists
                if (editorRef.current) {
                    editorRef.current.updateOptions({ readOnly: true });
                }

                setTimeout(() => {
                    setIsFrozen(false);
                    if (editorRef.current) {
                        editorRef.current.updateOptions({ readOnly: false });
                    }
                }, duration * 1000);
            }
        });

        socket.on('meeting:ended', (updatedLobby: Lobby) => {
            setLobby(updatedLobby);
        });

        socket.on('game:ended', (updatedLobby: Lobby) => {
            setLobby(updatedLobby);
        });

        return () => {
            socketService.leaveLobby(code);
            socket.off('lobby:updated');
            socket.off('error');
            socket.off('task:success');
            socket.off('task:error');
            socket.off('sabotage:effect');
            socket.off('meeting:ended');
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
            <PageTransition className="h-screen bg-gray-950 text-white overflow-hidden flex flex-col">
                <TaskCompletionConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
                <div className="flex-1 flex flex-col p-4 gap-4 h-full">
                    <header className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl border border-gray-800 shrink-0">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white mb-2 flex items-center gap-4">
                                LOBBY <span className="text-blue-500 cursor-pointer hover:underline" onClick={copyCode}>#{code}</span>
                                <span className="text-[10px] font-normal text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800 tracking-wider">CLICK TO COPY</span>
                            </h1>
                            <p className="text-gray-400 text-sm">Waiting for players...</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            <div className="px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 flex items-center gap-2">
                                <span className="text-gray-500 text-xs font-bold tracking-wider">STATUS</span>
                                <div className={`w-2 h-2 rounded-full ${lobby.status === 'waiting' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                <span className={`font-mono font-bold ${lobby.status === 'waiting' ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {lobby.status.toUpperCase()}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to leave?')) {
                                        socketService.leaveLobby(code);
                                        router.push('/dashboard');
                                    }
                                }}
                                className="px-4 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 rounded-lg text-sm font-bold transition-colors"
                            >
                                LEAVE
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
                        {/* Editor Area (Left 2/3) */}
                        <div className="lg:col-span-2 h-full flex flex-col gap-4 relative">
                            {isFrozen && (
                                <div className="absolute inset-0 z-50 bg-cyan-500/10 backdrop-blur-sm border-2 border-cyan-500 rounded-xl flex items-center justify-center animate-pulse pointer-events-none">
                                    <div className="bg-black/80 px-6 py-4 rounded-lg border border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                                        <h2 className="text-3xl font-black text-cyan-400 tracking-widest text-center mb-2">SYSTEM FROZEN</h2>
                                        <p className="text-cyan-200/70 text-center font-mono text-sm">HACKER ATTACK IN PROGRESS</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex-1 bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden relative">
                                <CodeEditor
                                    lobbyId={code}
                                    onMount={(editor, monaco) => {
                                        console.log('LobbyPage: CodeEditor mounted, setting ref');
                                        editorRef.current = editor;
                                    }}
                                />
                                <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur px-3 py-1 rounded text-xs text-gray-400 pointer-events-none">
                                    Real-time Editor
                                </div>

                                {/* Emergency Meeting Button */}
                                {lobby.status === 'in-progress' && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Call an Emergency Meeting?')) {
                                                socketService.socket?.emit('meeting:start', code);
                                            }
                                        }}
                                        className="absolute bottom-6 left-6 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg border-2 border-red-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 z-10"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                        </svg>
                                        EMERGENCY
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sidebar (Right 1/3) */}
                        <div className="space-y-6">
                            {/* Player List */}
                            <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800">
                                <h2 className="text-sm font-bold text-gray-400 mb-4 tracking-wider flex justify-between items-center">
                                    PLAYERS
                                    <span className="text-white">{lobby.players.length}/{lobby.settings.maxPlayers}</span>
                                </h2>
                                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {lobby.players.map((player) => (
                                        <div key={player.id} className="bg-gray-900/50 border border-gray-800 p-3 rounded-lg flex items-center gap-3 hover:bg-gray-800/50 transition-colors">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-xs"
                                                style={{ backgroundColor: player.color }}
                                            >
                                                {player.username[0].toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <p className="font-medium text-sm flex items-center gap-2 truncate text-gray-200">
                                                    {player.username}
                                                    {player.isHost && <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-bold">HOST</span>}
                                                    {player.id === user?.id && <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold">YOU</span>}
                                                </p>
                                                {/* Status indicator */}
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${player.isReady ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                                    <p className="text-[10px] text-gray-500 font-medium">{player.isReady ? 'READY' : 'NOT READY'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sidebar Content Switch */}
                            {lobby.status === 'in-progress' && (
                                <div className="mb-6">
                                    <ProgressBar progress={lobby.taskProgress || 0} />
                                </div>
                            )}

                            {lobby.status === 'in-progress' && lobby.players.find(p => p.id === user?.id)?.role === 'developer' ? (
                                <TaskSidebar
                                    tasks={lobby.players.find(p => p.id === user?.id)?.tasks || []}
                                    onRunTask={(taskId) => {
                                        if (editorRef.current) {
                                            const codeContent = editorRef.current.getValue();
                                            socketService.socket?.emit('task:verify', {
                                                lobbyId: code,
                                                playerId: user?.id || '',
                                                taskId,
                                                code: codeContent
                                            });
                                        }
                                    }}
                                />
                            ) : lobby.status === 'in-progress' && lobby.players.find(p => p.id === user?.id)?.role === 'hacker' ? (
                                <SabotageMenu
                                    onTriggerSabotage={(abilityId) => {
                                        socketService.socket?.emit('sabotage:trigger', {
                                            lobbyId: code,
                                            playerId: user?.id || '',
                                            abilityId
                                        });
                                    }}
                                />
                            ) : (
                                /* Game Settings (Lobby Mode) */
                                <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800">
                                    <h2 className="text-sm font-bold text-gray-400 mb-4 tracking-wider">GAME SETTINGS</h2>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                                            <span className="text-gray-500">Imposters</span>
                                            <span className="font-mono text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded">{lobby.settings.imposterCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                                            <span className="text-gray-500">Tasks</span>
                                            <span className="font-mono text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded">{lobby.settings.taskCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 rounded hover:bg-white/5 transition-colors">
                                            <span className="text-gray-500">Discussion</span>
                                            <span className="font-mono text-purple-400 font-bold bg-purple-400/10 px-2 py-0.5 rounded">{lobby.settings.discussionTime}s</span>
                                        </div>
                                    </div>

                                    {lobby.hostId === user?.id ? (
                                        <button
                                            onClick={() => socketService.startGame(code)}
                                            className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold text-white transition-all shadow-lg shadow-green-900/20 active:scale-[0.98]"
                                        >
                                            START GAME
                                        </button>
                                    ) : (
                                        <div className="w-full mt-6 py-3 text-center text-gray-500 text-sm italic bg-white/5 rounded-lg border border-white/5">
                                            Waiting for host to start...
                                        </div>
                                    )}

                                    {/* Game Info (Role Reveal) */}
                                    {lobby.status === 'in-progress' && (
                                        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg animate-pulse">
                                            <h3 className="text-center text-lg font-bold text-blue-300 mb-2">GAME STARTED</h3>
                                            {lobby.players.find(p => p.id === user?.id)?.role && (
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-400">Your Role</p>
                                                    <p className={`text-2xl font-black tracking-widest ${lobby.players.find(p => p.id === user?.id)?.role === 'hacker' ? 'text-red-500' : 'text-green-500'}`}>
                                                        {lobby.players.find(p => p.id === user?.id)?.role?.toUpperCase()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meeting Modal Overlay */}
                    {lobby.status === 'meeting' && (
                        <MeetingModal
                            lobby={lobby}
                            currentUser={lobby.players.find(p => p.id === user?.id)}
                            onVote={(targetId) => {
                                socketService.socket?.emit('vote:cast', {
                                    lobbyId: code,
                                    playerId: user?.id || '',
                                    targetId
                                });
                            }}
                        />
                    )}

                    {/* Game Over Screen */}
                    {lobby.status === 'ended' && (
                        <GameOverScreen
                            lobby={lobby}
                            currentUser={lobby.players.find(p => p.id === user?.id)}
                            onReturnToLobby={() => {
                                // Only host can truly reset (or we can allow anyone to trigger it for now locally? No, server state)
                                if (lobby.hostId === user?.id) {
                                    socketService.socket?.emit('lobby:reset', code);
                                } else {
                                    // Non-host just waits or we can optimistically show something
                                    alert('Waiting for host to restart...');
                                }
                            }}
                        />
                    )}
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}

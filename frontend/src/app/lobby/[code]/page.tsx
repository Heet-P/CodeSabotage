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
import { INITIAL_CODEBASE } from '@/data/initialCode';

import TaskCompletionConfetti from '@/components/ui/TaskCompletionConfetti';
import PageTransition from '@/components/ui/PageTransition';
import RoleReveal from '@/components/game/RoleReveal';
import MeltdownOverlay from '@/components/game/MeltdownOverlay';

export default function LobbyPage() {
    const params = useParams();
    const code = params.code as string;
    const { user } = useAuth();
    const [lobby, setLobby] = useState<Lobby | null>(null);
    const editorRef = useRef<any>(null);
    const [isFrozen, setIsFrozen] = useState(false); // Sabotage State
    const [showConfetti, setShowConfetti] = useState(false);
    const [hasRevealShown, setHasRevealShown] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!user || !code) return;

        // Connect to socket
        const socket = socketService.connect();

        // Join room
        if (user?.id) {
            socketService.joinLobby(code, user.id);
        }

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
            setHasRevealShown(false); // Reset for next game
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
    }, [code, user?.id]); // Only re-run if user ID or code changes

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

    const myPlayer = lobby.players.find(p => p.id === user?.id);

    return (
        <ProtectedRoute>
            <PageTransition className="h-screen bg-[#F7F1E3] font-mono text-[#2C3A47] overflow-hidden flex flex-col p-4">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                    .font-pixel { font-family: 'Press Start 2P', cursive; }
                    .retro-border { border: 4px solid #2C3A47; box-shadow: 6px 6px 0px rgba(0,0,0,0.2); }
                    .retro-panel { background: #F7F1E3; border: 4px solid #84817a; position: relative; }
                    .retro-panel::after { content: ''; position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; border: 4px solid #2C3A47; pointer-events: none; z-index: 10; }
                `}</style>

                <TaskCompletionConfetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

                {/* Role Reveal Overlay */}
                {lobby.status === 'in-progress' && !hasRevealShown && myPlayer && (
                    <RoleReveal
                        role={myPlayer.role || 'developer'}
                        onComplete={() => setHasRevealShown(true)}
                    />
                )}

                {/* Header Row */}
                <header className="flex justify-between items-center mb-4 shrink-0">
                    <div className="bg-[#F0932B] border-4 border-[#A9561E] px-4 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                        <h1 className="text-sm md:text-base font-pixel text-white flex items-center gap-3">
                            ROUND 1/4 <span className="text-[#2C3A47] opacity-50">|</span> <span className="text-white text-[10px] md:text-xs">LOBBY: {code}</span>
                        </h1>
                    </div>

                    <div className="bg-white border-4 border-[#2C3A47] px-4 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                        <span className="font-pixel text-lg md:text-xl font-bold tracking-widest text-[#2C3A47]">
                            {/* Global Game Timer */}
                            {lobby.status === 'in-progress' && lobby.timeRemaining !== undefined ? (
                                <span className={`${lobby.timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 'text-[#2C3A47]'}`}>
                                    {lobby.isTimerPaused ? <span className="text-[#a55eea]">PAUSED</span> : `${lobby.timeRemaining}s`}
                                </span>
                            ) : (
                                <span className="text-gray-400">--:--</span>
                            )}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to leave?')) {
                                    socketService.leaveLobby(code);
                                    router.push('/dashboard');
                                }
                            }}
                            className="bg-[#eb4d4b] hover:bg-[#ff7979] text-white border-4 border-[#c0392b] px-4 py-2 font-pixel text-[10px] shadow-[4px_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all"
                        >
                            LEAVE
                        </button>
                    </div>
                </header>


                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                    {/* Left Sidebar (Players & Stats) */}
                    <div className="space-y-6 lg:col-span-1 flex flex-col">
                        {/* Player List */}
                        <div className="retro-panel p-4 flex-1">
                            <h2 className="font-pixel text-sm text-[#2C3A47] mb-6 border-b-4 border-[#2C3A47] pb-2">PLAYERS</h2>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[40vh]">
                                {lobby.players.map((player) => (
                                    <div key={player.id} className="flex items-center gap-3 group">
                                        <div className="w-4 h-4 border-2 border-[#2C3A47]" style={{ backgroundColor: player.color }}></div>
                                        <span className="font-pixel text-[10px] truncate text-[#2C3A47] group-hover:underline cursor-default">
                                            {player.username}
                                            {player.id === user?.id && <span className="text-[#F0932B]"> (YOU)</span>}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Test Cases / Stats */}
                        <div className="retro-panel p-4">
                            <h2 className="font-pixel text-sm text-[#2C3A47] mb-4 border-b-4 border-[#2C3A47] pb-2">STATUS</h2>
                            {lobby.status === 'in-progress' && (
                                <div className="space-y-4">
                                    <div className="bg-[#d1ccc0] border-2 border-[#84817a] p-2">
                                        <p className="font-pixel text-[8px] mb-1">TASK PROGRESS</p>
                                        <div className="h-4 bg-white border-2 border-[#2C3A47] relative">
                                            <div
                                                className="h-full bg-[#44BD32]"
                                                style={{ width: `${lobby.taskProgress || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="bg-[#d1ccc0] border-2 border-[#84817a] p-2 flex justify-between items-center">
                                        <span className="font-pixel text-[8px]">ALIVE: {lobby.players.length}</span>
                                    </div>
                                </div>
                            )}
                            {lobby.status === 'waiting' && <p className="font-pixel text-[10px] text-[#2C3A47]">WAITING FOR HOST...</p>}
                        </div>
                    </div>

                    {/* Editor Area (Center) */}
                    <div className="lg:col-span-2 h-full flex flex-col gap-4 relative">
                        {isFrozen && (
                            <div className="absolute inset-0 z-50 bg-[#70C5CE]/30 backdrop-blur-sm flex items-center justify-center animate-pulse pointer-events-none">
                                <div className="bg-[#F0932B] px-8 py-6 border-4 border-[#A9561E] shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
                                    <h2 className="text-2xl font-pixel text-white text-center mb-2 drop-shadow-md">FROZEN!</h2>
                                    <p className="text-white text-center font-pixel text-[10px]">HACKER ATTACK</p>
                                </div>
                            </div>
                        )}

                        {/* The Editor Container - Dark Frame with Inner Border */}
                        <div className="flex-1 bg-[#1e272e] p-2 border-4 border-[#2C3A47] shadow-[6px_6px_0_rgba(0,0,0,0.2)] relative flex flex-col">
                            {/* Mac-style or Retro Window Header */}
                            <div className="bg-[#808e9b] h-6 mb-2 flex items-center gap-2 px-2 border-b-2 border-[#485460]">
                                <div className="w-2 h-2 bg-[#ff5e57] rounded-sm"></div>
                                <div className="w-2 h-2 bg-[#ffdd59] rounded-sm"></div>
                                <div className="w-2 h-2 bg-[#05c46b] rounded-sm"></div>
                                <span className="ml-2 font-mono text-[10px] text-[#d2dae2]">script.js</span>
                            </div>

                            <div className="flex-1 relative overflow-hidden">
                                {(() => {
                                    // Monolithic: Single Room per Player
                                    const roomName = user ? `${code}-${user.id}-monolithic` : `${code}-lobby`;

                                    return (
                                        <CodeEditor
                                            key={roomName} // Remount if user/lobby changes
                                            roomName={roomName}
                                            initialCode={INITIAL_CODEBASE}
                                            onMount={(editor, monaco) => {
                                                editorRef.current = editor;
                                            }}
                                        />
                                    );
                                })()}
                            </div>

                            {/* Emergency Button Positioned Absolute or Static at bottom */}
                            {lobby.status === 'in-progress' && (
                                <button
                                    onClick={() => {
                                        if (confirm('Call an Emergency Meeting?')) {
                                            socketService.socket?.emit('meeting:start', code);
                                        }
                                    }}
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#eb4d4b] hover:bg-[#ff7979] text-white font-pixel text-xs py-3 px-8 border-4 border-[#c0392b] shadow-[4px_4px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1 z-20 transition-all flex items-center gap-2"
                                >
                                    <span className="animate-pulse">⚠️</span> EMERGENCY
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar (Tasks/Action) */}
                    <div className="space-y-6 lg:col-span-1 h-full overflow-hidden flex flex-col">
                        <div className="retro-panel p-4 h-full flex flex-col relative">
                            {/* Paper texture overlay could go here */}

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
                                <div className="h-full flex flex-col">
                                    <h2 className="font-pixel text-sm text-[#2C3A47] mb-6 border-b-4 border-[#2C3A47] pb-2">SETTINGS</h2>
                                    <div className="space-y-4 font-pixel text-[10px] text-[#2C3A47] flex-1">
                                        {/* Impostors */}
                                        <div className="flex justify-between border-b-2 border-[#84817a] border-dashed pb-2 items-center">
                                            <span>IMPOSTORS:</span>
                                            {lobby.hostId === user?.id ? (
                                                <button
                                                    onClick={() => {
                                                        const next = lobby.settings.imposterCount === 1 ? 2 : 1;
                                                        socketService.socket?.emit('lobby:settings:update', {
                                                            lobbyId: code,
                                                            settings: { imposterCount: next }
                                                        });
                                                    }}
                                                    className="text-[#a55eea] hover:text-[#9c4be6] hover:bg-white/50 px-2 py-0.5 border border-transparent hover:border-[#a55eea]"
                                                >
                                                    {lobby.settings.imposterCount}
                                                </button>
                                            ) : (
                                                <span className="text-[#a55eea]">{lobby.settings.imposterCount}</span>
                                            )}
                                        </div>

                                        {/* Tasks */}
                                        <div className="flex justify-between border-b-2 border-[#84817a] border-dashed pb-2 items-center">
                                            <span>TASKS:</span>
                                            {lobby.hostId === user?.id ? (
                                                <button
                                                    onClick={() => {
                                                        const options = [3, 5, 7];
                                                        const currentIdx = options.indexOf(lobby.settings.taskCount);
                                                        const next = options[(currentIdx + 1) % options.length];
                                                        socketService.socket?.emit('lobby:settings:update', {
                                                            lobbyId: code,
                                                            settings: { taskCount: next }
                                                        });
                                                    }}
                                                    className="text-[#4b7bec] hover:text-[#3867d6] hover:bg-white/50 px-2 py-0.5 border border-transparent hover:border-[#4b7bec]"
                                                >
                                                    {lobby.settings.taskCount}
                                                </button>
                                            ) : (
                                                <span className="text-[#4b7bec]">{lobby.settings.taskCount}</span>
                                            )}
                                        </div>

                                        {/* Time Limit */}
                                        <div className="flex justify-between border-b-2 border-[#84817a] border-dashed pb-2 items-center">
                                            <span>TIME LIMIT:</span>
                                            {lobby.hostId === user?.id ? (
                                                <button
                                                    onClick={() => {
                                                        const options = [60, 90, 120, 180];
                                                        const current = lobby.settings.timeLimit || 120;
                                                        const currentIdx = options.indexOf(current);
                                                        const next = options[(currentIdx + 1) % options.length] || 60;
                                                        socketService.socket?.emit('lobby:settings:update', {
                                                            lobbyId: code,
                                                            settings: { timeLimit: next }
                                                        });
                                                    }}
                                                    className="text-[#eb4d4b] hover:text-[#ff7979] hover:bg-white/50 px-2 py-0.5 border border-transparent hover:border-[#eb4d4b]"
                                                >
                                                    {lobby.settings.timeLimit || 120}s
                                                </button>
                                            ) : (
                                                <span className="text-[#eb4d4b]">{lobby.settings.timeLimit || 120}s</span>
                                            )}
                                        </div>

                                        {lobby.hostId === user?.id && (
                                            <p className="text-[8px] text-gray-500 mt-2 text-center opacity-70">
                                                CLICK VALUES TO CHANGE
                                            </p>
                                        )}
                                    </div>

                                    {lobby.hostId === user?.id ? (
                                        <button
                                            onClick={() => socketService.startGame(code)}
                                            className="w-full mt-auto py-4 bg-[#44BD32] hover:bg-[#4cd137] border-4 border-[#278f1e] text-white font-pixel text-xs shadow-[4px_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all"
                                        >
                                            START GAME
                                        </button>
                                    ) : (
                                        <div className="w-full mt-auto py-4 text-center bg-[#d1ccc0] border-2 border-[#84817a] text-[#2C3A47] font-pixel text-[10px]">
                                            WAITING FOR HOST...
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

                    {/* Meltdown Overlay */}
                    <MeltdownOverlay
                        lobby={lobby}
                        currentUser={lobby.players.find(p => p.id === user?.id)}
                        onVerify={(taskId: string, codeContent: string) => {
                            socketService.socket?.emit('task:verify', {
                                lobbyId: code,
                                playerId: user?.id || '',
                                taskId,
                                code: codeContent
                            });
                        }}
                    />

                    {/* Game Over Screen */}
                    {lobby.status === 'ended' && (
                        <GameOverScreen
                            lobby={lobby}
                            currentUser={lobby.players.find(p => p.id === user?.id)}
                            onReturnToLobby={() => {
                                if (lobby.hostId === user?.id) {
                                    socketService.socket?.emit('lobby:reset', code);
                                } else {
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

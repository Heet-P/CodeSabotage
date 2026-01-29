'use client';

import { Lobby, Player } from '@/types';
import Editor from '@monaco-editor/react';
import { useState, useEffect } from 'react';

interface MeltdownOverlayProps {
    lobby: Lobby;
    currentUser: Player | undefined;
    onVerify: (taskId: string, code: string) => void;
}

export default function MeltdownOverlay({ lobby, currentUser, onVerify }: MeltdownOverlayProps) {
    const [code, setCode] = useState('');
    const [timeLeft, setTimeLeft] = useState(45); // Default visual, should sync with backend time ideally

    const sabotage = lobby.sabotage;
    const isActive = sabotage?.isActive && sabotage.type === 'meltdown';

    useEffect(() => {
        if (isActive) {
            // Simple visual countdown matching the backend duration
            // For better precision, backend should send 'endTime' and we calculate diff
            const interval = setInterval(() => {
                const remaining = Math.max(0, Math.ceil(((sabotage.endTime || 0) - Date.now()) / 1000));
                setTimeLeft(remaining);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isActive, sabotage?.endTime]);

    if (!isActive || !sabotage) return null;

    const isHacker = currentUser?.role === 'hacker';
    const totalDevs = Object.keys(sabotage.tasks).length;
    const completedDevs = Object.values(sabotage.tasks).filter(t => t.completed).length;

    // Developer View
    if (!isHacker) {
        if (!currentUser) return null;

        const myTaskInfo = sabotage.tasks[currentUser.id];
        // If I'm dead or not in the list (late join?), just show status
        if (!myTaskInfo) return <div className="fixed inset-0 z-50 bg-red-900/90 flex items-center justify-center text-white font-pixel">SYSTEM FAILURE (Spectator)</div>;

        const myTask = (currentUser.tasks || []).find(t => t.id === myTaskInfo.taskId);
        const isCompleted = myTaskInfo.completed;

        return (
            <div className="fixed inset-0 z-50 bg-red-600/90 backdrop-blur-md flex flex-col animate-pulse-slow">
                {/* Header */}
                <div className="flex-none p-6 bg-black/50 flex justify-between items-center border-b-4 border-black">
                    <div>
                        <h1 className="text-4xl font-pixel text-white animate-pulse">⚠️ CRITICAL SYSTEM FAILURE ⚠️</h1>
                        <p className="text-white/80 font-mono mt-2">EMERGENCY PROTOCOL ENGAGED. FIX THE CODE IMMEDIATELY.</p>
                    </div>
                    <div className="text-6xl font-pixel text-white font-bold drop-shadow-md">
                        {timeLeft}s
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Instructions */}
                    <div className="w-1/3 bg-black/80 p-6 border-r-4 border-red-500 flex flex-col space-y-6">
                        <div className="bg-red-900/50 border-2 border-red-500 p-4 rounded">
                            <h2 className="text-xl font-pixel text-red-200 mb-2">YOUR TASK</h2>
                            <p className="text-white font-bold text-lg">{myTask?.title || 'Unknown Error'}</p>
                            <p className="text-gray-300 font-mono text-sm mt-2">{myTask?.description}</p>
                        </div>

                        <div className="bg-gray-900/50 border-2 border-gray-700 p-4 rounded flex-1">
                            <h2 className="text-xl font-pixel text-gray-400 mb-4">TEAM STATUS</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-gray-400 font-mono">SYSTEMS RESTORED</span>
                                    <span className="text-2xl font-pixel text-white">{completedDevs}/{totalDevs}</span>
                                </div>
                                <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-300"
                                        style={{ width: `${(completedDevs / totalDevs) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-400 font-mono">
                                    Waiting for all developers to deploy fixes...
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 bg-gray-900 relative flex flex-col">
                        {isCompleted ? (
                            <div className="absolute inset-0 z-10 bg-green-900/90 flex flex-col items-center justify-center space-y-4">
                                <div className="text-6xl text-green-400">✓</div>
                                <h2 className="text-3xl font-pixel text-white">SYSTEM RESTORED</h2>
                                <p className="text-green-200 font-mono">Waiting for other developers...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 pt-4">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="javascript"
                                        value={code || myTask?.codeSnippet || '// Loading...'}
                                        onChange={(val) => setCode(val || '')}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 16,
                                            padding: { top: 20 },
                                        }}
                                        onMount={() => setCode(myTask?.codeSnippet || '')}
                                    />
                                </div>
                                <div className="p-4 bg-black/80 border-t-2 border-red-500 flex justify-end">
                                    <button
                                        onClick={() => myTask && onVerify(myTask.id, code)}
                                        className="bg-red-600 hover:bg-red-500 text-white font-pixel text-xl px-8 py-4 border-4 border-white shadow-[4px_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none transition-all"
                                    >
                                        DEPLOY FIX
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Hacker View
    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="absolute inset-0 bg-[url('/hacker-bg.gif')] opacity-20 pointer-events-none"></div> {/* Optional generic glitch bg */}

            <h1 className="text-6xl md:text-8xl font-pixel text-red-600 animate-pulse text-center drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">
                SYSTEM MELTDOWN
                <br />
                IN PROGRESS
            </h1>

            <div className="flex flex-col items-center space-y-2">
                <div className="text-9xl font-mono font-bold text-white tracking-tighter">
                    {timeLeft}s
                </div>
                <p className="text-red-400 font-pixel text-sm tracking-widest">UNTIL TOTAL FAILURE</p>
            </div>

            <div className="w-full max-w-2xl bg-gray-900 border-4 border-red-900 p-8 rounded-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 font-pixel">DEVELOPER PROGRESS</span>
                    <span className="text-white font-pixel">{completedDevs}/{totalDevs} FIXED</span>
                </div>
                <div className="h-6 bg-black rounded-full overflow-hidden border border-gray-700">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${(completedDevs / totalDevs) * 100}%` }}
                    ></div>
                </div>
                <p className="mt-4 text-center text-gray-500 font-mono text-xs">
                    Prevent them from fixing the system to win.
                </p>
            </div>
        </div>
    );
}

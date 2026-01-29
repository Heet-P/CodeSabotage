'use client';

import { Lobby } from '@/types';
import TaskCompletionConfetti from '@/components/ui/TaskCompletionConfetti';

interface GameOverScreenProps {
    lobby: Lobby;
    currentUser: any;
    onReturnToLobby: () => void;
}

export default function GameOverScreen({ lobby, currentUser, onReturnToLobby }: GameOverScreenProps) {
    const winner = (lobby as any).winner;
    const isDeveloper = currentUser?.role === 'developer';
    const isWinner = (winner === 'developers' && isDeveloper) || (winner === 'hackers' && !isDeveloper);

    // Determine color scheme based on winner
    const themeColor = winner === 'developers' ? 'green' : 'red';
    const bgColor = winner === 'developers' ? 'bg-green-950' : 'bg-red-950';
    const borderColor = winner === 'developers' ? 'border-green-500' : 'border-red-500';
    const textColor = winner === 'developers' ? 'text-green-400' : 'text-red-400';

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${bgColor} animate-in fade-in duration-1000`}>
            {isWinner && <TaskCompletionConfetti trigger={true} />}
            {/* Background effects */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opcode-20 pointer-events-none"></div>
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black`}></div>

            <div className="z-10 text-center space-y-8 p-10 max-w-2xl w-full">
                <div className="space-y-2">
                    <h1 className={`text-6xl md:text-8xl font-black tracking-tighter ${textColor} drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]`}>
                        {isWinner ? 'VICTORY' : 'DEFEAT'}
                    </h1>
                    <p className="text-gray-300 text-xl font-mono tracking-widest uppercase">
                        {winner === 'developers' ? 'CORE SYSTEMS RESTORED' : 'SYSTEM CRITICAL FAILURE'}
                    </p>
                </div>

                <div className={`p-8 rounded-2xl border-2 ${borderColor} bg-black/40 backdrop-blur-xl shadow-2xl space-y-6`}>
                    <div className="space-y-2">
                        <p className="text-gray-400 text-sm font-mono">WIN CONDITION</p>
                        <p className="text-2xl font-bold text-white">{(lobby as any).winReason || 'Unknown'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <p className="text-gray-500 text-xs uppercase mb-1">Your Role</p>
                            <p className={`font-bold text-lg ${isDeveloper ? 'text-green-400' : 'text-red-400'}`}>
                                {currentUser?.role?.toUpperCase()}
                            </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <p className="text-gray-500 text-xs uppercase mb-1">Tasks Completed</p>
                            <p className="font-bold text-lg text-blue-400">
                                {lobby.taskProgress}%
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={onReturnToLobby}
                            className={`
                                w-full py-4 rounded-xl font-bold text-lg text-white transition-all
                                ${winner === 'developers'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-900/50'
                                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-900/50'
                                }
                                shadow-lg hover:scale-[1.02] active:scale-[0.98]
                            `}
                        >
                            RETURN TO LOBBY
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

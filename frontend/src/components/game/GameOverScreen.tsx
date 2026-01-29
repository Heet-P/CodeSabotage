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

    // Determine color scheme based on user's result
    // Victory = Green, Defeat = Red
    const themeColor = isWinner ? '#44BD32' : '#eb4d4b';
    const bgColor = isWinner ? 'bg-[#44BD32]' : 'bg-[#eb4d4b]';
    const borderColor = isWinner ? 'border-[#278f1e]' : 'border-[#c0392b]';
    const shadowColor = isWinner ? 'shadow-[8px_8px_0_#207319]' : 'shadow-[8px_8px_0_#962f25]';

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${bgColor} font-mono animate-in fade-in duration-1000 p-4`}>
            {isWinner && <TaskCompletionConfetti trigger={true} />}

            {/* Simple Grid Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

            <div className="z-10 text-center space-y-8 max-w-2xl w-full">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-8xl font-pixel text-white drop-shadow-[6px_6px_0_rgba(0,0,0,0.3)] tracking-widest leading-normal">
                        {isWinner ? 'VICTORY' : 'DEFEAT'}
                    </h1>
                    <div className="bg-black/20 inline-block px-4 py-2 border-2 border-white/20 backdrop-blur-sm">
                        <p className="text-white text-xs md:text-sm font-pixel uppercase tracking-widest">
                            {winner === 'developers' ? 'CORE SYSTEMS RESTORED' : 'SYSTEM CRITICAL FAILURE'}
                        </p>
                    </div>
                </div>

                <div className={`p-8 bg-[#F7F1E3] border-4 border-[#2C3A47] ${shadowColor} space-y-6 relative`}>
                    {/* Corner decorative pixels */}
                    <div className="absolute top-2 left-2 w-2 h-2 bg-[#2C3A47]"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-[#2C3A47]"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#2C3A47]"></div>
                    <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#2C3A47]"></div>

                    <div className="space-y-2 border-b-4 border-[#2C3A47] pb-4 border-dashed">
                        <p className="text-[#2C3A47] text-xs font-pixel">WIN CONDITION</p>
                        <p className="text-xl md:text-2xl font-pixel font-bold text-[#2C3A47]">{(lobby as any).winReason || 'Unknown'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#d1ccc0] p-4 border-2 border-[#84817a]">
                            <p className="text-[#84817a] text-[10px] uppercase mb-2 font-pixel">Your Role</p>
                            <p className={`font-pixel text-lg ${isDeveloper ? 'text-[#44BD32]' : 'text-[#eb4d4b]'}`}>
                                {currentUser?.role?.toUpperCase()}
                            </p>
                        </div>
                        <div className="bg-[#d1ccc0] p-4 border-2 border-[#84817a]">
                            <p className="text-[#84817a] text-[10px] uppercase mb-2 font-pixel">Tasks Completed</p>
                            <p className="font-pixel text-lg text-[#0984e3]">
                                {lobby.taskProgress}%
                            </p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={onReturnToLobby}
                            className={`
                                w-full py-4 text-white font-pixel text-xs md:text-sm transition-all
                                ${isWinner ? 'bg-[#44BD32] hover:bg-[#4cd137] border-[#278f1e]' : 'bg-[#eb4d4b] hover:bg-[#ff7979] border-[#c0392b]'}
                                border-4 shadow-[4px_4px_0_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.2)] hover:-translate-y-1 active:translate-y-0 active:shadow-none
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

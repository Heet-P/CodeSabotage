'use client';

import { Lobby, Player } from '@/types';
import { useState } from 'react';

interface MeetingModalProps {
    lobby: Lobby;
    currentUser: Player | undefined;
    onVote: (targetId: string | 'skip') => void;
}

export default function MeetingModal({ lobby, currentUser, onVote }: MeetingModalProps) {
    const [selectedVote, setSelectedVote] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    const handleVote = (targetId: string | 'skip') => {
        if (hasVoted) return;
        setSelectedVote(targetId);
        setHasVoted(true);
        onVote(targetId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div className="bg-[#F7F1E3] border-4 border-[#2C3A47] rounded-none w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[12px_12px_0_rgba(0,0,0,0.5)] overflow-hidden">

                {/* Header */}
                <div className="bg-[#eb4d4b] p-6 border-b-4 border-[#2C3A47] flex justify-between items-center relative">
                    {/* Decorative corner accents */}
                    <div className="absolute top-2 left-2 w-2 h-2 bg-white/20"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white/20"></div>

                    <div>
                        <h2 className="text-xl md:text-3xl font-pixel text-white tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">EMERGENCY MEETING</h2>
                        <p className="text-red-100 text-xs font-pixel mt-2">WHO IS THE IMPOSTER?</p>
                    </div>
                    <div className="text-right border-4 border-[#c0392b] bg-[#c0392b] p-2 shadow-inner">
                        <div className="text-2xl font-pixel font-bold text-white">00:00</div>
                    </div>
                </div>

                {/* Players Grid */}
                <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 overflow-y-auto flex-1 bg-[#d1ccc0]">
                    {lobby.players.map((player) => {
                        const isDead = !player.isAlive;
                        const isMe = player.id === currentUser?.id;
                        const isSelected = selectedVote === player.id;

                        return (
                            <div
                                key={player.id}
                                className={`
                                    relative p-4 border-4 transition-all duration-200 flex flex-col items-center
                                    ${isDead ? 'border-[#84817a] bg-[#84817a]/50 opacity-50 grayscale' :
                                        isSelected ? 'border-[#eb4d4b] bg-white scale-105 shadow-[6px_6px_0_rgba(235,77,75,0.3)]' :
                                            'border-[#2C3A47] bg-white hover:border-[#eb4d4b] hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,0.2)]'}
                                `}
                            >
                                {/* Role Tag (Only visible to me or if game over) */}
                                {isMe && (
                                    <div className="absolute top-2 right-2 text-[8px] font-pixel bg-[#2C3A47] px-1 py-1 text-white">
                                        YOU
                                    </div>
                                )}

                                {/* Avatar */}
                                <div className="mb-3 relative">
                                    <div
                                        className="w-12 h-12 border-4 border-[#2C3A47] flex items-center justify-center font-pixel text-lg text-white shadow-sm"
                                        style={{ backgroundColor: player.color }}
                                    >
                                        {player.username[0].toUpperCase()}
                                    </div>
                                    {isDead && (
                                        <div className="absolute -bottom-2 -right-2 text-xl">💀</div>
                                    )}
                                </div>

                                <div className="text-center w-full">
                                    <p className="font-pixel text-[10px] text-[#2C3A47] truncate w-full mb-1">{player.username}</p>
                                    {isDead && <span className="text-[#c0392b] text-[8px] font-pixel bg-red-100 px-1">DEAD</span>}
                                </div>

                                {/* Vote Button */}
                                {!isDead && !hasVoted && !isMe && currentUser?.isAlive && (
                                    <button
                                        onClick={() => handleVote(player.id)}
                                        className="mt-3 w-full py-2 bg-[#eb4d4b] hover:bg-[#ff7979] border-2 border-[#c0392b] text-white text-[8px] font-pixel shadow-[2px_2px_0_#962f25] active:translate-y-0.5 active:shadow-none transition-all"
                                    >
                                        VOTE
                                    </button>
                                )}

                                {/* Vote Status */}
                                {isSelected && (
                                    <div className="mt-3 w-full py-2 bg-[#2C3A47] text-white text-[8px] font-pixel text-center">
                                        VOTED
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer / Skip */}
                <div className="p-6 bg-[#F7F1E3] border-t-4 border-[#2C3A47] flex justify-between items-center">
                    <div className="text-[#2C3A47] text-xs font-pixel">
                        {hasVoted ? 'WAITING FOR OTHERS...' : 'CAST VOTE OR SKIP'}
                    </div>
                    <button
                        onClick={() => handleVote('skip')}
                        disabled={hasVoted || !currentUser?.isAlive}
                        className={`
                            px-6 py-4 border-4 font-pixel text-xs transition-all shadow-[4px_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1
                            ${hasVoted
                                ? 'bg-[#d1ccc0] border-[#84817a] text-[#84817a] cursor-not-allowed shadow-none'
                                : 'bg-[#7f8fa6] hover:bg-[#a4b0be] border-[#2C3A47] text-white'}
                        `}
                    >
                        SKIP VOTE {selectedVote === 'skip' && '<-'}
                    </button>
                </div>
            </div>
        </div>
    );
}

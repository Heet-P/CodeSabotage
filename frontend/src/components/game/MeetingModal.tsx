'use client';

import { Lobby, Player } from '@/types';
import { useState } from 'react';

interface MeetingModalProps {
    lobby: Lobby;
    currentUser: any;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-gray-900 border-2 border-red-600 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(220,38,38,0.3)] overflow-hidden">

                {/* Header */}
                <div className="bg-red-900/30 p-6 border-b border-red-900/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-widest uppercase">Emergency Meeting</h2>
                        <p className="text-red-300 text-sm font-mono mt-1">WHO IS THE IMPOSTER?</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-mono font-bold text-white">00:00</div>
                        <div className="text-xs text-gray-400">VOTING ENDS IN</div>
                    </div>
                </div>

                {/* Players Grid */}
                <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto flex-1 bg-[url('/grid-pattern.png')] bg-repeat opacity-90">
                    {lobby.players.map((player) => {
                        const isDead = !player.isAlive;
                        const isMe = player.id === currentUser?.id;
                        const isSelected = selectedVote === player.id;

                        return (
                            <div
                                key={player.id}
                                className={`
                                    relative p-4 rounded-xl border-2 transition-all duration-200
                                    ${isDead ? 'border-gray-800 bg-gray-900/50 opacity-50 grayscale' :
                                        isSelected ? 'border-red-500 bg-red-900/20 scale-105' :
                                            'border-gray-700 bg-gray-800/50 hover:border-gray-500'}
                                `}
                            >
                                {/* Role Tag (Only visible to me or if game over) */}
                                {isMe && (
                                    <div className="absolute top-2 right-2 text-[10px] font-bold bg-gray-700/50 px-1.5 py-0.5 rounded text-gray-300">
                                        YOU
                                    </div>
                                )}

                                {/* Avatar */}
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-lg border-2 border-white/10"
                                        style={{ backgroundColor: player.color }}
                                    >
                                        {player.username[0].toUpperCase()}
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-200 truncate max-w-[100px]">{player.username}</p>
                                        {isDead && <span className="text-red-500 text-xs font-bold uppercase">DEAD</span>}
                                    </div>
                                </div>

                                {/* Vote Button */}
                                {!isDead && !hasVoted && !isMe && currentUser?.isAlive && (
                                    <button
                                        onClick={() => handleVote(player.id)}
                                        className="mt-3 w-full py-1.5 bg-red-600/20 border border-red-600/50 hover:bg-red-600 hover:text-white text-red-500 text-xs font-bold rounded transition-colors"
                                    >
                                        VOTE
                                    </button>
                                )}

                                {/* Vote Status (Hidden in real Among Us, but shown for confirming own vote) */}
                                {isSelected && (
                                    <div className="mt-3 w-full py-1.5 bg-red-600 text-white text-xs font-bold rounded text-center">
                                        VOTED
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer / Skip */}
                <div className="p-6 bg-gray-900 border-t border-gray-800 flex justify-between items-center">
                    <div className="text-gray-500 text-sm">
                        {hasVoted ? 'Waiting for others...' : 'Cast your vote or skip'}
                    </div>
                    <button
                        onClick={() => handleVote('skip')}
                        disabled={hasVoted || !currentUser?.isAlive}
                        className={`
                            px-6 py-3 rounded-lg font-bold transition-all
                            ${hasVoted
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-700 hover:bg-gray-600 text-white hover:scale-105 active:scale-95'}
                        `}
                    >
                        SKIP VOTE {selectedVote === 'skip' && '(SELECTED)'}
                    </button>
                </div>
            </div>
        </div>
    );
}

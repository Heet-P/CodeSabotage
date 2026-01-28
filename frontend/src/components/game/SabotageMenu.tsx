'use client';

import { useState } from 'react';

interface SabotageMenuProps {
    onTriggerSabotage: (sabotageId: string) => void;
}

export default function SabotageMenu({ onTriggerSabotage }: SabotageMenuProps) {
    const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>({});

    const abilities = [
        {
            id: 'freeze',
            name: 'Freeze Editors',
            description: 'Lock all developer editors for 10 seconds.',
            cooldown: 30,
            icon: (
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'cyan'
        },
        {
            id: 'bug',
            name: 'Insert Bugs',
            description: 'Inject random characters into random lines of code.',
            cooldown: 45,
            icon: (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            ),
            color: 'green'
        },
        {
            id: 'swap',
            name: 'Swap Cursors',
            description: 'Swap cursor control between two random developers.',
            cooldown: 60,
            icon: (
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            color: 'purple'
        }
    ];

    const handleTrigger = (abilityId: string, cooldown: number) => {
        if (cooldowns[abilityId]) return;

        onTriggerSabotage(abilityId);

        // Start local cooldown timer (backend should also enforce)
        setCooldowns(prev => ({ ...prev, [abilityId]: cooldown }));

        const interval = setInterval(() => {
            setCooldowns(prev => {
                const current = prev[abilityId];
                if (current <= 1) {
                    clearInterval(interval);
                    const newState = { ...prev };
                    delete newState[abilityId];
                    return newState;
                }
                return { ...prev, [abilityId]: current - 1 };
            });
        }, 1000);
    };

    return (
        <div className="bg-gray-900/30 p-6 rounded-xl border border-red-900/30 h-full flex flex-col shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            <h2 className="text-sm font-bold text-red-500 mb-4 tracking-wider flex justify-between items-center animate-pulse">
                SABOTAGE MENU
                <span className="text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">HACKER ACCESS</span>
            </h2>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                {abilities.map((ability) => {
                    const isCooldown = !!cooldowns[ability.id];
                    return (
                        <div
                            key={ability.id}
                            className={`
                                relative overflow-hidden rounded-lg border transition-all duration-300
                                ${isCooldown
                                    ? 'bg-gray-900/50 border-gray-800 opacity-75 cursor-not-allowed'
                                    : 'bg-black/40 border-gray-800 hover:border-red-500/50 hover:bg-red-900/10 cursor-pointer group'
                                }
                            `}
                            onClick={() => !isCooldown && handleTrigger(ability.id, ability.cooldown)}
                        >
                            {/* Progress bar background for cooldown */}
                            {isCooldown && (
                                <div
                                    className="absolute inset-0 bg-gray-800/80 z-10 flex items-center justify-center font-mono text-xl font-bold text-white transition-all"
                                    style={{ clipPath: `inset(0 0 0 ${(1 - (cooldowns[ability.id] / ability.cooldown)) * 100}%)` }} // Inverse logic for fill? No, simpler to just text overlay
                                >
                                </div>
                            )}

                            {isCooldown && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center">
                                    <span className="text-2xl font-black text-white/90 drop-shadow-md">{cooldowns[ability.id]}s</span>
                                </div>
                            )}

                            <div className="p-4 relative z-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`
                                        p-2 rounded bg-gray-900 border border-gray-700 
                                        ${!isCooldown && 'group-hover:border-' + ability.color + '-500/50 group-hover:text-' + ability.color + '-400'}
                                    `}>
                                        {ability.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-200 text-sm group-hover:text-white transition-colors">
                                            {ability.name}
                                        </h3>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            Cooldown: {ability.cooldown}s
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed pl-[3.25rem]">
                                    {ability.description}
                                </p>
                            </div>

                            {/* Hover Effect Glitch Line */}
                            {!isCooldown && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

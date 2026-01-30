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
        },
        {
            id: 'meltdown',
            name: 'SYSTEM MELTDOWN',
            description: 'CRITICAL: Force all developers to solve emergency tasks or hackers win.',
            cooldown: 180,
            icon: (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            color: 'red'
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
        <div className="flex flex-col h-full">
            <h2 className="font-pixel text-sm text-[#eb4d4b] mb-4 border-b-4 border-[#eb4d4b] pb-2 flex justify-between">
                SABOTAGE
                <span className="text-[10px] bg-[#eb4d4b] text-white px-2 py-0.5 font-pixel">HACKER</span>
            </h2>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {abilities.map((ability) => {
                    const isCooldown = !!cooldowns[ability.id];
                    return (
                        <div
                            key={ability.id}
                            className={`
                                relative overflow-hidden transition-all duration-300 border-4
                                ${isCooldown
                                    ? 'bg-[#d1ccc0] border-[#84817a] opacity-75 cursor-not-allowed'
                                    : 'bg-white border-[#84817a] hover:border-[#eb4d4b] cursor-pointer group shadow-[4px_4px_0_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0_rgba(235,77,75,0.2)]'
                                }
                            `}
                            onClick={() => !isCooldown && handleTrigger(ability.id, ability.cooldown)}
                        >
                            {/* Progress bar background for cooldown overlay */}
                            {isCooldown && (
                                <div className="absolute inset-0 bg-[#2C3A47]/80 z-20 flex items-center justify-center">
                                    <span className="text-xl font-pixel text-white drop-shadow-md">{cooldowns[ability.id]}s</span>
                                </div>
                            )}

                            <div className="p-4 relative z-10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`
                                        p-2 border-2 border-[#2C3A47] bg-[#F7F1E3]
                                        ${!isCooldown && 'group-hover:bg-[#eb4d4b]/10'}
                                    `}>
                                        {ability.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-pixel text-xs text-[#2C3A47] group-hover:text-[#eb4d4b] transition-colors">
                                            {ability.name}
                                        </h3>
                                        <span className="text-[10px] text-[#84817a] font-mono">
                                            COOLDOWN: {ability.cooldown}s
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-mono text-[#2C3A47] leading-tight pl-[3.25rem]">
                                    {ability.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

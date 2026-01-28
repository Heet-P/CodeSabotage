import React from 'react';

interface ProgressBarProps {
    progress: number; // 0 to 100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex justify-between text-xs font-bold text-green-400 mb-1 tracking-wider">
                <span>TOTAL PROGRESS</span>
                <span>{progress}%</span>
            </div>
            <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-700 shadow-inner relative">
                {/* Background grid pattern for "tech" feel */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.5) 50%)',
                    backgroundSize: '4px 4px'
                }}></div>

                <div
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoleRevealProps {
    role: 'developer' | 'hacker';
    onComplete: () => void;
}

export default function RoleReveal({ role, onComplete }: RoleRevealProps) {
    const [stage, setStage] = useState<'assigning' | 'reveal'>('assigning');

    useEffect(() => {
        // Timeline:
        // 0s: Start "Assigning roles..."
        // 2s: Reveal Role
        // 5s: Complete

        const revealTimer = setTimeout(() => {
            setStage('reveal');
        }, 2000);

        const completeTimer = setTimeout(() => {
            onComplete();
        }, 5000);

        return () => {
            clearTimeout(revealTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center font-mono">
            <AnimatePresence mode="wait">
                {stage === 'assigning' ? (
                    <motion.div
                        key="assigning"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-6xl text-white font-bold tracking-widest animate-pulse">
                            ASSIGNING ROLES...
                        </h1>
                    </motion.div>
                ) : (
                    <motion.div
                        key="reveal"
                        initial={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
                        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        className="text-center space-y-8"
                    >
                        <div>
                            <h1 className={`text-7xl md:text-9xl font-black tracking-tighter ${role === 'hacker' ? 'text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]'}`}>
                                {role === 'hacker' ? 'IMPOSTOR' : 'CIVILIAN'}
                            </h1>
                            <p className="text-gray-400 text-xl tracking-[0.5em] mt-2 uppercase">
                                {role === 'hacker' ? 'Saboteur' : 'Devel0per'}
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-xl max-w-md mx-auto backdrop-blur-sm"
                        >
                            <p className="text-white text-lg font-bold mb-2">OBJECTIVE</p>
                            <p className={`${role === 'hacker' ? 'text-red-300' : 'text-green-300'}`}>
                                {role === 'hacker'
                                    ? "Sabotage the code logic. prevent the developers from fixing the bugs before time runs out."
                                    : "Fix the bugs in the codebase. Verify correct logic before the deadline."}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[101] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-20"></div>
        </div>
    );
}

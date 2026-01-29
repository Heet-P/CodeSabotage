'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Props {
    trigger: boolean;
    onComplete?: () => void;
}

export default function TaskCompletionConfetti({ trigger, onComplete }: Props) {
    useEffect(() => {
        if (trigger) {
            const duration = 2000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min;
            }

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, duration);

            return () => {
                clearInterval(interval);
                clearTimeout(timer);
            };
        }
    }, [trigger, onComplete]);

    return null; // No visual DOM element needed, canvas-confetti handles it
}

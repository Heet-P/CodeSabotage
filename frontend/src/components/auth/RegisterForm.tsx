'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                    },
                },
            });

            if (error) throw error;

            // Check if email confirmation is required
            if (data?.session) {
                router.push('/');
            } else {
                // If no session, it might mean email confirmation is needed
                setError('Registration successful! Please check your email to confirm your account.');
                // Optionally redirect to a specific verify email page
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 retro-panel animate-fade-in-up">
            <h2 className="text-xl md:text-2xl font-pixel text-center text-[#2C3A47] mb-8 border-b-4 border-[#2C3A47] pb-4 tracking-tight">
                JOIN THE SABOTAGE
            </h2>

            {error && (
                <div className={`mb-6 p-4 border-4 font-pixel text-[10px] shadow-[4px_4px_0_rgba(0,0,0,0.2)] ${error.includes('successful') ? 'bg-[#44BD32] border-[#278f1e] text-white' : 'bg-[#eb4d4b] border-[#c0392b] text-white'}`}>
                    {error}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
                <div>
                    <label className="block font-pixel text-[10px] text-[#2C3A47] mb-2">USERNAME / CODENAME</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-4 border-[#2C3A47] outline-none font-mono text-[#2C3A47] placeholder-gray-400 focus:shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-all"
                        placeholder="CodeNinja"
                        required
                    />
                </div>

                <div>
                    <label className="block font-pixel text-[10px] text-[#2C3A47] mb-2">EMAIL</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-4 border-[#2C3A47] outline-none font-mono text-[#2C3A47] placeholder-gray-400 focus:shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-all"
                        placeholder="dev@codesabotage.com"
                        required
                    />
                </div>

                <div>
                    <label className="block font-pixel text-[10px] text-[#2C3A47] mb-2">PASSWORD</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-4 border-[#2C3A47] outline-none font-mono text-[#2C3A47] placeholder-gray-400 focus:shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 bg-[#F0932B] hover:bg-[#ffbe76] text-white font-pixel text-xs border-4 border-[#A9561E] shadow-[4px_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'INITIALIZING...' : 'SIGN UP'}
                </button>
            </form>

            <div className="mt-8 text-center bg-[#d1ccc0] border-2 border-[#84817a] p-3">
                <p className="font-pixel text-[8px] text-[#2C3A47] mb-2">ALREADY AN AGENT?</p>
                <Link href="/login" className="text-[#a55eea] hover:text-[#9c4be6] font-pixel text-[10px] underline decoration-2 underline-offset-4">
                    SIGN IN
                </Link>
            </div>
        </div>
    );
}

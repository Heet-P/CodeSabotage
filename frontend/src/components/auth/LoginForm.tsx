'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 retro-panel animate-fade-in-up">
            <h2 className="text-xl md:text-2xl font-pixel text-center text-[#2C3A47] mb-8 border-b-4 border-[#2C3A47] pb-4 tracking-tight">
                WELCOME BACK
            </h2>

            {error && (
                <div className="mb-6 p-4 bg-[#eb4d4b] border-4 border-[#c0392b] text-white font-pixel text-[10px] shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                    ERROR: {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
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
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 bg-[#44BD32] hover:bg-[#4cd137] text-white font-pixel text-xs border-4 border-[#278f1e] shadow-[4px_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
                </button>
            </form>

            <div className="mt-8 text-center bg-[#d1ccc0] border-2 border-[#84817a] p-3">
                <p className="font-pixel text-[8px] text-[#2C3A47] mb-2">NEW PLAYER?</p>
                <Link href="/register" className="text-[#a55eea] hover:text-[#9c4be6] font-pixel text-[10px] underline decoration-2 underline-offset-4">
                    CREATE CHARACTER
                </Link>
            </div>
        </div>
    );
}

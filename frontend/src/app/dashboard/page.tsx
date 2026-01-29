'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { lobbyService } from '@/services/lobbyService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newUsername, setNewUsername] = useState('');

    const handleCreateLobby = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const lobby = await lobbyService.createLobby(user.id, user.user_metadata.username || user.email);
            router.push(`/lobby/${lobby.id}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleJoinLobby = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !joinCode) return;
        setLoading(true);
        setError(null);
        try {
            const lobby = await lobbyService.joinLobby(joinCode.toUpperCase(), user.id, user.user_metadata.username || user.email);
            router.push(`/lobby/${lobby.id}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!newUsername.trim()) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { username: newUsername.trim() }
            });
            if (error) throw error;
            setIsEditingProfile(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[#70C5CE] font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Pixel Font Import */}
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                    .font-pixel { font-family: 'Press Start 2P', cursive; }
                `}</style>

                {/* Clouds (CSS Art or simple divs) */}
                <div className="absolute top-10 left-10 text-white/80 animate-pulse text-6xl">☁</div>
                <div className="absolute top-20 right-20 text-white/60 animate-bounce text-5xl delay-1000">☁</div>
                <div className="absolute top-40 left-1/4 text-white/70 text-4xl delay-500">☁</div>

                {/* Header / Title */}
                <div className="text-center mb-12 relative z-10">
                    <h1 className="font-pixel text-4xl md:text-6xl text-[#F0932B] drop-shadow-[4px_4px_0_#A9561E] mb-4 leading-tight tracking-widest">
                        CODE<br />MAFIA
                    </h1>
                    <p className="font-pixel text-xs md:text-sm text-[#1e272e] tracking-widest mt-4">Sabotage or Survive</p>

                    {/* User Profile (Pixel Style) */}
                    <div className="mt-8 flex items-center justify-center gap-2">
                        {isEditingProfile ? (
                            <div className="flex items-center gap-2 bg-white border-2 border-black p-1 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
                                <input
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="bg-transparent border-none text-black text-xs font-pixel outline-none w-32"
                                    placeholder="USERNAME"
                                    autoFocus
                                />
                                <button onClick={handleUpdateProfile} className="text-green-600 hover:text-green-500 font-pixel text-[10px]">SAVE</button>
                                <button onClick={() => setIsEditingProfile(false)} className="text-red-600 hover:text-red-500 font-pixel text-[10px]">X</button>
                            </div>
                        ) : (
                            <div
                                className="group flex items-center gap-3 cursor-pointer bg-white/20 hover:bg-white/40 px-4 py-2 rounded border-2 border-transparent hover:border-black/20 transition-all"
                                onClick={() => {
                                    setNewUsername(user?.user_metadata.username || '');
                                    setIsEditingProfile(true);
                                }}
                            >
                                <div className="w-8 h-8 bg-[#F0932B] border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,0.2)] flex items-center justify-center font-pixel text-white text-xs">
                                    {(user?.user_metadata.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="font-pixel text-[10px] text-[#1e272e]">{user?.user_metadata.username || 'DEVELOPER'}</p>
                                    <p className="font-pixel text-[8px] text-[#1e272e]/60 hidden md:block">EDIT PROFILE</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500 border-4 border-red-800 text-white font-pixel text-xs p-4 shadow-[4px_4px_0_rgba(0,0,0,0.5)] max-w-md w-full text-center">
                        ERROR: {error}
                    </div>
                )}

                {/* Controls Container */}
                <div className="flex flex-col gap-6 w-full max-w-md z-10">

                    {/* Create Game Button */}
                    <button
                        onClick={handleCreateLobby}
                        disabled={loading}
                        className="w-full bg-[#F0932B] hover:bg-[#ff9f43] text-white font-pixel py-6 text-sm md:text-lg border-4 border-[#A9561E] shadow-[0_6px_0_#894519] active:shadow-[0_2px_0_#894519] active:translate-y-1 transition-all"
                    >
                        {loading ? 'LOADING...' : 'CREATE GAME'}
                    </button>

                    {/* Join Game Card */}
                    <div className="bg-[#F7F1E3] border-4 border-[#84817a] p-6 shadow-[8px_8px_0_rgba(0,0,0,0.2)] relative">
                        {/* Decorative 'tape' or corner */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#84817a]"></div>
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#84817a]"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#84817a]"></div>
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#84817a]"></div>

                        <p className="font-pixel text-xs text-[#2C3A47] mb-4 text-center">Or join a game...</p>

                        <form onSubmit={handleJoinLobby} className="flex gap-2">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="LOBBY ID"
                                maxLength={6}
                                className="flex-1 bg-[#d1ccc0] border-2 border-[#84817a] p-3 font-pixel text-xs text-[#2C3A47] placeholder-[#2C3A47]/50 outline-none focus:bg-white transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={loading || joinCode.length !== 6}
                                className="bg-[#44BD32] hover:bg-[#4cd137] text-white font-pixel text-xs px-6 border-2 border-[#278f1e] shadow-[0_4px_0_#207319] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_#207319]"
                            >
                                JOIN
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 text-center font-pixel text-[10px] text-[#1e272e]/50">
                    3-5 PLAYERS • FIND THE IMPOSTOR
                </div>

                {/* Grass at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#44BD32] border-t-4 border-[#278f1e]"></div>
            </div>
        </ProtectedRoute>
    );
}

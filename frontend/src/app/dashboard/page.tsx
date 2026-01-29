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
            <div className="min-h-screen bg-gray-950 text-white p-8 bg-[url('/grid.svg')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gray-950/90" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <header className="flex justify-between items-center mb-12">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                {isEditingProfile ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white outline-none focus:border-blue-500"
                                            placeholder="New Username"
                                            autoFocus
                                        />
                                        <button onClick={handleUpdateProfile} disabled={loading} className="text-green-400 hover:text-green-300">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </button>
                                        <button onClick={() => setIsEditingProfile(false)} className="text-red-400 hover:text-red-300">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="group flex items-center gap-2 cursor-pointer" onClick={() => {
                                        setNewUsername(user?.user_metadata.username || '');
                                        setIsEditingProfile(true);
                                    }}>
                                        <p className="font-medium text-white group-hover:text-blue-400 transition-colors">{user?.user_metadata.username || 'Developer'}</p>
                                        <svg className="w-3 h-3 text-gray-500 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                                {(user?.user_metadata.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                            </div>
                        </div>
                    </header>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                            Error: {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Create Lobby Card */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group">
                            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Create New Lobby</h2>
                            <p className="text-gray-400 mb-8">
                                Start a new game session and invite other developers to join. You'll be the host.
                            </p>
                            <button
                                onClick={handleCreateLobby}
                                disabled={loading}
                                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Lobby'}
                            </button>
                        </div>

                        {/* Join Lobby Card */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group">
                            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Join Existing Lobby</h2>
                            <p className="text-gray-400 mb-8">
                                Enter a 6-character game code to join an active session.
                            </p>
                            <form onSubmit={handleJoinLobby} className="space-y-4">
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="ENTER CODE"
                                    maxLength={6}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest uppercase focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || joinCode.length !== 6}
                                    className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Joining...' : 'Join Game'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

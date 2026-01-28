'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 bg-[url('/grid.svg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gray-950/90" />

      <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          CODE SABOTAGE
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          The ultimate social deduction game for developers. Write code, pass tests, and expose the hacker before they crash your production.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link
            href="/login"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
          >
            Play Now
          </Link>

          <Link
            href="/register"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 border border-gray-700 hover:border-gray-600"
          >
            Create Account
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 text-gray-600 text-sm">
        &copy; 2026 Code Sabotage. All systems operational.
      </footer>
    </div>
  );
}

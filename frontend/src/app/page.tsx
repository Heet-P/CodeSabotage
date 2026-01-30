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
    <div className="min-h-screen bg-[#70C5CE] font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Clouds Background (Pure CSS approach or consistent with login) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] opacity-80 animate-pulse delay-1000">
          <CloudIcon size={64} />
        </div>
        <div className="absolute top-[20%] right-[15%] opacity-60 animate-bounce delay-700">
          <CloudIcon size={48} />
        </div>
        <div className="absolute bottom-[15%] left-[20%] opacity-70 animate-pulse">
          <CloudIcon size={56} />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
        {/* Title Section */}
        <div className="transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-pixel text-[#2C3A47] tracking-tighter drop-shadow-[4px_4px_0_rgba(255,255,255,1)] mb-4">
            CODE SABOTAGE
          </h1>
          <p className="text-sm md:text-base font-pixel text-[#2C3A47] bg-white/50 inline-block px-4 py-2 rounded border-2 border-[#2C3A47]">
            <span className="text-[#e1b12c]">★</span> SOCIAL DEDUCTION FOR DEVS <span className="text-[#e1b12c]">★</span>
          </p>
        </div>

        {/* Hero Panel */}
        <div className="retro-panel max-w-2xl mx-auto p-6 md:p-8 transform rotate-1 hover:rotate-0 transition-transform">
          <p className="text-sm md:text-base text-[#2C3A47] leading-relaxed font-pixel text-center">
            Review code. Pass tests. <br />
            <span className="text-[#e84118] block mt-4 animate-pulse">EXPOSE THE IMPOSTOR.</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
          <Link
            href="/login"
            className="w-64 py-4 bg-[#44BD32] hover:bg-[#4cd137] text-white font-pixel text-sm md:text-base border-4 border-[#278f1e] shadow-[6px_6px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all text-center flex items-center justify-center gap-2"
          >
            <span>▶</span> PLAY NOW
          </Link>

          <Link
            href="/register"
            className="w-64 py-4 bg-[#f1f2f6] hover:bg-white text-[#2C3A47] font-pixel text-sm md:text-base border-4 border-[#2C3A47] shadow-[6px_6px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all text-center"
          >
            CREATE ACCOUNT
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-4 text-[#2C3A47] text-[10px] font-pixel opacity-60">
        &copy; 2026 CODE SABOTAGE // v1.0.0 // Heet Parikh
      </footer>
    </div>
  );
}

// Simple Pixel Cloud SVG Component
function CloudIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'crispEdges' }}>
      <path d="M4 14h4v-2h2v-2h6v2h2v2h2v6h-16v-6z" fill="#fff" />
      <path d="M4 14h-2v6h2v-6zM8 12h-4v2h4v-2zM10 10h-2v2h2v-2zM16 10h-6v2h6v-2zM18 12h-2v2h2v-2zM20 14h-2v6h2v-6zM22 20h-20v2h20v-2z" fill="#2C3A47" opacity="0.1" />{/* Shadow detail optional */}
    </svg>
  );
}

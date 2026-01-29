import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#70C5CE] relative overflow-hidden font-pixel">
            {/* Animated Background Elements */}
            <div className="absolute top-10 left-10 text-white/50 text-6xl animate-pulse">☁</div>
            <div className="absolute top-20 right-20 text-white/50 text-8xl animate-pulse delay-700">☁</div>
            <div className="absolute bottom-0 w-full h-16 bg-[#44BD32] border-t-4 border-[#2C3A47]"></div>

            <div className="relative z-10 w-full flex justify-center px-4 mb-20">
                <LoginForm />
            </div>
        </div>
    );
}

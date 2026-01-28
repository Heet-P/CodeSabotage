import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('/grid.svg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gray-950/90" />
            <div className="relative z-10 w-full flex justify-center px-4">
                <LoginForm />
            </div>
        </div>
    );
}

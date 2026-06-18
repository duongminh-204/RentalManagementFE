import RegisterForm from '../components/RegisterForm';
import AuthIllustration from '../components/AuthIllustration';
import logo from '../../../assets/LOGOEXE.png';

export default function RegisterPage() {
    return (
        <div className="auth-canvas flex min-h-screen items-center justify-center px-4 py-6 sm:p-4">
            <div className="relative z-10 grid w-full max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-10">
                <AuthIllustration
                    title={<span className="text-white">TRO</span>}
                    highlight="EZ"
                    logoSrc={logo}
                />
                <RegisterForm />
            </div>
        </div>
    );
}

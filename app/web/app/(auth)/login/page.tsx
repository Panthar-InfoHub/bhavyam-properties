import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4 md:p-8 md:py-16 w-full h-full">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl relative flex flex-col md:flex-row p-8 md:p-14 gap-8 md:gap-16">
          
          {/* Vertical Separator for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-14 bottom-14 w-px bg-gray-200 -translate-x-1/2"></div>

          {/* Left Side: Login */}
          <div className="flex-1">
            <LoginForm />
          </div>

          {/* Right Side: Register */}
          <div className="flex-1">
            <RegisterForm />
          </div>

        </div>
    </main>
  );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '@/supabase';
import Topbar from '@/components/Topbar';

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/home');
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      setError('ログインに失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen h-full flex flex-col bg-gray-100">
      <Topbar />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              ログイン
            </h2>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 border-gray-300"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <FcGoogle className="h-5 w-5" />
            </span>
            Googleでログイン
          </button>
          {error && (
            <div className="text-red-600 text-center mt-2">{error}</div>
          )}
          <div className="text-sm text-center">
            <Link href="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
              利用規約
            </Link>
            {' | '}
            <Link href="/privacy" className="font-medium text-indigo-600 hover:text-indigo-500">
              プライバシーポリシー
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
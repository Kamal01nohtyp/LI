import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Language, translations } from './translations';
import { Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ lang, setLang }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const t = translations[lang];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Auto sign-in usually happens, or email confirm needed based on Supabase settings
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setErrorMsg(error.message || t.auth.errorParams);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert("Microsoft Login requires Azure configuration in Supabase Dashboard.\nError: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-white/50">
        
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3">
             <span className="text-white font-bold text-3xl">L</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{t.auth.welcome}</h1>
        <p className="text-center text-gray-500 mb-8">{t.auth.subtitle}</p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.emailLabel}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.auth.passwordLabel}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.01]"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {isLoading ? t.auth.loading : (isSignUp ? t.auth.signUp : t.auth.signIn)}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleMicrosoftLogin}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 21 21" fill="none">
                <path d="M10.5 0L0 0L0 10.5L10.5 10.5L10.5 0Z" fill="#F25022"/>
                <path d="M21 0L10.5 0L10.5 10.5L21 10.5L21 0Z" fill="#7FBA00"/>
                <path d="M10.5 10.5L0 10.5L0 21L10.5 21L10.5 10.5Z" fill="#00A4EF"/>
                <path d="M21 10.5L10.5 10.5L10.5 21L21 21L21 10.5Z" fill="#FFB900"/>
              </svg>
              {t.auth.microsoftBtn}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? t.auth.hasAccount : t.auth.noAccount}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              {isSignUp ? t.auth.signIn : t.auth.signUp}
            </button>
          </p>
        </div>
        
        <div className="mt-8 flex justify-center space-x-4">
           <button onClick={() => setLang('ru')} className={`text-xs font-medium ${lang === 'ru' ? 'text-blue-600' : 'text-gray-400'}`}>Русский</button>
           <div className="border-l border-gray-300 h-4"></div>
           <button onClick={() => setLang('en')} className={`text-xs font-medium ${lang === 'en' ? 'text-blue-600' : 'text-gray-400'}`}>English</button>
        </div>

      </div>
    </div>
  );
};
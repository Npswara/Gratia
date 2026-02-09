
import React, { useState } from 'react';
import { UserRole, Language } from '../types';
import { User, Users, ChevronRight, Loader2, LogIn, UserPlus, Eye, EyeOff, ArrowLeft, Instagram } from 'lucide-react';
import { translations } from '../translations';
import Logo from './Logo';

interface Props {
  onAuth: (role: UserRole, language: Language) => void;
  onBack: () => void;
}

const AuthPage: React.FC<Props> = ({ onAuth, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.MOTHER);
  const [showPassword, setShowPassword] = useState(false);
  const language: Language = 'en';

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulating API call
    setTimeout(() => {
      onAuth(selectedRole, language);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f1] via-white to-[#f0fdfa] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-emerald-100/50 max-w-lg w-full border border-emerald-50 relative overflow-hidden">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all active:scale-95 z-20"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-100 rounded-full blur-3xl opacity-40"></div>

        <div className="relative z-10 text-center">
          <div className="mb-8 mt-4 flex justify-center transform transition-transform hover:scale-105">
            <Logo className="text-5xl" />
          </div>
          
          <p className="text-gray-400 mb-10 font-bold uppercase tracking-widest text-[10px]">{t.tagline}</p>

          <div className="flex bg-gray-50 p-1 rounded-2xl mb-8 border border-gray-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isLogin ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
            >
              {t.login}
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!isLogin ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
            >
              {t.signup}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <input 
              required
              type="email" 
              placeholder={t.emailPlaceholder} 
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-200 focus:bg-white outline-none transition-all font-bold text-sm text-black"
            />
            <div className="relative group">
              <input 
                required
                type={showPassword ? "text" : "password"} 
                placeholder={t.passwordPlaceholder} 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-200 focus:bg-white outline-none transition-all font-bold text-sm text-black pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-600 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <p className="text-[10px] font-black text-gray-400 my-6 uppercase tracking-[0.2em]">{t.chooseRole}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setSelectedRole(UserRole.MOTHER)}
                className={`group p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                  selectedRole === UserRole.MOTHER 
                    ? 'bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-100' 
                    : 'bg-gray-50 border-transparent grayscale opacity-60'
                }`}
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-emerald-800">{t.roleWife}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole(UserRole.FATHER)}
                className={`group p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                  selectedRole === UserRole.FATHER 
                    ? 'bg-teal-50 border-teal-400 shadow-lg shadow-teal-100' 
                    : 'bg-gray-50 border-transparent grayscale opacity-60'
                }`}
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-teal-800">{t.roleHusband}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
                selectedRole === UserRole.MOTHER 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' 
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-100'
              } text-white`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? t.login : t.signup}
                </>
              )}
            </button>
          </form>

          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest animate-pulse">
              {t.preparing}
            </div>
          )}

          <a 
            href="https://instagram.com/getgratia" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
          >
            <Instagram size={14} /> @getgratia
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

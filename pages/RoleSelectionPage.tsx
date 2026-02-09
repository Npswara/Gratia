
import React from 'react';
import { UserRole } from '../types';
import { User, Users, ArrowLeft, Instagram } from 'lucide-react';
import { translations } from '../translations';
import Logo from './Logo';

interface Props {
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

const RoleSelectionPage: React.FC<Props> = ({ onSelectRole, onBack }) => {
  const language = 'en';
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f1] via-white to-[#f0fdfa] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-emerald-100/50 max-w-lg w-full border border-emerald-50 relative overflow-hidden">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all active:scale-95 z-20"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-100 rounded-full blur-3xl opacity-40"></div>

        <div className="relative z-10 text-center">
          <div className="mb-10 mt-6 flex justify-center transform transition-transform hover:scale-105">
            <Logo className="text-5xl" />
          </div>
          
          <p className="text-gray-400 mb-12 font-bold uppercase tracking-widest text-[10px]">{t.tagline}</p>

          <h2 className="text-2xl font-black text-black mb-10 tracking-tight">Who are you?</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <button
              type="button"
              onClick={() => onSelectRole(UserRole.MOTHER)}
              className="group p-8 rounded-[2.5rem] border-2 border-emerald-50 bg-white hover:bg-emerald-50 hover:border-emerald-400 shadow-lg shadow-emerald-50 transition-all flex flex-col items-center gap-4 active:scale-95"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                <User size={32} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest text-emerald-800">{t.roleWife}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectRole(UserRole.FATHER)}
              className="group p-8 rounded-[2.5rem] border-2 border-teal-50 bg-white hover:bg-teal-50 hover:border-teal-400 shadow-lg shadow-teal-50 transition-all flex flex-col items-center gap-4 active:scale-95"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest text-teal-800">{t.roleHusband}</span>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <a 
              href="https://instagram.com/getgratia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
            >
              <Instagram size={14} /> @getgratia
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

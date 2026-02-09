
import React from 'react';
import { translations } from '../translations';
import { Language } from '../types';
import { Sparkles, Heart, Users, Utensils, ShieldCheck, ChevronRight, MessageSquareHeart, Instagram } from 'lucide-react';
import Logo from './Logo';

interface Props {
  onStart: () => void;
  language: Language;
}

const LandingPage: React.FC<Props> = ({ onStart, language }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gratia-green selection:bg-emerald-100">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Logo className="text-3xl" />
        <div className="flex items-center gap-4">
          <a 
            href="https://instagram.com/getgratia" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
          >
            <Instagram size={14} /> @getgratia
          </a>
          <button 
            onClick={onStart}
            className="px-6 py-2.5 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-emerald-600 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {t.start}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 font-black text-[10px] uppercase tracking-widest mb-8 border border-emerald-100 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Sparkles size={14} /> New: Gratia AI Coach v2
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-black leading-[1.1] mb-8 tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {t.landingHeroTitle}
        </h1>
        <p className="text-lg md:text-xl font-bold text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {t.landingHeroSub}
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <button 
            onClick={onStart}
            className="w-full md:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {t.getStarted} <ChevronRight size={20} />
          </button>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No hidden fees. Secure & Private.</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-black text-black mb-4 tracking-tight">{t.feature1Title}</h3>
            <p className="text-sm font-bold text-gray-500 leading-relaxed">{t.feature1Desc}</p>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-8 group-hover:scale-110 transition-transform">
              <Utensils size={28} />
            </div>
            <h3 className="text-xl font-black text-black mb-4 tracking-tight">{t.feature2Title}</h3>
            <p className="text-sm font-bold text-gray-500 leading-relaxed">{t.feature2Desc}</p>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-8 group-hover:scale-110 transition-transform">
              <MessageSquareHeart size={28} />
            </div>
            <h3 className="text-xl font-black text-black mb-4 tracking-tight">{t.feature3Title}</h3>
            <p className="text-sm font-bold text-gray-500 leading-relaxed">{t.feature3Desc}</p>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="bg-white py-24 border-t border-gray-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-4 mb-10">
            {[1, 2, 3, 4, 5].map(star => (
              <Heart key={star} size={20} className="text-emerald-500 fill-emerald-500" />
            ))}
          </div>
          <h2 className="text-3xl font-black text-black mb-12 tracking-tight">"The only app that actually connects us as a team."</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="text-left">
              <p className="font-black text-sm text-black">Clara & Mark</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expecting October 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="bg-emerald-950 p-12 md:p-20 rounded-[4rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Ready to begin?</h2>
          <button 
            onClick={onStart}
            className="px-12 py-5 bg-white text-emerald-950 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-50 transition-all active:scale-95"
          >
            {t.onboardingFinish}
          </button>
          <div className="mt-10 flex items-center justify-center gap-2 text-white/40 font-black text-[10px] uppercase tracking-[0.3em]">
            <ShieldCheck size={16} /> Privacy-First Encryption
          </div>
        </div>
      </section>

      <footer className="py-12 text-center space-y-4">
        <div className="flex justify-center">
          <a 
            href="https://instagram.com/getgratia" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
          >
            <Instagram size={14} /> @getgratia
          </a>
        </div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Gratia. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

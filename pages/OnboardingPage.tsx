
import React, { useState, useMemo } from 'react';
import { UserRole, SharedData, Language } from '../types';
import { translations } from '../translations';
import { ChevronRight, ArrowLeft, Sparkles, Link as LinkIcon, Copy, Check, Baby, HeartPulse, PenTool, ClipboardCheck } from 'lucide-react';
import Logo from './Logo';

interface Props {
  role: UserRole;
  language: Language;
  onFinish: (data: Partial<SharedData>) => void;
  onBack: () => void;
}

const OnboardingPage: React.FC<Props> = ({ role, language, onFinish, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userName: '',
    inputCode: '',
    isCurrentlyPregnant: true,
    weeksPregnant: 12,
    daysPregnant: 0,
    childName: '',
    childNickname: ''
  });
  const [copied, setCopied] = useState(false);

  const t = translations[language || 'en'];

  const generatedCode = useMemo(() => {
    return 'GRATIA-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }, []);

  const nextStep = () => {
    // Logic to skip child info if not currently pregnant
    if (step === 2 && !formData.isCurrentlyPregnant) {
      setStep(4);
    } else {
      setStep(s => s + 1);
    }
  };
  
  const prevStep = () => {
    if (step === 4 && !formData.isCurrentlyPregnant) {
      setStep(2);
    } else {
      setStep(s => s - 1);
    }
  };

  const handleCompleteMother = () => {
    onFinish({
      language,
      pairingCode: generatedCode,
      userName: formData.userName,
      childName: formData.isCurrentlyPregnant ? (formData.childName || 'Little One') : 'My Child',
      childNickname: formData.isCurrentlyPregnant ? (formData.childNickname || 'Sunshine') : 'Kiddo',
      isPostPregnant: false, // Initially false unless they clicked birth in dashboard
      pregnancyAgeWeeks: formData.isCurrentlyPregnant ? formData.weeksPregnant : undefined,
      pregnancyAgeDays: formData.isCurrentlyPregnant ? formData.daysPregnant : undefined,
    });
  };

  const handleCompleteFather = () => {
    onFinish({ 
      language,
      pairingCode: formData.inputCode, 
      userName: formData.userName 
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMotherOnboarding = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 mx-auto">
              <Sparkles />
            </div>
            <h2 className="text-3xl font-black text-black text-center">{t.onboardingName}</h2>
            <input 
              type="text" 
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              placeholder="Enter your full name" 
              className="w-full p-5 bg-white border-2 border-emerald-100 rounded-2xl focus:border-emerald-400 outline-none text-xl text-center text-black font-bold shadow-sm"
            />
            <div className="flex gap-4">
              <button onClick={onBack} className="p-4 bg-gray-100 text-gray-600 rounded-2xl transition-all hover:bg-gray-200"><ArrowLeft /></button>
              <button 
                disabled={!formData.userName}
                onClick={nextStep}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 active:scale-95 transition-all"
              >
                {t.continue}
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 mx-auto">
              <Baby />
            </div>
            <h2 className="text-2xl font-black text-black text-center">Are you currently pregnant?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setFormData({...formData, isCurrentlyPregnant: true})}
                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 text-center ${formData.isCurrentlyPregnant ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-100' : 'bg-gray-50 border-transparent opacity-60 grayscale'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${formData.isCurrentlyPregnant ? 'bg-emerald-600 text-white' : 'bg-white text-gray-400'}`}>
                  <Baby size={32} />
                </div>
                <div>
                  <span className="block font-black text-xs uppercase tracking-widest text-emerald-900">I am Pregnant</span>
                  <span className="block text-[8px] font-bold text-gray-400 uppercase mt-1">Track my journey</span>
                </div>
              </button>
              <button 
                onClick={() => setFormData({...formData, isCurrentlyPregnant: false})}
                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 text-center ${!formData.isCurrentlyPregnant ? 'bg-teal-50 border-teal-500 ring-4 ring-teal-100' : 'bg-gray-50 border-transparent opacity-60 grayscale'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${!formData.isCurrentlyPregnant ? 'bg-teal-600 text-white' : 'bg-white text-gray-400'}`}>
                  <ClipboardCheck size={32} />
                </div>
                <div>
                  <span className="block font-black text-xs uppercase tracking-widest text-teal-900">Not Pregnant</span>
                  <span className="block text-[8px] font-bold text-gray-400 uppercase mt-1">Exploring Gratia</span>
                </div>
              </button>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="p-4 bg-gray-100 text-gray-600 rounded-2xl transition-all hover:bg-gray-200"><ArrowLeft /></button>
              <button onClick={nextStep} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg">{t.continue}</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 mx-auto">
              <PenTool />
            </div>
            <h2 className="text-2xl font-black text-black text-center">{t.onboardingChild}</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                value={formData.childName}
                onChange={(e) => setFormData({...formData, childName: e.target.value})}
                placeholder={t.childNamePlaceholder}
                className="w-full p-4 bg-white border-2 border-emerald-50 rounded-2xl focus:border-emerald-400 outline-none font-bold text-black"
              />
              <input 
                type="text" 
                value={formData.childNickname}
                onChange={(e) => setFormData({...formData, childNickname: e.target.value})}
                placeholder={t.childNicknamePlaceholder}
                className="w-full p-4 bg-white border-2 border-emerald-50 rounded-2xl focus:border-emerald-400 outline-none font-bold text-black"
              />
              
              <div className="pt-4 border-t border-emerald-50 space-y-4 animate-in fade-in zoom-in duration-300">
                <p className="text-[10px] font-black uppercase text-gray-400 text-center tracking-widest">How far along are you?</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      max="42" 
                      value={formData.weeksPregnant}
                      onChange={(e) => setFormData({...formData, weeksPregnant: parseInt(e.target.value) || 0})}
                      className="w-20 p-4 bg-white border-2 border-emerald-100 rounded-2xl text-2xl font-black text-center text-emerald-700 outline-none"
                    />
                    <span className="font-black text-[10px] uppercase text-emerald-600 tracking-widest">Weeks</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      max="6" 
                      value={formData.daysPregnant}
                      onChange={(e) => setFormData({...formData, daysPregnant: parseInt(e.target.value) || 0})}
                      className="w-20 p-4 bg-white border-2 border-emerald-100 rounded-2xl text-2xl font-black text-center text-emerald-700 outline-none"
                    />
                    <span className="font-black text-[10px] uppercase text-emerald-600 tracking-widest">Days</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="p-4 bg-gray-100 text-gray-600 rounded-2xl transition-all hover:bg-gray-200"><ArrowLeft /></button>
              <button 
                onClick={nextStep}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg"
              >
                {t.continue}
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 mx-auto">
              <LinkIcon />
            </div>
            <h2 className="text-2xl font-black text-black">{t.yourReferralCode}</h2>
            <p className="text-xs font-bold text-gray-500">{t.shareCodeWithHusband}</p>
            
            <div className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-emerald-200 relative group cursor-pointer" onClick={copyCode}>
              <span className="text-3xl font-black tracking-[0.2em] text-emerald-700">{generatedCode}</span>
              <div className="absolute top-2 right-2 p-2 bg-white rounded-xl shadow-sm text-emerald-600">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={prevStep} className="p-4 bg-gray-100 text-gray-600 rounded-2xl transition-all hover:bg-gray-200"><ArrowLeft /></button>
              <button onClick={handleCompleteMother} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg">{t.onboardingFinish}</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const renderFatherOnboarding = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-4 mx-auto">
              <Sparkles />
            </div>
            <h2 className="text-3xl font-black text-black text-center">{t.onboardingName}</h2>
            <input 
              type="text" 
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              placeholder="Your Full Name" 
              className="w-full p-5 bg-white border-2 border-teal-100 rounded-2xl focus:border-teal-400 outline-none text-xl text-center text-black font-bold shadow-sm"
            />
            <div className="flex gap-4">
              <button onClick={onBack} className="p-4 bg-gray-100 text-gray-600 rounded-2xl transition-all hover:bg-gray-200"><ArrowLeft /></button>
              <button 
                disabled={!formData.userName}
                onClick={nextStep}
                className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-teal-100 active:scale-95 transition-all"
              >
                {t.continue}
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-500 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-4 mx-auto">
              <LinkIcon />
            </div>
            <h2 className="text-2xl font-black text-black">{t.onboardingReferralCode}</h2>
            <p className="text-xs font-bold text-gray-500">{t.referralCodeHint}</p>
            
            <input 
              type="text" 
              value={formData.inputCode}
              onChange={(e) => setFormData({...formData, inputCode: e.target.value.toUpperCase()})}
              placeholder="GRATIA-XXXX" 
              className="w-full p-5 bg-white border-2 border-teal-100 rounded-2xl focus:border-teal-400 outline-none text-xl text-center text-black font-bold shadow-sm uppercase"
            />

            <div className="flex gap-4">
              <button onClick={prevStep} className="p-4 bg-gray-100 text-gray-600 rounded-2xl transition-all hover:bg-gray-200"><ArrowLeft /></button>
              <button 
                disabled={!formData.inputCode}
                onClick={handleCompleteFather} 
                className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg"
              >
                {t.onboardingFinish}
              </button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f1] via-white to-[#f0fdfa] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-emerald-100/50 max-w-lg w-full border border-emerald-50 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-100 rounded-full blur-3xl opacity-40"></div>
        
        <div className="relative z-10">
          <div className="mb-12 flex justify-center">
            <Logo className="text-4xl" />
          </div>

          <div className="mb-8 flex justify-between px-4">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 mx-1 rounded-full transition-all duration-500 ${
                  step >= i 
                    ? (role === UserRole.MOTHER ? 'bg-emerald-500' : 'bg-teal-500') 
                    : 'bg-gray-100'
                }`} 
              />
            ))}
          </div>

          {role === UserRole.MOTHER ? renderMotherOnboarding() : renderFatherOnboarding()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

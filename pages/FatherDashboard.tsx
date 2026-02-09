
import React, { useState, useEffect, useRef } from 'react';
import { SharedData, PartnerMessage, UserRole, ChatMessage } from '../types';
import { FATHER_MOMENT_CATEGORIES, FEATURED_ARTICLES, CHILD_PHASES } from '../constants';
import { generateFatherTips, generateCustomGuide } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { translations } from '../translations';
import { 
  Loader2, MapPin, Navigation, Home, Search, LogOut,
  Send, Activity, Footprints, Users, Camera, Smile, Trash2, Plus, MessageCircle, Sparkle, Locate, X, Heart, HeartPulse, MessageSquareHeart, Navigation2, HelpCircle, Droplets, Bot, Sparkles, Highlighter, PenLine, BrainCircuit, Clock, Edit3, Calendar, Baby, CheckCircle2, Hospital, RefreshCw, History, BellRing, Stethoscope, ChevronDown, Gift, Info, ClipboardCheck, BookMarked
} from 'lucide-react';
import Logo from './Logo';

interface Props { 
  data: SharedData;
  onUpdate: (updates: Partial<SharedData>) => void;
  onLogout: () => void;
}

type TabType = 'home' | 'track' | 'library' | 'insights' | 'journey' | 'chat';

const FatherDashboard: React.FC<Props> = ({ data, onUpdate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [aiTip, setAiTip] = useState<string>('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  
  const [consultInput, setConsultInput] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [customEncouragement, setCustomEncouragement] = useState('');
  
  const [readingArticle, setReadingArticle] = useState<{title: string, content: string, category?: string} | null>(null);
  const [guideQuestion, setGuideQuestion] = useState('');
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  
  const [isLocating, setIsLocating] = useState(false);
  const [kickExplanation] = useState<string>("Child kicks are a beautiful sign that your little one is developing well!");

  // Manual Birth Date States
  const [manualBirthDate, setManualBirthDate] = useState(data.birthDate ? data.birthDate.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);

  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editDate, setEditDate] = useState('');

  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const consultEndRef = useRef<HTMLDivElement>(null);
  const t = translations[data.language || 'en'];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayKickEntry = (data.kickCountHistory || []).find(h => h.date === todayStr);
  const currentKicks = todayKickEntry?.count || 0;

  const latestPartnerMessage = (data.partnerMessages || []).find(m => m.sender !== data.userName) || null;

  useEffect(() => {
    if (activeTab === 'chat') { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }
    if (activeTab === 'library') { consultEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }
  }, [activeTab, data.chatMessages, data.aiConsultHistory]);

  useEffect(() => { 
    if (data.currentMood || data.isPeriodNotified) { fetchTips(); } 
  }, [data.currentMood, data.isPeriodNotified]);

  const fetchTips = async () => {
    setIsLoadingTip(true);
    const tip = await generateFatherTips(data.currentMood, data.isPostPregnant, data.isPeriodNotified, 'en');
    setAiTip(tip || "Support your wife today.");
    setIsLoadingTip(false);
  };

  const handleConsultAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultInput.trim() || isConsulting) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), senderRole: UserRole.FATHER, senderName: data.userName, text: consultInput, timestamp: new Date().toISOString() };
    const newHistory = [...(data.aiConsultHistory || []), userMsg];
    onUpdate({ aiConsultHistory: newHistory });
    setConsultInput('');
    setIsConsulting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: consultInput, config: { systemInstruction: "You are Gratia AI, a supportive parenting coach for fathers." } });
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), senderRole: 'AI', senderName: 'Gratia Coach', text: response.text || "I'm sorry, I couldn't process that.", timestamp: new Date().toISOString() };
      onUpdate({ aiConsultHistory: [...newHistory, aiMsg] });
    } finally { setIsConsulting(false); }
  };

  const handleGenerateCustomGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideQuestion.trim() || isGeneratingGuide) return;
    setIsGeneratingGuide(true);
    try {
      const result = await generateCustomGuide(guideQuestion, UserRole.FATHER, data.language);
      if (result) { setReadingArticle(result); setGuideQuestion(''); }
    } finally { setIsGeneratingGuide(false); }
  };

  const handleViewWifeOnMap = () => {
    if (!data.motherLocation) return;
    const { lat, lng } = data.motherLocation;
    setMapLocation({ lat, lng });
    setShowMapModal(true);
  };

  const handleOpenMapInNewTab = () => {
    if (!mapLocation) return;
    window.open(`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { 
        onUpdate({ isFatherLocationSharing: true, fatherLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude, lastUpdated: new Date().toISOString() } }); 
        setIsLocating(false); 
      }, 
      () => setIsLocating(false),
      { maximumAge: 60000, timeout: 10000, enableHighAccuracy: true } // Added options for faster buffer
    );
  };

  const handleUpdateBirthDate = () => {
    onUpdate({
      birthDate: new Date(manualBirthDate).toISOString()
    });
    setIsEditingBirthDate(false);
  };

  const sendEncouragementToWife = (text: string) => {
    const newMessage: PartnerMessage = { id: Date.now().toString(), type: 'custom', text, sender: data.userName, timestamp: new Date().toISOString() };
    onUpdate({ partnerMessages: [newMessage, ...(data.partnerMessages || [])] });
    setCustomEncouragement('');
  };

  const handleRecordKick = () => {
    const date = new Date().toISOString().split('T')[0];
    const history = data.kickCountHistory || [];
    const idx = history.findIndex(h => h.date === date);
    const updated = idx > -1 ? history.map((h, i) => i === idx ? { ...h, count: h.count + 1 } : h) : [{ date, count: 1 }, ...history];
    onUpdate({ kickCountHistory: updated });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), senderRole: UserRole.FATHER, senderName: data.userName, text: chatInput, timestamp: new Date().toISOString() };
    onUpdate({ chatMessages: [...(data.chatMessages || []), msg] });
    setChatInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, phase: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newPhoto = { 
        id: `photo-${Date.now()}`, 
        url: base64, 
        caption: 'Wonderful moment', 
        date: new Date().toISOString().split('T')[0], 
        phase 
      };
      onUpdate({ photoJourney: [...(data.photoJourney || []), newPhoto] });
    };
    reader.readAsDataURL(file);
  };

  const startEditPhoto = (photo: any) => { setEditingPhotoId(photo.id); setEditCaption(photo.caption); setEditDate(photo.date); };
  const saveEditedPhoto = () => { if (!editingPhotoId) return; const updated = (data.photoJourney || []).map(p => p.id === editingPhotoId ? { ...p, caption: editCaption, date: editDate } : p); onUpdate({ photoJourney: updated }); setEditingPhotoId(null); };

  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center gap-1 p-2 transition-all shrink-0 ${activeTab === id ? 'text-teal-600 scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}>
      <Icon size={20} className="text-black" /><span className="text-[8px] font-black uppercase tracking-tighter text-black">{label}</span>
    </button>
  );

  const renderHome = () => {
    const allCheckups = (data.checkups || [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const isPregnant = !data.isPostPregnant && !!data.pregnancyStartDate;

    // Countdown logic
    const today = new Date();
    const dueDate = new Date(data.expectedDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const countdown = diffDays > 0 ? diffDays : 0;

    // Dynamic Age calculation
    let currentWeeks = 0;
    let currentDays = 0;
    if (isPregnant) {
      const startDate = new Date(data.pregnancyStartDate);
      const diffSinceStart = today.getTime() - startDate.getTime();
      const totalDaysSinceStart = Math.floor(diffSinceStart / (1000 * 60 * 60 * 24));
      currentWeeks = Math.floor(totalDaysSinceStart / 7);
      currentDays = totalDaysSinceStart % 7;
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-center px-2">
          <Logo className="text-2xl" />
          <button onClick={onLogout} className="p-3 bg-white border border-gray-100 text-black hover:text-red-500 rounded-2xl transition-all shadow-sm"><LogOut size={20} /></button>
        </div>

        <div className={`rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden transition-all duration-700 ${data.isPostPregnant ? 'bg-gradient-to-br from-teal-900 to-emerald-700' : 'bg-gradient-to-br from-teal-800 to-emerald-600'}`}>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black mb-1 text-white">{t.hi}, Dad {data.userName} 👋</h1>
              <p className="opacity-90 font-bold text-lg text-white">
                {data.childName} ({data.childNickname})
              </p>
              {isPregnant && (
                <div className="space-y-1 mt-4">
                  <p className="text-sm font-black uppercase tracking-widest opacity-80">{currentWeeks} Weeks, {currentDays} Days Pregnant</p>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/20 mt-4 inline-block">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Days until Birth</p>
                     <p className="text-3xl font-black">{countdown}</p>
                  </div>
                </div>
              )}
              {data.isPostPregnant && data.birthDate && (
                <p className="text-[10px] font-black uppercase opacity-60 mt-1">Birth Recorded: {new Date(data.birthDate).toLocaleDateString()}</p>
              )}
            </div>
            <div className="shrink-0 flex flex-col gap-2">
              {data.isPostPregnant && (
                <div className="flex flex-col gap-2">
                  {isEditingBirthDate ? (
                    <div className="flex flex-col gap-3 p-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-widest">Update Birth Date:</p>
                      <input 
                        type="date" 
                        value={manualBirthDate} 
                        onChange={e => setManualBirthDate(e.target.value)}
                        className="bg-white/20 text-white p-2 rounded-xl outline-none font-bold text-xs"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleUpdateBirthDate} className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase">Save</button>
                        <button onClick={() => setIsEditingBirthDate(false)} className="flex-1 bg-white/30 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase">Close</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setIsEditingBirthDate(true)} className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-2 rounded-2xl flex items-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest border border-white/20 shadow-lg active:scale-95"><Edit3 size={16} /> Edit Date</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ... rest of existing renderHome ... */}
        {data.isPeriodNotified && (
          <div className="bg-red-50 p-8 rounded-[2.5rem] border-2 border-red-100 shadow-sm relative overflow-hidden group animate-in slide-in-from-top duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Droplets size={60} className="text-red-500" /></div>
            <div className="flex items-start gap-4">
               <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg"><Droplets size={24} className="animate-pulse" /></div>
               <div className="space-y-1">
                 <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest">{t.mensFeature} Alert</h3>
                 <p className="text-sm font-bold text-black leading-relaxed">{t.extraGentle}</p>
                 {data.periodAnnouncedAt && (
                   <p className="text-[8px] font-bold text-red-400 uppercase tracking-widest mt-1">Announced: {new Date(data.periodAnnouncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                 )}
               </div>
            </div>
          </div>
        )}

        {data.isPostPregnant && (
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-teal-50 shadow-sm relative overflow-hidden group animate-in slide-in-from-bottom duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Info size={60} className="text-teal-600" /></div>
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-2"><HeartPulse size={14} /> Wife Recovery Info</h3>
              <p className="text-sm font-bold text-black leading-relaxed">
                The optimal time interval for pregnancy after childbirth is 18–24 months (1.5 to 2 years) to allow the mother's body to recover and minimize health risks to the fetus, such as premature birth. Too close a gap (less than 6 months) carries the risk of complications, while too close a gap (more than 5 years) is also risky, especially for mothers over 35.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
          <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2"><Calendar size={14} className="text-teal-600" /> Checkup History Log</h3>
          <div className="space-y-6">
            {allCheckups.length > 0 ? (
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Wife's Logs</p>
                {allCheckups.map(checkup => (
                  <div key={checkup.id} className="p-5 rounded-3xl border border-transparent bg-gratia-green group hover:border-teal-50 transition-all flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm shrink-0"><History size={18} /></div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-700 mb-0.5">{checkup.doctorName} • {checkup.hospital}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(checkup.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {checkup.notes && (
                      <div className="p-4 bg-white/60 rounded-2xl border border-teal-50/50 shadow-inner">
                        <p className="text-[9px] font-black text-teal-700 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><MessageCircle size={12} /> Appointment Note</p>
                        <p className="text-sm font-bold text-black leading-relaxed italic">{checkup.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No history recorded yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-pink-50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquareHeart size={60} className="text-pink-600" /></div>
          <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><Heart size={14} className="text-pink-500" /> {t.encouragementToWife}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {["You're doing amazing, honey! ❤️", "I'm so proud of you.", "You look beautiful today.", "Can I get you anything?"].map((text, idx) => (
                <button key={idx} onClick={() => sendEncouragementToWife(text)} className="p-3 bg-pink-50 text-pink-800 rounded-2xl text-[9px] font-black uppercase text-left border border-pink-100 hover:bg-pink-100 transition-all active:scale-95 shadow-sm">{text}</button>
              ))}
            </div>
            <div className="relative">
              <input type="text" value={customEncouragement} onChange={(e) => setCustomEncouragement(e.target.value)} placeholder="Write a loving note..." className="w-full p-4 pr-12 bg-gray-50 rounded-2xl outline-none font-bold text-xs text-black border border-transparent focus:border-pink-200" onKeyDown={(e) => e.key === 'Enter' && customEncouragement.trim() && sendEncouragementToWife(customEncouragement)} />
              <button onClick={() => customEncouragement.trim() && sendEncouragementToWife(customEncouragement)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-pink-600"><Send size={20} /></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div><h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={14} className="text-emerald-600" /> {t.wifeLocation}</h3>{data.isMotherLocationSharing && data.motherLocation ? (<div className="space-y-2"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><p className="text-xs font-black text-black">Safe & Live</p></div><p className="text-[10px] font-bold text-black uppercase">Lat: {data.motherLocation.lat.toFixed(4)} / Lng: {data.motherLocation.lng.toFixed(4)}</p></div>) : (<p className="text-[10px] font-black text-black uppercase italic">Wife is not sharing location</p>)}</div>
            <button onClick={handleViewWifeOnMap} disabled={!data.isMotherLocationSharing || !data.motherLocation} className="mt-4 p-3 bg-gray-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"><Navigation2 size={12} /> View on Map</button>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-teal-50 shadow-sm flex flex-col justify-between">
            <div><h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><Locate size={14} className="text-teal-600" /> {t.shareMyLocation}</h3><p className="text-[10px] font-bold text-black mb-4">Let your wife know your position.</p></div><button onClick={handleShareLocation} disabled={isLocating} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isLocating ? 'bg-gray-100' : 'bg-teal-800 text-white'}`}>{isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />} {isLocating ? 'Locating...' : 'Update My Location'}</button>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-pink-50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><MessageSquareHeart className="text-pink-500" size={80} /></div>
          <div className="relative z-10 text-black">
            <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-pink-500 rounded-2xl text-white shadow-lg"><Heart size={24} /></div><div><h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">{t.messageFromWife}</h3><p className="text-[10px] font-bold text-black uppercase tracking-widest">{t.messageFromPartner}</p></div></div>
            <div className="p-8 bg-gradient-to-br from-pink-50 to-white rounded-[2.5rem] border border-pink-100 shadow-inner"><p className="text-xl md:text-2xl font-bold text-pink-950 leading-relaxed italic text-balance">{latestPartnerMessage ? `"${latestPartnerMessage.text}"` : "Wife hasn't sent a specific note today."}</p></div>
          </div>
        </div>
      </div>
    );
  };

  // ... rest of component
  const renderTrack = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      <h2 className="text-2xl font-black text-black">{t.track}</h2>
      <div className="bg-teal-800 p-8 rounded-[3rem] text-white text-center shadow-xl relative overflow-hidden">
        <Footprints size={48} className="mx-auto mb-4"/><h3 className="text-xl font-black mb-1 text-white">{t.kickCounter}</h3><p className="text-[10px] font-bold uppercase opacity-60 mb-6 tracking-widest text-white">Today: {todayStr}</p><div className="text-7xl font-black mb-8 text-white">{currentKicks}</div><button onClick={handleRecordKick} className="w-full py-5 bg-white text-teal-900 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95">{t.recordKick}</button>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm"><h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><Clock size={14} className="text-teal-600" /> Kick History</h3><div className="space-y-2">{(data.kickCountHistory || []).slice(0, 7).map((entry, idx) => (<div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent"><span className="text-xs font-bold text-black">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span><span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-[10px] font-black uppercase tracking-widest">{entry.count} Kicks</span></div>))}{(data.kickCountHistory || []).length === 0 && <p className="text-[10px] font-bold text-gray-400 italic text-center p-4">No records yet.</p>}</div></div>
    </div>
  );

  const renderConsultAI = () => (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-t-[3rem] border-b border-gray-100 flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-teal-800 rounded-2xl flex items-center justify-center text-white"><Bot size={24} /></div><div><h2 className="text-lg font-black text-black">{t.consultAi}</h2><p className="text-[8px] font-black text-teal-800 uppercase tracking-widest">Parenting & Marriage Advisor</p></div></div><button onClick={() => onUpdate({ aiConsultHistory: [] })} className="p-2 text-black hover:text-red-500"><Trash2 size={18} /></button></div>
      <div className="overflow-y-auto h-[400px] p-6 space-y-6 bg-white/50">{(data.aiConsultHistory || []).map(msg => (<div key={msg.id} className={`flex flex-col ${msg.senderRole === UserRole.FATHER ? 'items-end' : 'items-start'}`}><span className="text-[8px] font-black text-gray-400 uppercase mb-1 px-2">{msg.senderName}</span><div className={`p-4 rounded-[1.8rem] max-w-[90%] text-sm font-bold shadow-sm ${msg.senderRole === UserRole.FATHER ? 'bg-teal-800 text-white rounded-tr-none' : 'bg-white text-black border border-teal-50 rounded-tl-none whitespace-pre-line'}`}>{msg.text}</div></div>))}{isConsulting && <div className="flex items-center gap-2 p-4 bg-white border border-teal-50 rounded-[1.8rem] text-[10px] font-black text-teal-800 uppercase animate-pulse"><Loader2 size={14} className="animate-spin" /> Coach is reflecting...</div>}<div ref={consultEndRef} /></div>
      <form onSubmit={handleConsultAI} className="p-4 bg-white rounded-b-[3rem] border-t border-gray-100 flex gap-2"><input type="text" value={consultInput} onChange={(e) => setConsultInput(e.target.value)} placeholder="Ask Coach anything..." className="flex-1 p-5 bg-gratia-green rounded-2xl outline-none font-bold text-sm text-black border border-gray-100" /><button type="submit" disabled={isConsulting || !consultInput.trim()} className="p-5 bg-teal-800 text-white rounded-2xl shadow-lg active:scale-95 transition-all"><Send size={20}/></button></form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7fbf8] pb-32">
      {showMapModal && mapLocation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => { setShowMapModal(false); setMapLocation(null); }}
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 border border-teal-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center gap-2 shrink-0">
              <h3 className="text-lg font-black text-black flex items-center gap-2"><MapPin size={20} className="text-emerald-600" /> {t.wifeLocation}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleOpenMapInNewTab} className="p-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 hover:bg-emerald-700 transition-colors">
                  <Navigation2 size={14} /> Open in Google Maps
                </button>
                <button onClick={() => { setShowMapModal(false); setMapLocation(null); }} className="p-2.5 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-colors"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 min-h-[320px] w-full relative">
              <iframe
                title="Wife location map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLocation.lng - 0.02},${mapLocation.lat - 0.02},${mapLocation.lng + 0.02},${mapLocation.lat + 0.02}&layer=mapnik&marker=${mapLocation.lat},${mapLocation.lng}`}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      )}
      {readingArticle && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setReadingArticle(null)}
        >
          <div 
            className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 border border-teal-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-start gap-4">
              <h3 className="text-2xl font-black text-black leading-tight flex-1">{readingArticle.title}</h3>
              <button 
                onClick={() => setReadingArticle(null)} 
                className="p-3 bg-gray-50 text-black rounded-2xl hover:bg-gray-100 transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0 border border-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 prose prose-teal max-w-none">
              <p className="text-base text-black font-bold leading-relaxed whitespace-pre-line text-balance">
                {readingArticle.content}
              </p>
              <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                 <button onClick={() => setReadingArticle(null)} className="px-8 py-3 bg-teal-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95">Finish Reading</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'track' && renderTrack()}
        {activeTab === 'library' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20"><div className="flex items-center justify-between"><h2 className="text-2xl font-black text-black">{t.education}</h2><div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full text-teal-700 font-black text-[10px] uppercase tracking-widest border border-teal-100 shadow-sm"><Sparkle size={12} /> AI Powered</div></div><div className="bg-white p-6 rounded-[3rem] border border-teal-100 shadow-sm relative overflow-hidden">{isGeneratingGuide && (<div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center animate-in fade-in"><PenLine size={48} className="text-emerald-600 animate-bounce mb-4" /><p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Coach is writing your guide...</p></div>)}<h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><Highlighter size={14} className="text-emerald-500" /> Ask a Question</h3><form onSubmit={handleGenerateCustomGuide} className="flex gap-2"><input type="text" value={guideQuestion} onChange={(e) => setGuideQuestion(e.target.value)} placeholder="e.g. How to help wife during birth?" className="flex-1 p-5 bg-gratia-green rounded-2xl outline-none font-bold text-sm text-black border border-gray-100 focus:bg-white" /><button type="submit" disabled={!guideQuestion.trim() || isGeneratingGuide} className="p-5 bg-teal-800 text-white rounded-2xl shadow-lg active:scale-95"><Sparkles size={20} /></button></form></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{FEATURED_ARTICLES[UserRole.FATHER].map(article => (<div key={article.id} onClick={() => setReadingArticle(article)} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-teal-50 group hover:shadow-md transition-all cursor-pointer"><span className="px-3 py-1 bg-teal-50 text-teal-600 text-[8px] font-black uppercase rounded-full mb-4 inline-block">{article.category}</span><h5 className="font-black text-sm text-black mb-2 group-hover:text-teal-600 transition-colors">{article.title}</h5><p className="text-xs font-bold text-black opacity-70 line-clamp-2">{article.content}</p></div>))}</div><div className="mt-16 pt-16 border-t border-teal-100"><div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-teal-800 rounded-2xl flex items-center justify-center text-white"><Bot size={20} /></div><div><h3 className="text-lg font-black text-black">Chat with Coach</h3><p className="text-[10px] font-bold text-teal-800 uppercase tracking-widest">Personalized Family Advice</p></div></div><div className="bg-white rounded-[3rem] border border-teal-50 shadow-sm overflow-hidden">{renderConsultAI()}</div></div></div>
        )}
        {activeTab === 'insights' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
            <h2 className="text-2xl font-black text-black">{t.familyInsights}</h2>
            
            {/* WIFE MOOD SECTION */}
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-emerald-50 relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase text-black mb-6 tracking-widest flex items-center gap-2"><Smile size={14} className="text-emerald-500" /> {t.wifeMoodToday}</h3>
              <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner">
                <span className="text-6xl">{data.currentMood.split(' ')[0]}</span>
                <div><p className="text-2xl font-black text-black tracking-tight">{data.currentMood.split(' ')[1] || 'Mood Recorded'}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shared from wife's diary</p></div>
              </div>

              {/* SERVING GUIDE / TIPS SECTION */}
              <div className="bg-teal-50 p-8 rounded-[2.5rem] border border-teal-100 relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                {isLoadingTip ? (
                  <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><BrainCircuit size={28} className="text-teal-600 animate-pulse" /></div><p className="text-[9px] font-black text-teal-900 uppercase tracking-widest animate-pulse">Consulting Gratia Wisdom...</p></div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black uppercase text-teal-800 tracking-widest flex items-center gap-2 relative z-10"><Sparkle size={14} /> AI How to Serve Guide</h4>
                      {data.isPeriodNotified && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[8px] font-black uppercase">Period Specific Tips</span>}
                    </div>
                    <div className="relative z-10 bg-white/40 p-6 rounded-3xl backdrop-blur-sm border border-white/50 shadow-inner">
                      <p className="text-sm font-bold text-teal-950 leading-relaxed italic whitespace-pre-line">{aiTip ? aiTip : "Support your wife with extra patience today."}</p>
                    </div>
                    <button onClick={fetchTips} className="mt-4 self-end flex items-center gap-1 text-[8px] font-black uppercase text-teal-600 tracking-widest hover:text-teal-800 transition-colors"><RefreshCw size={10} /> Refresh Advice</button>
                  </>
                )}
              </div>
            </div>

            {/* PERIOD SUPPORT INFO FOR HUSBAND */}
            {data.isPeriodNotified && (
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-red-50 animate-in zoom-in duration-500">
                <h3 className="text-[10px] font-black uppercase text-red-600 mb-4 tracking-widest flex items-center gap-2"><HeartPulse size={14} /> Period Support Essentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-red-50 rounded-[2rem] border border-red-100">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-red-800 mb-2">Physical Comfort</h4>
                    <p className="text-xs font-bold text-black opacity-80 leading-relaxed">Consider bringing her a heating pad, staying on top of her hydration, or offering a back massage.</p>
                  </div>
                  <div className="p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-800 mb-2">Mental Space</h4>
                    <p className="text-xs font-bold text-black opacity-80 leading-relaxed">Lower her load today. Take over house chores or child-related tasks without being asked.</p>
                  </div>
                </div>
              </div>
            )}
          </div >
        )}
        {activeTab === 'journey' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
            <h2 className="text-2xl font-black text-black">{t.photoJourney}</h2>

            {FATHER_MOMENT_CATEGORIES.map(category => (
              <div key={category} className="bg-white p-8 rounded-[3rem] shadow-sm mb-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase text-teal-600 tracking-widest">{category}</h3>
                  <label className="p-3 bg-teal-900 text-white rounded-xl cursor-pointer hover:bg-teal-950 transition-all shadow-lg active:scale-95">
                    <Plus size={16}/>
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, category)}/>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(data.photoJourney || []).filter(p => p.phase === category).reverse().map(p => (
                    <div key={p.id} className="bg-gray-50 rounded-[2.5rem] overflow-hidden group shadow-sm border border-gray-100 relative">
                      <img src={p.url} className="w-full h-56 object-cover" alt={p.caption}/>
                      {editingPhotoId === p.id ? (
                        <div className="p-5 bg-white space-y-3 animate-in fade-in">
                          <input type="text" value={editCaption} onChange={e => setEditCaption(e.target.value)} className="w-full p-2 bg-gratia-green rounded-xl text-xs font-bold border border-gray-100 focus:bg-white text-black" placeholder="Edit caption..." /><input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full p-2 bg-gratia-green rounded-xl text-xs font-bold border border-gray-100 focus:bg-white text-black" /><div className="flex gap-2"><button onClick={saveEditedPhoto} className="flex-1 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase">Save</button><button onClick={() => setEditingPhotoId(null)} className="flex-1 py-2 bg-gray-100 text-black rounded-xl text-[10px] font-black uppercase">Cancel</button></div>
                        </div>
                      ) : (
                        <div className="p-5 flex justify-between items-start"><div><p className="text-xs font-black text-black mb-1">{p.caption}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> {p.date}</p></div><button onClick={() => startEditPhoto(p)} className="p-2 bg-teal-50 text-teal-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Edit3 size={14} /></button></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-220px)] flex flex-col animate-in fade-in duration-500"><div className="bg-white p-6 rounded-t-[3rem] border-b border-gray-100 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Users size={20} /></div><div><h2 className="text-lg font-black text-black">{t.chatWife}</h2><p className="text-[8px] font-black text-teal-600 uppercase tracking-[0.2em]">Connected</p></div></div></div><div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/50">{(data.chatMessages || []).map(msg => (<div key={msg.id} className={`flex flex-col ${msg.senderRole === UserRole.FATHER ? 'items-end' : 'items-start'}`}><span className="text-[8px] font-black text-black uppercase mb-1 px-2">{msg.senderName}</span><div className={`p-4 rounded-[1.5rem] max-w-[85%] text-sm font-bold shadow-sm ${msg.senderRole === UserRole.FATHER ? 'bg-teal-800 text-white rounded-tr-none' : 'bg-white text-black border border-gray-100 rounded-tl-none'}`}>{msg.text}</div></div>))}<div ref={chatEndRef} /></div><form onSubmit={handleSendChat} className="p-4 bg-white rounded-b-[3rem] border-t border-gray-100 flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Message Wife..." className="flex-1 p-5 bg-gratia-green rounded-2xl outline-none font-bold text-sm text-black border border-gray-100" /><button type="submit" className="p-5 bg-teal-800 text-white rounded-2xl shadow-lg active:scale-95 transition-all"><Send size={20}/></button></form></div>
        )}
      </main>
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-lg max-w-lg bg-white/90 backdrop-blur-xl border border-white/20 p-2 rounded-[2.5rem] shadow-2xl flex justify-around items-center z-50 overflow-x-auto">
        <TabButton id="home" label={t.home} icon={Home} /><TabButton id="track" label={t.track} icon={Activity} /><TabButton id="library" label="Guide" icon={Search} /><TabButton id="insights" label="Insights" icon={Users} /><TabButton id="journey" label="Photos" icon={Camera} /><TabButton id="chat" label="Chat" icon={MessageCircle} />
      </nav>
    </div>
  );
};

export default FatherDashboard;

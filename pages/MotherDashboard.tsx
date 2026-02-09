
import React, { useState, useEffect, useRef } from 'react';
import { SharedData, Recipe, MoodEntry, UserRole, ChatMessage, PartnerMessage, CheckupEntry, ChildInfo } from '../types';
import { CHILD_PHASES, FEATURED_ARTICLES } from '../constants';
import { generateMealMenu, generateMealImage, generateDailyMoodAdvice, generateCustomGuide } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { translations } from '../translations';
import { 
  Plus, Loader2, MapPin, Navigation, Send, LogOut, ChevronLeft, ChevronRight, Search,
  Home, Soup, Smile, Users, BookMarked, X, Check, MessageCircle, HeartPulse, Sparkle, Utensils, Locate, Camera, Heart, MessageSquareHeart, Navigation2, Sparkles, ChefHat, Link as LinkIcon, Copy, Bot, BrainCircuit, Droplets, ListTodo, Baby, RefreshCw, FlameKindling, Leaf, Highlighter, PenLine, Trash2, AlertCircle, Edit3, Calendar, Hospital, CheckCircle2, History, BellRing, Stethoscope, ChevronDown, Info
} from 'lucide-react';
import Logo from './Logo';

// ... (Keep existing constants and interfaces)
const FEATURED_RECIPES_DATA: Record<string, Recipe> = {
  "Salmon Avocado Toast": {
    title: "Salmon Avocado Toast",
    ingredients: ["2 slices Whole-grain bread", "1 ripe Avocado", "100g Smoked salmon", "1 tsp Lemon juice", "Fresh dill for garnish", "Pinch of black pepper"],
    instructions: ["Toast the whole-grain bread slices until golden brown.", "In a small bowl, mesh the avocado with lemon juice and pepper.", "Spread the mashed avocado evenly over the warm toast.", "Top with generous layers of smoked salmon.", "Garnish with fresh dill and serve immediately."],
    benefits: "Rich in DHA and healthy fats crucial for child's brain development and your cardiovascular health."
  },
  "Indonesian Chicken Soup": {
    title: "Indonesian Chicken Soup (Soto Ayam)",
    ingredients: ["500g Chicken breast", "2L Water", "Aromatic spices (Ginger, Turmeric, Galangal)", "Cabbage and bean sprouts", "Glass noodles", "Boiled eggs"],
    instructions: ["Boil chicken with salt and aromatic spices until tender.", "Shred the chicken and set aside.", "Strain the broth to get a clear, nutritious soup.", "Arrange noodles, cabbage, and shredded chicken in a bowl.", "Pour hot broth over the top and add a halved boiled egg."],
    benefits: "Warm, hydrating, and easy to digest protein—perfect for postpartum recovery and milk production."
  },
  "Spinate & Berry Smoothie": {
    title: "Iron-Boost Spinach & Berry Smoothie",
    ingredients: ["1 cup Fresh baby spinach", "1/2 cup Mixed frozen berries", "1 cup Greek yogurt", "1/2 cup Almond milk", "1 tsp Chia seeds"],
    instructions: ["Wash the spinach thoroughly.", "Combine all ingredients in a high-speed blender.", "Blend until completely smooth and creamy.", "Pour into a chilled glass and enjoy fresh for maximum nutrient absorption."],
    benefits: "An iron-packed energy boost that fights pregnancy fatigue and provides essential folate."
  }
};

const featuredRecipes = [
  { title: "Salmon Avocado Toast", description: "Brain-boosting DHA and healthy fats.", icon: <Utensils size={24} />, color: "bg-orange-50", hoverColor: "hover:border-orange-200" },
  { title: "Indonesian Chicken Soup", description: "Warm, digestible protein for recovery.", icon: <Soup size={24} />, color: "bg-emerald-50", hoverColor: "hover:border-emerald-200" },
  { title: "Spinach & Berry Smoothie", description: "Iron-packed energy for pregnancy fatigue.", icon: <Leaf size={24} />, color: "bg-teal-50", hoverColor: "hover:border-teal-200" }
];

interface Props {
  data: SharedData;
  user?: { userName?: string } | null;
  onUpdate: (updates: Partial<SharedData>) => void;
  onLogout: () => void;
}

type TabType = 'home' | 'menu' | 'wellbeing' | 'library' | 'journey' | 'chat';

const MotherDashboard: React.FC<Props> = ({ data, user, onUpdate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [customMenuRequest, setCustomMenuRequest] = useState('');
  const [menuMode, setMenuMode] = useState<'category' | 'title' | null>(null);
  const [dailyAdvice, setDailyAdvice] = useState<string | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<MoodEntry | null>(null);
  const [consultInput, setConsultInput] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [currentJournalNote, setCurrentJournalNote] = useState('');
  const [readingArticle, setReadingArticle] = useState<{title: string, content: string, category?: string} | null>(null);
  const [guideQuestion, setGuideQuestion] = useState('');
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [customSupportText, setCustomSupportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConfirmingBirth, setIsConfirmingBirth] = useState(false);
  
  // Manual Birth Date States
  const [manualBirthDate, setManualBirthDate] = useState(data.birthDate ? data.birthDate.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [isEditingBirthDate, setIsEditingBirthDate] = useState(false);

  // Child Settings States
  const [editChildName, setEditChildName] = useState(data.childName || '');
  const [editChildNickname, setEditChildNickname] = useState(data.childNickname || '');
  const [editWeeks, setEditWeeks] = useState(data.pregnancyAgeWeeks || 12);
  const [editDays, setEditDays] = useState(data.pregnancyAgeDays || 0);
  const [isEditingChildInfo, setIsEditingChildInfo] = useState(false);

  // Photo editing state
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editDate, setEditDate] = useState('');
  
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildData, setNewChildData] = useState<Partial<ChildInfo>>({ name: '', nickname: '', status: 'expecting', date: new Date().toISOString().split('T')[0] });
  const [showCheckupForm, setShowCheckupForm] = useState(false);
  const [newCheckup, setNewCheckup] = useState<Partial<CheckupEntry>>({ doctorName: '', hospital: '', date: new Date().toISOString().slice(0, 16), notes: '' });

  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const consultEndRef = useRef<HTMLDivElement>(null);
  const t = translations[data.language || 'en'] as any;

  const latestLoveFromHusband = (data.partnerMessages || [])
    .find(m => m.sender !== data.userName && m.type === 'custom') || null;

  const latestPartnerMessage = (data.partnerMessages || [])
    .find(m => m.sender !== data.userName) || null;

  useEffect(() => {
    if (activeTab === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activeTab === 'wellbeing') consultEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTab, data.chatMessages, data.aiConsultHistory]);

  useEffect(() => {
    setEditChildName(data.childName || '');
    setEditChildNickname(data.childNickname || '');
    setEditWeeks(data.pregnancyAgeWeeks || 12);
    setEditDays(data.pregnancyAgeDays || 0);
  }, [data.childName, data.childNickname, data.pregnancyAgeWeeks, data.pregnancyAgeDays]);

  const calculateChildDays = (dateStr: string, status: 'expecting' | 'born') => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    if (status === 'expecting') {
        const diff = target - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } else {
        const diff = now - target;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
  };

  const formatAge = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const yearStr = years === 1 ? (data.language === 'id' ? 'Tahun' : 'Year') : (data.language === 'id' ? 'Tahun' : 'Years');
      return `${years} ${yearStr}${days % 365 > 0 ? ` ${days % 365} days` : ''}`;
    }
    return `${days} ${t.daysOld}`;
  };

  const handleConsultAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultInput.trim() || isConsulting) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), senderRole: UserRole.MOTHER, senderName: data.userName, text: consultInput, timestamp: new Date().toISOString() };
    const newHistory = [...(data.aiConsultHistory || []), userMsg];
    onUpdate({ aiConsultHistory: newHistory });
    setConsultInput('');
    setIsConsulting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: consultInput, config: { systemInstruction: "You are Gratia AI, a professional parenting and relationship coach." } });
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), senderRole: 'AI', senderName: 'Gratia Coach', text: response.text || "I'm sorry, I couldn't process that.", timestamp: new Date().toISOString() };
      onUpdate({ aiConsultHistory: [...newHistory, aiMsg] });
    } finally { setIsConsulting(false); }
  };

  const handleGiveBirth = (childId: string) => {
    const updated = (data.children || []).map(c => 
      c.id === childId ? { ...c, status: 'born' as const, date: new Date().toISOString().split('T')[0] } : c
    );
    onUpdate({ children: updated });
  };

  const announcePeriod = () => {
    const isNowActive = !data.isPeriodNotified;
    if (isNowActive) {
      const newMessage: PartnerMessage = { id: Date.now().toString(), type: 'period', text: "I'm starting my cycle today (Haid).", sender: data.userName, timestamp: new Date().toISOString() };
      onUpdate({ isPeriodNotified: true, partnerMessages: [newMessage, ...(data.partnerMessages || [])] });
    } else {
      onUpdate({ isPeriodNotified: false });
    }
  };

  const currentUserName = user?.userName ?? data.userName;
  const sendEncouragementToHusband = (text: string) => {
    const newMessage: PartnerMessage = { id: Date.now().toString(), type: 'custom', text, sender: currentUserName, timestamp: new Date().toISOString() };
    onUpdate({ partnerMessages: [newMessage, ...(data.partnerMessages || [])] });
    setCustomSupportText('');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMessage: ChatMessage = { id: Date.now().toString(), senderRole: UserRole.MOTHER, senderName: currentUserName, text: chatInput, timestamp: new Date().toISOString() };
    onUpdate({ chatMessages: [...(data.chatMessages || []), newMessage] });
    setChatInput('');
  };

  const updateMood = (m: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = (data.moodHistory || []).find(h => h.date === today);
    const newEntry = { date: today, mood: m, note: existing?.note || currentJournalNote, aiAdvice: existing?.aiAdvice };
    onUpdate({ currentMood: m, moodHistory: [newEntry, ...(data.moodHistory || []).filter(h => h.date !== today)] });
  };

  const handleSaveJournal = () => {
    const today = new Date().toISOString().split('T')[0];
    const existing = (data.moodHistory || []).find(h => h.date === today);
    const newEntry = { date: today, mood: existing?.mood || data.currentMood, note: currentJournalNote, aiAdvice: existing?.aiAdvice };
    
    // Save Journal First
    onUpdate({ moodHistory: [newEntry, ...(data.moodHistory || []).filter(h => h.date !== today)] });
    
    // Generate Advice
    setIsGeneratingAdvice(true);
    generateDailyMoodAdvice(data.currentMood, currentJournalNote, data.language).then(advice => { 
      setDailyAdvice(advice); 
      setIsGeneratingAdvice(false);
      if (advice) {
        // Update history with advice
        const entryWithAdvice = { ...newEntry, aiAdvice: advice };
        onUpdate({ moodHistory: [entryWithAdvice, ...(data.moodHistory || []).filter(h => h.date !== today)] });
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, phase: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newPhoto = { id: `photo-${Date.now()}`, url: base64, caption: phase === 'Birth' ? 'The day our lives changed forever' : 'Beautiful memory', date: new Date().toISOString().split('T')[0], phase };
      onUpdate({ photoJourney: [...(data.photoJourney || []), newPhoto] });
    };
    reader.readAsDataURL(file);
  };

  const startEditPhoto = (photo: any) => { setEditingPhotoId(photo.id); setEditCaption(photo.caption); setEditDate(photo.date); };
  const saveEditedPhoto = () => { if (!editingPhotoId) return; const updated = (data.photoJourney || []).map(p => p.id === editingPhotoId ? { ...p, caption: editCaption, date: editDate } : p); onUpdate({ photoJourney: updated }); setEditingPhotoId(null); };

  const handleConfirmBirth = () => {
    onUpdate({ isPostPregnant: true, birthDate: new Date(manualBirthDate).toISOString() });
    setIsConfirmingBirth(false);
  };

  const handleUpdateBirthDate = () => {
    onUpdate({ birthDate: new Date(manualBirthDate).toISOString() });
    setIsEditingBirthDate(false);
  };

  const handleSaveChildInfo = () => {
    const today = new Date();
    const totalDaysIn = (editWeeks * 7) + editDays;
    const startDate = new Date(today.getTime() - (totalDaysIn * 24 * 60 * 60 * 1000));
    const dueDate = new Date(startDate.getTime() + (280 * 24 * 60 * 60 * 1000));
    
    onUpdate({
      childName: editChildName,
      childNickname: editChildNickname,
      pregnancyAgeWeeks: editWeeks,
      pregnancyAgeDays: editDays,
      expectedDueDate: dueDate.toISOString(),
      pregnancyStartDate: startDate.toISOString(),
      isPostPregnant: false
    });
    setIsEditingChildInfo(false);
  };

  const handlePregnantAgain = () => {
    onUpdate({
      isPostPregnant: false,
      expectedDueDate: new Date(new Date().setMonth(new Date().getMonth() + 9)).toISOString(),
      birthDate: undefined,
      pregnancyAgeWeeks: 4,
      pregnancyAgeDays: 0
    });
    setEditWeeks(4);
    setEditDays(0);
    setIsEditingChildInfo(true);
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { 
        onUpdate({ isMotherLocationSharing: true, motherLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude, lastUpdated: new Date().toISOString() } }); 
        setIsLocating(false); 
      }, 
      () => setIsLocating(false),
      { maximumAge: 60000, timeout: 10000, enableHighAccuracy: true } // Faster buffer with cache
    );
  };

  const handleViewHusbandOnMap = () => {
    if (!data.fatherLocation) return;
    const { lat, lng } = data.fatherLocation;
    setMapLocation({ lat, lng });
    setShowMapModal(true);
  };

  const handleOpenMapInNewTab = () => {
    if (!mapLocation) return;
    window.open(`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}`, '_blank', 'noopener,noreferrer');
  };

  const handleCustomMenuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMenuRequest.trim()) { handleGenerateMenu(customMenuRequest); setCustomMenuRequest(''); }
  };

  const handleGenerateMenu = async (query: string) => {
    setErrorMsg(null);
    if (FEATURED_RECIPES_DATA[query]) { setRecipe(FEATURED_RECIPES_DATA[query]); return; }
    setSelectedCuisine(query);
    setIsGenerating(true);
    setRecipe(null); 
    try {
      const res = await generateMealMenu(query, data.isPostPregnant, data.language);
      if (res) {
        if (res.error === "QUOTA_EXCEEDED") { setErrorMsg("Gratia AI is very busy right now. Please try a featured recipe!"); }
        else { const imageUrl = await generateMealImage(res.title); setRecipe({ ...res, imageUrl }); }
      }
    } finally { setIsGenerating(false); }
  };

  const handleGenerateCustomGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideQuestion.trim() || isGeneratingGuide) return;
    setIsGeneratingGuide(true);
    try {
      const result = await generateCustomGuide(guideQuestion, UserRole.MOTHER, data.language);
      if (result) { setReadingArticle(result); setGuideQuestion(''); }
    } finally { setIsGeneratingGuide(false); }
  };

  const handleAddCheckup = () => {
    if (!newCheckup.doctorName || !newCheckup.hospital || !newCheckup.date) return;
    const entry: CheckupEntry = { id: Date.now().toString(), doctorName: newCheckup.doctorName, hospital: newCheckup.hospital, date: newCheckup.date, notes: newCheckup.notes };
    onUpdate({ checkups: [entry, ...(data.checkups || [])] });
    setNewCheckup({ doctorName: '', hospital: '', date: new Date().toISOString().slice(0, 16), notes: '' });
    setShowCheckupForm(false);
  };

  const handleDeleteCheckup = (id: string) => {
    onUpdate({ checkups: (data.checkups || []).filter(c => c.id !== id) });
  };

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = { id: Date.now().toString(), text: newTaskText, completed: false };
    onUpdate({ tasks: [...(data.tasks || []), newTask] });
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    const updated = (data.tasks || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    onUpdate({ tasks: updated });
  };

  const deleteTask = (id: string) => {
    const updated = (data.tasks || []).filter(t => t.id !== id);
    onUpdate({ tasks: updated });
  };

  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center gap-1 p-2 transition-all shrink-0 ${activeTab === id ? 'text-emerald-600 scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}>
      <Icon size={20} className="text-black" /><span className="text-[8px] font-black uppercase tracking-tighter text-black">{label}</span>
    </button>
  );

  const renderHome = () => {
    const allCheckups = (data.checkups || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const isPregnant = !data.isPostPregnant && !!data.pregnancyStartDate;
    const isNotPregnantYet = !data.isPostPregnant && !data.pregnancyStartDate;
    const isPostpartum = data.isPostPregnant && !!data.birthDate;

    const today = new Date();
    const dueDate = new Date(data.expectedDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const countdown = diffDays > 0 ? diffDays : 0;

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
          <div className="flex gap-2">
            <button onClick={onLogout} className="p-3 bg-white border border-gray-100 text-black hover:text-red-500 rounded-2xl transition-all shadow-sm"><LogOut size={20} /></button>
          </div>
        </div>

        {latestLoveFromHusband && (
          <div className="p-6 bg-pink-50 border border-pink-100 rounded-[2.5rem] shadow-sm flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm"><Heart size={24} fill="currentColor" /></div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-pink-400 mb-1">Love from Husband</p>
                <p className="text-sm font-bold text-pink-900 leading-tight italic">"{latestLoveFromHusband.text}"</p>
             </div>
          </div>
        )}

        <div className={`rounded-[3rem] p-8 text-white shadow-xl relative overflow-hidden transition-all duration-700 ${isPostpartum ? 'bg-gradient-to-br from-teal-600 to-emerald-800' : 'bg-gradient-to-br from-emerald-600 to-teal-700'}`}>
          <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 scale-150"><span className="text-9xl font-black tracking-tighter opacity-10 text-white">Gratia</span></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-black mb-1 text-white">{data.childName && data.childName !== 'Little One' && data.childName !== 'My Child' ? data.childName : `Hi, ${data.userName}`} ✨</h1>
              
              {!isEditingChildInfo ? (
                <div className="space-y-1">
                  {isNotPregnantYet ? (
                    <div className="space-y-4 py-2">
                      <p className="opacity-90 font-bold text-lg text-white">Welcome to your personal parenting sanctuary.</p>
                      <button onClick={() => setIsEditingChildInfo(true)} className="bg-white text-emerald-700 px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-black text-[12px] uppercase tracking-widest shadow-xl active:scale-95 hover:bg-emerald-50">
                        <Baby size={20} /> I am Pregnant
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <p className="opacity-90 font-bold text-lg text-white">{data.childNickname ? `${data.childNickname}'s Journey` : 'My Parenting Journey'}</p>
                        <button onClick={() => setIsEditingChildInfo(true)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white border border-white/20 shadow-sm flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"><Edit3 size={14} /> {t.updateJourneyBtn}</button>
                      </div>
                      {isPregnant && (
                        <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-widest opacity-80">{currentWeeks} Weeks, {currentDays} Days Pregnant</p>
                          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-3xl border border-white/20 mt-4 inline-block">
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Countdown to Birth</p>
                             <p className="text-3xl font-black">{countdown} <span className="text-sm uppercase tracking-widest">Days Remaining</span></p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-4 w-full max-w-md animate-in slide-in-from-top duration-300">
                  <div className="flex justify-between items-center mb-2"><h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">Setup Pregnancy Details</h4><button onClick={() => setIsEditingChildInfo(false)} className="text-white/60 hover:text-white"><X size={16}/></button></div>
                  <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-60">Child's Full Name</label><input type="text" value={editChildName} onChange={e => setEditChildName(e.target.value)} placeholder="Alexander" className="w-full bg-white/20 p-2 rounded-xl text-white outline-none font-bold text-sm placeholder:text-white/40 border border-white/10" /></div>
                  <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-60">Nickname</label><input type="text" value={editChildNickname} onChange={e => setEditChildNickname(e.target.value)} placeholder="Alex" className="w-full bg-white/20 p-2 rounded-xl text-white outline-none font-bold text-sm placeholder:text-white/40 border border-white/10" /></div>
                  <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-60">Weeks</label><input type="number" min="0" max="42" value={editWeeks} onChange={e => setEditWeeks(parseInt(e.target.value) || 0)} className="w-full bg-white/20 p-2 rounded-xl text-white outline-none font-bold text-sm border border-white/10" /></div><div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest opacity-60">Days</label><input type="number" min="0" max="6" value={editDays} onChange={e => setEditDays(parseInt(e.target.value) || 0)} className="w-full bg-white/20 p-2 rounded-xl text-white outline-none font-bold text-sm border border-white/10" /></div></div>
                  <button onClick={handleSaveChildInfo} className="w-full py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-emerald-400 transition-all">Save Changes</button>
                </div>
              )}
              {isPostpartum && <p className="text-[10px] font-black uppercase opacity-60 mt-1">Born: {new Date(data.birthDate!).toLocaleDateString()}</p>}
            </div>
            
            <div className="flex flex-col gap-2 shrink-0">
              {isPregnant && !isConfirmingBirth && (
                  <button onClick={() => setIsConfirmingBirth(true)} className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest border border-white/20 shadow-lg active:scale-95"><Baby size={18} /> {t.iveGivenBirth}</button>
              )}
              {isConfirmingBirth && (
                  <div className="flex flex-col gap-3 p-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest">Select Birth Date:</p>
                    <input type="date" value={manualBirthDate} onChange={e => setManualBirthDate(e.target.value)} className="bg-white/20 text-white p-2 rounded-xl outline-none font-bold text-xs" />
                    <div className="flex gap-2"><button onClick={handleConfirmBirth} className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg">Confirm</button><button onClick={() => setIsConfirmingBirth(false)} className="flex-1 bg-white/30 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase">Cancel</button></div>
                  </div>
              )}
              {isPostpartum && (
                <div className="flex flex-col gap-2">
                  {isEditingBirthDate ? (
                    <div className="flex flex-col gap-3 p-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                      <p className="text-[10px] font-black uppercase tracking-widest">Update Date:</p>
                      <input type="date" value={manualBirthDate} onChange={e => setManualBirthDate(e.target.value)} className="bg-white/20 text-white p-2 rounded-xl outline-none font-bold text-xs" />
                      <div className="flex gap-2"><button onClick={handleUpdateBirthDate} className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase">Save</button><button onClick={() => setIsEditingBirthDate(false)} className="flex-1 bg-white/30 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase">Close</button></div>
                    </div>
                  ) : (<button onClick={() => setIsEditingBirthDate(true)} className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-2 rounded-2xl flex items-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest border border-white/20 shadow-lg active:scale-95"><Edit3 size={16} /> Edit Birth Date</button>)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ... (rest of home content omitted for brevity as it's unchanged) */}
        {isPostpartum && (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-emerald-50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Info size={60} className="text-emerald-600" /></div>
              <div className="flex flex-col gap-6">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><HeartPulse size={14} /> Recovery & Future Planning</h3>
                  <p className="text-sm font-bold text-black leading-relaxed">The optimal time interval for pregnancy after childbirth is 18–24 months (1.5 to 2 years) to allow the mother's body to recover and minimize health risks to the fetus, such as premature birth.</p>
                </div>
                <button onClick={handlePregnantAgain} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95"><Sparkles size={18} /> Pregnant Again</button>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[3rem] border-2 border-emerald-50 shadow-sm space-y-6">
              <div className="flex items-center gap-3"><div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><HeartPulse size={20} /></div><h3 className="text-lg font-black text-black tracking-tight">{t.postpartumEssentials}</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex flex-col gap-2 text-left"><h4 className="text-xs font-black uppercase tracking-widest text-emerald-800">{t.babyBluesTitle}</h4><p className="text-xs font-bold text-black opacity-80 leading-relaxed">{t.babyBluesDesc}</p></div>
                <div className="p-6 bg-teal-50 rounded-[2rem] border border-teal-100 flex flex-col gap-2 text-left"><h4 className="text-xs font-black uppercase tracking-widest text-teal-800">{t.ppdTitle}</h4><p className="text-xs font-bold text-black opacity-80 leading-relaxed">{t.ppdDesc}</p></div>
              </div>
              <button onClick={() => setActiveTab('library')} className="w-full p-4 bg-gratia-green border-2 border-emerald-100 rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all group"><Bot size={20} className="text-emerald-600 group-hover:scale-110 transition-transform" /><span className="text-[11px] font-black uppercase tracking-widest text-emerald-900">{t.askAiCta}</span></button>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2"><ListTodo size={14} className="text-emerald-500" /> {t.sharedTasks}</h3>
          <div className="flex gap-2 mb-6">
            <input type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Add a task..." className="flex-1 p-3 bg-gratia-green rounded-xl outline-none font-bold text-xs text-black border border-gray-100 focus:bg-white transition-all" onKeyDown={(e) => e.key === 'Enter' && addTask()} />
            <button onClick={addTask} className="p-3 bg-emerald-600 text-white rounded-xl shadow-md"><Plus size={18} /></button>
          </div>
          <div className="space-y-2">
            {(data.tasks || []).map(task => (
              <div key={task.id} className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-50 transition-all">
                <div className="flex items-center gap-3"><button onClick={() => toggleTask(task.id)} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200'}`}><Check size={14} /></button><span className={`text-xs font-bold text-black ${task.completed ? 'opacity-40 line-through' : ''}`}>{task.text}</span></div>
                <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-6"><h3 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2"><Hospital size={14} className="text-emerald-600" /> Checkup History</h3><button onClick={() => setShowCheckupForm(!showCheckupForm)} className="p-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all active:scale-95">{showCheckupForm ? <X size={18} /> : <Plus size={18} />}</button></div>
          {showCheckupForm && (<div className="mb-8 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 animate-in slide-in-from-top duration-300"><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><input type="text" placeholder="Doctor Name" value={newCheckup.doctorName} onChange={e => setNewCheckup({...newCheckup, doctorName: e.target.value})} className="p-3 bg-white rounded-xl outline-none font-bold text-xs border border-emerald-100 text-black" /><input type="text" placeholder="Hospital/Clinic" value={newCheckup.hospital} onChange={e => setNewCheckup({...newCheckup, hospital: e.target.value})} className="p-3 bg-white rounded-xl outline-none font-bold text-xs border border-emerald-100 text-black" /><input type="datetime-local" value={newCheckup.date} onChange={e => setNewCheckup({...newCheckup, date: e.target.value})} className="p-3 bg-white rounded-xl outline-none font-bold text-xs border border-emerald-100 text-black" /><input type="text" placeholder="Full Details / Doctor's Message" value={newCheckup.notes} onChange={e => setNewCheckup({...newCheckup, notes: e.target.value})} className="p-3 bg-white rounded-xl outline-none font-bold text-xs border border-emerald-100 text-black" /></div><button onClick={handleAddCheckup} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md">Save Record</button></div>)}
          <div className="space-y-6">{allCheckups.length > 0 ? (<div className="space-y-4"><p className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Logged Visits</p>{allCheckups.map(checkup => (<div key={checkup.id} className="p-5 rounded-3xl border bg-gratia-green border-gray-100 transition-all group flex flex-col gap-4"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm text-emerald-600"><History size={18} /></div><div className="flex-1"><p className="text-xs font-black text-black">{checkup.doctorName}</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{checkup.hospital}</p><p className="text-[9px] font-black text-gray-500 uppercase mt-0.5">{new Date(checkup.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p></div><button onClick={() => handleDeleteCheckup(checkup.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button></div>{checkup.notes && (<div className="p-4 bg-white rounded-2xl border border-emerald-50 shadow-inner"><p className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-2 flex items-center gap-2"><MessageCircle size={12} /> Message / Note</p><p className="text-sm font-bold text-black leading-relaxed italic">{checkup.notes}</p></div>)}</div>))}</div>) : (<div className="py-12 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No history logs found</p></div>)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
            <div className="flex items-center gap-3 z-10">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${data.isPeriodNotified ? 'bg-red-50 text-red-500' : 'bg-pink-50 text-pink-500'}`}><Droplets size={18} className={data.isPeriodNotified ? 'animate-bounce' : ''} /></div>
              <div><h3 className="text-[10px] font-black text-black uppercase tracking-widest">{t.mensFeature}</h3><p className={`text-xs font-black uppercase ${data.isPeriodNotified ? 'text-red-600' : 'text-black'}`}>{data.isPeriodNotified ? t.periodAnnounced : 'Announce Period'}</p></div>
            </div>
            <button onClick={announcePeriod} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all z-10 ${data.isPeriodNotified ? 'bg-red-100 text-red-700' : 'bg-emerald-600 text-white shadow-md'}`}>{data.isPeriodNotified ? 'Undo' : 'Notify'}</button>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between h-full"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><LinkIcon size={18} /></div><div><h3 className="text-[10px] font-black text-black uppercase tracking-widest">{t.yourReferralCode}</h3><p className="text-lg font-black text-emerald-700 tracking-[0.1em]">{data.pairingCode}</p></div></div><button onClick={() => {navigator.clipboard.writeText(data.pairingCode); setCopied(true); setTimeout(() => setCopied(false), 2000);}} className={`p-3 rounded-2xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-50 text-black hover:text-emerald-600'}`}>{copied ? <Check size={18} /> : <Copy size={18} />}</button></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquareHeart size={60} className="text-emerald-600" /></div>
          <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><Heart size={14} className="text-emerald-500" /> {t.encouragementToHusband}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">{["You're an amazing dad-to-be! ❤️", "Thanks for everything you do.", "I love you so much.", "Our baby is lucky to have you."].map((text, idx) => (<button key={idx} onClick={() => sendEncouragementToHusband(text)} className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-[9px] font-black uppercase text-left border border-teal-100 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm">{text}</button>))}</div>
            <div className="relative"><input type="text" value={customSupportText} onChange={(e) => setCustomSupportText(e.target.value)} placeholder="Write a sweet note..." className="w-full p-4 pr-12 bg-gray-50 rounded-2xl outline-none font-bold text-xs text-black border border-transparent focus:border-emerald-200" onKeyDown={(e) => e.key === 'Enter' && customSupportText.trim() && sendEncouragementToHusband(customSupportText)} /><button onClick={() => customSupportText.trim() && sendEncouragementToHusband(customSupportText)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-600"><Send size={20} /></button></div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border-2 border-emerald-50 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><MessageSquareHeart className="text-pink-500" size={80} /></div>
          <div className="relative z-10 text-black">
            <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg"><Heart size={24} /></div><div><h3 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">{t.messageFromHusband}</h3><p className="text-[10px] font-bold text-black uppercase tracking-widest">Direct Note from your Husband</p></div></div>
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-white rounded-[2.5rem] border border-emerald-100 shadow-inner"><p className="text-xl md:text-2xl font-bold text-emerald-950 leading-relaxed italic text-balance">{latestPartnerMessage ? `"${latestPartnerMessage.text}"` : "Husband hasn't sent a note today."}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div><h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={14} className="text-emerald-600" /> {t.husbandLocation}</h3>{data.isFatherLocationSharing && data.fatherLocation ? (<div className="space-y-2"><div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><p className="text-xs font-black text-black">Connected & Live</p></div><p className="text-[10px] font-bold text-black uppercase">Lat: {data.fatherLocation.lat.toFixed(4)} / Lng: {data.fatherLocation.lng.toFixed(4)}</p></div>) : (<p className="text-[10px] font-black text-black uppercase italic">Husband is not sharing location</p>)}</div>
            <button onClick={handleViewHusbandOnMap} disabled={!data.isFatherLocationSharing || !data.fatherLocation} className="mt-4 p-3 bg-gray-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 transition-colors"><Navigation2 size={12} /> View on Map</button>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-teal-50 shadow-sm flex flex-col justify-between">
            <div><h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><Locate size={14} className="text-emerald-600" /> {t.shareMyLocation}</h3><p className="text-[10px] font-bold text-black mb-4">Update your live location.</p></div><button onClick={handleShareLocation} disabled={isLocating} className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase ${isLocating ? 'bg-gray-100' : 'bg-emerald-600 text-white'}`}>{isLocating ? <Loader2 size={14} className="animate-spin mx-auto" /> : <Navigation size={14} className="inline mr-2" />} {isLocating ? 'Locating...' : 'Update Location'}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderWellbeing = () => {
    // Calendar Logic
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      <h2 className="text-2xl font-black text-black">{t.wellbeing}</h2>
      
      {/* Current Mood Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-20"><HeartPulse size={120} /></div>
        <div className="relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-white/80">{t.todayMood}</h3>
          <div className="flex items-center gap-4">
            <span className="text-6xl">{data.currentMood.split(' ')[0]}</span>
            <p className="text-2xl font-black text-white">{data.currentMood.split(' ')[1] || 'Mood Logged'}</p>
          </div>
        </div>
      </div>

      {/* Mood Picker */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-emerald-50">
        <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4">{t.pickMood}</h3>
        <div className="flex justify-between mb-8">
          {['😊 Happy', '😔 Sad', '😠 Angry', '😴 Tired', '🤩 Excited'].map(m => (
            <button key={m} onClick={() => updateMood(m)} className={`text-3xl transition-all hover:scale-125 ${data.currentMood.startsWith(m.split(' ')[0]) ? 'grayscale-0' : 'grayscale'}`}>{m.split(' ')[0]}</button>
          ))}
        </div>
        <textarea value={currentJournalNote} onChange={e => setCurrentJournalNote(e.target.value)} placeholder="Share your feelings..." className="w-full p-6 bg-gratia-green rounded-[2rem] text-black font-bold mb-4 outline-none focus:bg-white border border-gray-100" rows={4} />
        <button onClick={handleSaveJournal} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase">{t.saveJournal}</button>
      </div>

      {/* NEW: AI Advice Section */}
      {(dailyAdvice || isGeneratingAdvice) && (
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 rounded-[3rem] border border-emerald-100 relative overflow-hidden animate-in slide-in-from-top duration-500">
             <div className="absolute top-0 right-0 p-6 opacity-5"><Sparkles size={80} className="text-emerald-600"/></div>
             <h3 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Bot size={16} /> Gratia Coach Insight
             </h3>
             {isGeneratingAdvice ? (
                 <div className="flex flex-col items-center justify-center py-4 gap-3">
                    <Loader2 size={24} className="text-emerald-600 animate-spin" />
                    <p className="text-xs font-bold text-emerald-700 animate-pulse">Analyzing your feelings...</p>
                 </div>
             ) : (
                 <div className="prose prose-sm max-w-none">
                    <p className="text-sm font-bold text-emerald-950 leading-relaxed italic">"{dailyAdvice}"</p>
                 </div>
             )}
          </div>
      )}

      {/* Mood Calendar */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-emerald-50">
         <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <Calendar size={14} className="text-emerald-500" /> {t.moodCalendar}
         </h3>
         
         <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; })} className="p-2 hover:bg-gray-100 rounded-full text-black"><ChevronLeft size={20}/></button>
            <span className="text-sm font-black uppercase tracking-widest text-black">{monthName}</span>
            <button onClick={() => setCurrentMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; })} className="p-2 hover:bg-gray-100 rounded-full text-black"><ChevronRight size={20}/></button>
         </div>

         <div className="grid grid-cols-7 gap-2 mb-4">
            {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] font-black text-gray-300">{d}</div>)}
         </div>
         
         <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
               const day = i + 1;
               const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
               const entry = (data.moodHistory || []).find(h => h.date === dateStr);
               const isSelected = selectedDayDetail?.date === dateStr;
               
               return (
                 <button 
                   key={day} 
                   onClick={() => entry ? setSelectedDayDetail(entry) : setSelectedDayDetail(null)}
                   className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-bold transition-all relative
                     ${entry ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-200 cursor-pointer hover:bg-emerald-200' : 'bg-gray-50 text-gray-400 border border-transparent cursor-default'}
                     ${isSelected ? 'ring-4 ring-emerald-200 scale-110 z-10' : ''}
                   `}
                 >
                    {day}
                    {entry && <span className="absolute -bottom-1 -right-1 text-base">{entry.mood.split(' ')[0]}</span>}
                 </button>
               );
            })}
         </div>

         {/* Selected Day Detail View */}
         {selectedDayDetail && (
           <div className="mt-8 p-6 bg-gratia-green rounded-[2.5rem] border border-emerald-100 animate-in slide-in-from-top duration-300 relative">
             <button onClick={() => setSelectedDayDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={16}/></button>
             <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-2">{new Date(selectedDayDetail.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             <div className="text-4xl mb-4 text-black">{selectedDayDetail.mood.split(' ')[0]} <span className="text-xl font-black text-black tracking-tight">{selectedDayDetail.mood.split(' ')[1]}</span></div>
             {selectedDayDetail.note ? (
                <div className="p-4 bg-white rounded-2xl border border-white/50 shadow-sm mb-4">
                   <p className="text-sm font-bold text-gray-600 italic leading-relaxed">"{selectedDayDetail.note}"</p>
                </div>
             ) : (
                <p className="text-xs font-bold text-gray-400 italic mb-4">No journal entry for this day.</p>
             )}
             {selectedDayDetail.aiAdvice && (
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 shadow-sm">
                   <p className="text-[9px] font-black uppercase text-teal-800 tracking-widest mb-2 flex items-center gap-1"><Sparkles size={10} /> AI Insight</p>
                   <p className="text-sm font-bold text-teal-900 leading-relaxed">"{selectedDayDetail.aiAdvice}"</p>
                </div>
             )}
           </div>
         )}
      </div>
    </div>
    );
  };

  const renderMenu = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      <h2 className="text-2xl font-black text-black">{t.healthyMenu}</h2>
      
      {recipe ? (
        <div className="bg-white rounded-[3rem] border border-emerald-100 shadow-xl overflow-hidden animate-in zoom-in duration-300 relative">
          <button onClick={() => setRecipe(null)} className="absolute top-6 right-6 z-20 p-3 bg-white/80 backdrop-blur-md text-black rounded-2xl hover:bg-white transition-all shadow-lg active:scale-95 border border-gray-100">
            <X size={24} />
          </button>
          
          {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-64 object-cover" />}
          <div className="p-8">
            <div className="flex justify-between items-start mb-6 pr-12">
              <h3 className="text-2xl font-black text-black">{recipe.title}</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2"><Utensils size={14}/> Ingredients</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="text-xs font-bold text-black flex items-center gap-2 p-3 bg-emerald-50 rounded-xl"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {ing}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2"><ListTodo size={14}/> Instructions</h4>
                <div className="space-y-3">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                      <span className="w-6 h-6 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                      <p className="text-xs font-bold text-black leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Sparkle size={12}/> Health Benefits</h4>
                <p className="text-sm font-bold text-orange-950 leading-relaxed italic">"{recipe.benefits}"</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-[3rem] border border-emerald-100 shadow-sm relative overflow-hidden">
            {isGenerating && (
              <div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center animate-in fade-in">
                <ChefHat size={48} className="text-emerald-600 animate-bounce mb-4" />
                <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Chef is preparing your recipe...</p>
              </div>
            )}
            <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><Search size={14} className="text-emerald-500" /> {t.searchTitle}</h3>
            <form onSubmit={handleCustomMenuSubmit} className="flex gap-2">
              <input type="text" value={customMenuRequest} onChange={(e) => setCustomMenuRequest(e.target.value)} placeholder="e.g. Traditional Soto Ayam" className="flex-1 p-5 bg-gratia-green rounded-2xl outline-none font-bold text-sm text-black border border-gray-100 focus:bg-white" />
              <button type="submit" className="p-5 bg-emerald-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all"><Sparkles size={20}/></button>
            </form>
            {errorMsg && <p className="mt-4 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={14}/> {errorMsg}</p>}
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-black uppercase tracking-widest px-2">{t.featuredMenu}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredRecipes.map((item, idx) => (
                <button key={idx} onClick={() => handleGenerateMenu(item.title)} className={`p-8 ${item.color} rounded-[3rem] border border-transparent ${item.hoverColor} transition-all text-left group shadow-sm hover:shadow-md`}>
                  <div className="mb-6 text-black group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h4 className="text-lg font-black text-black mb-2 tracking-tight">{item.title}</h4>
                  <p className="text-xs font-bold text-black opacity-60 leading-relaxed">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderConsultAI = () => (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-t-[3rem] border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100"><Bot size={24} /></div>
          <div>
            <h2 className="text-lg font-black text-black">{t.consultAi}</h2>
            <p className="text-xs font-bold text-emerald-600/80 mt-0.5">A safe space to ask anything</p>
          </div>
        </div>
        <button onClick={() => onUpdate({ aiConsultHistory: [] })} className="p-2 text-black hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
      </div>
      <div className="overflow-y-auto h-[400px] p-6 space-y-6 bg-white/50">
        {(data.aiConsultHistory || []).map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.senderRole === UserRole.MOTHER ? 'items-end' : 'items-start'}`}>
            <span className="text-[8px] font-black text-gray-400 uppercase mb-1 px-2">{msg.senderName}</span>
            <div className={`p-4 rounded-[1.8rem] max-w-[90%] text-sm font-bold shadow-sm ${msg.senderRole === UserRole.MOTHER ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-black border border-emerald-50 rounded-tl-none whitespace-pre-line'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isConsulting && (
          <div className="flex items-center gap-2 p-4 bg-white border border-emerald-50 rounded-[1.8rem] text-[10px] font-black text-emerald-600 uppercase animate-pulse">
            <Loader2 size={14} className="animate-spin" /> Coach is reflecting...
          </div>
        )}
        <div ref={consultEndRef} />
      </div>
      <form onSubmit={handleConsultAI} className="p-4 bg-white rounded-b-[3rem] border-t border-gray-100 flex gap-2">
        <input type="text" value={consultInput} onChange={(e) => setConsultInput(e.target.value)} placeholder="Ask Coach anything..." className="flex-1 p-5 bg-gratia-green rounded-2xl outline-none font-bold text-sm text-black border border-gray-100 focus:bg-white" />
        <button type="submit" disabled={isConsulting || !consultInput.trim()} className="p-5 bg-emerald-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
          <Send size={20}/>
        </button>
      </form>
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
              <h3 className="text-lg font-black text-black flex items-center gap-2"><MapPin size={20} className="text-emerald-600" /> {t.husbandLocation}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handleOpenMapInNewTab} className="p-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 hover:bg-emerald-700 transition-colors">
                  <Navigation2 size={14} /> Open in Google Maps
                </button>
                <button onClick={() => { setShowMapModal(false); setMapLocation(null); }} className="p-2.5 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-colors"><X size={20} /></button>
              </div>
            </div>
            <div className="flex-1 min-h-[320px] w-full relative">
              <iframe
                title="Husband location map"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setReadingArticle(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 border border-emerald-50" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-gray-100 flex justify-between items-start gap-4">
              <h3 className="text-2xl font-black text-black leading-tight flex-1">{readingArticle.title}</h3>
              <button onClick={() => setReadingArticle(null)} className="p-3 bg-gray-50 text-black rounded-2xl hover:bg-gray-100 transition-all shadow-sm active:scale-95 flex items-center justify-center shrink-0 border border-gray-100"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 prose prose-emerald max-w-none">
              <p className="text-base text-black font-bold leading-relaxed whitespace-pre-line text-balance">{readingArticle.content}</p>
              <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center"><button onClick={() => setReadingArticle(null)} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95">Finish Reading</button></div>
            </div>
          </div>
        </div>
      )}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'menu' && renderMenu()}
        {activeTab === 'wellbeing' && renderWellbeing()}
        {activeTab === 'library' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
            <div className="flex items-center justify-between"><h2 className="text-2xl font-black text-black">{t.education}</h2><div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full text-teal-700 font-black text-[10px] uppercase tracking-widest border border-teal-100 shadow-sm"><Sparkle size={12} /> AI Powered</div></div>
            <div className="bg-white p-6 rounded-[3rem] border border-emerald-100 shadow-sm relative overflow-hidden">
               {isGeneratingGuide && (<div className="absolute inset-0 z-50 bg-white/90 flex flex-col items-center justify-center animate-in fade-in"><PenLine size={48} className="text-emerald-600 animate-bounce mb-4" /><p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Coach is writing your guide...</p></div>)}
               <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2"><Highlighter size={14} className="text-emerald-500" /> Create Custom Guide</h3>
               <form onSubmit={handleGenerateCustomGuide} className="flex gap-2">
                 <input type="text" value={guideQuestion} onChange={(e) => setGuideQuestion(e.target.value)} placeholder="e.g. How to handle toddler tantrums?" className="flex-1 p-5 bg-gratia-green rounded-2xl outline-none font-bold text-sm text-black border border-gray-100 focus:bg-white" />
                 <button type="submit" disabled={!guideQuestion.trim() || isGeneratingGuide} className="p-5 bg-emerald-600 text-white rounded-2xl shadow-lg active:scale-95 disabled:opacity-50"><Sparkles size={20} /></button>
               </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURED_ARTICLES[UserRole.MOTHER].map(article => (
                <div key={article.id} onClick={() => setReadingArticle(article)} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-emerald-50 group hover:shadow-md transition-all cursor-pointer">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-full mb-4 inline-block">{article.category}</span>
                  <h5 className="font-black text-sm text-black mb-2 group-hover:text-emerald-600 transition-colors">{article.title}</h5>
                  <p className="text-xs font-bold text-black line-clamp-2">{article.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-16 pt-16 border-t border-emerald-100">
               <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white"><Bot size={20} /></div><div><h3 className="text-lg font-black text-black">Chat with AI Coach</h3><p className="text-xs font-bold text-emerald-600/80 mt-1">A safe space to ask anything</p></div></div>
               <div className="bg-white rounded-[3rem] border border-emerald-50 shadow-sm overflow-hidden">{renderConsultAI()}</div>
            </div>
          </div>
        )}
        {activeTab === 'journey' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
            <h2 className="text-2xl font-black text-black">{t.photoJourney}</h2>
            {CHILD_PHASES.map(phase => (
              <div key={phase} className="bg-white p-8 rounded-[3rem] shadow-sm mb-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{phase}</h3>
                   <label className="p-3 bg-emerald-800 text-white rounded-xl cursor-pointer hover:bg-emerald-900 transition-all shadow-lg active:scale-95">
                     <Plus size={16}/>
                     <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, phase)}/>
                   </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(data.photoJourney || []).filter(p => p.phase === phase).reverse().map(p => (
                    <div key={p.id} className="bg-gray-50 rounded-[2.5rem] overflow-hidden group shadow-sm border border-gray-100 relative">
                      <img src={p.url} className="w-full h-56 object-cover" alt={p.caption}/>
                      {editingPhotoId === p.id ? (
                        <div className="p-5 bg-white space-y-3 animate-in fade-in">
                          <input type="text" value={editCaption} onChange={e => setEditCaption(e.target.value)} className="w-full p-2 bg-gratia-green rounded-xl text-xs font-bold border border-gray-100 focus:bg-white text-black" placeholder="Edit caption..." /><input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full p-2 bg-gratia-green rounded-xl text-xs font-bold border border-gray-100 focus:bg-white text-black" /><div className="flex gap-2"><button onClick={saveEditedPhoto} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase">Save</button><button onClick={() => setEditingPhotoId(null)} className="flex-1 py-2 bg-gray-100 text-black rounded-xl text-[10px] font-black uppercase">Cancel</button></div>
                        </div>
                      ) : (
                        <div className="p-5 flex justify-between items-start"><div><p className="text-xs font-black text-black mb-1">{p.caption}</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> {p.date}</p></div><button onClick={() => startEditPhoto(p)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Edit3 size={14} /></button></div>
                      )}
                    </div>
                  ))}
                  {(data.photoJourney || []).filter(p => p.phase === phase).length === 0 && <div className="col-span-full py-12 text-center text-gray-400 font-bold text-xs uppercase tracking-widest bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">No photos added yet</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-220px)] flex flex-col animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-t-[3rem] border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600"><Users size={20} /></div>
                <div>
                  <h2 className="text-lg font-black text-black">{data.partnerName || t.chatHusband}</h2>
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">Connected</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/50">
              {(data.chatMessages || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageCircle size={48} className="text-gray-300 mb-4" />
                  <p className="text-sm font-bold text-gray-500">No messages yet</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">Say hello to your husband!</p>
                </div>
              ) : (data.chatMessages || []).map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.senderRole === UserRole.MOTHER ? 'items-end' : 'items-start'}`}>
                  <span className="text-[8px] font-black text-black uppercase mb-1 px-2">{msg.senderName}</span>
                  <div className={`p-4 rounded-[1.5rem] max-w-[85%] text-sm font-bold shadow-sm ${msg.senderRole === UserRole.MOTHER ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-black border border-gray-100 rounded-tl-none'}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendChat} className="p-4 bg-white rounded-b-[3rem] border-t border-gray-100 flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Message Husband..." className="flex-1 p-5 bg-gratia-green rounded-2xl outline-none font-bold text-sm text-black border border-gray-100" />
              <button type="submit" className="p-5 bg-emerald-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all"><Send size={20}/></button>
            </form>
          </div>
        )}
      </main>
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-xl bg-white/90 backdrop-blur-xl border border-white/20 p-2 rounded-[2.5rem] shadow-2xl flex justify-around items-center z-50 overflow-x-auto">
        <TabButton id="home" label={t.home} icon={Home} />
        <TabButton id="menu" label="Menu" icon={Soup} />
        <TabButton id="wellbeing" label="Mood" icon={Smile} />
        <TabButton id="library" label="Guide" icon={BookMarked} />
        <TabButton id="journey" label="Photo" icon={Camera} />
        <TabButton id="chat" label="Chat" icon={MessageCircle} />
      </nav>
    </div>
  );
};

export default MotherDashboard;


import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, SharedData, Language } from './types';
import { INITIAL_SHARED_DATA } from './constants';
import MotherDashboard from './pages/MotherDashboard';
import FatherDashboard from './pages/FatherDashboard';
import RoleSelectionPage from './pages/RoleSelectionPage';
import OnboardingPage from './pages/OnboardingPage';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  const [user, setUser] = useState<{ id: string; role: UserRole; pairingCode?: string; language: Language; userName?: string } | null>(() => {
    const saved = localStorage.getItem('gratia_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const [sharedData, setSharedData] = useState<SharedData>({
    ...INITIAL_SHARED_DATA,
    language: user?.language || 'en'
  });
  
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem('gratia_onboarding_done') === 'true';
  });

  // Load data based on pairing code (preserve current user's name so chat shows correct sender)
  useEffect(() => {
    if (user?.pairingCode) {
      const saved = localStorage.getItem(`gratia_sync_${user.pairingCode}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSharedData(prev => ({
          ...parsed,
          userName: user?.userName || prev.userName || parsed.userName,
          partnerName: (parsed.userName && user?.userName && parsed.userName !== user.userName) ? parsed.userName : (prev.partnerName ?? parsed.partnerName)
        }));
      }
    }
  }, [user?.pairingCode, user?.userName]);

  // Sync back to storage whenever sharedData changes
  useEffect(() => {
    if (sharedData.pairingCode) {
      localStorage.setItem(`gratia_sync_${sharedData.pairingCode}`, JSON.stringify(sharedData));
    }
  }, [sharedData]);

  // Listen for changes from the other partner (preserve current tab's userName so chat works)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (user?.pairingCode && e.key === `gratia_sync_${user.pairingCode}` && e.newValue) {
        const p = JSON.parse(e.newValue);
        setSharedData(prev => ({
          ...p,
          userName: prev.userName,
          partnerName: p.userName !== prev.userName ? p.userName : (p.partnerName ?? prev.partnerName)
        }));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.pairingCode]);

  const handleSelectRole = (role: UserRole) => {
    const language: Language = 'en'; // Default to English for now
    const newUser = { 
      id: 'user_' + Math.random().toString(36).substr(2, 4), 
      role, 
      language 
    };
    setUser(newUser);
    setSharedData(prev => ({ ...prev, language }));
    localStorage.setItem('gratia_user_session', JSON.stringify(newUser));
  };

  const handleOnboardingFinish = (data: Partial<SharedData>) => {
    const code = data.pairingCode || sharedData.pairingCode;
    const updated = { ...sharedData, ...data, pairingCode: code };
    
    if (data.pregnancyAgeWeeks !== undefined) {
      const weeks = data.pregnancyAgeWeeks || 0;
      const days = data.pregnancyAgeDays || 0;
      const totalDaysIn = (weeks * 7) + days;
      const totalTermDays = 280; // 40 weeks
      
      const today = new Date();
      // Start date is today minus total days in
      const startDate = new Date(today.getTime() - (totalDaysIn * 24 * 60 * 60 * 1000));
      // Due date is start date plus 280 days
      const dueDate = new Date(startDate.getTime() + (totalTermDays * 24 * 60 * 60 * 1000));
      
      updated.pregnancyStartDate = startDate.toISOString();
      updated.expectedDueDate = dueDate.toISOString();
    } else if (data.childName) {
      // If childName is present (Mother flow) but pregnancyAgeWeeks is undefined,
      // it means "Not Pregnant" was selected. We clear the default dates.
      updated.pregnancyStartDate = "";
      updated.expectedDueDate = "";
    }

    setSharedData(updated);
    
    // Save pairing code and current user name to session (so chat shows correct sender across tabs)
    if (user) {
      const updatedUser = { ...user, pairingCode: code, userName: data.userName ?? user.userName };
      setUser(updatedUser);
      localStorage.setItem('gratia_user_session', JSON.stringify(updatedUser));
    }

    setOnboardingComplete(true);
    localStorage.setItem('gratia_onboarding_done', 'true');
  };

  const handleLogout = () => {
    localStorage.removeItem('gratia_user_session');
    localStorage.removeItem('gratia_onboarding_done');
    setUser(null);
    setShowRoleSelection(false);
    setOnboardingComplete(false);
  };

  const updateSharedData = (updates: Partial<SharedData>) => {
    setSharedData(prev => ({ ...prev, ...updates }));
  };

  if (!user && !showRoleSelection) {
    return <LandingPage onStart={() => setShowRoleSelection(true)} language={sharedData.language} />;
  }

  if (!user) {
    return <RoleSelectionPage onSelectRole={handleSelectRole} onBack={() => setShowRoleSelection(false)} />;
  }

  if (!onboardingComplete) {
    return <OnboardingPage role={user.role} language={user.language} onFinish={handleOnboardingFinish} onBack={handleLogout} />;
  }

  return (
    <Router>
      <div className="min-h-screen">
        <main className="w-full">
          <Routes>
            <Route 
              path="/" 
              element={
                user.role === UserRole.MOTHER 
                  ? <MotherDashboard data={sharedData} user={user} onUpdate={updateSharedData} onLogout={handleLogout} /> 
                  : <FatherDashboard data={sharedData} user={user} onUpdate={updateSharedData} onLogout={handleLogout} />
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

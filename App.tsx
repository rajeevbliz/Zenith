
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Brain, Home, ListTodo, Calendar as CalendarIcon, 
  StickyNote, Target, SlidersHorizontal, X, Trash2,
  Info, Plus, LogOut, Loader2,
  Wind, Menu, Mail, MessageSquare, Send, CheckCircle, User,
  FileText, Copy, Check, ChevronRight, UserCircle,
  Bell, BellOff, Activity, Eye, EyeOff, Sparkles,
  ShieldCheck, AlertCircle, Database, RefreshCw, Terminal,
  HardDrive, Key, Lock, Zap, Shield, Globe, Layers, Feather,
  Flame, Trophy, ChevronLeft, Coffee, Sunset, Mountain, Anchor, Compass, Heart, Moon,
  Edit2
} from 'lucide-react';
import { supabase } from './supabase';
import { Pomodoro } from './components/Pomodoro';
import { Clock } from './components/Clock';
import { Task } from './types';

// Types
type PriorityCategory = 'Work' | 'Project' | 'Private';
type PrioritySubCategory = 'Must Do' | 'Should Do' | 'Backlog';

interface UserProfile {
  name: string;
  age: string;
  occupation: string;
  completedOnboarding: boolean;
  email?: string;
}

interface PriorityItem {
  id: string;
  text: string;
  completed: boolean;
  category: PriorityCategory;
  sub_category: PrioritySubCategory; 
}

type Section = 'clarity' | 'priorities' | 'planner' | 'notes' | 'feedback' | 'about';

// Helper to get local date string YYYY-MM-DD
const getTodayStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const renderMarkdown = (content: string) => {
  if (!content) return '';
  let html = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-black">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic opacity-80 font-black">$1</em>');
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map(line => {
    if (line.trim().startsWith('- ')) {
      const item = line.trim().substring(2);
      let res = '';
      if (!inList) { res = '<ul class="list-disc ml-4 space-y-1 my-2 font-black">'; inList = true; }
      return res + `<li>${item}</li>`;
    } else {
      let res = '';
      if (inList) { res = '</ul>'; inList = false; }
      return res + (line || '<br/>');
    }
  });
  if (inList) processedLines.push('</ul>');
  return processedLines.join('\n');
};

const TaskProgressCircle: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
  
  const size = 180;
  const center = size / 2;
  const radius = 70;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black rounded-[2.5rem] text-white shadow-2xl animate-in zoom-in duration-700">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={center} cy={center} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
           <span className="text-4xl font-black tracking-tighter">{percentage}%</span>
           <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Zenith Rate</span>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Session Progress</p>
        <div className="flex items-center gap-2 justify-center">
          <span className="text-xs font-black">{done} of {total} items clear</span>
        </div>
      </div>
    </div>
  );
};

const PriorityProgressCircle: React.FC<{ items: PriorityItem[]; title: string }> = ({ items, title }) => {
  const total = items.length;
  const done = items.filter(t => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
  
  const size = 180;
  const center = size / 2;
  const radius = 70;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black rounded-[2.5rem] text-white shadow-2xl animate-in zoom-in duration-700">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={center} cy={center} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
           <span className="text-4xl font-black tracking-tighter">{percentage}%</span>
           <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{title} Rate</span>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Current Focus</p>
        <div className="flex items-center gap-2 justify-center">
          <span className="text-xs font-black">{done} of {total} priorities met</span>
        </div>
      </div>
    </div>
  );
};

const ConcentricVisualizer: React.FC<{ priorities: PriorityItem[] }> = ({ priorities }) => {
  const getProgress = (cat: PriorityCategory) => {
    const items = priorities.filter(p => p.category === cat);
    if (items.length === 0) return 0;
    const completed = items.filter(p => p.completed).length;
    return (completed / items.length) * 100;
  };

  const categories: { name: PriorityCategory; color: string; ringIndex: number }[] = [
    { name: 'Work', color: '#00D1FF', ringIndex: 0 },    // Cyan
    { name: 'Project', color: '#FF00FF', ringIndex: 1 }, // Magenta
    { name: 'Private', color: '#FFD600', ringIndex: 2 }, // Yellow
  ];

  const size = 200;
  const center = size / 2;
  const strokeWidth = 14;
  const gap = 6;

  return (
    <div className="flex flex-col items-center justify-center py-6 lg:py-10 bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm mb-6 animate-in zoom-in duration-500">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {categories.map((cat, i) => {
            const radius = 80 - i * (strokeWidth + gap);
            const circumference = 2 * Math.PI * radius;
            const progress = getProgress(cat.name);
            const offset = circumference - (progress / 100) * circumference;

            return (
              <g key={cat.name}>
                <circle cx={center} cy={center} r={radius} stroke="#F3F4F6" strokeWidth={strokeWidth} fill="none" />
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-out"
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
           <Activity size={24} className="text-neutral-200 mb-1" />
           <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">Momentum</span>
        </div>
      </div>
      
      <div className="flex gap-4 mt-6 lg:mt-8">
        {categories.map(cat => (
          <div key={cat.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
            <span className="text-[9px] font-black uppercase tracking-tighter text-neutral-400">{cat.name}</span>
            <span className="text-[9px] font-black text-black">{Math.round(getProgress(cat.name))}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center animate-splash-exit overflow-hidden pointer-events-none">
      <div className="grain-overlay"></div>
      <div className="flex flex-col items-center relative z-[1010]">
        <h1 className="text-5xl lg:text-7xl font-black text-black opacity-0 animate-zenith-emerge select-none tracking-[0.3em] mr-[-0.3em]">ZENITH</h1>
        <div className="w-12 lg:w-20 h-[1px] bg-black/20 origin-center opacity-0 animate-line-draw my-6"></div>
        <span className="text-[10px] lg:text-xs font-black text-neutral-400 uppercase opacity-0 animate-subtitle-float tracking-[0.6em] mr-[-0.6em]">find clarity</span>
      </div>
    </div>
  );
};

const AuthPage: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Account established. Welcome.");
        onAuthSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset the portal key.");
      return;
    }
    setResetLoading(true);
    setError('');
    setSuccess('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setSuccess("Reset relay dispatched to your identity ID.");
    } catch (err: any) {
      setError(err.message || "Reset request failed.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#f5f5f5] flex items-center justify-center p-6 animate-in fade-in duration-500 overflow-y-auto font-black">
      <div className="w-full flex items-center justify-center">
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-neutral-100 p-8 sm:p-10 space-y-8 relative">
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-black rounded-2xl shadow-xl animate-in zoom-in duration-700">
              <Brain size={32} className="text-white" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Zenith</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-300">Sanctuary Portal</p>
            </div>
          </div>

          <div className="flex p-1 bg-neutral-100 rounded-2xl shadow-inner font-black">
            {(['signin', 'signup'] as const).map(m => (
              <button 
                key={m} 
                onClick={() => { setMode(m); setError(''); setSuccess(''); }} 
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${mode === m ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}
              >
                {m === 'signin' ? 'Unlock' : 'Join'}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Identity</label>
              <input 
                type="email" 
                required 
                placeholder="email@example.com" 
                className="w-full bg-neutral-50 border border-neutral-100 py-4 px-6 text-neutral-900 font-black rounded-2xl focus:border-black focus:ring-0 outline-none transition-all placeholder:text-neutral-300" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Key</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="••••••••" 
                  className="w-full bg-neutral-50 border border-neutral-100 py-4 px-6 text-neutral-900 font-black rounded-2xl focus:border-black focus:ring-0 outline-none transition-all placeholder:text-neutral-300 pr-12" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'signin' && (
                <div className="flex justify-end pt-1">
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? 'Resetting...' : 'Forgot Key?'}
                  </button>
                </div>
              )}
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-neutral-800"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'signin' ? 'Enter Sanctuary' : 'Establish Presence')}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2">
               <div className="flex gap-3 text-red-700">
                 <AlertCircle className="shrink-0" size={16} />
                 <p className="text-[10px] font-black leading-relaxed">{error}</p>
               </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-2">
               <div className="flex gap-3 text-emerald-700">
                 <CheckCircle className="shrink-0" size={16} />
                 <p className="text-[10px] font-black leading-relaxed">{success}</p>
               </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-neutral-300 flex items-center justify-center gap-2">
              <ShieldCheck size={10}/> Cloud Synchronized
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const OnboardingFlow: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ 
    name: '', 
    age: '', 
    occupation: '', 
    completedOnboarding: false 
  });

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No session");

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          name: profile.name, 
          age: profile.age, 
          occupation: profile.occupation, 
          completed_onboarding: true 
        });

      if (error) throw error;
      onComplete({ ...profile, completedOnboarding: true });
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[500] bg-white flex flex-col items-center justify-center p-8 overflow-y-auto animate-in fade-in duration-700 font-black">
        <div className="max-w-md w-full space-y-12 text-center sm:text-left">
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-neutral-400">Identity Established</p>
            <h1 className="text-5xl font-black tracking-tighter text-neutral-900 leading-none">Welcome.</h1>
            <div className="space-y-4">
              <p className="text-lg font-black text-neutral-800 leading-relaxed">You are entering a digital sanctuary designed for depth.</p>
              <p className="text-sm font-black text-neutral-500 leading-relaxed">Zenith silences the modern noise. Your data is synced securely.</p>
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl">Start Customization <ChevronRight size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500 overflow-y-auto font-black">
      <div className="max-w-md w-full space-y-12 my-auto">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-neutral-900 rounded-3xl flex items-center justify-center text-white mb-8"><UserCircle size={32} /></div>
          <h1 className="text-3xl font-black tracking-tighter text-neutral-900 leading-tight">Define your presence.</h1>
        </div>
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Your Focus Name</label>
            <input type="text" placeholder="How shall we call you?" className="w-full bg-neutral-50 border-b-2 border-neutral-300 py-5 px-6 font-black text-sm text-neutral-900 outline-none focus:border-black transition-all" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Age</label>
              <input type="number" placeholder="Years" className="w-full bg-neutral-50 border-b-2 border-neutral-300 py-5 px-6 font-black text-sm text-neutral-900 outline-none focus:border-black transition-all" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Main Pursuit</label>
              <input type="text" placeholder="Passion/Role" className="w-full bg-neutral-50 border-b-2 border-neutral-300 py-5 px-6 font-black text-sm text-neutral-900 outline-none focus:border-black transition-all" value={profile.occupation} onChange={e => setProfile({...profile, occupation: e.target.value})} />
            </div>
          </div>
        </div>
        <button disabled={!profile.name.trim() || loading} onClick={handleComplete} className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-xs disabled:opacity-20 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Finalize Sanctuary'}
        </button>
      </div>
    </div>
  );
};

const ZenithCheckbox: React.FC<{ id: string; label: string; checked?: boolean; onChange?: (checked: boolean) => void }> = ({ id, label, checked, onChange }) => (
  <div className="checkbox-container">
    <input 
      type="checkbox" 
      id={id} 
      className="task-checkbox" 
      checked={checked} 
      onChange={(e) => onChange?.(e.target.checked)} 
    />
    <label htmlFor={id} className="checkbox-label">
      <div className="checkbox-box">
        <div className="checkbox-fill"></div>
        <div className="checkmark">
          <svg viewBox="0 0 24 24" className="check-icon">
            <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path>
          </svg>
        </div>
        <div className="success-ripple"></div>
      </div>
      <span className="checkbox-text truncate font-black tracking-tighter">{label}</span>
    </label>
  </div>
);

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const mainScrollRef = useRef<HTMLElement>(null);

  const [activeSection, setActiveSection] = useState<Section>('clarity');
  const [lowStimMode, setLowStimMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [activePriorityTab, setActivePriorityTab] = useState<PriorityCategory>('Work');
  const [notes, setNotes] = useState<any[]>([]);

  const [showSettings, setShowSettings] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Planner State - Default to Today in Local Time
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReminder, setNewTaskReminder] = useState(false);

  const [newPriorityInputs, setNewPriorityInputs] = useState<Record<string, string>>({});
  const [priorityAddingTo, setPriorityAddingTo] = useState<PrioritySubCategory | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [focusJournal, setFocusJournal] = useState('');

  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setIsAuthenticated(!!currentSession);
      if (currentSession) {
        fetchProfile(currentSession.user.id);
        fetchUserData(currentSession.user.id);
      } else {
        setIsProfileLoading(false);
      }
    };
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setIsAuthenticated(!!newSession);
      if (newSession) {
        fetchProfile(newSession.user.id);
        fetchUserData(newSession.user.id);
      } else {
        setIsProfileLoading(false);
        setUserProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setIsProfileLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setUserProfile({
        name: data.name,
        age: data.age,
        occupation: data.occupation,
        completedOnboarding: data.completed_onboarding,
        email: session?.user?.email
      });
    }
    setIsProfileLoading(false);
  };

  const fetchUserData = async (userId: string) => {
    const [t, p, n] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('priorities').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);
    if (t.data) setTasks(t.data);
    if (p.data) setPriorities(p.data);
    if (n.data) setNotes(n.data);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !session) return;
    
    // Explicit Payload
    const payload = {
      user_id: session.user.id,
      title: newTaskTitle,
      remind: newTaskReminder,
      date: selectedDate, 
      category: 'Work',
      priority: 'Medium',
      status: 'todo'
    };

    const { data, error } = await supabase.from('tasks').insert(payload).select().single();
    
    if (error) {
      console.error("Task Insert Error:", error.message);
      // Fallback: If DB insertion fails, still show in UI for this session
      const mockTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        ...payload
      } as Task;
      setTasks([mockTask, ...tasks]);
    } else if (data) {
      setTasks([data, ...tasks]);
    }
    
    setNewTaskTitle('');
    setNewTaskReminder(false);
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
  };

  const deleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  const handleUpdateTask = async (updated: Task) => {
    setTasks(tasks.map(t => t.id === updated.id ? updated : t));
    const { error } = await supabase
      .from('tasks')
      .update({
        title: updated.title,
        date: updated.date,
        remind: updated.remind,
        category: updated.category,
        priority: updated.priority,
        status: updated.status
      })
      .eq('id', updated.id);
    if (error) console.error(error.message);
    setEditingTask(null);
  };

  const addPriority = async (category: PriorityCategory, subCategory: PrioritySubCategory) => {
    const text = newPriorityInputs[`${category}-${subCategory}`];
    if (!text?.trim() || !session) return;
    const { data } = await supabase.from('priorities').insert({
      user_id: session.user.id,
      text,
      category,
      sub_category: subCategory
    }).select().single();
    if (data) setPriorities([...priorities, data]);
    setNewPriorityInputs({ ...newPriorityInputs, [`${activePriorityTab}-${subCategory}`]: '' });
    setPriorityAddingTo(null);
  };

  const togglePriority = async (id: string) => {
    const pItem = priorities.find(p => p.id === id);
    if (!pItem) return;
    const newCompleted = !pItem.completed;
    setPriorities(priorities.map(p => p.id === id ? { ...p, completed: newCompleted } : p));
    await supabase.from('priorities').update({ completed: newCompleted }).eq('id', id);
  };

  const deletePriority = async (id: string) => {
    setPriorities(priorities.filter(p => p.id !== id));
    await supabase.from('priorities').delete().eq('id', id);
  };

  const navigate = (id: Section) => {
    setActiveSection(id);
    setIsSidebarOpen(false);
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const result = [];
    
    // Fill leading empty days
    for (let i = 0; i < firstDay; i++) result.push(null);
    // Fill actual days
    for (let d = 1; d <= days; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ day: d, date: dateStr });
    }
    return result;
  }, [currentMonth, tasks]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newDate);
  };

  const SidebarContent = () => (
    <div className="flex flex-col min-h-full p-8 pb-12 font-black">
      <div className="flex items-center gap-4 mb-16 px-4 shrink-0">
        <div className="p-3 bg-black rounded-2xl shadow-xl"><Brain size={24} className="text-white" /></div>
        <span className="text-2xl font-black tracking-tighter uppercase text-neutral-900">Zenith</span>
      </div>
      <nav className="space-y-2 flex-1">
        {[
          { id: 'clarity', label: 'Clarity', icon: Home },
          { id: 'priorities', label: 'Focus', icon: Target },
          { id: 'planner', label: 'Planner', icon: ListTodo },
          { id: 'notes', label: 'Notes', icon: StickyNote },
          { id: 'about', label: 'About', icon: Info },
          { id: 'feedback', label: 'Feedback', icon: MessageSquare },
        ].map((item) => (
          <button key={item.id} onClick={() => navigate(item.id as Section)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeSection === item.id ? 'bg-black text-white shadow-xl scale-[1.02]' : 'text-neutral-400 hover:text-black hover:bg-neutral-50'}`}>
            <item.icon size={22} strokeWidth={activeSection === item.id ? 4 : 3} /><span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button onClick={() => { setShowSettings(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 text-neutral-400 hover:text-black transition-all hover:bg-neutral-50 rounded-2xl">
          <SlidersHorizontal size={22} strokeWidth={3} /><span className="text-sm font-black uppercase tracking-widest">Settings</span>
        </button>
      </nav>
      <div className="mt-8 pt-6 border-t border-neutral-100 font-black flex flex-col gap-2">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-200 text-center">Protocol V1.4</p>
         <p className="text-black font-black text-[11px] uppercase tracking-widest text-center">Made by Blizx</p>
      </div>
    </div>
  );

  if (!isReady) return <SplashScreen onComplete={() => setIsReady(true)} />;
  if (!isAuthenticated) return <AuthPage onAuthSuccess={() => {}} />;
  
  if (isProfileLoading) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center font-black">
        <div className="flex flex-col items-center gap-6">
           <Loader2 className="w-12 h-12 animate-spin text-black" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Establishing Presence</p>
        </div>
      </div>
    );
  }

  if (userProfile && !userProfile.completedOnboarding) return <OnboardingFlow onComplete={(p) => setUserProfile(p)} />;

  return (
    <div className={`h-screen flex flex-col lg:flex-row ${lowStimMode ? 'low-stim bg-[#f0f0f0]' : 'bg-[#fbfbfb]'} relative overflow-hidden font-sans selection:bg-black selection:text-white font-black`}>
      <div className="grain-overlay opacity-[0.02]"></div>
      
      <aside className="hidden lg:block w-80 h-full bg-white border-r border-neutral-100 shrink-0 shadow-sm overflow-y-auto no-scrollbar">
        <SidebarContent />
      </aside>

      <div className={`lg:hidden fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}>
        <aside className={`absolute left-0 top-0 h-full w-72 bg-white backdrop-blur-2xl transition-transform duration-500 border-r border-neutral-100 overflow-y-auto no-scrollbar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <SidebarContent />
        </aside>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="lg:hidden px-6 py-4 flex items-center justify-between z-40 bg-white/80 backdrop-blur-md border-b border-neutral-50 shrink-0 font-black">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white border border-neutral-100 rounded-2xl shadow-sm active:scale-90 flex items-center gap-2 font-black"><Menu size={20} /></button>
          <div className="flex items-center gap-2 font-black"><Brain size={20} className="text-black" /><span className="text-sm font-black tracking-tighter uppercase">Zenith</span></div>
          <div className="w-10"></div>
        </header>

        {showSettings && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in font-black">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black tracking-tighter">Portal Options</h3>
                <button onClick={() => setShowSettings(false)} className="hover:rotate-90 transition-transform p-1"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 ml-1">Focus Identity</p>
                  <div className="flex items-center gap-4 p-5 bg-neutral-900 text-white rounded-[1.5rem] shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black"><User size={20} className="text-white/60" /></div>
                    <div className="flex-1 overflow-hidden font-black">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Focus Name</p>
                      <p className="text-sm font-black truncate tracking-tight">{userProfile?.name || 'Anonymous'}</p>
                    </div>
                    <ShieldCheck size={18} className="text-emerald-400" />
                  </div>
                </div>
                <div className="w-full h-px bg-neutral-100"></div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-100 font-black">
                    <span className="text-xs font-black uppercase tracking-widest">Low-Stim Mode</span>
                    <button onClick={() => setLowStimMode(!lowStimMode)} className={`w-12 h-7 rounded-full relative transition-all ${lowStimMode ? 'bg-black' : 'bg-neutral-200'}`}><div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${lowStimMode ? 'left-6' : 'left-1'}`} /></button>
                  </div>
                  <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-100 text-neutral-600 hover:bg-neutral-100 transition-colors font-black"><LogOut size={20} /><span className="text-xs font-black uppercase tracking-widest">Exit Portal</span></button>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] mt-8 hover:bg-neutral-800 transition-colors shadow-xl">Resume Focus</button>
            </div>
          </div>
        )}

        {editingTask && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in font-black">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-black tracking-tighter">Edit Intention</h3>
                  <button onClick={() => setEditingTask(null)} className="hover:rotate-90 transition-transform p-1"><X size={24} /></button>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Title</label>
                    <input 
                      type="text" 
                      value={editingTask.title} 
                      onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                      className="w-full bg-neutral-50 rounded-2xl py-4 px-6 font-black outline-none border-2 border-transparent focus:border-black transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Bind Date</label>
                      <input 
                        type="date" 
                        value={editingTask.date} 
                        onChange={(e) => setEditingTask({...editingTask, date: e.target.value})}
                        className="w-full bg-neutral-50 rounded-2xl py-4 px-6 font-black outline-none border-2 border-transparent focus:border-black transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Category</label>
                      <select 
                        value={editingTask.category} 
                        onChange={(e) => setEditingTask({...editingTask, category: e.target.value as any})}
                        className="w-full bg-neutral-50 rounded-2xl py-4 px-6 font-black outline-none border-2 border-transparent focus:border-black transition-all appearance-none"
                      >
                        <option value="Work">Work</option>
                        <option value="Project">Project</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-100 font-black">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className={editingTask.remind ? 'text-black' : 'text-neutral-300'} />
                      <span className="text-xs font-black uppercase tracking-widest">Active Reminder</span>
                    </div>
                    <button 
                      onClick={() => setEditingTask({...editingTask, remind: !editingTask.remind})} 
                      className={`w-12 h-7 rounded-full relative transition-all ${editingTask.remind ? 'bg-black' : 'bg-neutral-200'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${editingTask.remind ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mt-10">
                  <button onClick={() => setEditingTask(null)} className="py-5 bg-neutral-100 text-neutral-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-colors">Discard</button>
                  <button onClick={() => handleUpdateTask(editingTask)} className="py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral-800 transition-colors shadow-xl">Apply Changes</button>
               </div>
            </div>
          </div>
        )}

        <main ref={mainScrollRef} className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 lg:py-16 w-full scrolling-touch scroll-container no-scrollbar lg:scrollbar-default font-black">
          <div className="max-w-7xl mx-auto pb-32 lg:pb-16 font-black">
            {activeSection === 'clarity' && (
              <div className="space-y-8 lg:space-y-12 animate-in slide-in-from-bottom-4 duration-700 font-black">
                <div className="flex flex-col gap-1 font-black">
                  <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-neutral-900 leading-tight">Hi, {userProfile?.name.split(' ')[0] || 'Zenith User'}.</h1>
                  <p className="text-xs lg:text-lg font-black text-neutral-400 italic">Welcome back to your sanctuary.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-stretch font-black">
                  <Pomodoro />
                  <Clock />
                </div>
              </div>
            )}

            {activeSection === 'priorities' && (
              <div className="space-y-8 lg:space-y-12 pt-4 animate-in fade-in max-w-6xl font-black">
                <h1 className="text-4xl lg:text-7xl font-black tracking-tighter">Focus.</h1>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 font-black">
                  <div className="lg:col-span-4 space-y-6 font-black">
                    <ConcentricVisualizer priorities={priorities} />
                    <PriorityProgressCircle items={priorities.filter(p => p.category === activePriorityTab)} title={activePriorityTab} />
                  </div>
                  <div className="lg:col-span-8 space-y-8 font-black">
                    <div className="flex p-1 bg-neutral-100 rounded-2xl font-black">{(['Work', 'Project', 'Private'] as PriorityCategory[]).map(cat => (<button key={cat} onClick={() => setActivePriorityTab(cat)} className={`flex-1 py-3 text-[10px] lg:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activePriorityTab === cat ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>{cat}</button>))}</div>
                    <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-sm space-y-8 font-black">
                       {(['Must Do', 'Should Do', 'Backlog'] as PrioritySubCategory[]).map(sub => (
                          <div key={sub} className="space-y-2 font-black">
                            <div className="flex items-center justify-between mb-2 font-black">
                              <h3 className="text-[10px] lg:text-xs font-black text-neutral-300 uppercase tracking-widest">{sub}</h3>
                              <button onClick={() => setPriorityAddingTo(sub)} className="text-neutral-200 hover:text-black transition-colors font-black"><Plus size={18} /></button>
                            </div>
                            {priorityAddingTo === sub && <input autoFocus type="text" placeholder="..." className="w-full bg-neutral-50 border-b-2 border-black py-3 px-1 text-sm font-black outline-none mb-4" value={newPriorityInputs[`${activePriorityTab}-${sub}`] || ''} onChange={(e) => setNewPriorityInputs({...newPriorityInputs, [`${activePriorityTab}-${sub}`]: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') addPriority(activePriorityTab, sub); if(e.key === 'Escape') setPriorityAddingTo(null); }} />}
                            <div className="space-y-1 font-black">
                              {priorities.filter(p => p.category === activePriorityTab && p.sub_category === sub).map(item => (
                                <div key={item.id} className="flex items-center justify-between group py-1.5 transition-all font-black">
                                  <ZenithCheckbox id={item.id} label={item.text} checked={item.completed} onChange={() => togglePriority(item.id)} />
                                  <button onClick={() => deletePriority(item.id)} className="p-2 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90 font-black"><Trash2 size={16} /></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-sm space-y-6 relative group font-black">
                      <div className="flex items-center justify-between font-black">
                        <h3 className="text-[10px] lg:text-xs font-black text-neutral-300 uppercase tracking-widest">Deep Focus Script</h3>
                        <button 
                          onClick={() => setFocusJournal('')}
                          className="p-2 text-neutral-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-black"
                          title="Clear writing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea 
                        className="w-full min-h-[160px] bg-neutral-50 rounded-2xl p-6 text-sm font-black text-neutral-800 outline-none focus:ring-1 focus:ring-neutral-200 resize-none transition-all placeholder:text-neutral-300 font-black"
                        placeholder="Log your deep work observations or current blockers here..."
                        value={focusJournal}
                        onChange={(e) => setFocusJournal(e.target.value)}
                      />
                      <div className="flex items-center justify-end gap-2 font-black">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-300">Autosaved Local Cache</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'planner' && (
              <div className="space-y-8 lg:space-y-12 pt-4 animate-in fade-in max-w-6xl mx-auto font-black">
                <h1 className="text-4xl lg:text-7xl font-black tracking-tighter">Plan.</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 font-black">
                  <div className="lg:col-span-5 space-y-8 font-black">
                    <TaskProgressCircle tasks={tasks.filter(t => t.date && t.date.startsWith(selectedDate))} />
                    
                    <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-sm space-y-6 font-black">
                      <div className="flex items-center justify-between mb-4 font-black">
                        <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">
                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex items-center gap-1 font-black">
                          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-neutral-50 rounded-xl transition-all font-black"><ChevronLeft size={18}/></button>
                          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-neutral-50 rounded-xl transition-all rotate-180 font-black"><ChevronLeft size={18}/></button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 font-black">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                          <div key={d} className="text-center text-[10px] font-black text-neutral-300 py-2">{d}</div>
                        ))}
                        {calendarDays.map((d, i) => {
                          if (!d) return <div key={`empty-${i}`} className="p-3 font-black" />;
                          const isSelected = selectedDate === d.date;
                          const dayTasks = tasks.filter(t => t.date && t.date.startsWith(d.date));
                          const hasTasks = dayTasks.length > 0;
                          const hasReminders = dayTasks.some(t => t.remind);
                          const isToday = d.date === getTodayStr();
                          
                          // Improved highlighting logic
                          let highlightClass = 'text-neutral-900';
                          if (isSelected) {
                            highlightClass = 'bg-black text-white shadow-xl scale-110 z-10';
                          } else if (hasReminders) {
                            highlightClass = 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100/50 hover:bg-emerald-100';
                          } else if (hasTasks) {
                            highlightClass = 'bg-neutral-50 text-neutral-900 hover:bg-neutral-100';
                          } else {
                            highlightClass = 'hover:bg-neutral-50 text-neutral-900';
                          }

                          return (
                            <button 
                              key={d.date}
                              onClick={() => setSelectedDate(d.date)}
                              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all aspect-square font-black ${highlightClass}`}
                            >
                              <span className={`text-[11px] font-black ${isToday && !isSelected ? 'underline underline-offset-4 decoration-2 decoration-black/20' : ''}`}>{d.day}</span>
                              {hasTasks && (
                                <div className="absolute bottom-1.5 flex flex-col items-center gap-0.5 w-full px-2">
                                   {/* Subtle indicator bars */}
                                   <div className={`h-1 rounded-full transition-all ${isSelected ? 'w-4 bg-white/80' : 'w-3 bg-neutral-900/10'}`} />
                                   {hasReminders && <div className={`h-1 rounded-full w-2 ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500/40'}`} />}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-8 font-black">
                    <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 lg:p-10 shadow-sm space-y-8 min-h-[500px] font-black">
                      <div className="flex flex-col gap-2 font-black">
                        <h2 className="text-2xl font-black tracking-tighter">
                          {new Date(selectedDate).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>
                        <div className="h-1 w-12 bg-black rounded-full font-black" />
                      </div>

                      <div className="relative flex items-center gap-2 font-black">
                        <input 
                          type="text" 
                          value={newTaskTitle} 
                          onChange={(e) => setNewTaskTitle(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} 
                          placeholder="Bind new intention..." 
                          className="w-full bg-neutral-50 border-2 border-neutral-100 rounded-2xl py-6 pl-8 pr-32 text-sm lg:text-base font-black outline-none focus:border-black transition-all" 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 font-black">
                          <button onClick={() => setNewTaskReminder(!newTaskReminder)} className={`p-3 rounded-xl transition-all font-black ${newTaskReminder ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-300 hover:text-neutral-500'}`}>{newTaskReminder ? <Bell size={20} /> : <BellOff size={20} />}</button>
                          <button onClick={handleAddTask} className="p-3 bg-black text-white rounded-xl shadow-lg hover:bg-neutral-800 transition-all font-black"><Plus size={20} /></button>
                        </div>
                      </div>

                      <div className="space-y-2 overflow-y-auto no-scrollbar max-h-[400px] font-black">
                        {tasks.filter(t => t.date && t.date.startsWith(selectedDate)).length > 0 ? (
                          tasks.filter(t => t.date && t.date.startsWith(selectedDate)).map(task => (
                            <div key={task.id} className="flex items-center justify-between group py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 rounded-xl transition-all font-black">
                              <div className="flex items-center gap-3 flex-1 font-black">
                                <ZenithCheckbox id={task.id} label={task.title} checked={task.status === 'done'} onChange={() => toggleTask(task.id)} />
                                {task.remind && task.status !== 'done' && <Bell size={14} className="text-neutral-300" />}
                                <span className="text-[9px] font-black uppercase text-neutral-300 tracking-tighter px-2 py-0.5 bg-neutral-100 rounded-md">{task.category}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all font-black">
                                <button 
                                  onClick={() => setEditingTask(task)} 
                                  className="p-2 text-neutral-300 hover:text-black hover:bg-neutral-100 rounded-xl active:scale-90 transition-all font-black"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => deleteTask(task.id)} 
                                  className="p-2 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded-xl active:scale-90 transition-all font-black"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-neutral-200 font-black">
                             <Feather size={48} className="mb-4 opacity-20" />
                             <p className="text-xs font-black uppercase tracking-widest">No intentions logged</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notes' && (
              <div className="space-y-8 lg:space-y-12 pt-4 animate-in fade-in max-w-6xl font-black">
                <h1 className="text-4xl lg:text-7xl font-black tracking-tighter">Notes.</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 font-black">
                  <div className="lg:col-span-1 space-y-6 font-black">
                    <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm space-y-6 sticky top-2 font-black">
                      <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">New Insight</h2>
                      <input type="text" placeholder="Theme" className="w-full bg-neutral-50 rounded-xl p-5 font-black outline-none border-2 border-transparent focus:border-neutral-200" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
                      <textarea placeholder="Observation..." className="w-full bg-neutral-50 rounded-xl p-5 font-black h-48 outline-none resize-none border-2 border-transparent focus:border-neutral-200 font-black" value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
                      <button onClick={async () => {
                         if (!newNote.title && !newNote.content) return;
                         const { data } = await supabase.from('notes').insert({ user_id: session.user.id, title: newNote.title || 'Untitled', content: newNote.content, date_label: 'Today' }).select().single();
                         if (data) setNotes([data, ...notes]);
                         setNewNote({ title: '', content: '' });
                      }} className="w-full bg-black text-white rounded-xl py-5 font-black uppercase text-xs tracking-widest hover:bg-neutral-800 transition-all shadow-xl font-black">Log Note</button>
                    </div>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 font-black">
                    {notes.map(note => (
                      <div key={note.id} className="bg-white p-8 rounded-[1.5rem] border border-neutral-100 shadow-sm relative group hover:shadow-md transition-all font-black">
                        <div className="flex items-start justify-between mb-4 font-black"><h4 className="text-xl font-black text-black flex-1">{note.title}</h4><button onClick={async () => {
                           setNotes(notes.filter(n => n.id !== note.id));
                           await supabase.from('notes').delete().eq('id', note.id);
                        }} className="p-2 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90 font-black"><Trash2 size={18} /></button></div>
                        <div className="text-neutral-600 font-black text-sm lg:text-base mb-6 prose prose-sm line-clamp-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }} />
                        <span className="text-[9px] font-black text-neutral-200 uppercase tracking-widest absolute bottom-6 right-8">{note.date_label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'feedback' && (
              <div className="space-y-8 lg:space-y-12 pt-4 animate-in max-w-xl mx-auto font-black">
                <div className="space-y-2 text-center font-black">
                  <h1 className="text-4xl lg:text-7xl font-black tracking-tighter">Voice.</h1>
                  <p className="text-sm font-black text-neutral-500 leading-relaxed italic">
                    Contribute your insights to refine Zenith's sanctuary.
                  </p>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-8 font-black">
                  {feedbackSent ? (
                    <div className="text-center py-12 space-y-6 font-black">
                      <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center text-emerald-500 font-black"><CheckCircle size={40} /></div>
                      <h3 className="text-2xl font-black">Received.</h3>
                      <p className="text-neutral-400 text-sm font-black">Your feedback helps refine the environment.</p>
                      <button onClick={() => setFeedbackSent(false)} className="text-[10px] font-black uppercase tracking-widest text-black underline font-black">Send Another</button>
                    </div>
                  ) : (
                    <div className="space-y-6 font-black">
                      <div className="space-y-1 font-black">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-300 ml-1">Relay Address</label>
                        <input type="email" value={feedbackEmail} onChange={(e) => setFeedbackEmail(e.target.value)} placeholder="email@example.com" className="w-full bg-neutral-50 rounded-2xl py-5 px-8 font-black outline-none border-2 border-transparent focus:border-neutral-200 transition-all" />
                      </div>
                      <div className="space-y-1 font-black">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-300 ml-1">Observations</label>
                        <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Your thoughts..." className="w-full bg-neutral-50 rounded-2xl p-8 font-black min-h-[200px] outline-none resize-none border-2 border-transparent focus:border-neutral-200 transition-all font-black" />
                      </div>
                      <button 
                        onClick={async () => { 
                          setIsSendingFeedback(true); 
                          try {
                            const res = await fetch("https://formspree.io/f/mkowedqd", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: feedbackEmail, message: feedbackText }) });
                            if (res.ok) setFeedbackSent(true);
                          } catch (e) { console.error(e); } finally { setIsSendingFeedback(false); }
                        }} 
                        disabled={!feedbackText.trim() || !feedbackEmail.trim() || isSendingFeedback} 
                        className="w-full bg-black text-white rounded-2xl py-6 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all disabled:opacity-20 shadow-lg font-black"
                      >
                        {isSendingFeedback ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />} Deliver Feedback
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'about' && (
              <div className="space-y-16 lg:space-y-32 pt-12 animate-in fade-in duration-1000 max-w-5xl mx-auto font-black">
                <div className="text-center space-y-8 relative font-black">
                  <div className="absolute inset-0 -z-10 flex items-center justify-center font-black">
                    <Brain size={400} className="text-neutral-50 opacity-[0.4] stroke-[0.5]" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.8em] text-neutral-300">Zenith Protocol</p>
                  <h1 className="text-6xl lg:text-[7rem] font-black tracking-tighter leading-[0.85] text-neutral-900 uppercase">
                    Intentional<br/>Sanctuary.
                  </h1>
                  <p className="text-lg lg:text-2xl text-neutral-500 font-black max-w-2xl mx-auto leading-relaxed italic">
                    A deliberate counter-current to the noise of the digital age.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 font-black">
                  <div className="p-12 bg-white border border-neutral-100 rounded-[3.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group font-black">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-black/10 font-black">
                      <Sunset size={28} />
                    </div>
                    <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">The Dopamine Reset</h3>
                    <p className="text-neutral-500 font-black leading-relaxed text-base mb-4 font-black">
                      Modern technology is designed to exploit your evolutionary dopamine system for engagement. Zenith is a tool for liberation.
                    </p>
                    <p className="text-neutral-400 font-black text-sm leading-relaxed font-black">
                      By eliminating the high-saturation colors and jagged animations found in social feeds, we help your brain recalibrate its baseline stimulation. This enables you to find satisfaction in deep work and quiet reflection rather than temporary digital spikes.
                    </p>
                  </div>

                  <div className="p-12 bg-white border border-neutral-100 rounded-[3.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group font-black">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-black mb-8 group-hover:scale-110 transition-transform font-black">
                      <Anchor size={28} />
                    </div>
                    <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">Static Intentionality</h3>
                    <p className="text-neutral-500 font-black leading-relaxed text-base mb-4 font-black">
                      Planning is not just a logistical task; it is a sacred act of choosing your future. Zenith provides the frame for that choice.
                    </p>
                    <p className="text-neutral-400 font-black text-sm leading-relaxed font-black">
                      Our multi-tier priority system forces a hierarchy of value. You cannot do everything, but you can do the most important thing. Zenith's grid-based interface encourages a calm, structured approach to your agenda, anchoring your day in reality rather than aspiration.
                    </p>
                  </div>

                  <div className="p-12 bg-white border border-neutral-100 rounded-[3.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group font-black">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform font-black">
                      <Mountain size={28} />
                    </div>
                    <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">Sustainable Momentum</h3>
                    <p className="text-neutral-500 font-black leading-relaxed text-base mb-4 font-black">
                      Hyper-productivity is a myth that leads to burnout. True progress is a function of consistency over long horizons.
                    </p>
                    <p className="text-neutral-400 font-black text-sm leading-relaxed font-black">
                      Zenith tracks your trajectory with a focus on "momentum" rather than "speed." Our visualizers show you the cumulative effect of your daily choices, providing a sense of accomplishment that is steady and resilient, not fleeting and volatile.
                    </p>
                  </div>

                  <div className="p-12 bg-white border border-neutral-100 rounded-[3.5rem] shadow-sm hover:shadow-xl transition-all duration-500 group font-black">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 transition-transform font-black">
                      <Coffee size={28} />
                    </div>
                    <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter">Pure Presence</h3>
                    <p className="text-neutral-500 font-black leading-relaxed text-base mb-4 font-black">
                      We believe the best version of this app is the one you spend the least amount of time in. It is a portal, not a destination.
                    </p>
                    <p className="text-neutral-400 font-black text-sm leading-relaxed font-black">
                      Zenith is polished to be functionally invisible. Every interaction is optimized to get you back to the "real world" — to your work, your family, and your passions — as quickly as possible, but with a renewed sense of clarity and purpose.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-black">
                   <div className="p-10 border border-neutral-100 rounded-[2.5rem] text-center space-y-4 font-black">
                      <Compass className="mx-auto text-neutral-300" size={32} />
                      <h4 className="text-xl font-black uppercase">Navigation</h4>
                      <p className="text-xs text-neutral-400 font-black uppercase tracking-widest leading-relaxed">Direct your energy with surgical precision.</p>
                   </div>
                   <div className="p-10 border border-neutral-100 rounded-[2.5rem] text-center space-y-4 font-black">
                      <Heart className="mx-auto text-neutral-300" size={32} />
                      <h4 className="text-xl font-black uppercase">Wellness</h4>
                      <p className="text-xs text-neutral-400 font-black uppercase tracking-widest leading-relaxed">Protect your mental resources at all costs.</p>
                   </div>
                   <div className="p-10 border border-neutral-100 rounded-[2.5rem] text-center space-y-4 font-black">
                      <Moon className="mx-auto text-neutral-300" size={32} />
                      <h4 className="text-xl font-black uppercase">Reflect</h4>
                      <p className="text-xs text-neutral-400 font-black uppercase tracking-widest leading-relaxed">End every session with intentional silence.</p>
                   </div>
                </div>

                <div className="bg-black p-16 lg:p-24 rounded-[4rem] text-center space-y-8 text-white shadow-2xl font-black">
                  <h2 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase leading-tight">
                    Silence the world.<br/>Master the self.
                  </h2>
                  <div className="flex flex-col gap-4 font-black">
                    <p className="text-white/40 font-black uppercase tracking-[0.4em] text-xs">The Zenith Philosophy • Established MMXXIV</p>
                    <div className="w-12 h-px bg-white/20 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Version 1.4.2 • Cloud Synced Identity</p>
                  </div>
                </div>
              </div>
            )}
            
            <footer className="mt-20 text-center py-8 border-t border-neutral-50 font-black flex flex-col items-center gap-2">
              <p className="text-neutral-300 font-black uppercase tracking-[0.5em] text-[10px]">Zenith Sanctuary • MMXXIV</p>
              <p className="text-black font-black text-[11px] uppercase tracking-widest">Made by Blizx</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

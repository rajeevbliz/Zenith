
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Brain, Home, ListTodo, Calendar, 
  StickyNote, Target, SlidersHorizontal, X, Trash2,
  Info, Plus, LogOut, Loader2,
  Wind, Menu, Mail, MessageSquare, Send, CheckCircle, User,
  FileText, Copy, Check, ChevronRight, UserCircle,
  Bell, BellOff, Activity, Eye, EyeOff, Sparkles, Eye as EyeIcon,
  ShieldCheck, AlertCircle, Database, RefreshCw, Terminal,
  HardDrive, Key, Lock
} from 'lucide-react';
import Lenis from 'lenis';
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
  subCategory: PrioritySubCategory;
}

type Section = 'clarity' | 'priorities' | 'planner' | 'notes' | 'feedback' | 'about';

const renderMarkdown = (content: string) => {
  if (!content) return '';
  let html = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-black">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic opacity-80">$1</em>');
  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map(line => {
    if (line.trim().startsWith('- ')) {
      const item = line.trim().substring(2);
      let res = '';
      if (!inList) { res = '<ul class="list-disc ml-4 space-y-1 my-2">'; inList = true; }
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
          <span className="text-xs font-bold">{done} of {total} items clear</span>
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
        <h1 className="text-5xl lg:text-7xl font-black text-black opacity-0 animate-zenith-emerge select-none tracking-[0.3em]">ZENITH</h1>
        <div className="w-12 lg:w-20 h-[1px] bg-black/20 origin-center opacity-0 animate-line-draw my-6"></div>
        <span className="text-[10px] lg:text-xs font-light text-neutral-400 uppercase opacity-0 animate-subtitle-float tracking-[0.6em] translate-x-[0.3em]">find clarity</span>
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
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Account established. Welcome to Zenith.");
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

  return (
    <div className="fixed inset-0 z-[600] bg-[#fbfbfb] flex items-center justify-center p-8 animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-sm:max-w-xs max-w-sm space-y-10 relative my-auto">
        <div className="text-center space-y-4">
          <div className="inline-block p-6 bg-black rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-700">
            <Brain size={48} className="text-white" />
          </div>
          <h2 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase">Zenith</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Cloud-Powered Focus</p>
        </div>

        <div className="flex p-1.5 bg-neutral-200/50 rounded-2xl shadow-inner">
          {(['signin', 'signup'] as const).map(m => (
            <button 
              key={m} 
              onClick={() => { setMode(m); setError(''); }} 
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${mode === m ? 'bg-white text-neutral-900 shadow-md transform scale-[1.02]' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Identity ID</label>
            <input 
              type="email" 
              required 
              placeholder="email@example.com" 
              className="w-full bg-white border border-neutral-200 py-5 px-6 text-neutral-900 font-bold rounded-2xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all shadow-sm placeholder:text-neutral-300" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Portal Key</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••" 
                className="w-full bg-white border border-neutral-200 py-5 px-6 text-neutral-900 font-bold rounded-2xl focus:border-black focus:ring-1 focus:ring-black outline-none transition-all shadow-sm placeholder:text-neutral-300 pr-14" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-black transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-neutral-800"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signin' ? 'Unlock Portal' : 'Establish Identity')}
          </button>
        </form>

        {error && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-4">
             <div className="flex gap-3 text-red-700">
               <AlertCircle className="shrink-0" size={20} />
               <p className="text-xs font-bold leading-relaxed">{error}</p>
             </div>
          </div>
        )}

        <div className="text-center pt-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-300 flex items-center justify-center gap-2">
            <ShieldCheck size={12}/> Secure Supabase Backend
          </p>
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

      const finalProfile = { ...profile, completedOnboarding: true };
      
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
      onComplete(finalProfile);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[500] bg-white flex flex-col items-center justify-center p-8 overflow-y-auto animate-in fade-in duration-700">
        <div className="max-w-md w-full space-y-12">
          <div className="space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-neutral-400">Identity Established</p>
            <h1 className="text-5xl font-black tracking-tighter text-neutral-900 leading-none">Welcome.</h1>
            <div className="space-y-4">
              <p className="text-lg font-bold text-neutral-800 leading-relaxed">You are entering a digital sanctuary designed for depth.</p>
              <p className="text-sm font-medium text-neutral-500 leading-relaxed">Zenith silences the modern noise. Your data is synced securely.</p>
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl">Start Customization <ChevronRight size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col items-center justify-center p-8 animate-in slide-in-from-right-8 duration-500 overflow-y-auto">
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
  <div className="checkbox-container w-full">
    <input type="checkbox" id={id} className="task-checkbox" checked={checked} onChange={(e) => onChange?.(e.target.checked)} />
    <label htmlFor={id} className="checkbox-label flex items-center gap-3 py-3 w-full group">
      <div className="checkbox-box flex-shrink-0 group-hover:border-black transition-colors"></div>
      <span className="checkbox-text text-sm font-bold text-neutral-700 transition-all duration-300 truncate">{label}</span>
    </label>
  </div>
);

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const mainScrollRef = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const [activeSection, setActiveSection] = useState<Section>('clarity');
  const [lowStimMode, setLowStimMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [activePriorityTab, setActivePriorityTab] = useState<PriorityCategory>('Work');
  const [notes, setNotes] = useState<any[]>([]);

  const [showSettings, setShowSettings] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(Notification.permission);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskReminder, setNewTaskReminder] = useState(false);
  const [newPriorityInputs, setNewPriorityInputs] = useState<Record<string, string>>({});
  const [priorityAddingTo, setPriorityAddingTo] = useState<PrioritySubCategory | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Auth Listener & Data Fetcher
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session) {
        fetchProfile(session.user.id);
        fetchUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session) {
        fetchProfile(session.user.id);
        fetchUserData(session.user.id);
      } else {
        setUserProfile(null);
        setTasks([]);
        setPriorities([]);
        setNotes([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setUserProfile({
        name: data.name,
        age: data.age,
        occupation: data.occupation,
        completedOnboarding: data.completed_onboarding,
        email: session?.user?.email
      });
    }
  };

  const fetchUserData = async (userId: string) => {
    const [t, p, n] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('priorities').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);
    if (t.data) setTasks(t.data);
    if (p.data) setPriorities(p.data);
    if (n.data) setNotes(n.data);
  };

  // Sync helpers
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !session) return;
    const { data, error } = await supabase.from('tasks').insert({
      user_id: session.user.id,
      title: newTaskTitle,
      remind: newTaskReminder
    }).select().single();
    if (data) setTasks([data, ...tasks]);
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
    setNewPriorityInputs({ ...newPriorityInputs, [`${category}-${subCategory}`]: '' });
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

  const addNote = async () => {
    if ((!newNote.title && !newNote.content) || !session) return;
    const { data } = await supabase.from('notes').insert({
      user_id: session.user.id,
      title: newNote.title || 'Untitled',
      content: newNote.content,
      date_label: 'Today'
    }).select().single();
    if (data) setNotes([data, ...notes]);
    setNewNote({ title: '', content: '' });
  };

  const deleteNote = async (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    await supabase.from('notes').delete().eq('id', id);
  };

  // Lenis Implementation
  useEffect(() => {
    if (isAuthenticated && userProfile?.completedOnboarding && mainScrollRef.current) {
      const lenis = new Lenis({
        wrapper: mainScrollRef.current,
        lerp: 0.1,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenisRef.current = lenis;
      function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      return () => { lenis.destroy(); lenisRef.current = null; };
    }
  }, [isAuthenticated, userProfile?.completedOnboarding]);

  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  }, [activeSection]);

  const SidebarContent = () => (
    <div className="flex flex-col min-h-full p-8 pb-12">
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
        ].map((item) => (
          <button key={item.id} onClick={() => navigate(item.id as Section)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeSection === item.id ? 'bg-black text-white shadow-xl scale-[1.02]' : 'text-neutral-400 hover:text-black hover:bg-neutral-50'}`}>
            <item.icon size={22} strokeWidth={activeSection === item.id ? 3 : 2} /><span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-8 space-y-4 pt-6 border-t border-neutral-100 shrink-0">
        <button onClick={() => navigate('feedback')} className={`w-full flex items-center gap-4 px-6 py-4 transition-all rounded-2xl ${activeSection === 'feedback' ? 'bg-black text-white' : 'text-neutral-400 hover:text-black hover:bg-neutral-50'}`}><MessageSquare size={20} /><span className="text-xs font-black uppercase tracking-widest">Feedback</span></button>
        <button onClick={() => { setShowSettings(true); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 text-neutral-400 hover:text-black transition-all hover:bg-neutral-50 rounded-2xl"><SlidersHorizontal size={20} /><span className="text-xs font-black uppercase tracking-widest">Settings</span></button>
      </div>
    </div>
  );

  const navigate = (id: Section) => { setActiveSection(id); setIsSidebarOpen(false); };

  return (
    <>
      <SplashScreen onComplete={() => setIsReady(true)} />
      <div className={`fixed inset-0 transition-all duration-1000 ${isReady ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {!isAuthenticated ? (
          <AuthPage onAuthSuccess={() => {}} />
        ) : !userProfile?.completedOnboarding ? (
          <OnboardingFlow onComplete={(p) => setUserProfile(p)} />
        ) : (
          <div className={`h-screen flex flex-col lg:flex-row ${lowStimMode ? 'low-stim bg-[#f0f0f0]' : 'bg-[#fbfbfb]'} relative overflow-hidden`}>
            <div className="grain-overlay opacity-[0.02]"></div>
            <aside className="hidden lg:block w-80 h-full bg-white border-r border-neutral-100 shrink-0 shadow-sm overflow-y-auto no-scrollbar"><SidebarContent /></aside>
            <div className={`lg:hidden fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}>
              <aside className={`absolute left-0 top-0 h-full w-72 bg-white backdrop-blur-2xl transition-transform duration-500 border-r border-neutral-100 overflow-y-auto no-scrollbar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}><SidebarContent /></aside>
            </div>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <header className="lg:hidden px-6 py-4 flex items-center justify-between z-40 bg-white/80 backdrop-blur-md border-b border-neutral-50 shrink-0">
                <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white border border-neutral-100 rounded-2xl shadow-sm active:scale-90 flex items-center gap-2"><Menu size={20} /></button>
                <div className="flex items-center gap-2"><Brain size={20} className="text-black" /><span className="text-sm font-black tracking-tighter uppercase">Zenith</span></div>
                <div className="w-10"></div>
              </header>

              {showSettings && (
                <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black tracking-tighter">Portal Options</h3>
                      <button onClick={() => setShowSettings(false)} className="hover:rotate-90 transition-transform p-1"><X size={24} /></button>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 ml-1">Focus Identity</p>
                        <div className="flex items-center gap-4 p-5 bg-neutral-900 text-white rounded-[1.5rem] shadow-lg">
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><User size={20} className="text-white/60" /></div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Focus Name</p>
                            <p className="text-sm font-bold truncate tracking-tight">{userProfile.name}</p>
                          </div>
                          <ShieldCheck size={18} className="text-emerald-400" />
                        </div>
                      </div>
                      <div className="w-full h-px bg-neutral-100"></div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                          <span className="text-xs font-black uppercase tracking-widest">Low-Stim Mode</span>
                          <button onClick={() => setLowStimMode(!lowStimMode)} className={`w-12 h-7 rounded-full relative transition-all ${lowStimMode ? 'bg-black' : 'bg-neutral-200'}`}><div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${lowStimMode ? 'left-6' : 'left-1'}`} /></button>
                        </div>
                        <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="w-full flex items-center gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-100 text-neutral-600 hover:bg-neutral-100 transition-colors"><LogOut size={20} /><span className="text-xs font-black uppercase tracking-widest">Exit Portal</span></button>
                      </div>
                    </div>
                    <button onClick={() => setShowSettings(false)} className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] mt-8 hover:bg-neutral-800 transition-colors shadow-xl">Resume Focus</button>
                  </div>
                </div>
              )}

              <main ref={mainScrollRef} className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 lg:py-16 w-full scrolling-touch no-scrollbar lg:scrollbar-default">
                <div className="max-w-7xl mx-auto pb-32 lg:pb-16">
                  {activeSection === 'clarity' && (
                    <div className="space-y-8 lg:space-y-12 animate-in slide-in-from-bottom-4 duration-700">
                      <div className="flex flex-col gap-1">
                        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-neutral-900 leading-tight">Hi, {userProfile?.name.split(' ')[0] || 'Zenith User'}.</h1>
                        <p className="text-xs lg:text-lg font-medium text-neutral-400 italic">Welcome back to your sanctuary.</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10"><Pomodoro /><Clock /></div>
                    </div>
                  )}

                  {activeSection === 'priorities' && (
                    <div className="space-y-8 lg:space-y-12 pt-4 animate-in fade-in max-w-5xl">
                      <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">Focus.</h1>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1 space-y-6"><ConcentricVisualizer priorities={priorities} /><TaskProgressCircle tasks={tasks} /></div>
                        <div className="lg:col-span-2 space-y-6">
                          <div className="flex p-1 bg-neutral-100 rounded-2xl">{(['Work', 'Project', 'Private'] as PriorityCategory[]).map(cat => (<button key={cat} onClick={() => setActivePriorityTab(cat)} className={`flex-1 py-3 text-[10px] lg:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activePriorityTab === cat ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-neutral-600'}`}>{cat}</button>))}</div>
                          <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
                            {(['Must Do', 'Should Do', 'Backlog'] as PrioritySubCategory[]).map(sub => (
                              <div key={sub} className="space-y-2">
                                <div className="flex items-center justify-between mb-2"><h3 className="text-[10px] lg:text-xs font-black text-neutral-300 uppercase tracking-widest">{sub}</h3><button onClick={() => setPriorityAddingTo(sub)} className="text-neutral-200 hover:text-black transition-colors"><Plus size={18} /></button></div>
                                {priorityAddingTo === sub && <input autoFocus type="text" placeholder="..." className="w-full bg-neutral-50 border-b border-black py-3 px-1 text-sm font-bold outline-none mb-4" value={newPriorityInputs[`${activePriorityTab}-${sub}`] || ''} onChange={(e) => setNewPriorityInputs({...newPriorityInputs, [`${activePriorityTab}-${sub}`]: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') addPriority(activePriorityTab, sub); if(e.key === 'Escape') setPriorityAddingTo(null); }} />}
                                <div className="space-y-1">{priorities.filter(p => p.category === activePriorityTab && p.sub_category === sub).map(item => (<div key={item.id} className="flex items-center justify-between group py-1.5 transition-all"><ZenithCheckbox id={item.id} label={item.text} checked={item.completed} onChange={() => togglePriority(item.id)} /><button onClick={() => deletePriority(item.id)} className="p-2 text-neutral-200 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 size={16} /></button></div>))}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'planner' && (
                    <div className="space-y-8 lg:space-y-12 pt-4 animate-in fade-in max-w-5xl mx-auto">
                      <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">Plan.</h1>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1"><TaskProgressCircle tasks={tasks} /></div>
                        <div className="lg:col-span-2 space-y-8">
                          <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                            <div className="relative flex items-center gap-2">
                              <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} placeholder="Next intention..." className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl py-6 pl-8 pr-32 text-sm lg:text-base font-black outline-none focus:border-black transition-all" />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button onClick={() => setNewTaskReminder(!newTaskReminder)} className={`p-3 rounded-xl transition-all ${newTaskReminder ? 'bg-neutral-900 text-white shadow-lg' : 'text-neutral-300 hover:text-neutral-500'}`}>{newTaskReminder ? <Bell size={20} /> : <BellOff size={20} />}</button>
                                <button onClick={handleAddTask} className="p-3 bg-black text-white rounded-xl shadow-lg hover:bg-neutral-800 transition-all"><Plus size={20} /></button>
                              </div>
                            </div>
                            <div className="space-y-2">{tasks.map(task => (<div key={task.id} className="flex items-center justify-between group py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 rounded-xl transition-all"><div className="flex items-center gap-3 flex-1"><ZenithCheckbox id={task.id} label={task.title} checked={task.status === 'done'} onChange={() => toggleTask(task.id)} />{task.remind && task.status !== 'done' && <Bell size={14} className="text-neutral-300" />}</div><button onClick={() => deleteTask(task.id)} className="p-2 text-neutral-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button></div>))}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'notes' && (
                    <div className="space-y-8 lg:space-y-12 pt-4 animate-in fade-in max-w-6xl">
                      <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">Notes.</h1>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1 space-y-6">
                          <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm space-y-6 sticky top-2">
                            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">New Insight</h2>
                            <input type="text" placeholder="Theme" className="w-full bg-neutral-50 rounded-xl p-5 font-black outline-none border border-transparent focus:border-neutral-200" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
                            <textarea placeholder="Observation..." className="w-full bg-neutral-50 rounded-xl p-5 font-bold h-48 outline-none resize-none border border-transparent focus:border-neutral-200" value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
                            <button onClick={addNote} className="w-full bg-black text-white rounded-xl py-5 font-black uppercase text-xs tracking-widest hover:bg-neutral-800 transition-all">Log Note</button>
                          </div>
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {notes.map(note => (
                            <div key={note.id} className="bg-white p-8 rounded-[1.5rem] border border-neutral-100 shadow-sm relative group hover:shadow-md transition-all">
                              <div className="flex items-start justify-between mb-4"><h4 className="text-xl font-black text-black flex-1">{note.title}</h4><button onClick={() => deleteNote(note.id)} className="text-neutral-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button></div>
                              <div className="text-neutral-600 font-medium text-sm lg:text-base mb-6 prose prose-sm line-clamp-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }} />
                              <span className="text-[9px] font-black text-neutral-200 uppercase tracking-widest absolute bottom-6 right-8">{note.date_label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'feedback' && (
                    <div className="space-y-8 lg:space-y-12 pt-4 animate-in max-w-xl">
                      <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">Voice.</h1>
                      <div className="bg-white p-10 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-8">
                        {feedbackSent ? (
                          <div className="text-center py-12 space-y-6"><div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center text-emerald-500"><CheckCircle size={40} /></div><h3 className="text-2xl font-black">Received.</h3><p className="text-neutral-400 text-sm">Your feedback helps refine the sanctuary.</p></div>
                        ) : (
                          <div className="space-y-6">
                            <input type="email" value={feedbackEmail} onChange={(e) => setFeedbackEmail(e.target.value)} placeholder="Relay Address" className="w-full bg-neutral-50 rounded-2xl py-5 px-8 font-bold outline-none border border-transparent focus:border-neutral-200" />
                            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Your thoughts..." className="w-full bg-neutral-50 rounded-2xl p-8 font-bold min-h-[200px] outline-none resize-none border border-transparent focus:border-neutral-200" />
                            <button onClick={async () => { 
                              setIsSendingFeedback(true); 
                              try {
                                const res = await fetch("https://formspree.io/f/mkowedqd", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: feedbackEmail, message: feedbackText }) });
                                if (res.ok) setFeedbackSent(true);
                              } catch (e) { console.error(e); } finally { setIsSendingFeedback(false); }
                            }} disabled={!feedbackText.trim() || !feedbackEmail.trim()} className="w-full bg-black text-white rounded-2xl py-6 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all disabled:opacity-20">{isSendingFeedback ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}Deliver</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === 'about' && (
                    <div className="space-y-16 lg:space-y-24 pt-12 text-center max-w-2xl mx-auto">
                      <h1 className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] text-neutral-900">Less,<br/>but better.</h1>
                      <div className="p-10 lg:p-16 bg-black rounded-[3rem] text-white shadow-2xl scale-[1.05]"><p className="text-xl lg:text-3xl font-medium italic opacity-90 leading-relaxed">"Simplicity is the presence of meaning."</p></div>
                    </div>
                  )}
                  
                  <footer className="mt-20 text-center py-8 border-t border-neutral-50"><p className="text-neutral-400 font-black uppercase tracking-[0.5em] text-[10px]">made by BlizX • cloud-synced</p></footer>
                </div>
              </main>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default App;

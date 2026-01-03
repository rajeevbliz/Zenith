
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Clock as ClockIcon } from 'lucide-react';

export const Pomodoro: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(1500); // 25:00
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'short' | 'long' | 'custom'>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState(25);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') setTimeLeft(1500);
    else if (mode === 'short') setTimeLeft(300);
    else if (mode === 'long') setTimeLeft(900);
    else setTimeLeft(customMinutes * 60);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    setCustomMinutes(val);
    if (mode === 'custom') {
      setTimeLeft(val * 60);
      setIsActive(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-[#0a0a0a] to-[#222222] rounded-[2.5rem] p-6 lg:p-8 text-white shadow-2xl flex flex-col items-center justify-center h-full transition-all border border-white/5 group min-h-[300px] sm:min-h-[360px]">
      <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl w-full justify-center border border-white/5">
        {(['pomodoro', 'short', 'long', 'custom'] as const).map((m) => (
          <button 
            key={m}
            onClick={() => { 
              setMode(m); 
              setIsActive(false);
              if (m === 'pomodoro') setTimeLeft(1500);
              else if (m === 'short') setTimeLeft(300);
              else if (m === 'long') setTimeLeft(900);
              else setTimeLeft(customMinutes * 60);
            }}
            className={`px-2.5 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all whitespace-nowrap tracking-widest ${mode === m ? 'bg-white text-black shadow-lg' : 'text-white/20 hover:text-white/40'}`}
          >
            {m === 'pomodoro' ? 'Focus' : m}
          </button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="mb-4 flex items-center gap-2 animate-in fade-in zoom-in duration-500 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
          <ClockIcon size={10} className="text-white/40" />
          <input 
            type="number" 
            min="1" 
            max="999"
            value={customMinutes}
            onChange={handleCustomChange}
            className="bg-transparent border-none p-0 text-xs font-black w-10 text-center focus:ring-0 outline-none placeholder:text-white/20"
            placeholder="Mins"
          />
          <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">MINS</span>
        </div>
      )}
      
      <div className="text-4xl lg:text-6xl font-black mb-8 tabular-nums tracking-tighter transition-all duration-500 text-white/90">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-2 w-full max-w-[240px]">
        <button 
          onClick={toggleTimer}
          className="flex-[3] bg-white text-black h-11 lg:h-12 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20"
        >
          {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        <button 
          onClick={resetTimer} 
          className="flex-1 h-11 lg:h-12 flex items-center justify-center bg-white/5 rounded-xl active:scale-90 transition-all border border-white/5 hover:bg-white/10"
        >
          <RotateCcw size={14} className="text-white/40 hover:text-white" />
        </button>
      </div>
    </div>
  );
};

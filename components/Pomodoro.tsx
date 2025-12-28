
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
    <div className="bg-gradient-to-br from-[#121212] to-[#242424] rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl flex flex-col items-center justify-center h-full min-h-[260px] sm:min-h-[320px] transition-all">
      <div className="flex gap-2 mb-4 sm:mb-6 bg-white/5 p-1 rounded-2xl overflow-x-auto no-scrollbar w-full justify-center">
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
            className={`px-3 py-1.5 sm:py-2 text-[8px] sm:text-[9px] font-bold uppercase rounded-xl transition-all whitespace-nowrap ${mode === m ? 'bg-white/20 text-white' : 'text-white/40'}`}
          >
            {m === 'pomodoro' ? 'Work' : m}
          </button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="mb-2 sm:mb-4 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
          <ClockIcon size={12} className="text-white/40" />
          <input 
            type="number" 
            min="1" 
            max="999"
            value={customMinutes}
            onChange={handleCustomChange}
            className="bg-white/10 border-none rounded-lg px-2 py-0.5 text-xs font-bold w-16 text-center focus:ring-1 focus:ring-white/30 outline-none"
            placeholder="Mins"
          />
        </div>
      )}
      
      <div className="text-5xl sm:text-7xl font-light mb-6 sm:mb-8 tabular-nums tracking-tighter">
        {formatTime(timeLeft)}
      </div>

      <div className="flex items-center gap-3 w-full">
        <button 
          onClick={toggleTimer}
          className="flex-1 bg-white text-black h-12 sm:h-14 rounded-[1.25rem] font-bold text-xs sm:text-sm hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {isActive ? 'PAUSE' : 'START'}
        </button>
        <button onClick={resetTimer} className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white/10 rounded-[1.25rem] active:scale-90 transition-all">
          <RotateCcw size={16} className="text-white/60" />
        </button>
      </div>
    </div>
  );
};

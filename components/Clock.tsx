
import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate IST (UTC+5:30)
  const istDate = new Date(time.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

  const formatDigitalTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).toUpperCase();
  };

  return (
    <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 sm:p-10 text-neutral-900 shadow-sm flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[360px] relative overflow-hidden transition-all hover:border-neutral-200">
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 border-2 border-neutral-100 rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-inner bg-neutral-50/30">
        {/* Hour Hand based on IST */}
        <div 
          className="absolute w-1 h-8 sm:h-10 bg-neutral-300 origin-bottom bottom-1/2 rounded-full transition-transform duration-500 shadow-sm"
          style={{ transform: `rotate(${istDate.getHours() * 30 + istDate.getMinutes() * 0.5}deg)` }}
        />
        {/* Minute Hand based on IST */}
        <div 
          className="absolute w-0.5 h-10 sm:h-14 bg-neutral-500 origin-bottom bottom-1/2 rounded-full transition-transform duration-500 shadow-sm"
          style={{ transform: `rotate(${istDate.getMinutes() * 6}deg)` }}
        />
        <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full z-10 shadow-lg" />
      </div>
      
      <div className="flex flex-col items-center gap-1 sm:gap-2">
        <div className="text-3xl sm:text-5xl font-black tracking-tighter leading-none text-neutral-900 drop-shadow-sm">
          {formatDigitalTime(istDate)}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-3 py-1 bg-black text-white text-[9px] sm:text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-lg">IST</span>
          <div className="text-[10px] sm:text-[11px] uppercase font-black tracking-[0.3em] text-neutral-400">Synchronized</div>
        </div>
      </div>
    </div>
  );
};

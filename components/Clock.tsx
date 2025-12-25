
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
    <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-6 sm:p-8 text-neutral-800 shadow-sm flex flex-col items-center justify-center min-h-[180px] sm:min-h-[260px] relative overflow-hidden transition-all">
      <div className="relative w-16 h-16 sm:w-24 sm:h-24 border border-neutral-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
        {/* Hour Hand based on IST */}
        <div 
          className="absolute w-0.5 h-6 sm:h-8 bg-neutral-200 origin-bottom bottom-1/2 rounded-full transition-transform duration-500"
          style={{ transform: `rotate(${istDate.getHours() * 30 + istDate.getMinutes() * 0.5}deg)` }}
        />
        {/* Minute Hand based on IST */}
        <div 
          className="absolute w-[0.5px] h-8 sm:h-10 bg-neutral-400 origin-bottom bottom-1/2 transition-transform duration-500"
          style={{ transform: `rotate(${istDate.getMinutes() * 6}deg)` }}
        />
        <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full z-10" />
      </div>
      
      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
        <div className="text-2xl sm:text-4xl font-black tracking-tighter leading-none">
          {formatDigitalTime(istDate)}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-[7px] sm:text-[8px] font-black rounded-md uppercase tracking-widest">IST</span>
          <div className="text-[8px] sm:text-[9px] uppercase font-black tracking-[0.2em] text-neutral-300">Synchronized</div>
        </div>
      </div>
    </div>
  );
};

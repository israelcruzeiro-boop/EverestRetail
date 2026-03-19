import React, { useState, useEffect } from 'react';

const TARGET_DATE = new Date('2026-03-26T09:00:00-03:00');

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = TARGET_DATE.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/5 border border-white/10 backdrop-blur-sm w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-2 group hover:border-cyan-500/50 transition-colors">
        <span className="text-2xl md:text-4xl font-black text-cyan-400 tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] uppercase font-black tracking-widest text-slate-500">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-4 md:gap-6 py-6 border-y border-white/5 my-8">
      <TimeUnit value={timeLeft.days} label="Dias" />
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <TimeUnit value={timeLeft.seconds} label="Seg" />
    </div>
  );
};

export default CountdownTimer;

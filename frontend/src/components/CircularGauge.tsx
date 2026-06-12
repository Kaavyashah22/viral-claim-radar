import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

export const CircularGauge = ({ value, maxValue = 100 }: { value: number, maxValue?: number }) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / maxValue) * circumference;
  
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(Math.round(v))
    });
    return controls.stop;
  }, [value]);

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background Circle */}
        <circle 
          cx="50%" cy="50%" r={radius} 
          className="stroke-gray-200 dark:stroke-slate-700 fill-none" strokeWidth="8" 
        />
        {/* Progress Circle */}
        <motion.circle 
          cx="50%" cy="50%" r={radius} 
          className="stroke-current fill-none" 
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex items-center justify-center text-xl font-bold dark:text-white">
        {displayValue}%
      </div>
    </div>
  );
};

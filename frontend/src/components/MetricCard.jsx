import React from 'react';
import CountUp from 'react-countup';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  averageValue,
  isPercent = true,
  color = 'cyan', // 'cyan', 'purple', 'pink', 'green'
  suffix = ''
}) => {
  // Color class maps
  const colorMap = {
    purple: {
      text: 'text-accent-purple',
      border: 'border-accent-purple/20',
      ring: 'stroke-accent-purple',
      bg: 'bg-accent-purple/10',
    },
    cyan: {
      text: 'text-accent-cyan',
      border: 'border-accent-cyan/20',
      ring: 'stroke-accent-cyan',
      bg: 'bg-accent-cyan/10',
    },
    pink: {
      text: 'text-accent-pink',
      border: 'border-accent-pink/20',
      ring: 'stroke-accent-pink',
      bg: 'bg-accent-pink/10',
    },
    green: {
      text: 'text-accent-green',
      border: 'border-accent-green/20',
      ring: 'stroke-accent-green',
      bg: 'bg-accent-green/10',
    }
  };

  const currentTheme = colorMap[color] || colorMap.cyan;
  
  // Calculate percentage vs average
  const diff = value - averageValue;
  const isBetter = title === 'Loss' ? diff < 0 : diff > 0;
  const absDiffPercent = averageValue !== 0 ? Math.abs((diff / averageValue) * 100).toFixed(1) : '0.0';

  // SVG parameters for the ring gauge
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value * circumference);

  return (
    <div className="bg-bg-card border border-border-card rounded-2xl p-5 hover:border-white/10 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      {/* Subtle glowing corner */}
      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${currentTheme.bg}`}></div>
      
      <div className="flex justify-between items-start">
        {/* Metric Label and Value */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono tracking-tight text-text-primary`}>
              {(() => {
                const CountUpComponent = CountUp.default || CountUp;
                return (
                  <CountUpComponent
                    start={0}
                    end={isPercent ? value * 100 : value}
                    decimals={isPercent ? 1 : 3}
                    duration={1.2}
                    suffix={isPercent ? '%' : suffix}
                  />
                );
              })()}
            </span>
          </div>
        </div>

        {/* Circular Ring Gauge */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-border-card"
              strokeWidth="3.5"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="24"
              cy="24"
              r={radius}
              className={`${currentTheme.ring} transition-all duration-1000 ease-out`}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <span className={`absolute text-[8px] font-mono font-bold ${currentTheme.text}`}>
            {isPercent ? Math.round(value * 100) : value.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Trend comparison row */}
      <div className="mt-4 pt-3 border-t border-border-card/60 flex items-center gap-1.5">
        <div className={`flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
          isBetter 
            ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' 
            : 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20'
        }`}>
          {isBetter ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>{absDiffPercent}%</span>
        </div>
        <span className="text-[10px] text-text-muted font-semibold">
          vs dataset avg ({isPercent ? `${(averageValue * 100).toFixed(1)}%` : averageValue.toFixed(2)})
        </span>
      </div>
    </div>
  );
};

export default MetricCard;

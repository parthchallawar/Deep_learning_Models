import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { Cpu, Zap, Activity } from 'lucide-react';
import { ARCH_COLORS, OPT_COLORS } from '../utils/colors';

const ExperimentCard = ({
  experiment,
  selected,
  onClick
}) => {
  const {
    exp_id,
    arch,
    optimizer,
    batch_size,
    augmented,
    accuracy,
    f1,
    auc_roc,
    val_acc = []
  } = experiment;

  // Mini sparkline data structure
  const sparklineData = val_acc.map((val, idx) => ({ id: idx, value: val }));

  const archColor = ARCH_COLORS[arch] || '#64748b';
  const optColor = OPT_COLORS[optimizer] || '#64748b';

  return (
    <div
      onClick={onClick}
      className={`relative bg-bg-card border rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        selected
          ? 'border-accent-purple shadow-lg shadow-accent-purple/10 bg-bg-card/90'
          : 'border-border-card hover:border-white/10'
      }`}
    >
      {/* Selection Border highlight */}
      {selected && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-accent-purple rounded-bl-xl rounded-tr-xl flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-text-primary rounded-full animate-ping"></span>
        </span>
      )}

      {/* Card Header */}
      <div className="flex justify-between items-center mb-3">
        <span 
          style={{ borderColor: archColor, color: archColor }}
          className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border bg-black/20"
        >
          {exp_id}
        </span>
        
        {/* Sparkline Visual */}
        <div className="w-20 h-6 shrink-0 opacity-80">
          {sparklineData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={archColor}
                  strokeWidth={1.5}
                  dot={false}
                  animationDuration={600}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Hyperparameter Chips Row */}
      <div className="flex flex-wrap gap-1.5 mb-4 text-[10px] font-bold font-mono">
        <span 
          style={{ backgroundColor: `${archColor}15`, color: archColor }}
          className="px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/5"
        >
          <Cpu className="w-3 h-3" />
          {arch}
        </span>
        <span 
          style={{ backgroundColor: `${optColor}15`, color: optColor }}
          className="px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/5 uppercase"
        >
          <Zap className="w-3 h-3" />
          {optimizer}
        </span>
        <span className="bg-bg-primary text-text-muted border border-border-card px-2 py-0.5 rounded-md">
          BS{batch_size}
        </span>
        <span className={`px-2 py-0.5 rounded-md border border-white/5 ${
          augmented 
            ? 'bg-accent-cyan/10 text-accent-cyan' 
            : 'bg-white/5 text-text-muted'
        }`}>
          {augmented ? 'AUG' : 'NO-AUG'}
        </span>
      </div>

      {/* Accuracy Indicator with Progress Fill */}
      <div className="flex flex-col gap-1.5 mt-2">
        <div className="flex justify-between items-baseline text-xs">
          <span className="text-text-muted font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-accent-cyan" />
            Accuracy
          </span>
          <span className="font-mono font-black text-text-primary">
            {(accuracy * 100).toFixed(1)}%
          </span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden border border-white/5">
          <div
            style={{ 
              width: `${accuracy * 100}%`,
              backgroundImage: `linear-gradient(90deg, ${archColor}, #06b6d4)`
            }}
            className="h-full rounded-full transition-all duration-1000 ease-out"
          ></div>
        </div>
      </div>

      {/* F1 and AUC Grid */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border-card/60 text-[10px] font-mono text-text-muted">
        <div>
          <span>F1 SCORE</span>
          <p className="font-bold text-text-primary text-xs mt-0.5">{(f1).toFixed(3)}</p>
        </div>
        <div className="text-right">
          <span>AUC-ROC</span>
          <p className="font-bold text-accent-cyan text-xs mt-0.5">{(auc_roc * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

export default ExperimentCard;

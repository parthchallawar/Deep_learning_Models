import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowDown, Cpu, ShieldAlert } from 'lucide-react';
import { formatParams } from '../utils/formatters';

const ArchitectureDiagram = ({
  architecture = [],
  archType = 'CNN'
}) => {
  // Helper to color-code layer types
  const getLayerStyles = (type) => {
    const lowercaseType = type.toLowerCase();
    
    if (lowercaseType.includes('input')) {
      return {
        bg: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        glow: 'shadow-slate-500/10',
        badge: 'bg-slate-500/20 text-slate-300'
      };
    }
    if (lowercaseType.includes('conv')) {
      return {
        bg: 'bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan',
        glow: 'shadow-accent-cyan/15',
        badge: 'bg-accent-cyan/20 text-accent-cyan'
      };
    }
    if (lowercaseType.includes('dense')) {
      return {
        bg: 'bg-accent-purple/10 border-accent-purple/40 text-accent-purple',
        glow: 'shadow-accent-purple/15',
        badge: 'bg-accent-purple/20 text-accent-purple'
      };
    }
    if (lowercaseType.includes('pool')) {
      return {
        bg: 'bg-accent-pink/10 border-accent-pink/40 text-accent-pink',
        glow: 'shadow-accent-pink/15',
        badge: 'bg-accent-pink/20 text-accent-pink'
      };
    }
    if (lowercaseType.includes('mobilenet') || lowercaseType.includes('backbone') || lowercaseType.includes('tl')) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
        glow: 'shadow-emerald-500/20',
        badge: 'bg-emerald-500/20 text-emerald-300'
      };
    }
    // Default/Dropout/BatchNorm
    return {
      bg: 'bg-white/5 border-border-card text-text-muted',
      glow: 'shadow-none',
      badge: 'bg-white/10 text-text-muted'
    };
  };

  return (
    <div className="flex flex-col items-center py-6 w-full max-w-lg mx-auto">
      {/* Starting indicator */}
      <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-bg-card border border-border-card rounded-full text-xs font-mono font-bold text-text-muted uppercase tracking-widest shadow-md">
        <Cpu className="w-4 h-4 text-accent-cyan animate-spin" />
        Sequential Data Flow
      </div>

      {/* Layer Block Loop */}
      <div className="flex flex-col items-center gap-2 w-full">
        {architecture.map((layer, index) => {
          const style = getLayerStyles(layer.layer_type);
          const isBackbone = layer.layer_type.toLowerCase().includes('backbone');

          return (
            <React.Fragment key={index}>
              {/* Arrow Connector */}
              {index > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center my-0.5 text-text-muted/60"
                >
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </motion.div>
              )}

              {/* Styled Layer Block */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`w-full border rounded-2xl p-4 flex justify-between items-center gap-4 transition-all duration-300 hover:scale-[1.01] shadow-lg ${style.bg} ${style.glow}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center shrink-0">
                    <span className="font-mono text-xs font-black">{index + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-black text-sm tracking-tight text-text-primary truncate">
                        {layer.layer_type}
                      </span>
                      {isBackbone && (
                        <span className="text-[8px] uppercase tracking-widest font-black bg-accent-cyan/15 text-accent-cyan px-2 py-0.5 rounded-full border border-accent-cyan/20 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Frozen
                        </span>
                      )}
                    </div>
                    {/* Output shape */}
                    <div className="text-[10px] text-text-muted font-mono leading-none flex items-center gap-1.5 flex-wrap">
                      <span>OUT:</span>
                      <span className="text-text-primary font-bold">
                        {JSON.stringify(layer.output_shape)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Param Count Badge */}
                <div className="text-right shrink-0">
                  <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg ${style.badge}`}>
                    {layer.params > 0 ? `PARAMS: ${formatParams(layer.params)}` : '0 PARAMS'}
                  </span>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
      
      {/* End Indicator */}
      <div className="h-4 w-px bg-border-card my-3"></div>
      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent-purple to-accent-cyan flex items-center justify-center text-[10px] font-black text-text-primary shadow-lg shadow-accent-purple/20">
        ✔
      </div>
    </div>
  );
};

export default ArchitectureDiagram;

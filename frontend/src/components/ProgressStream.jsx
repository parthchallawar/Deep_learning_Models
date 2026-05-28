import React, { useEffect, useRef } from 'react';
import { Terminal, Activity, TrendingUp, Cpu } from 'lucide-react';

const ProgressStream = ({
  progress = [],
  currentEpoch = 0,
  totalEpochs = 20,
  streaming,
  error
}) => {
  const terminalEndRef = useRef(null);

  // Automatically scroll terminal logs to bottom on new updates
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [progress]);

  const progressPercent = totalEpochs > 0 ? (currentEpoch / totalEpochs) * 100 : 0;
  
  // Get latest metrics
  const latestData = progress[progress.length - 1] || null;
  const currentValAcc = latestData ? latestData.val_acc : 0;
  const currentValLoss = latestData ? latestData.val_loss : 4.0;
  const currentTrainAcc = latestData ? latestData.train_acc : 0;
  const currentTrainLoss = latestData ? latestData.train_loss : 4.0;

  return (
    <div className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border-card">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-black text-sm text-text-primary">Live Epoch Training Feed</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono bg-accent-purple/10 border border-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full uppercase font-black">
          <Cpu className="w-3 h-3 animate-spin" /> Stream Active
        </div>
      </div>

      {error && (
        <div className="bg-accent-pink/10 border border-accent-pink/20 text-accent-pink px-4 py-3 rounded-xl text-xs font-mono">
          {error}
        </div>
      )}

      {/* Progress metrics panels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-bg-primary/50 border border-border-card rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[8px] font-bold font-mono text-text-muted uppercase">Train Acc</span>
          <span className="text-sm font-black font-mono text-accent-cyan">{(currentTrainAcc * 100).toFixed(1)}%</span>
        </div>
        {/* Metric 2 */}
        <div className="bg-bg-primary/50 border border-border-card rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[8px] font-bold font-mono text-text-muted uppercase">Val Acc</span>
          <span className="text-sm font-black font-mono text-accent-purple">{(currentValAcc * 100).toFixed(1)}%</span>
        </div>
        {/* Metric 3 */}
        <div className="bg-bg-primary/50 border border-border-card rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[8px] font-bold font-mono text-text-muted uppercase">Train Loss</span>
          <span className="text-sm font-black font-mono text-accent-pink">{currentTrainLoss.toFixed(4)}</span>
        </div>
        {/* Metric 4 */}
        <div className="bg-bg-primary/50 border border-border-card rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[8px] font-bold font-mono text-text-muted uppercase">Val Loss</span>
          <span className="text-sm font-black font-mono text-text-primary">{currentValLoss.toFixed(4)}</span>
        </div>
      </div>

      {/* Progress Bar and Indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-text-muted font-bold">
          <span>PROGRESS</span>
          <span>
            {currentEpoch} / {totalEpochs} EPOCHS ({Math.round(progressPercent)}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-bg-primary rounded-full overflow-hidden border border-white/5 relative">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full rounded-full bg-gradient-to-r from-accent-purple via-accent-pink to-accent-cyan transition-all duration-300 relative"
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Terminal Visual Log Console */}
      <div className="bg-bg-primary border border-border-card rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] text-text-muted flex flex-col gap-1.5 scrollbar-thin">
        <div className="text-accent-cyan border-b border-border-card/30 pb-1 mb-1 font-bold">
          [SYSTEM INITIALIZED] - CALTECH-101 REALTIME PROCESS CONNECTOR
        </div>
        
        {progress.map((log, index) => (
          <div key={index} className="flex flex-col gap-0.5 border-b border-border-card/10 pb-1">
            <div className="flex justify-between text-text-primary">
              <span className="text-accent-purple font-bold">▶ EPOCH {log.epoch}/{totalEpochs}</span>
              <span className="text-text-muted text-[8px]">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pl-4 text-text-muted">
              <span>ACCURACY: <span className="text-accent-cyan font-bold">{(log.train_acc * 100).toFixed(1)}% (train)</span> / <span className="text-accent-cyan font-bold">{(log.val_acc * 100).toFixed(1)}% (val)</span></span>
              <span className="text-right">LOSS: <span className="text-accent-pink font-bold">{log.train_loss.toFixed(4)} (train)</span> / <span className="text-accent-pink font-bold">{log.val_loss.toFixed(4)} (val)</span></span>
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex items-center gap-1.5 text-accent-cyan font-bold animate-pulse mt-1">
            <Activity className="w-3.5 h-3.5" />
            <span>CONNECTING STREAM AND RUNNING NEXT CONVOLUTION FEED...</span>
          </div>
        )}

        {latestData?.status === 'completed' && (
          <div className="text-accent-green font-bold flex items-center gap-1.5 mt-2 bg-accent-green/5 border border-accent-green/20 p-2 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>[RUN COMPLETED SUCCESS] evaluation metrics logged. Scroll below to view detailed charts.</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default ProgressStream;

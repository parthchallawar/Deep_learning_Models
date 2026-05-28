import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Play, Pause, Download, Table } from 'lucide-react';
import html2canvas from 'html2canvas';

const TrainingHistory = ({
  trainAcc = [],
  valAcc = [],
  trainLoss = [],
  valLoss = [],
  expId
}) => {
  const [activeEpoch, setActiveEpoch] = useState(trainAcc.length);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(300); // ms per epoch

  // Format data up to active epoch for scrubber animation
  const chartData = Array.from({ length: activeEpoch }).map((_, i) => ({
    epoch: i + 1,
    train_acc: trainAcc[i] !== undefined ? parseFloat((trainAcc[i] * 100).toFixed(1)) : null,
    val_acc: valAcc[i] !== undefined ? parseFloat((valAcc[i] * 100).toFixed(1)) : null,
    train_loss: trainLoss[i] !== undefined ? parseFloat(trainLoss[i].toFixed(3)) : null,
    val_loss: valLoss[i] !== undefined ? parseFloat(valLoss[i].toFixed(3)) : null,
  }));

  // Replay animation effect
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveEpoch((prev) => {
          if (prev >= trainAcc.length) {
            setIsPlaying(false);
            return trainAcc.length;
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, trainAcc.length, playSpeed]);

  useEffect(() => {
    setActiveEpoch(trainAcc.length);
  }, [trainAcc]);

  const togglePlay = () => {
    if (activeEpoch >= trainAcc.length) {
      setActiveEpoch(1);
    }
    setIsPlaying(!isPlaying);
  };

  // Export to PNG (using html2canvas)
  const handleExportPNG = () => {
    const chartNode = document.querySelector('#training-history-card');
    if (!chartNode) return;
    
    html2canvas(chartNode, { backgroundColor: '#111827' }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `${expId}_training_history.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvRows = [['Epoch', 'Train Accuracy (%)', 'Val Accuracy (%)', 'Train Loss', 'Val Loss']];
    for (let i = 0; i < trainAcc.length; i++) {
      csvRows.push([
        i + 1,
        (trainAcc[i] * 100).toFixed(1),
        (valAcc[i] * 100).toFixed(1),
        trainLoss[i].toFixed(4),
        valLoss[i].toFixed(4)
      ]);
    }
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${expId}_training_metrics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      id="training-history-card" 
      className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-4 relative"
    >
      {/* Header with Export Controls */}
      <div className="flex justify-between items-center pb-2 border-b border-border-card">
        <div>
          <h3 className="font-black text-sm text-text-primary">Training & Validation Curves</h3>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            Dual-Axis Optimization Visualizer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPNG}
            className="p-2 bg-white/5 border border-white/10 hover:border-accent-purple/30 hover:bg-accent-purple/10 rounded-xl transition-all text-text-muted hover:text-text-primary"
            title="Download PNG Chart"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2 bg-white/5 border border-white/10 hover:border-accent-cyan/30 hover:bg-accent-cyan/10 rounded-xl transition-all text-text-muted hover:text-text-primary"
            title="Export CSV Metrics"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chart Visualization */}
      <div className="w-full h-80 relative mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ left: -10, right: -10, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="epoch" 
              stroke="#64748b" 
              fontSize={10} 
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis 
              yAxisId="left" 
              domain={[0, 100]} 
              stroke="#06b6d4" 
              fontSize={10} 
              fontFamily="monospace"
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#ec4899" 
              fontSize={10} 
              fontFamily="monospace"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(16, 24, 39, 0.95)',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#f1f5f9'
              }}
            />
            <Legend verticalAlign="top" height={36} iconSize={10} iconType="circle" />
            
            {/* Accuracy Lines (Cyan/Blue) */}
            <Line
              yAxisId="left"
              type="monotone"
              name="Train Accuracy (%)"
              dataKey="train_acc"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={300}
            />
            <Line
              yAxisId="left"
              type="monotone"
              name="Val Accuracy (%)"
              dataKey="val_acc"
              stroke="#06b6d4"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              animationDuration={300}
            />

            {/* Loss Lines (Pink/Red) */}
            <Line
              yAxisId="right"
              type="monotone"
              name="Train Loss"
              dataKey="train_loss"
              stroke="#ec4899"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              animationDuration={300}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Val Loss"
              dataKey="val_loss"
              stroke="#ec4899"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              animationDuration={300}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Scrubber and Timeline Controller */}
      <div className="mt-4 bg-bg-primary/60 border border-border-card rounded-xl p-3 flex flex-col gap-3">
        <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
          <span className="font-bold">EPOCH scrubbing CONTROL</span>
          <span className="text-text-primary font-bold">
            EPOCH {activeEpoch} / {trainAcc.length}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-accent-pink/20 text-accent-pink border border-accent-pink/30 hover:scale-105' 
                : 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30 hover:scale-105'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-accent-pink" /> : <Play className="w-4 h-4 fill-accent-purple ml-0.5" />}
          </button>

          <input
            type="range"
            min="1"
            max={trainAcc.length || 20}
            value={activeEpoch}
            onChange={(e) => {
              setIsPlaying(false);
              setActiveEpoch(parseInt(e.target.value));
            }}
            className="flex-1 accent-accent-purple cursor-pointer h-1.5 rounded-full bg-border-card"
          />
        </div>
      </div>
    </div>
  );
};

export default TrainingHistory;

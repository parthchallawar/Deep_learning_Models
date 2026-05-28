import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Line 
} from 'recharts';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const ROCCurve = ({
  fpr = [],
  tpr = [],
  auc = 0.5,
  expId
}) => {
  // Construct data structures for AreaChart
  // We combine FPR, TPR, and the baseline (y = x)
  const chartData = fpr.map((val, idx) => ({
    fpr: parseFloat(val.toFixed(3)),
    tpr: tpr[idx] !== undefined ? parseFloat(tpr[idx].toFixed(3)) : 0.0,
    baseline: parseFloat(val.toFixed(3)),
  }));

  const handleExportPNG = () => {
    const chartNode = document.querySelector('#roc-curve-card');
    if (!chartNode) return;
    
    html2canvas(chartNode, { backgroundColor: '#111827' }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `${expId}_roc_curve.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <div 
      id="roc-curve-card" 
      className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-4 relative"
    >
      {/* Card Header with Export button */}
      <div className="flex justify-between items-center pb-2 border-b border-border-card">
        <div>
          <h3 className="font-black text-sm text-text-primary">Receiver Operating Characteristic (ROC)</h3>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            Area Under the Curve (AUC): {(auc * 100).toFixed(1)}%
          </p>
        </div>
        <button
          onClick={handleExportPNG}
          className="p-2 bg-white/5 border border-white/10 hover:border-accent-purple/30 hover:bg-accent-purple/10 rounded-xl transition-all text-text-muted hover:text-text-primary"
          title="Download PNG Chart"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recharts AreaChart with shaded AUC */}
      <div className="w-full h-80 relative mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="rocGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="fpr" 
              type="number"
              domain={[0, 1]}
              stroke="#64748b" 
              fontSize={10} 
              fontFamily="monospace"
              tickLine={false}
              tickFormatter={(v) => v.toFixed(1)}
              label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            />
            <YAxis 
              type="number"
              domain={[0, 1]}
              stroke="#64748b" 
              fontSize={10} 
              fontFamily="monospace"
              tickLine={false}
              tickFormatter={(v) => v.toFixed(1)}
              label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', offset: 5, fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
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
              formatter={(val, name) => [
                val, 
                name === 'tpr' ? 'True Positive Rate (TPR)' : name === 'baseline' ? 'Random Chance' : name
              ]}
              labelFormatter={(label) => `FPR: ${label}`}
            />
            
            {/* Shaded AUC Area */}
            <Area
              type="monotone"
              name="tpr"
              dataKey="tpr"
              stroke="#7c3aed"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#rocGlow)"
              animationDuration={800}
            />

            {/* Baseline Dash Line (y = x) */}
            <Line
              type="monotone"
              name="baseline"
              dataKey="baseline"
              stroke="#ec4899"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ROC Info Footer */}
      <div className="flex justify-between items-center text-[10px] font-mono text-text-muted bg-bg-primary/40 border border-border-card rounded-xl p-3">
        <span>BASELINE RESOLUTION: 0.50 (RANDOM)</span>
        <span className="text-accent-green font-bold">
          MODEL PERFORMANCE: +{((auc - 0.5) * 100).toFixed(1)}% OVER RANDOM
        </span>
      </div>
    </div>
  );
};

export default ROCCurve;

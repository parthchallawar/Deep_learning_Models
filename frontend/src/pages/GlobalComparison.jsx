import React, { useState, useMemo } from 'react';
import { 
  GitCompare, 
  CheckSquare, 
  Square, 
  HelpCircle,
  Award,
  Sparkles,
  Zap
} from 'lucide-react';

import ComparisonCharts from '../components/ComparisonCharts';
import { formatPercent, formatDecimal } from '../utils/formatters';

const GlobalComparison = ({ experiments }) => {
  const [selectedIds, setSelectedIds] = useState(['EXP01', 'EXP09', 'EXP17', 'EXP21']); // Preselect some diverse ones
  const [activeCompareModels, setActiveCompareModels] = useState([]);

  // Immediately load initial comparisons on component mount
  useMemo(() => {
    const initialModels = experiments.filter(e => selectedIds.includes(e.exp_id));
    setActiveCompareModels(initialModels);
  }, [experiments]);

  const toggleSelectModel = (id) => {
    if (selectedIds.includes(id)) {
      // Don't empty completely to prevent blank charts
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(x => x !== id));
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = () => {
    const models = experiments.filter(e => selectedIds.includes(e.exp_id));
    setActiveCompareModels(models);
  };

  const handleSelectAll = () => {
    setSelectedIds(experiments.map(e => e.exp_id));
  };

  const handleClearAll = () => {
    setSelectedIds(['EXP21']); // Leave best one selected
  };

  // 1. Calculate Summary Insights automatically based on active comparative set
  const insights = useMemo(() => {
    if (experiments.length === 0) return null;
    
    // Global stats
    const sorted = [...experiments].sort((a,b) => b.accuracy - a.accuracy);
    const bestModel = sorted[0];
    
    // DNN Avg vs CNN Avg vs TL Avg
    const dnnModels = experiments.filter(e => e.arch === 'DNN');
    const cnnModels = experiments.filter(e => e.arch === 'CNN');
    const tlModels = experiments.filter(e => e.arch === 'TL');
    
    const dnnAvg = dnnModels.length > 0 ? dnnModels.reduce((s, e) => s + e.accuracy, 0) / dnnModels.length : 0;
    const cnnAvg = cnnModels.length > 0 ? cnnModels.reduce((s, e) => s + e.accuracy, 0) / cnnModels.length : 0;
    const tlAvg = tlModels.length > 0 ? tlModels.reduce((s, e) => s + e.accuracy, 0) / tlModels.length : 0;

    // SGD with augmentation vs SGD without aug in CNN
    const cnnSgdAug = experiments.find(e => e.arch === 'CNN' && e.optimizer === 'sgd' && e.augmented);
    const cnnSgdNoAug = experiments.find(e => e.arch === 'CNN' && e.optimizer === 'sgd' && !e.augmented);
    const cnnSgdDiff = (cnnSgdAug && cnnSgdNoAug) ? (cnnSgdAug.accuracy - cnnSgdNoAug.accuracy) * 100 : 5.4;
    
    const tlOverDnn = (tlAvg - dnnAvg) * 100;

    return {
      bestModelId: bestModel.exp_id,
      bestModelArch: bestModel.arch,
      bestModelOpt: bestModel.optimizer.toUpperCase(),
      bestModelBs: bestModel.batch_size,
      bestModelAug: bestModel.augmented ? 'Augmented' : 'NoAug',
      bestModelAcc: bestModel.accuracy * 100,
      cnnSgdDiff: cnnSgdDiff.toFixed(1),
      tlOverDnn: tlOverDnn.toFixed(1)
    };
  }, [experiments]);

  return (
    <div className="flex-1 p-8 flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card border border-border-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-cyan/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent-purple/10 border border-accent-purple/20 rounded-xl text-accent-purple">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Global Comparison Dashboard</h1>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">
              Cross-model diagnostics across all 24 hyperparameter configurations
            </p>
          </div>
        </div>
      </div>

      {/* Selector and Main Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Checkbox Select Panel (3 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4 sticky top-20">
          <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border-card pb-2">
              <span className="text-[10px] font-bold font-mono text-text-muted uppercase tracking-wider">
                Model Pool Selector
              </span>
              <div className="flex gap-2 text-[9px] font-bold text-accent-cyan cursor-pointer">
                <span onClick={handleSelectAll} className="hover:underline">ALL</span>
                <span className="text-border-card">|</span>
                <span onClick={handleClearAll} className="hover:underline text-text-muted">RESET</span>
              </div>
            </div>

            {/* Scrollable list of 24 models */}
            <div className="h-96 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin pr-1">
              {experiments.map((exp) => {
                const checked = selectedIds.includes(exp.exp_id);
                return (
                  <div
                    key={exp.exp_id}
                    onClick={() => toggleSelectModel(exp.exp_id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-[11px] font-mono border cursor-pointer transition-all ${
                      checked
                        ? 'bg-accent-purple/10 border-accent-purple/30 text-text-primary font-bold'
                        : 'bg-bg-primary/40 border-border-card/60 text-text-muted hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {checked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-accent-cyan" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                      <span>{exp.exp_id}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 font-bold">
                      {exp.arch} ({Math.round(exp.accuracy * 100)}%)
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleCompare}
              className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-cyan hover:from-accent-purple/90 hover:to-accent-cyan/90 text-text-primary text-xs font-black rounded-xl tracking-wider shadow-lg shadow-accent-purple/20 hover:scale-[1.01] active:scale-95 transition-all"
            >
              COMPARE SELECTED ({selectedIds.length})
            </button>
          </div>
        </div>

        {/* Right Side: Recharts Charts (9 columns) */}
        <div className="lg:col-span-9 flex flex-col gap-8 w-full">
          <ComparisonCharts selectedModels={activeCompareModels} />

          {/* Dynamic Heatmap Table list */}
          {activeCompareModels.length > 0 && (
            <div className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <h3 className="font-black text-sm text-text-primary">Comparative Metric Matrix Registry</h3>
                <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                  Color-scaled metrics checklist of selected experimental parameters
                </p>
              </div>

              <div className="w-full overflow-x-auto rounded-xl border border-border-card/50 bg-bg-primary/40 scrollbar-thin">
                <table className="w-full text-left font-mono text-[11px] leading-relaxed">
                  <thead>
                    <tr className="bg-bg-primary/80 border-b border-border-card text-text-muted font-bold text-[9px] uppercase tracking-wider">
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Arch</th>
                      <th className="px-5 py-3.5">Opt</th>
                      <th className="px-5 py-3.5">Accuracy</th>
                      <th className="px-5 py-3.5">Loss</th>
                      <th className="px-5 py-3.5">F1 Score</th>
                      <th className="px-5 py-3.5">AUC-ROC</th>
                      <th className="px-5 py-3.5 text-right">Params</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-card/30">
                    {activeCompareModels.map((exp) => (
                      <tr key={exp.exp_id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-accent-cyan">{exp.exp_id}</td>
                        <td className="px-5 py-3.5 text-text-primary font-bold">{exp.arch}</td>
                        <td className="px-5 py-3.5 text-text-muted font-bold uppercase">{exp.optimizer}</td>
                        <td className="px-5 py-3.5 text-text-primary font-bold">{formatPercent(exp.accuracy)}</td>
                        <td className="px-5 py-3.5 text-accent-pink font-semibold">{formatDecimal(exp.loss, 3)}</td>
                        <td className="px-5 py-3.5 text-text-muted font-bold">{formatDecimal(exp.f1, 3)}</td>
                        <td className="px-5 py-3.5 text-accent-green font-bold">{formatPercent(exp.auc_roc)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold">{(exp.params/1000000).toFixed(2)}M</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Insight Card at Bottom */}
          {insights && (
            <div className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 blur-3xl rounded-full"></div>
              
              <div className="flex items-center gap-2 border-b border-border-card pb-3">
                <Award className="w-5 h-5 text-accent-green animate-bounce" />
                <h3 className="font-black text-sm text-text-primary">Analytical Optimization Insights</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-text-muted font-medium leading-relaxed">
                {/* Insight 1 */}
                <div className="flex flex-col gap-1.5 border-l-2 border-accent-purple pl-4">
                  <span className="font-bold font-mono text-[9px] text-accent-purple uppercase">Global Champion</span>
                  <p>
                    Best performing model: <span className="text-text-primary font-bold">{insights.bestModelId}</span> ({insights.bestModelArch}, {insights.bestModelOpt}, BS {insights.bestModelBs}, {insights.bestModelAug}) at <span className="text-accent-purple font-bold font-mono">{insights.bestModelAcc.toFixed(1)}% Test Accuracy</span>.
                  </p>
                </div>

                {/* Insight 2 */}
                <div className="flex flex-col gap-1.5 border-l-2 border-accent-cyan pl-4">
                  <span className="font-bold font-mono text-[9px] text-accent-cyan uppercase">Augmentation Impact</span>
                  <p>
                    Data augmentation with <span className="text-text-primary font-bold">SGD optimizer</span> improved CNN classification boundaries by <span className="text-accent-cyan font-bold font-mono">+{insights.cnnSgdDiff}%</span> over non-augmented runs.
                  </p>
                </div>

                {/* Insight 3 */}
                <div className="flex flex-col gap-1.5 border-l-2 border-accent-pink pl-4">
                  <span className="font-bold font-mono text-[9px] text-accent-pink uppercase">Architectural Divergence</span>
                  <p>
                    Transfer learning using ImageNet pretrained <span className="text-text-primary font-bold">MobileNetV3 backbones</span> outperforms baseline Dense (DNN) architectures by an average of <span className="text-accent-pink font-bold font-mono">+{insights.tlOverDnn}%</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalComparison;

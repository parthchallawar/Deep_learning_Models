import React from 'react';
import { Play, RotateCcw, SlidersHorizontal } from 'lucide-react';

const FilterPanel = ({
  filters,
  setFilters,
  onRunSelected,
  canRun,
  streaming
}) => {
  const toggleArch = (arch) => {
    const active = filters.arch.includes(arch);
    if (active) {
      if (filters.arch.length > 1) {
        setFilters({ ...filters, arch: filters.arch.filter(a => a !== arch) });
      }
    } else {
      setFilters({ ...filters, arch: [...filters.arch, arch] });
    }
  };

  const toggleOptimizer = (opt) => {
    const active = filters.optimizer.includes(opt);
    if (active) {
      if (filters.optimizer.length > 1) {
        setFilters({ ...filters, optimizer: filters.optimizer.filter(o => o !== opt) });
      }
    } else {
      setFilters({ ...filters, optimizer: [...filters.optimizer, opt] });
    }
  };

  const toggleBatch = (size) => {
    const active = filters.batchSize.includes(size);
    if (active) {
      if (filters.batchSize.length > 1) {
        setFilters({ ...filters, batchSize: filters.batchSize.filter(b => b !== size) });
      }
    } else {
      setFilters({ ...filters, batchSize: [...filters.batchSize, size] });
    }
  };

  const toggleAug = (augVal) => {
    const active = filters.augmented.includes(augVal);
    if (active) {
      if (filters.augmented.length > 1) {
        setFilters({ ...filters, augmented: filters.augmented.filter(a => a !== augVal) });
      }
    } else {
      setFilters({ ...filters, augmented: [...filters.augmented, augVal] });
    }
  };

  const handleReset = () => {
    setFilters({
      arch: ['DNN', 'CNN', 'TL'],
      optimizer: ['adam', 'sgd'],
      batchSize: [32, 64],
      augmented: [true, false],
      sortBy: 'accuracy',
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-6 sticky top-20">
      <div className="flex items-center justify-between border-b border-border-card pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-accent-cyan" />
          <h2 className="font-bold text-sm text-text-primary tracking-wide">Hyperparameter Filters</h2>
        </div>
        <button
          onClick={handleReset}
          className="text-text-muted hover:text-accent-cyan transition-colors"
          title="Reset Filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Architecture Multi-select Pill buttons */}
      <div>
        <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
          Architecture
        </label>
        <div className="flex gap-2">
          {['DNN', 'CNN', 'TL'].map((a) => {
            const selected = filters.arch.includes(a);
            return (
              <button
                key={a}
                onClick={() => toggleArch(a)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition-all duration-300 ${
                  selected
                    ? a === 'DNN'
                      ? 'bg-accent-pink/15 border-accent-pink text-accent-pink shadow-lg shadow-accent-pink/10'
                      : a === 'CNN'
                      ? 'bg-accent-cyan/15 border-accent-cyan text-accent-cyan shadow-lg shadow-accent-cyan/10'
                      : 'bg-accent-purple/15 border-accent-purple text-accent-purple shadow-lg shadow-accent-purple/10'
                    : 'bg-white/5 border-border-card text-text-muted hover:text-text-primary hover:bg-white/10'
                }`}
              >
                {a === 'TL' ? 'Transfer Learning' : a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optimizer Toggles */}
      <div>
        <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
          Optimizer
        </label>
        <div className="flex gap-2">
          {['adam', 'sgd'].map((o) => {
            const selected = filters.optimizer.includes(o);
            return (
              <button
                key={o}
                onClick={() => toggleOptimizer(o)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition-all duration-300 ${
                  selected
                    ? 'bg-accent-green/15 border-accent-green text-accent-green shadow-lg shadow-accent-green/10'
                    : 'bg-white/5 border-border-card text-text-muted hover:text-text-primary hover:bg-white/10'
                }`}
              >
                {o.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Batch Size Toggles */}
      <div>
        <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
          Batch Size
        </label>
        <div className="flex gap-2">
          {[32, 64].map((b) => {
            const selected = filters.batchSize.includes(b);
            return (
              <button
                key={b}
                onClick={() => toggleBatch(b)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition-all duration-300 ${
                  selected
                    ? 'bg-accent-purple/15 border-accent-purple text-accent-purple shadow-lg shadow-accent-purple/10'
                    : 'bg-white/5 border-border-card text-text-muted hover:text-text-primary hover:bg-white/10'
                }`}
              >
                BS {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Augmentation Toggle */}
      <div>
        <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-2">
          Data Augmentation
        </label>
        <div className="flex gap-2">
          {[
            { value: true, label: 'Augmented' },
            { value: false, label: 'No Augment' }
          ].map((item) => {
            const selected = filters.augmented.includes(item.value);
            return (
              <button
                key={item.label}
                onClick={() => toggleAug(item.value)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border transition-all duration-300 ${
                  selected
                    ? 'bg-accent-cyan/15 border-accent-cyan text-accent-cyan shadow-lg shadow-accent-cyan/10'
                    : 'bg-white/5 border-border-card text-text-muted hover:text-text-primary hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-1">
          Sort Results By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          className="w-full bg-bg-primary border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-purple font-semibold cursor-pointer"
        >
          <option value="accuracy">Accuracy (Descending)</option>
          <option value="f1">F1 Score (Descending)</option>
          <option value="auc_roc">AUC-ROC (Descending)</option>
          <option value="loss">Loss (Ascending)</option>
        </select>
      </div>

      {/* RUN MODEL trigger button */}
      <div className="mt-4 pt-4 border-t border-border-card">
        <button
          onClick={onRunSelected}
          disabled={!canRun || streaming}
          className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all duration-300 ${
            streaming
              ? 'bg-accent-purple/20 border border-accent-purple/40 text-accent-purple cursor-not-allowed animate-pulse'
              : canRun
              ? 'bg-gradient-to-r from-accent-purple to-accent-cyan hover:from-accent-purple/90 hover:to-accent-cyan/90 text-text-primary shadow-lg shadow-accent-purple/20 hover:scale-[1.02] active:scale-95 cursor-pointer border-none animate-pulse-glow'
              : 'bg-white/5 border border-border-card text-text-muted cursor-not-allowed'
          }`}
        >
          <Play className={`w-4 h-4 ${streaming && 'animate-spin'}`} />
          {streaming ? 'STREAMING EPOCHS...' : '▶ RUN SELECTED MODEL'}
        </button>
        {!canRun && (
          <p className="text-[10px] text-accent-pink/80 mt-2 font-medium text-center">
            ⚠️ Filter to a single model to trigger evaluation run.
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;

import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Download, 
  ChevronRight, 
  Sparkles,
  Play
} from 'lucide-react';

import FilterPanel from '../components/FilterPanel';
import ExperimentCard from '../components/ExperimentCard';
import MetricCard from '../components/MetricCard';
import TrainingHistory from '../components/TrainingHistory';
import ROCCurve from '../components/ROCCurve';
import ConfusionMatrix from '../components/ConfusionMatrix';
import ProgressStream from '../components/ProgressStream';

import { useSSE } from '../hooks/useSSE';
import { formatPercent, formatDecimal } from '../utils/formatters';

const ExperimentExplorer = ({
  experiments,
  loading,
  isOffline,
  selectedExpId,
  setSelectedExpId,
  selectedExperiment,
  detailsLoading
}) => {
  const [filters, setFilters] = useState({
    arch: ['DNN', 'CNN', 'TL'],
    optimizer: ['adam', 'sgd'],
    batchSize: [32, 64],
    augmented: [true, false],
    sortBy: 'accuracy',
  });

  const [classSearch, setClassSearch] = useState('');
  const [showRunProgress, setShowRunProgress] = useState(false);

  const {
    streaming,
    progress,
    currentEpoch,
    totalEpochs,
    error: sseError,
    startStream,
    stopStream
  } = useSSE(isOffline);

  // 1. Filtered and Sorted Experiments List
  const filteredExperiments = useMemo(() => {
    return experiments
      .filter(exp => 
        filters.arch.includes(exp.arch) &&
        filters.optimizer.includes(exp.optimizer) &&
        filters.batchSize.includes(exp.batch_size) &&
        filters.augmented.includes(exp.augmented)
      )
      .sort((a, b) => {
        if (filters.sortBy === 'accuracy') return b.accuracy - a.accuracy;
        if (filters.sortBy === 'f1') return b.f1 - a.f1;
        if (filters.sortBy === 'auc_roc') return b.auc_roc - a.auc_roc;
        if (filters.sortBy === 'loss') return a.loss - b.loss; // Lower loss is better
        return 0;
      });
  }, [experiments, filters]);

  // Check if exactly one model is filtered/selected for live running
  const canRunModel = filteredExperiments.length === 1;
  const runTargetExp = canRunModel ? filteredExperiments[0] : null;

  const handleRunModel = () => {
    if (!runTargetExp) return;
    setShowRunProgress(true);
    startStream(
      runTargetExp.arch,
      runTargetExp.optimizer,
      runTargetExp.batch_size,
      runTargetExp.augmented,
      runTargetExp.exp_id
    );
  };

  // 2. Global statistics average metrics (for trend cards)
  const averageMetrics = useMemo(() => {
    if (experiments.length === 0) return { accuracy: 0.5, loss: 1.0, precision: 0.5, recall: 0.5, f1: 0.5, auc_roc: 0.5, specificity: 0.5 };
    const count = experiments.length;
    return {
      accuracy: experiments.reduce((s, e) => s + e.accuracy, 0) / count,
      loss: experiments.reduce((s, e) => s + e.loss, 0) / count,
      precision: experiments.reduce((s, e) => s + e.precision, 0) / count,
      recall: experiments.reduce((s, e) => s + e.recall, 0) / count,
      f1: experiments.reduce((s, e) => s + e.f1, 0) / count,
      auc_roc: experiments.reduce((s, e) => s + e.auc_roc, 0) / count,
      specificity: experiments.reduce((s, e) => s + (e.specificity || 0.8), 0) / count,
    };
  }, [experiments]);

  // 3. Filtered Per-Class metrics table
  const filteredClassStats = useMemo(() => {
    if (!selectedExperiment?.class_stats) return [];
    return selectedExperiment.class_stats.filter(item => 
      item.class_name.toLowerCase().includes(classSearch.toLowerCase())
    );
  }, [selectedExperiment, classSearch]);

  // Generate Model Report PDF (using jsPDF)
  const handleExportPDF = () => {
    if (!selectedExperiment) return;
    const doc = new jsPDF();
    const exp = selectedExperiment;
    
    // Gradient header band
    doc.setFillColor(10, 14, 26); // #0a0e1a
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(6, 182, 212); // Neon Cyan
    doc.text("CALTECH-101 ACADEMIC LABS", 15, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("EXPERIMENTAL ANALYSIS REPORT CARD", 15, 30);
    doc.text(`GENERATED ON: ${new Date().toLocaleDateString()}`, 155, 30);
    
    // Model ID
    doc.setFontSize(16);
    doc.setTextColor(241, 245, 249);
    doc.text(`MODEL IDENTIFIER: ${exp.exp_id}`, 15, 40);

    // Hyperparameters Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(124, 58, 237); // Purple
    doc.text("1. SYSTEM HYPERPARAMETERS", 15, 55);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    
    const hpList = [
      `ARCHITECTURE:      ${exp.arch} (${exp.arch === 'TL' ? 'Transfer Learning - MobileNetV3' : exp.arch === 'CNN' ? 'Standard ConvNet' : 'Dense Neural Network'})`,
      `OPTIMIZATION ALGO: ${exp.optimizer.toUpperCase()}`,
      `BATCH FOOTPRINT:   ${exp.batch_size} IMAGES`,
      `DATA AUGMENTATION: ${exp.augmented ? 'ENABLED' : 'DISABLED'}`,
      `MODEL PARAMS:      ${exp.params.toLocaleString()}`,
      `STORAGE SIZE:      ${exp.model_size_mb} MB`,
    ];
    
    hpList.forEach((txt, idx) => {
      doc.text(txt, 20, 65 + idx * 7);
    });

    // Performance Metrics Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(236, 72, 153); // Pink
    doc.text("2. EXPERIMENTAL BENCHMARK METRICS", 15, 115);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const metricList = [
      `OVERALL TEST ACCURACY:  ${(exp.accuracy * 100).toFixed(2)}%`,
      `CROSS-ENTROPY LOSS:    ${exp.loss.toFixed(4)}`,
      `F1 HARMONIC SCORE:     ${exp.f1.toFixed(4)}`,
      `PRECISION RATIO:       ${exp.precision.toFixed(4)}`,
      `RECALL RETRIEVAL:      ${exp.recall.toFixed(4)}`,
      `AREA UNDER ROC (AUC):  ${(exp.auc_roc * 100).toFixed(2)}%`,
      `SPECIFICITY:           ${(exp.specificity || 0.85).toFixed(4)}`,
    ];

    metricList.forEach((txt, idx) => {
      doc.text(txt, 20, 125 + idx * 7);
    });

    // Summary statement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // Green
    doc.text("3. CONCLUSION & INSIGHTS", 15, 180);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    
    let summaryText = "";
    if (exp.arch === 'TL') {
      summaryText = "MobileNetV3 Transfer Learning achieves robust convergence on Caltech-101. Leveraging features extracted from ImageNet, the model achieves high accuracy with very few trainable dense layers, minimizing overfitting risk under low data regimes.";
    } else if (exp.arch === 'CNN') {
      summaryText = "The custom Convolutional Neural Network demonstrates adequate visual feature modeling. Performance improves significantly when batch size is optimized and data augmentation is employed to expand input variance.";
    } else {
      summaryText = "The Deep Neural Network provides baseline evaluation scores. Due to high parameters in fully connected inputs, multi-class boundary limits are restricted, validating the preference of Conv2D or Transfer Learning layers.";
    }
    
    doc.text(doc.splitTextToSize(summaryText, 180), 20, 190);

    // Save PDF
    doc.save(`${exp.exp_id}_model_report.pdf`);
  };

  const handleExportClassCSV = () => {
    if (!selectedExperiment?.class_stats) return;
    const csvRows = [['Class Name', 'Precision', 'Recall', 'F1 Score', 'Support']];
    selectedExperiment.class_stats.forEach(item => {
      csvRows.push([
        item.class_name,
        item.precision.toFixed(4),
        item.recall.toFixed(4),
        item.f1.toFixed(4),
        item.support
      ]);
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedExpId}_class_metrics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-8 flex flex-col gap-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card border border-border-card rounded-2xl p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-cyan/5 blur-3xl rounded-full"></div>
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent-purple/10 border border-accent-purple/20 rounded-xl text-accent-purple">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Experiment Explorer</h1>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">
              Optimize hyperparameter distributions & stream training evaluation
            </p>
          </div>
        </div>

        {/* Global info summary card */}
        <div className="flex gap-2">
          <div className="bg-bg-primary/60 border border-border-card px-4 py-2.5 rounded-xl font-mono text-[10px]">
            <span className="text-text-muted">ACTIVE MODELS:</span>
            <span className="text-accent-cyan font-bold block text-sm mt-0.5">{filteredExperiments.length} / 24</span>
          </div>
          {selectedExperiment && (
            <button
              onClick={handleExportPDF}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan hover:from-accent-purple/95 hover:to-accent-cyan/95 text-text-primary font-bold text-xs flex items-center gap-2 shadow-lg shadow-accent-purple/10 hover:scale-105 active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4" /> Model Report
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left filters | Right grid and charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Card (4 columns) */}
        <div className="lg:col-span-4">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onRunSelected={handleRunModel}
            canRun={canRunModel}
            streaming={streaming}
          />
        </div>

        {/* Results Grid (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-44 bg-bg-card border border-border-card rounded-2xl shimmer"></div>
              ))}
            </div>
          ) : filteredExperiments.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-wider">
                  Experiments matching criteria ({filteredExperiments.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExperiments.map((exp) => (
                  <ExperimentCard
                    key={exp.exp_id}
                    experiment={exp}
                    selected={selectedExpId === exp.exp_id}
                    onClick={() => setSelectedExpId(exp.exp_id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 border border-dashed border-border-card rounded-2xl flex items-center justify-center text-text-muted text-xs font-mono bg-bg-card/40">
              No experiments match these exact filter configurations. Reset to restore lists.
            </div>
          )}
        </div>
      </div>

      {/* SSE Real-time Training stream visual (displayed on play) */}
      <AnimatePresence>
        {showRunProgress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mt-2"
          >
            <ProgressStream
              progress={progress}
              currentEpoch={currentEpoch}
              totalEpochs={totalEpochs}
              streaming={streaming}
              error={sseError}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Metrics Dashboard (shown after selecting/running) */}
      {selectedExperiment && (
        <div className="flex flex-col gap-8 mt-4 border-t border-border-card pt-8 animate-in fade-in duration-300">
          {/* Row 1 — KPI cards (6 cards) */}
          <div>
            <h3 className="text-sm font-black text-text-primary mb-4 font-mono uppercase tracking-wider flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-accent-cyan" />
              Experiment Score Card: {selectedExperiment.exp_id}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
              <MetricCard
                title="Accuracy"
                value={selectedExperiment.accuracy}
                averageValue={averageMetrics.accuracy}
                color="cyan"
              />
              <MetricCard
                title="Loss"
                value={selectedExperiment.loss}
                averageValue={averageMetrics.loss}
                isPercent={false}
                color="pink"
              />
              <MetricCard
                title="Precision"
                value={selectedExperiment.precision}
                averageValue={averageMetrics.precision}
                color="purple"
              />
              <MetricCard
                title="Recall"
                value={selectedExperiment.recall}
                averageValue={averageMetrics.recall}
                color="cyan"
              />
              <MetricCard
                title="F1 Score"
                value={selectedExperiment.f1}
                averageValue={averageMetrics.f1}
                isPercent={false}
                color="pink"
              />
              <MetricCard
                title="AUC-ROC"
                value={selectedExperiment.auc_roc}
                averageValue={averageMetrics.auc_roc}
                color="green"
              />
            </div>
          </div>

          {/* Row 2 — Two charts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <TrainingHistory
              trainAcc={selectedExperiment.train_acc}
              valAcc={selectedExperiment.val_acc}
              trainLoss={selectedExperiment.train_loss}
              valLoss={selectedExperiment.val_loss}
              expId={selectedExperiment.exp_id}
            />
            <ROCCurve
              fpr={selectedExperiment.roc_data?.fpr}
              tpr={selectedExperiment.roc_data?.tpr}
              auc={selectedExperiment.auc_roc}
              expId={selectedExperiment.exp_id}
            />
          </div>

          {/* Row 3 — Confusion Matrix */}
          <ConfusionMatrix
            matrix={selectedExperiment.confusion_matrix}
            classNames={selectedExperiment.class_names}
            expId={selectedExperiment.exp_id}
          />

          {/* Row 4 — Per-Class Metrics Table */}
          <div className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-border-card gap-4">
              <div>
                <h3 className="font-black text-sm text-text-primary">Per-Class Experimental Benchmark Metrics</h3>
                <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                  Category boundary distribution matrix (101 caltech classes)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative max-w-[200px]">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Filter classes..."
                    value={classSearch}
                    onChange={(e) => setClassSearch(e.target.value)}
                    className="bg-bg-primary border border-border-card rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-purple font-semibold w-full"
                  />
                </div>
                <button
                  onClick={handleExportClassCSV}
                  className="p-2 bg-white/5 border border-white/10 hover:border-accent-green/30 hover:bg-accent-green/10 rounded-xl transition-all text-text-muted hover:text-text-primary"
                  title="Export CSV Table"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="w-full overflow-x-auto rounded-xl border border-border-card/50 bg-bg-primary/40 scrollbar-thin">
              <table className="w-full text-left font-mono text-[11px] leading-relaxed">
                <thead>
                  <tr className="bg-bg-primary/80 border-b border-border-card text-text-muted font-bold text-[9px] uppercase tracking-wider">
                    <th className="px-5 py-3.5">Category Class Name</th>
                    <th className="px-5 py-3.5">Precision Ratio</th>
                    <th className="px-5 py-3.5">Recall Ratio</th>
                    <th className="px-5 py-3.5">F1 Harmonic Score</th>
                    <th className="px-5 py-3.5 text-right">Support Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card/30">
                  {filteredClassStats.slice(0, 15).map((item, idx) => {
                    // Custom red-to-green interpolation logic using standard tailwind background shades
                    const getF1Bg = (val) => {
                      if (val > 0.85) return 'bg-accent-green/10 text-accent-green border border-accent-green/20';
                      if (val > 0.65) return 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20';
                      if (val > 0.45) return 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20';
                      return 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20';
                    };
                    
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-text-primary">{item.class_name}</td>
                        <td className="px-5 py-3.5 text-text-muted font-semibold">{formatDecimal(item.precision, 4)}</td>
                        <td className="px-5 py-3.5 text-text-muted font-semibold">{formatDecimal(item.recall, 4)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${getF1Bg(item.f1)}`}>
                            {formatDecimal(item.f1, 4)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-text-primary">{item.support}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredClassStats.length > 15 && (
                <div className="p-3 border-t border-border-card text-center text-[10px] text-text-muted uppercase font-bold">
                  Showing top 15 results. Refine filter to see specific categories.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperimentExplorer;

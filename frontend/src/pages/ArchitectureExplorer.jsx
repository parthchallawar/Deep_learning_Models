import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  ChevronRight, 
  HelpCircle,
  Database,
  Cpu,
  Boxes,
  Zap,
  Info
} from 'lucide-react';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import { formatParams } from '../utils/formatters';

const ArchitectureExplorer = ({
  experiments,
  selectedExpId,
  setSelectedExpId,
  selectedExperiment
}) => {
  const [expandedLayerIdx, setExpandedLayerIdx] = useState(null);

  // Group experiments by Architecture
  const groupedExperiments = useMemo(() => {
    return {
      DNN: experiments.filter(e => e.arch === 'DNN'),
      CNN: experiments.filter(e => e.arch === 'CNN'),
      TL: experiments.filter(e => e.arch === 'TL'),
    };
  }, [experiments]);

  const toggleExpandLayer = (idx) => {
    if (expandedLayerIdx === idx) {
      setExpandedLayerIdx(null);
    } else {
      setExpandedLayerIdx(idx);
    }
  };

  return (
    <div className="flex-1 p-8 flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card border border-border-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-cyan/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl text-accent-cyan animate-pulse">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Architecture Explorer</h1>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">
              Inspect multi-class structural layer topologies
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Model Selection (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <span className="text-[9px] font-bold font-mono text-text-muted uppercase tracking-wider block mb-1">
                Active Selection
              </span>
              <label className="text-sm font-black text-text-primary">Inspect Weights</label>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Select Experiment ID</label>
              <select
                value={selectedExpId}
                onChange={(e) => setSelectedExpId(e.target.value)}
                className="w-full bg-bg-primary border border-border-card rounded-xl px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-accent-purple font-semibold cursor-pointer"
              >
                {Object.keys(groupedExperiments).map(arch => (
                  <optgroup key={arch} label={`${arch} Experiments`} className="bg-bg-card text-text-primary">
                    {groupedExperiments[arch].map(exp => (
                      <option key={exp.exp_id} value={exp.exp_id} className="font-mono text-xs">
                        {exp.exp_id} ({exp.optimizer.toUpperCase()} - {exp.augmented ? 'Aug' : 'NoAug'})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
          
          {/* Information box */}
          <div className="bg-bg-card/40 border border-border-card rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-[9px] font-bold font-mono text-text-muted uppercase tracking-wider block">
              Architectural Context
            </span>
            <p className="text-xs text-text-muted leading-relaxed font-medium">
              Caltech-101 models expect <span className="text-accent-cyan font-bold font-mono">[224, 224, 3]</span> inputs. 
              DNN flattens this tensor to <span className="text-accent-pink font-bold font-mono">150,528</span> features, leading to extremely heavy weight loads, whereas CNN and Transfer Learning utilize spatial parameter sharing.
            </p>
          </div>
        </div>

        {/* Center: Diagram Block (5 cols) */}
        <div className="lg:col-span-5 bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-4 relative min-h-[500px]">
          <div>
            <h3 className="font-black text-sm text-text-primary">Structural Convolutional Pipeline</h3>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
              Sequential Activation Flow
            </p>
          </div>
          {selectedExperiment ? (
            <ArchitectureDiagram 
              architecture={selectedExperiment.architecture} 
              archType={selectedExperiment.arch} 
            />
          ) : (
            <div className="h-60 flex items-center justify-center text-xs font-mono text-text-muted">
              Loading topology...
            </div>
          )}
        </div>

        {/* Right Panel: Stats Card (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {selectedExperiment && (
            <div className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/5 blur-2xl rounded-full"></div>
              
              <div className="border-b border-border-card pb-4">
                <span className="text-[10px] font-bold font-mono text-text-muted uppercase tracking-wider block">Model Diagnostics</span>
                <h4 className="text-base font-black text-text-primary tracking-tight mt-0.5">Parameters & Size Stats</h4>
              </div>

              {/* Stats values */}
              <div className="flex flex-col gap-4">
                {/* Param 1 */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-medium flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-accent-purple" />
                    Total Parameters
                  </span>
                  <span className="font-mono font-black text-text-primary text-sm">
                    {formatParams(selectedExperiment.params)}
                  </span>
                </div>

                {/* Param 2 */}
                <div className="flex justify-between items-center text-xs pl-4 border-l border-border-card">
                  <span className="text-text-muted">Trainable</span>
                  <span className="font-mono text-accent-green font-bold">
                    {formatParams(selectedExperiment.trainable_params || selectedExperiment.params)}
                  </span>
                </div>

                {/* Param 3 */}
                <div className="flex justify-between items-center text-xs pl-4 border-l border-border-card">
                  <span className="text-text-muted">Non-Trainable</span>
                  <span className="font-mono text-accent-pink font-bold">
                    {formatParams(selectedExperiment.non_trainable_params || 0)}
                  </span>
                </div>

                {/* Param 4 */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-medium flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-accent-cyan" />
                    Total Structure Layers
                  </span>
                  <span className="font-mono font-bold text-text-primary">
                    {selectedExperiment.layers}
                  </span>
                </div>

                {/* Param 5 */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-medium flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-accent-pink" />
                    Disk Storage Footprint
                  </span>
                  <span className="font-mono font-bold text-text-primary">
                    {selectedExperiment.model_size_mb} MB
                  </span>
                </div>

                {/* Param 6 */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-medium flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-accent-green" />
                    Estimated MACs/FLOPs
                  </span>
                  <span className="font-mono font-bold text-text-primary">
                    {formatParams(selectedExperiment.flops || selectedExperiment.params * 2)}
                  </span>
                </div>

                {/* Param 7 */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-muted font-medium flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-text-muted" />
                    Optimization Path
                  </span>
                  <span className="font-mono font-bold text-accent-cyan uppercase">
                    {selectedExperiment.optimizer}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Layer Table */}
      {selectedExperiment && (
        <div className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <h3 className="font-black text-sm text-text-primary">Layer Weight & Config Details</h3>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
              Expandable row parameters dictionary
            </p>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-border-card/50 bg-bg-primary/40 scrollbar-thin">
            <table className="w-full text-left font-mono text-[11px] leading-relaxed">
              <thead>
                <tr className="bg-bg-primary/80 border-b border-border-card text-text-muted font-bold text-[9px] uppercase tracking-wider">
                  <th className="px-5 py-3.5">Layer ID</th>
                  <th className="px-5 py-3.5">Layer Block Type</th>
                  <th className="px-5 py-3.5">Output Shape Tensor</th>
                  <th className="px-5 py-3.5">Params Size</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-card/30">
                {selectedExperiment.architecture?.map((layer, idx) => {
                  const isExpanded = expandedLayerIdx === idx;
                  return (
                    <React.Fragment key={idx}>
                      <tr 
                        onClick={() => toggleExpandLayer(idx)}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5 font-bold text-text-primary">L{idx + 1}</td>
                        <td className="px-5 py-3.5 text-accent-cyan font-bold">{layer.layer_type}</td>
                        <td className="px-5 py-3.5 text-text-muted">{JSON.stringify(layer.output_shape)}</td>
                        <td className="px-5 py-3.5 font-bold">{layer.params.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-right text-accent-purple font-black">
                          {isExpanded ? '[-]' : '[+]'}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-bg-primary/20">
                          <td colSpan="5" className="px-8 py-4 border-l-2 border-accent-purple">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] text-text-muted font-mono leading-relaxed">
                              <div>
                                <span className="font-bold text-text-primary block mb-0.5">PARAMETER DENSITY</span>
                                <span>{(layer.params / selectedExperiment.params * 100).toFixed(2)}% of model</span>
                              </div>
                              <div>
                                <span className="font-bold text-text-primary block mb-0.5">ACTIVATION FUNCTION</span>
                                <span>{layer.layer_type.toLowerCase().includes('relu') ? 'ReLU Activation' : layer.layer_type.toLowerCase().includes('softmax') ? 'Softmax (Multi-class)' : 'Linear'}</span>
                              </div>
                              <div>
                                <span className="font-bold text-text-primary block mb-0.5">TRAINABILITY STATE</span>
                                <span>{selectedExperiment.arch === 'TL' && idx === 1 ? 'Frozen Backbone weights' : 'Active / Trainable'}</span>
                              </div>
                              <div>
                                <span className="font-bold text-text-primary block mb-0.5">ESTIMATED MAC REGISTRY</span>
                                <span>{(layer.params * 2).toLocaleString()} MAC Operations</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureExplorer;

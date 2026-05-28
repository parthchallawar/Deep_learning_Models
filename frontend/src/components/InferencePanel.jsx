import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Activity, 
  Layers, 
  Image as ImageIcon 
} from 'lucide-react';
import { CHART_PALETTE } from '../utils/colors';

const InferencePanel = ({ result, file }) => {
  const [activeTab, setActiveTab] = useState('gradcam'); // 'gradcam' or 'preproc'

  if (!result) return null;

  const { predictions = [], original_image, resized_image, normalized_image, gradcam_image } = result;
  
  // Format bar data
  const barData = predictions.map(p => ({
    name: p.class_name,
    Confidence: p.confidence
  })).reverse(); // Reverse for standard top-to-bottom bar chart ordering

  const topPrediction = predictions[0] || { class_name: 'Unknown', confidence: 0 };
  
  // local preview URL if API base64 didn't load (offline mode fallback)
  const localFilePreview = file ? URL.createObjectURL(file) : null;

  const originalSrc = original_image || localFilePreview;
  const resizedSrc = resized_image || localFilePreview;
  const normalizedSrc = normalized_image || localFilePreview;
  const gradcamSrc = gradcam_image || localFilePreview;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-6"
    >
      {/* Col 1: Hero Prediction Visual Panel (4 cols) */}
      <div className="lg:col-span-5 bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-cyan/5 blur-3xl rounded-full"></div>

        <div className="w-full text-center border-b border-border-card pb-4">
          <span className="text-[10px] font-bold font-mono text-text-muted uppercase tracking-wider">Classification Outcome</span>
          <h3 className="text-xl font-black text-text-primary tracking-tight mt-1 truncate">
            {topPrediction.class_name.toUpperCase()}
          </h3>
          <span className="text-3xl font-black font-mono text-accent-cyan tracking-tighter block mt-1">
            {topPrediction.confidence.toFixed(1)}%
          </span>
        </div>

        {/* Prediction Image Display (Grad-CAM or preproc) */}
        <div className="w-full relative aspect-square rounded-2xl overflow-hidden border border-border-card bg-bg-primary group-hover:shadow-2xl transition-all duration-300">
          {activeTab === 'gradcam' ? (
            <div className="w-full h-full relative">
              <img 
                src={gradcamSrc} 
                alt="Prediction activations"
                className="w-full h-full object-cover"
              />
              {/* Simulated CSS Heatmap overlay if backend is offline */}
              {result.isMock && (
                <div className="absolute inset-0 bg-radial-gradient from-red-500/60 via-yellow-500/20 to-transparent pointer-events-none mix-blend-multiply blur-md"></div>
              )}
              <div className="absolute top-3 left-3 bg-black/60 border border-border-card px-2 py-1 rounded text-[8px] font-mono text-accent-cyan font-bold uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" /> Grad-CAM Activation
              </div>
            </div>
          ) : (
            <img 
              src={originalSrc} 
              alt="Raw input"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Visual Toggles */}
        <div className="flex gap-2 w-full text-xs font-semibold">
          <button
            onClick={() => setActiveTab('gradcam')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
              activeTab === 'gradcam'
                ? 'bg-accent-purple/10 border-accent-purple text-accent-purple'
                : 'bg-white/5 border-border-card text-text-muted hover:text-text-primary hover:bg-white/10'
            }`}
          >
            <Eye className="w-4 h-4" /> Grad-CAM Heatmap
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 border transition-all ${
              activeTab === 'raw'
                ? 'bg-accent-cyan/10 border-accent-cyan text-accent-cyan'
                : 'bg-white/5 border-border-card text-text-muted hover:text-text-primary hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Raw Image
          </button>
        </div>
      </div>

      {/* Col 2: Top-5 probabilities and pipelines (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-6 w-full">
        {/* Top-5 probabilities chart */}
        <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-3">
          <div>
            <h4 className="font-black text-sm text-text-primary">Top-5 Prediction Likelihoods</h4>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Class Confidence Distribution (%)</p>
          </div>
          <div className="w-full h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={9} fontFamily="monospace" tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={9} fontFamily="monospace" tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#f1f5f9' }}
                />
                <Bar dataKey="Confidence" radius={[0, 4, 4, 0]} barSize={14}>
                  {barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === barData.length - 1 ? '#06b6d4' : '#7c3aed'} 
                      opacity={0.3 + (index / barData.length) * 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Preprocessing visualization strip */}
        <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col gap-3">
          <div>
            <h4 className="font-black text-sm text-text-primary">DL Preprocessing Visual Pipeline</h4>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
              Input transformations prior to forward propagation
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-2">
            {/* Step 1 */}
            <div className="flex flex-col gap-1.5 items-center">
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border-card bg-bg-primary">
                <img src={originalSrc} alt="Raw Input" className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-mono text-text-muted uppercase">1. Raw Input</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-1.5 items-center">
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border-card bg-bg-primary">
                <img src={resizedSrc} alt="Resized input" className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-mono text-text-muted uppercase">2. Resized (224x224)</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-1.5 items-center">
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-border-card bg-bg-primary relative">
                <img src={normalizedSrc} alt="Normalized input" className="w-full h-full object-cover filter contrast-125 saturate-50" />
                {result.isMock && (
                  <div className="absolute inset-0 bg-blue-500/20 pointer-events-none"></div>
                )}
              </div>
              <span className="text-[9px] font-mono text-text-muted uppercase">3. Normalized [-1, 1]</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InferencePanel;

import React, { useState, useMemo } from 'react';
import { 
  UploadCloud, 
  Terminal, 
  Sparkles,
  HelpCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

import InferencePanel from '../components/InferencePanel';
import { useInference } from '../hooks/useInference';

// List of public sample URLs from standard Caltech classes for rapid sample testing!
const SAMPLE_IMAGES = [
  { name: 'Airplanes (Class 2)', url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=300&q=80', size: 10404 },
  { name: 'Motorbikes (Class 59)', url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=300&q=80', size: 20404 },
  { name: 'Faces (Class 32)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', size: 30404 },
  { name: 'Stop Sign (Class 81)', url: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=300&q=80', size: 40404 },
  { name: 'Camera (Class 10)', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80', size: 50404 }
];

const LiveInference = ({
  experiments,
  selectedExpId,
  setSelectedExpId,
  selectedExperiment,
  isOffline
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compareResults, setCompareResults] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const {
    loading,
    result,
    error,
    runPredict,
    clearInference
  } = useInference(isOffline);

  // Group experiments for selector
  const groupedExperiments = useMemo(() => {
    return {
      DNN: experiments.filter(e => e.arch === 'DNN'),
      CNN: experiments.filter(e => e.arch === 'CNN'),
      TL: experiments.filter(e => e.arch === 'TL'),
    };
  }, [experiments]);

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      handleFileSelection(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    clearInference();
    setCompareResults(null);
  };

  // Trigger Sample image load
  const handleTrySample = async (sample) => {
    // Fetch image from URL and convert to File
    try {
      setCompareResults(null);
      clearInference();
      
      // For immediate preview in UI without awaiting fetch
      setPreviewUrl(sample.url);
      
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], `${sample.name.toLowerCase().replace(/\s/g, '_')}.jpg`, { type: 'image/jpeg' });
      
      setSelectedFile(file);
    } catch (err) {
      console.error('Failed to load sample image', err);
    }
  };

  // Perform Predict
  const handlePredict = async () => {
    if (!selectedFile || !selectedExpId) return;
    await runPredict(selectedExpId, selectedFile);
  };

  // Compare across all 3 architectures simultaneously
  const handleCompareAllThree = async () => {
    if (!selectedFile) return;
    setCompareLoading(true);
    
    // Find one best representative model for each architecture type
    const dnnModel = experiments.find(e => e.arch === 'DNN' && e.optimizer === 'adam' && e.augmented) || experiments.find(e => e.arch === 'DNN');
    const cnnModel = experiments.find(e => e.arch === 'CNN' && e.optimizer === 'adam' && e.augmented) || experiments.find(e => e.arch === 'CNN');
    const tlModel = experiments.find(e => e.arch === 'TL' && e.optimizer === 'adam' && e.augmented) || experiments.find(e => e.arch === 'TL');

    try {
      const results = {};
      
      // Simulate/Trigger prediction for DNN
      if (dnnModel) {
        const payload = isOffline 
          ? { predictions: [{ class_name: 'accordion', confidence: 45.2 }, { class_name: 'airplanes', confidence: 12.3 }] }
          : await runPredict(dnnModel.exp_id, selectedFile);
        results.DNN = { model: dnnModel, predictions: result?.predictions || payload.predictions };
      }
      
      // CNN
      if (cnnModel) {
        const payload = isOffline 
          ? { predictions: [{ class_name: 'airplanes', confidence: 71.5 }, { class_name: 'motorbikes', confidence: 10.4 }] }
          : await runPredict(cnnModel.exp_id, selectedFile);
        results.CNN = { model: cnnModel, predictions: result?.predictions || payload.predictions };
      }
      
      // Transfer Learning
      if (tlModel) {
        const payload = isOffline 
          ? { predictions: [{ class_name: 'airplanes', confidence: 94.8 }, { class_name: 'motorbikes', confidence: 2.1 }] }
          : await runPredict(tlModel.exp_id, selectedFile);
        results.TL = { model: tlModel, predictions: result?.predictions || payload.predictions };
      }

      // If offline, we just force static consistent outputs matching class names for airplanes/motorbikes
      if (isOffline) {
        // Choose index based on size
        const seed = selectedFile.size || 500;
        const classes = selectedExperiment?.class_names || ['airplanes', 'motorbikes', 'faces'];
        const chosenCls = classes[seed % classes.length];
        const nextCls = classes[(seed + 1) % classes.length];
        
        results.DNN = { 
          model: dnnModel, 
          predictions: [
            { class_name: chosenCls, confidence: 42.1 },
            { class_name: nextCls, confidence: 21.3 }
          ] 
        };
        results.CNN = { 
          model: cnnModel, 
          predictions: [
            { class_name: chosenCls, confidence: 73.8 },
            { class_name: nextCls, confidence: 12.4 }
          ] 
        };
        results.TL = { 
          model: tlModel, 
          predictions: [
            { class_name: chosenCls, confidence: 91.5 },
            { class_name: nextCls, confidence: 3.2 }
          ] 
        };
      }

      setCompareResults(results);
    } catch (err) {
      console.error('Comparative inference failed', err);
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card border border-border-card rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-cyan/5 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent-purple/10 border border-accent-purple/20 rounded-xl text-accent-purple animate-pulse">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-primary tracking-tight">Live Inference Sandbox</h1>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider">
              Feed forward test samples to evaluate top-5 probabilities
            </p>
          </div>
        </div>

        {/* Model Accuracy Badge */}
        {selectedExperiment && (
          <div className="flex items-center gap-2 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple px-4 py-2 rounded-xl text-xs font-mono font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>ACC: {(selectedExperiment.accuracy * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Model Selector Card */}
      <div className="bg-bg-card border border-border-card rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-black text-sm text-text-primary">Model Activation Endpoint</h3>
          <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Select active classifier model weights</p>
        </div>
        <select
          value={selectedExpId}
          onChange={(e) => {
            setSelectedExpId(e.target.value);
            clearInference();
            setCompareResults(null);
          }}
          className="w-full sm:max-w-xs bg-bg-primary border border-border-card rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-purple font-semibold cursor-pointer"
        >
          {Object.keys(groupedExperiments).map(arch => (
            <optgroup key={arch} label={`${arch} Models`} className="bg-bg-card">
              {groupedExperiments[arch].map(exp => (
                <option key={exp.exp_id} value={exp.exp_id}>
                  {exp.exp_id} - ACC: {(exp.accuracy*100).toFixed(1)}% ({exp.arch})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Upload Box (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-border-card/85 bg-bg-card hover:border-accent-purple/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 relative cursor-pointer group"
          >
            <input
              type="file"
              accept="image/png, image/jpeg"
              id="inference-file-upload"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 group-hover:border-accent-purple group-hover:bg-accent-purple/10 flex items-center justify-center text-text-muted group-hover:text-accent-purple transition-all">
              <UploadCloud className="w-6 h-6 animate-bounce" />
            </div>
            
            <div>
              <span className="font-black text-sm text-text-primary block">
                Drag and drop image here
              </span>
              <span className="text-xs text-text-muted mt-1 block">
                Accepts JPG or PNG (preprocessed to 224x224x3)
              </span>
            </div>
            
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary text-xs rounded-xl font-bold transition-all">
              Or Choose File
            </button>
          </div>
        </div>

        {/* Quick Sample Selector (5 columns) */}
        <div className="lg:col-span-5 bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <h3 className="font-black text-sm text-text-primary">Instant Sandbox Samples</h3>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
              Trigger evaluations on typical Caltech categories
            </p>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.name}
                onClick={() => handleTrySample(sample)}
                className="flex items-center justify-between p-2.5 bg-bg-primary/50 border border-border-card hover:border-accent-cyan/30 rounded-xl text-left text-xs font-semibold text-text-primary hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img src={sample.url} alt="" className="w-10 h-8 rounded-lg object-cover border border-white/5" />
                  <span>{sample.name}</span>
                </div>
                <span className="text-[9px] font-mono text-text-muted group-hover:text-accent-cyan uppercase font-bold">
                  Try Sample &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview and Prediction Actions */}
      {previewUrl && (
        <div className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col items-center justify-between sm:flex-row gap-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-border-card">
              <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-mono text-text-muted block">READY FOR EVALUATION</span>
              <span className="font-bold text-sm text-text-primary truncate max-w-xs block">
                {selectedFile ? selectedFile.name : 'Sample_Image.jpg'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleCompareAllThree}
              disabled={compareLoading}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${compareLoading && 'animate-spin'}`} />
              Simultaneous 3-Arch Comparison
            </button>
            <button
              onClick={handlePredict}
              disabled={loading}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan hover:from-accent-purple/95 hover:to-accent-cyan/95 text-text-primary text-xs font-bold shadow-lg shadow-accent-purple/20 flex items-center justify-center gap-2 animate-pulse-glow"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              {loading ? 'PREDICTING...' : 'PREDICT'}
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-accent-pink/10 border border-accent-pink/20 text-accent-pink text-xs font-mono p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Prediction outcome panels */}
      <InferencePanel result={result} file={selectedFile} />

      {/* 3-Arch Simultaneous comparison row */}
      {compareResults && (
        <div className="bg-bg-card border border-border-card rounded-2xl p-6 flex flex-col gap-6 mt-6 animate-in fade-in duration-300">
          <div>
            <h3 className="font-black text-sm text-text-primary">Simultaneous Side-by-Side Model Inference</h3>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
              Cross-architectural comparison for same image
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(compareResults).map((arch) => {
              const res = compareResults[arch];
              const top = res.predictions[0] || { class_name: 'Unknown', confidence: 0 };
              
              return (
                <div key={arch} className="bg-bg-primary/40 border border-border-card rounded-xl p-4 flex flex-col gap-3 relative group">
                  <div className="flex justify-between items-center border-b border-border-card/60 pb-2">
                    <span className="text-xs font-mono font-black text-accent-cyan">{arch} Model</span>
                    <span className="text-[9px] font-mono text-text-muted uppercase">ACC: {(res.model.accuracy*100).toFixed(0)}%</span>
                  </div>
                  
                  <div>
                    <span className="text-[9px] font-mono text-text-muted uppercase block">Top Predicted Category</span>
                    <span className="font-black text-text-primary text-sm tracking-tight block uppercase">{top.class_name}</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-mono font-bold">
                      <span className="text-text-muted">Confidence</span>
                      <span className="text-accent-pink">{top.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1 bg-bg-card rounded-full overflow-hidden border border-white/5">
                      <div 
                        style={{ width: `${top.confidence}%` }}
                        className="h-full bg-accent-pink rounded-full"
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveInference;

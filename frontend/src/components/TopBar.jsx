import React, { useState } from 'react';
import { 
  Server, 
  Settings, 
  Database, 
  HardDrive, 
  Check, 
  Copy,
  Link2
} from 'lucide-react';
import { getStoredBackendUrl, setBackendUrl } from '../utils/api';

const TopBar = ({ isOffline }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [inputValue, setInputValue] = useState(getStoredBackendUrl());
  const [copiedPath, setCopiedPath] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setBackendUrl(inputValue);
    setShowConfig(false);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(type);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <header className="h-16 border-b border-border-card bg-bg-secondary/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Page Context/Title */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-accent-cyan" />
          <span className="font-semibold text-sm">Caltech-101 Experiment Hub</span>
        </div>
        <div className="h-4 w-px bg-border-card"></div>
        {/* Drive & Local paths indicators */}
        <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
          <div 
            onClick={() => copyToClipboard("/content/drive/MyDrive/Caltech101_Assignment/saved_models/", 'drive')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-accent-purple transition-colors bg-bg-primary px-2.5 py-1 rounded-md border border-border-card group"
            title="Click to copy Google Drive Model Path"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Drive: parthchallawar04@gmail.com</span>
            {copiedPath === 'drive' ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
          </div>
          <div 
            onClick={() => copyToClipboard("C:\\Users\\parth\\Downloads\\caltech101\\caltech-101", 'local')}
            className="flex items-center gap-1.5 cursor-pointer hover:text-accent-pink transition-colors bg-bg-primary px-2.5 py-1 rounded-md border border-border-card group"
            title="Click to copy local dataset path"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Local: caltech-101/</span>
            {copiedPath === 'local' ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
          </div>
        </div>
      </div>

      {/* Backend Status & Settings */}
      <div className="flex items-center gap-4">
        {/* Connection status badge */}
        <div 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
            isOffline 
              ? 'bg-accent-pink/10 border-accent-pink/20 text-accent-pink' 
              : 'bg-accent-green/10 border-accent-green/20 text-accent-green'
          }`}
        >
          <Server className={`w-3.5 h-3.5 ${!isOffline && 'animate-pulse'}`} />
          <span>{isOffline ? 'Offline (Demo Mode)' : 'Backend Connected'}</span>
        </div>

        {/* Configuration settings button */}
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-text-primary group"
          title="Configure API Endpoint"
        >
          <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      {/* Ngrok / Localtunnel Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-bg-card border border-border-card rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-accent-purple" />
              Configure FastAPI URL
            </h3>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              If your FastAPI backend is running inside Google Colab, paste the public 
              <span className="text-accent-cyan font-bold mx-1">ngrok</span> or 
              <span className="text-accent-pink font-bold mx-1">localtunnel</span> URL below.
            </p>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block mb-1">
                  API Server Endpoint URL
                </label>
                <input 
                  type="url" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. https://xxxx.ngrok-free.app or http://localhost:8000"
                  className="w-full bg-bg-primary border border-border-card rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent-purple font-mono"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end text-sm mt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setInputValue('');
                    setBackendUrl('');
                    setShowConfig(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-text-muted"
                >
                  Reset Default
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-purple to-accent-cyan hover:from-accent-purple/95 text-text-primary font-semibold shadow-lg shadow-accent-purple/20 active:scale-95 transition-all"
                >
                  Save & Reload
                </button>
              </div>
            </form>
            <button 
              onClick={() => setShowConfig(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary text-lg"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;

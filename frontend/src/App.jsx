import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

import ExperimentExplorer from './pages/ExperimentExplorer';
import ArchitectureExplorer from './pages/ArchitectureExplorer';
import LiveInference from './pages/LiveInference';
import GlobalComparison from './pages/GlobalComparison';

import { useExperiments } from './hooks/useExperiments';
import { AlertCircle } from 'lucide-react';

function App() {
  const {
    experiments,
    loading,
    isOffline,
    selectedExpId,
    setSelectedExpId,
    selectedExperiment,
    detailsLoading,
    refreshExperiments
  } = useExperiments();

  return (
    <Router>
      <div className="flex bg-bg-primary text-text-primary min-h-screen font-sans">
        {/* Sidebar Nav */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar with drive context and connectivity details */}
          <TopBar isOffline={isOffline} />

          {/* Offline Demo Warning Banner */}
          {isOffline && (
            <div className="bg-accent-pink/10 border-b border-accent-pink/25 py-2 px-8 flex items-center justify-between text-xs text-accent-pink font-semibold">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 animate-bounce" />
                <span>⚠️ Local backend offline. Dashboard is executing in cached DEMO mode. Mount Colab cells to sync live endpoints.</span>
              </div>
              <button 
                onClick={refreshExperiments}
                className="hover:underline font-mono bg-accent-pink/10 border border-accent-pink/20 px-2 py-0.5 rounded"
              >
                [RECONNECT]
              </button>
            </div>
          )}

          {/* Router Outlet Pages Container */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route 
                path="/" 
                element={
                  <ExperimentExplorer
                    experiments={experiments}
                    loading={loading}
                    isOffline={isOffline}
                    selectedExpId={selectedExpId}
                    setSelectedExpId={setSelectedExpId}
                    selectedExperiment={selectedExperiment}
                    detailsLoading={detailsLoading}
                  />
                } 
              />
              <Route 
                path="/architecture" 
                element={
                  <ArchitectureExplorer
                    experiments={experiments}
                    selectedExpId={selectedExpId}
                    setSelectedExpId={setSelectedExpId}
                    selectedExperiment={selectedExperiment}
                  />
                } 
              />
              <Route 
                path="/inference" 
                element={
                  <LiveInference
                    experiments={experiments}
                    selectedExpId={selectedExpId}
                    setSelectedExpId={setSelectedExpId}
                    selectedExperiment={selectedExperiment}
                    isOffline={isOffline}
                  />
                } 
              />
              <Route 
                path="/compare" 
                element={
                  <GlobalComparison 
                    experiments={experiments} 
                  />
                } 
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

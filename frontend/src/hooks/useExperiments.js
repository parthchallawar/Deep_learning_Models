import { useState, useEffect } from 'react';
import { fetchExperiments, fetchExperimentDetails, checkBackendStatus } from '../utils/api';

export const useExperiments = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(true);
  const [selectedExpId, setSelectedExpId] = useState('EXP21'); // Default to best model (EXP21)
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Load experiments
  const loadAll = async () => {
    setLoading(true);
    // Check if live backend exists
    const status = await checkBackendStatus();
    setIsOffline(!status);
    
    const data = await fetchExperiments(!status);
    setExperiments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Fetch full details whenever selectedExpId changes
  useEffect(() => {
    if (!selectedExpId) return;
    
    const loadDetails = async () => {
      setDetailsLoading(true);
      const data = await fetchExperimentDetails(selectedExpId, isOffline);
      setSelectedExperiment(data);
      setDetailsLoading(false);
    };

    loadDetails();
  }, [selectedExpId, isOffline, experiments]);

  return {
    experiments,
    loading,
    isOffline,
    selectedExpId,
    setSelectedExpId,
    selectedExperiment,
    detailsLoading,
    refreshExperiments: loadAll
  };
};

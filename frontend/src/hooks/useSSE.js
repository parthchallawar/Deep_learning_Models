import { useState, useRef, useEffect } from 'react';
import { runModelStream } from '../utils/api';
import mockResults from '../utils/mock_results.json';

export const useSSE = (isOffline = false) => {
  const [streaming, setStreaming] = useState(false);
  const [progress, setProgress] = useState([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(20);
  const [error, setError] = useState(null);
  
  const eventSourceRef = useRef(null);
  const timerRef = useRef(null);

  const startStream = (arch, optimizer, batchSize, augmented, expId) => {
    setError(null);
    setProgress([]);
    setCurrentEpoch(0);
    setStreaming(true);

    if (isOffline) {
      // Simulate live training epochs from mock data
      const exp = mockResults.find(e => e.exp_id === expId) || mockResults[0];
      const trainAcc = exp.train_acc || [];
      const valAcc = exp.val_acc || [];
      const trainLoss = exp.train_loss || [];
      const valLoss = exp.val_loss || [];
      
      const total = valAcc.length || 20;
      setTotalEpochs(total);
      
      let index = 0;
      timerRef.current = setInterval(() => {
        if (index < total) {
          const epochData = {
            epoch: index + 1,
            total_epochs: total,
            train_acc: trainAcc[index] || 0.1,
            val_acc: valAcc[index] || 0.1,
            train_loss: trainLoss[index] || 4.0,
            val_loss: valLoss[index] || 4.0,
            status: index < total - 1 ? 'running' : 'completed'
          };
          
          setProgress(prev => [...prev, epochData]);
          setCurrentEpoch(index + 1);
          index++;
        } else {
          clearInterval(timerRef.current);
          setStreaming(false);
        }
      }, 250); // Fast simulation
      return;
    }

    // Connect to actual FastAPI SSE route
    try {
      const url = runModelStream(arch, optimizer, batchSize, augmented);
      const source = new EventSource(url);
      eventSourceRef.current = source;

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          setProgress((prev) => [...prev, data]);
          setCurrentEpoch(data.epoch);
          setTotalEpochs(data.total_epochs || 20);
          
          if (data.status === 'completed') {
            source.close();
            setStreaming(false);
          }
        } catch (err) {
          console.error('Error parsing SSE data', err);
        }
      };

      source.onerror = (err) => {
        console.error('SSE connection error, closing', err);
        setError('Server SSE Connection failed. Reverted to simulation mode.');
        source.close();
        
        // Fall back to offline simulation
        clearInterval(timerRef.current);
        setStreaming(false);
        startStream(arch, optimizer, batchSize, augmented, expId);
      };
    } catch (err) {
      setError(err.message);
      setStreaming(false);
    }
  };

  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setStreaming(false);
  };

  useEffect(() => {
    return () => stopStream();
  }, []);

  return {
    streaming,
    progress,
    currentEpoch,
    totalEpochs,
    error,
    startStream,
    stopStream
  };
};

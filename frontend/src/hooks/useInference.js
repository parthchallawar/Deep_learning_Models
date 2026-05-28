import { useState } from 'react';
import { postInference } from '../utils/api';

export const useInference = (isOffline = false) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runPredict = async (expId, file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postInference(expId, file, isOffline);
      
      // If mock, we build the image previews on the frontend using FileReader!
      if (data.isMock) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        await new Promise((resolve) => {
          reader.onload = (e) => {
            const b64Data = e.target.result;
            
            // Build the visual steps
            data.original_image = b64Data;
            data.resized_image = b64Data; // Just preview matching size
            data.normalized_image = b64Data; // visual representation
            
            // Generate mock Grad-CAM canvas overlay on the client!
            // We do this by setting data.gradcam_image, which will just be handled
            // by a special overlay renderer in InferencePanel using CSS filters!
            data.gradcam_image = b64Data;
            resolve();
          };
        });
      }
      
      setResult(data);
    } catch (err) {
      console.error('Inference error', err);
      setError(err.response?.data?.detail || err.message || 'Failed to complete inference.');
    } finally {
      setLoading(false);
    }
  };

  const clearInference = () => {
    setResult(null);
    setError(null);
  };

  return {
    loading,
    result,
    error,
    runPredict,
    clearInference
  };
};

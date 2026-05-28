import axios from 'axios';
import mockResults from './mock_results.json';

// Get backend URL from local storage or default to localhost
const getBackendUrl = () => {
  return localStorage.getItem('caltech_backend_url') || 'http://localhost:8000';
};

export const setBackendUrl = (url) => {
  if (!url) {
    localStorage.removeItem('caltech_backend_url');
  } else {
    // Ensure no trailing slash
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    localStorage.setItem('caltech_backend_url', cleanUrl);
  }
  window.location.reload();
};

export const getStoredBackendUrl = () => {
  return localStorage.getItem('caltech_backend_url') || '';
};

// Create axios instance
const api = axios.create({
  baseURL: getBackendUrl(),
  timeout: 5000,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

// Update baseURL dynamically if setting changes
api.interceptors.request.use((config) => {
  config.baseURL = getBackendUrl();
  return config;
});

// Check if backend is active
export const checkBackendStatus = async () => {
  try {
    const res = await axios.get(`${getBackendUrl()}/api/experiments`, { 
      timeout: 1500,
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    return res.status === 200;
  } catch (e) {
    return false;
  }
};

// API Fetch Calls
export const fetchExperiments = async (isOffline = false) => {
  if (isOffline) return mockResults;
  try {
    const res = await api.get('/api/experiments');
    return res.data;
  } catch (error) {
    console.warn('Failed to fetch from live backend, falling back to mock results', error);
    return mockResults;
  }
};

export const fetchExperimentDetails = async (expId, isOffline = false) => {
  if (isOffline) {
    const exp = mockResults.find(e => e.exp_id === expId);
    return exp || null;
  }
  try {
    const res = await api.get(`/api/experiment/${expId}`);
    return res.data;
  } catch (error) {
    console.warn('Failed to fetch details from live backend, using mock', error);
    const exp = mockResults.find(e => e.exp_id === expId);
    return exp || null;
  }
};

export const runModelStream = (arch, optimizer, batchSize, augmented) => {
  const params = new URLSearchParams();
  params.append('arch', arch);
  params.append('optimizer', optimizer);
  params.append('batch_size', batchSize);
  params.append('augmented', augmented);
  
  const backendUrl = getBackendUrl();
  // Return EventSource URL so the component can subscribe directly
  return `${backendUrl}/api/run?${params.toString()}`;
};

export const postInference = async (expId, file, isOffline = false) => {
  if (isOffline) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Perform simulated offline prediction
    const exp = mockResults.find(e => e.exp_id === expId) || mockResults[0];
    const classNames = exp.class_names;
    
    // Choose a pseudorandom class
    const seed = file.size || Math.floor(Math.random() * 10000);
    const trueIdx = seed % classNames.length;
    
    const confidence = exp.arch === "TL" ? 88.5 : (exp.arch === "CNN" ? 71.2 : 44.8);
    const predictions = [
      { class_name: classNames[trueIdx], confidence: confidence },
      { class_name: classNames[(trueIdx + 1) % classNames.length], confidence: (100 - confidence) * 0.4 },
      { class_name: classNames[(trueIdx + 2) % classNames.length], confidence: (100 - confidence) * 0.3 },
      { class_name: classNames[(trueIdx + 3) % classNames.length], confidence: (100 - confidence) * 0.2 },
      { class_name: classNames[(trueIdx + 4) % classNames.length], confidence: (100 - confidence) * 0.1 }
    ].sort((a,b) => b.confidence - a.confidence);
    
    // Draw raw canvas heatmaps inside React component if needed,
    // here we return placeholder mock image values (we will render beautiful Canvas/CSS filters inside React directly!)
    return {
      predictions,
      isMock: true,
      original_image: null, // React will generate a preview from raw file
      resized_image: null,
      normalized_image: null,
      gradcam_image: null
    };
  }
  
  const formData = new FormData();
  formData.append('exp_id', expId);
  formData.append('file', file);
  
  const res = await api.post('/api/infer', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const fetchComparison = async (ids, isOffline = false) => {
  if (isOffline) {
    return mockResults.filter(e => ids.includes(e.exp_id));
  }
  try {
    const res = await api.get(`/api/compare?ids=${ids.join(',')}`);
    return res.data;
  } catch (error) {
    console.warn('Failed comparison call, using mock', error);
    return mockResults.filter(e => ids.includes(e.exp_id));
  }
};

const API = '/api';

async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(`${API}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch {
    throw new Error('Could not connect to the API server. Start the backend with "npm run server" and try again.');
  }

  const body = await res.text();
  let data;
  try {
    data = body ? JSON.parse(body) : {};
  } catch {
    const excerpt = body.trim().replace(/\s+/g, ' ').slice(0, 120);
    throw new Error(`The server returned a non-JSON response (HTTP ${res.status}). Check that the backend is running and the API URL is correct.${excerpt ? ` Response: ${excerpt}` : ''}`);
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Wrestlers
export const getWrestlers = () => request('/wrestlers');
export const addWrestler = (data) => request('/wrestlers', { method: 'POST', body: JSON.stringify(data) });
export const updateWrestler = (id, data) => request(`/wrestlers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteWrestler = (id) => request(`/wrestlers/${id}`, { method: 'DELETE' });
export const resetWrestlers = () => request('/wrestlers/reset', { method: 'POST' });
export const importWrestlers = (wrestlers) => request('/wrestlers/import', { method: 'POST', body: JSON.stringify({ wrestlers }) });
export const exportWrestlers = () => request('/wrestlers/export/all');

// Setup
export const getSetup = () => request('/setup');
export const saveSetup = (wrestlers) => request('/setup', { method: 'POST', body: JSON.stringify({ wrestlers }) });
export const getSampleRumble = () => request('/setup/sample');

// Simulations
export const getSimulations = () => request('/simulations');
export const getLatestSimulation = () => request('/simulations/latest');
export const saveSimulation = (data) => request('/simulations', { method: 'POST', body: JSON.stringify(data) });

// AI Predictions
export const predictWinners = (wrestlers) => request('/predict', { method: 'POST', body: JSON.stringify({ wrestlers }) });
export const monteCarloPredict = (wrestlers, runs = 500) =>
  request('/predict/monte-carlo', { method: 'POST', body: JSON.stringify({ wrestlers, runs }) });

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, TrendingUp, AlertCircle, Activity } from 'lucide-react';

// --- CONFIGURATION ---
// Paste your API endpoint and API key here
const API_ENDPOINT = 'https://your-api-domain.com/v1/scores'; 
const API_KEY = ''; // Paste your key here
const REFRESH_INTERVAL = 30000; // Update every 30 seconds

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = useCallback(async () => {
    if (!API_KEY) {
      setError('Please configure your API Key in the App.jsx file.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Unable to reach the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up auto-refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-blue-600" /> Live Metrics
          </h1>
          <p className="text-sm text-gray-500">Auto-updating every {REFRESH_INTERVAL/1000}s</p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 rounded-full hover:bg-gray-200 transition"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3 mb-6">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">{item.label}</h3>
              <p className="text-4xl font-bold mt-2">{item.value}</p>
              <div className="mt-4 text-green-600 text-sm flex items-center gap-1 font-semibold">
                <TrendingUp size={16} /> +{item.trend}%
              </div>
            </div>
          ))
        ) : (
          !loading && <div className="col-span-full text-center py-12 text-gray-400">No data available yet.</div>
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-gray-400">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </footer>
    </div>
  );
}

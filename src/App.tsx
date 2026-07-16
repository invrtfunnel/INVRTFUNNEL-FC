import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, RefreshCw, Info, Search, X } from 'lucide-react';

// Simplified Match types for this standalone environment
interface Match {
  id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  status: string;
}

export default function App() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error' | 'syncing'>('idle');

  // Simulation of data sync
  const handleForceSync = async () => {
    setSyncStatus('syncing');
    try {
      // Simulation of API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLiveMatches([
        { id: '1', homeTeam: { name: 'France' }, awayTeam: { name: 'Spain' }, status: 'live' },
        { id: '2', homeTeam: { name: 'England' }, awayTeam: { name: 'Argentina' }, status: 'upcoming' }
      ]);
      setSyncStatus('success');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased pb-12">
      <header className="border-b border-white/10 bg-slate-950/40 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between">
          <h1 className="text-xl font-black">INVRTFUNNEL<span className="text-emerald-400">FC</span></h1>
          <button 
            onClick={handleForceSync} 
            className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/20 transition"
          >
            <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} /> 
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 mt-6">
        {liveMatches.length === 0 ? (
          <div className="text-center p-10 border border-white/5 rounded-3xl">
            <p className="text-slate-400">Koi live matches nahi hain. Sync button dabayein.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {liveMatches.map(match => (
              <div 
                key={match.id} 
                className={`p-4 rounded-xl border ${selectedMatchId === match.id ? 'border-emerald-500' : 'border-white/10'} bg-slate-900/50 cursor-pointer`}
                onClick={() => setSelectedMatchId(match.id)}
              >
                <h2 className="font-bold">{match.homeTeam.name} vs {match.awayTeam.name}</h2>
                <p className="text-xs text-slate-400 capitalize">{match.status}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

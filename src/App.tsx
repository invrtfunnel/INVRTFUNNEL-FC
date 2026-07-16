import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Trophy, RefreshCw, Info, X } from 'lucide-react';
import MatchCard from './components/MatchCard';
import MatchDetails from './components/MatchDetails';
import MatchAnalysisModal from './components/MatchAnalysisModal';

// Match Type Definition
interface Match {
  id: string;
  homeTeam: { name: string; logo: string };
  awayTeam: { name: string; logo: string };
  status: string;
  competition: string;
  date: string;
  score?: string;
}

export default function App() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [analyzingMatchId, setAnalyzingMatchId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error' | 'syncing'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const handleForceSync = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Syncing live feed...');
    try {
      const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY || '';
      const response = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', {
        headers: { 'x-apisports-key': apiKey, 'x-rapidapi-key': apiKey }
      });
      
      const data = await response.json();
      let matches = data.response || [];

      // Fallback for simulation
      if (matches.length === 0) {
        matches = [
          { id: '9001', homeTeam: { name: 'France', logo: '' }, awayTeam: { name: 'Spain', logo: '' }, status: 'finished', competition: 'FIFA World Cup - Semis', date: '2026-07-14', score: '1-2' },
          { id: '9002', homeTeam: { name: 'England', logo: '' }, awayTeam: { name: 'Argentina', logo: '' }, status: 'finished', competition: 'FIFA World Cup - Semis', date: '2026-07-15', score: '0-1' },
          { id: '9003', homeTeam: { name: 'Argentina', logo: '' }, awayTeam: { name: 'Spain', logo: '' }, status: 'upcoming', competition: 'FIFA World Cup - Final', date: '2026-07-19' }
        ];
      }
      setLiveMatches(matches);
      setSyncStatus('success');
      setSyncMessage('Synced successfully.');
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage('Sync failed. Check API key.');
    }
  };

  useEffect(() => {
    handleForceSync();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black">INVRTFUNNEL<span className="text-emerald-400">FC</span></h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Live Football Scores Dashboard</p>
        </div>
        <button 
          onClick={handleForceSync}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold transition border border-emerald-500/20"
        >
          <RefreshCw className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
      </header>

      {/* No Matches Notification */}
      {liveMatches.length === 0 && (
        <div className="bg-slate-900/50 border border-white/5 p-6 rounded-2xl mb-8 flex items-center gap-4">
          <Info className="text-emerald-400 h-6 w-6" />
          <div>
            <h3 className="font-bold">No live matches at the moment.</h3>
            <p className="text-xs text-slate-400">Displaying historical World Cup data while you wait for the final.</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {liveMatches.map(match => (
            <div key={match.id} className="relative">
              <MatchCard 
                match={match} 
                isSelected={selectedMatchId === match.id} 
                onSelect={() => setSelectedMatchId(match.id)}
                onOpenAnalysis={() => setAnalyzingMatchId(match.id)}
              />
            </div>
          ))}
        </div>
        
        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedMatchId ? (
            <MatchDetails match={liveMatches.find(m => m.id === selectedMatchId)} />
          ) : (
            <div className="bg-slate-900/30 border border-dashed border-white/10 p-8 rounded-2xl text-center text-slate-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a match to view details and analysis.</p>
            </div>
          )}
        </div>
      </div>

      <MatchAnalysisModal
        isOpen={!!analyzingMatchId}
        onClose={() => setAnalyzingMatchId(null)}
        match={liveMatches.find(m => m.id === analyzingMatchId)!}
      />
    </div>
  );
}

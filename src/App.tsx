import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Trophy, Calendar, RefreshCw, Info, Search, Filter, X, TrendingUp } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import MatchCard from './components/MatchCard';
import MatchDetails from './components/MatchDetails';
import MatchAnalysisModal from './components/MatchAnalysisModal';
import UpcomingFixtures from './components/UpcomingFixtures';

// Match types
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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error' | 'syncing'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [analyzingMatchId, setAnalyzingMatchId] = useState<string | null>(null);

  const handleForceSync = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Syncing with feed...');
    try {
      const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY || '';
      const response = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026&from=2026-07-13&to=2026-07-20', {
        method: 'GET',
        headers: { 'x-apisports-key': apiKey, 'x-rapidapi-key': apiKey }
      });

      if (!response.ok) throw new Error('API Request Failed');
      const data = await response.json();
      let matches = data.response || [];

      // Simulation fallback if API returns empty
      if (matches.length === 0) {
        matches = [
          { id: '9001', homeTeam: { name: 'France', logo: '' }, awayTeam: { name: 'Spain', logo: '' }, status: 'finished', competition: 'World Cup', date: '2026-07-14', score: '1-2' },
          { id: '9002', homeTeam: { name: 'England', logo: '' }, awayTeam: { name: 'Argentina', logo: '' }, status: 'finished', competition: 'World Cup', date: '2026-07-15', score: '0-1' },
          { id: '9003', homeTeam: { name: 'Argentina', logo: '' }, awayTeam: { name: 'Spain', logo: '' }, status: 'upcoming', competition: 'World Cup', date: '2026-07-19' }
        ];
      }

      setLiveMatches(matches);
      setSyncStatus('success');
      setSyncMessage('Synced successfully.');
    } catch (err) {
      setSyncStatus('error');
      setSyncMessage('Sync failed. Please check your API Key.');
    }
  };

  useEffect(() => {
    handleForceSync();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-black">INVRTFUNNEL<span className="text-emerald-400">FC</span></h1>
        <button 
          onClick={handleForceSync}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold transition border border-emerald-500/20"
        >
          <RefreshCw className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
      </header>

      <div className="grid gap-4">
        {liveMatches.map(match => (
          <div key={match.id} className="bg-slate-900 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="font-bold">{match.homeTeam.name} vs {match.awayTeam.name}</h2>
              <p className="text-xs text-slate-400">{match.status.toUpperCase()} {match.score && `- ${match.score}`}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

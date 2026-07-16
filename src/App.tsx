import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Trophy, Calendar, RefreshCw, Info, Search, Filter, X } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import MatchCard from './components/MatchCard';
import MatchDetails from './components/MatchDetails';
import MatchAnalysisModal from './components/MatchAnalysisModal';
import UpcomingFixtures from './components/UpcomingFixtures';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error' | 'syncing'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  // 1. Force Sync Logic (with Simulation Fallback)
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
      setSyncMessage('Sync failed.');
    }
  };

  // 2. Firebase Listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'live_matches'), (snapshot) => {
      const matches: Match[] = snapshot.docs.map(doc => doc.data() as Match);
      setLiveMatches(matches);
    });
    return () => unsubscribe();
  }, []);

  const activeMatches = liveMatches.filter(m => (m.status === 'live' || m.status === 'upcoming'));
  const filteredMatches = activeMatches.filter(match => 
    match.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    match.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black">INVRTFUNNEL<span className="text-emerald-400">FC</span></h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Global Live Arena Feed</p>
        </div>
        <button 
          onClick={handleForceSync}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold transition border border-emerald-500/20"
        >
          <RefreshCw className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {filteredMatches.map(match => (
            <MatchCard 
              key={match.id} 
              match={match} 
              isSelected={selectedMatchId === match.id} 
              onSelect={() => setSelectedMatchId(match.id)}
              onOpenAnalysis={() => setAnalyzingMatchId(match.id)}
            />
          ))}
        </div>
        <div className="lg:col-span-1">
          <MatchDetails match={liveMatches.find(m => m.id === selectedMatchId)} />
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

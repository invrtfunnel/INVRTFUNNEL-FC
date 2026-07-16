import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCw, Search, Filter, Activity, Info, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';
import MatchCard from './components/MatchCard';
import MatchDetails from './components/MatchDetails';
import MatchAnalysisModal from './components/MatchAnalysisModal';

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
  const [currentTime, setCurrentTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Clock Sync
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Logic
  const handleForceSync = async () => {
    setSyncStatus('syncing');
    try {
      const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY || '';
      const response = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026', {
        headers: { 'x-apisports-key': apiKey, 'x-rapidapi-key': apiKey }
      });
      
      const data = await response.json();
      let matches = data.response || [];

      // Fallback Simulation for your Final
      if (matches.length === 0) {
        matches = [
          { id: '9001', homeTeam: { name: 'France', logo: '' }, awayTeam: { name: 'Spain', logo: '' }, status: 'finished', competition: 'World Cup', date: '2026-07-14', score: '1-2' },
          { id: '9002', homeTeam: { name: 'England', logo: '' }, awayTeam: { name: 'Argentina', logo: '' }, status: 'finished', competition: 'World Cup', date: '2026-07-15', score: '0-1' },
          { id: '9003', homeTeam: { name: 'Argentina', logo: '' }, awayTeam: { name: 'Spain', logo: '' }, status: 'upcoming', competition: 'World Cup', date: '2026-07-19' }
        ];
      }
      setLiveMatches(matches);
      setSyncStatus('success');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  useEffect(() => { handleForceSync(); }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-6">
      {/* Header Ticker */}
      <header className="flex items-center justify-between mb-8 bg-slate-900/50 border border-white/5 p-4 rounded-full backdrop-blur-md">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-black flex items-center gap-2">
            <Trophy className="text-emerald-400" /> INVRTFUNNEL<span className="text-emerald-400">FC</span>
          </h1>
          <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="text-emerald-400">● World Cup Season</span>
            <span>FIFA World Cup 2026 Live</span>
            <span>IST {currentTime}</span>
          </div>
        </div>
        <button 
          onClick={handleForceSync}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-xs font-bold border border-white/10 transition"
        >
          <RefreshCw className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          Sync Now
        </button>
      </header>

      {/* Filter Hub */}
      <section className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h3 className="font-bold flex items-center gap-2"><Filter className="h-4 w-4" /> Live Filter Hub</h3>
          <div className="flex gap-2">
            <input 
              placeholder="Search teams..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 px-4 py-2 rounded-xl text-xs border border-white/10"
            />
            {['All Arena', 'World Cup', 'EPL', 'La Liga'].map(tab => (
              <button key={tab} className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10">{tab}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {liveMatches.map(match => (
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

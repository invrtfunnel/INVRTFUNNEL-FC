import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Match, Team, MatchEvent } from './types';
import MatchCard from './components/MatchCard';
import MatchDetails from './components/MatchDetails';
import MatchAnalysisModal from './components/MatchAnalysisModal';
import UpcomingFixtures from './components/UpcomingFixtures';
import { Activity, Trophy, Calendar, RefreshCw, Star, Info, TrendingUp, Search, Filter, X } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

// Define Teams
const TEAMS: Record<string, Team> = {
  RMD: { name: 'Real Madrid', shortName: 'RMD', primaryColor: '#FBBF24', secondaryColor: '#1D4ED8', badgeStyle: 'shield-diagonal' },
  FCB: { name: 'Barcelona', shortName: 'FCB', primaryColor: '#DC2626', secondaryColor: '#1E3A8A', badgeStyle: 'shield-stripes' },
  ARS: { name: 'Arsenal', shortName: 'ARS', primaryColor: '#EF4444', secondaryColor: '#F8FAFC', badgeStyle: 'shield-cross' },
  CHE: { name: 'Chelsea', shortName: 'CHE', primaryColor: '#2563EB', secondaryColor: '#F8FAFC', badgeStyle: 'shield-circle' },
  BAY: { name: 'Bayern Munich', shortName: 'BAY', primaryColor: '#DC2626', secondaryColor: '#1D4ED8', badgeStyle: 'shield-circle' },
  BVB: { name: 'Borussia Dortmund', shortName: 'BVB', primaryColor: '#EAB308', secondaryColor: '#000000', badgeStyle: 'shield-diagonal' },
  MCI: { name: 'Manchester City', shortName: 'MCI', primaryColor: '#38BDF8', secondaryColor: '#F8FAFC', badgeStyle: 'shield-circle' },
  LIV: { name: 'Liverpool', shortName: 'LIV', primaryColor: '#991B1B', secondaryColor: '#FBBF24', badgeStyle: 'shield-cross' },
  PSG: { name: 'Paris Saint-Germain', shortName: 'PSG', primaryColor: '#1E3A8A', secondaryColor: '#EF4444', badgeStyle: 'shield-stripes' },
  OM:  { name: 'Marseille', shortName: 'OM', primaryColor: '#60A5FA', secondaryColor: '#F8FAFC', badgeStyle: 'shield-cross' },
  INT: { name: 'Inter Milan', shortName: 'INT', primaryColor: '#1D4ED8', secondaryColor: '#000000', badgeStyle: 'shield-stripes' },
  ACM: { name: 'AC Milan', shortName: 'ACM', primaryColor: '#DC2626', secondaryColor: '#000000', badgeStyle: 'shield-stripes' },
  MUN: { name: 'Manchester United', shortName: 'MUN', primaryColor: '#E11D48', secondaryColor: '#000000', badgeStyle: 'shield-cross' },
  TOT: { name: 'Tottenham', shortName: 'TOT', primaryColor: '#F8FAFC', secondaryColor: '#1E293B', badgeStyle: 'shield-circle' },
  ESP: { name: 'Spain', shortName: 'ESP', primaryColor: '#C1272D', secondaryColor: '#F1BF00', badgeStyle: 'shield-cross' },
  ENG: { name: 'England', shortName: 'ENG', primaryColor: '#FFFFFF', secondaryColor: '#002F6C', badgeStyle: 'shield-stripes' },
  FRA: { name: 'France', shortName: 'FRA', primaryColor: '#002395', secondaryColor: '#ED2939', badgeStyle: 'shield-cross' },
  ARG: { name: 'Argentina', shortName: 'ARG', primaryColor: '#74ACDF', secondaryColor: '#FFFFFF', badgeStyle: 'shield-stripes' },
  BRA: { name: 'Brazil', shortName: 'BRA', primaryColor: '#FFDF00', secondaryColor: '#009B3A', badgeStyle: 'shield-star' },
  GER: { name: 'Germany', shortName: 'GER', primaryColor: '#000000', secondaryColor: '#FF0000', badgeStyle: 'shield-stripes' },
};

// Dynamic matches loaded via Firestore

export default function App() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [analyzingMatchId, setAnalyzingMatchId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [config, setConfig] = useState<{ isApiFootballKeyConfigured: boolean; firebaseProjectId: string; error: string | null } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error' | 'syncing'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>(() => 
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Update live clock every second using local time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch backend API configuration status
  useEffect(() => {
    const clientApiKey = import.meta.env.VITE_FOOTBALL_API_KEY || '';
    const headers: Record<string, string> = {
      'x-apisports-key': clientApiKey,
      'x-rapidapi-key': clientApiKey
    };

    fetch('/api/config', { headers })
      .then(res => {
        console.log(`[CLIENT CONFIG HANDSHAKE] EXACT HTTP STATUS CODE: ${res.status}`);
        return res.json().then(data => ({ status: res.status, data }));
      })
      .then(({ data }) => {
        setConfig(data);
        if (data.error && !data.error.includes('simulation') && !data.error.includes('Using high-fidelity')) {
          setApiError(data.error);
        } else {
          setApiError(null);
        }
      })
      .catch(err => console.error('Error fetching API configuration status:', err));
  }, []);

  // Force sync from backend REST API-Football feed
  const handleForceSync = async () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
try {
  setSyncStatus('syncing');
  
  // Grab the key directly from Vercel's environment variables
  const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY || '';
  
  // Fetch DIRECTLY from the sports database (bypassing the missing backend)
 const response = await fetch('https://v3.football.api-sports.io/fixtures?league=1&season=2026&from=2026-07-13&to=2026-07-20', {
    method: 'GET',
    headers: {
      'x-apisports-key': apiKey,
      'x-rapidapi-key': apiKey
    }
  });

  if (!response.ok) throw new Error('API request failed');

  const data = await response.json();
  
  // Extract the matches from the API's 'response' array
  const matches = data.response || [];
  
  setLiveMatches(matches);
  setSyncStatus('success');
  setApiError(null);
  
  if (matches.length === 0) {
    setSyncMessage('No matches scheduled right now.');
  } else {
    setSyncMessage(`Successfully synced ${matches.length} matches!`);
  }

} catch (err: any) {
  console.error("Fetch failed:", err);
  setSyncStatus('error');
  setSyncMessage('Failed to connect to API directly.');
  setApiError('API Error: Unable to fetch live results.');
  setLiveMatches([]); 
} finally {
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 5000);
    }
  };

  // Set up Firebase Firestore real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'live_matches'), (snapshot) => {
      const matches: Match[] = [];
      snapshot.forEach((doc) => {
        matches.push(doc.data() as Match);
      });
      
      // Sort matches so they appear in a consistent order
      matches.sort((a, b) => {
        const idA = a?.id || '';
        const idB = b?.id || '';
        return idA.localeCompare(idB);
      });
      setLiveMatches(matches);
      
      // Select first match if none selected or if selected is missing
      setSelectedMatchId(prev => {
        if (!prev || !matches.some(m => m.id === prev)) {
          return matches[0]?.id || '';
        }
        return prev;
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'live_matches');
    });

    return () => unsubscribe();
  }, [config]);

  const selectedMatch = liveMatches.find(m => m && m.id === selectedMatchId) || liveMatches.filter(m => m && m.homeTeam && m.awayTeam)[0];

  const recentResults = liveMatches
    .filter(m => m && m.homeTeam && m.awayTeam && m.status === 'finished')
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const activeMatches = liveMatches.filter(m => m && m.homeTeam && m.awayTeam && (m.status === 'live' || m.status === 'upcoming'));

  const filteredMatches = activeMatches.filter(match => {
    if (!match || !match.homeTeam || !match.awayTeam) return false;
    const matchesSearch = (match.homeTeam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (match.awayTeam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (match.homeTeam.shortName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (match.awayTeam.shortName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedLeague === 'All') {
      return matchesSearch;
    }
    
    if (selectedLeague === 'FIFA World Cup' || selectedLeague === 'World Cup' || selectedLeague === 'World Cup 2026') {
      return matchesSearch && (
        match.competition.toLowerCase().includes('world cup') ||
        match.competition.toLowerCase().includes('worldcup') ||
        match.competition.toLowerCase().includes('fifa') ||
        match.competition.toLowerCase().includes('wc') ||
        match.id.toLowerCase().includes('wc-')
      );
    }
    
    return matchesSearch && match.competition.toLowerCase().includes(selectedLeague.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased pb-12 selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      
      {/* Decorative ambient top & bottom glass glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Top Professional Navigation Bar */}
      <header className="border-b border-white/10 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-lg">
              <Trophy className="h-5.5 w-5.5 text-emerald-400 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                INVRTFUNNEL<span className="text-emerald-400">FC</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em]">Global Live Arena Feed</p>
            </div>
          </div>

          {/* Quick Stats Ticker */}
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-semibold bg-white/5 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md shadow-sm">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              </span>
              <span className="text-slate-100 font-bold">World Cup Season</span>
            </span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span>FIFA World Cup 2026 Live</span>
            </span>
            <span className="text-white/20">|</span>
            <span className="font-mono text-slate-300">IST {currentTime}</span>
          </div>

          {/* Status info & Live Sync */}
          <div className="flex items-center gap-3">
            {config && (
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${
                config.isApiFootballKeyConfigured 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`} id="api-football-key-badge">
                {config.isApiFootballKeyConfigured ? '● API-Football Connected' : '● Demo Simulation Feed'}
              </span>
            )}
            
            <button
              onClick={handleForceSync}
              disabled={syncStatus === 'syncing'}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                syncStatus === 'syncing'
                  ? 'bg-white/5 text-slate-400 border-white/5 animate-pulse'
                  : syncStatus === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : syncStatus === 'error'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15 hover:border-white/20'
              }`}
              id="sync-api-feed-btn"
              title="Manually trigger live matches sync from API-Football"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>
                {syncStatus === 'syncing' ? 'Loading...' : syncStatus === 'success' ? 'Synced!' : syncStatus === 'error' ? 'Error!' : 'Sync Now'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Sync notification banner */}
        <AnimatePresence>
          {syncMessage && (
            <motion.div
              key="sync-message-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                syncStatus === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-300 border-red-500/20'
              }`}
              id="sync-notification-banner"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0" />
                <span>{syncMessage}</span>
              </div>
              <button
                onClick={() => setSyncMessage('')}
                className="text-white/40 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Panel: Search and League Filters */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between relative overflow-hidden" id="dashboard-filters-panel">
          {/* Subtle glowing ambient spot */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Filter className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Live Filter Hub</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Search matches or filter by competition</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1 justify-end">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-emerald-400/50 rounded-2xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                id="search-teams-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  id="clear-search-btn"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* League Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" id="league-tabs-container">
              {[
                { name: 'All', label: 'All Arena' },
                { name: 'FIFA World Cup', label: '🏆 World Cup' },
                { name: 'Premier League', label: 'EPL' },
                { name: 'La Liga', label: 'La Liga' },
                { name: 'Bundesliga', label: 'Bundesliga' },
              ].map((league) => (
                <button
                  key={league.name}
                  onClick={() => setSelectedLeague(league.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    selectedLeague === league.name
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.08)]'
                      : 'bg-slate-950/40 text-slate-400 border border-white/5 hover:text-slate-200 hover:border-white/10'
                  }`}
                  id={`tab-${league.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {league.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Live Matches grid & detail center bento layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Grid column for active live match cards (2 cols width on desktop or 1 col list) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-emerald-400" />
                <h2 className="text-base font-bold tracking-tight text-slate-200">
                  {searchTerm || selectedLeague !== 'All' ? 'Filtered Match Results' : 'Live Fixtures Today'}
                </h2>
              </div>
              <span className="text-xs text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-900">
                Auto-updating
              </span>
            </div>

            {/* No Live Matches Banner */}
            {(activeMatches.length === 0 || activeMatches.every(m => m.status !== 'live')) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-[32px] bg-amber-500/5 border border-amber-500/20 text-center space-y-2.5 shadow-2xl relative overflow-hidden"
                id="no-live-matches-banner"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full pointer-events-none" />
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                  <Info className="h-5 w-5 animate-pulse" />
                </div>
                <h3 className="text-sm font-black text-slate-200">No live matches at the moment.</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  There are currently no live fixtures being played in the real world. Displaying the latest already played FIFA World Cup 2026 matches in the feed below.
                </p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {apiError ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 text-center space-y-3 w-full"
                  id="api-error-state"
                >
                  <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                    <X className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">API Error: Unable to fetch live results.</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    The live match data stream could not be loaded. Please ensure your API credentials are correct.
                  </p>
                </motion.div>
              ) : liveMatches.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/2 border border-white/5 rounded-3xl p-10 text-center space-y-3"
                  id="empty-scheduled-state"
                >
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">No matches scheduled</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    There are no live or upcoming matches stored in the feed. Click the "Sync Now" button above to pull the fresh July 14 & 15 World Cup 2026 semi-final fixtures from API-Football.
                  </p>
                </motion.div>
              ) : filteredMatches.length > 0 ? (
                filteredMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isSelected={selectedMatchId === match.id}
                    onSelect={() => setSelectedMatchId(match.id)}
                    onOpenAnalysis={() => setAnalyzingMatchId(match.id)}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/2 border border-white/5 rounded-3xl p-10 text-center space-y-3"
                  id="empty-filter-state"
                >
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">No Match Found</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    We couldn't find any active fixtures matching "{searchTerm}" {selectedLeague !== 'All' ? `in ${selectedLeague}` : ''}. Try checking spelling or resetting your filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedLeague('All');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-500/30 transition cursor-pointer"
                    id="reset-filters-btn"
                  >
                    Reset Active Filters
                  </button>
                </motion.div>
              )}
            </div>

            {/* Quick Informational Tip */}
            <div className="flex items-start gap-3 bg-slate-900/20 border border-slate-900 p-4 rounded-2xl text-xs text-slate-400">
              <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-300">World Cup 2026 Match Guide</p>
                <p className="leading-relaxed">
                  Click on any match card above to open its complete match center in the right-hand panel. View real-time tactical lineups, team statistics, and historical event logs directly synced from our official tournament feed.
                </p>
              </div>
            </div>
          </div>

          {/* Details match stats & lineups panel (1 col width on desktop) */}
          <div className="lg:col-span-1">
            <MatchDetails match={selectedMatch} />
          </div>
        </section>

        {/* Upcoming Fixtures */}
        <section className="pt-2">
          <UpcomingFixtures fixtures={liveMatches.filter(m => m && m.status === 'upcoming')} />
        </section>

        {/* Latest Results Section */}
        {recentResults.length > 0 && (
          <section className="pt-4 space-y-5" id="latest-results-section">
            <div className="flex items-center gap-2.5">
              <Trophy className="h-5 w-5 text-amber-400 stroke-[2.5]" />
              <div>
                <h2 className="text-lg font-bold text-slate-100">Latest Results</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Most recent completed World Cup matches</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentResults.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  isSelected={selectedMatchId === match.id}
                  onSelect={() => setSelectedMatchId(match.id)}
                  onOpenAnalysis={() => setAnalyzingMatchId(match.id)}
                />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* Styled Footer */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 border-t border-slate-900/60 pt-8 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 INVRTFUNNEL FC. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-emerald-400 transition cursor-pointer">Terms</span>
            <span>•</span>
            <span className="hover:text-emerald-400 transition cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-emerald-400 transition cursor-pointer">Data Sources</span>
          </div>
        </div>
      </footer>

      {/* Match Analysis Intelligence Modal */}
      <MatchAnalysisModal
        isOpen={!!analyzingMatchId}
        onClose={() => setAnalyzingMatchId(null)}
        match={liveMatches.find(m => m.id === analyzingMatchId)!}
      />
    </div>
  );
}

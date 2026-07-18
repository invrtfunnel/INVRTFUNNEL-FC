import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Search, Filter, Activity, BarChart3, Clock, Users, Shield, ChevronRight } from 'lucide-react';

interface MatchEvent {
  minute: number;
  type: 'goal' | 'card' | 'sub';
  detail: string;
  player: string;
  team: 'home' | 'away';
}

interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  fouls: [number, number];
  corners: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
}

interface Match {
  id: string;
  homeTeam: { name: string; short: string; color: string };
  awayTeam: { name: string; short: string; color: string };
  status: 'finished' | 'live' | 'upcoming';
  competition: string;
  date: string;
  score?: string;
  analysisText?: string;
  previewText?: string;
  stats?: MatchStats;
  events?: MatchEvent[];
  lineups?: { home: string[]; away: string[] };
}

const TOURNAMENT_DATA: Match[] = [
  {
    id: 'sf-1',
    competition: 'FIFA WORLD CUP • SEMI-FINAL',
    homeTeam: { name: 'France', short: 'FRA', color: '#002395' },
    awayTeam: { name: 'Spain', short: 'ESP', color: '#C1272D' },
    status: 'finished',
    score: '0 - 2',
    date: '2026-07-14T19:00:00Z',
    analysisText: 'A masterclass in control by La Roja. Spain completely suffocated the French attack, maintaining relentless possession. France failed to register a single shot on target in the second half, looking completely out of ideas against the Spanish midfield pivot.',
    stats: {
      possession: [40, 60], shots: [6, 15], shotsOnTarget: [1, 6], fouls: [14, 9], corners: [3, 7], yellowCards: [3, 1], redCards: [0, 0]
    },
    events: [
      { minute: 21, type: 'goal', detail: 'Goal', player: 'Dani Olmo', team: 'away' },
      { minute: 68, type: 'goal', detail: 'Goal', player: 'Alvaro Morata', team: 'away' },
      { minute: 82, type: 'card', detail: 'Yellow Card', player: 'Kylian Mbappe', team: 'home' }
    ],
    lineups: {
      home: ['Maignan', 'Koundé', 'Saliba', 'Upamecano', 'Hernandez', 'Kanté', 'Tchouaméni', 'Rabiot', 'Griezmann', 'Mbappé', 'Dembele'],
      away: ['Simón', 'Carvajal', 'Le Normand', 'Laporte', 'Cucurella', 'Rodri', 'Ruiz', 'Olmo', 'Yamal', 'Williams', 'Morata']
    }
  },
  {
    id: 'sf-2',
    competition: 'FIFA WORLD CUP • SEMI-FINAL',
    homeTeam: { name: 'England', short: 'ENG', color: '#FFFFFF' },
    awayTeam: { name: 'Argentina', short: 'ARG', color: '#74ACDF' },
    status: 'finished',
    score: '1 - 2',
    date: '2026-07-15T19:00:00Z',
    analysisText: 'A gritty, deeply tactical battle. England started strong with an early set-piece goal from Harry Kane, but Lionel Messi\'s playmaking unlocked the defense just before halftime. Lautaro Martínez\'s clinical finish in the 78th minute sealed England\'s fate.',
    stats: {
      possession: [45, 55], shots: [9, 14], shotsOnTarget: [4, 6], fouls: [12, 15], corners: [5, 4], yellowCards: [2, 2], redCards: [0, 0]
    },
    events: [
      { minute: 14, type: 'goal', detail: 'Goal', player: 'Harry Kane', team: 'home' },
      { minute: 43, type: 'goal', detail: 'Goal', player: 'Julian Alvarez', team: 'away' },
      { minute: 78, type: 'goal', detail: 'Goal', player: 'Lautaro Martínez', team: 'away' }
    ],
    lineups: {
      home: ['Pickford', 'Walker', 'Stones', 'Guehi', 'Trippier', 'Rice', 'Bellingham', 'Foden', 'Saka', 'Mainoo', 'Kane'],
      away: ['E. Martínez', 'Molina', 'Romero', 'Otamendi', 'Tagliafico', 'De Paul', 'Fernández', 'Mac Allister', 'Di María', 'Messi', 'Álvarez']
    }
  },
  {
    id: 'final-1',
    competition: 'FIFA WORLD CUP • GRAND FINAL',
    homeTeam: { name: 'Argentina', short: 'ARG', color: '#74ACDF' },
    awayTeam: { name: 'Spain', short: 'ESP', color: '#C1272D' },
    status: 'upcoming',
    date: '2026-07-19T19:00:00Z',
    previewText: 'The ultimate showdown at MetLife Stadium. Spain\'s relentless possession-based tiki-taka goes head-to-head against Argentina\'s aggressive pressing and rapid transitions. The central battle between Rodri and Enzo Fernández will dictate the tempo. Spain has the midfield control, but Argentina possesses the ultimate equalizer in Lionel Messi. Expect a chess match in the first half.',
    lineups: {
      home: ['E. Martínez', 'Molina', 'Romero', 'Otamendi', 'Tagliafico', 'De Paul', 'Fernández', 'Mac Allister', 'Di María', 'Messi', 'Álvarez'],
      away: ['Simón', 'Carvajal', 'Le Normand', 'Laporte', 'Cucurella', 'Rodri', 'Ruiz', 'Olmo', 'Yamal', 'Williams', 'Morata']
    }
  }
];

const MatchCard = ({ match, isSelected, onClick }: { match: Match, isSelected: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 ${isSelected ? 'bg-slate-900 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/80 hover:border-white/10'}`}
  >
    <div className="flex justify-between items-center mb-6">
      <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{match.competition}</span>
      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${match.status === 'finished' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse'}`}>
        {match.status === 'finished' ? 'FINISHED' : 'UPCOMING'}
      </span>
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex flex-col items-center gap-3 w-1/3">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg shadow-inner border border-white/10" style={{ backgroundColor: match.homeTeam.color }}>
          {match.homeTeam.short}
        </div>
        <span className="text-sm font-bold text-slate-200">{match.homeTeam.name}</span>
      </div>

      <div className="w-1/3 flex flex-col items-center justify-center">
        <div className="text-4xl font-black tracking-widest text-white">
          {match.status === 'finished' ? match.score : 'VS'}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-1/3">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg shadow-inner border border-white/10" style={{ backgroundColor: match.awayTeam.color }}>
          {match.awayTeam.short}
        </div>
        <span className="text-sm font-bold text-slate-200">{match.awayTeam.name}</span>
      </div>
    </div>
  </div>
);

const MatchDetails = ({ match }: { match: Match | null }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'events' | 'lineups' | 'analysis'>('analysis');

  // CRITICAL FIX: Reset tab when changing matches to prevent looking at 'stats' for an upcoming match
  useEffect(() => {
    if (match?.status === 'upcoming') {
      setActiveTab('analysis'); 
    } else {
      setActiveTab('stats');
    }
  }, [match?.id]);

  if (!match) {
    return (
      <div className="h-full min-h-[500px] bg-slate-900/30 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-white/5">
          <Activity className="h-6 w-6 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">No Match Selected</h3>
        <p className="text-sm text-slate-500 max-w-xs">Select a fixture from the arena feed to load real-time analytics, timelines, and match previews.</p>
      </div>
    );
  }

  const isUpcoming = match.status === 'upcoming';

  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl flex flex-col h-full overflow-hidden">
      {/* Detail Header */}
      <div className="p-6 border-b border-white/5 bg-slate-950/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-white">{match.homeTeam.short} vs {match.awayTeam.short}</h2>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {new Date(match.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Match Center</p>
      </div>

      {}
      <div className="flex px-4 pt-4 gap-2 border-b border-white/5 overflow-x-auto">
        {!isUpcoming && (
          <>
            <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'stats' ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Stats</button>
            <button onClick={() => setActiveTab('events')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'events' ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Timeline</button>
          </>
        )}
        <button onClick={() => setActiveTab('lineups')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'lineups' ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>Lineups</button>
        <button onClick={() => setActiveTab('analysis')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'analysis' ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>{isUpcoming ? 'Preview' : 'Analysis'}</button>
      </div>

      {}
      <div className="p-6 flex-1 overflow-y-auto">
        
        {/* STATS TAB */}
        {activeTab === 'stats' && !isUpcoming && match.stats && (
          <div className="space-y-6">
            <div className="flex justify-between text-xs font-bold text-slate-400 border-b border-white/5 pb-2 mb-4">
              <span style={{ color: match.homeTeam.color }}>{match.homeTeam.short}</span>
              <span>TEAM METRICS</span>
              <span style={{ color: match.awayTeam.color }}>{match.awayTeam.short}</span>
            </div>
            {[
              { label: 'Possession %', key: 'possession' as keyof MatchStats },
              { label: 'Total Shots', key: 'shots' as keyof MatchStats },
              { label: 'Shots on Target', key: 'shotsOnTarget' as keyof MatchStats },
              { label: 'Fouls', key: 'fouls' as keyof MatchStats },
              { label: 'Corners', key: 'corners' as keyof MatchStats },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">{match.stats![stat.key][0]}</span>
                  <span className="text-slate-500">{stat.label}</span>
                  <span className="text-white">{match.stats![stat.key][1]}</span>
                </div>
                <div className="flex h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${(match.stats![stat.key][0] / (match.stats![stat.key][0] + match.stats![stat.key][1])) * 100}%`, backgroundColor: match.homeTeam.color }}></div>
                  <div style={{ width: `${(match.stats![stat.key][1] / (match.stats![stat.key][0] + match.stats![stat.key][1])) * 100}%`, backgroundColor: match.awayTeam.color }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && !isUpcoming && match.events && (
          <div className="space-y-4">
            {match.events.map((ev, idx) => (
              <div key={idx} className={`flex items-center gap-4 ${ev.team === 'home' ? 'flex-row' : 'flex-row-reverse text-right'}`}>
                <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-xs font-bold text-slate-400 border border-white/5 shrink-0">
                  {ev.minute}'
                </div>
                <div className="flex-1 bg-slate-950/50 p-3 rounded-xl border border-white/5">
                  <p className="text-sm font-bold text-slate-200">{ev.player}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: ev.team === 'home' ? match.homeTeam.color : match.awayTeam.color }}>
                    {ev.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {}
        {activeTab === 'lineups' && match.lineups && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-center font-bold text-sm py-2 rounded-lg bg-slate-950 border border-white/5" style={{ color: match.homeTeam.color }}>{match.homeTeam.name}</div>
              <ul className="space-y-2">
                {match.lineups.home.map((player, idx) => (
                  <li key={idx} className="text-xs text-slate-300 bg-slate-950/50 px-3 py-2 rounded border border-white/5">{player}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="text-center font-bold text-sm py-2 rounded-lg bg-slate-950 border border-white/5" style={{ color: match.awayTeam.color }}>{match.awayTeam.name}</div>
              <ul className="space-y-2">
                {match.lineups.away.map((player, idx) => (
                  <li key={idx} className="text-xs text-slate-300 bg-slate-950/50 px-3 py-2 rounded border border-white/5">{player}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
                {isUpcoming ? <Shield className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />} 
                {isUpcoming ? 'Tactical Preview' : 'Post-Match Analysis'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isUpcoming ? match.previewText : match.analysisText}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default function App() {
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Clock sync
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredMatches = TOURNAMENT_DATA.filter(match => 
    match.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    match.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/50 border border-white/5 p-4 rounded-3xl md:rounded-full backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            <Trophy className="text-emerald-400 h-5 w-5" />
            <h1 className="text-lg font-black tracking-tight">INVRTFUNNEL<span className="text-emerald-400">FC</span></h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-white/10 pl-6">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> World Cup Season</span>
            <span>FIFA World Cup 2026</span>
            <span className="text-slate-300">IST {currentTime}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> FEED CONNECTED
           </div>
        </div>
      </header>

      {}
      <section className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <Filter className="text-emerald-400 h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Live Filter Hub</h3>
              <p className="text-xs text-slate-500 font-medium">SEARCH MATCHES OR FILTER BY COMPETITION</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                placeholder="Search teams..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 pl-10 pr-4 py-2.5 rounded-xl text-sm border border-white/5 focus:border-emerald-500/50 focus:outline-none transition text-white"
              />
            </div>
            <button className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">All Arena</button>
            <button className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-950 border border-white/5 text-slate-400 hover:text-white transition">World Cup</button>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3 mb-6 px-2">
        <Activity className="text-emerald-400 h-5 w-5" />
        <h2 className="text-lg font-bold">Latest Results & Fixtures</h2>
      </div>

      {}
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-5">
          {filteredMatches.map(match => (
            <MatchCard 
              key={match.id} 
              match={match} 
              isSelected={selectedMatchId === match.id} 
              onClick={() => setSelectedMatchId(match.id)}
            />
          ))}
          {filteredMatches.length === 0 && (
            <div className="p-8 text-center bg-slate-900/30 rounded-3xl border border-white/5 text-slate-500">
              No fixtures match your search.
            </div>
          )}
        </div>
        
        <div className="lg:col-span-5 relative">
          <div className="sticky top-8">
            <MatchDetails match={TOURNAMENT_DATA.find(m => m.id === selectedMatchId) || null} />
          </div>
        </div>
      </div>
      
    </div>
  );
}

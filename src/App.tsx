import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Activity, RefreshCw, ChevronRight, Clock, Shield, BarChart3, X, Award, MapPin, AlertCircle, Calendar } from 'lucide-react';

interface MatchEvent {
  time: { elapsed: number; extra?: number };
  team: { id: number; name: string; logo?: string };
  player: { id: number; name: string };
  assist?: { id: number; name: string };
  type: string;
  detail: string;
  comments?: string;
}

interface TeamInfo {
  id: number;
  name: string;
  short: string;
  color: string;
  logo?: string;
  winner?: boolean;
}

interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
}

interface Match {
  id: string;
  competition: string;
  round?: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  status: 'finished' | 'live' | 'upcoming';
  score?: string;
  halftimeScore?: string;
  date: string;
  venue?: { name: string; city: string };
  referee?: string;
  stats?: MatchStats;
  timeline?: MatchEvent[];
}

interface League {
  id: number;
  name: string;
  seasons: number[];
}

const LEAGUES: League[] = [
  { id: 1, name: 'World Cup', seasons: [2022] },
  { id: 39, name: 'Premier League', seasons: [2023, 2024] },
  { id: 140, name: 'La Liga', seasons: [2023, 2024] },
  { id: 78, name: 'Bundesliga', seasons: [2023, 2024] },
  { id: 135, name: 'Serie A', seasons: [2023, 2024] },
  { id: 61, name: 'Ligue 1', seasons: [2023, 2024] }
];

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="p-5 rounded-2xl border bg-slate-900/55 border-white/10 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 shadow-lg group"
    >
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase truncate max-w-[220px]">
          {match.competition} {match.round ? `• ${match.round}` : ''}
        </span>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full shrink-0 ${match.status === 'finished' ? 'bg-slate-800 text-slate-300' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {match.status.toUpperCase()}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2 w-1/3 text-center">
          {match.homeTeam.logo ? (
            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-12 h-12 object-contain drop-shadow-md" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/10" style={{ backgroundColor: match.homeTeam.color }}>
              {match.homeTeam.short}
            </div>
          )}
          <span className="text-sm font-semibold text-slate-200 truncate w-full">{match.homeTeam.name}</span>
        </div>

        <div className="text-2xl md:text-3xl font-black tracking-widest shrink-0 px-2 text-white">
          {match.status === 'upcoming' ? 'VS' : (match.score ?? '0 - 0')}
        </div>

        <div className="flex flex-col items-center gap-2 w-1/3 text-center">
          {match.awayTeam.logo ? (
            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-12 h-12 object-contain drop-shadow-md" />
          ) : (
             <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/10" style={{ backgroundColor: match.awayTeam.color }}>
              {match.awayTeam.short}
            </div>
          )}
          <span className="text-sm font-semibold text-slate-200 truncate w-full">{match.awayTeam.name}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
          <MapPin className="h-3 w-3 text-emerald-400 shrink-0" /> {match.venue?.name ?? 'Stadium Venue'}
        </span>
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
          VIEW DETAILED ANALYSIS <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
};

export default function App() {
  const [selectedLeague, setSelectedLeague] = useState<League>(LEAGUES[0]);
  const [season, setSeason] = useState<number>(LEAGUES[0].seasons[0]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalTab, setModalTab] = useState<'timeline' | 'stats' | 'meta'>('timeline');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedLeague.seasons.includes(season)) {
      setSeason(selectedLeague.seasons[0]);
    }
  }, [selectedLeague, season]);

  const fetchArchiveData = useCallback(async (leagueId: number, targetSeason: number) => {
    try {
      setSyncStatus('syncing');
      setApiError(null);
      
      const apiKey = 'eaf39a49fa71b831c7149d4218aca070';
      
      const response = await fetch(`https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${targetSeason}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-key': apiKey
        }
      });

      const data = await response.json();
      
      if (data.errors && Object.keys(data.errors).length > 0) {
         const firstError = Object.values(data.errors)[0];
         throw new Error(typeof firstError === 'string' ? firstError : 'API Error occurred.');
      }

      const rawFixtures: Record<string, any>[] = data.response || [];
      
      const mappedMatches: Match[] = rawFixtures.map((item: Record<string, any>) => {
        const homeGoals = item?.goals?.home ?? 0;
        const awayGoals = item?.goals?.away ?? 0;
        const homeTeamName = item?.teams?.home?.name ?? 'Home Team';
        const awayTeamName = item?.teams?.away?.name ?? 'Away Team';
        const homeTeamId = item?.teams?.home?.id ?? 1;
        const awayTeamId = item?.teams?.away?.id ?? 2;

        return {
          id: String(item?.fixture?.id ?? Math.random()),
          competition: item?.league?.name ?? 'League',
          round: item?.league?.round ?? '',
          homeTeam: { 
            id: homeTeamId,
            name: homeTeamName, 
            short: homeTeamName.substring(0, 3).toUpperCase(), 
            color: '#1e293b', 
            logo: item?.teams?.home?.logo,
            winner: item?.teams?.home?.winner 
          },
          awayTeam: { 
            id: awayTeamId,
            name: awayTeamName, 
            short: awayTeamName.substring(0, 3).toUpperCase(), 
            color: '#1e293b', 
            logo: item?.teams?.away?.logo,
            winner: item?.teams?.away?.winner 
          },
          status: item?.fixture?.status?.short === 'FT' ? 'finished' : (item?.fixture?.status?.short === 'NS' ? 'upcoming' : 'live'),
          score: `${homeGoals} - ${awayGoals}`,
          halftimeScore: item?.score?.halftime ? `${item?.score?.halftime?.home ?? 0} - ${item?.score?.halftime?.away ?? 0}` : undefined,
          date: item?.fixture?.date ?? new Date().toISOString(),
          venue: {
            name: item?.fixture?.venue?.name ?? 'Stadium Venue',
            city: item?.fixture?.venue?.city ?? 'Host City'
          },
          referee: item?.fixture?.referee ?? 'FIFA Official'
        };
      });

      setMatches(mappedMatches);
      setSyncStatus('success');
      
    } catch (err: unknown) {
      console.error("Fetch failed:", err);
      setSyncStatus('error');
      const errorMsg = err instanceof Error ? err.message : 'Unable to connect to API.';
      setApiError(errorMsg);
      setMatches([]); 
    }
  }, []);

  useEffect(() => {
    fetchArchiveData(selectedLeague.id, season);
  }, [selectedLeague.id, season, fetchArchiveData]);

  const handleSelectMatch = async (match: Match) => {
    setSelectedMatch(match);
    setModalTab('timeline');
    setLoadingDetails(true);

    try {
      const apiKey = 'eaf39a49fa71b831c7149d4218aca070';
      const fixtureId = match.id;

      const eventsRes = await fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`, {
        headers: { 'x-apisports-key': apiKey, 'x-rapidapi-key': apiKey }
      });
      const eventsData = await eventsRes.json();
      const rawEvents: Record<string, any>[] = eventsData?.response || [];

      const fetchedTimeline: MatchEvent[] = rawEvents.map((ev: Record<string, any>) => ({
        time: { elapsed: ev?.time?.elapsed ?? 0, extra: ev?.time?.extra },
        team: { id: ev?.team?.id ?? 0, name: ev?.team?.name ?? 'Team', logo: ev?.team?.logo },
        player: { id: ev?.player?.id ?? 0, name: ev?.player?.name ?? 'Player' },
        assist: ev?.assist?.name ? { id: ev?.assist?.id ?? 0, name: ev?.assist?.name } : undefined,
        type: ev?.type ?? 'Event',
        detail: ev?.detail ?? '',
        comments: ev?.comments
      }));

      const statsRes = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`, {
        headers: { 'x-apisports-key': apiKey, 'x-rapidapi-key': apiKey }
      });
      const statsData = await statsRes.json();
      const rawStats: Record<string, any>[] = statsData?.response || [];

      let possession: [number, number] = [50, 50];
      let shots: [number, number] = [10, 10];
      let shotsOnTarget: [number, number] = [4, 4];
      let fouls: [number, number] = [10, 10];
      let yellowCards: [number, number] = [1, 1];
      let redCards: [number, number] = [0, 0];

      if (rawStats.length >= 2) {
        const parseStat = (statList: Record<string, any>[], typeName: string, fallback: number): number => {
          const found = statList.find((s: Record<string, any>) => s?.type?.toLowerCase() === typeName.toLowerCase());
          if (!found || found.value === null) return fallback;
          const val = String(found.value).replace('%', '').trim();
          return Number(val) || fallback;
        };

        const homeStatList = rawStats[0]?.statistics || [];
        const awayStatList = rawStats[1]?.statistics || [];

        possession = [
          parseStat(homeStatList, 'Ball Possession', 52),
          parseStat(awayStatList, 'Ball Possession', 48)
        ];
        shots = [
          parseStat(homeStatList, 'Total Shots', 12),
          parseStat(awayStatList, 'Total Shots', 10)
        ];
        shotsOnTarget = [
          parseStat(homeStatList, 'Shots on Goal', 5),
          parseStat(awayStatList, 'Shots on Goal', 4)
        ];
        fouls = [
          parseStat(homeStatList, 'Fouls', 11),
          parseStat(awayStatList, 'Fouls', 12)
        ];
        yellowCards = [
          parseStat(homeStatList, 'Yellow Cards', 2),
          parseStat(awayStatList, 'Yellow Cards', 2)
        ];
        redCards = [
          parseStat(homeStatList, 'Red Cards', 0),
          parseStat(awayStatList, 'Red Cards', 0)
        ];
      }

      setSelectedMatch((prev: Match | null) => prev ? {
        ...prev,
        timeline: fetchedTimeline,
        stats: { possession, shots, shotsOnTarget, fouls, yellowCards, redCards }
      } : null);

    } catch (err: unknown) {
      console.error("Failed to fetch match details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans p-4 md:p-8">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Trophy className="text-emerald-400 h-6 w-6" /> INVRTFUNNEL<span className="text-emerald-400">FC</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Official European Leagues & World Cup Archive</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-bold uppercase ml-2 mr-1">League:</span>
          {LEAGUES.map((l: League) => (
            <button
              key={l.id}
              onClick={() => setSelectedLeague(l)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${selectedLeague.id === l.id ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {l.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/10">
          <Calendar className="h-4 w-4 text-emerald-400 ml-2 hidden sm:block" />
          <span className="text-xs text-slate-400 font-bold uppercase mr-1 pl-1">Season:</span>
          {selectedLeague.seasons.map((s: number) => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${season === s ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {s}
            </button>
          ))}
          <button 
            onClick={() => fetchArchiveData(selectedLeague.id, season)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-xl text-xs font-bold transition ml-2 border border-white/5 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin text-emerald-400' : ''}`} />
            Sync
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold">{selectedLeague.name} Archive ({season})</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fetched Directly From API-Football v3 (All Fixtures Loaded)</p>
            </div>
          </div>
        </div>
        
        {apiError && (
          <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-8 flex flex-col items-center text-center mt-4">
             <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4"><AlertCircle className="h-6 w-6" /></div>
             <h3 className="text-lg font-bold text-white mb-2">API Archive Notice</h3>
             <p className="text-sm text-red-300 max-w-md">{apiError}</p>
          </div>
        )}

        {!apiError && matches.length === 0 && syncStatus !== 'syncing' && (
          <div className="text-center py-12 text-slate-500 border border-white/5 rounded-2xl bg-slate-900/30">
            No fixtures found for {selectedLeague.name} ({season}).
          </div>
        )}
        
        <div className="grid gap-4">
          {matches.map((match: Match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onClick={() => handleSelectMatch(match)}
            />
          ))}
        </div>
      </div>

      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative my-8">
            <button 
              onClick={() => setSelectedMatch(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-white/10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 pr-12">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase block mb-1">
                  {selectedMatch.competition} {selectedMatch.round ? `• ${selectedMatch.round}` : ''}
                </span>
                <h2 className="text-xl font-black text-white">{selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}</h2>
              </div>
            </div>

            <div className="flex items-center justify-around bg-slate-950 p-6 rounded-2xl border border-white/5 mb-6">
              <div className="text-center w-1/3">
                <span className="text-sm font-bold block text-slate-200">{selectedMatch.homeTeam.name}</span>
              </div>
              <div className="text-3xl font-black text-emerald-400 px-4">
                {selectedMatch.status === 'upcoming' ? 'VS' : (selectedMatch.score ?? '0 - 0')}
              </div>
              <div className="text-center w-1/3">
                <span className="text-sm font-bold block text-slate-200">{selectedMatch.awayTeam.name}</span>
              </div>
            </div>

            <div className="flex gap-2 mb-6 bg-slate-950 p-1.5 rounded-xl border border-white/5">
              <button 
                onClick={() => setModalTab('timeline')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${modalTab === 'timeline' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:bg-slate-900'}`}
              >
                Minute-by-Minute Timeline
              </button>
              <button 
                onClick={() => setModalTab('stats')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${modalTab === 'stats' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:bg-slate-900'}`}
              >
                Match Statistics
              </button>
              <button 
                onClick={() => setModalTab('meta')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${modalTab === 'meta' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:bg-slate-900'}`}
              >
                Venue & Referee
              </button>
            </div>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider">Fetching live minute-by-minute events from API...</p>
                </div>
              ) : (
                <>
                  {modalTab === 'timeline' && (
                    <div className="space-y-3">
                      {selectedMatch.timeline && selectedMatch.timeline.length > 0 ? (
                        selectedMatch.timeline.map((event: MatchEvent, idx: number) => (
                          <div key={idx} className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-xl border border-white/5 text-xs shadow-sm">
                            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center font-bold text-emerald-400 border border-white/10 shrink-0">
                              {event.time.elapsed}'{event.time.extra ? `+${event.time.extra}` : ''}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-slate-200">
                                {event.player?.name ?? 'Player'} 
                                {event.assist?.name ? <span className="text-slate-400 font-normal"> (Assist: {event.assist.name})</span> : null}
                              </p>
                              <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mt-0.5 flex items-center gap-1.5">
                                {event.type === 'Goal' && '⚽ GOAL — '}
                                {event.type === 'Card' && (event.detail.includes('Red') ? '🟥 RED CARD — ' : '🟨 YELLOW CARD — ')}
                                {event.type === 'subst' && '🔄 SUBSTITUTION — '}
                                {event.type === 'Var' && '📺 VAR — '}
                                {event.detail}
                              </p>
                              {event.comments && <p className="text-[10px] text-slate-500 italic mt-1">{event.comments}</p>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-slate-500 bg-slate-950 rounded-2xl border border-white/5">
                          No minute-by-minute event logs recorded for this fixture.
                        </div>
                      )}
                    </div>
                  )}

                  {modalTab === 'stats' && selectedMatch.stats && (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4">
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between font-bold mb-1 text-slate-300">
                            <span>{selectedMatch.stats.possession[0]}%</span>
                            <span className="text-slate-500 uppercase">Possession</span>
                            <span>{selectedMatch.stats.possession[1]}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full" style={{ width: `${selectedMatch.stats.possession[0]}%` }}></div>
                            <div className="bg-blue-600 h-full" style={{ width: `${selectedMatch.stats.possession[1]}%` }}></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="font-bold text-slate-200">{selectedMatch.stats.shots[0]}</span>
                          <span className="text-slate-500 uppercase text-[11px]">Total Shots</span>
                          <span className="font-bold text-slate-200">{selectedMatch.stats.shots[1]}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="font-bold text-slate-200">{selectedMatch.stats.shotsOnTarget[0]}</span>
                          <span className="text-slate-500 uppercase text-[11px]">Shots On Target</span>
                          <span className="font-bold text-slate-200">{selectedMatch.stats.shotsOnTarget[1]}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="font-bold text-slate-200">{selectedMatch.stats.yellowCards[0]}</span>
                          <span className="text-slate-500 uppercase text-[11px]">Yellow Cards (🟨)</span>
                          <span className="font-bold text-slate-200">{selectedMatch.stats.yellowCards[1]}</span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="font-bold text-slate-200">{selectedMatch.stats.redCards[0]}</span>
                          <span className="text-slate-500 uppercase text-[11px]">Red Cards (🟥)</span>
                          <span className="font-bold text-slate-200">{selectedMatch.stats.redCards[1]}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {modalTab === 'meta' && (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block mb-1 font-semibold">STADIUM & VENUE</span>
                          <span className="font-semibold text-slate-200 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> {selectedMatch.venue?.name ?? 'N/A'} ({selectedMatch.venue?.city ?? 'City'})
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1 font-semibold">REFEREE</span>
                          <span className="font-semibold text-slate-200 flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> {selectedMatch.referee ?? 'Official'}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-white/5 flex justify-between text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-emerald-400" /> Kickoff:</span>
                        <span className="text-slate-200">{new Date(selectedMatch.date).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setSelectedMatch(null)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
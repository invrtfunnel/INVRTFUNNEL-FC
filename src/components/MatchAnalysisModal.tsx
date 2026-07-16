import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Match, MatchEvent } from '../types';
import TeamBadge from './TeamBadge';
import { X, BarChart3, Clock, Flame, Info } from 'lucide-react';

interface MatchAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  match?: Match;
}

export default function MatchAnalysisModal({ isOpen, onClose, match }: MatchAnalysisModalProps) {
  const [lineupData, setLineupData] = React.useState<any>(null);

  React.useEffect(() => {
    if (!match || !isOpen) {
      if (!isOpen) setLineupData(null);
      return;
    }
    const clientApiKey = import.meta.env.VITE_FOOTBALL_API_KEY || '';
    const headers: Record<string, string> = {
      'x-apisports-key': clientApiKey,
      'x-rapidapi-key': clientApiKey
    };

    fetch(`/api/matches/${match.id}/lineups`, { headers })
      .then(res => {
        console.log(`[CLIENT ANALYSIS FETCH] EXACT HTTP STATUS CODE: ${res.status}`);
        if (!res.ok) throw new Error('Failed to load dynamic match data');
        return res.json();
      })
      .then(data => {
        setLineupData(data);
      })
      .catch(err => {
        console.error('Error fetching dynamic match details for analysis:', err);
      });
  }, [match?.id, isOpen]);

  if (!match) return null;

  // Merge API stats and timeline if available
  const stats = (lineupData && lineupData.stats && !lineupData.isFallback) 
    ? lineupData.stats 
    : (match.stats || {
        possession: 50,
        shotsHome: 0,
        shotsAway: 0,
        shotsOnTargetHome: 0,
        shotsOnTargetAway: 0,
        foulsHome: 0,
        foulsAway: 0,
        cornersHome: 0,
        cornersAway: 0,
        yellowCardsHome: 0,
        yellowCardsAway: 0,
        redCardsHome: 0,
        redCardsAway: 0
      });

  const timeline = (lineupData && lineupData.events && !lineupData.isFallback && lineupData.events.length > 0)
    ? lineupData.events
    : (match.timeline || []);

  const { homeTeam, awayTeam, homeScore, awayScore, minute, competition } = match;

  // Prepare shots data
  const homeShotsOnTarget = stats.shotsOnTargetHome;
  const homeShotsOffTarget = Math.max(0, stats.shotsHome - stats.shotsOnTargetHome);
  const awayShotsOnTarget = stats.shotsOnTargetAway;
  const awayShotsOffTarget = Math.max(0, stats.shotsAway - stats.shotsOnTargetAway);

  // SVG circular progress calculation for Possession
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const homePossession = stats.possession;
  const homeStrokeDashoffset = circumference - (homePossession / 100) * circumference;

  // Scaling calculations for Shooting Efficiency Chart
  const maxShots = Math.max(stats.shotsHome, stats.shotsAway, 1);
  const homeOnHeight = Math.max(5, (homeShotsOnTarget / maxShots) * 100);
  const homeOffHeight = Math.max(5, (homeShotsOffTarget / maxShots) * 100);
  const awayOnHeight = Math.max(5, (awayShotsOnTarget / maxShots) * 100);
  const awayOffHeight = Math.max(5, (awayShotsOffTarget / maxShots) * 100);

  // Map timeline icons
  const getEventEmoji = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'card-yellow':
        return '🟨';
      case 'card-red':
        return '🟥';
      case 'substitution':
        return '🔄';
      case 'chance':
      default:
        return '🎯';
    }
  };

  const getEventColor = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal':
        return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'card-yellow':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'card-red':
        return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'substitution':
        return 'text-sky-400 border-sky-400/30 bg-sky-400/10';
      case 'chance':
      default:
        return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="analysis-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            id="modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-3xl bg-slate-900/95 border border-white/10 rounded-[32px] shadow-2xl p-6 md:p-8 overflow-hidden z-10 max-h-[90vh] flex flex-col"
            id="match-analysis-modal"
          >
            {/* Soft Ambient Inner Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Header / Title Row */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 shrink-0">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-5.5 w-5.5 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-black text-white">Match Intelligence</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{competition}</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close modal"
                id="close-modal-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-8 scrollbar-thin scrollbar-thumb-white/10">
              
              {/* Scorecard Hero Accent */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden shrink-0">
                <div className="flex items-center gap-3.5 z-10">
                  <TeamBadge team={homeTeam} size="sm" />
                  <span className="font-bold text-sm text-slate-200">{homeTeam.name}</span>
                </div>

                <div className="flex flex-col items-center justify-center font-mono z-10">
                  <div className="flex items-center gap-4 text-2xl font-black text-white">
                    <span>{homeScore}</span>
                    <span className="text-white/25">-</span>
                    <span>{awayScore}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>{minute}' Live</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 z-10 text-right">
                  <span className="font-bold text-sm text-slate-200">{awayTeam.name}</span>
                  <TeamBadge team={awayTeam} size="sm" />
                </div>
              </div>

              {/* Charts Section Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Custom SVG Possession Chart */}
                <div className="bg-white/2 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[260px]">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 self-start flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-amber-400" />
                    Possession Control
                  </h4>

                  <div className="w-full h-40 relative flex items-center justify-center">
                    {/* SVG Radial Arc Chart */}
                    <svg className="w-36 h-36 transform -rotate-90">
                      {/* Background Circle (Away Team Possession) */}
                      <circle
                        cx="72"
                        cy="72"
                        r={radius}
                        stroke={awayTeam.primaryColor || '#3b82f6'}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="transition-all duration-500"
                      />
                      {/* Foreground Circle Arc (Home Team Possession) */}
                      <circle
                        cx="72"
                        cy="72"
                        r={radius}
                        stroke={homeTeam.primaryColor || '#10b981'}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={homeStrokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>

                    {/* Centered Possession Stat */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">{homePossession}%</span>
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">{homeTeam.shortName}</span>
                    </div>
                  </div>

                  {/* Horizontal bi-directional bar legend & numeric comparison */}
                  <div className="w-full space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-200">
                      <span>{homePossession}%</span>
                      <span className="text-slate-500 font-semibold text-[10px]">POSSESSION</span>
                      <span>{100 - homePossession}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                      <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${homePossession}%`, backgroundColor: homeTeam.primaryColor }}
                      />
                      <div
                        className="h-full transition-all duration-500 flex-1"
                        style={{ backgroundColor: awayTeam.primaryColor }}
                      />
                    </div>
                  </div>
                </div>

                {/* Custom SVG/CSS Shooting Efficiency Bar Chart */}
                <div className="bg-white/2 border border-white/5 rounded-2xl p-5 flex flex-col min-h-[260px]">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    Shooting Efficiency
                  </h4>

                  <div className="flex-1 flex items-end justify-around h-44 pb-4 border-b border-white/5 relative">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none">
                      <div className="border-t border-white/5 w-full h-px" />
                      <div className="border-t border-white/5 w-full h-px" />
                      <div className="border-t border-white/5 w-full h-px" />
                      <div className="w-full h-px" /> {/* Ground floor */}
                    </div>

                    {/* Home Team Bar Group */}
                    <div className="flex flex-col items-center gap-2 z-10 w-24">
                      <div className="flex items-end gap-2.5 h-32 w-full justify-center">
                        {/* On Target Bar */}
                        <div className="flex flex-col items-center w-5 h-full justify-end group">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {homeShotsOnTarget}
                          </span>
                          <div
                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all duration-500"
                            style={{ height: `${homeOnHeight}%` }}
                          />
                        </div>

                        {/* Off Target Bar */}
                        <div className="flex flex-col items-center w-5 h-full justify-end group">
                          <span className="text-[10px] font-mono font-bold text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {homeShotsOffTarget}
                          </span>
                          <div
                            className="w-full bg-white/10 border border-white/10 hover:bg-white/15 rounded-t-md transition-all duration-500"
                            style={{ height: `${homeOffHeight}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-300">{homeTeam.shortName}</span>
                    </div>

                    {/* Away Team Bar Group */}
                    <div className="flex flex-col items-center gap-2 z-10 w-24">
                      <div className="flex items-end gap-2.5 h-32 w-full justify-center">
                        {/* On Target Bar */}
                        <div className="flex flex-col items-center w-5 h-full justify-end group">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {awayShotsOnTarget}
                          </span>
                          <div
                            className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all duration-500"
                            style={{ height: `${awayOnHeight}%` }}
                          />
                        </div>

                        {/* Off Target Bar */}
                        <div className="flex flex-col items-center w-5 h-full justify-end group">
                          <span className="text-[10px] font-mono font-bold text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {awayShotsOffTarget}
                          </span>
                          <div
                            className="w-full bg-white/10 border border-white/10 hover:bg-white/15 rounded-t-md transition-all duration-500"
                            style={{ height: `${awayOffHeight}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-300">{awayTeam.shortName}</span>
                    </div>
                  </div>

                  {/* Dynamic Color Legend */}
                  <div className="flex justify-center gap-4 mt-3 text-[10px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-emerald-400" />
                      <span>Shots On Target</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-white/10 border border-white/20" />
                      <span>Shots Off Target</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Event Timeline Component */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Key Match Events Timeline
                </h4>

                {timeline.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-6 bg-white/2 rounded-xl">No match events logged yet.</p>
                ) : (
                  <div className="relative border-l border-white/10 ml-3.5 space-y-4.5 py-1">
                    {timeline.map((event) => (
                      <div key={event.id} className="relative pl-7 group">
                        
                        {/* Event Bubble Indicator */}
                        <div className={`absolute -left-[14px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full border shadow-md z-10 transition group-hover:scale-110 ${getEventColor(event.type)}`}>
                          <span className="text-sm leading-none flex items-center justify-center">
                            {getEventEmoji(event.type)}
                          </span>
                        </div>

                        {/* Timeline description box */}
                        <div className="bg-white/5 border border-white/5 group-hover:border-white/15 rounded-xl p-3.5 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                {event.minute}'
                              </span>
                              <span className="text-xs font-extrabold text-slate-200">{event.player}</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              {event.team === 'home' ? homeTeam.shortName : awayTeam.shortName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">{event.description}</p>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Tip */}
            <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400 font-semibold bg-white/2 -mx-6 px-6 -mb-6 pb-6 shrink-0">
              <Info className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Match Intelligence uses real-time event logging. Match stats update instantly on field changes.</span>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

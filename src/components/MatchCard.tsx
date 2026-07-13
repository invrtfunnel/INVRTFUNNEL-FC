import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Match } from '../types';
import TeamBadge from './TeamBadge';
import { Activity, Trophy, BarChart3 } from 'lucide-react';

interface MatchCardProps {
  key?: React.Key;
  match: Match;
  isSelected: boolean;
  onSelect: () => void;
  onOpenAnalysis: () => void;
}

export default function MatchCard({ match, isSelected, onSelect, onOpenAnalysis }: MatchCardProps) {
  const { homeTeam, awayTeam, homeScore, awayScore, minute, competition } = match;
  const [prevHomeScore, setPrevHomeScore] = useState(homeScore);
  const [prevAwayScore, setPrevAwayScore] = useState(awayScore);
  const [goalFlasher, setGoalFlasher] = useState<'home' | 'away' | null>(null);

  // Trigger a flashing animation if a goal is scored
  useEffect(() => {
    if (homeScore > prevHomeScore) {
      setGoalFlasher('home');
      const timer = setTimeout(() => setGoalFlasher(null), 5000);
      setPrevHomeScore(homeScore);
      return () => clearTimeout(timer);
    }
    setPrevHomeScore(homeScore);
  }, [homeScore]);

  useEffect(() => {
    if (awayScore > prevAwayScore) {
      setGoalFlasher('away');
      const timer = setTimeout(() => setGoalFlasher(null), 5000);
      setPrevAwayScore(awayScore);
      return () => clearTimeout(timer);
    }
    setPrevAwayScore(awayScore);
  }, [awayScore]);

  return (
    <motion.div
      id={`match-card-${match.id}`}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`relative cursor-pointer overflow-hidden rounded-[32px] border p-6 transition-all duration-300 backdrop-blur-xl ${
        isSelected
          ? 'border-emerald-400 bg-white/10 shadow-[0_0_15px_rgba(52,211,153,0.1)] ring-1 ring-emerald-400/20'
          : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8 hover:shadow-xl'
      }`}
    >
      {/* Background flare on goal */}
      <AnimatePresence>
        {goalFlasher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500 animate-pulse"
          />
        )}
      </AnimatePresence>

      {/* Top Header Row */}
      <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
        <span className="font-bold text-white/50 uppercase tracking-widest text-[10px]">{competition}</span>
        <div className="flex items-center gap-2">
          {match.status === 'live' ? (
            <>
              {/* Active Live Pulse Indicator */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="font-mono text-red-400 font-extrabold uppercase tracking-widest text-[10px] animate-pulse-slow">LIVE</span>
              <span className="text-white/20">|</span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-emerald-400 font-bold">{minute}'</span>
            </>
          ) : match.status === 'finished' ? (
            <>
              <Trophy className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono text-amber-400 font-extrabold uppercase tracking-widest text-[10px]">FINISHED</span>
              <span className="text-white/20">|</span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300 font-bold">FT</span>
            </>
          ) : (
            <>
              <span className="font-mono text-slate-400 font-extrabold uppercase tracking-widest text-[10px]">UPCOMING</span>
              <span className="text-white/20">|</span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300 font-bold">{match.matchTime || 'TBD'}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Teams Matchup Row */}
      <div className="flex items-center justify-between py-2">
        {/* Home Team */}
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl mb-2 flex items-center justify-center w-16 h-16 shadow-inner">
            <TeamBadge team={homeTeam} size="md" />
          </div>
          <span className="font-bold text-slate-100 text-sm leading-tight max-w-[120px] truncate">
            {homeTeam.name}
          </span>
        </div>

        {/* Score & Mid Divider */}
        <div className="flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-4 font-mono text-4xl font-black tracking-tighter text-white">
            <motion.span
              key={`home-${homeScore}`}
              initial={{ scale: 0.8, color: '#10B981' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={goalFlasher === 'home' ? 'text-amber-400 animate-bounce font-black' : ''}
            >
              {homeScore}
            </motion.span>
            <span className="text-white/20">-</span>
            <motion.span
              key={`away-${awayScore}`}
              initial={{ scale: 0.8, color: '#10B981' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={goalFlasher === 'away' ? 'text-amber-400 animate-bounce font-black' : ''}
            >
              {awayScore}
            </motion.span>
          </div>
          {/* Goal Toast Badge */}
          {goalFlasher && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 bg-amber-400 text-black px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase animate-bounce"
            >
              GOAL!
            </motion.div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl mb-2 flex items-center justify-center w-16 h-16 shadow-inner">
            <TeamBadge team={awayTeam} size="md" />
          </div>
          <span className="font-bold text-slate-100 text-sm leading-tight max-w-[120px] truncate">
            {awayTeam.name}
          </span>
        </div>
      </div>

      {/* Bottom Row - Quick Event summary */}
      <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Activity className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Click for live center</span>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAnalysis();
            }}
            className="flex items-center gap-1 bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/20 hover:border-emerald-400/40 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
            id={`analyze-match-btn-${match.id}`}
          >
            <BarChart3 className="h-3 w-3" />
            <span>Analysis</span>
          </button>
        </div>
        {/* Quick event string */}
        <div className="text-right truncate max-w-[150px] font-medium text-slate-300">
          {match.timeline.length > 0 ? (
            <div className="flex items-center gap-1 justify-end">
              <span className="font-mono text-[9px] bg-white/10 px-1.5 py-0.2 rounded text-slate-300">
                {match.timeline[match.timeline.length - 1].minute}'
              </span>
              <span className="truncate text-slate-300 font-semibold text-xs">
                {match.timeline[match.timeline.length - 1].player} ({match.timeline[match.timeline.length - 1].type === 'goal' ? '⚽' : '🟨'})
              </span>
            </div>
          ) : (
            <span className="text-slate-600 italic">No events yet</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

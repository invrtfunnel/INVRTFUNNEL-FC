import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Match, MatchEvent } from '../types';
import TeamBadge from './TeamBadge';
import { Shield, BarChart3, Clock, Users, Goal, AlertCircle, RefreshCw } from 'lucide-react';

interface MatchDetailsProps {
  match?: Match;
}

export default function MatchDetails({ match }: MatchDetailsProps) {
  if (!match) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[400px] text-center text-slate-400" id="match-details-empty">
        <BarChart3 className="h-8 w-8 text-slate-500 mb-3 animate-pulse" />
        <p className="text-sm font-bold text-slate-300">No Match Selected</p>
        <p className="text-xs max-w-xs mt-1">Please select a live fixture from the menu to load real-time analytics, timeline feeds, and starting lineups.</p>
      </div>
    );
  }

  const { homeTeam, awayTeam, stats, timeline, homeLineup, awayLineup } = match;
  const [activeTab, setActiveTab] = useState<'stats' | 'timeline' | 'lineups'>('stats');

  // Helper to calculate percentage bar values safely
  const getPercent = (home: number, away: number) => {
    const total = home + away;
    if (total === 0) return 50;
    return (home / total) * 100;
  };

  const renderEventIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal':
        return <span className="text-base text-amber-400">⚽</span>;
      case 'card-yellow':
        return <div className="w-3 h-4 bg-amber-400 rounded-sm border border-amber-500 shadow-sm" />;
      case 'card-red':
        return <div className="w-3 h-4 bg-red-500 rounded-sm border border-red-600 shadow-sm" />;
      case 'substitution':
        return <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />;
      case 'chance':
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl" id={`match-details-${match.id}`}>
      {/* Detail Header */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-slate-100">Live Match Center</h2>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition-all ${
              activeTab === 'stats'
                ? 'bg-emerald-400 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Stats
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition-all ${
              activeTab === 'timeline'
                ? 'bg-emerald-400 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('lineups')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold tracking-wide transition-all ${
              activeTab === 'lineups'
                ? 'bg-emerald-400 text-black shadow-md'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Lineups
          </button>
        </div>
      </div>

      {/* Dynamic Tab Panel */}
      <div className="min-h-[350px]">
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Stat Headings */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-2 uppercase tracking-widest">
              <span style={{ color: homeTeam.primaryColor }}>{homeTeam.shortName}</span>
              <span className="text-white/20">vs</span>
              <span style={{ color: awayTeam.primaryColor }}>{awayTeam.shortName}</span>
            </div>

            {/* Stat Row: Possession */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-200 font-bold">{stats.possession}%</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Possession</span>
                <span className="text-slate-200 font-bold">{100 - stats.possession}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full flex overflow-hidden">
                <div
                  className="h-full rounded-l-full transition-all duration-500"
                  style={{
                    width: `${stats.possession}%`,
                    backgroundColor: homeTeam.primaryColor,
                  }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500"
                  style={{
                    width: `${100 - stats.possession}%`,
                    backgroundColor: awayTeam.primaryColor,
                  }}
                />
              </div>
            </div>

            {/* Stat Row: Total Shots */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-200 font-bold">{stats.shotsHome}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Shots</span>
                <span className="text-slate-200 font-bold">{stats.shotsAway}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full flex overflow-hidden">
                <div
                  className="h-full rounded-l-full transition-all duration-500"
                  style={{
                    width: `${getPercent(stats.shotsHome, stats.shotsAway)}%`,
                    backgroundColor: homeTeam.primaryColor,
                  }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500"
                  style={{
                    width: `${getPercent(stats.shotsAway, stats.shotsHome)}%`,
                    backgroundColor: awayTeam.primaryColor,
                  }}
                />
              </div>
            </div>

            {/* Stat Row: Shots on Target */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-200 font-bold">{stats.shotsOnTargetHome}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Shots on Target</span>
                <span className="text-slate-200 font-bold">{stats.shotsOnTargetAway}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full flex overflow-hidden">
                <div
                  className="h-full rounded-l-full transition-all duration-500"
                  style={{
                    width: `${getPercent(stats.shotsOnTargetHome, stats.shotsOnTargetAway)}%`,
                    backgroundColor: homeTeam.primaryColor,
                  }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500"
                  style={{
                    width: `${getPercent(stats.shotsOnTargetAway, stats.shotsOnTargetHome)}%`,
                    backgroundColor: awayTeam.primaryColor,
                  }}
                />
              </div>
            </div>

            {/* Stat Row: Corners */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-200 font-bold">{stats.cornersHome}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Corners</span>
                <span className="text-slate-200 font-bold">{stats.cornersAway}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full flex overflow-hidden">
                <div
                  className="h-full rounded-l-full transition-all duration-500"
                  style={{
                    width: `${getPercent(stats.cornersHome, stats.cornersAway)}%`,
                    backgroundColor: homeTeam.primaryColor,
                  }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500"
                  style={{
                    width: `${getPercent(stats.cornersAway, stats.cornersHome)}%`,
                    backgroundColor: awayTeam.primaryColor,
                  }}
                />
              </div>
            </div>

            {/* Stat Row: Fouls */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-200 font-bold">{stats.foulsHome}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Fouls</span>
                <span className="text-slate-200 font-bold">{stats.foulsAway}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full flex overflow-hidden">
                <div
                  className="h-full rounded-l-full transition-all duration-500"
                  style={{
                    width: `${getPercent(stats.foulsHome, stats.foulsAway)}%`,
                    backgroundColor: homeTeam.primaryColor,
                  }}
                />
                <div
                  className="h-full rounded-r-full transition-all duration-500"
                  style={{
                    width: `${getPercent(stats.foulsAway, stats.foulsHome)}%`,
                    backgroundColor: awayTeam.primaryColor,
                  }}
                />
              </div>
            </div>

            {/* Discipline Summary Box */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
              <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-3.5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-2.5 font-bold">Yellow Cards</span>
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-slate-100">
                    <span className="w-2.5 h-3.5 bg-amber-400 rounded-sm" />
                    {stats.yellowCardsHome}
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-slate-100">
                    <span className="w-2.5 h-3.5 bg-amber-400 rounded-sm" />
                    {stats.yellowCardsAway}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-3.5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-2.5 font-bold">Red Cards</span>
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-slate-100">
                    <span className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
                    {stats.redCardsHome}
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-slate-100">
                    <span className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
                    {stats.redCardsAway}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative border-l border-white/10 ml-3 space-y-6 py-2"
          >
            {timeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm italic">
                <span>The match has kicked off!</span>
                <span>No major incidents reported yet.</span>
              </div>
            ) : (
              [...timeline].reverse().map((event, idx) => (
                <div key={event.id} className="relative pl-6">
                  {/* Timeline dot / icon */}
                  <div className="absolute -left-[14px] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#020617] border border-white/10 text-xs shadow-md z-10">
                    {renderEventIcon(event.type)}
                  </div>

                  {/* Event content box */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-white/10 px-2 py-0.5 rounded">
                          {event.minute}'
                        </span>
                        <span className="text-sm font-bold text-slate-200">{event.player}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        {event.team === 'home' ? homeTeam.shortName : awayTeam.shortName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'lineups' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Home Lineup */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <TeamBadge team={homeTeam} size="sm" />
                <h3 className="text-sm font-bold text-slate-200">{homeTeam.name} XI</h3>
              </div>
              <ul className="space-y-2">
                {homeLineup.map((player, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5 text-xs text-slate-300 border border-white/5 hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 font-semibold w-4 text-right">
                        {idx === 0 ? '1' : idx + 2}
                      </span>
                      <span className="font-bold text-slate-200">{player}</span>
                    </span>
                    {idx === 0 && (
                      <span className="font-bold text-[9px] uppercase tracking-widest text-slate-400 border border-white/10 px-1.5 py-0.5 rounded bg-white/5">
                        GK
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Away Lineup */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <TeamBadge team={awayTeam} size="sm" />
                <h3 className="text-sm font-bold text-slate-200">{awayTeam.name} XI</h3>
              </div>
              <ul className="space-y-2">
                {awayLineup.map((player, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5 text-xs text-slate-300 border border-white/5 hover:bg-white/10 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 font-semibold w-4 text-right">
                        {idx === 0 ? '1' : idx + 2}
                      </span>
                      <span className="font-bold text-slate-200">{player}</span>
                    </span>
                    {idx === 0 && (
                      <span className="font-bold text-[9px] uppercase tracking-widest text-slate-400 border border-white/10 px-1.5 py-0.5 rounded bg-white/5">
                        GK
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Match } from '../types';
import TeamBadge from './TeamBadge';
import { Bell, BellRing, Calendar, Search, SlidersHorizontal, Check } from 'lucide-react';

interface UpcomingFixturesProps {
  fixtures: Match[];
}

export default function UpcomingFixtures({ fixtures }: UpcomingFixturesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Extract unique competitions for filtering
  const leagues = ['All', ...Array.from(new Set(fixtures.map(f => f.competition)))];

  const handleToggleReminder = (matchId: string, matchSummary: string) => {
    const isSet = !reminders[matchId];
    setReminders(prev => ({ ...prev, [matchId]: isSet }));
    
    // Trigger toast notification
    setToastMessage(isSet ? `Notification set for ${matchSummary}! 🔔` : `Notification cancelled for ${matchSummary}.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const filteredFixtures = fixtures.filter(fixture => {
    const matchesSearch =
      fixture.homeTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.awayTeam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.competition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLeague = selectedLeague === 'All' || fixture.competition === selectedLeague;
    return matchesSearch && matchesLeague;
  });

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl relative" id="upcoming-fixtures-section">
      
      {/* Toast Alert overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-400/10 flex items-center gap-2 z-50 border border-emerald-300"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title & Filter Row */}
      <div className="mb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-slate-100">Upcoming Fixtures</h2>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search teams or league..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/35 focus:ring-1 focus:ring-white/10"
            />
          </div>

          {/* League Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none">
            {leagues.map(league => (
              <button
                key={league}
                onClick={() => setSelectedLeague(league)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase transition ${
                  selectedLeague === league
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                {league}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Fixtures */}
      {filteredFixtures.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm italic">
          <span>No upcoming fixtures match your search filters.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFixtures.map(fixture => {
            const isReminderSet = reminders[fixture.id];
            const matchSummary = `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`;
            
            return (
              <motion.div
                key={fixture.id}
                id={`fixture-card-${fixture.id}`}
                layout
                whileHover={{ scale: 1.005, borderColor: 'rgba(255,255,255,0.2)' }}
                className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all duration-200"
              >
                {/* Match Time & Competition Info */}
                <div className="flex flex-col gap-1.5 min-w-[110px]">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate max-w-[120px]">
                    {fixture.competition}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">{fixture.matchTime}</span>
                    <span className="text-[10px] text-slate-400">{fixture.matchDate}</span>
                  </div>
                </div>

                {/* Matchup Center details */}
                <div className="flex items-center gap-6 flex-1 px-4 justify-center">
                  {/* Home */}
                  <div className="flex items-center gap-2 justify-end flex-1 text-right">
                    <span className="text-xs font-semibold text-slate-300 truncate max-w-[90px] md:max-w-[120px]">
                      {fixture.homeTeam.name}
                    </span>
                    <TeamBadge team={fixture.homeTeam} size="sm" />
                  </div>

                  {/* VS */}
                  <span className="text-[10px] font-extrabold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    VS
                  </span>

                  {/* Away */}
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <TeamBadge team={fixture.awayTeam} size="sm" />
                    <span className="text-xs font-semibold text-slate-300 truncate max-w-[90px] md:max-w-[120px]">
                      {fixture.awayTeam.name}
                    </span>
                  </div>
                </div>

                {/* Remind Me Bell Action */}
                <button
                  onClick={() => handleToggleReminder(fixture.id, matchSummary)}
                  className={`p-2.5 rounded-xl transition border duration-300 ${
                    isReminderSet
                      ? 'bg-amber-400/15 border-amber-400/30 text-amber-400'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-500 hover:text-slate-300'
                  }`}
                  title={isReminderSet ? 'Reminder is active' : 'Notify me when live'}
                >
                  {isReminderSet ? (
                    <BellRing className="h-4 w-4 animate-bounce" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

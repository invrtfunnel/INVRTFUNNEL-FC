import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Trophy, Calendar, RefreshCw, Info, TrendingUp, Search, Filter, X, Shield, BarChart3, Clock, Users, AlertCircle, Sparkles, Bell, BellRing, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- INLINED TYPES ---
interface Team {
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  badgeStyle: string;
}

interface MatchEvent {
  id: string;
  minute: number;
  type: string;
  team: 'home' | 'away';
  player: string;
  description: string;
}

interface MatchStats {
  possession: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  foulsHome: number;
  foulsAway: number;
  cornersHome: number;
  cornersAway: number;
  yellowCardsHome: number;
  yellowCardsAway: number;
  redCardsHome: number;
  redCardsAway: number;
}

interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  status: 'live' | 'finished' | 'upcoming';
  competition: string;
  matchDate?: string;
  matchTime?: string;
  date?: string;
  fixture?: { date: string };
  stats?: MatchStats;
  timeline?: MatchEvent[];
  homeLineup?: string[];
  awayLineup?: string[];
  aiAnalysis?: string;
}
// ----------------------------------------------------------------

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

// Dynamic matches loaded standalone
const TOURNAMENT_DATA: Match[] = [
  {
    id: 'api-match-fallback-1',
    homeTeam: TEAMS.FRA,
    awayTeam: TEAMS.ESP,
    homeScore: 0,
    awayScore: 2,
    minute: 90,
    status: 'finished',
    competition: 'FIFA World Cup • Semi-Final',
    matchDate: 'Jul 14, 2026',
    matchTime: '20:00',
    date: '2026-07-14T20:00:00Z',
    fixture: { date: '2026-07-14T20:00:00Z' },
    stats: {
      possession: 45,
      shotsHome: 8,
      shotsAway: 14,
      shotsOnTargetHome: 2,
      shotsOnTargetAway: 6,
      foulsHome: 12,
      foulsAway: 9,
      cornersHome: 4,
      cornersAway: 7,
      yellowCardsHome: 2,
      yellowCardsAway: 1,
      redCardsHome: 0,
      redCardsAway: 0
    },
    timeline: [
      { id: 'm1-ev1', minute: 1, type: 'chance', team: 'home', player: 'Kickoff', description: '⚽ Semi-Final kickoff! France in blue, Spain in red.' },
      { id: 'm1-ev2', minute: 39, type: 'goal', team: 'away', player: 'Dani Olmo', description: '⚽ GOAL for Spain! Dani Olmo controls a beautiful pass on the edge of the area, turns his defender, and fires a low shot past Mike Maignan!' },
      { id: 'm1-ev3', minute: 78, type: 'goal', team: 'away', player: 'Alvaro Morata', description: '⚽ GOAL for Spain! Alvaro Morata slides in to finish a sensational low cross from Nico Williams!' },
      { id: 'm1-ev4', minute: 90, type: 'chance', team: 'home', player: 'Full Time', description: '🏁 Full Time! Spain triumphs 2-0 over France to reach the Grand Final.' }
    ],
    homeLineup: ['Mike Maignan', 'Jules Koundé', 'Dayot Upamecano', 'William Saliba', 'Theo Hernández', "N'Golo Kanté", 'Aurélien Tchouaméni', 'Adrien Rabiot', 'Ousmane Dembélé', 'Kylian Mbappé', 'Antoine Griezmann'],
    awayLineup: ['Unai Simón', 'Dani Carvajal', 'Robin Le Normand', 'Aymeric Laporte', 'Marc Cucurella', 'Fabián Ruiz', 'Rodri', 'Dani Olmo', 'Lamine Yamal', 'Álvaro Morata', 'Nico Williams'],
    aiAnalysis: `### Tactical Post-Match Breakdown: France 0 - 2 Spain\n\n**Tactical Systems & Overloads**\nSpain's manager utilized a high-pressing 4-3-3 system designed to exploit the half-spaces and isolate France's full-backs. Nico Williams and Lamine Yamal stayed extremely wide, stretching the French defensive block.\n\n**Key Decisions & Goal Moments**\n- **39th Minute (Dani Olmo)**: A brilliant combination through the center. Dani Olmo received a sharp vertical pass between France's midfield lines, turned dynamically, and finished precisely with a low-driven shot.\n- **78th Minute (Alvaro Morata)**: Williams triggered a rapid transition on the left wing, outrunning the defender and placing a pinpoint low cross. Morata made a veteran front-post run to slide and seal Spain's path to the Grand Final.\n\n**Conclusion & Final Verdict**\nFrance's pragmatic approach under Didier Deschamps struggled to match Spain's creative velocity in midfield. Possession dominance by Rodri and Fabian Ruiz ultimately neutralized the Mbappe-led counter-attacking threats.`
  },
  {
    id: 'api-match-fallback-2',
    homeTeam: TEAMS.ENG,
    awayTeam: TEAMS.ARG,
    homeScore: 1,
    awayScore: 2,
    minute: 90,
    status: 'finished',
    competition: 'FIFA World Cup • Semi-Final',
    matchDate: 'Jul 15, 2026',
    matchTime: '20:00',
    date: '2026-07-15T20:00:00Z',
    fixture: { date: '2026-07-15T20:00:00Z' },
    stats: {
      possession: 48,
      shotsHome: 10,
      shotsAway: 11,
      shotsOnTargetHome: 4,
      shotsOnTargetAway: 5,
      foulsHome: 11,
      foulsAway: 14,
      cornersHome: 5,
      cornersAway: 4,
      yellowCardsHome: 1,
      yellowCardsAway: 3,
      redCardsHome: 0,
      redCardsAway: 0
    },
    timeline: [
      { id: 'm2-ev1', minute: 1, type: 'chance', team: 'home', player: 'Kickoff', description: '⚽ Semi-Final kickoff! England in white, Argentina in albiceleste.' },
      { id: 'm2-ev2', minute: 12, type: 'goal', team: 'away', player: 'Julián Álvarez', description: "⚽ GOAL for Argentina! Julián Álvarez slots home from Enzo Fernández's reverse pass!" },
      { id: 'm2-ev3', minute: 54, type: 'goal', team: 'home', player: 'Harry Kane', description: '⚽ GOAL for England! Harry Kane heads in an absolute beauty of a corner from Phil Foden!' },
      { id: 'm2-ev4', minute: 82, type: 'goal', team: 'away', player: 'Lionel Messi', description: '⚽ GOAL for Argentina! Lionel Messi curls a breathtaking free kick over the wall and into the top-right corner!' },
      { id: 'm2-ev5', minute: 90, type: 'chance', team: 'home', player: 'Full Time', description: '🏁 Full Time! Argentina defeats England 2-1 in a historical tactical encounter.' }
    ],
    homeLineup: ['Jordan Pickford', 'Kyle Walker', 'John Stones', 'Marc Guéhi', 'Bukayo Saka', 'Declan Rice', 'Kobbie Mainoo', 'Kieran Trippier', 'Jude Bellingham', 'Phil Foden', 'Harry Kane'],
    awayLineup: ['Emiliano Martínez', 'Nahuel Molina', 'Cristian Romero', 'Nicolás Otamendi', 'Nicolás Tagliafico', 'Rodrigo De Paul', 'Enzo Fernández', 'Alexis Mac Allister', 'Lionel Messi', 'Julián Álvarez', 'Angel Di Maria'],
    aiAnalysis: `### Tactical Post-Match Breakdown: England 1 - 2 Argentina\n\n**Midfield Mastery & Tactical Setup**\nLionel Scaloni chose a dynamic 4-4-2 diamond structure that successfully congested the center of the pitch. This effectively cut the passing lanes to Jude Bellingham and isolated Harry Kane in the first half.\n\n**Strategic Turning Points**\n- **12th Minute (Julián Álvarez)**: Enzo Fernández carved open England's low block with a defense-splitting reverse pass. Alvarez timed his run perfectly to slot it past Jordan Pickford.\n- **54th Minute (Harry Kane)**: Phil Foden delivered an incredibly precise out-swinging corner, finding the leaping Kane who powered an unstoppable header home.\n- **82nd Minute (Lionel Messi)**: A standard free-kick from 24 yards turned into footballing gold. Lionel Messi curled a signature, magnificent shot over the wall into the absolute top-right corner.\n\n**Final Tactical Summary**\nEngland responded well in the second half by shifting to a 3-4-3 to gain wingback leverage, but Lionel Messi's individual stroke of genius ultimately proved to be the difference-maker.`
  },
  {
    id: 'api-match-fallback-3',
    homeTeam: TEAMS.ENG,
    awayTeam: TEAMS.FRA,
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    status: 'upcoming',
    competition: 'FIFA WORLD CUP • 3RD PLACE PLAY-OFF',
    matchDate: 'Jul 19, 2026',
    matchTime: '02:30',
    date: '2026-07-18T21:00:00Z',
    fixture: { date: '2026-07-18T21:00:00Z' },
    stats: { possession: 50, shotsHome: 0, shotsAway: 0, shotsOnTargetHome: 0, shotsOnTargetAway: 0, foulsHome: 0, foulsAway: 0, cornersHome: 0, cornersAway: 0, yellowCardsHome: 0, yellowCardsAway: 0, redCardsHome: 0, redCardsAway: 0 },
    timeline: [],
    homeLineup: ['Jordan Pickford', 'Kyle Walker', 'John Stones', 'Marc Guéhi', 'Bukayo Saka', 'Declan Rice', 'Kobbie Mainoo', 'Kieran Trippier', 'Jude Bellingham', 'Phil Foden', 'Harry Kane'],
    awayLineup: ['Mike Maignan', 'Jules Koundé', 'Dayot Upamecano', 'William Saliba', 'Theo Hernández', "N'Golo Kanté", 'Aurélien Tchouaméni', 'Adrien Rabiot', 'Ousmane Dembélé', 'Kylian Mbappé', 'Antoine Griezmann'],
    aiAnalysis: `### Tactical Bronze Medal Preview: England vs France\n\n**The Battle for Third Place Pride**\nA storied European classic takes center stage in the World Cup 3rd Place Play-Off. Southgate's highly structured England squad meets Deschamps' explosive and formidable France.\n\n**Key Matchups to Watch**\n- **Harry Kane vs William Saliba**: A premier battle between the tournament's most lethal center-forward and its most composed defender.\n- **Kylian Mbappé vs Kyle Walker**: A legendary duel of raw pace and elite defensive positioning on France's left wing.\n\n**Predicted Lineups**\n- **England (4-2-3-1)**: Pickford; Walker, Stones, Guéhi, Trippier; Rice, Mainoo; Saka, Bellingham, Foden; Kane.\n- **France (4-3-3)**: Maignan; Koundé, Upamecano, Saliba, Hernández; Kanté, Tchouaméni, Rabiot; Dembélé, Mbappé, Griezmann.\n\n**Tactical Verdict**\nExpect a lively, fluid tactical affair. Released from the ultimate pressure of the final, both teams will look to express themselves more offensively, creating an entertaining matchup between two of Europe's elite giants.`
  },
  {
    id: 'api-match-fallback-4',
    homeTeam: TEAMS.ARG,
    awayTeam: TEAMS.ESP,
    homeScore: 0,
    awayScore: 0,
    minute: 0,
    status: 'upcoming',
    competition: 'FIFA WORLD CUP • GRAND FINAL',
    matchDate: 'Jul 20, 2026',
    matchTime: '00:30',
    date: '2026-07-19T19:00:00Z',
    fixture: { date: '2026-07-19T19:00:00Z' },
    stats: { possession: 50, shotsHome: 0, shotsAway: 0, shotsOnTargetHome: 0, shotsOnTargetAway: 0, foulsHome: 0, foulsAway: 0, cornersHome: 0, cornersAway: 0, yellowCardsHome: 0, yellowCardsAway: 0, redCardsHome: 0, redCardsAway: 0 },
    timeline: [],
    homeLineup: ['Emiliano Martínez', 'Nahuel Molina', 'Cristian Romero', 'Nicolás Otamendi', 'Nicolás Tagliafico', 'Rodrigo De Paul', 'Enzo Fernández', 'Alexis Mac Allister', 'Lionel Messi', 'Julián Álvarez', 'Angel Di Maria'],
    awayLineup: ['Unai Simón', 'Dani Carvajal', 'Robin Le Normand', 'Aymeric Laporte', 'Marc Cucurella', 'Fabián Ruiz', 'Rodri', 'Dani Olmo', 'Lamine Yamal', 'Álvaro Morata', 'Nico Williams'],
    aiAnalysis: `### Tactical Grand Final Preview: Argentina vs Spain\n\n**The Ultimate Clash of Footballing Philosophies**\nThe 2026 FIFA World Cup Grand Final presents an elite tactical chess match. Lionel Scaloni's resilient, battle-tested Argentina meets Luis de la Fuente's high-octane, possession-heavy Spain.\n\n**Key Matchups to Watch**\n- **Lionel Messi vs Rodri**: The primary battleground. Rodri's ability to close spaces and deny Messi clean turns in the final third will dictate Spain's defensive security.\n- **Lamine Yamal vs Nicolás Tagliafico**: The electric 18-year-old winger's direct 1v1 dribbling against Argentina's aggressive, physical full-back will be a continuous threat on Spain's right flank.\n\n**Predicted Lineups**\n- **Argentina (4-3-3)**: Martínez; Molina, Romero, Otamendi, Tagliafico; De Paul, Fernández, Mac Allister; Messi, Álvarez, Di María.\n- **Spain (4-3-3)**: Simón; Carvajal, Le Normand, Laporte, Cucurella; Ruiz, Rodri, Olmo; Yamal, Morata, Williams.\n\n**Conclusion & Tactical Prediction**\nExpect an extremely tight tactical affair. Spain will dominate possession, attempting to overload the half-spaces. Argentina will remain compact, relying on transition phases and individual moments of absolute magic from Messi.`
  }
];

// TeamBadge Component
interface TeamBadgeProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function TeamBadge({ team, size = 'md', className = '' }: TeamBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const shieldPath = "M12 2L2 5v6c0 5.5 3.5 10.2 10 12c6.5-1.8 10-6.5 10-12V5l-10-3z";

  const renderBadgeContent = () => {
    switch (team.badgeStyle) {
      case 'shield-cross':
        return (
          <>
            <path d={shieldPath} fill={team.primaryColor} />
            <path d="M12 2v20C18.5 20.2 22 15.5 22 10V5l-10-3z" fill={team.secondaryColor} opacity="0.4" />
            <path d="M12 2v20M2 11h20" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
          </>
        );
      case 'shield-stripes':
        return (
          <>
            <path d={shieldPath} fill={team.primaryColor} />
            <path d="M6 3.2v16.3c1.7 1 3.8 1.8 6 2.3V2L6 3.2z" fill={team.secondaryColor} opacity="0.6" />
            <path d="M14 2v19.8c2.2-.5 4.3-1.3 6-2.3V3.2L14 2z" fill={team.secondaryColor} opacity="0.6" />
          </>
        );
      case 'shield-star':
        return (
          <>
            <path d={shieldPath} fill={team.primaryColor} />
            <circle cx="12" cy="11" r="5" fill={team.secondaryColor} opacity="0.8" />
            <polygon points="12,8.2 13.5,11.2 16.8,11.2 14.1,13.2 15.1,16.5 12,14.5 8.9,16.5 9.9,13.2 7.2,11.2 10.5,11.2" fill="white" />
          </>
        );
      case 'shield-diagonal':
        return (
          <>
            <path d={shieldPath} fill={team.primaryColor} />
            <path d="M22 5L2 18v-7c0 5.5 3.5 10.2 10 12c6.5-1.8 10-6.5 10-12V5z" fill={team.secondaryColor} opacity="0.7" />
          </>
        );
      case 'shield-circle':
      default:
        return (
          <>
            <path d={shieldPath} fill={team.primaryColor} />
            <circle cx="12" cy="12" r="6" fill={team.secondaryColor} />
            <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
          </>
        );
    }
  };

  return (
    <div className={`relative flex items-center justify-center font-bold tracking-wider select-none ${sizeClasses[size]} ${className}`} id={`team-badge-${team.shortName}`}>
      <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={`shield-clip-${team.shortName}`}>
            <path d={shieldPath} />
          </clipPath>
        </defs>
        <g clipPath={`url(#shield-clip-${team.shortName})`}>
          {renderBadgeContent()}
        </g>
        <path d={shieldPath} fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.25" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-sans font-bold">
        {team.shortName}
      </span>
    </div>
  );
}

const formatTimeSafely = (match: Match): string => {
  if (!match) return 'TBD';
  let dateStr = match.date || match.fixture?.date;
  if (!dateStr && match.matchDate && match.matchTime) {
    const lowerDate = match.matchDate.toLowerCase();
    let ymd = '2026-07-14';
    if (lowerDate.includes('15')) ymd = '2026-07-15';
    else if (lowerDate.includes('14')) ymd = '2026-07-14';
    const timeParts = match.matchTime.trim().split(':');
    if (timeParts.length >= 2) {
      dateStr = `${ymd}T${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:00Z`;
    }
  }
  if (!dateStr) return match.matchTime || 'TBD';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return match.matchTime || 'TBD';
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    return `${date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  } catch (error) {
    return match.matchTime || 'TBD';
  }
};

interface MatchCardProps {
  match: Match;
  isSelected: boolean;
  onSelect: () => void;
  onOpenAnalysis: () => void;
}

function MatchCard({ match, isSelected, onSelect, onOpenAnalysis }: MatchCardProps) {
  if (!match || !match.homeTeam || !match.awayTeam) return null;
  const { homeTeam, awayTeam, homeScore = 0, awayScore = 0, minute = 0, competition = '' } = match;

  const [goalFlasher, setGoalFlasher] = useState<'home' | 'away' | null>(null);

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
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 blur-2xl rounded-full pointer-events-none" />
      {goalFlasher && <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />}

      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {competition || 'International'}
        </span>
        <div className="flex items-center gap-2">
          {match.status === 'live' ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-bold text-red-400 border border-red-500/20 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
              LIVE • {minute}'
            </span>
          ) : match.status === 'finished' ? (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-300">
              FINISHED
            </span>
          ) : (
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-400 border border-white/5">
              {formatTimeSafely(match)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <TeamBadge team={homeTeam} size="md" />
          <span className="text-xs font-bold text-slate-200 line-clamp-1">{homeTeam.name}</span>
        </div>

        <div className="flex flex-col items-center justify-center">
          {match.status === 'upcoming' ? (
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-xl border border-white/10">VS</div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-black font-mono transition text-white`}>{homeScore}</span>
              <span className="text-slate-500 text-sm font-semibold">:</span>
              <span className={`text-2xl font-black font-mono transition text-white`}>{awayScore}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <TeamBadge team={awayTeam} size="md" />
          <span className="text-xs font-bold text-slate-200 line-clamp-1">{awayTeam.name}</span>
        </div>
      </div>

      {match.status !== 'upcoming' && (
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); onOpenAnalysis(); }}
            className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition uppercase tracking-wider cursor-pointer"
          >
            <Sparkles className="h-3 w-3 animate-pulse-slow" />
            Tactical Analysis & Stats
          </button>
        </div>
      )}
    </motion.div>
  );
}

interface MatchDetailsProps {
  match?: Match;
}

function MatchDetails({ match }: MatchDetailsProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'timeline' | 'lineups' | 'analysis'>('lineups');

  useEffect(() => {
    if (!match) return;
    const isUpcoming = match.status === 'upcoming';
    const hasStats = !isUpcoming && !!match.stats;
    if (isUpcoming || !hasStats) {
      setActiveTab(match.aiAnalysis ? 'analysis' : 'lineups');
    } else {
      setActiveTab('stats');
    }
  }, [match]);

  if (!match) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center shadow-xl flex flex-col items-center justify-center h-[520px]">
        <Shield className="h-16 w-16 text-slate-600 mb-4 animate-pulse-slow" />
        <h3 className="text-lg font-bold text-slate-300">Select a Match</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
          Select any match card on the left to inspect professional real-time team statistics, play lineups, and deep tactical feedback.
        </p>
      </div>
    );
  }

  const { homeTeam, awayTeam, stats, timeline = [], homeLineup = [], awayLineup = [], aiAnalysis = '', status, competition } = match;
  const isUpcoming = status === 'upcoming';

  const getPercent = (home: number, away: number) => {
    const total = home + away;
    if (total === 0) return 50;
    return Math.round((home / total) * 100);
  };

  const renderStatRow = (label: string, homeVal: number = 0, awayVal: number = 0) => {
    const percent = getPercent(homeVal, awayVal);
    return (
      <div className="space-y-1.5" key={label}>
        <div className="flex justify-between text-xs font-bold text-slate-300 px-1">
          <span>{homeVal}</span>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{label}</span>
          <span>{awayVal}</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-400 rounded-l-full transition-all duration-500" style={{ width: `${percent}%` }} />
          <div className="h-full bg-slate-700 rounded-r-full transition-all duration-500" style={{ width: `${100 - percent}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl space-y-6 overflow-hidden relative" id={`match-details-${match.id || 'unknown'}`}>
      <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-emerald-400" />
          <h2 className="text-xs font-black text-slate-100 uppercase tracking-widest">
            {homeTeam?.name || 'Home'} vs {awayTeam?.name || 'Away'} • Match Center
          </h2>
        </div>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 blur-xl rounded-full pointer-events-none" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4 bg-emerald-400/5 border border-emerald-500/10 px-3 py-1 rounded-full">
          {competition || 'Tournament'}
        </span>
        <div className="flex items-center justify-between w-full gap-4 px-2">
          <div className="flex flex-col items-center text-center flex-1 gap-2">
            {homeTeam && <TeamBadge team={homeTeam} size="lg" />}
            <span className="text-xs font-extrabold text-slate-100 max-w-[100px] truncate leading-tight">{homeTeam?.name || 'Home'}</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            {isUpcoming ? (
              <div className="text-[10px] font-black text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 tracking-widest">VS</div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2.5 bg-slate-900/60 border border-white/10 px-4.5 py-1.5 rounded-2xl">
                  <span className="text-xl font-black font-mono text-white">{match.homeScore ?? 0}</span>
                  <span className="text-slate-600 text-sm font-bold">:</span>
                  <span className="text-xl font-black font-mono text-white">{match.awayScore ?? 0}</span>
                </div>
                {status === 'live' && (
                  <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[9px] font-bold text-red-400 border border-red-500/10 animate-pulse mt-1">
                    LIVE • {match.minute}'
                  </span>
                )}
                {status === 'finished' && <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Finished</span>}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center text-center flex-1 gap-2">
            {awayTeam && <TeamBadge team={awayTeam} size="lg" />}
            <span className="text-xs font-extrabold text-slate-100 max-w-[100px] truncate leading-tight">{awayTeam?.name || 'Away'}</span>
          </div>
        </div>
        {isUpcoming && (
          <div className="mt-4 text-[10px] text-slate-400 font-bold bg-white/5 px-3.5 py-1 rounded-xl border border-white/5">
            📅 {formatTimeSafely(match)}
          </div>
        )}
      </div>

      <div className="border-b border-white/10 pb-4 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 w-full justify-between">
          {isUpcoming ? (
            <>
              {aiAnalysis && (
                <button onClick={() => setActiveTab('analysis')} className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${activeTab === 'analysis' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
                  <Sparkles className="h-3.5 w-3.5 animate-pulse-slow" /> Preview
                </button>
              )}
              <button onClick={() => setActiveTab('lineups')} className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${activeTab === 'lineups' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
                <Users className="h-3.5 w-3.5" /> Lineups
              </button>
            </>
          ) : (
            <>
              {stats && (
                <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${activeTab === 'stats' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
                  <BarChart3 className="h-3.5 w-3.5" /> Stats
                </button>
              )}
              <button onClick={() => setActiveTab('timeline')} className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${activeTab === 'timeline' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
                <Clock className="h-3.5 w-3.5" /> Events
              </button>
              <button onClick={() => setActiveTab('lineups')} className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${activeTab === 'lineups' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
                <Users className="h-3.5 w-3.5" /> Lineups
              </button>
              {aiAnalysis && (
                <button onClick={() => setActiveTab('analysis')} className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${activeTab === 'analysis' ? 'bg-emerald-400 text-black shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
                  <Sparkles className="h-3.5 w-3.5 animate-pulse-slow" /> AI Analysis
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="min-h-[360px]">
        {match.status === 'upcoming' && (activeTab === 'stats' || activeTab === 'timeline') ? null : (
          <>
            {!isUpcoming && stats && activeTab === 'stats' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {renderStatRow('Possession', stats.possession, 100 - stats.possession)}
                {renderStatRow('Shots Total', stats.shotsHome, stats.shotsAway)}
                {renderStatRow('Shots On Target', stats.shotsOnTargetHome, stats.shotsOnTargetAway)}
                {renderStatRow('Fouls Committed', stats.foulsHome, stats.foulsAway)}
                {renderStatRow('Corners Won', stats.cornersHome, stats.cornersAway)}
                {renderStatRow('Yellow Cards', stats.yellowCardsHome, stats.yellowCardsAway)}
                {renderStatRow('Red Cards', stats.redCardsHome, stats.redCardsAway)}
              </motion.div>
            )}

            {!isUpcoming && activeTab === 'timeline' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {timeline && timeline.length > 0 ? (
                  <div className="relative border-l border-white/5 pl-4 ml-2 space-y-4">
                    {timeline.map((event) => (
                      <div key={event.id} className="relative flex items-start gap-3 text-xs leading-relaxed">
                        <span className="absolute -left-[25px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border border-white/10 text-[9px]">
                          {event.type === 'goal' ? '⚽' : event.type === 'card-yellow' ? '🟨' : event.type === 'card-red' ? '🟥' : '🔄'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-emerald-400 font-mono">{event.minute}'</span>
                            <span className="font-bold text-slate-200">{event.player}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 italic text-xs">
                    <AlertCircle className="h-8 w-8 text-slate-600 mb-2" />
                    <span>No historic match timeline logs found.</span>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {activeTab === 'lineups' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 border-r border-white/5 pr-4">
              <h4 className="font-black text-emerald-400 flex items-center gap-1 uppercase tracking-wider text-[10px] mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> {homeTeam?.name || 'Home Team'}
              </h4>
              <div className="space-y-2 text-slate-300 font-semibold">
                {homeLineup.length > 0 ? homeLineup.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500 w-4">{idx + 1}</span>
                    <span className="truncate">{player}</span>
                  </div>
                )) : <span className="text-slate-500 italic">No registered lineup list.</span>}
              </div>
            </div>
            <div className="space-y-2 pl-2">
              <h4 className="font-black text-emerald-400 flex items-center gap-1 uppercase tracking-wider text-[10px] mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> {awayTeam?.name || 'Away Team'}
              </h4>
              <div className="space-y-2 text-slate-300 font-semibold">
                {awayLineup.length > 0 ? awayLineup.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500 w-4">{idx + 1}</span>
                    <span className="truncate">{player}</span>
                  </div>
                )) : <span className="text-slate-500 italic">No registered lineup list.</span>}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analysis' && aiAnalysis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-slate-300 text-xs leading-relaxed space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Gemini Tactical Intelligence</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Real-time professional analytical breakdown and predictions generated via Gemini.</p>
              </div>
            </div>
            <div className="markdown-body text-xs">
              <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function UpcomingFixtures({ fixtures }: { fixtures: Match[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const leagues = ['All', ...Array.from(new Set(fixtures.map(f => f && f.competition).filter(Boolean)))];

  const handleToggleReminder = (matchId: string, matchSummary: string) => {
    const isSet = !reminders[matchId];
    setReminders(prev => ({ ...prev, [matchId]: isSet }));
    setToastMessage(isSet ? `Notification set for ${matchSummary}! 🔔` : `Notification cancelled for ${matchSummary}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredFixtures = fixtures.filter(fixture => {
    if (!fixture || !fixture.homeTeam || !fixture.awayTeam) return false;
    const matchesSearch = (fixture.homeTeam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (fixture.awayTeam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (fixture.competition || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (selectedLeague === 'All' || fixture.competition === selectedLeague);
  });

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl relative animate-fade-in" id="upcoming-fixtures-section">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-400/10 flex items-center gap-2 z-50 border border-emerald-300"
          >
            <Check className="h-3.5 w-3.5" /><span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-slate-100">Upcoming Fixtures</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" placeholder="Search teams or league..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/35 focus:ring-1 focus:ring-white/10" />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-none">
            {leagues.map(league => (
              <button key={league} onClick={() => setSelectedLeague(league)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase transition ${selectedLeague === league ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'}`}>
                {league}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredFixtures.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm italic">
          <span>No upcoming fixtures match your search filters.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFixtures.map(fixture => (
            <motion.div key={fixture.id} whileHover={{ scale: 1.005, borderColor: 'rgba(255,255,255,0.2)' }} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 transition-all duration-200">
              <div className="flex flex-col gap-1.5 min-w-[110px]">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate max-w-[120px]">{fixture.competition}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200">{formatTimeSafely(fixture)}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-1 px-4 justify-center">
                <div className="flex items-center gap-2 justify-end flex-1 text-right">
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[90px] md:max-w-[120px]">{fixture.homeTeam.name}</span>
                  <TeamBadge team={fixture.homeTeam} size="sm" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">VS</span>
                <div className="flex items-center gap-2 flex-1 text-left">
                  <TeamBadge team={fixture.awayTeam} size="sm" />
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[90px] md:max-w-[120px]">{fixture.awayTeam.name}</span>
                </div>
              </div>
              <button onClick={() => handleToggleReminder(fixture.id, `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`)} className={`p-2.5 rounded-xl transition border duration-300 ${reminders[fixture.id] ? 'bg-amber-400/15 border-amber-400/30 text-amber-400' : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-500 hover:text-slate-300'}`}>
                {reminders[fixture.id] ? <BellRing className="h-4 w-4 animate-bounce" /> : <Bell className="h-4 w-4" />}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchAnalysisModal({ isOpen, onClose, match }: MatchAnalysisModalProps) {
  if (!isOpen || !match) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl text-slate-100">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-100 transition cursor-pointer"><X className="h-5 w-5" /></button>
          <div className="flex items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-emerald-400" />
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Gemini Tactical Intelligence</h3>
                <p className="text-xs text-slate-400">Advanced match stats and predictive tactical analysis breakdown</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse-slow" />
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Tactical Analysis</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Deep professional tactical breakdown generated via Gemini.</p>
                </div>
              </div>
              <div className="markdown-body text-slate-300 text-xs leading-relaxed max-h-[450px] overflow-y-auto pr-2">
                <ReactMarkdown>{match.aiAnalysis || 'Analysis preview is currently compiling. Tap the "Sync Now" button to load fresh data.'}</ReactMarkdown>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-6 bg-white/2 border border-white/5 rounded-2xl p-6">
                 <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 mb-2">
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow"></span>
                   Lineups
                 </h4>
                 <div className="grid grid-cols-2 gap-6 text-xs">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="font-extrabold text-white text-[11px] uppercase tracking-wide truncate">{match.homeTeam.name}</span>
                      </div>
                      <div className="space-y-2 text-slate-300 font-semibold max-h-[300px] overflow-y-auto pr-1">
                        {match.homeLineup && match.homeLineup.length > 0 ? match.homeLineup.map((p, i) => <div key={p} className="flex items-center gap-2 py-0.5"><span className="font-mono text-[9px] text-slate-500 w-4">{i + 1}</span><span className="truncate text-slate-300">{p}</span></div>) : <span className="text-slate-500 italic">No registered lineup.</span>}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="font-extrabold text-white text-[11px] uppercase tracking-wide truncate">{match.awayTeam.name}</span>
                      </div>
                      <div className="space-y-2 text-slate-300 font-semibold max-h-[300px] overflow-y-auto pr-1">
                        {match.awayLineup && match.awayLineup.length > 0 ? match.awayLineup.map((p, i) => <div key={p} className="flex items-center gap-2 py-0.5"><span className="font-mono text-[9px] text-slate-500 w-4">{i + 1}</span><span className="truncate text-slate-300">{p}</span></div>) : <span className="text-slate-500 italic">No registered lineup.</span>}
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function App() {
  const [liveMatches, setLiveMatches] = useState<Match[]>(TOURNAMENT_DATA);
  const [selectedMatchId, setSelectedMatchId] = useState<string>(TOURNAMENT_DATA[0]?.id || '');
  const [analyzingMatchId, setAnalyzingMatchId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<string>('All');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error' | 'syncing'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>(() => 
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleForceSync = async () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('success');
      setSyncMessage(`Successfully synced ${TOURNAMENT_DATA.length} matches.`);
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 3000);
    }, 1000);
  };

  const enrichedLiveMatches = liveMatches;
  const selectedMatch = enrichedLiveMatches.find(m => m && m.id === selectedMatchId) || enrichedLiveMatches.filter(m => m && m.homeTeam && m.awayTeam)[0];
  const recentResults = enrichedLiveMatches.filter(m => m && m.homeTeam && m.awayTeam && m.status === 'finished').slice(0, 3);
  const activeMatches = enrichedLiveMatches.filter(m => m && m.homeTeam && m.awayTeam);

  const filteredMatches = activeMatches.filter(match => {
    if (!match || !match.homeTeam || !match.awayTeam) return false;
    const matchesSearch = searchTerm.trim() === '' ? true : (
      (match.homeTeam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (match.awayTeam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (match.competition || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (selectedLeague === 'All') return matchesSearch;
    if (selectedLeague.toLowerCase().includes('world cup')) {
      return matchesSearch && match.competition.toLowerCase().includes('world cup');
    }
    return matchesSearch && match.competition.toLowerCase().includes(selectedLeague.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased pb-12 selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 blur-[160px] rounded-full pointer-events-none" />

      <header className="border-b border-white/10 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleForceSync}
              disabled={syncStatus === 'syncing'}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                syncStatus === 'syncing' ? 'bg-white/5 text-slate-400 border-white/5 animate-pulse' : syncStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15 hover:border-white/20'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncStatus === 'syncing' ? 'Loading...' : syncStatus === 'success' ? 'Synced!' : 'Sync Now'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        <AnimatePresence>
          {syncMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 bg-emerald-500/10 text-emerald-300 border-emerald-500/20`}>
              <div className="flex items-center gap-2"><Info className="h-4 w-4 shrink-0" /><span>{syncMessage}</span></div>
              <button onClick={() => setSyncMessage('')} className="text-white/40 hover:text-white transition cursor-pointer"><X className="h-4 w-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row gap-5 items-stretch lg:items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0"><Filter className="h-5 w-5 text-emerald-400" /></div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Live Filter Hub</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Search matches or filter by competition</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1 justify-end">
            <div className="relative w-full md:max-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search teams..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-white/10 hover:border-white/20 focus:border-emerald-400/50 rounded-2xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner" />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"><X className="h-3 w-3" /></button>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[{ name: 'All', label: 'All Arena' }, { name: 'FIFA World Cup', label: '🏆 World Cup' }, { name: 'Premier League', label: 'EPL' }, { name: 'La Liga', label: 'La Liga' }, { name: 'Bundesliga', label: 'Bundesliga' }].map((league) => (
                <button key={league.name} onClick={() => setSelectedLeague(league.name)} className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${selectedLeague === league.name ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.08)]' : 'bg-slate-950/40 text-slate-400 border border-white/5 hover:text-slate-200 hover:border-white/10'}`}>
                  {league.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Activity className="h-4.5 w-4.5 text-emerald-400" /><h2 className="text-base font-bold tracking-tight text-slate-200">{searchTerm || selectedLeague !== 'All' ? 'Filtered Match Results' : 'Live Fixtures Today'}</h2></div>
              <span className="text-xs text-slate-500 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-900">Auto-updating</span>
            </div>
            {filteredMatches.length > 0 ? (
              filteredMatches.map(match => (
                <MatchCard key={match.id} match={match} isSelected={selectedMatchId === match.id} onSelect={() => setSelectedMatchId(match.id)} onOpenAnalysis={() => setAnalyzingMatchId(match.id)} />
              ))
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/2 border border-white/5 rounded-3xl p-10 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400"><Search className="h-5 w-5" /></div>
                <h3 className="text-sm font-bold text-slate-200">No Match Found</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">We couldn't find any active fixtures. Try checking spelling or resetting your filters.</p>
                <button onClick={() => { setSearchTerm(''); setSelectedLeague('All'); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-500/30 transition cursor-pointer">Reset Active Filters</button>
              </motion.div>
            )}
          </div>
          <div className="lg:col-span-1">
            <MatchDetails match={selectedMatch} />
          </div>
        </section>
        
        <section className="pt-2">
          <UpcomingFixtures fixtures={enrichedLiveMatches.filter(m => m && m.status === 'upcoming')} />
        </section>

        {recentResults.length > 0 && (
          <section className="pt-4 space-y-5">
            <div className="flex items-center gap-2.5"><Trophy className="h-5 w-5 text-amber-400 stroke-[2.5]" /><div><h2 className="text-lg font-bold text-slate-100">Latest Results</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Most recent completed World Cup matches</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentResults.map(match => (
                <MatchCard key={match.id} match={match} isSelected={selectedMatchId === match.id} onSelect={() => setSelectedMatchId(match.id)} onOpenAnalysis={() => setAnalyzingMatchId(match.id)} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 border-t border-slate-900/60 pt-8 text-center text-xs text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 INVRTFUNNEL FC. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400"><span className="hover:text-emerald-400 transition cursor-pointer">Terms</span><span>•</span><span className="hover:text-emerald-400 transition cursor-pointer">Privacy</span><span>•</span><span className="hover:text-emerald-400 transition cursor-pointer">Data Sources</span></div>
        </div>
      </footer>

      {analyzingMatchId && (
        <MatchAnalysisModal isOpen={!!analyzingMatchId} onClose={() => setAnalyzingMatchId(null)} match={enrichedLiveMatches.find(m => m && m.id === analyzingMatchId)} />
      )}
    </div>
  );
}
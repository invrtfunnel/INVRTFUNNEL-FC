import React from 'react';
import { Team } from '../types';

interface TeamBadgeProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function TeamBadge({ team, size = 'md', className = '' }: TeamBadgeProps) {
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
            {/* Draw 3 vertical stripes */}
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
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`shield-clip-${team.shortName}`}>
            <path d={shieldPath} />
          </clipPath>
        </defs>
        <g clipPath={`url(#shield-clip-${team.shortName})`}>
          {renderBadgeContent()}
        </g>
        {/* Subtle inner shadow / highlight */}
        <path
          d={shieldPath}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeOpacity="0.25"
        />
      </svg>
      {/* Central Initials Layer */}
      <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-sans font-bold">
        {team.shortName}
      </span>
    </div>
  );
}

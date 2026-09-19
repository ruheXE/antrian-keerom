import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const KeeromLogo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const dimensionClass = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }[size];

  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white shadow-md shadow-emerald-950/20 border border-emerald-500/30 overflow-hidden ${dimensionClass} ${className}`}>
      {/* Subtle Papua-inspired pattern overlay */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:6px_6px]" />
      
      {/* SVG stylized emblem: Mountains of Keerom, Sunrise & Tifa motif */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4/5 h-4/5 relative z-10 drop-shadow-sm"
      >
        {/* Sun rising above Jayawijaya/Keerom ranges */}
        <circle cx="32" cy="24" r="9" fill="#FBBF24" opacity="0.9" />
        
        {/* Mountain Silhouette (Pegunungan Keerom) */}
        <path
          d="M8 44L24 26L34 38L42 29L56 44H8Z"
          fill="#10B981"
          fillOpacity="0.85"
        />
        <path
          d="M18 44L32 30L44 44H18Z"
          fill="#047857"
        />

        {/* Traditional Tifa Drum & Shield Motif */}
        <path
          d="M26 42C26 39 38 39 38 42L36 54C36 56 28 56 28 54L26 42Z"
          fill="#F59E0B"
          stroke="#78350F"
          strokeWidth="1.2"
        />
        <line x1="27" y1="46" x2="37" y2="46" stroke="#FEF3C7" strokeWidth="1" />
        <line x1="27" y1="50" x2="37" y2="50" stroke="#FEF3C7" strokeWidth="1" />

        {/* Small Bird of Paradise / Cenderawasih plume arc */}
        <path
          d="M22 20C26 14 36 12 44 16C40 18 36 21 34 23"
          stroke="#FDE047"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Base Banner */}
        <rect x="14" y="55" width="36" height="5" rx="2.5" fill="#DC2626" />
        <line x1="16" y1="57.5" x2="48" y2="57.5" stroke="#FFFFFF" strokeWidth="1" />
      </svg>
    </div>
  );
};

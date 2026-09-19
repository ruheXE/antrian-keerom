import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const KeeromLogo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = false
}) => {
  const [hasError, setHasError] = useState(false);

  const dimensionClasses = {
    sm: 'h-9 w-auto max-w-[36px]',
    md: 'h-12 w-auto max-w-[48px]',
    lg: 'h-16 w-auto max-w-[64px]',
    xl: 'h-24 w-auto max-w-[96px]'
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {!hasError ? (
        <img
          src="/Lambang_Kabupaten_Keerom2.png"
          alt="Lambang Kabupaten Keerom"
          className={`object-contain drop-shadow-md select-none transition-transform ${dimensionClasses}`}
          onError={() => setHasError(true)}
          loading="eager"
        />
      ) : (
        <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white shadow-md shadow-emerald-950/20 border border-emerald-500/30 overflow-hidden ${
          size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-16 h-16' : size === 'xl' ? 'w-24 h-24' : 'w-12 h-12'
        }`}>
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4/5 h-4/5 relative z-10 drop-shadow-sm"
          >
            <circle cx="32" cy="24" r="9" fill="#FBBF24" opacity="0.9" />
            <path d="M8 44L24 26L34 38L42 29L56 44H8Z" fill="#10B981" fillOpacity="0.85" />
            <path d="M18 44L32 30L44 44H18Z" fill="#047857" />
            <path d="M26 42C26 39 38 39 38 42L36 54C36 56 28 56 28 54L26 42Z" fill="#F59E0B" stroke="#78350F" strokeWidth="1.2" />
            <line x1="27" y1="46" x2="37" y2="46" stroke="#FEF3C7" strokeWidth="1" />
            <line x1="27" y1="50" x2="37" y2="50" stroke="#FEF3C7" strokeWidth="1" />
            <rect x="14" y="55" width="36" height="5" rx="2.5" fill="#DC2626" />
          </svg>
        </div>
      )}

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-[10px] tracking-wider uppercase font-extrabold text-amber-400">
            Kabupaten Keerom
          </span>
          <span className="text-xs font-black tracking-tight text-white leading-tight">
            Tamne Yisan Kefase
          </span>
        </div>
      )}
    </div>
  );
};

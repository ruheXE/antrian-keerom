import React from 'react';

interface GisaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'color' | 'white' | 'dark';
  showSubtitle?: boolean;
}

export const GisaLogo: React.FC<GisaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'color',
  showSubtitle = true,
}) => {
  const sizeClasses = {
    xs: 'h-5 w-auto',
    sm: 'h-7 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
    xl: 'h-18 w-auto',
    '2xl': 'h-24 w-auto',
  };

  const primaryColor = variant === 'white' ? '#FFFFFF' : variant === 'dark' ? '#0F172A' : '#E52329';

  return (
    <div className={`inline-flex items-center select-none ${className}`} title="#GISA - Gerakan Indonesia Sadar Administrasi Kependudukan">
      <svg
        viewBox={showSubtitle ? "0 0 540 148" : "0 0 540 95"}
        className={sizeClasses[size]}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="#GISA Gerakan Indonesia Sadar Administrasi Kependudukan"
      >
        <g fill={primaryColor}>
          {/* Main #GISA Title in bold forward italic sans */}
          <g transform="skewX(-11) translate(28, 0)">
            {/* # Symbol */}
            <path d="M 28 28 L 34 10 L 46 10 L 40 28 L 54 28 L 60 10 L 72 10 L 66 28 L 80 28 L 76 40 L 62 40 L 58 56 L 72 56 L 68 68 L 54 68 L 48 86 L 36 86 L 42 68 L 28 68 L 32 56 L 46 56 L 50 40 L 36 40 Z M 54 40 L 50 56 L 38 56 L 42 40 Z" />
            
            {/* G */}
            <path d="M 175 10 C 132 10 106 34 106 63 C 106 94 134 116 182 116 C 220 116 238 98 240 76 L 180 76 L 180 58 L 265 58 C 266 98 230 134 175 134 C 114 134 78 104 78 63 C 78 22 120 -6 180 -6 C 224 -6 256 16 264 42 L 236 48 C 230 28 206 10 175 10 Z" transform="translate(18, -10) scale(0.68)" />
            
            {/* I */}
            <path d="M 215 10 L 244 10 L 244 86 L 215 86 Z" />
            
            {/* S */}
            <path d="M 330 10 C 298 10 274 22 274 45 C 274 72 320 68 320 86 C 320 94 310 102 295 102 C 272 102 258 88 252 74 L 226 80 C 234 106 258 122 295 122 C 330 122 352 104 352 82 C 352 54 305 58 305 40 C 305 34 314 28 328 28 C 344 28 358 36 362 50 L 386 42 C 378 20 358 10 330 10 Z" transform="translate(26, -10) scale(0.68)" />
            
            {/* A */}
            <path d="M 340 86 L 366 10 L 396 10 L 422 86 L 394 86 L 387 67 L 361 67 L 354 86 Z M 366 51 L 382 51 L 374 28 Z" />
          </g>

          {/* Subtitles: GERAKAN INDONESIA SADAR / ADMINISTRASI KEPENDUDUKAN */}
          {showSubtitle && (
            <>
              {/* Line 1 */}
              <text
                x="30"
                y="112"
                fontFamily="system-ui, -apple-system, 'Plus Jakarta Sans', sans-serif"
                fontWeight="900"
                fontSize="22"
                letterSpacing="4"
              >
                GERAKAN INDONESIA SADAR
              </text>

              {/* Line 2 */}
              <text
                x="30"
                y="138"
                fontFamily="system-ui, -apple-system, 'Plus Jakarta Sans', sans-serif"
                fontWeight="900"
                fontSize="20.5"
                letterSpacing="4"
              >
                ADMINISTRASI KEPENDUDUKAN
              </text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

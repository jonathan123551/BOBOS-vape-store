"use client";

interface LogoProps {
  size?: number;
  withText?: boolean;
  className?: string;
}

export function Logo({ size = 36, withText = true, className = "" }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="BOBOS logo"
      >
        <defs>
          <linearGradient id="bobosG" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <filter id="bobosGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Vape body */}
        <rect x="14" y="14" width="14" height="36" rx="3" fill="url(#bobosG)" filter="url(#bobosGlow)" />
        <rect x="17" y="10" width="8" height="6" rx="1.5" fill="url(#bobosG)" />
        <circle cx="21" cy="40" r="2.2" fill="#0b0b14" />
        {/* B letter */}
        <path
          d="M34 14 H46 a8 8 0 0 1 0 16 H34 V14 Z M34 30 H48 a8 8 0 0 1 0 16 H34 V30 Z"
          fill="url(#bobosG)"
          filter="url(#bobosGlow)"
        />
        {/* Smoke wisp */}
        <path
          d="M30 44 c4 -2 8 2 12 0 c4 -2 8 4 12 2"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {withText && (
        <div className="flex flex-col leading-tight">
          <span className="text-base font-extrabold tracking-wide glow-text">BOBOS</span>
          <span className="text-[10px] uppercase tracking-[0.3em] opacity-70">Vapes Store</span>
        </div>
      )}
    </div>
  );
}

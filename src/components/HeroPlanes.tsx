/** Soft commercial-jet art for the hero’s open right side. Decorative only. */
export function HeroPlanes({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 520 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="jetBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#9ec9e8" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="jetSoft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7eb6e0" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Route lines */}
      <path
        d="M24 252C130 168 240 118 400 142"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeDasharray="6 10"
        strokeLinecap="round"
      />
      <path
        d="M48 278C170 192 300 148 460 188"
        stroke="rgba(126,182,224,0.45)"
        strokeWidth="1.25"
        strokeDasharray="3 9"
        strokeLinecap="round"
      />

      {/* Distant jet */}
      <g transform="translate(96 152) rotate(-20) scale(0.48)" opacity="0.55">
        <Airliner fill="url(#jetSoft)" accent="rgba(11,31,56,0.25)" />
      </g>

      {/* Mid jet */}
      <g transform="translate(190 98) rotate(-16) scale(0.7)" opacity="0.7">
        <Airliner fill="url(#jetSoft)" accent="rgba(11,31,56,0.28)" />
      </g>

      {/* Primary jet */}
      <g transform="translate(268 58) rotate(-12) scale(1.05)" opacity="0.95">
        <Airliner fill="url(#jetBody)" accent="rgba(11,31,56,0.32)" />
      </g>
    </svg>
  );
}

function Airliner({ fill, accent }: { fill: string; accent: string }) {
  /* Side profile, nose right — recognizable airliner */
  return (
    <g>
      {/* Main wing (below) */}
      <path
        fill={fill}
        d="M95 78 L155 86 C168 88 172 94 164 100 L118 128 C110 132 102 128 104 120 L118 88 Z"
      />
      {/* Far wing (above) */}
      <path
        fill={fill}
        opacity="0.88"
        d="M108 58 L138 22 C142 16 150 18 150 26 L138 62 C136 68 128 68 122 64 Z"
      />
      {/* Fuselage */}
      <path
        fill={fill}
        d="M18 64
           C22 52 48 46 92 44
           L190 46
           C214 48 236 54 248 64
           C236 74 214 80 190 82
           L92 84
           C48 82 22 76 18 64 Z"
      />
      {/* Nose */}
      <path
        fill={fill}
        d="M248 64 C262 66 276 72 282 78 C276 84 262 88 248 90 Z"
      />
      {/* Cockpit windows */}
      <path
        fill={accent}
        d="M236 58 H262 C268 60 270 64 270 68 C270 72 268 76 262 78 H236 Z"
      />
      {/* Window row */}
      <g fill={accent} opacity="0.85">
        <circle cx="80" cy="64" r="2.2" />
        <circle cx="96" cy="64" r="2.2" />
        <circle cx="112" cy="64" r="2.2" />
        <circle cx="128" cy="64" r="2.2" />
        <circle cx="144" cy="64" r="2.2" />
        <circle cx="160" cy="64" r="2.2" />
        <circle cx="176" cy="64" r="2.2" />
        <circle cx="192" cy="64" r="2.2" />
        <circle cx="208" cy="64" r="2.2" />
      </g>
      {/* Engines */}
      <ellipse cx="128" cy="96" rx="16" ry="6.5" fill={fill} />
      <ellipse cx="128" cy="96" rx="10" ry="3.5" fill={accent} opacity="0.35" />
      <ellipse cx="152" cy="90" rx="12" ry="5" fill={fill} opacity="0.85" />
      {/* Vertical stabilizer */}
      <path
        fill={fill}
        d="M28 62 L42 8 C46 2 54 4 54 12 L48 62 Z"
      />
      {/* Horizontal stabilizer */}
      <path
        fill={fill}
        d="M22 72 L58 78 C64 80 64 86 56 88 L24 92 C16 92 14 86 18 80 Z"
      />
    </g>
  );
}

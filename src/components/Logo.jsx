export default function Logo({ size = 36, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      className={className}
    >
      <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
      {/* Bar chart bars */}
      <rect x="9" y="22" width="5" height="10" rx="1.5" fill="rgba(255,255,255,0.4)" />
      <rect x="17.5" y="16" width="5" height="16" rx="1.5" fill="rgba(255,255,255,0.6)" />
      <rect x="26" y="10" width="5" height="22" rx="1.5" fill="rgba(255,255,255,0.85)" />
      {/* Trend line with arrow */}
      <path
        d="M10 20 L18 14 L24 17 L32 8"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M28 7.5 L33 7.5 L33 12.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="var(--gradient-from)" />
          <stop offset="100%" stopColor="var(--gradient-to)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

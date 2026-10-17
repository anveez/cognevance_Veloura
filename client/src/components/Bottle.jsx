import { useId } from 'react';

/** Illustrated perfume bottle. `accent` is the colour of the liquid. */
export default function Bottle({ accent = '#c47a1c', name = '', brand = 'Atelier', className = '', glow = true }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (s) => `${s}${uid}`;
  return (
    <svg viewBox="0 0 240 420" className={className} role="img" aria-label={`${name || 'Perfume'} bottle`}>
      <defs>
        <linearGradient id={id('shade')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={id('gold')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6a2c" />
          <stop offset="0.5" stopColor="#f0d595" />
          <stop offset="1" stopColor="#8a6a2c" />
        </linearGradient>
        <radialGradient id={id('floor')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={accent} stopOpacity={glow ? 0.55 : 0.2} />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('body')}><rect x="40" y="118" width="160" height="272" rx="24" /></clipPath>
      </defs>

      <ellipse cx="120" cy="396" rx="104" ry="14" fill={`url(#${id('floor')})`} />

      {/* cap */}
      <rect x="86" y="14" width="68" height="70" rx="5" fill="#17110d" />
      <rect x="86" y="14" width="68" height="70" rx="5" fill={`url(#${id('side')})`} />
      <rect x="82" y="80" width="76" height="12" rx="2" fill={`url(#${id('gold')})`} />
      {/* neck */}
      <rect x="100" y="92" width="40" height="28" fill="#f3e9d6" fillOpacity="0.14" />

      {/* glass body + liquid */}
      <rect x="40" y="118" width="160" height="272" rx="24" fill="#f3e9d6" fillOpacity="0.1" stroke="#f3e9d6" strokeOpacity="0.35" />
      <g clipPath={`url(#${id('body')})`}>
        <rect x="46" y="150" width="148" height="244" fill={accent} />
        <rect x="46" y="150" width="148" height="244" fill={`url(#${id('shade')})`} />
        <rect x="40" y="118" width="160" height="272" fill={`url(#${id('side')})`} />
        <rect x="40" y="356" width="160" height="34" fill="#f3e9d6" fillOpacity="0.12" />
        <ellipse cx="120" cy="150" rx="74" ry="5" fill="#fff" fillOpacity="0.25" />
      </g>
      {/* highlights */}
      <rect x="54" y="132" width="9" height="236" rx="4.5" fill="#fff" fillOpacity="0.22" />
      <rect x="170" y="150" width="4" height="150" rx="2" fill="#fff" fillOpacity="0.12" />

      {/* label */}
      <rect x="72" y="214" width="96" height="104" fill="#efe3cc" fillOpacity="0.92" />
      <rect x="77" y="219" width="86" height="94" fill="none" stroke="#8a6a2c" strokeWidth="0.8" />
      <text x="120" y="252" textAnchor="middle" fontFamily="Bodoni Moda, Georgia, serif" fontSize="15" fill="#17110d" letterSpacing="2">
        {brand.toUpperCase()}
      </text>
      <line x1="100" y1="262" x2="140" y2="262" stroke="#8a6a2c" strokeWidth="0.8" />
      <text x="120" y="283" textAnchor="middle" fontFamily="Bodoni Moda, Georgia, serif" fontStyle="italic" fontSize="11" fill="#3a281b">
        {name.length > 18 ? name.slice(0, 17) + '…' : name}
      </text>
      <text x="120" y="302" textAnchor="middle" fontFamily="Hanken Grotesk, sans-serif" fontSize="6.5" fill="#6b5a45" letterSpacing="2">
        EAU DE PARFUM
      </text>
    </svg>
  );
}

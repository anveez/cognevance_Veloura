export default function Stars({ value = 0, count, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${value} out of 5`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg key={n} width={size} height={size} viewBox="0 0 20 20" fill={n <= Math.round(value) ? '#c9a45c' : 'none'} stroke="#c9a45c" strokeWidth="1.4">
            <path d="M10 1.8l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.8 4.8 17.7 6 11.9 1.6 7.9l5.9-.7z" />
          </svg>
        ))}
      </span>
      {count !== undefined && <span className="text-xs text-sand">({count})</span>}
    </span>
  );
}

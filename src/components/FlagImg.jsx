


// src/components/FlagImg.jsx
export default function FlagImg({ iso, size = 32, className = "" }) {
  if (!iso) return <span className={className}>🏳️</span>;
  return (
    <img
      src={`https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${iso}.png`}
      srcSet={`https://flagcdn.com/${size * 2}x${Math.round(size * 1.5)}/${iso}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={iso}
      className={`inline-block object-cover rounded-sm ${className}`}
    />
  );
}
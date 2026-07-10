import React from 'react';

export const getInitials = (name: string) => {
  if (!name) return 'FB';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
};

export const TeamBadge: React.FC<{
  src: string | null;
  name: string;
  size?: string;
}> = ({ src, name, size = 'w-12 h-12' }) =>
  src ? (
    <img
      src={src}
      alt={name}
      className={`${size} object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]`}
      referrerPolicy="no-referrer"
    />
  ) : (
    <div
      className={`${size} rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-xs font-black font-mono text-slate-300`}
    >
      {getInitials(name)}
    </div>
  );

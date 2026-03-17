import React from 'react';

export const HeroGrid = () => {
  const rows = 12;
  const cols = 20;

  const getColor = (r: number, c: number) => {
    const centerCol = 9.5;
    const dist = Math.abs(c - centerCol);

    if (dist < 1 && r <= 9) return '#A87FFB';
    if (dist < 3 && r <= 7) return '#C4A6FC';
    if (dist < 5 && r <= 5) return '#DCD1FC';
    if (dist < 7 && r <= 3) return '#EFEAFC';
    if (dist < 9 && r <= 2) return '#F8F6FE';
    if (dist < 11 && r <= 1) return '#FCFBFF';
    return 'transparent';
  };

  return (
    <div className="absolute inset-0 z-0 w-full overflow-hidden bg-[#F4F5F7]">
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 grid w-full min-w-[600px] md:min-w-[1200px] max-w-[1920px]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const bgColor = getColor(r, c);
          const isColored = bgColor !== 'transparent';
          
          // Deterministic pseudo-random values for hydration safety
          const delay = (i * 0.13) % 2;
          const duration = 2 + ((i * 0.7) % 3);

          return (
            <div
              key={i}
              className={`aspect-square border-r border-b border-white ${isColored ? 'animate-twinkle' : ''}`}
              style={{ 
                backgroundColor: bgColor,
                ...(isColored ? {
                  '--twinkle-duration': `${duration}s`,
                  '--twinkle-delay': `${delay}s`,
                } : {}) as React.CSSProperties
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

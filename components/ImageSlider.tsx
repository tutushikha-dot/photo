
import React, { useState, useRef, useEffect } from 'react';

interface ImageSliderProps {
  before: string;
  after: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ before, after }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-zinc-800"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Full width background) */}
      <img 
        src={after} 
        alt="After" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <img 
          src={before} 
          alt="Before" 
          className="w-full h-full object-cover filter grayscale sepia brightness-90"
        />
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase">
          Before
        </div>
      </div>

      <div className="absolute top-4 right-4 px-3 py-1 bg-rose-500/80 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase">
        After
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize slider-handle"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          <i className="fas fa-arrows-alt-h text-zinc-900 text-sm"></i>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;

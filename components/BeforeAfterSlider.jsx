'use client';

import { useState } from 'react';

export default function BeforeAfterSlider({ before, after, heightClass = "h-80" }) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className={`relative ${heightClass} w-full overflow-hidden rounded-2xl border border-card-border shadow-sm select-none`}>
      <img
        src={before}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-sm text-text-title text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-20 border border-card-border shadow-sm">
        Before
      </div>

      <div
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <img
          src={after}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div
        className="absolute right-4 top-4 bg-emerald-50 backdrop-blur-sm text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider z-20 transition-opacity duration-200"
        style={{ opacity: sliderPosition < 90 ? 1 : 0 }}
      >
        After
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />

      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(17,24,39,0.15)] z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-card-border shadow-lg flex items-center justify-center pointer-events-none">
          <div className="flex gap-1">
            <span className="w-0.5 h-3 rounded-full bg-text-body/40" />
            <span className="w-0.5 h-3 rounded-full bg-text-body/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

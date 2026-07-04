import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
}

export function Slider({ value, min, max, step = 1, onChange, className }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn('relative h-6 w-full select-none', className)}>
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-bg-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-accent-400/60 [&::-webkit-slider-thumb]:bg-bg-0 [&::-webkit-slider-thumb]:shadow-glow [&::-webkit-slider-thumb]:transition"
      />
    </div>
  );
}

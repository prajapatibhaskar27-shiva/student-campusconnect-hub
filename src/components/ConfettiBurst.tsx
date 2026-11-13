import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface ConfettiBurstProps {
  burstKey: number;
}

const PIECES = [
  { x: -90, y: -70, r: -45, color: '#6D5DF6' },
  { x: -55, y: -95, r: 30, color: '#22D3EE' },
  { x: -20, y: -110, r: -20, color: '#34D399' },
  { x: 18, y: -105, r: 40, color: '#A78BFA' },
  { x: 58, y: -90, r: -35, color: '#22D3EE' },
  { x: 92, y: -65, r: 55, color: '#6D5DF6' },
  { x: -75, y: -35, r: 70, color: '#F59E0B' },
  { x: 75, y: -30, r: -60, color: '#34D399' },
  { x: -35, y: -60, r: 25, color: '#FB7185' },
  { x: 40, y: -55, r: -50, color: '#A78BFA' },
  { x: 0, y: -85, r: 15, color: '#22D3EE' },
  { x: 10, y: -45, r: -25, color: '#F59E0B' },
];

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ burstKey }) => {
  const prefersReduced = useReducedMotion();
  const [activeKey, setActiveKey] = useState<number>(0);

  useEffect(() => {
    if (burstKey === 0 || prefersReduced) return;
    setActiveKey(burstKey);
    const timer = window.setTimeout(() => setActiveKey(0), 650);
    return () => window.clearTimeout(timer);
  }, [burstKey, prefersReduced]);

  if (activeKey === 0 || prefersReduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
    >
      <div className="relative w-1 h-1">
        {PIECES.map((p, idx) => (
          <motion.span
            key={`${activeKey}-${idx}`}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.7, rotate: 0 }}
            animate={{
              opacity: [1, 1, 0],
              x: p.x,
              y: p.y,
              scale: [0.8, 1.1, 0.9],
              rotate: p.r * 3,
            }}
            transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: p.color }}
            className="absolute w-2.5 h-1.5 rounded-[2px]"
          />
        ))}
      </div>
    </div>
  );
};


import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiquidGlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
  className?: string;
  ariaLabel?: string;
}

const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className,
  ariaLabel,
}) => {
  const [ripplePos, setRipplePos] = useState({ x: 50, y: 50 });
  const [isPressed, setIsPressed] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setRipplePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const isPrimary = variant === 'primary';

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      aria-label={ariaLabel}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'liquid-glass-btn',
        isPrimary ? 'liquid-glass-primary' : 'liquid-glass-outline',
        className
      )}
      style={{
        // Dynamic radial highlight follows pointer
        '--ripple-x': `${ripplePos.x}%`,
        '--ripple-y': `${ripplePos.y}%`,
      } as React.CSSProperties}
    >
      {/* Inner glow layer */}
      <span className="liquid-glass-glow" aria-hidden="true" />
      {/* Refraction / specular highlight */}
      <span className="liquid-glass-specular" aria-hidden="true" />
      {/* Content */}
      <span className="liquid-glass-label">{children}</span>
    </motion.button>
  );
};

export default LiquidGlassButton;

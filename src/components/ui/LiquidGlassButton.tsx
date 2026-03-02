
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';

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
  const { config } = useLiquidGlass();

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setRipplePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const isPrimary = variant === 'primary';

  // Build dynamic styles from config
  const opacityFactor = config.opacity / 100;
  const backdropValue = [
    `blur(${config.strength + config.extraBlur}px)`,
    `saturate(${config.tintSaturation}%)`,
    `contrast(${config.contrast}%)`,
    `brightness(${config.brightness}%)`,
    config.invert > 0 ? `invert(${config.invert}%)` : '',
    config.tintHue !== 0 ? `hue-rotate(${config.tintHue}deg)` : '',
  ].filter(Boolean).join(' ');

  const dynamicStyle: React.CSSProperties = {
    '--ripple-x': `${ripplePos.x}%`,
    '--ripple-y': `${ripplePos.y}%`,
    borderRadius: `${config.cornerRadius}px`,
    backdropFilter: backdropValue,
    WebkitBackdropFilter: backdropValue,
    opacity: opacityFactor,
    // Make backgrounds more transparent so backdrop-filter shows through
    ...(isPrimary ? {
      background: `linear-gradient(135deg, rgba(0, 204, 51, ${0.25 * opacityFactor}) 0%, rgba(0, 255, 65, ${0.15 * opacityFactor}) 60%, rgba(0, 180, 45, ${0.2 * opacityFactor}) 100%)`,
      boxShadow: `0 ${config.softness * 0.5}px ${config.softness * 2}px rgba(0, 255, 65, ${0.35 * opacityFactor}), 0 0 ${config.edgeSpecularity * 0.6}px rgba(0, 255, 65, ${0.1 * opacityFactor}), inset 0 1px 0 rgba(255, 255, 255, ${0.15 * opacityFactor})`,
    } : {
      background: `rgba(255, 255, 255, ${0.04 * opacityFactor})`,
      boxShadow: `0 ${config.softness * 0.4}px ${config.softness * 1.5}px rgba(0, 0, 0, ${0.3 * opacityFactor}), inset 0 1px 0 rgba(255, 255, 255, ${0.1 * opacityFactor})`,
    }),
  } as React.CSSProperties;

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
      animate={{ opacity: opacityFactor, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'liquid-glass-btn',
        isPrimary ? 'liquid-glass-primary' : 'liquid-glass-outline',
        className
      )}
      style={dynamicStyle}
    >
      {/* Inner glow layer */}
      <span className="liquid-glass-glow" style={{ borderRadius: `${config.cornerRadius}px` }} aria-hidden="true" />
      {/* Refraction / specular highlight */}
      <span className="liquid-glass-specular" aria-hidden="true" />
      {/* Content */}
      <span className="liquid-glass-label">{children}</span>
    </motion.button>
  );
};

export default LiquidGlassButton;

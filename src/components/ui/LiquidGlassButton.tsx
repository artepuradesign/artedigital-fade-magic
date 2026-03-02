
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLiquidGlass } from '@/contexts/LiquidGlassContext';

interface LiquidLayer {
  points: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[];
  viscosity: number;
  mouseForce: number;
  forceLimit: number;
}

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
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    layers: LiquidLayer[];
    mouse: { x: number; y: number };
    raf: number;
    running: boolean;
    w: number;
    h: number;
    margin: number;
  } | null>(null);
  const { config } = useLiquidGlass();

  const isPrimary = variant === 'primary';

  // Liquid wobble canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const btn = btnRef.current;
    if (!canvas || !btn) return;

    const rect = btn.getBoundingClientRect();
    const w = Math.round(rect.width) || 200;
    const h = Math.round(rect.height) || 50;
    const margin = 6;
    const gap = 4;
    const tension = 0.4;
    const hoverFactor = -0.1;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const layerDefs = [
      { viscosity: 0.5, mouseForce: 100, forceLimit: 2 },
      { viscosity: 0.8, mouseForce: 150, forceLimit: 3 },
    ];

    const layers: LiquidLayer[] = layerDefs.map((l) => ({
      points: [],
      viscosity: l.viscosity,
      mouseForce: l.mouseForce,
      forceLimit: l.forceLimit,
    }));

    // Init control points around perimeter
    const r = config.cornerRadius || 20;
    layers.forEach((layer) => {
      const pts: typeof layer.points = [];
      // top
      for (let x = margin + r; x < w - margin - r; x += gap) {
        pts.push({ x, y: margin, ox: x, oy: margin, vx: 0, vy: 0 });
      }
      // top-right corner
      for (let a = -Math.PI / 2; a < 0; a += 0.2) {
        const px = w - margin - r + Math.cos(a) * r;
        const py = margin + r + Math.sin(a) * r;
        pts.push({ x: px, y: py, ox: px, oy: py, vx: 0, vy: 0 });
      }
      // right
      for (let y = margin + r; y < h - margin - r; y += gap) {
        pts.push({ x: w - margin, y, ox: w - margin, oy: y, vx: 0, vy: 0 });
      }
      // bottom-right corner
      for (let a = 0; a < Math.PI / 2; a += 0.2) {
        const px = w - margin - r + Math.cos(a) * r;
        const py = h - margin - r + Math.sin(a) * r;
        pts.push({ x: px, y: py, ox: px, oy: py, vx: 0, vy: 0 });
      }
      // bottom
      for (let x = w - margin - r; x > margin + r; x -= gap) {
        pts.push({ x, y: h - margin, ox: x, oy: h - margin, vx: 0, vy: 0 });
      }
      // bottom-left corner
      for (let a = Math.PI / 2; a < Math.PI; a += 0.2) {
        const px = margin + r + Math.cos(a) * r;
        const py = h - margin - r + Math.sin(a) * r;
        pts.push({ x: px, y: py, ox: px, oy: py, vx: 0, vy: 0 });
      }
      // left
      for (let y = h - margin - r; y > margin + r; y -= gap) {
        pts.push({ x: margin, y, ox: margin, oy: y, vx: 0, vy: 0 });
      }
      // top-left corner
      for (let a = Math.PI; a < Math.PI * 1.5; a += 0.2) {
        const px = margin + r + Math.cos(a) * r;
        const py = margin + r + Math.sin(a) * r;
        pts.push({ x: px, y: py, ox: px, oy: py, vx: 0, vy: 0 });
      }
      layer.points = pts;
    });

    const state = {
      layers,
      mouse: { x: -1000, y: -1000 },
      raf: 0,
      running: true,
      w,
      h,
      margin,
    };
    stateRef.current = state;

    const animate = () => {
      if (!state.running) return;
      const c = canvasRef.current?.getContext('2d');
      if (!c) return;
      c.clearRect(0, 0, w, h);

      state.layers.forEach((layer, li) => {
        layer.points.forEach((p) => {
          const dx = state.mouse.x - p.x;
          const dy = state.mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < layer.mouseForce) {
            const force = Math.min(
              (layer.mouseForce - dist) / layer.mouseForce,
              layer.forceLimit
            );
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * hoverFactor;
            p.vy += Math.sin(angle) * force * hoverFactor;
          }

          p.vx += (p.ox - p.x) * tension;
          p.vy += (p.oy - p.y) * tension;
          p.vx *= 1 - layer.viscosity;
          p.vy *= 1 - layer.viscosity;
          p.x += p.vx;
          p.y += p.vy;
        });

        const pts = layer.points;
        if (pts.length < 3) return;

        c.beginPath();
        c.moveTo(
          (pts[pts.length - 1].x + pts[0].x) / 2,
          (pts[pts.length - 1].y + pts[0].y) / 2
        );
        for (let i = 0; i < pts.length; i++) {
          const next = pts[(i + 1) % pts.length];
          c.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + next.x) / 2, (pts[i].y + next.y) / 2);
        }
        c.closePath();

        // Gradient fill matching button colors
        const grad = c.createLinearGradient(0, 0, w, h);
        if (isPrimary) {
          grad.addColorStop(0, 'rgba(0, 204, 51, 0.25)');
          grad.addColorStop(0.5, 'rgba(0, 255, 65, 0.15)');
          grad.addColorStop(1, 'rgba(0, 180, 45, 0.2)');
        } else {
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
          grad.addColorStop(0.5, 'rgba(200, 255, 210, 0.1)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
        }

        c.fillStyle = grad;
        c.globalAlpha = li === 0 ? 0.7 : 0.4;
        c.fill();
      });

      c.globalAlpha = 1;
      state.raf = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      state.running = false;
      cancelAnimationFrame(state.raf);
    };
  }, [config.cornerRadius, isPrimary]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipplePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });

    // Update liquid canvas mouse
    if (stateRef.current) {
      stateRef.current.mouse.x = x;
      stateRef.current.mouse.y = y;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (stateRef.current) {
      stateRef.current.mouse.x = -1000;
      stateRef.current.mouse.y = -1000;
    }
  }, []);

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerDown={() => {}}
      onPointerUp={() => {}}
      onPointerLeave={handlePointerLeave}
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
        '--ripple-x': `${ripplePos.x}%`,
        '--ripple-y': `${ripplePos.y}%`,
        borderRadius: `${config.cornerRadius}px`,
        backdropFilter: `blur(${config.strength + config.extraBlur}px) saturate(${config.tintSaturation}%) contrast(${config.contrast}%) brightness(${config.brightness}%) invert(${config.invert}%) hue-rotate(${config.tintHue}deg)`,
        WebkitBackdropFilter: `blur(${config.strength + config.extraBlur}px) saturate(${config.tintSaturation}%) contrast(${config.contrast}%) brightness(${config.brightness}%) invert(${config.invert}%) hue-rotate(${config.tintHue}deg)`,
        boxShadow: `0 0 ${config.softness}px rgba(255,255,255,${config.edgeSpecularity / 200}), inset 0 1px 0 rgba(255,255,255,${config.edgeSpecularity / 300})`,
        opacity: config.opacity / 100,
        backgroundColor: isPrimary 
          ? `rgba(var(--primary-rgb, 124,58,237), ${config.backgroundAlpha / 100})` 
          : `rgba(255,255,255, ${config.backgroundAlpha / 100})`,
      } as React.CSSProperties}
    >
      {/* Liquid wobble canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-[1]"
        aria-hidden="true"
        style={{ borderRadius: `${config.cornerRadius}px` }}
      />
      <span className="liquid-glass-glow" aria-hidden="true" />
      <span className="liquid-glass-specular" aria-hidden="true" />
      <span className="liquid-glass-label">{children}</span>
    </motion.button>
  );
};

export default LiquidGlassButton;

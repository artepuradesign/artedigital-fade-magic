
import { useRef, useEffect, useCallback } from 'react';

interface LiquidLayer {
  points: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[];
  viscosity: number;
  mouseForce: number;
  forceLimit: number;
}

interface LiquidButtonOptions {
  tension?: number;
  width?: number;
  height?: number;
  margin?: number;
  hoverFactor?: number;
  gap?: number;
  layers?: { viscosity: number; mouseForce: number; forceLimit: number }[];
  color1?: string;
  color2?: string;
  color3?: string;
  textColor?: string;
  noise?: number;
}

const defaultOptions: Required<LiquidButtonOptions> = {
  tension: 0.4,
  width: 200,
  height: 50,
  margin: 40,
  hoverFactor: -0.1,
  gap: 5,
  layers: [
    { viscosity: 0.5, mouseForce: 100, forceLimit: 2 },
    { viscosity: 0.8, mouseForce: 150, forceLimit: 3 },
  ],
  color1: '#36DFE7',
  color2: '#8F17E1',
  color3: '#E509E6',
  textColor: '#FFFFFF',
  noise: 0,
};

export function useLiquidButton(options?: LiquidButtonOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<{
    layers: LiquidLayer[];
    mouse: { x: number; y: number };
    raf: number;
    running: boolean;
    width: number;
    height: number;
    margin: number;
    tension: number;
    hoverFactor: number;
    gap: number;
    noise: number;
    color1: string;
    color2: string;
    color3: string;
    textColor: string;
    text: string;
  } | null>(null);

  const initOrigins = useCallback((s: NonNullable<typeof stateRef.current>) => {
    const { width, height, margin, gap } = s;
    const wm = width - margin * 2;
    const hm = height - margin * 2;

    s.layers.forEach((layer) => {
      const pts: typeof layer.points = [];
      // top
      for (let x = margin; x < width - margin; x += gap) {
        pts.push({ x, y: margin, ox: x, oy: margin, vx: 0, vy: 0 });
      }
      // right
      for (let y = margin; y < height - margin; y += gap) {
        pts.push({ x: width - margin, y, ox: width - margin, oy: y, vx: 0, vy: 0 });
      }
      // bottom (reverse)
      for (let x = width - margin; x > margin; x -= gap) {
        pts.push({ x, y: height - margin, ox: x, oy: height - margin, vx: 0, vy: 0 });
      }
      // left (reverse)
      for (let y = height - margin; y > margin; y -= gap) {
        pts.push({ x: margin, y, ox: margin, oy: y, vx: 0, vy: 0 });
      }
      layer.points = pts;
    });
  }, []);

  const animate = useCallback(() => {
    const s = stateRef.current;
    if (!s || !s.running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, s.width, s.height);

    // Update physics for each layer
    s.layers.forEach((layer, li) => {
      const pts = layer.points;
      pts.forEach((p) => {
        const dx = s.mouse.x - p.x;
        const dy = s.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < layer.mouseForce) {
          const force = Math.min((layer.mouseForce - dist) / layer.mouseForce, layer.forceLimit);
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * s.hoverFactor;
          p.vy += Math.sin(angle) * force * s.hoverFactor;
        }

        // Spring back to origin
        p.vx += (p.ox - p.x) * s.tension;
        p.vy += (p.oy - p.y) * s.tension;

        // Damping
        p.vx *= 1 - layer.viscosity;
        p.vy *= 1 - layer.viscosity;

        // Noise
        if (s.noise > 0) {
          p.vx += (Math.random() - 0.5) * s.noise;
          p.vy += (Math.random() - 0.5) * s.noise;
        }

        p.x += p.vx;
        p.y += p.vy;
      });

      // Draw layer
      if (pts.length < 3) return;

      const colors = [s.color1, s.color2, s.color3];
      const grad = ctx.createLinearGradient(0, 0, s.width, s.height);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(0.5, colors[1]);
      grad.addColorStop(1, colors[2]);

      ctx.beginPath();
      ctx.moveTo(
        (pts[pts.length - 1].x + pts[0].x) / 2,
        (pts[pts.length - 1].y + pts[0].y) / 2
      );
      for (let i = 0; i < pts.length; i++) {
        const next = pts[(i + 1) % pts.length];
        const cx = (pts[i].x + next.x) / 2;
        const cy = (pts[i].y + next.y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, cx, cy);
      }
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.globalAlpha = li === 0 ? 0.6 : 0.4;
      ctx.fill();
    });

    ctx.globalAlpha = 1;

    s.raf = requestAnimationFrame(animate);
  }, []);

  const setup = useCallback(
    (canvas: HTMLCanvasElement, text: string, opts?: LiquidButtonOptions) => {
      const o = { ...defaultOptions, ...options, ...opts };
      canvasRef.current = canvas;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = o.width * dpr;
      canvas.height = o.height * dpr;
      canvas.style.width = `${o.width}px`;
      canvas.style.height = `${o.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      const layers: LiquidLayer[] = o.layers.map((l) => ({
        points: [],
        viscosity: l.viscosity,
        mouseForce: l.mouseForce,
        forceLimit: l.forceLimit,
      }));

      const s = {
        layers,
        mouse: { x: -1000, y: -1000 },
        raf: 0,
        running: true,
        width: o.width,
        height: o.height,
        margin: o.margin,
        tension: o.tension,
        hoverFactor: o.hoverFactor,
        gap: o.gap,
        noise: o.noise,
        color1: o.color1,
        color2: o.color2,
        color3: o.color3,
        textColor: o.textColor,
        text,
      };
      stateRef.current = s;

      initOrigins(s);
      animate();

      return s;
    },
    [options, initOrigins, animate]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (!s) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    s.mouse.x = ((e.clientX - rect.left) / rect.width) * s.width;
    s.mouse.y = ((e.clientY - rect.top) / rect.height) * s.height;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    s.mouse.x = -1000;
    s.mouse.y = -1000;
  }, []);

  const cleanup = useCallback(() => {
    const s = stateRef.current;
    if (s) {
      s.running = false;
      cancelAnimationFrame(s.raf);
    }
  }, []);

  return { canvasRef, setup, handleMouseMove, handleMouseLeave, cleanup };
}

import React, { useState, useEffect, useMemo, useId } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BRAND } from '../styles/brand';

// ============================================================
// TypeScript interfaces
// ============================================================

interface Star11Props {
  size?: number;
  color?: string;
  stroke?: number;
  fill?: string;
}

interface CakeSliceProps {
  size?: number;
  color?: string;
}

interface RoundCakeProps {
  size?: number;
  color?: string;
}

interface StickerProps {
  children: React.ReactNode;
  bg?: string;
  fg?: string;
  rotate?: number;
  width?: number;
  style?: React.CSSProperties;
  shape?: 'round' | 'rect';
}

interface PillProps {
  children: React.ReactNode;
  bg?: string;
  fg?: string;
  onClick?: React.MouseEventHandler;
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

interface SprinklesProps {
  count?: number;
  color?: string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface SprinkleArcProps {
  color?: string;
  opacity?: number;
}

interface ChocolateBlobProps {
  maxWidth?: number;
}

interface DripProps {
  color?: string;
  height?: number;
  seed?: number;
  style?: React.CSSProperties;
  animated?: boolean;
}

interface DripTopProps {
  color?: string;
  bg?: string;
  height?: number;
  seed?: number;
  zIndex?: number;
}

interface LogoProps {
  size?: number;
  color1?: string;
  color2?: string;
  italic?: boolean;
}

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  bg?: string;
  fg?: string;
  height?: number;
  fontSize?: number;
  separator?: string;
}

interface ProductPlaceholderProps {
  label?: string;
  accent?: string;
}

// ============================================================
// Internal types
// ============================================================

interface DripCandidate {
  x: number;
  maxDepth: number;
  width: number;
  phase: number;
}

interface LiveDrip extends DripCandidate {
  depth: number;
  growth: number;
  timeSincePass: number;
}

interface SprinkleItem {
  x: number;
  y: number;
  r: number;
  l: number;
}

// ============================================================
// Components
// ============================================================

/** 11-point decorative star SVG */
export function Star11({
  size = 32,
  color = BRAND.marrom,
  stroke = 1.5,
  fill = 'none',
}: Star11Props) {
  const cx = 50;
  const cy = 50;
  const points = 11;
  const outer = 48;
  const inner = 22;
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
  }
  d += 'Z';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'inline-block' }}
    >
      <path
        d={d}
        fill={fill}
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Cake slice SVG icon */
export function CakeSlice({ size = 40, color = BRAND.marrom }: CakeSliceProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M20 40 L80 40 L80 75 L20 75 Z" />
      <path d="M20 55 L80 55" />
      <path d="M20 40 Q35 30 50 40 Q65 30 80 40" />
      <circle cx="50" cy="34" r="2.5" fill={color} />
    </svg>
  );
}

/** Round cake SVG icon */
export function RoundCake({ size = 40, color = BRAND.marrom }: RoundCakeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <ellipse cx="50" cy="38" rx="35" ry="8" />
      <path d="M15 38 L15 72 Q15 80 50 80 Q85 80 85 72 L85 38" />
      <path d="M15 55 Q50 63 85 55" />
      <circle cx="50" cy="30" r="2.5" fill={color} />
      <path d="M50 30 L50 24" />
    </svg>
  );
}

/** Rotated badge card (round or rect shape) */
export function Sticker({
  children,
  bg = BRAND.roxo,
  fg = BRAND.bege,
  rotate = -6,
  width = 220,
  style = {},
  shape = 'round',
}: StickerProps) {
  const radius = shape === 'round' ? '50%' : 16;
  return (
    <div
      style={{
        background: bg,
        color: fg,
        width,
        height: width,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: radius,
        transform: `rotate(${rotate}deg)`,
        boxShadow:
          '0 20px 40px rgba(66,39,22,0.18), 0 4px 8px rgba(66,39,22,0.1)',
        border: `3px solid ${fg}`,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Pill-shaped button (supports onClick, href, sizes) */
export function Pill({
  children,
  bg = BRAND.rosa,
  fg = '#fff',
  onClick,
  href,
  size = 'md',
  icon,
  style = {},
}: PillProps) {
  const sz: React.CSSProperties =
    size === 'lg'
      ? { padding: '16px 32px', fontSize: 15 }
      : size === 'sm'
        ? { padding: '8px 16px', fontSize: 12 }
        : { padding: '12px 24px', fontSize: 14 };

  const inner = (
    <motion.span
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: bg,
        color: fg,
        borderRadius: 999,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif',
        border: 'none',
        ...sz,
        ...style,
      }}
    >
      {children}
      {icon}
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none' }} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', padding: 0 }}
    >
      {inner}
    </button>
  );
}

/** Scatter of sprinkle dots */
export function Sprinkles({
  count = 60,
  color = BRAND.marrom,
  opacity: opacityProp = 0.5,
  className = '',
  style = {},
}: SprinklesProps) {
  const items = useMemo<SprinkleItem[]>(() => {
    const arr: SprinkleItem[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 360,
        l: 8 + Math.random() * 10,
      });
    }
    return arr;
  }, [count]);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        ...style,
      }}
    >
      {items.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 2.5,
            height: s.l,
            borderRadius: 2,
            background: color,
            opacity: opacityProp,
            transform: `rotate(${s.r}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/** Curved arc of sprinkles (parabolic pattern, 140 dots) */
export function SprinkleArc({
  color = BRAND.marrom,
  opacity: opacityProp = 0.65,
}: SprinkleArcProps) {
  const items = useMemo<SprinkleItem[]>(() => {
    const arr: SprinkleItem[] = [];
    for (let i = 0; i < 140; i++) {
      const t = Math.random();
      const x = t * 100;
      const y = (4 * (x - 10) * (90 - x)) / 80;
      arr.push({
        x,
        y: 100 - y + (Math.random() - 0.5) * 20,
        r: Math.random() * 360,
        l: 8 + Math.random() * 6,
      });
    }
    return arr;
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {items.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 2.5,
            height: s.l,
            borderRadius: 2,
            background: color,
            opacity: opacityProp,
            transform: `rotate(${s.r}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/** Chocolate dripping circle SVG with cake slice icon inside */
export function ChocolateBlob({ maxWidth = 480 }: ChocolateBlobProps) {
  const blobPath =
    'M 80 200 Q 80 80 250 80 Q 420 80 420 200 Q 420 230 410 255 ' +
    'Q 400 290 380 280 Q 360 275 355 300 Q 345 335 330 325 ' +
    'Q 310 315 300 340 Q 290 375 270 365 Q 250 355 240 380 ' +
    'Q 230 410 210 400 Q 190 390 180 370 Q 170 340 150 350 ' +
    'Q 125 365 120 335 Q 115 305 95 300 Q 75 295 80 270 ' +
    'Q 85 245 80 220 Z';

  return (
    <svg viewBox="0 0 500 500" style={{ width: '100%', maxWidth }}>
      <defs>
        <clipPath id="blobClip">
          <path d={blobPath} />
        </clipPath>
      </defs>
      <path d={blobPath} fill={BRAND.marrom} />
      {/* Highlight */}
      <ellipse cx="180" cy="140" rx="60" ry="25" fill={BRAND.bege} opacity={0.15} />
      {/* Cake slice icon */}
      <g
        transform="translate(150 160)"
        stroke={BRAND.bege}
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M 20 60 L 180 60 L 180 140 L 20 140 Z" />
        <path d="M 20 60 Q 60 30 100 55 Q 140 30 180 60" />
        <path d="M 20 100 L 180 100" />
        <circle cx="100" cy="40" r="4" fill={BRAND.bege} />
      </g>
    </svg>
  );
}

/** Animated drip/calda component with wave animation */
export function Drip({
  color = BRAND.rosa,
  height = 180,
  seed = 0,
  style = {},
  animated = true,
}: DripProps) {
  const reactId = useId();
  const uid = reactId.replace(/:/g, '');
  const W = 1200;
  const H = 260;
  const BASE = 38;

  const rand = useMemo(() => {
    return (k: number): number => {
      const x = Math.sin((seed + 1) * 999 + k * 37.17) * 10000;
      return x - Math.floor(x);
    };
  }, [seed]);

  // Generate ~18 drip candidates across the width
  const drips = useMemo<DripCandidate[]>(() => {
    const n = 18;
    const arr: DripCandidate[] = [];
    for (let i = 0; i < n; i++) {
      const x =
        (i + 0.5) * (W / n) + (rand(i) - 0.5) * (W / n) * 0.5;
      const maxDepth = 35 + rand(i + 100) * 110;
      const width = 16 + rand(i + 200) * 14;
      arr.push({ x, maxDepth, width, phase: rand(i + 300) });
    }
    arr.sort((a, b) => a.x - b.x);
    return arr;
  }, [rand]);

  const [t, setT] = useState(0);

  useEffect(() => {
    if (!animated) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  // Wave parameters
  const CYCLE = 8;
  const waveProgress = (t % CYCLE) / CYCLE;
  const waveX = waveProgress * (W + 400) - 200;

  // Compute live drip depths
  const liveDrips: LiveDrip[] = drips.map((d) => {
    const waveXForThisDrip = ((d.x + 200) / (W + 400)) * CYCLE;
    const timeSincePass = ((t % CYCLE) - waveXForThisDrip + CYCLE) % CYCLE;
    let growth: number;
    const GROW_T = 2.2;
    const HOLD_T = CYCLE - GROW_T - 0.5;
    if (timeSincePass < GROW_T) {
      const p = timeSincePass / GROW_T;
      growth = 1 - Math.pow(1 - p, 2.5);
    } else if (timeSincePass < GROW_T + HOLD_T) {
      growth = 1;
    } else {
      const p = (timeSincePass - GROW_T - HOLD_T) / 0.5;
      growth = Math.max(0, 1 - p * 2);
    }
    return { ...d, depth: d.maxDepth * growth, growth, timeSincePass };
  });

  // Build the base path with wave-driven bulge
  const basePath = useMemo(() => {
    const segs = 60;
    let d = `M -40 0 L ${W + 40} 0 L ${W + 40} ${BASE}`;
    for (let i = segs; i >= 0; i--) {
      const x = -40 + (W + 80) * (i / segs);
      const dist = Math.abs(x - waveX);
      const bulge = Math.exp(-(dist * dist) / (2 * 80 * 80)) * 16;
      const trail = x < waveX ? Math.min(6, (waveX - x) / 200) : 0;
      const noise = Math.sin(i * 0.7 + seed) * 2;
      const y = BASE + bulge + trail + noise;
      d += ` L ${x} ${y}`;
    }
    d += ` L -40 0 Z`;
    return d;
    // waveX changes every frame to animate the wave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waveX, seed]);

  // Drip teardrop shape builder
  const dripPath = (d: LiveDrip): string => {
    if (d.depth < 2) return '';
    const { x, width, depth } = d;
    const halfW = width / 2;
    const dist = Math.abs(x - waveX);
    const bulge = Math.exp(-(dist * dist) / (2 * 80 * 80)) * 16;
    const topY = BASE + bulge - 2;
    const tipY = topY + depth;
    const bulbR = Math.min(halfW * 1.3, halfW + depth * 0.25);
    return `
      M ${x - halfW} ${topY}
      C ${x - halfW} ${topY + depth * 0.6},
        ${x - bulbR} ${tipY - bulbR * 0.7},
        ${x - bulbR * 0.3} ${tipY}
      A ${bulbR} ${bulbR} 0 0 0 ${x + bulbR * 0.3} ${tipY}
      C ${x + bulbR} ${tipY - bulbR * 0.7},
        ${x + halfW} ${topY + depth * 0.6},
        ${x + halfW} ${topY}
      Z
    `;
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{
        display: 'block',
        width: '100%',
        height: height * (H / 180),
        overflow: 'visible',
        ...style,
      }}
    >
      <defs>
        <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.32} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Base body */}
      <path d={basePath} fill={color} />

      {/* Active drips */}
      {liveDrips.map((d, i) => {
        const p = dripPath(d);
        if (!p) return null;
        return <path key={i} d={p} fill={color} />;
      })}

      {/* Top sheen */}
      <rect
        x="0"
        y="0"
        width={W}
        height={BASE * 0.75}
        fill={`url(#sheen-${uid})`}
      />

      {/* Highlights on well-formed drips */}
      {liveDrips.map((d, i) => {
        if (d.growth < 0.6) return null;
        const dist = Math.abs(d.x - waveX);
        const bulge = Math.exp(-(dist * dist) / (2 * 80 * 80)) * 16;
        const tipY = BASE + bulge - 2 + d.depth;
        return (
          <ellipse
            key={`h${i}`}
            cx={d.x - d.width * 0.15}
            cy={tipY - d.width * 0.4}
            rx={d.width * 0.12}
            ry={2.5}
            fill="rgba(255,255,255,0.45)"
          />
        );
      })}
    </svg>
  );
}

/** Wrapper to position drip at top of section */
export function DripTop({
  color,
  bg,
  height = 140,
  seed = 1,
  zIndex = 2,
}: DripTopProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex,
        pointerEvents: 'none',
        lineHeight: 0,
      }}
    >
      {bg && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 30,
            background: bg,
          }}
        />
      )}
      <Drip color={color} height={height} seed={seed} />
    </div>
  );
}

/** Stacked "delicias / da VAN" logo */
export function Logo({
  size = 28,
  color1,
  color2,
  italic = true,
}: LogoProps) {
  const c1 = color1 || BRAND.rosa;
  const c2 = color2 || BRAND.marrom;
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        lineHeight: 0.8,
        letterSpacing: '-0.02em',
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: size,
          fontWeight: 800,
          fontStyle: italic ? 'italic' : 'normal',
          color: c1,
          transform: 'translateY(4px)',
          zIndex: 2,
        }}
      >
        del&#237;cias
      </span>
      <span
        className="font-display"
        style={{
          fontSize: size * 1.15,
          fontWeight: 900,
          color: c2,
          letterSpacing: '-0.04em',
          textTransform: 'lowercase',
        }}
      >
        <span
          style={{
            fontSize: size * 0.55,
            verticalAlign: 'super',
            marginRight: 4,
            fontWeight: 800,
          }}
        >
          da
        </span>
        VAN
      </span>
    </div>
  );
}

/** Infinite scrolling ticker */
export function Marquee({
  children,
  speed = 30,
  bg = BRAND.marrom,
  fg = BRAND.bege,
  height = 48,
  fontSize = 16,
  separator = '\u2726',
}: MarqueeProps) {
  const items = React.Children.toArray(children);
  return (
    <div
      style={{
        background: bg,
        color: fg,
        height,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <motion.div
        style={{
          display: 'flex',
          gap: 40,
          whiteSpace: 'nowrap',
          fontFamily: 'Fraunces, serif',
          fontSize,
          fontWeight: 600,
        }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        {[...items, ...items, ...items, ...items].map((c, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 40,
            }}
          >
            {c}
            <span style={{ opacity: 0.5 }}>{separator}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/** Placeholder for product images */
export function ProductPlaceholder({
  label = 'bolo',
  accent = BRAND.rosa,
}: ProductPlaceholderProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${accent}22, ${accent}0a)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
      className="placeholder-stripes"
    >
      <div
        style={{
          fontFamily: 'Space Grotesk, monospace',
          fontSize: 11,
          color: BRAND.marrom,
          opacity: 0.5,
          textTransform: 'lowercase',
          letterSpacing: '0.1em',
        }}
      >
        // {label}
      </div>
    </div>
  );
}

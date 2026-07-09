import {
  FileCheck,
  Fingerprint,
  Layers,
  Lock,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import React from 'react'

const hash = (s: string): number => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// Returns an icon only when the topic is genuinely recognisable.
// No match -> null, so the tile never wears an unrelated glyph.
const pickIcon = (seed: string): LucideIcon | null => {
  const s = seed.toLowerCase()
  if (s.includes('soc')) return ShieldCheck
  if (s.includes('iso') || s.includes('27001')) return Lock
  if (s.includes('hipaa') || s.includes('health')) return Fingerprint
  if (s.includes('gdpr') || s.includes('dpdp') || s.includes('privacy')) return Scale
  if (s.includes('evidence') || s.includes('audit') || s.includes('automation')) return FileCheck
  if (s.includes('risk') || s.includes('vendor') || s.includes('framework')) return Layers
  return null
}

// Three deterministic compositions. The "radar" origin anchors to a corner,
// the light bloom follows it, and the icon sits opposite so they never collide.
const VARIANTS = [
  { bloom: '12% 90%', cx: 40, cy: 235, nx: 132, ny: 158, vig: '50% 42%', icon: 'right-6 top-6' },
  { bloom: '90% 12%', cx: 360, cy: 20, nx: 268, ny: 97, vig: '50% 55%', icon: 'left-6 bottom-6' },
  { bloom: '88% 88%', cx: 360, cy: 235, nx: 268, ny: 158, vig: '50% 50%', icon: 'left-6 top-1/2 -translate-y-1/2' },
] as const

// Abstract cover art for posts without an image: layered emerald depth,
// a masked dot field, a faint radar sweep with one lit node, grain, and a
// topic icon only when we recognise the subject.
export const BlogTileArt: React.FC<{ seed: string }> = ({ seed }) => {
  const Icon = pickIcon(seed)
  const v = VARIANTS[hash(seed) % VARIANTS.length]
  const uid = React.useId().replace(/:/g, '')

  const id = (name: string) => `${name}-${uid}`

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={id('base')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0a6b5c" />
            <stop offset="0.55" stopColor="#064e3b" />
            <stop offset="1" stopColor="#022c22" />
          </linearGradient>

          <radialGradient id={id('bloom')} cx={v.bloom.split(' ')[0]} cy={v.bloom.split(' ')[1]} r="0.95">
            <stop offset="0" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="0.55" stopColor="#0b7d63" stopOpacity="0.12" />
            <stop offset="1" stopColor="#022c22" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={id('dmg')} cx={v.bloom.split(' ')[0]} cy={v.bloom.split(' ')[1]} r="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.78" stopColor="#000" />
          </radialGradient>
          <mask id={id('dm')}>
            <rect width="400" height="250" fill={`url(#${id('dmg')})`} />
          </mask>

          <pattern id={id('dots')} width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#fff" fillOpacity="0.12" />
          </pattern>

          <radialGradient id={id('vig')} cx={v.vig.split(' ')[0]} cy={v.vig.split(' ')[1]} r="0.78">
            <stop offset="0.5" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.42" />
          </radialGradient>

          <linearGradient id={id('sheen')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.07" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          <filter id={id('grain')}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>

          <filter id={id('glow')} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>

        {/* Emerald depth + light bloom */}
        <rect width="400" height="250" fill={`url(#${id('base')})`} />
        <rect width="400" height="250" fill={`url(#${id('bloom')})`} />

        {/* Dot field, fading away from the bloom */}
        <rect width="400" height="250" fill={`url(#${id('dots')})`} mask={`url(#${id('dm')})`} />

        {/* Radar sweep — one dashed ring reads as a scan line */}
        <g fill="none" stroke="#34d399">
          <circle cx={v.cx} cy={v.cy} r="70" strokeOpacity="0.21" />
          <circle cx={v.cx} cy={v.cy} r="120" strokeOpacity="0.14" strokeDasharray="3 6" />
          <circle cx={v.cx} cy={v.cy} r="175" strokeOpacity="0.08" />
        </g>

        {/* Lit node — the focal spark, especially when there's no icon */}
        <circle cx={v.nx} cy={v.ny} r="6" fill="#6ee7b7" filter={`url(#${id('glow')})`} />
        <circle cx={v.nx} cy={v.ny} r="2.6" fill="#d1fae5" />

        {/* Sheen, vignette, grain, lit edge */}
        <rect width="400" height="250" fill={`url(#${id('sheen')})`} />
        <rect width="400" height="250" fill={`url(#${id('vig')})`} />
        <rect
          width="400"
          height="250"
          fill="#000"
          filter={`url(#${id('grain')})`}
          opacity="0.11"
          style={{ mixBlendMode: 'overlay' }}
        />
        <rect x="0.5" y="0.5" width="399" height="249" fill="none" stroke="#fff" strokeOpacity="0.08" />
      </svg>

      {/* Topic icon — rendered only when we actually recognised the topic */}
      {Icon && (
        <Icon
          aria-hidden
          className={`absolute ${v.icon} h-16 w-16 text-emerald-200/70 drop-shadow-[0_0_6px_rgba(52,211,153,0.45)]`}
          strokeWidth={1.4}
        />
      )}
    </div>
  )
}
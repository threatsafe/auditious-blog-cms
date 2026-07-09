import React from 'react'

type Props = {
  className?: string
  /** Stroke color for the lines. Defaults to the pale green used on dark cards. */
  stroke?: string
}

// Decorative flowing lines shared by the newsletter CTA (on dark emerald) and
// the blog hero (tinted for light backgrounds). Purely presentational.
export const FlowingLines: React.FC<Props> = ({
  className,
  stroke = 'rgba(190, 242, 200, 0.35)',
}) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1200 500"
  >
    {Array.from({ length: 9 }).map((_, i) => (
      <path
        d={`M1200 ${40 + i * 12} C 850 ${120 + i * 18}, 650 ${250 + i * 6}, 250 ${
          160 + i * 30
        } S -100 ${300 + i * 10}, -200 ${360 + i * 6}`}
        key={i}
        stroke={stroke}
        strokeWidth="1"
      />
    ))}
  </svg>
)

'use client'

import React, { useEffect, useState } from 'react'

type Props = {
  className?: string
  words: string[]
}

// Types a word out, pauses, deletes it, then moves to the next — looping.
// Initial state renders the first word in full so SSR/first paint is meaningful.
export const Typewriter: React.FC<Props> = ({ className, words }) => {
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState(words[0] || '')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (words.length === 0) return
    const current = words[wordIndex % words.length]

    let delay = deleting ? 55 : 110
    if (!deleting && text === current) delay = 1500 // hold on the full word
    else if (deleting && text === '') delay = 350 // brief pause before next word

    const timer = setTimeout(() => {
      if (!deleting && text === current) {
        setDeleting(true)
      } else if (deleting && text === '') {
        setDeleting(false)
        setWordIndex((i) => (i + 1) % words.length)
      } else {
        setText(
          deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1),
        )
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [text, deleting, wordIndex, words])

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden
        className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.06em] animate-pulse rounded-sm bg-current align-baseline"
      />
    </span>
  )
}

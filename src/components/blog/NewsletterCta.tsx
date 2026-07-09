'use client'

import { ArrowRight } from 'lucide-react'
import React, { useState } from 'react'

import { FlowingLines } from './FlowingLines'

export const NewsletterCta: React.FC = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'error' | 'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribers/subscribe', {
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="container pb-18 pt-2">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-800 via-emerald-900 to-emerald-950 px-6 py-14 md:px-14">
        {/* Decorative flowing lines */}
        <FlowingLines className="pointer-events-none absolute inset-0 h-full w-full opacity-40" />

        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">
            Subscribe to our newsletter for the latest insights and learnings.
          </h2>

          {status === 'success' ? (
            <p className="mt-8 text-lg font-medium text-emerald-100">
              Check your inbox to confirm your subscription.
            </p>
          ) : (
            <form
              className="mt-8 flex flex-col gap-3 rounded-2xl bg-emerald-50/95 p-2 sm:flex-row sm:items-center"
              onSubmit={handleSubmit}
            >
              <input
                className="w-full flex-1 rounded-xl bg-transparent px-4 py-3 text-sm text-emerald-950 outline-none placeholder:text-emerald-900/50"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                type="email"
                value={email}
              />
              <button
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
                disabled={status === 'loading'}
                type="submit"
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe now'}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-sm text-emerald-100/80">
              Something went wrong. Please check your email and try again.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

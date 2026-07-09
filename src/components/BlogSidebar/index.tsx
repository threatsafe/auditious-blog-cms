'use client'

import Link from 'next/link'
import React, { useState } from 'react'

export type RelatedItem = { desc: string; href: string; title: string }

type Props = {
  related: RelatedItem[]
  shareUrl: string
  title: string
}

// Permanent article sidebar: Subscribe, Explore More Blogs, and Share.
export const BlogSidebar: React.FC<Props> = ({ related, shareUrl, title }) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'error' | 'idle' | 'loading' | 'success'>('idle')
  const [toast, setToast] = useState(false)

  const enc = encodeURIComponent
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
    x: `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(title)}`,
  }

  const showToast = () => {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast()
    } catch {
      // ignore
    }
  }

  const openShare = (href: string) => window.open(href, '_blank', 'noopener,noreferrer')

  return (
    <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
      {/* Subscribe */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight text-gray-900">
            Subscribe to
            <br />
            Auditious Blog
          </h3>
          <svg fill="none" height="44" viewBox="0 0 48 48" width="44">
            <rect fill="#d1fae5" height="24" rx="4" width="32" x="8" y="12" />
            <path
              d="M8 16 L24 28 L40 16"
              stroke="#10b981"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <circle cx="38" cy="10" fill="#10b981" r="6" />
          </svg>
        </div>

        {status === 'success' ? (
          <p className="text-sm font-medium text-emerald-700">
            Check your inbox to confirm your subscription.
          </p>
        ) : (
          <form onSubmit={handleSubscribe}>
            <p className="mb-4 text-sm leading-relaxed text-gray-500">
              Get the latest insights on compliance, automation, and audit readiness delivered to
              your inbox.
            </p>
            <input
              className="mb-3 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              type="email"
              value={email}
            />
            <button
              className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60"
              disabled={status === 'loading'}
              type="submit"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe Now'}
            </button>
            {status === 'error' && (
              <p className="mt-2 text-xs text-gray-500">
                Something went wrong. Please check your email and try again.
              </p>
            )}
          </form>
        )}
      </div>

      {/* Explore More Blogs */}
      {related.length > 0 && (
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
            <svg
              className="h-[18px] w-[18px] text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Explore More Blogs
          </h3>
          <ul className="flex flex-col gap-3">
            {related.map((item, i) => (
              <li key={i}>
                <Link
                  className="flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
                  href={item.href}
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-tight text-gray-900">
                      {item.title}
                    </span>
                    {item.desc && <span className="block text-xs text-gray-500">{item.desc}</span>}
                  </span>
                  <svg
                    className="flex-shrink-0 text-gray-400"
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="16"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:gap-2"
            href="/blogs"
          >
            View all blogs
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      )}

      {/* Share */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <svg
            className="h-[18px] w-[18px] text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
          </svg>
          Share This Article
        </h3>

        <div className="mt-3 flex gap-2.5">
          <button
            aria-label="Share on LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={() => openShare(shareLinks.linkedin)}
            type="button"
          >
            <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect height="12" width="4" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </button>
          <button
            aria-label="Share on X"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={() => openShare(shareLinks.x)}
            type="button"
          >
            <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button
            aria-label="Share on Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={() => openShare(shareLinks.facebook)}
            type="button"
          >
            <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button
            aria-label="Copy link"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={copyLink}
            type="button"
          >
            <svg
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 text-xs text-gray-500">Copy Link</div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <input
              className="flex-1 truncate border-none bg-transparent text-xs text-gray-500 outline-none"
              readOnly
              value={shareUrl}
            />
            <button
              aria-label="Copy to clipboard"
              className="text-gray-500 transition-colors hover:text-emerald-600"
              onClick={copyLink}
              type="button"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect height="13" rx="2" ry="2" width="13" x="9" y="9" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-lg">
          Link copied to clipboard!
        </div>
      )}
    </aside>
  )
}

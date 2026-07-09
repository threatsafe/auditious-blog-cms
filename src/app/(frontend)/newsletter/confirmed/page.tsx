import type { Metadata } from 'next/types'

import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Subscription confirmed',
  robots: { index: false, follow: false },
}

export default async function NewsletterConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>
}) {
  const { state } = await searchParams
  const invalid = state === 'invalid'

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-10">
        <h1 className="text-2xl font-bold text-gray-900">
          {invalid ? 'Link expired or invalid' : "You're subscribed! 🎉"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          {invalid
            ? 'This confirmation link is no longer valid. Please subscribe again to receive a fresh confirmation email.'
            : 'Thanks for confirming your email. You’ll now receive Auditious Blog updates in your inbox.'}
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
          href="/blogs"
        >
          Explore the blog
        </Link>
      </div>
    </div>
  )
}

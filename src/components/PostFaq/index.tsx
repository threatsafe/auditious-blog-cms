import React from 'react'

export type FaqItem = { answer: string; question: string }

// Self-contained FAQ card: the green gradient + decorative blobs live on this
// block (clipped by its rounded corners), sized to fill the content column.
// Uses native <details> so it needs no client JS.
export const PostFaq: React.FC<{ faqs: FaqItem[] }> = ({ faqs }) => {
  if (!faqs.length) return null

  return (
    <section className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B5132] via-[#0E7A4B] to-[#1FA971] p-6 md:p-8">
      {/* Decorative blobs, clipped to this card by overflow-hidden */}
      <div className="pointer-events-none absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full border border-white/40 bg-white/20" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[#1FA971]/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-32 -top-24 h-[30rem] w-[30rem] rounded-full bg-[#0B5132]/10 blur-2xl" />

      <div className="relative">
        <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">
          Frequently Asked Questions
        </h2>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <details
              className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-colors open:bg-white/15"
              key={i}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-base font-semibold text-white [&::-webkit-details-marker]:hidden">
                {faq.question}
                <svg
                  className="h-5 w-5 flex-shrink-0 text-white/80 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>
              {faq.answer && (
                <div className="whitespace-pre-line px-4 pb-4 text-sm leading-relaxed text-white/85">
                  {faq.answer}
                </div>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

import { getServerSideURL } from '../utilities/getURL'

const BRAND_NAME = 'Auditious Blog'
const BRAND_COLOR = '#059669' // emerald-600, matches the site accent

export type EmailLayoutOptions = {
  /** Preheader / hidden preview text shown by mail clients. */
  preview?: string
  /** Main heading rendered at the top of the card. */
  heading: string
  /** Inner HTML body (already escaped/safe). */
  bodyHtml: string
  /** Optional call-to-action button. */
  cta?: { label: string; url: string }
  /** Absolute unsubscribe URL rendered in the footer. */
  unsubscribeUrl?: string
}

/**
 * Wrap email body content in the shared branded layout. Every outbound email
 * uses this so subject/CTA/unsubscribe treatment stays consistent. Inline
 * styles only — email clients ignore <style> and external CSS.
 */
export const renderEmailTemplate = ({
  preview,
  heading,
  bodyHtml,
  cta,
  unsubscribeUrl,
}: EmailLayoutOptions): string => {
  const siteUrl = getServerSideURL()

  const ctaHtml = cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">
         <tr><td style="border-radius:10px;background:${BRAND_COLOR};">
           <a href="${cta.url}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${cta.label}</a>
         </td></tr>
       </table>`
    : ''

  const footerLinks = unsubscribeUrl
    ? `You are receiving this because you subscribed at <a href="${siteUrl}" style="color:${BRAND_COLOR};text-decoration:none;">${siteUrl.replace(/^https?:\/\//, '')}</a>.<br/>
       <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>`
    : `<a href="${siteUrl}" style="color:${BRAND_COLOR};text-decoration:none;">${siteUrl.replace(/^https?:\/\//, '')}</a>`

  return `<!doctype html>
<html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    ${preview ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preview}</div>` : ''}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
            <a href="${siteUrl}" style="font-size:18px;font-weight:700;color:${BRAND_COLOR};text-decoration:none;">${BRAND_NAME}</a>
          </td></tr>
          <tr><td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#111827;">${heading}</h1>
            <div style="font-size:15px;line-height:1.6;color:#374151;">${bodyHtml}</div>
            ${ctaHtml}
          </td></tr>
          <tr><td style="padding:20px 32px;border-top:1px solid #f0f0f0;font-size:12px;line-height:1.5;color:#9ca3af;">
            ${footerLinks}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

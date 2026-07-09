import crypto from 'crypto'

// Confirmation links expire; unsubscribe links do not.
export const CONFIRMATION_TOKEN_TTL_HOURS = 48

export type GeneratedToken = {
  /** Raw token to embed in the emailed link. Never stored. */
  raw: string
  /** SHA-256 hash of the raw token. This is what we persist. */
  hash: string
}

/**
 * Create a cryptographically random token together with the hash we store.
 * We keep only the hash server-side so a leaked database row cannot be used to
 * confirm/unsubscribe on a subscriber's behalf.
 */
export const generateToken = (): GeneratedToken => {
  const raw = crypto.randomBytes(32).toString('hex')
  return { raw, hash: hashToken(raw) }
}

export const hashToken = (raw: string): string =>
  crypto.createHash('sha256').update(raw).digest('hex')

/**
 * Constant-time comparison of two hex hashes to avoid leaking timing info.
 * Returns false for malformed/empty input instead of throwing.
 */
export const tokensMatch = (a: string | null | undefined, b: string | null | undefined): boolean => {
  if (!a || !b) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

export const confirmationExpiry = (from: Date = new Date()): string =>
  new Date(from.getTime() + CONFIRMATION_TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString()

export const isExpired = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return true
  return new Date(expiresAt).getTime() < Date.now()
}

const unsubscribeSecret = (): string =>
  process.env.PAYLOAD_SECRET || process.env.CRON_SECRET || 'insecure-dev-secret'

/**
 * Unsubscribe links must be reproducible for every outbound email, so instead
 * of a stored one-time token we derive a stateless, unforgeable HMAC over the
 * subscriber id. Verification recomputes the HMAC — nothing extra is persisted.
 */
export const buildUnsubscribeToken = (subscriberId: number | string): string => {
  const id = String(subscriberId)
  const sig = crypto.createHmac('sha256', unsubscribeSecret()).update(id).digest('hex')
  return `${id}.${sig}`
}

/**
 * Validate an unsubscribe token and return the subscriber id it encodes, or
 * null if the token is malformed or the signature does not match.
 */
export const verifyUnsubscribeToken = (token: string | null | undefined): string | null => {
  if (!token) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const id = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', unsubscribeSecret()).update(id).digest('hex')
  return tokensMatch(sig, expected) ? id : null
}

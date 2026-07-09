import type { Post } from '@/payload-types'

/* eslint-disable @typescript-eslint/no-explicit-any */
const lexicalText = (node: any): string => {
  if (!node) return ''
  if (typeof node.text === 'string') return `${node.text} `
  if (Array.isArray(node.children)) return node.children.map(lexicalText).join(' ')
  return ''
}

// Estimates reading time (minutes) from a post's body without a heavy converter.
export const estimateReadingMinutes = (
  post: Pick<Post, 'content' | 'contentType' | 'htmlContent'>,
): number => {
  let text = ''
  if (post.contentType === 'html' && post.htmlContent) {
    text = post.htmlContent.replace(/<[^>]+>/g, ' ')
  } else if (post.content && (post.content as any).root) {
    text = lexicalText((post.content as any).root)
  }
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

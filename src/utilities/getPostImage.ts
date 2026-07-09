import type { Media, Post } from '@/payload-types'

/* eslint-disable @typescript-eslint/no-explicit-any */
const findFirstMedia = (node: any): Media | null => {
  if (!node) return null

  // Lexical upload node
  if (node.type === 'upload' && node.value && typeof node.value === 'object') {
    return node.value as Media
  }
  // MediaBlock inside the rich text
  if (
    node.type === 'block' &&
    node.fields?.blockType === 'mediaBlock' &&
    node.fields.media &&
    typeof node.fields.media === 'object'
  ) {
    return node.fields.media as Media
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findFirstMedia(child)
      if (found) return found
    }
  }
  return null
}

/**
 * Resolves a cover image for a post, pulling it from the blog itself:
 * hero image → SEO meta image → the first image embedded in the post body.
 */
export const getPostImage = (
  post: Pick<Post, 'content' | 'heroImage' | 'meta'>,
): Media | null => {
  if (post.heroImage && typeof post.heroImage === 'object') return post.heroImage
  if (post.meta?.image && typeof post.meta.image === 'object') return post.meta.image

  const content = post.content as any
  if (content?.root) return findFirstMedia(content.root)

  return null
}

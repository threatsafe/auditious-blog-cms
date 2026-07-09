import type { Post } from '@/payload-types'

import { convertContentToHtml } from './lexicalToHtml'

/**
 * Returns the post body as an HTML string, honoring the post's `contentType`:
 * uploaded/pasted raw HTML when set to `html`, otherwise the Lexical editor
 * content converted to HTML.
 */
export const getPostContentHtml = async (post: Post): Promise<string> => {
  if (post.contentType === 'html' && post.htmlContent) {
    return post.htmlContent
  }

  return convertContentToHtml(post.content)
}

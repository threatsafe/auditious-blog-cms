// Prepares uploaded HTML-article content for safe inline rendering.
//
// A user may upload a full/self-styled HTML file whose <style> block contains
// global rules (`* { margin:0 }`, `body {...}`, bare element selectors). Injected
// as-is those rules apply to the WHOLE page and disturb the site layout. This
// scopes every rule to the article container and strips the document wrapper so
// the article can style itself without leaking out.

export const HTML_CONTENT_SCOPE_ID = 'post-html-content'

const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '')

const scopeSelector = (selector: string, scope: string): string => {
  const s = selector.trim()
  if (!s) return ''
  if (s === '*') return `${scope}, ${scope} *`
  if (s === 'html' || s === 'body' || s === ':root') return scope

  // A selector that starts with html/body targets the document root → the scope.
  const withoutRoot = s.replace(/^(?:html|body)\b\s*/i, '')
  if (withoutRoot !== s) return withoutRoot ? `${scope} ${withoutRoot}` : scope

  return `${scope} ${s}`
}

const scopeCss = (css: string, scope: string): string => {
  const input = stripComments(css)
  const out: string[] = []
  let i = 0
  const n = input.length

  while (i < n) {
    const open = input.indexOf('{', i)
    if (open === -1) break

    const prelude = input.slice(i, open).trim()

    // Find the matching closing brace (handles nested at-rules).
    let depth = 1
    let j = open + 1
    while (j < n && depth > 0) {
      if (input[j] === '{') depth++
      else if (input[j] === '}') depth--
      j++
    }
    const body = input.slice(open + 1, j - 1)

    if (prelude.startsWith('@')) {
      const lower = prelude.toLowerCase()
      if (
        lower.startsWith('@media') ||
        lower.startsWith('@supports') ||
        lower.startsWith('@container')
      ) {
        out.push(`${prelude}{${scopeCss(body, scope)}}`)
      } else {
        // @keyframes / @font-face / @page / @import — safe to leave unscoped.
        out.push(`${prelude}{${body}}`)
      }
    } else if (prelude) {
      const scoped = prelude
        .split(',')
        .map((sel) => scopeSelector(sel, scope))
        .filter(Boolean)
        .join(', ')
      out.push(`${scoped}{${body}}`)
    }

    i = j
  }

  return out.join('\n')
}

export const prepareHtmlContent = (html?: null | string): string => {
  if (!html) return ''

  let src = html

  // Pull out <style> blocks (to be scoped) and drop <script>/<link> tags.
  const styles: string[] = []
  src = src.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_m, css: string) => {
    styles.push(css)
    return ''
  })
  src = src.replace(/<script[\s\S]*?<\/script>/gi, '')
  src = src.replace(/<link[^>]*rel=["']?stylesheet["']?[^>]*>/gi, '')

  // Use <body> inner HTML for a full document; otherwise strip wrapper tags.
  const bodyMatch = src.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  let body = bodyMatch ? bodyMatch[1] : src
  if (!bodyMatch) {
    body = body
      .replace(/<!doctype[^>]*>/gi, '')
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '')
  }

  const scope = `#${HTML_CONTENT_SCOPE_ID}`
  const scopedCss = styles
    .map((css) => scopeCss(css, scope))
    .filter(Boolean)
    .join('\n')

  return `${scopedCss ? `<style>${scopedCss}</style>` : ''}${body}`
}

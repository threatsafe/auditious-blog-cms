import BlogsPage, { generateMetadata } from './blogs/page'

// Mirror the route-segment config from blogs/page.tsx so `/` is statically generated with ISR.
export const dynamic = 'force-static'
export const revalidate = 600

export default BlogsPage

export { generateMetadata }

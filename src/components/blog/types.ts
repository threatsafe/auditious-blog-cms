import type { Media } from '@/payload-types'

export type BlogCardData = {
  categories: string[]
  cover: Media | null
  date: string
  excerpt: string
  href: string
  minutes: number
  title: string
}

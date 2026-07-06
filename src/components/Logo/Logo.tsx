import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt="Auditious Logo"
      width={480}
      height={200}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('w-auto max-w-[9.375rem] h-[34px]', className)}
      src="/logo.png"
    />
  )
}

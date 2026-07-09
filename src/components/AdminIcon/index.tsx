import React from 'react'

const Icon = () => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="Auditious"
      src="/logo.png"
      width={480}
      height={200}
      style={{
        display: 'block',
        width: 'auto',
        height: '1.75rem',
        maxWidth: '100%',
        objectFit: 'contain',
      }}
     />
  )
}

export default Icon

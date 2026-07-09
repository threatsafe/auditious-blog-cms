import React from 'react'

// Replaces the default Payload logo shown on the admin login screen.
const Logo = () => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="Auditious"
      src="/logo.png"
      width={480}
      height={200}
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        maxWidth: '11.25rem',
        objectFit: 'contain',
      }}
    />
  )
}

export default Logo

/** PageBackground — Shared dark gradient + dot grid + glow blobs */
import React from 'react';

const PageBackground = () => (
  <>
    {/* Dot grid */}
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
      style={{
        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
    {/* Top-left glow */}
    <div
      className="pointer-events-none fixed z-0"
      style={{
        top: '-15%', left: '-10%', width: '55vw', height: '55vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,86,210,0.18) 0%, transparent 70%)',
      }}
    />
  </>
);

export default PageBackground;

/** Logo — Delta Education branded logo block */
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ responsive = false }) => (
  <Link to="/">
    <div
      className={`rounded-lg select-none ${responsive ? 'px-3 py-1.5 md:px-4 md:py-2' : 'px-4 py-2'}`}
      style={{ background: '#0056d2' }}
    >
      <span
        className={responsive ? 'text-[11px] md:text-[13px]' : 'text-[13px]'}
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: '#ffffff',
          lineHeight: 1,
          display: 'block',
        }}
      >
        DELTA<br />EDUCATION.
      </span>
    </div>
  </Link>
);

export default Logo;

/**
 * Navbar — Shared responsive navbar.
 * Props:
 *   leftContent  — element shown on the left (defaults to Logo)
 *   desktopActions — elements shown on the right on desktop
 *   mobileMenuContent — elements shown inside the mobile dropdown
 */
import React, { useState } from 'react';
import Logo from './Logo';

const Navbar = ({ leftContent, desktopActions, mobileMenuContent }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="relative z-20 flex items-center justify-between px-6 md:px-14 py-4"
      style={{ background: '#ffffff', borderBottom: '1px solid #e8edf5' }}
    >
      {/* Left slot */}
      <div className="flex items-center gap-4">
        {leftContent ?? <Logo responsive />}
      </div>

      {/* Desktop right actions */}
      {desktopActions && (
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {desktopActions}
        </div>
      )}

      {/* Mobile hamburger (only rendered when mobileMenuContent is provided) */}
      {mobileMenuContent && (
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#001e62] focus:outline-none"
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Mobile dropdown */}
      {isOpen && mobileMenuContent && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#e8edf5] z-30 shadow-xl">
          <div className="flex flex-col p-6 gap-4" onClick={() => setIsOpen(false)}>
            {mobileMenuContent}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

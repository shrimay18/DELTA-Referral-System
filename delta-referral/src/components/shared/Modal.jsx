/** Modal — Reusable dark modal overlay wrapper */
import React from 'react';

const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in"
    style={{ background: 'rgba(0,10,30,0.92)', backdropFilter: 'blur(12px)' }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div
      className="w-full max-w-md p-8 rounded-2xl relative"
      style={{
        background: 'linear-gradient(160deg, #040d1e, #020918)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,86,210,0.1)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-lg"
      >
        ×
      </button>
      {children}
    </div>
  </div>
);

export default Modal;

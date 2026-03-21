/** CourseCard — single course card for the landing courses section */
import React from 'react';

const CourseCard = ({ title, tag, features, isFeatured }) => (
  <div
    className={`relative p-8 rounded-2xl flex flex-col transition-all duration-300 ${isFeatured ? 'scale-[1.03] z-10' : 'hover:-translate-y-1'}`}
    style={
      isFeatured
        ? { background: 'linear-gradient(160deg, #0056d2, #00348f)', border: '1px solid #0056d2', boxShadow: '0 12px 48px rgba(0,86,210,0.40)' }
        : { background: '#ffffff', border: '1px solid #e8edf5', boxShadow: '0 4px 24px rgba(0,30,98,0.07)' }
    }
  >
    {isFeatured && (
      <div
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-black uppercase tracking-widest px-5 py-1 rounded-full text-white"
        style={{ background: '#001e62', boxShadow: '0 4px 16px rgba(0,30,98,0.4)' }}
      >
        Recommended
      </div>
    )}

    <div className="mb-7 mt-1">
      <h3
        className="text-2xl font-extrabold tracking-tight mb-1"
        style={{ fontFamily: 'Montserrat, sans-serif', color: isFeatured ? '#ffffff' : '#001e62' }}
      >
        {title}
      </h3>
      <p
        className="text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{ color: isFeatured ? 'rgba(255,255,255,0.65)' : '#0056d2' }}
      >
        {tag}
      </p>
    </div>

    <ul className="space-y-3.5 flex-grow">
      {features.map((f) => (
        <li
          key={f}
          className="flex items-start gap-3 text-[14px]"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500, color: isFeatured ? 'rgba(255,255,255,0.85)' : '#374151' }}
        >
          <span
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] mt-0.5"
            style={isFeatured ? { background: 'rgba(255,255,255,0.18)', color: '#ffffff' } : { background: 'rgba(0,86,210,0.10)', color: '#0056d2' }}
          >
            ✓
          </span>
          {f}
        </li>
      ))}
    </ul>
  </div>
);

export default CourseCard;

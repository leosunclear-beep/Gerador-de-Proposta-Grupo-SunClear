import React from 'react';

interface CiavoltLogoProps {
  customLogoUrl?: string;
  variant?: 'cover' | 'header' | 'light';
  className?: string;
}

export const CiavoltLogo: React.FC<CiavoltLogoProps> = ({
  customLogoUrl,
  variant = 'header',
  className = ''
}) => {
  if (customLogoUrl) {
    return (
      <div className={`brand-logo-container flex items-center ${className}`}>
        <img
          src={customLogoUrl}
          alt="Logo CIAVOLT"
          className="max-h-[14mm] max-w-[55mm] object-contain rounded bg-white p-[1.5mm] shadow-xs"
        />
      </div>
    );
  }

  // Default High-Fidelity SVG Brand Logo for CIAVOLT Energia Solar
  const isLightBackground = variant === 'light';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <div className="flex items-center gap-1.5">
        {/* Geometric Solar Flash Icon */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-br from-[#f28c28] to-[#d96b0c] text-white shadow-sm">
          <svg
            className="w-5 h-5 fill-current"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex flex-col leading-none">
          <div className="flex items-baseline tracking-tight">
            <span
              className={`font-black text-[21px] tracking-tight italic ${
                isLightBackground ? 'text-[#102b43]' : 'text-white'
              }`}
            >
              CIA<span className="text-[#f28c28]">VOLT</span>
            </span>
          </div>
          <span
            className={`text-[8.5px] font-bold tracking-[0.24em] uppercase ${
              isLightBackground ? 'text-[#1476b8]' : 'text-[#7fd4f4]'
            }`}
          >
            Energia Solar
          </span>
        </div>
      </div>
    </div>
  );
};

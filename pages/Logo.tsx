
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "text-2xl" }) => (
  <span className={`${className} font-black tracking-tighter text-emerald-600`}>
    Gratia
  </span>
);

export default Logo;

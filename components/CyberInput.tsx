
import React from 'react';

interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const CyberInput: React.FC<CyberInputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-widest mono ml-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-slate-900/50 border ${error ? 'border-rose-500/50' : 'border-slate-800 group-focus-within:border-sky-500/50'} rounded-lg py-2.5 ${icon ? 'pl-10' : 'px-4'} pr-4 text-slate-200 outline-none transition-all duration-200 mono placeholder:text-slate-700`}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] text-rose-500 mt-1 uppercase mono">{error}</p>}
    </div>
  );
};

export default CyberInput;

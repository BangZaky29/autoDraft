import React from "react";
import { Eye } from "lucide-react";

interface FABProps {
  onClick: () => void;
  badgeCount?: number;
}

export const FloatingPreviewFAB: React.FC<FABProps> = ({ onClick, badgeCount }) => {
  return (
    <div className="fixed bottom-4 right-4 z-40 lg:hidden pointer-events-auto">
      <button
        type="button"
        onClick={onClick}
        aria-label="Lihat Live Preview Akta"
        title="Buka Simulasi Akta Otentik"
        className="w-12 h-12 rounded-full bg-slate-900/95 hover:bg-slate-900 active:scale-90 text-white shadow-2xl border border-slate-700 flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs relative"
      >
        <Eye className="w-5 h-5 text-amber-400" />
        
        {/* Badge angka pendiri di sudut lingkaran */}
        {badgeCount !== undefined && badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-slate-900 shadow-xs">
            {badgeCount}
          </span>
        )}
      </button>
    </div>
  );
};

import React from "react";
import { Eye } from "lucide-react";

interface FABProps {
  onClick: () => void;
  badgeCount?: number;
}

export const FloatingPreviewFAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-4 right-4 z-40 lg:hidden pointer-events-auto">
      <button
        type="button"
        onClick={onClick}
        aria-label="Lihat Live Preview Akta"
        title="Buka Simulasi Akta Otentik"
        className="h-11 px-4 rounded-full bg-slate-900/95 hover:bg-slate-900 active:scale-95 text-white shadow-2xl border border-slate-700/90 flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs select-none ring-1 ring-slate-700/50 hover:ring-indigo-500/40"
      >
        <span className="font-semibold text-xs tracking-wide text-slate-100">
          Preview
        </span>
        <Eye className="w-4 h-4 text-amber-400 shrink-0" />
      </button>
    </div>
  );
};

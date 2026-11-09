import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export type DesktopLayoutPreset =
  | "split-klasik"
  | "split-50-50"
  | "studio-3col"
  | "bento-grid";

interface LayoutOption {
  id: DesktopLayoutPreset;
  name: string;
  shortDesc: string;
  wireframe: React.ReactNode;
}

interface LayoutSwitcherProps {
  currentLayout: DesktopLayoutPreset;
  onSelectLayout: (layout: DesktopLayoutPreset) => void;
}

export const LayoutSwitcherDropdown: React.FC<LayoutSwitcherProps> = ({
  currentLayout,
  onSelectLayout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLayout, setHoveredLayout] = useState<DesktopLayoutPreset | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const layouts: LayoutOption[] = [
    {
      id: "split-klasik",
      name: "Split Klasik (7:5)",
      shortDesc: "Top Stepper + Rasio 60:40 Form & Preview",
      wireframe: (
        <div className="w-14 h-10 rounded-lg p-1 bg-[#18181B] border border-zinc-700/80 flex flex-col gap-1 transition-all">
          {/* Top Full Width Stepper Bar */}
          <div className="w-full h-1.5 rounded-xs bg-indigo-500/80" />
          {/* Bottom Split 60:40 */}
          <div className="flex-1 flex gap-1">
            <div className="flex-[6] h-full rounded-xs bg-zinc-600/90" />
            <div className="flex-[4] h-full rounded-xs bg-zinc-500/60" />
          </div>
        </div>
      ),
    },
    {
      id: "split-50-50",
      name: "Split Seimbang 50:50 (Default)",
      shortDesc: "Dual Pane Lebar Seimbang Form & Live Akta",
      wireframe: (
        <div className="w-14 h-10 rounded-lg p-1 bg-[#18181B] border border-zinc-700/80 flex flex-col gap-1 transition-all">
          {/* Compact Top Bar */}
          <div className="w-full h-1 rounded-xs bg-zinc-500/50" />
          {/* Equal Dual Pane 50:50 */}
          <div className="flex-1 flex gap-1">
            <div className="flex-1 h-full rounded-xs bg-zinc-600/90" />
            <div className="flex-1 h-full rounded-xs bg-indigo-500/70" />
          </div>
        </div>
      ),
    },
    {
      id: "studio-3col",
      name: "3-Kolom Studio Pro",
      shortDesc: "Left Step Rail (15%) | Form (45%) | Full Preview (40%)",
      wireframe: (
        <div className="w-14 h-10 rounded-lg p-1 bg-[#18181B] border border-zinc-700/80 flex gap-1 transition-all">
          {/* Left Vertical Stepper Rail */}
          <div className="w-2.5 h-full rounded-xs bg-indigo-500/80" />
          {/* Center Form Column */}
          <div className="flex-[5] h-full rounded-xs bg-zinc-600/90" />
          {/* Right Full Preview Column */}
          <div className="flex-[4] h-full rounded-xs bg-zinc-500/60" />
        </div>
      ),
    },
    {
      id: "bento-grid",
      name: "Bento Multi-Panel",
      shortDesc: "Main Form Kiri + Stacked Panel Notariat & Akta Kanan",
      wireframe: (
        <div className="w-14 h-10 rounded-lg p-1 bg-[#18181B] border border-zinc-700/80 flex gap-1 transition-all">
          {/* Left Tall Main Form Box */}
          <div className="flex-[6] h-full rounded-xs bg-zinc-600/90" />
          {/* Right Stacked 2 Boxes */}
          <div className="flex-[4] h-full flex flex-col gap-1">
            <div className="flex-1 rounded-xs bg-indigo-500/70" />
            <div className="flex-1 rounded-xs bg-zinc-500/60" />
          </div>
        </div>
      ),
    },
  ];

  const activeLayoutInfo =
    layouts.find((l) => l.id === (hoveredLayout || currentLayout)) || layouts[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button (Matching Windows 11 / IDE Split Icon [ ◫ ]) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Pilih Tata Letak Layar"
        title="Ubah Layout Desktop (Snap Layouts)"
        className={`h-9 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs ${
          isOpen
            ? "bg-slate-700 border-indigo-500 text-white ring-2 ring-indigo-500/30"
            : "bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-slate-200"
        }`}
      >
        {/* Inline SVG Split-Window Icon matching user reference image */}
        <svg
          className="w-4 h-4 text-indigo-400 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="12" height="12" rx="2.5" />
          <line x1="7.5" y1="2" x2="7.5" y2="14" />
          <line x1="7.5" y1="8" x2="14" y2="8" />
        </svg>

        <span className="hidden xl:inline text-xs font-semibold text-slate-200">
          Layout
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* Snap-Layout Popover Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Snap Layout Presets"
          className="absolute right-0 mt-2 z-50 bg-[#18181B]/98 backdrop-blur-xl border border-zinc-700/90 rounded-2xl p-3.5 sm:p-4 shadow-2xl min-w-[340px] sm:min-w-[400px] animate-in fade-in zoom-in-95 duration-150 origin-top-right"
        >
          {/* Header Label */}
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800/80">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-400">
              Desktop Workspace Presets
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">
              Live Snap
            </span>
          </div>

          {/* Interactive Visual Wireframe Row */}
          <div className="grid grid-cols-4 gap-2.5">
            {layouts.map((item) => {
              const isActive = currentLayout === item.id;
              const isHovered = hoveredLayout === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectLayout(item.id);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHoveredLayout(item.id)}
                  onMouseLeave={() => setHoveredLayout(null)}
                  className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "bg-zinc-800/90 border-[#4F46E5] ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/50"
                      : isHovered
                      ? "bg-zinc-800/60 border-zinc-500 scale-[1.02]"
                      : "bg-[#27272A]/70 border-zinc-700/60 hover:border-zinc-500"
                  }`}
                >
                  {/* Wireframe Diagram */}
                  <div className="pointer-events-none mb-1.5">
                    {item.wireframe}
                  </div>

                  {/* Active Indicator Checkmark */}
                  {isActive && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}

                  {/* Short Preset Name */}
                  <span
                    className={`text-[10px] font-bold text-center leading-tight truncate w-full ${
                      isActive
                        ? "text-indigo-300"
                        : "text-zinc-300 group-hover:text-white"
                    }`}
                  >
                    {item.id === "split-klasik" && "Klasik"}
                    {item.id === "split-50-50" && "50:50"}
                    {item.id === "studio-3col" && "3-Kolom"}
                    {item.id === "bento-grid" && "Bento"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer Description of Active/Hovered Layout */}
          <div className="mt-3.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
            <div className="min-w-0 flex-1">
              <span className="text-zinc-400 font-mono text-[10px] block">
                Tata Letak Aktif:
              </span>
              <span className="font-bold text-white text-xs truncate block">
                {activeLayoutInfo.name}
              </span>
              <span className="text-zinc-400 text-[10px] block truncate">
                {activeLayoutInfo.shortDesc}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


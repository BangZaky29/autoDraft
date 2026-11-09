import React from "react";
import { Building2, Users, FileText, PieChart, Check } from "lucide-react";

export type StepperVariant = "horizontal" | "compact" | "vertical";

interface WizardStepperProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  entityType: "PT" | "CV";
  variant?: StepperVariant;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  activeStep,
  setActiveStep,
  entityType,
  variant = "horizontal",
}) => {
  const steps = [
    {
      num: 1,
      title: "Badan Usaha & Domisili",
      desc: "Profil Entitas & Kantor Pusat",
      icon: Building2,
    },
    {
      num: 2,
      title: "Komparisi Pendiri",
      desc: "Identitas KTP & Validasi Usia",
      icon: Users,
    },
    {
      num: 3,
      title: "KBLI & Kegiatan Usaha",
      desc: "Kitab KBLI 2020 (Pasal 3)",
      icon: FileText,
    },
    {
      num: 4,
      title: entityType === "PT" ? "Modal Saham & Pengurus" : "Modal CV & Sekutu",
      desc:
        entityType === "PT"
          ? "Kalkulator Saham & Direksi"
          : "Setoran Modal & Pengurus",
      icon: PieChart,
    },
  ];

  // ===================== VARIANT 1: VERTICAL RAIL (FOR PRESET 3: 3-KOLOM STUDIO PRO) =====================
  if (variant === "vertical") {
    return (
      <nav
        aria-label="Progress Navigasi Langkah"
        className="w-full bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-2"
      >
        <div className="pb-2.5 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
            Navigasi Langkah
          </span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
            {activeStep}/4
          </span>
        </div>

        <div className="space-y-1.5 relative">
          {steps.map((s) => {
            const isActive = activeStep === s.num;
            const isDone = activeStep > s.num;
            const Icon = s.icon;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(s.num)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? "bg-[#4F46E5] text-white shadow-md font-semibold"
                    : isDone
                    ? "bg-slate-50 text-slate-700 hover:bg-slate-100/80 border border-slate-200/70"
                    : "bg-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                {/* Step Circle Badge */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isDone
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-heading font-bold truncate leading-snug ${
                      isActive ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {s.title}
                  </div>
                  <div
                    className={`text-[10px] truncate leading-tight mt-0.5 ${
                      isActive ? "text-indigo-100" : "text-slate-400"
                    }`}
                  >
                    {s.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // ===================== VARIANT 2: COMPACT PILL BAR (FOR PRESET 2 & PRESET 4) =====================
  if (variant === "compact") {
    return (
      <nav
        aria-label="Progress Navigasi Langkah"
        className="w-full bg-white rounded-2xl p-2 border border-slate-200/90 shadow-sm mb-4"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {steps.map((s) => {
            const isActive = activeStep === s.num;
            const isDone = activeStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setActiveStep(s.num)}
                className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#4F46E5] text-white shadow-md font-semibold"
                    : isDone
                    ? "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                    : "bg-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : isDone
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : s.num}
                </div>
                <div
                  className="min-w-0 flex-1 text-[11px] sm:text-xs font-bold font-heading line-clamp-1 leading-snug"
                  title={s.title}
                >
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // ===================== VARIANT 3: DEFAULT HORIZONTAL BAR (FOR PRESET 1: SPLIT KLASIK) =====================
  return (
    <nav
      aria-label="Progress Navigasi Langkah"
      className="w-full bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-sm mb-6"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {steps.map((s) => {
          const isActive = activeStep === s.num;
          const isDone = activeStep > s.num;
          const Icon = s.icon;

          return (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              type="button"
              className={`flex items-center gap-2.5 p-2 sm:p-3 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-[#4F46E5] text-white shadow-md font-semibold"
                  : isDone
                  ? "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                  : "bg-transparent text-slate-500 hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isDone
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-xs font-heading font-bold truncate ${
                    isActive ? "text-white" : "text-slate-800"
                  }`}
                >
                  {s.title}
                </div>
                <div
                  className={`text-[10px] truncate hidden sm:block ${
                    isActive ? "text-indigo-100" : "text-slate-400"
                  }`}
                >
                  {s.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

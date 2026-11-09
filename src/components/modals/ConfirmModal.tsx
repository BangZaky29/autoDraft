import React from "react";
import {
  AlertTriangle,
  Trash2,
  LogOut,
  Sparkles,
  HelpCircle,
  X,
  Check
} from "lucide-react";

export type ConfirmVariant = "danger" | "primary" | "emerald" | "warning";
export type ConfirmIconType = "alert" | "trash" | "logout" | "sparkles" | "help";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: ConfirmIconType;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Lanjutkan",
  cancelText = "Batal",
  variant = "primary",
  icon = "help",
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (icon) {
      case "trash":
        return <Trash2 className="w-5 h-5 text-rose-600" />;
      case "logout":
        return <LogOut className="w-5 h-5 text-rose-600" />;
      case "sparkles":
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case "alert":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-indigo-600" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-50 text-rose-600 border border-rose-200/80";
      case "emerald":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200/80";
      case "warning":
        return "bg-amber-50 text-amber-600 border border-amber-200/80";
      default:
        return "bg-indigo-50 text-indigo-600 border border-indigo-200/80";
    }
  };

  const getConfirmBtnClass = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200";
      case "emerald":
        return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200";
      default:
        return "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBg()}`}>
              {renderIcon()}
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base leading-snug">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer ${getConfirmBtnClass()}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};


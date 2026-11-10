import React from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { AktaFormState } from "../../types/akta.types";
import { LiveDeedViewer } from "./LiveDeedViewer";

interface MobileDeedBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  form: AktaFormState;
  onSaveDraft?: () => void;
  onRequestDownload?: () => void;
  onOpenHistory?: () => void;
  onClearAll?: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export const MobileDeedBottomSheet: React.FC<MobileDeedBottomSheetProps> = ({
  isOpen,
  onClose,
  form,
  onSaveDraft,
  onRequestDownload,
  onOpenHistory,
  onClearAll,
  isSaving,
  lastSaved,
}) => {
  const dragControls = useDragControls();

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Simulasi Akta Otentik"
          className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden overscroll-none"
        >
          {/* 1. Dark Backdrop Overlay (Tap to Close with Smooth Fade) */}
          <motion.div
            key="mobile-deed-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs cursor-pointer"
          />

          {/* 2. Bottom Sheet Container (Smooth Emergence & Drag Down to Close) */}
          <motion.div
            key="mobile-deed-sheet"
            id="preview-modal"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 32,
              stiffness: 300,
              mass: 0.85,
            }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              // Jika ditarik ke bawah > 80px atau kecepatan flick > 300px/s -> tutup mulus
              if (info.offset.y > 80 || info.velocity.y > 300) {
                onClose();
              }
            }}
            className="relative z-10 w-full bg-slate-900 rounded-t-3xl h-[90vh] flex flex-col overflow-hidden shadow-2xl border-t border-slate-700/80"
            style={{
              touchAction: "pan-y",
              overscrollBehavior: "none",
            }}
          >
            {/* Drag Handle Bar Area (Bisa ditarik ke bawah atau diklik untuk menutup) */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="w-full pt-2.5 pb-2 flex flex-col items-center bg-slate-900 cursor-grab active:cursor-grabbing select-none shrink-0 touch-none group"
              title="Tarik ke bawah untuk menutup akta otentik"
            >
              <div className="w-12 h-1.5 bg-slate-400 group-hover:bg-slate-300 group-active:bg-indigo-400 rounded-full transition-colors" />
            </div>

            {/* Live Deed Viewer Content Area */}
            <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
              <LiveDeedViewer
                form={form}
                className="rounded-none border-0 shadow-none"
                onSaveDraft={onSaveDraft}
                onRequestDownload={onRequestDownload}
                onOpenHistory={onOpenHistory}
                onClearAll={onClearAll}
                isSaving={isSaving}
                lastSaved={lastSaved}
                onHeaderPointerDown={(e) => dragControls.start(e)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

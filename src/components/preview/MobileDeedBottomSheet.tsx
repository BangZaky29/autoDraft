import React, { useRef, useState, useEffect } from "react";
import { AktaFormState } from "../../types/akta.types";
import { LiveDeedViewer } from "./LiveDeedViewer";

interface MobileDeedBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  form: AktaFormState;
  onSaveDraft?: () => void;
  onRequestDownload?: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export const MobileDeedBottomSheet: React.FC<MobileDeedBottomSheetProps> = ({
  isOpen,
  onClose,
  form,
  onSaveDraft,
  onRequestDownload,
  isSaving,
  lastSaved,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Reset transform and animate slide-in from bottom when opened
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      if (sheetRef.current) {
        sheetRef.current.style.transform = "translateY(0px)";
        sheetRef.current.style.transition =
          "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)";
      }
      if (backdropRef.current) {
        backdropRef.current.style.opacity = "1";
      }
    }
  }, [isOpen]);

  // Smooth close animation
  const triggerClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    if (sheetRef.current) {
      sheetRef.current.style.transition =
        "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)";
      sheetRef.current.style.transform = "translateY(100%)";
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = "opacity 280ms ease-out";
      backdropRef.current.style.opacity = "0";
    }

    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 280);
  };

  // Touch Drag Listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isClosing) return;
    // Don't initiate drag on interactive elements (buttons, links, inputs)
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    startTimeRef.current = Date.now();
    isDraggingRef.current = true;

    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || isClosing) return;
    const touchY = e.touches[0].clientY;
    currentYRef.current = touchY;
    const deltaY = touchY - startYRef.current;

    if (deltaY > 0) {
      // Dragging downwards: real-time CSS transform
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      }
      if (backdropRef.current) {
        // Subtle backdrop opacity decrease proportional to drag distance
        const opacity = Math.max(0.2, 1 - deltaY / 400);
        backdropRef.current.style.opacity = String(opacity);
      }
    } else {
      // Slight upward rubber-band resistance
      const damped = deltaY * 0.15;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${damped}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || isClosing) return;
    isDraggingRef.current = false;

    const deltaY = currentYRef.current - startYRef.current;
    const timeDiff = Date.now() - startTimeRef.current;
    const velocity = deltaY / Math.max(1, timeDiff); // px per ms

    // Snap-to-Close Threshold:
    // If dragged > 120px OR fast downward flick (velocity > 0.45 and dragged > 35px)
    if (deltaY > 120 || (velocity > 0.45 && deltaY > 35)) {
      triggerClose();
    } else {
      // Spring/snap back smoothly to original position
      if (sheetRef.current) {
        sheetRef.current.style.transition =
          "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)";
        sheetRef.current.style.transform = "translateY(0px)";
      }
      if (backdropRef.current) {
        backdropRef.current.style.transition = "opacity 280ms ease-out";
        backdropRef.current.style.opacity = "1";
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Simulasi Akta Otentik"
      className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden overscroll-none"
    >
      {/* 1. Dark Backdrop Overlay (Tap to Close) */}
      <div
        ref={backdropRef}
        onClick={triggerClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
      />

      {/* 2. Bottom Sheet Container (#preview-modal) */}
      <div
        id="preview-modal"
        ref={sheetRef}
        className="relative z-10 w-full bg-slate-900 rounded-t-3xl h-[90vh] flex flex-col overflow-hidden shadow-2xl border-t border-slate-700/80 animate-in slide-in-from-bottom duration-200"
        style={{
          touchAction: "pan-y",
          overscrollBehavior: "none",
        }}
      >
        {/* Drag Handle Bar Area */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full pt-1 pb-1 flex flex-col items-center bg-slate-900 cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          {/* Subtle Pill-shaped Drag Handle Bar */}
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 cursor-grab active:cursor-grabbing transition-colors" />
        </div>

        {/* Live Deed Viewer Content Area */}
        <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
          <LiveDeedViewer
            form={form}
            className="rounded-none border-0 shadow-none"
            onSaveDraft={onSaveDraft}
            onRequestDownload={onRequestDownload}
            isSaving={isSaving}
            lastSaved={lastSaved}
            onClose={triggerClose}
            onHeaderTouchStart={handleTouchStart}
            onHeaderTouchMove={handleTouchMove}
            onHeaderTouchEnd={handleTouchEnd}
          />
        </div>
      </div>
    </div>
  );
};

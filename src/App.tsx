import React, { useState } from "react";
import { AuthGuard } from "./components/auth/AuthGuard";
import { WizardStepper } from "./components/wizard/WizardStepper";
import { Step1CompanyInfo } from "./components/wizard/Step1CompanyInfo";
import { Step2FoundersKTP } from "./components/wizard/Step2FoundersKTP";
import { Step3KBLISelector } from "./components/wizard/Step3KBLISelector";
import { Step4CapitalShares } from "./components/wizard/Step4CapitalShares";
import { MasterNotariatCard } from "./components/wizard/MasterNotariatCard";
import {
  LayoutSwitcherDropdown,
  DesktopLayoutPreset,
} from "./components/layout/LayoutSwitcherDropdown";
import { DraftHistoryModal } from "./components/modals/DraftHistoryModal";
import { DownloadDeedModal } from "./components/modals/DownloadDeedModal";
import { SaveDraftModal } from "./components/modals/SaveDraftModal";
import { NotificationContainer } from "./components/notifications/NotificationContainer";
import { notify } from "./lib/notificationStore";
import {
  ConfirmModal,
  ConfirmVariant,
  ConfirmIconType,
} from "./components/modals/ConfirmModal";
import { LiveDeedViewer } from "./components/preview/LiveDeedViewer";
import { FloatingPreviewFAB } from "./components/preview/FloatingPreviewFAB";
import { MobileDeedBottomSheet } from "./components/preview/MobileDeedBottomSheet";
import { DevAutoFillBar } from "./components/dev/DevAutoFillBar";
import { useAktaState } from "./hooks/useAktaState";
import { signOut } from "./lib/supabase";
import { generateDeedWord } from "./lib/docxGenerator";
import { AktaFormState } from "./types/akta.types";
import {
  Scale,
  History,
  LogOut,
  CheckCircle2,
  Sparkles,
  Trash2,
} from "lucide-react";

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: ConfirmIconType;
  onConfirm: () => void;
}

export function StudioWorkspace() {
  const {
    form,
    setForm,
    currentDraftId,
    setCurrentDraftId,
    activeStep,
    setActiveStep,
    updateField,
    setEntity,
    copyAddressFromFounder1,
    isSharesBalanced,
    isMinimumCapitalMet,
    totalLembarDisetor,
    totalModalDisetorKalkulasi,
    saveDraftToCloud,
    resetForm,
    isSaving,
    lastSaved,
  } = useAktaState();

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSaveDraftModalOpen, setIsSaveDraftModalOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Desktop Visual Layout State (Default 50:50)
  const [desktopLayout, setDesktopLayout] = useState<DesktopLayoutPreset>(() => {
    return (
      (localStorage.getItem("autominuta_desktop_layout") as DesktopLayoutPreset) ||
      "split-50-50"
    );
  });
  const [isNotariatPanelOpen, setIsNotariatPanelOpen] = useState(true);
  const [isNotariatCollapsed, setIsNotariatCollapsed] = useState(() => {
    const saved = localStorage.getItem("autominuta_desktop_layout");
    return saved ? saved === "split-50-50" : true;
  });

  const handleSelectLayout = (layout: DesktopLayoutPreset) => {
    setDesktopLayout(layout);
    localStorage.setItem("autominuta_desktop_layout", layout);
    if (layout === "split-50-50") {
      setIsNotariatCollapsed(true);
    } else if (layout === "split-klasik") {
      setIsNotariatCollapsed(false);
    }
    const label =
      layout === "split-klasik"
        ? "Split Klasik (Default)"
        : layout === "split-50-50"
        ? "Split Seimbang 50:50"
        : layout === "studio-3col"
        ? "3-Kolom Studio Pro"
        : "Bento Multi-Panel";
    notify.info("Tata Letak Diubah", `Beralih ke layout ${label}`);
  };

  // Unified Confirmation Pop-up State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Lanjutkan",
    cancelText: "Batal",
    variant: "primary",
    icon: "help",
    onConfirm: () => {},
  });

  const openConfirm = (opts: Omit<ConfirmState, "isOpen">) => {
    setConfirmDialog({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || "Lanjutkan",
      cancelText: opts.cancelText || "Batal",
      variant: opts.variant || "primary",
      icon: opts.icon || "help",
      onConfirm: opts.onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Sub-Toolbar Always Active for Automation Bar
  const isDevAutoFillEnabled = true;

  const isPT = form.jenis_badan_usaha === "PT";

  const renderActiveStepForm = () => (
    <div className="space-y-6">
      {activeStep === 1 && (
        <Step1CompanyInfo
          form={form}
          updateField={updateField}
          setEntity={setEntity}
          copyAddressFromFounder1={() => copyAddressFromFounder1()}
          onNext={() => setActiveStep(2)}
        />
      )}

      {activeStep === 2 && (
        <Step2FoundersKTP
          form={form}
          updateField={updateField}
          copyAddressFromFounder1={copyAddressFromFounder1}
          onNext={() => setActiveStep(3)}
          onPrev={() => setActiveStep(1)}
        />
      )}

      {activeStep === 3 && (
        <Step3KBLISelector
          form={form}
          updateField={updateField}
          onNext={() => setActiveStep(4)}
          onPrev={() => setActiveStep(2)}
        />
      )}

      {activeStep === 4 && (
        <Step4CapitalShares
          form={form}
          updateField={updateField}
          isSharesBalanced={isSharesBalanced}
          isMinimumCapitalMet={isMinimumCapitalMet}
          totalLembarDisetor={totalLembarDisetor}
          totalModalDisetorKalkulasi={totalModalDisetorKalkulasi}
          onPrev={() => setActiveStep(3)}
        />
      )}
    </div>
  );

  const handleLoadDummy = (dummyData: AktaFormState, label: string) => {
    setForm((prev) => ({
      ...prev,
      ...dummyData,
      nama_notaris: prev.nama_notaris,
      wilayah_notaris: prev.wilayah_notaris,
      sk_notaris: prev.sk_notaris,
      kuasa: prev.kuasa,
      saksi: prev.saksi,
    }));
    notify.success("Data Dummy Terisi", `Seluruh field disimulasikan: ${label}`);
  };

  const handleClearAll = () => {
    openConfirm({
      title: "Kosongkan Seluruh Formulir?",
      message:
        "Seluruh data isian formulir akta (entitas, domisili, pendiri, dan modal) akan direset kembali menjadi kosong bersih. Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Ya, Kosongkan Semua",
      cancelText: "Batal",
      variant: "danger",
      icon: "trash",
      onConfirm: () => {
        resetForm();
        notify.info("Formulir Dikosongkan", "Seluruh isian formulir akta berhasil di-reset");
      },
    });
  };

  // Logout dengan unified confirmation popup
  const handleLogoutClick = () => {
    openConfirm({
      title: "Konfirmasi Keluar Akun",
      message:
        "Apakah Anda yakin ingin keluar dari studio AutoMinuta? Pastikan draf akta Anda sudah tersimpan.",
      confirmText: "Ya, Keluar Akun",
      cancelText: "Batal",
      variant: "danger",
      icon: "logout",
      onConfirm: async () => {
        await signOut();
      },
    });
  };

  // Download Handler dengan custom file name
  const handleConfirmDownload = async (customName: string) => {
    try {
      await generateDeedWord(form, customName);
      notify.success("Dokumen Berhasil Diunduh", `Berkas "${customName}" siap digunakan`);
    } catch (err: any) {
      notify.error("Gagal Mengunduh Dokumen", err?.message || "Terjadi kesalahan sistem");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* ===================== TOP NAVBAR & VISUAL LAYOUT SWITCHER ===================== */}
      <header className="sticky top-0 z-30 bg-[#0B1120] text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Left: Scales Logo + AutoMinuta + Badge + Subtitle */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shadow-xs shrink-0">
              <Scale className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white shrink-0">
                  AutoMinuta
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-mono font-bold shrink-0">
                  {isPT ? "PT" : "CV"}
                </span>
              </div>
              <p
                className="text-[10px] sm:text-xs text-slate-300 font-mono tracking-tight truncate w-full"
                title={`${isPT ? "PT " : "CV "}${form.nama_perusahaan || "PACSTRA INDUSTRIAL LOGISTICS"}`}
              >
                {isPT ? "PT " : "CV "}{form.nama_perusahaan || "PACSTRA INDUSTRIAL LOGISTICS"}
              </p>
            </div>
          </div>

          {/* Center: Autosave Status Indikator */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 font-mono">
            {isSaving ? (
              <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Menyimpan draf ke Supabase...
              </span>
            ) : lastSaved ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tersimpan di Cloud ({lastSaved.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })})
              </span>
            ) : null}
          </div>

          {/* Right Action Group: Visual Layout Switcher + Konfigurasi Notariat + Riwayat Draf + Reset + Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Visual Layout Switcher Trigger Button & Snap Popover (Desktop only) */}
            <div className="hidden lg:block">
              <LayoutSwitcherDropdown
                currentLayout={desktopLayout}
                onSelectLayout={handleSelectLayout}
              />
            </div>

            {/* Konfigurasi Notaris & Saksi (Toggle Panel Notariat) */}
            <button
              type="button"
              onClick={() => setIsNotariatPanelOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isNotariatPanelOpen
                  ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/30 ring-1 ring-indigo-500/30"
                  : "bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title="Tampilkan atau lipat panel konfigurasi Pejabat Notaris & Saksi Akta"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden md:inline">Notaris & Saksi</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  isNotariatPanelOpen
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {isNotariatPanelOpen ? "Tampil" : "Lipat"}
              </span>
            </button>

            {/* Riwayat Draf */}
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Buka riwayat draf tersimpan"
            >
              <History className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">Riwayat Draf</span>
            </button>

            {/* Button Reset Form (Di sebelah Riwayat Draf, Icon di Mobile) */}
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800/60 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Kosongkan seluruh isian formulir akta (Reset)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogoutClick}
              title="Keluar Akun"
              className="p-2 rounded-xl hover:bg-red-950/50 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* ===================== SUB-TOOLBAR: QUICK AUTOMATION BAR (DEV TESTING) ===================== */}
      <DevAutoFillBar
        onLoadDummy={handleLoadDummy}
        onRequestConfirm={openConfirm}
      />

      {/* ===================== DYNAMIC DESKTOP WORKSPACE LAYOUTS ===================== */}

      {/* PRESET 1: SPLIT KLASIK (Default — Top Stepper + 7/5 Split) */}
      {desktopLayout === "split-klasik" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-36 lg:pb-12 w-full flex-1">
          {/* Component 1: Stepper Horizontal (Full Width Top Bar) */}
          <WizardStepper
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            entityType={form.jenis_badan_usaha}
            variant="horizontal"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 Cols): Component 2 (Card 2A Notariat + Card 2B Active Form) */}
            <div className="lg:col-span-7 space-y-6">
              {isNotariatPanelOpen && (
                <MasterNotariatCard
                  form={form}
                  updateField={updateField}
                  isCollapsed={isNotariatCollapsed}
                  onToggleCollapse={() => setIsNotariatCollapsed((p) => !p)}
                />
              )}
              {renderActiveStepForm()}
            </div>

            {/* Right Column (5 Cols): Component 3 (Live Deed Viewer) */}
            <div className="hidden lg:block lg:col-span-5 sticky top-24 h-[calc(100vh-7.5rem)]">
              <LiveDeedViewer
                form={form}
                onSaveDraft={() => setIsSaveDraftModalOpen(true)}
                onRequestDownload={() => setIsDownloadModalOpen(true)}
                isSaving={isSaving}
                lastSaved={lastSaved}
              />
            </div>
          </div>
        </main>
      )}

      {/* PRESET 2: SPLIT SEIMBANG 50:50 (Compact Top Stepper + 6/6 Equal Split) */}
      {desktopLayout === "split-50-50" && (
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 pb-36 lg:pb-12 w-full flex-1">
          {/* Component 1: Compact Horizontal Pill Bar */}
          <WizardStepper
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            entityType={form.jenis_badan_usaha}
            variant="compact"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (6 Cols): Component 2 Form with Collapsed Summary Card 2A */}
            <div className="lg:col-span-6 space-y-5">
              {isNotariatPanelOpen && (
                <MasterNotariatCard
                  form={form}
                  updateField={updateField}
                  isCollapsed={isNotariatCollapsed}
                  onToggleCollapse={() => setIsNotariatCollapsed((p) => !p)}
                />
              )}
              {renderActiveStepForm()}
            </div>

            {/* Right Column (6 Cols): Wider Component 3 Live Deed Viewer (80 char comfortable line) */}
            <div className="hidden lg:block lg:col-span-6 sticky top-24 h-[calc(100vh-7.5rem)]">
              <LiveDeedViewer
                form={form}
                onSaveDraft={() => setIsSaveDraftModalOpen(true)}
                onRequestDownload={() => setIsDownloadModalOpen(true)}
                isSaving={isSaving}
                lastSaved={lastSaved}
              />
            </div>
          </div>
        </main>
      )}

      {/* PRESET 3: 3-KOLOM STUDIO PRO (Left Vertical Rail + Center Form + Right Preview) */}
      {desktopLayout === "studio-3col" && (
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 pb-36 lg:pb-12 w-full flex-1">
          {/* Mobile Fallback: Horizontal Compact Stepper */}
          <div className="lg:hidden mb-4">
            <WizardStepper
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              entityType={form.jenis_badan_usaha}
              variant="compact"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (2 Cols): Component 1 Vertical Step Navigation Rail */}
            <div className="hidden lg:block lg:col-span-2 sticky top-24">
              <WizardStepper
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                entityType={form.jenis_badan_usaha}
                variant="vertical"
              />
            </div>

            {/* Center Column (5 Cols): Component 2 Form Pengisian */}
            <div className="lg:col-span-5 space-y-6">
              {isNotariatPanelOpen && (
                <MasterNotariatCard
                  form={form}
                  updateField={updateField}
                  isCollapsed={isNotariatCollapsed}
                  onToggleCollapse={() => setIsNotariatCollapsed((p) => !p)}
                />
              )}
              {renderActiveStepForm()}
            </div>

            {/* Right Column (5 Cols): Component 3 Full-Height Live Deed Viewer */}
            <div className="hidden lg:block lg:col-span-5 sticky top-24 h-[calc(100vh-7.5rem)]">
              <LiveDeedViewer
                form={form}
                onSaveDraft={() => setIsSaveDraftModalOpen(true)}
                onRequestDownload={() => setIsDownloadModalOpen(true)}
                isSaving={isSaving}
                lastSaved={lastSaved}
              />
            </div>
          </div>
        </main>
      )}

      {/* PRESET 4: BENTO MULTI-PANEL (Left Main Form + Stacked Right Panels) */}
      {desktopLayout === "bento-grid" && (
        <main className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 pb-36 lg:pb-12 w-full flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 Cols): Component 1 (Compact Stepper) + Card 2B (Active Step Form) */}
            <div className="lg:col-span-7 space-y-5">
              <WizardStepper
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                entityType={form.jenis_badan_usaha}
                variant="compact"
              />
              {renderActiveStepForm()}
            </div>

            {/* Right Column (5 Cols): Stacked Panels (Fixed Viewport Height so inner scroll areas work!) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col gap-4 sticky top-24 h-[calc(100vh-7.5rem)]">
              {/* Right Top: Card 2A Notariat Panel */}
              {isNotariatPanelOpen && (
                <div className="shrink-0 max-h-[34vh] overflow-y-auto rounded-2xl shadow-sm border border-slate-200/80">
                  <MasterNotariatCard
                    form={form}
                    updateField={updateField}
                    isCollapsed={isNotariatCollapsed}
                    onToggleCollapse={() => setIsNotariatCollapsed((p) => !p)}
                    compactHeader={true}
                  />
                </div>
              )}

              {/* Right Bottom: Component 3 Live Deed Viewer (min-h-0 allows flexbox shrinking & enables internal scroll!) */}
              <div className="flex-1 min-h-0 h-full rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <LiveDeedViewer
                  form={form}
                  onSaveDraft={() => setIsSaveDraftModalOpen(true)}
                  onRequestDownload={() => setIsDownloadModalOpen(true)}
                  isSaving={isSaving}
                  lastSaved={lastSaved}
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ===================== MOBILE PREVIEW FAB & SWIPE-TO-CLOSE BOTTOM SHEET ===================== */}
      <FloatingPreviewFAB
        onClick={() => setIsMobilePreviewOpen(true)}
        badgeCount={form.pendiri.length}
      />

      <MobileDeedBottomSheet
        isOpen={isMobilePreviewOpen}
        onClose={() => setIsMobilePreviewOpen(false)}
        form={form}
        onSaveDraft={() => setIsSaveDraftModalOpen(true)}
        onRequestDownload={() => setIsDownloadModalOpen(true)}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      {/* ===================== MODALS ===================== */}

      {/* Riwayat Draf */}
      {isHistoryModalOpen && (
        <DraftHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          onRestoreDraft={(saved, draftId) => {
            setForm(saved);
            if (draftId) setCurrentDraftId(draftId);
            setActiveStep(1);
            notify.info(
              "Draf Berhasil Dipulihkan",
              `Draf "${saved.nama_draft || saved.nama_perusahaan}" dimuat ke editor`
            );
          }}
        />
      )}

      {/* Simpan Draf dengan Nama Berkas & Versi */}
      <SaveDraftModal
        isOpen={isSaveDraftModalOpen}
        onClose={() => setIsSaveDraftModalOpen(false)}
        defaultDraftName={
          form.nama_draft ||
          form.nama_perusahaan ||
          `Draf Akta ${form.jenis_badan_usaha || "PT"}`
        }
        isExistingDraft={Boolean(currentDraftId)}
        isSaving={isSaving}
        onConfirmSave={async (draftName, saveAsNew) => {
          try {
            await saveDraftToCloud(draftName, saveAsNew);
          } catch (err: any) {
            console.error(err);
          }
        }}
      />

      {/* Download Deed Word (.docx) Modal with Filename Editor */}
      <DownloadDeedModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        form={form}
        onConfirmDownload={handleConfirmDownload}
      />

      {/* Unified Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        icon={confirmDialog.icon}
        onConfirm={confirmDialog.onConfirm}
        onClose={closeConfirm}
      />

      {/* ===================== NOTIFIKASI CONTAINER (DESKTOP TOP-RIGHT & MOBILE BOTTOM) ===================== */}
      <NotificationContainer />

    </div>
  );
}

export default function App() {
  return (
    <AuthGuard>
      <StudioWorkspace />
    </AuthGuard>
  );
}

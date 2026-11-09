import React, { useState, useEffect } from "react";
import { X, Save, FileText, CheckCircle2, CopyPlus, RefreshCw } from "lucide-react";

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDraftName: string;
  isExistingDraft: boolean;
  isSaving: boolean;
  onConfirmSave: (draftName: string, saveAsNew: boolean) => Promise<void> | void;
}

export const SaveDraftModal: React.FC<SaveDraftModalProps> = ({
  isOpen,
  onClose,
  defaultDraftName,
  isExistingDraft,
  isSaving,
  onConfirmSave,
}) => {
  const [draftName, setDraftName] = useState(defaultDraftName);
  const [saveAsNew, setSaveAsNew] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraftName(defaultDraftName || "Draf Akta Baru");
      setSaveAsNew(false);
    }
  }, [isOpen, defaultDraftName]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = draftName.trim() || defaultDraftName || "Draf Akta Baru";
    await onConfirmSave(finalName, saveAsNew);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
                Simpan Draf Akta
              </h3>
              <p className="text-[11px] text-slate-500">
                Beri nama draf akta untuk tersimpan rapi di riwayat cloud
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Nama / Judul Draf Akta <span className="text-red-500">*</span>
            </label>
            <div className="relative flex rounded-xl border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 overflow-hidden shadow-2xs">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Contoh: Draf PT Nuansa Legal - Revisi 1"
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-400">
              💡 Nama ini akan menjadi judul penanda di daftar Riwayat Draf Anda.
            </p>
          </div>

          {/* Opsi Timpa vs Simpan Baru jika sedang mengedit draf lama */}
          {isExistingDraft && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="block font-bold text-slate-700 text-[11px]">
                Metode Penyimpanan:
              </span>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:border-emerald-400 transition-colors">
                <input
                  type="radio"
                  name="saveMethod"
                  checked={!saveAsNew}
                  onChange={() => setSaveAsNew(false)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Perbarui Draf Ini</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Menimpa perubahan pada draf yang sedang aktif dibuka.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:border-emerald-400 transition-colors">
                <input
                  type="radio"
                  name="saveMethod"
                  checked={saveAsNew}
                  onChange={() => setSaveAsNew(true)}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CopyPlus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Simpan Sebagai Draf Baru</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Membuat salinan draf baru tanpa mengubah draf sebelumnya.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSaving || !draftName.trim()}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Menyimpan..." : "Simpan ke Riwayat"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};


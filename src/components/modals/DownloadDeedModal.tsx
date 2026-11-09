import React, { useState, useEffect } from "react";
import { AktaFormState } from "../../types/akta.types";
import { X, FileDown, FileText, CheckCircle2, ShieldCheck, Edit3 } from "lucide-react";

interface DownloadDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: AktaFormState;
  onConfirmDownload: (fileName: string) => void;
}

export const DownloadDeedModal: React.FC<DownloadDeedModalProps> = ({
  isOpen,
  onClose,
  form,
  onConfirmDownload,
}) => {
  const isPT = form.jenis_badan_usaha === "PT";
  const defaultRawName = `DRAFT_PENDIRIAN_${form.jenis_badan_usaha}_${(form.nama_perusahaan || "BARU").trim().replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`;

  const [fileName, setFileName] = useState(defaultRawName);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFileName(defaultRawName);
      setIsDownloading(false);
    }
  }, [isOpen, form.jenis_badan_usaha, form.nama_perusahaan]);

  if (!isOpen) return null;

  const handleDownloadSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = fileName.trim() || defaultRawName;
    setIsDownloading(true);
    try {
      onConfirmDownload(clean);
      onClose();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
                Unduh Akta Otentik (.docx)
              </h3>
              <p className="text-[11px] text-slate-500">
                Atur nama berkas dokumen Word sebelum disimpan
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
        <form onSubmit={handleDownloadSubmit} className="space-y-4">
          
          {/* Metadata Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Entitas Usaha:</span>
              <span className="font-bold text-slate-900">{isPT ? "PT" : "CV"} {form.nama_perusahaan || "DRAF BARU"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Format Dokumen:</span>
              <span className="font-semibold text-indigo-700 font-mono">Microsoft Word (.docx)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Standar Format:</span>
              <span className="text-slate-700 font-mono text-[11px]">Courier New (Spasi Ganda)</span>
            </div>
          </div>

          {/* Edit File Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nama Berkas Dokumen</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Dapat disesuaikan</span>
            </label>

            <div className="relative flex rounded-xl border border-slate-300 bg-white focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 overflow-hidden shadow-2xs">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Contoh: Draf_Akta_Pendirian_PT_..."
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none"
                autoFocus
              />
              <span className="inline-flex items-center px-3 text-xs font-bold text-slate-500 bg-slate-100 border-l border-slate-200 select-none">
                .docx
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              💡 File akan langsung tersimpan ke folder Download perangkat Anda.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isDownloading || !fileName.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isDownloading ? "Memproses..." : "Unduh Dokumen Sekarang"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};


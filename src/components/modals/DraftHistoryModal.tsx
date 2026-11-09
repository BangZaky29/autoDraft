import React, { useEffect, useState } from "react";
import { AktaFormState } from "../../types/akta.types";
import {
  X,
  History,
  Trash2,
  ArrowUpRight,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { ConfirmModal } from "./ConfirmModal";
import { notify } from "../../lib/notificationStore";

interface DraftHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreDraft: (draft: AktaFormState, draftId?: string) => void;
}

interface DraftRecord {
  id: string;
  jenis_badan_usaha: "PT" | "CV";
  nama_perusahaan: string;
  nama_draft?: string;
  nomor_akta: string;
  payload_json: AktaFormState;
  updated_at: string;
}

const ITEMS_PER_PAGE = 3;

export const DraftHistoryModal: React.FC<DraftHistoryModalProps> = ({
  isOpen,
  onClose,
  onRestoreDraft,
}) => {
  const [drafts, setDrafts] = useState<DraftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentPage(1);

    async function fetchDrafts() {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const { data, error } = await supabase
            .from("akta_drafts")
            .select("*")
            .eq("user_email", session.user.email)
            .order("updated_at", { ascending: false });

          if (!error && data) {
            setDrafts(data);
          }
        }
      } catch (err) {
        console.error("Gagal memuat history draf:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDrafts();
  }, [isOpen]);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await supabase.from("akta_drafts").delete().eq("id", deleteTargetId);
      setDrafts((prev) => {
        const updated = prev.filter((d) => d.id !== deleteTargetId);
        const newTotalPages = Math.max(1, Math.ceil(updated.length / ITEMS_PER_PAGE));
        if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
        }
        return updated;
      });
      notify.info("Draf Dihapus", "Draf akta berhasil dihapus dari cloud database");
    } catch (e: any) {
      console.error(e);
      notify.error("Gagal Menghapus", e?.message || "Terjadi kesalahan saat menghapus draf");
    } finally {
      setDeleteTargetId(null);
    }
  };

  if (!isOpen) return null;

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(drafts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedDrafts = drafts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Helper untuk generate nomor halaman (maks 5 tombol angka di bar)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
                Riwayat & Versi Draf Akta
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilih versi draf untuk dimuat kembali ke editor formulir
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: List 3 Draf per Halaman */}
        <div className="space-y-2.5 min-h-[220px] flex-1 flex flex-col justify-start">
          {loading ? (
            <div className="py-14 text-center text-xs text-slate-400 font-mono flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Memuat daftar draf dari Supabase...</span>
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <FileText className="w-9 h-9 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-600 font-bold">
                Belum ada draf tersimpan di database.
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Gunakan tombol "Simpan Draf" di panel Live Preview untuk menyimpan draf dan riwayat versi Anda.
              </p>
            </div>
          ) : (
            displayedDrafts.map((d) => (
              <div
                key={d.id}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 flex items-center justify-between gap-3 transition-colors shadow-2xs group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        d.jenis_badan_usaha === "PT"
                          ? "bg-indigo-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {d.jenis_badan_usaha}
                    </span>
                    <h4
                      className="font-heading font-bold text-slate-900 text-xs sm:text-sm truncate"
                      title={d.nama_draft || d.nama_perusahaan}
                    >
                      {d.nama_draft || d.nama_perusahaan || "Draf Tanpa Judul"}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-500 font-sans">
                    <span className="font-semibold text-slate-700 truncate max-w-[170px] sm:max-w-[210px]">
                      🏢 {d.nama_perusahaan || "Belum ada nama PT/CV"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-400">
                      Akta No. {d.nomor_akta || "-"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(d.updated_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreDraft(d.payload_json, d.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    title="Muat draf ini ke editor"
                  >
                    <span>Pulihkan</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus draf"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar (Maksimal 3 Baris per Halaman) */}
        {!loading && drafts.length > ITEMS_PER_PAGE && (
          <div className="pt-2.5 pb-1 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-500 font-medium">
              Hal. <span className="font-bold text-slate-800">{currentPage}</span> dari{" "}
              <span className="font-bold text-slate-800">{totalPages}</span>{" "}
              <span className="hidden sm:inline text-slate-400">
                • Total {drafts.length} draf
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-7 h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">
            {drafts.length} draf tersimpan di database PostgreSQL
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Modal untuk Hapus Draf */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Hapus Draf Akta?"
        message="Draf akta ini akan dihapus permanen dari cloud database Supabase. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus Draf"
        cancelText="Batal"
        variant="danger"
        icon="trash"
        onConfirm={executeDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};


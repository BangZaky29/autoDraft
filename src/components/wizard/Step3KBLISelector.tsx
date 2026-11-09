import React, { useState, useEffect } from "react";
import { AktaFormState, ItemKBLI } from "../../types/akta.types";
import { Search, Plus, Trash2, Check, BookOpen, Layers, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { notify } from "../../lib/notificationStore";

interface Step3Props {
  form: AktaFormState;
  updateField: <K extends keyof AktaFormState>(key: K, value: AktaFormState[K]) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Katalog offline bawaan akta
const DEFAULT_CATALOG: ItemKBLI[] = [
  {
    kode_kbli: "16101",
    judul_kbli: "INDUSTRI PENGGERGAJIAN DAN PENGHALUSAN KAYU",
    kode_kategori: "C",
    nama_kategori: "INDUSTRI PENGOLAHAN",
    uraian_kbli: "Kelompok ini mencakup usaha penggergajian dan penghalusan kayu, balok, papan, bantalan rel kereta api dan sejenisnya.",
  },
  {
    kode_kbli: "16211",
    judul_kbli: "INDUSTRI KAYU LAPIS",
    kode_kategori: "C",
    nama_kategori: "INDUSTRI PENGOLAHAN",
    uraian_kbli: "Kelompok ini mencakup usaha pembuatan kayu lapis (plywood), kayu lapis cetak, blockboard dan papan laminasi sejenis.",
  },
  {
    kode_kbli: "46799",
    judul_kbli: "PERDAGANGAN BESAR HASIL HUTAN DAN PERKEBUNAN LAINNYA",
    kode_kategori: "G",
    nama_kategori: "PERDAGANGAN BESAR DAN ECERAN",
    uraian_kbli: "Kelompok ini mencakup usaha perdagangan besar hasil hutan dan perkebunan lainnya seperti damar, rotan, kayu olahan, getah dan produk sejenis.",
  },
  {
    kode_kbli: "52291",
    judul_kbli: "JASA PENGURUSAN TRANSPORTASI (FREIGHT FORWARDING)",
    kode_kategori: "H",
    nama_kategori: "PENGANGKUTAN DAN PERGUDANGAN",
    uraian_kbli: "Kelompok ini mencakup usaha pengiriman dan pengepakan barang dalam jumlah besar atas nama pengirim atau penerima melalui berbagai moda transportasi darat, laut, atau udara.",
  },
  {
    kode_kbli: "62019",
    judul_kbli: "AKTIVITAS PENGEMBANGAN APLIKASI PERDAGANGAN ELEKTRONIK (E-COMMERCE)",
    kode_kategori: "J",
    nama_kategori: "INFORMASI DAN KOMUNIKASI",
    uraian_kbli: "Kelompok ini mencakup kegiatan perancangan, pembuatan dan pemeliharaan aplikasi komersial daring, integrasi gerbang pembayaran, dan katalog produk digital.",
  },
  {
    kode_kbli: "41011",
    judul_kbli: "KONSTRUKSI GEDUNG HUNIAN",
    kode_kategori: "F",
    nama_kategori: "KONSTRUKSI",
    uraian_kbli: "Kelompok ini mencakup usaha pembangunan gedung tempat tinggal seperti rumah tinggal, apartemen, kondominium, dan perumahan rakyat.",
  },
];

export const Step3KBLISelector: React.FC<Step3Props> = ({
  form,
  updateField,
  onNext,
  onPrev,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ItemKBLI[]>(DEFAULT_CATALOG);
  const [isSearching, setIsSearching] = useState(false);

  // Live Query ke Supabase `master_kbli`
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(DEFAULT_CATALOG);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from("master_kbli")
          .select("*")
          .or(`kode_kbli.ilike.%${q}%,judul_kbli.ilike.%${q}%,uraian_kbli.ilike.%${q}%`)
          .limit(10);

        if (!error && data && data.length > 0) {
          setSearchResults(data);
        } else {
          // Fallback filter lokal
          const filtered = DEFAULT_CATALOG.filter(
            (k) =>
              k.kode_kbli.includes(q) ||
              k.judul_kbli.toLowerCase().includes(q.toLowerCase())
          );
          setSearchResults(filtered);
        }
      } catch {
        const filtered = DEFAULT_CATALOG.filter(
          (k) =>
            k.kode_kbli.includes(q) ||
            k.judul_kbli.toLowerCase().includes(q.toLowerCase())
        );
        setSearchResults(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleKBLI = (item: ItemKBLI) => {
    const exists = form.kbli.some((k) => k.kode_kbli === item.kode_kbli);
    if (exists) {
      updateField(
        "kbli",
        form.kbli.filter((k) => k.kode_kbli !== item.kode_kbli)
      );
      notify.info("KBLI Dihapus", `Kode ${item.kode_kbli} dihapus dari maksud & tujuan`);
    } else {
      updateField("kbli", [...form.kbli, item]);
      notify.success("KBLI Ditambahkan", `Kode ${item.kode_kbli} - ${item.judul_kbli}`);
    }
  };

  const handleRemoveKBLI = (kode: string) => {
    updateField(
      "kbli",
      form.kbli.filter((k) => k.kode_kbli !== kode)
    );
    notify.info("KBLI Dihapus", `Kode ${kode} dihapus dari daftar akta`);
  };

  // Kategori Unik untuk Pasal 3 Ayat 1
  const uniqueCategories = Array.from(
    new Set(form.kbli.map((k) => `KATEGORI ${k.kode_kategori} (${k.nama_kategori})`))
  );

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              PASAL 3 ANGGARAN DASAR
            </span>
            <span className="text-xs text-slate-400 font-mono">Kitab Klasifikasi Baku Lapangan Usaha (KBLI 2020)</span>
          </div>
          <h2 className="text-lg font-heading font-bold text-slate-900 mt-1">
            Maksud, Tujuan & Kegiatan Usaha Perusahaan
          </h2>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 self-start sm:self-auto font-mono">
          {form.kbli.length} KBLI Terpilih
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kode KBLI (misal: 16101) atau kata kunci usaha (kayu, kargo, software, konstruksi)..."
          className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-800 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
        />
        {isSearching && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
            Mencari...
          </span>
        )}
      </div>

      {/* Search Results Catalog */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Katalog Pilihan KBLI 2020 (Centang untuk Menambahkan ke Akta)
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
          {searchResults.map((item) => {
            const isSelected = form.kbli.some((k) => k.kode_kbli === item.kode_kbli);
            return (
              <div
                key={item.kode_kbli}
                onClick={() => handleToggleKBLI(item)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? "bg-indigo-50/60 border-indigo-300 text-indigo-950"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700"
                }`}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 text-[11px]">
                      {item.kode_kbli}
                    </span>
                    <span className="font-bold truncate">{item.judul_kbli}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.uraian_kbli}
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-slate-300 text-transparent"
                  }`}
                >
                  <Check className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Pasal 3 Preview */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800">
            Preview Struktur Otomatis Klausul Pasal 3 di Dokumen Word
          </h3>
        </div>

        {/* Ayat 1: Kategori Induk */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
          <span className="font-bold text-slate-700 block">
            1. Maksud dan Tujuan (Kategori Induk):
          </span>
          {uniqueCategories.length > 0 ? (
            <ul className="list-disc list-inside text-slate-600 font-serif space-y-1 text-[11px]">
              {uniqueCategories.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 italic text-[11px]">
              Belum ada KBLI yang dipilih. Silakan pilih minimal 1 KBLI di atas.
            </p>
          )}
        </div>

        {/* Ayat 2: Uraian Kegiatan Usaha */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
          <span className="font-bold text-slate-700 block">
            2. Rincian Kegiatan Usaha:
          </span>
          {form.kbli.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {form.kbli.map((k) => (
                <span
                  key={k.kode_kbli}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-mono font-medium"
                >
                  <span>{k.kode_kbli}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveKBLI(k.kode_kbli);
                    }}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic text-[11px]">
              Daftar kegiatan usaha kosong.
            </p>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          ← Kembali ke Komparisi
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={form.kbli.length === 0}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-heading font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          Lanjut ke Permodalan & Pengurus →
        </button>
      </div>

    </div>
  );
};


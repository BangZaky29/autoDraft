import React, { useState } from "react";
import { AktaFormState } from "../../types/akta.types";
import { supabase } from "../../lib/supabase";
import { Sparkles, CheckCircle2, Building, ShieldCheck, Trash2, Scale } from "lucide-react";
import { ConfirmVariant, ConfirmIconType } from "../modals/ConfirmModal";

export interface ConfirmRequestOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: ConfirmIconType;
  onConfirm: () => void;
}

interface DevAutoFillBarProps {
  onLoadDummy: (dummyData: AktaFormState, label: string) => void;
  onRequestConfirm?: (options: ConfirmRequestOptions) => void;
}

// Fallback data lokal jika offline
const LOCAL_FALLBACK_PT: Partial<AktaFormState> = {
  jenis_badan_usaha: "PT",
  nama_perusahaan: "PACSTRA INDUSTRIAL LOGISTICS",
  nomor_akta: "08",
  alamat_perusahaan: "Kawasan Industri Delta Silicon III, Jl. Gaharu No. 12",
  rt_perusahaan: "001",
  rw_perusahaan: "002",
  kel_perusahaan: "Cicau",
  kec_perusahaan: "Cikarang Pusat",
  kab_kota_perusahaan: "Kabupaten Bekasi",
  prov_perusahaan: "Jawa Barat",
  kode_pos_perusahaan: "17530",
  tgl_tutup_buku: "2026-12-31",
  modal_dasar: 1000000000,
  nominal_per_saham: 50000,
  modal_disetor: 250000000,
  pendiri: [
    {
      id: "1",
      sapaan: "Tuan",
      nama_lengkap: "MUHAMMAD RIFKY FATIHAH",
      nik: "3201071406950002",
      tempat_lahir: "Bogor",
      tgl_lahir: "1995-06-14",
      pekerjaan: "Karyawan Swasta",
      alamat_jalan: "Kp. Parung Ponteng RT 003 RW 001",
      rt: "003",
      rw: "001",
      kelurahan: "Tajur",
      kecamatan: "Citeureup",
      kab_kota: "Kabupaten Bogor",
      provinsi: "Jawa Barat",
      jumlah_lembar_saham: 3000,
      jabatan_pt: "DIREKTUR UTAMA",
      nominal_modal_cv: 100000000,
      jabatan_cv: "PERSERO PENGURUS (DIREKTUR)",
    },
    {
      id: "2",
      sapaan: "Tuan",
      nama_lengkap: "BAGUS SETIAWAN",
      nik: "3216062701740003",
      tempat_lahir: "Bekasi",
      tgl_lahir: "1974-01-27",
      pekerjaan: "Wiraswasta",
      alamat_jalan: "Perumahan Taman Aster Blok C1 No. 5",
      rt: "005",
      rw: "007",
      kelurahan: "Telaga Asih",
      kecamatan: "Cikarang Barat",
      kab_kota: "Kabupaten Bekasi",
      provinsi: "Jawa Barat",
      jumlah_lembar_saham: 1500,
      jabatan_pt: "DIREKTUR",
      nominal_modal_cv: 30000000,
      jabatan_cv: "PERSERO KOMANDITER",
    },
    {
      id: "3",
      sapaan: "Nyonya",
      nama_lengkap: "SITI NURHALIZA",
      nik: "3216065508920004",
      tempat_lahir: "Bekasi",
      tgl_lahir: "1992-08-15",
      pekerjaan: "Wiraswasta",
      alamat_jalan: "Jl. Flamboyan No. 8 RT 002 RW 004",
      rt: "002",
      rw: "004",
      kelurahan: "Sukamahi",
      kecamatan: "Cikarang Pusat",
      kab_kota: "Kabupaten Bekasi",
      provinsi: "Jawa Barat",
      jumlah_lembar_saham: 500,
      jabatan_pt: "KOMISARIS UTAMA",
      nominal_modal_cv: 20000000,
      jabatan_cv: "PERSERO KOMANDITER",
    },
  ],
  kbli: [
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
      uraian_kbli: "Kelompok ini mencakup usaha pembuatan kayu lapis biasa.",
    },
    {
      kode_kbli: "46799",
      judul_kbli: "PERDAGANGAN BESAR HASIL HUTAN DAN PERKEBUNAN LAINNYA",
      kode_kategori: "G",
      nama_kategori: "PERDAGANGAN BESAR DAN ECERAN",
      uraian_kbli: "Kelompok ini mencakup usaha perdagangan besar hasil hutan dan perkebunan lainnya seperti damar, rotan, kayu olahan, getah dan produk sejenis.",
    },
  ],
};

const LOCAL_FALLBACK_CV: Partial<AktaFormState> = {
  jenis_badan_usaha: "CV",
  nama_perusahaan: "PONDOK MANDIRI LOGISTIK",
  nomor_akta: "04",
  alamat_perusahaan: "Jl. Raya Cikarang - Cibarusah No. 88",
  rt_perusahaan: "003",
  rw_perusahaan: "005",
  kel_perusahaan: "Pasirsari",
  kec_perusahaan: "Cikarang Selatan",
  kab_kota_perusahaan: "Kabupaten Bekasi",
  prov_perusahaan: "Jawa Barat",
  kode_pos_perusahaan: "17532",
  pengadilan_negeri_cv: "Pengadilan Negeri Cikarang Kelas IB",
  tgl_tutup_buku: "2026-12-31",
  total_modal_cv: 150000000,
  pendiri: [
    {
      id: "1",
      sapaan: "Tuan",
      nama_lengkap: "HENDRA WIJAYA",
      nik: "3216061103850001",
      tempat_lahir: "Bekasi",
      tgl_lahir: "1985-03-11",
      pekerjaan: "Wiraswasta",
      alamat_jalan: "Jl. Garuda No. 12 RT 001 RW 002",
      rt: "001",
      rw: "002",
      kelurahan: "Pasirsari",
      kecamatan: "Cikarang Selatan",
      kab_kota: "Kabupaten Bekasi",
      provinsi: "Jawa Barat",
      jumlah_lembar_saham: 0,
      jabatan_pt: "DIREKTUR",
      nominal_modal_cv: 100000000,
      jabatan_cv: "PERSERO PENGURUS (DIREKTUR)",
    },
    {
      id: "2",
      sapaan: "Tuan",
      nama_lengkap: "DEDI KURNIAWAN",
      nik: "3216062507880005",
      tempat_lahir: "Karawang",
      tgl_lahir: "1988-07-25",
      pekerjaan: "Karyawan Swasta",
      alamat_jalan: "Kp. Pasir Konci No. 45",
      rt: "002",
      rw: "003",
      kelurahan: "Pasirsari",
      kecamatan: "Cikarang Selatan",
      kab_kota: "Kabupaten Bekasi",
      provinsi: "Jawa Barat",
      jumlah_lembar_saham: 0,
      jabatan_pt: "KOMISARIS",
      nominal_modal_cv: 50000000,
      jabatan_cv: "PERSERO KOMANDITER",
    },
  ],
  kbli: [
    {
      kode_kbli: "49431",
      judul_kbli: "ANGKUTAN BERMOTOR UNTUK BARANG UMUM",
      kode_kategori: "H",
      nama_kategori: "PENGANGKUTAN DAN PERGUDANGAN",
      uraian_kbli: "Kelompok ini mencakup usaha pengangkutan barang dengan kendaraan bermotor.",
    },
    {
      kode_kbli: "52101",
      judul_kbli: "PERGUDANGAN DAN PENYIMPANAN",
      kode_kategori: "H",
      nama_kategori: "PENGANGKUTAN DAN PERGUDANGAN",
      uraian_kbli: "Kelompok ini mencakup usaha jasa penyimpanan atau pergudangan untuk berbagai jenis barang.",
    },
    {
      kode_kbli: "46799",
      judul_kbli: "PERDAGANGAN BESAR HASIL HUTAN DAN PERKEBUNAN LAINNYA",
      kode_kategori: "G",
      nama_kategori: "PERDAGANGAN BESAR DAN ECERAN",
      uraian_kbli: "Kelompok ini mencakup usaha perdagangan besar hasil hutan dan perkebunan lainnya seperti damar, rotan, kayu olahan, getah dan produk sejenis.",
    },
  ],
};

export const DevAutoFillBar: React.FC<DevAutoFillBarProps> = ({
  onLoadDummy,
  onRequestConfirm,
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const executeAutoFill = async (type: "PT" | "CV") => {
    setLoadingType(type);
    const templateId = type === "PT" ? "DUMMY_PT_LENGKAP" : "DUMMY_CV_LENGKAP";
    const fallback = type === "PT" ? LOCAL_FALLBACK_PT : LOCAL_FALLBACK_CV;

    try {
      // 1. Coba ambil dari tabel Supabase dummy_dev_templates
      const { data, error } = await supabase
        .from("dummy_dev_templates")
        .select("payload_json")
        .eq("id", templateId)
        .maybeSingle();

      if (!error && data?.payload_json) {
        onLoadDummy(data.payload_json as AktaFormState, `Data Dummy ${type} dari Supabase`);
      } else {
        // 2. Jika offline / belum migrasi, gunakan fallback lokal
        onLoadDummy(fallback as AktaFormState, `Data Dummy ${type} (Lokal)`);
      }
    } catch {
      onLoadDummy(fallback as AktaFormState, `Data Dummy ${type} (Lokal)`);
    } finally {
      setLoadingType(null);
    }
  };

  const handleAutoFillClick = (type: "PT" | "CV") => {
    if (onRequestConfirm) {
      onRequestConfirm({
        title: `Muat Data Simulasi ${type}?`,
        message: `Seluruh isian formulir akta akan diisi otomatis dengan data simulasi lengkap untuk ${type === "PT" ? "Perseroan Terbatas (PT)" : "Persekutuan Komanditer (CV)"}. Isian saat ini akan digantikan.`,
        confirmText: `Ya, Isi Dummy ${type}`,
        variant: type === "PT" ? "primary" : "emerald",
        icon: "sparkles",
        onConfirm: () => executeAutoFill(type),
      });
    } else {
      executeAutoFill(type);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
      {/* Left: Label Otomasi */}
      <div className="flex items-center gap-2">
        <span className="text-slate-600 font-bold text-xs">
          Otomasi Pengisian Seluruh Field Akta:
        </span>
      </div>

      {/* Right: Dummy Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleAutoFillClick("PT")}
          disabled={loadingType !== null}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Building className="w-3.5 h-3.5" />
          <span>{loadingType === "PT" ? "Memuat..." : "⚡ Isi Dummy PT Lengkap"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleAutoFillClick("CV")}
          disabled={loadingType !== null}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Building className="w-3.5 h-3.5" />
          <span>{loadingType === "CV" ? "Memuat..." : "⚡ Isi Dummy CV Lengkap"}</span>
        </button>
      </div>
    </div>
  );
};
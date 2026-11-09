import React from "react";
import { AktaFormState, JenisBadanUsaha } from "../../types/akta.types";
import {
  Building2,
  Copy,
  Calendar,
  Shield,
} from "lucide-react";
import { tanggalKeTerbilang } from "../../lib/terbilang";

interface Step1Props {
  form: AktaFormState;
  updateField: <K extends keyof AktaFormState>(key: K, value: AktaFormState[K]) => void;
  setEntity: (type: JenisBadanUsaha) => void;
  copyAddressFromFounder1: () => void;
  onNext: () => void;
}

export const Step1CompanyInfo: React.FC<Step1Props> = ({
  form,
  updateField,
  setEntity,
  copyAddressFromFounder1,
  onNext,
}) => {
  const isPT = form.jenis_badan_usaha === "PT";

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
      {/* Top Banner & Entity Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              PASAL 1 ANGGARAN DASAR
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Bentuk & Kedudukan Hukum
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 mt-1">
            Identitas Badan Usaha & Domisili Kantor Pusat
          </h2>
        </div>

        {/* Dual-Entity Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setEntity("PT")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isPT
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            PT (Perseroan Terbatas)
          </button>
          <button
            type="button"
            onClick={() => setEntity("CV")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isPT
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            CV (Komanditer)
          </button>
        </div>
      </div>

      {/* Row 1: Nama Perusahaan & Nomor Akta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Nama Lengkap Badan Usaha <span className="text-red-500">*</span>
          </label>
          <div className="relative flex rounded-xl border border-slate-300 bg-white focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 overflow-hidden shadow-2xs">
            <span className="inline-flex items-center px-3 text-xs font-bold text-slate-500 bg-slate-50 border-r border-slate-200 select-none">
              {isPT ? "PT." : "CV."}
            </span>
            <input
              type="text"
              value={form.nama_perusahaan}
              onChange={(e) =>
                updateField("nama_perusahaan", e.target.value.toUpperCase())
              }
              placeholder="CONTOH: PACSTRA INDUSTRIAL LOGISTICS"
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 uppercase outline-none"
            />
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Tag template: &#123;nama_perusahaan&#125;
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Nomor Akta Notaris
          </label>
          <input
            type="text"
            value={form.nomor_akta}
            onChange={(e) => updateField("nomor_akta", e.target.value)}
            placeholder="08 (atau kosongkan untuk draf)"
            className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none shadow-2xs"
          />
          <p className="text-[10px] text-slate-400 font-mono">
            Tag template: &#123;nomor_akta&#125;
          </p>
        </div>
      </div>

      {/* Row 2: Alamat Kantor Pusat Terstruktur */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Alamat Domisili Kantor Pusat
            </h3>
          </div>

          <button
            type="button"
            onClick={copyAddressFromFounder1}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors cursor-pointer"
            title="Salin alamat dari Pendiri 1 sebagai alamat kantor perseroan"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin dari Pendiri 1</span>
          </button>
        </div>

        {/* Jalan / Gedung */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600">
            Jalan / Nama Gedung / Kawasan Industri <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.alamat_perusahaan}
            onChange={(e) => updateField("alamat_perusahaan", e.target.value)}
            placeholder="Kawasan Industri Delta Silicon III, Jl. Gaharu No. 12"
            className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        {/* RT / RW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">RT</label>
            <input
              type="text"
              maxLength={3}
              value={form.rt_perusahaan}
              onChange={(e) => updateField("rt_perusahaan", e.target.value.replace(/\D/g, ""))}
              placeholder="001"
              className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">RW</label>
            <input
              type="text"
              maxLength={3}
              value={form.rw_perusahaan}
              onChange={(e) => updateField("rw_perusahaan", e.target.value.replace(/\D/g, ""))}
              placeholder="002"
              className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600">Kelurahan / Desa</label>
            <input
              type="text"
              value={form.kel_perusahaan}
              onChange={(e) => updateField("kel_perusahaan", e.target.value)}
              placeholder="Cicau"
              className="w-full px-3 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
            />
          </div>
        </div>

        {/* Kecamatan & Kab/Kota */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Kecamatan</label>
            <input
              type="text"
              value={form.kec_perusahaan}
              onChange={(e) => updateField("kec_perusahaan", e.target.value)}
              placeholder="Cikarang Pusat"
              className="w-full px-3 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Kabupaten / Kota</label>
            <input
              type="text"
              value={form.kab_kota_perusahaan}
              onChange={(e) => updateField("kab_kota_perusahaan", e.target.value)}
              placeholder="Kabupaten Bekasi"
              className="w-full px-3 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
            />
          </div>
        </div>

        {/* Provinsi & Kode Pos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Provinsi</label>
            <input
              type="text"
              value={form.prov_perusahaan}
              onChange={(e) => updateField("prov_perusahaan", e.target.value)}
              placeholder="Jawa Barat"
              className="w-full px-3 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">Kode Pos</label>
            <input
              type="text"
              maxLength={5}
              value={form.kode_pos_perusahaan}
              onChange={(e) => updateField("kode_pos_perusahaan", e.target.value.replace(/\D/g, ""))}
              placeholder="17530"
              className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Field Tambahan Khusus CV: Domisili Pengadilan Negeri */}
      {!isPT && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <label className="text-xs font-bold text-amber-900">
              Wilayah Pengadilan Negeri Pendaftaran CV <span className="text-red-500">*</span>
            </label>
          </div>
          <input
            type="text"
            value={form.pengadilan_negeri_cv}
            onChange={(e) => updateField("pengadilan_negeri_cv", e.target.value)}
            placeholder="Pengadilan Negeri Cikarang Kelas IB"
            className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white rounded-lg border border-amber-300 focus:border-amber-600 outline-none shadow-2xs"
          />
          <p className="text-[11px] text-amber-800">
            Klausul hukum perselisihan akta CV: Kantor Panitera Pengadilan Negeri wilayah setempat.
          </p>
        </div>
      )}

      {/* Row 3: Penutupan Tahun Buku & Tombol Lanjut */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Penutupan Buku Pertama Kali
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={form.tgl_tutup_buku}
              onChange={(e) => updateField("tgl_tutup_buku", e.target.value)}
              className="px-3 py-1.5 text-xs font-mono text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
            />
            <span className="text-[11px] text-slate-500 font-medium">
              Ejaan: <em>{tanggalKeTerbilang(form.tgl_tutup_buku)}</em>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-heading font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer self-end"
        >
          Lanjut ke Komparisi Pendiri →
        </button>
      </div>
    </div>
  );
};

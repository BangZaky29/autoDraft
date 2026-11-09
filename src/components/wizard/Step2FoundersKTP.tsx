import React, { useState } from "react";
import { AktaFormState, PendiriAkta, Sapaan } from "../../types/akta.types";
import {
  Users,
  Plus,
  Trash2,
  Copy
} from "lucide-react";
import { tanggalKeTerbilang } from "../../lib/terbilang";
import { notify } from "../../lib/notificationStore";

interface Step2Props {
  form: AktaFormState;
  updateField: <K extends keyof AktaFormState>(key: K, value: AktaFormState[K]) => void;
  copyAddressFromFounder1: (targetIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2FoundersKTP: React.FC<Step2Props> = ({
  form,
  updateField,
  copyAddressFromFounder1,
  onNext,
  onPrev,
}) => {
  const [activeFounderTab, setActiveFounderTab] = useState<number>(0);

  const handleAddFounder = () => {
    const newId = String(form.pendiri.length + 1);
    const newFounder: PendiriAkta = {
      id: newId,
      sapaan: "Tuan",
      nama_lengkap: "",
      nik: "",
      tempat_lahir: "",
      tgl_lahir: "",
      pekerjaan: "",
      alamat_jalan: "",
      rt: "",
      rw: "",
      kelurahan: "",
      kecamatan: "",
      kab_kota: "",
      provinsi: "",
      jumlah_lembar_saham: 0,
      jabatan_pt: "DIREKTUR",
      nominal_modal_cv: 0,
      jabatan_cv: "PERSERO KOMANDITER",
    };
    updateField("pendiri", [...form.pendiri, newFounder]);
    setActiveFounderTab(form.pendiri.length);
    notify.success("Pendiri Ditambahkan", `Pendiri ke-${form.pendiri.length + 1} siap diisi datanya`);
  };

  const handleRemoveFounder = (index: number) => {
    if (form.pendiri.length <= 2) {
      notify.warning(
        "Aturan Akta Otentik",
        "Sesuai UUJN & KUHD, pendirian PT/CV minimal membutuhkan 2 orang pendiri."
      );
      return;
    }
    const updated = form.pendiri.filter((_, idx) => idx !== index);
    updateField("pendiri", updated);
    setActiveFounderTab(Math.max(0, index - 1));
    notify.info("Pendiri Dihapus", "Data pendiri berhasil dihapus");
  };

  const updateFounderField = (index: number, field: keyof PendiriAkta, value: any) => {
    const updated = [...form.pendiri];
    updated[index] = { ...updated[index], [field]: value };
    updateField("pendiri", updated);
  };

  const currentFounder = form.pendiri[activeFounderTab] || form.pendiri[0];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              KOMPARISI PARA PENGHADAP
            </span>
            <span className="text-xs text-slate-400 font-mono">Pasal 38 & 39 UUJN</span>
          </div>
          <h2 className="text-lg font-heading font-bold text-slate-900 mt-1">
            Data KTP & Identitas Lengkap Para Pendiri
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Silakan masukkan data identitas lengkap para pendiri secara manual sesuai dokumen e-KTP fisik.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddFounder}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pendiri ({form.pendiri.length + 1})</span>
        </button>
      </div>

      {/* Founder Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
        {form.pendiri.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveFounderTab(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
              activeFounderTab === idx
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>Pendiri {idx + 1}</span>
            <span className="text-[10px] opacity-80 max-w-[110px] truncate">
              {p.nama_lengkap || "Tanpa Nama"}
            </span>
          </button>
        ))}
      </div>

      {/* Founder Form Body */}
      {currentFounder && (
        <div className="space-y-5 animate-in fade-in duration-150">

          {/* Top Info Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                {activeFounderTab + 1}
              </span>
              <span className="text-xs font-bold text-slate-800">
                Formulir Komparisi Pendiri #{activeFounderTab + 1}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeFounderTab > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    copyAddressFromFounder1(activeFounderTab);
                    notify.info(
                      "Alamat Disalin",
                      `Alamat Pendiri 1 berhasil disalin ke Pendiri ${activeFounderTab + 1}`
                    );
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Alamat dari Pendiri 1</span>
                </button>
              )}

              {form.pendiri.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFounder(activeFounderTab)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus Pendiri Ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sapaan & Nama */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Sapaan Hukum</label>
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
                {(["Tuan", "Nyonya", "Nona"] as Sapaan[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateFounderField(activeFounderTab, "sapaan", s)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      currentFounder.sapaan === s
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nama Lengkap & Gelar (Sesuai KTP) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentFounder.nama_lengkap}
                onChange={(e) => updateFounderField(activeFounderTab, "nama_lengkap", e.target.value.toUpperCase())}
                placeholder="CONTOH: MUHAMMAD RIFKY FATIHAH, S.H."
                className="w-full px-3 py-2 text-xs font-bold text-slate-900 uppercase rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>

          {/* NIK & Pekerjaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={16}
                value={currentFounder.nik}
                onChange={(e) => updateFounderField(activeFounderTab, "nik", e.target.value.replace(/\D/g, ""))}
                placeholder="3201071406950002"
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none tracking-wider"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Pekerjaan</label>
              <input
                type="text"
                value={currentFounder.pekerjaan}
                onChange={(e) => updateFounderField(activeFounderTab, "pekerjaan", e.target.value)}
                placeholder="Karyawan Swasta / Wiraswasta / Pegawai Negeri"
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* Tempat & Tanggal Lahir + Terbilang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Tempat Lahir</label>
              <input
                type="text"
                value={currentFounder.tempat_lahir}
                onChange={(e) => updateFounderField(activeFounderTab, "tempat_lahir", e.target.value)}
                placeholder="Contoh: Bogor / Sabak Indah"
                className="w-full px-3 py-1.5 text-xs text-slate-800 bg-white rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">Tanggal Lahir</label>
              <input
                type="date"
                value={currentFounder.tgl_lahir}
                onChange={(e) => updateFounderField(activeFounderTab, "tgl_lahir", e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 bg-white rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="sm:col-span-2 pt-1 border-t border-slate-200 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700">Terbilang Ejaan Akta:</span>{" "}
              <em className="text-indigo-900 font-serif">
                {currentFounder.tgl_lahir ? `"${tanggalKeTerbilang(currentFounder.tgl_lahir)}"` : "(Belum diisi)"}
              </em>
            </div>
          </div>

          {/* Alamat Domisili KTP (Input Manual) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Alamat Domisili Sesuai KTP
              </label>
            </div>

            <input
              type="text"
              value={currentFounder.alamat_jalan}
              onChange={(e) => updateFounderField(activeFounderTab, "alamat_jalan", e.target.value)}
              placeholder="Nama Jalan, Kampung, Perumahan, No. Rumah (Contoh: KP. CIMANGGU)"
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">RT</label>
                <input
                  type="text"
                  maxLength={3}
                  value={currentFounder.rt}
                  onChange={(e) => updateFounderField(activeFounderTab, "rt", e.target.value)}
                  placeholder="001"
                  className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">RW</label>
                <input
                  type="text"
                  maxLength={3}
                  value={currentFounder.rw}
                  onChange={(e) => updateFounderField(activeFounderTab, "rw", e.target.value)}
                  placeholder="007"
                  className="w-full px-3 py-1.5 text-xs font-mono text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kelurahan / Desa</label>
                <input
                  type="text"
                  value={currentFounder.kelurahan}
                  onChange={(e) => updateFounderField(activeFounderTab, "kelurahan", e.target.value)}
                  placeholder="CIMANGGU II"
                  className="w-full px-3 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={currentFounder.kecamatan}
                  onChange={(e) => updateFounderField(activeFounderTab, "kecamatan", e.target.value)}
                  placeholder="CIBUNGBULANG"
                  className="w-full px-3 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={currentFounder.kab_kota}
                  onChange={(e) => updateFounderField(activeFounderTab, "kab_kota", e.target.value)}
                  placeholder="KABUPATEN BOGOR"
                  className="w-full px-3 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Provinsi</label>
                <input
                  type="text"
                  value={currentFounder.provinsi}
                  onChange={(e) => updateFounderField(activeFounderTab, "provinsi", e.target.value)}
                  placeholder="JAWA BARAT"
                  className="w-full px-3 py-1.5 text-xs text-slate-800 rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          ← Kembali ke Step 1
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-heading font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          Lanjut ke Pemilihan KBLI →
        </button>
      </div>

    </div>
  );
};

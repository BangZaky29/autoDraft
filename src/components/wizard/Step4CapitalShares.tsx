import React from "react";
import { AktaFormState, JabatanPT, JabatanCV } from "../../types/akta.types";
import { formatRibuan, rupiahKeTerbilang, angkaKeTerbilang, capitalizeFirst } from "../../lib/terbilang";
import { PieChart, CheckCircle2, AlertTriangle, FileDown, ShieldCheck, DollarSign } from "lucide-react";
import { generateDeedWord } from "../../lib/docxGenerator";
import { notify } from "../../lib/notificationStore";

interface Step4Props {
  form: AktaFormState;
  updateField: <K extends keyof AktaFormState>(key: K, value: AktaFormState[K]) => void;
  isSharesBalanced: boolean;
  isMinimumCapitalMet: boolean;
  totalLembarDisetor: number;
  totalModalDisetorKalkulasi: number;
  onPrev: () => void;
}

export const Step4CapitalShares: React.FC<Step4Props> = ({
  form,
  updateField,
  isSharesBalanced,
  isMinimumCapitalMet,
  totalLembarDisetor,
  totalModalDisetorKalkulasi,
  onPrev,
}) => {
  const isPT = form.jenis_badan_usaha === "PT";

  const targetLembarDisetor = form.nominal_per_saham > 0
    ? Math.floor(form.modal_disetor / form.nominal_per_saham)
    : 0;

  const targetLembarDasar = form.nominal_per_saham > 0
    ? Math.floor(form.modal_dasar / form.nominal_per_saham)
    : 0;

  const updateFounderShare = (index: number, shares: number) => {
    const updated = [...form.pendiri];
    updated[index] = { ...updated[index], jumlah_lembar_saham: shares };
    updateField("pendiri", updated);
  };

  const updateFounderCVCapital = (index: number, amount: number) => {
    const updated = [...form.pendiri];
    updated[index] = { ...updated[index], nominal_modal_cv: amount };
    updateField("pendiri", updated);
  };

  const updateFounderRolePT = (index: number, role: JabatanPT) => {
    const updated = [...form.pendiri];
    updated[index] = { ...updated[index], jabatan_pt: role };
    updateField("pendiri", updated);
  };

  const updateFounderRoleCV = (index: number, role: JabatanCV) => {
    const updated = [...form.pendiri];
    updated[index] = { ...updated[index], jabatan_cv: role };
    updateField("pendiri", updated);
  };

  const handleDownload = async () => {
    try {
      await generateDeedWord(form);
      notify.success("Dokumen Berhasil Diunduh", "Berkas Word (.docx) siap digunakan");
    } catch (err: any) {
      notify.error("Gagal Membuat Berkas Word", err?.message || "Terjadi kesalahan dokumen");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {isPT ? "PASAL 4 & PASAL 20 (PT)" : "PASAL 4 & PASAL 5-6 (CV)"}
            </span>
            <span className="text-xs text-slate-400 font-mono">Struktur Permodalan & Pengurus</span>
          </div>
          <h2 className="text-lg font-heading font-bold text-slate-900 mt-1">
            {isPT ? "Permodalan, Saham & Susunan Pengurus PT" : "Modal Pemasukan & Sekutu Pengurus CV"}
          </h2>
        </div>
      </div>

      {/* ===================== MODE PT ===================== */}
      {isPT ? (
        <div className="space-y-6">
          
          {/* Card Input 3 Pilar Modal PT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Modal Dasar (Rp)</label>
              <input
                type="number"
                step={1000000}
                value={form.modal_dasar}
                onChange={(e) => updateField("modal_dasar", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
              />
              <div className="text-[10px] text-slate-500 font-mono">
                {formatRibuan(targetLembarDasar)} lembar
              </div>
              <p className="text-[10px] text-indigo-900 font-serif leading-tight">
                {rupiahKeTerbilang(form.modal_dasar)}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Nilai Nominal per Saham (Rp)</label>
              <input
                type="number"
                step={10000}
                value={form.nominal_per_saham}
                onChange={(e) => updateField("nominal_per_saham", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
              />
              <p className="text-[10px] text-indigo-900 font-serif leading-tight">
                {rupiahKeTerbilang(form.nominal_per_saham)}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Modal Ditempatkan & Disetor (Rp)</label>
              <input
                type="number"
                step={1000000}
                value={form.modal_disetor}
                onChange={(e) => updateField("modal_disetor", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
              />
              <div className="text-[10px] text-slate-500 font-mono">
                {formatRibuan(targetLembarDisetor)} lembar
              </div>
              <p className="text-[10px] text-indigo-900 font-serif leading-tight">
                {rupiahKeTerbilang(form.modal_disetor)}
              </p>
            </div>
          </div>

          {/* Banner Validasi UU PT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isMinimumCapitalMet
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              {isMinimumCapitalMet ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="text-[11px] leading-snug">
                <strong>Ketentuan Pasal 33 UU PT:</strong> Modal disetor minimal 25% dari Modal Dasar (
                {formatRibuan(0.25 * form.modal_dasar)}).
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isSharesBalanced
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              {isSharesBalanced ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="text-[11px] leading-snug font-mono">
                Alokasi Saham: {formatRibuan(totalLembarDisetor)} / {formatRibuan(targetLembarDisetor)} Lembar (
                {targetLembarDisetor > 0 ? ((totalLembarDisetor / targetLembarDisetor) * 100).toFixed(0) : 0}%)
              </div>
            </div>
          </div>

          {/* Rincian Alokasi Saham & Jabatan per Pendiri */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Komposisi Pembagian Lembar Saham & Jabatan (Pasal 20)
            </label>

            <div className="space-y-3">
              {form.pendiri.map((p, idx) => {
                const nominalP = (p.jumlah_lembar_saham || 0) * form.nominal_per_saham;
                const percent = targetLembarDisetor > 0 ? ((p.jumlah_lembar_saham || 0) / targetLembarDisetor) * 100 : 0;

                return (
                  <div key={p.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-mono font-bold flex items-center justify-center">
                          {String.fromCharCode(97 + idx)}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {p.sapaan} {p.nama_lengkap || `Pendiri #${idx + 1}`}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-lg">
                        {percent.toFixed(1)}% Saham
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Jumlah Lembar Saham
                        </label>
                        <input
                          type="number"
                          value={p.jumlah_lembar_saham}
                          onChange={(e) => updateFounderShare(idx, parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                          = Rp {formatRibuan(nominalP)} ({rupiahKeTerbilang(nominalP)})
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Jabatan dalam Perseroan (Pasal 20 Bagian II)
                        </label>
                        <select
                          value={p.jabatan_pt}
                          onChange={(e) => updateFounderRolePT(idx, e.target.value as JabatanPT)}
                          className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                        >
                          <option value="DIREKTUR UTAMA">DIREKTUR UTAMA</option>
                          <option value="DIREKTUR">DIREKTUR</option>
                          <option value="KOMISARIS UTAMA">KOMISARIS UTAMA</option>
                          <option value="KOMISARIS">KOMISARIS</option>
                          <option value="PEMEGANG SAHAM">PEMEGANG SAHAM SAJA</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ===================== MODE CV ===================== */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700">Total Modal Persekutuan CV (Rp)</label>
            <input
              type="number"
              step={1000000}
              value={form.total_modal_cv}
              onChange={(e) => updateField("total_modal_cv", parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white rounded-xl border border-slate-300 focus:border-indigo-600 outline-none"
            />
            <p className="text-[10px] text-indigo-900 font-serif">
              {rupiahKeTerbilang(form.total_modal_cv)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Pemasukan Modal & Peran Sekutu (Pasal 4 & Pasal 5-6)
            </label>

            <div className="space-y-3">
              {form.pendiri.map((p, idx) => (
                <div key={p.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Sekutu #{idx + 1}: {p.sapaan} {p.nama_lengkap || "Tanpa Nama"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Nominal Setoran Modal (Rp)
                      </label>
                      <input
                        type="number"
                        step={1000000}
                        value={p.nominal_modal_cv}
                        onChange={(e) => updateFounderCVCapital(idx, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                      />
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        {rupiahKeTerbilang(p.nominal_modal_cv)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Status Sekutu
                      </label>
                      <select
                        value={p.jabatan_cv}
                        onChange={(e) => updateFounderRoleCV(idx, e.target.value as JabatanCV)}
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white rounded-lg border border-slate-300 focus:border-indigo-600 outline-none"
                      >
                        <option value="PERSERO PENGURUS (DIREKTUR)">PERSERO PENGURUS (DIREKTUR)</option>
                        <option value="PERSERO KOMANDITER">PERSERO KOMANDITER (SEKUTU PASIF)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Footer: Generate & Download Word */}
      <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer w-full sm:w-auto"
        >
          ← Kembali ke KBLI
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-heading font-extrabold text-sm shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer w-full sm:w-auto"
        >
          <FileDown className="w-5 h-5 text-amber-400" />
          <span>Generate & Download Akta Word (.docx)</span>
        </button>
      </div>

    </div>
  );
};


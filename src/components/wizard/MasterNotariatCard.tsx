import React, { useState } from "react";
import { AktaFormState, DataKTP } from "../../types/akta.types";
import {
  Scale,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Shield,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { notify } from "../../lib/notificationStore";

interface MasterNotariatCardProps {
  form: AktaFormState;
  updateField: <K extends keyof AktaFormState>(key: K, value: AktaFormState[K]) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  compactHeader?: boolean;
}

export const MasterNotariatCard: React.FC<MasterNotariatCardProps> = ({
  form,
  updateField,
  isCollapsed = false,
  onToggleCollapse,
  compactHeader = false,
}) => {
  const [activeTab, setActiveTab] = useState<"notaris" | "kuasa" | "saksi">(
    "notaris"
  );
  const [activeSaksiIndex, setActiveSaksiIndex] = useState<number>(0);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  const updateKuasaField = (field: string, val: any) => {
    updateField("kuasa", { ...form.kuasa, [field]: val });
  };

  const updateSaksiField = (index: number, field: string, val: any) => {
    const updated = [...form.saksi];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: val };
      updateField("saksi", updated);
    }
  };

  const handleAddSaksi = () => {
    const newSaksi: DataKTP = {
      sapaan: "Tuan",
      nama_lengkap: "",
      nik: "",
      tempat_lahir: "",
      tgl_lahir: "",
      pekerjaan: "Karyawan Notaris",
      alamat_jalan: "",
      rt: "",
      rw: "",
      kelurahan: "",
      kecamatan: "",
      kab_kota: "",
      provinsi: "",
    };
    const updated = [...form.saksi, newSaksi];
    updateField("saksi", updated);
    setActiveSaksiIndex(updated.length - 1);
    notify.success("Saksi Ditambahkan", `Saksi ke-${updated.length} ditambahkan ke akta`);
  };

  const handleRemoveSaksi = (index: number) => {
    if (form.saksi.length <= 2) {
      notify.warning(
        "Pasal 40 UUJN",
        "Akta otentik wajib dihadiri sekurang-kurangnya 2 orang saksi."
      );
      return;
    }
    const updated = form.saksi.filter((_, idx) => idx !== index);
    updateField("saksi", updated);
    setActiveSaksiIndex(Math.max(0, index - 1));
    notify.info("Saksi Dihapus", "Saksi berhasil dihapus dari daftar akta");
  };

  const handleSaveProfileToCloud = async () => {
    setIsSavingProfile(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        await supabase.from("legal_profiles").upsert(
          {
            user_email: session.user.email,
            nama_notaris: form.nama_notaris,
            wilayah_notaris: form.wilayah_notaris,
            sk_notaris: form.sk_notaris,
            kuasa: form.kuasa,
            saksi: form.saksi,
            saksi_1: form.saksi[0] || null,
            saksi_2: form.saksi[1] || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_email" }
        );
        notify.success(
          "Profil Notariat Tersimpan",
          "Klausul komparisi notaris & saksi diperbarui di database"
        );
      }
    } catch (e: any) {
      console.error(e);
      notify.error("Gagal Menyimpan", e?.message || "Gagal menyimpan profil notariat");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const currentSaksi = form.saksi[activeSaksiIndex] || form.saksi[0];

  // 1. COLLAPSED VIEW (1-Line Summary Bar)
  if (isCollapsed) {
    return (
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200/60">
            <Scale className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                PASAL 38 & 40 UUJN
              </span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {form.nama_notaris || "Notaris Belum Diatur"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans truncate">
              Kuasa: <span className="font-semibold text-slate-700">{form.kuasa.nama_lengkap || "-"}</span> •{" "}
              <span>{form.saksi.length} Saksi Akta</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <span>Buka Panel</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. EXPANDED VIEW (Full Master Notariat Card)
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 transition-all">
      {/* Header Card 2A */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              PASAL 38 & 40 UUJN
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Kepala & Penutup Akta Notariat
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-heading font-bold text-slate-900 mt-1">
            Pejabat Notaris, Penerima Kuasa & Saksi Akta
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSaveProfileToCloud}
            disabled={isSavingProfile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Simpan data notariat ini sebagai profil bawaan"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {isSavingProfile ? "Menyimpan..." : "Simpan Profil Notariat"}
            </span>
            <span className="sm:hidden">Simpan</span>
          </button>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Lipat Panel Notariat"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Notaris, Kuasa, Saksi */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("notaris")}
          className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "notaris"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>1. Pejabat Notaris</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("kuasa")}
          className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "kuasa"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>2. Penerima Kuasa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("saksi")}
          className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "saksi"
              ? "bg-white text-indigo-700 shadow-sm border border-slate-200/60"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. Saksi-Saksi Akta ({form.saksi.length})</span>
        </button>
      </div>

      {/* Tab 1: Pejabat Notaris */}
      {activeTab === "notaris" && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap & Gelar Notaris <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nama_notaris}
                onChange={(e) => updateField("nama_notaris", e.target.value.toUpperCase())}
                placeholder="JIHAN KHOIRINI, Sarjana Hukum, Magister Kenotariatan"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Wilayah Kedudukan Notaris <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.wilayah_notaris}
                onChange={(e) => updateField("wilayah_notaris", e.target.value)}
                placeholder="Kabupaten Bandung Barat"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SK Pengangkatan Notaris Kemenkumham RI
              </label>
              <input
                type="text"
                value={form.sk_notaris}
                onChange={(e) => updateField("sk_notaris", e.target.value)}
                placeholder="AHU-00124.AH.02.01.TAHUN 2021"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Penerima Kuasa */}
      {activeTab === "kuasa" && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sapaan</label>
              <select
                value={form.kuasa.sapaan}
                onChange={(e) => updateKuasaField("sapaan", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold outline-none"
              >
                <option value="Tuan">Tuan</option>
                <option value="Nyonya">Nyonya</option>
                <option value="Nona">Nona</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nama Lengkap Penerima Kuasa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.kuasa.nama_lengkap}
                onChange={(e) => updateKuasaField("nama_lengkap", e.target.value.toUpperCase())}
                placeholder="VIKRI FIRDAUS, S.H."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIK (16 Digit)</label>
              <input
                type="text"
                maxLength={16}
                value={form.kuasa.nik}
                onChange={(e) => updateKuasaField("nik", e.target.value.replace(/\D/g, ""))}
                placeholder="3216061904940001"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pekerjaan</label>
              <input
                type="text"
                value={form.kuasa.pekerjaan}
                onChange={(e) => updateKuasaField("pekerjaan", e.target.value)}
                placeholder="Staf Administrasi Notaris"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor Surat Kuasa</label>
              <input
                type="text"
                value={form.kuasa.nomor_surat_kuasa}
                onChange={(e) => updateKuasaField("nomor_surat_kuasa", e.target.value)}
                placeholder="SK-DIR/03/2026/08"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Surat Kuasa</label>
              <input
                type="date"
                value={form.kuasa.tgl_surat_kuasa}
                onChange={(e) => updateKuasaField("tgl_surat_kuasa", e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Saksi-Saksi Akta */}
      {activeTab === "saksi" && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-150">
          {/* Sub-tabs Saksi 1, Saksi 2, dst */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {form.saksi.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSaksiIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSaksiIndex === idx
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Saksi #{idx + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddSaksi}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Saksi</span>
            </button>
          </div>

          {currentSaksi && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Data Identitas Saksi #{activeSaksiIndex + 1}
                </span>
                {form.saksi.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSaksi(activeSaksiIndex)}
                    className="text-red-600 hover:text-red-800 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Saksi</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sapaan</label>
                  <select
                    value={currentSaksi.sapaan}
                    onChange={(e) => updateSaksiField(activeSaksiIndex, "sapaan", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="Tuan">Tuan</option>
                    <option value="Nyonya">Nyonya</option>
                    <option value="Nona">Nona</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Lengkap Saksi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentSaksi.nama_lengkap}
                    onChange={(e) => updateSaksiField(activeSaksiIndex, "nama_lengkap", e.target.value.toUpperCase())}
                    placeholder="ARUNI HUSNAYAINI"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIK Saksi (16 Digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={currentSaksi.nik}
                    onChange={(e) => updateSaksiField(activeSaksiIndex, "nik", e.target.value.replace(/\D/g, ""))}
                    placeholder="3201075508980002"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={currentSaksi.pekerjaan}
                    onChange={(e) => updateSaksiField(activeSaksiIndex, "pekerjaan", e.target.value)}
                    placeholder="Karyawan Notaris"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


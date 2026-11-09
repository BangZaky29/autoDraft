import React, { useState } from "react";
import { AktaFormState, Sapaan, DataKTP } from "../../types/akta.types";
import { X, Scale, Save, CheckCircle2, UserCheck, Shield, Plus, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { notify } from "../../lib/notificationStore";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: AktaFormState;
  updateField: <K extends keyof AktaFormState>(key: K, value: AktaFormState[K]) => void;
}

export const NotaryConfigModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  form,
  updateField,
}) => {
  const [activeTab, setActiveTab] = useState<"notaris" | "kuasa" | "saksi">("notaris");
  const [activeSaksiSub, setActiveSaksiSub] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
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
        notify.success("Profil Notariat Disimpan", "Klausul notaris & saksi berhasil disinkronkan");
      }
      onClose();
    } catch (e: any) {
      console.error(e);
      notify.error("Gagal Menyimpan", e?.message || "Gagal menyimpan ke cloud");
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

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
      kab_kota: form.wilayah_notaris || "",
      provinsi: "Jawa Barat",
    };
    const updated = [...form.saksi, newSaksi];
    updateField("saksi", updated);
    setActiveSaksiSub(updated.length - 1);
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
    setActiveSaksiSub(Math.max(0, index - 1));
    notify.info("Saksi Dihapus", "Saksi berhasil dihapus dari konfigurasi");
  };

  if (!isOpen) return null;

  const currentSaksi = form.saksi[activeSaksiSub] || form.saksi[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
                Konfigurasi Notaris, Kuasa & Saksi
              </h3>
              <p className="text-[11px] text-slate-500">
                Klausul komparisi pembuka & penutup minuta akta (Pasal 38 & 40 UUJN)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("notaris")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "notaris"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pejabat Notaris
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("kuasa")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "kuasa"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Penerima Kuasa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saksi")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "saksi"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Saksi-Saksi Akta ({form.saksi.length})
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="overflow-y-auto pr-1 space-y-4 text-xs flex-1">
          
          {/* TAB 1: PEJABAT NOTARIS */}
          {activeTab === "notaris" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar Notaris
                  </label>
                  <input
                    type="text"
                    value={form.nama_notaris}
                    onChange={(e) => updateField("nama_notaris", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold outline-none focus:border-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Variabel akta: &#123;nama_notaris&#125;
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Wilayah Kedudukan Notaris
                  </label>
                  <input
                    type="text"
                    value={form.wilayah_notaris}
                    onChange={(e) => updateField("wilayah_notaris", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold outline-none focus:border-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Variabel akta: &#123;wilayah_notaris&#125;
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    SK Pengangkatan Notaris Kemenkumham RI
                  </label>
                  <input
                    type="text"
                    value={form.sk_notaris}
                    onChange={(e) => updateField("sk_notaris", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
                <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Pejabat notaris terdaftar secara otomatis disisipkan pada komparisi pembuka minuta akta sesuai Pasal 38 UU Jabatan Notaris.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PENERIMA KUASA */}
          {activeTab === "kuasa" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sapaan</label>
                    <select
                      value={form.kuasa.sapaan}
                      onChange={(e) => updateKuasaField("sapaan", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-indigo-600"
                    >
                      <option value="Tuan">Tuan</option>
                      <option value="Nyonya">Nyonya</option>
                      <option value="Nona">Nona</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap Kuasa</label>
                    <input
                      type="text"
                      value={form.kuasa.nama_lengkap}
                      onChange={(e) => updateKuasaField("nama_lengkap", e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-indigo-600 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIK Kuasa</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={form.kuasa.nik}
                      onChange={(e) => updateKuasaField("nik", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pekerjaan</label>
                    <input
                      type="text"
                      value={form.kuasa.pekerjaan}
                      onChange={(e) => updateKuasaField("pekerjaan", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={form.kuasa.tempat_lahir}
                      onChange={(e) => updateKuasaField("tempat_lahir", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={form.kuasa.tgl_lahir}
                      onChange={(e) => updateKuasaField("tgl_lahir", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor Surat Kuasa</label>
                    <input
                      type="text"
                      value={form.kuasa.nomor_surat_kuasa}
                      onChange={(e) => updateKuasaField("nomor_surat_kuasa", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Surat Kuasa</label>
                    <input
                      type="date"
                      value={form.kuasa.tgl_surat_kuasa}
                      onChange={(e) => updateKuasaField("tgl_surat_kuasa", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alamat Domisili Kuasa</label>
                  <input
                    type="text"
                    value={form.kuasa.alamat_jalan}
                    onChange={(e) => updateKuasaField("alamat_jalan", e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAKSI-SAKSI (DINAMIS) */}
          {activeTab === "saksi" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              {/* Saksi Sub Tabs & Add Button */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                <div className="flex items-center gap-1">
                  {form.saksi.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSaksiSub(idx)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeSaksiSub === idx
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>Saksi {idx + 1}</span>
                      <span className="text-[10px] ml-1 opacity-75">
                        ({s.nama_lengkap ? s.nama_lengkap.split(" ")[0] : "Baru"})
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddSaksi}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Saksi</span>
                </button>
              </div>

              {currentSaksi && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <span className="font-bold text-slate-800 text-xs">
                      Identitas Saksi Akta #{activeSaksiSub + 1}
                    </span>
                    {form.saksi.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSaksi(activeSaksiSub)}
                        className="text-red-600 hover:text-red-800 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Saksi</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sapaan</label>
                      <select
                        value={currentSaksi.sapaan}
                        onChange={(e) => updateSaksiField(activeSaksiSub, "sapaan", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none"
                      >
                        <option value="Tuan">Tuan</option>
                        <option value="Nyonya">Nyonya</option>
                        <option value="Nona">Nona</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap Saksi</label>
                      <input
                        type="text"
                        value={currentSaksi.nama_lengkap}
                        onChange={(e) => updateSaksiField(activeSaksiSub, "nama_lengkap", e.target.value.toUpperCase())}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">NIK</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={currentSaksi.nik}
                        onChange={(e) => updateSaksiField(activeSaksiSub, "nik", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pekerjaan</label>
                      <input
                        type="text"
                        value={currentSaksi.pekerjaan}
                        onChange={(e) => updateSaksiField(activeSaksiSub, "pekerjaan", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        value={currentSaksi.tempat_lahir}
                        onChange={(e) => updateSaksiField(activeSaksiSub, "tempat_lahir", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={currentSaksi.tgl_lahir}
                        onChange={(e) => updateSaksiField(activeSaksiSub, "tgl_lahir", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alamat Domisili</label>
                    <input
                      type="text"
                      value={currentSaksi.alamat_jalan}
                      onChange={(e) => updateSaksiField(activeSaksiSub, "alamat_jalan", e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSaveToCloud}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Menyimpan..." : "Simpan ke Database"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

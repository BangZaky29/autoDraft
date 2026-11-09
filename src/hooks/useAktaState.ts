import { useState, useEffect, useCallback } from "react";
import { AktaFormState, PendiriAkta, JenisBadanUsaha } from "../types/akta.types";
import { supabase } from "../lib/supabase";
import { notify } from "../lib/notificationStore";

const INITIAL_STATE: AktaFormState = {
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
  pengadilan_negeri_cv: "Pengadilan Negeri Cikarang Kelas IB",
  tgl_tutup_buku: "2026-12-31",

  modal_dasar: 1_000_000_000,
  nominal_per_saham: 50_000,
  modal_disetor: 250_000_000,
  total_modal_cv: 150_000_000,

  pendiri: [
    {
      id: "1",
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
      jumlah_lembar_saham: 3000,
      jabatan_pt: "DIREKTUR UTAMA",
      nominal_modal_cv: 100_000_000,
      jabatan_cv: "PERSERO PENGURUS (DIREKTUR)",
    },
    {
      id: "2",
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
      jumlah_lembar_saham: 2000,
      jabatan_pt: "KOMISARIS UTAMA",
      nominal_modal_cv: 50_000_000,
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
      kode_kbli: "46799",
      judul_kbli: "PERDAGANGAN BESAR HASIL HUTAN DAN PERKEBUNAN LAINNYA",
      kode_kategori: "G",
      nama_kategori: "PERDAGANGAN BESAR DAN ECERAN",
      uraian_kbli: "Kelompok ini mencakup usaha perdagangan besar hasil hutan dan perkebunan lainnya seperti damar, rotan, kayu olahan, getah dan produk sejenis.",
    },
  ],
  nama_notaris: "JIHAN KHOIRINI, Sarjana Hukum, Magister Kenotariatan",
  wilayah_notaris: "Kabupaten Bandung Barat",
  sk_notaris: "AHU-00124.AH.02.01.TAHUN 2021",
  kuasa: {
    sapaan: "Tuan",
    nama_lengkap: "VIKRI FIRDAUS, S.H.",
    nik: "3216061904940001",
    tempat_lahir: "Bekasi",
    tgl_lahir: "1994-04-19",
    pekerjaan: "Staf Administrasi Notaris",
    alamat_jalan: "Jalan Boulevard Grand Surya No. 42",
    rt: "003",
    rw: "008",
    kelurahan: "Sukamahi",
    kecamatan: "Cikarang Pusat",
    kab_kota: "Kabupaten Bekasi",
    provinsi: "Jawa Barat",
    nomor_surat_kuasa: "SK-DIR/03/2026/08",
    tgl_surat_kuasa: "2026-03-10",
  },
  saksi: [
    {
      sapaan: "Nona",
      nama_lengkap: "ARUNI HUSNAYAINI",
      nik: "3201075508980002",
      tempat_lahir: "Bandung",
      tgl_lahir: "1998-08-15",
      pekerjaan: "Karyawan Notaris",
      alamat_jalan: "Jl. Raya Gadobangkong No. 12",
      rt: "002",
      rw: "005",
      kelurahan: "Gadobangkong",
      kecamatan: "Ngamprah",
      kab_kota: "Kabupaten Bandung Barat",
      provinsi: "Jawa Barat",
    },
    {
      sapaan: "Nona",
      nama_lengkap: "DINDA KHOIRINA",
      nik: "3201076211990004",
      tempat_lahir: "Cimahi",
      tgl_lahir: "1999-11-22",
      pekerjaan: "Karyawan Notaris",
      alamat_jalan: "Komplek Permata Cimahi Blok D-4",
      rt: "004",
      rw: "011",
      kelurahan: "Tanimulya",
      kecamatan: "Ngamprah",
      kab_kota: "Kabupaten Bandung Barat",
      provinsi: "Jawa Barat",
    },
  ],
};

export function useAktaState() {
  const [form, setForm] = useState<AktaFormState>(INITIAL_STATE);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load Legal Profile default dari Supabase saat awal login
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return;

        const { data, error } = await supabase
          .from("legal_profiles")
          .select("*")
          .eq("user_email", session.user.email)
          .maybeSingle();

        if (data && !error) {
          setForm((prev) => {
            const loadedSaksi = Array.isArray(data.saksi) && data.saksi.length >= 2
              ? data.saksi
              : [data.saksi_1 || prev.saksi[0], data.saksi_2 || prev.saksi[1]];

            return {
              ...prev,
              nama_notaris: data.nama_notaris || prev.nama_notaris,
              wilayah_notaris: data.wilayah_notaris || prev.wilayah_notaris,
              sk_notaris: data.sk_notaris || prev.sk_notaris,
              kuasa: { ...prev.kuasa, ...(data.kuasa || {}) },
              saksi: loadedSaksi,
            };
          });
        }
      } catch (e) {
        console.warn("Profil legal offline atau belum terkonfigurasi, menggunakan default bawaan.", e);
      }
    }
    loadProfile();
  }, []);

  // Update Field Handler
  const updateField = useCallback(<K extends keyof AktaFormState>(key: K, value: AktaFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Toggle Badan Usaha (PT / CV)
  const setEntity = useCallback((type: JenisBadanUsaha) => {
    setForm((prev) => ({ ...prev, jenis_badan_usaha: type }));
  }, []);

  // Copy Address Helper (Dari Pendiri 1 ke Pendiri Target atau ke Perusahaan)
  const copyAddressFromFounder1 = useCallback((targetIndex?: number) => {
    const f1 = form.pendiri[0];
    if (!f1) return;

    if (targetIndex !== undefined) {
      setForm((prev) => {
        const updated = [...prev.pendiri];
        updated[targetIndex] = {
          ...updated[targetIndex],
          alamat_jalan: f1.alamat_jalan,
          rt: f1.rt,
          rw: f1.rw,
          kelurahan: f1.kelurahan,
          kecamatan: f1.kecamatan,
          kab_kota: f1.kab_kota,
          provinsi: f1.provinsi,
        };
        return { ...prev, pendiri: updated };
      });
    } else {
      // Salin ke alamat kantor perusahaan
      setForm((prev) => ({
        ...prev,
        alamat_perusahaan: f1.alamat_jalan,
        rt_perusahaan: f1.rt,
        rw_perusahaan: f1.rw,
        kel_perusahaan: f1.kelurahan,
        kec_perusahaan: f1.kecamatan,
        kab_kota_perusahaan: f1.kab_kota,
        prov_perusahaan: f1.provinsi,
      }));
    }
  }, [form.pendiri]);

  // Validasi Modal Disetor vs Modal Dasar (PT)
  const totalLembarDisetor = form.pendiri.reduce((acc, p) => acc + (p.jumlah_lembar_saham || 0), 0);
  const totalModalDisetorKalkulasi = totalLembarDisetor * form.nominal_per_saham;
  const isSharesBalanced = totalModalDisetorKalkulasi === form.modal_disetor;
  const isMinimumCapitalMet = form.modal_disetor >= 0.25 * form.modal_dasar;

  // Simpan / Perbarui draf ke Supabase
  const saveDraftToCloud = useCallback(
    async (customDraftName?: string, saveAsNew: boolean = false) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          throw new Error("Sesi login berakhir. Silakan login kembali.");
        }

        setIsSaving(true);
        const companyName = form.nama_perusahaan.trim() || "DRAF TANPA NAMA";
        const draftTitle =
          customDraftName?.trim() ||
          form.nama_draft ||
          companyName ||
          "Draf Akta";

        const targetId = saveAsNew ? undefined : currentDraftId || undefined;

        const payloadToSave: any = {
          user_email: session.user.email,
          jenis_badan_usaha: form.jenis_badan_usaha,
          nama_perusahaan: companyName,
          nama_draft: draftTitle,
          nomor_akta: form.nomor_akta || "08",
          payload_json: { ...form, nama_draft: draftTitle },
          updated_at: new Date().toISOString(),
        };

        if (targetId) {
          payloadToSave.id = targetId;
          const { data: savedData, error } = await supabase
            .from("akta_drafts")
            .upsert(payloadToSave)
            .select("id")
            .single();

          if (error) {
            console.error("Gagal perbarui draf:", error);
            notify.error("Gagal Menyimpan Draf", error.message);
            throw error;
          } else if (savedData?.id) {
            setCurrentDraftId(savedData.id);
            setForm((prev) => ({ ...prev, nama_draft: draftTitle }));
            setLastSaved(new Date());
            notify.success("Tersimpan di Cloud", `${draftTitle} berhasil diperbarui`);
          }
        } else {
          const { data: savedData, error } = await supabase
            .from("akta_drafts")
            .insert(payloadToSave)
            .select("id")
            .single();

          if (error) {
            console.error("Gagal membuat draf baru:", error);
            notify.error("Gagal Menyimpan Draf", error.message);
            throw error;
          } else if (savedData?.id) {
            setCurrentDraftId(savedData.id);
            setForm((prev) => ({ ...prev, nama_draft: draftTitle }));
            setLastSaved(new Date());
            notify.success("Tersimpan di Cloud", `${draftTitle} tersimpan sebagai draf baru`);
          }
        }
      } catch (err: any) {
        console.error("Gagal simpan draf ke cloud:", err);
        notify.error("Gagal Menyimpan Draf", err?.message || "Kesalahan database cloud");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [form, currentDraftId]
  );

  // Reset form ke state bersih
  const resetForm = useCallback(() => {
    setCurrentDraftId(null);
    setForm((prev) => ({
      ...prev,
      nama_draft: "",
      jenis_badan_usaha: "PT",
      nama_perusahaan: "",
      nomor_akta: "",
      alamat_perusahaan: "",
      rt_perusahaan: "",
      rw_perusahaan: "",
      kel_perusahaan: "",
      kec_perusahaan: "",
      kab_kota_perusahaan: "",
      prov_perusahaan: "",
      kode_pos_perusahaan: "",
      pengadilan_negeri_cv: "",
      tgl_tutup_buku: `${new Date().getFullYear()}-12-31`,
      modal_dasar: 0,
      nominal_per_saham: 0,
      modal_disetor: 0,
      total_modal_cv: 0,
      pendiri: [
        {
          id: "1",
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
        },
        {
          id: "2",
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
          jabatan_pt: "KOMISARIS",
          nominal_modal_cv: 0,
          jabatan_cv: "PERSERO KOMANDITER",
        },
      ],
      kbli: [],
    }));
    setActiveStep(1);
  }, []);

  return {
    form,
    setForm,
    currentDraftId,
    setCurrentDraftId,
    activeStep,
    setActiveStep,
    updateField,
    setEntity,
    copyAddressFromFounder1,
    isSharesBalanced,
    isMinimumCapitalMet,
    totalLembarDisetor,
    totalModalDisetorKalkulasi,
    saveDraftToCloud,
    resetForm,
    isSaving,
    lastSaved,
  };
}


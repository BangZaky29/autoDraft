import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { AktaFormState } from "../types/akta.types";
import {
  angkaKeTerbilang,
  capitalizeFirst,
  formatRibuan,
  padRtRw,
  rupiahKeTerbilang,
  tanggalKeTerbilang,
} from "./terbilang";

export async function generateDeedWord(form: AktaFormState, customFileName?: string) {
  const isPT = form.jenis_badan_usaha === "PT";
  const templatePath = isPT ? "/templates/DRAFT-PT.docx" : "/templates/DRAFT-CV.docx";

  // 1. Fetch file master dari public/templates
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Gagal memuat template: ${templatePath}. Pastikan file ada di folder public/templates.`);
  }
  const arrayBuffer = await response.arrayBuffer();

  // 2. Inisialisasi Docxtemplater
  const zip = new PizZip(arrayBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // 3. Transform KBLI Kategori Unik (Pasal 3 Ayat 1)
  const mapKategori = new Map<string, string>();
  form.kbli.forEach((k) => {
    if (!mapKategori.has(k.kode_kategori)) {
      mapKategori.set(k.kode_kategori, k.nama_kategori);
    }
  });
  const kategori_kbli = Array.from(mapKategori.entries()).map(([kode, nama], idx) => ({
    no: idx + 1,
    kode_kategori: kode,
    nama_kategori: nama,
  }));

  // 4. Perhitungan Lembar Saham PT (Pasal 4)
  const lembarModalDasar = form.nominal_per_saham > 0 ? Math.floor(form.modal_dasar / form.nominal_per_saham) : 0;
  const lembarModalDisetor = form.nominal_per_saham > 0 ? Math.floor(form.modal_disetor / form.nominal_per_saham) : 0;

  // 5. Susun Payload Universal
  const payload: Record<string, any> = {
    nama_perusahaan: form.nama_perusahaan.toUpperCase(),
    nomor_akta: form.nomor_akta || "   ",
    nama_notaris: form.nama_notaris,
    wilayah_notaris: form.wilayah_notaris,

    // Data Pihak Penerima Kuasa
    sapaan_kuasa: form.kuasa.sapaan,
    nama_kuasa: form.kuasa.nama_lengkap.toUpperCase(),
    tempat_lahir_kuasa: form.kuasa.tempat_lahir,
    tgl_lahir_kuasa: form.kuasa.tgl_lahir,
    tgl_lahir_kuasa_terbilang: tanggalKeTerbilang(form.kuasa.tgl_lahir),
    pekerjaan_kuasa: form.kuasa.pekerjaan,
    alamat_kuasa: form.kuasa.alamat_jalan,
    rt_kuasa: padRtRw(form.kuasa.rt),
    rw_kuasa: padRtRw(form.kuasa.rw),
    kel_kuasa: form.kuasa.kelurahan,
    kec_kuasa: form.kuasa.kecamatan,
    kab_kota_kuasa: form.kuasa.kab_kota,
    prov_kuasa: form.kuasa.provinsi,
    nik_kuasa: form.kuasa.nik,
    tgl_surat_kuasa: form.kuasa.tgl_surat_kuasa,
    tgl_surat_kuasa_terbilang: tanggalKeTerbilang(form.kuasa.tgl_surat_kuasa),

    // Looping Komparisi Pendiri
    daftar_pendiri: form.pendiri.map((p, idx) => ({
      no: idx + 1,
      sapaan: p.sapaan,
      nama_lengkap: p.nama_lengkap.toUpperCase(),
      tempat_lahir: p.tempat_lahir,
      tgl_lahir: p.tgl_lahir,
      tgl_lahir_terbilang: tanggalKeTerbilang(p.tgl_lahir),
      pekerjaan: p.pekerjaan,
      alamat_jalan: p.alamat_jalan,
      rt: padRtRw(p.rt),
      rw: padRtRw(p.rw),
      kelurahan: p.kelurahan,
      kecamatan: p.kecamatan,
      kab_kota: p.kab_kota,
      provinsi: p.provinsi,
      nik: p.nik,
    })),

    // Kantor Pusat (Pasal 1)
    alamat_perusahaan: form.alamat_perusahaan,
    rt_perusahaan: padRtRw(form.rt_perusahaan),
    rw_perusahaan: padRtRw(form.rw_perusahaan),
    kel_perusahaan: form.kel_perusahaan,
    kec_perusahaan: form.kec_perusahaan,
    kab_kota_perusahaan: form.kab_kota_perusahaan,
    prov_perusahaan: form.prov_perusahaan,
    kode_pos_perusahaan: form.kode_pos_perusahaan,

    // KBLI (Pasal 3)
    kategori_kbli,
    daftar_kbli: form.kbli.map((k, idx) => ({
      no: idx + 1,
      kode_kbli: k.kode_kbli,
      judul_kbli: k.judul_kbli.toUpperCase(),
      uraian_kbli: k.uraian_kbli,
    })),

    // Saksi-Saksi (Penutup Akta)
    daftar_saksi: form.saksi.map((s, idx) => ({
      no: idx + 1,
      sapaan_saksi: s.sapaan,
      nama_saksi: s.nama_lengkap.toUpperCase(),
      tempat_lahir_saksi: s.tempat_lahir,
      tgl_lahir_saksi: s.tgl_lahir,
      tgl_lahir_saksi_terbilang: tanggalKeTerbilang(s.tgl_lahir),
      pekerjaan_saksi: s.pekerjaan,
      kab_kota_saksi: s.kab_kota,
      alamat_saksi: s.alamat_jalan,
      rt_saksi: padRtRw(s.rt),
      rw_saksi: padRtRw(s.rw),
      kel_saksi: s.kelurahan,
      kec_saksi: s.kecamatan,
      nik_saksi: s.nik,
    })),

    // Tutup Buku
    tgl_tutup_buku: form.tgl_tutup_buku,
    tgl_tutup_buku_terbilang: tanggalKeTerbilang(form.tgl_tutup_buku),
  };

  if (isPT) {
    // Variabel Spesifik PT
    payload.modal_dasar = formatRibuan(form.modal_dasar);
    payload.modal_dasar_terbilang = rupiahKeTerbilang(form.modal_dasar);
    payload.lembar_modal_dasar = formatRibuan(lembarModalDasar);
    payload.lembar_modal_dasar_terbilang = capitalizeFirst(angkaKeTerbilang(lembarModalDasar));
    payload.nominal_per_saham = formatRibuan(form.nominal_per_saham);
    payload.nominal_per_saham_terbilang = rupiahKeTerbilang(form.nominal_per_saham);
    payload.lembar_modal_disetor = formatRibuan(lembarModalDisetor);
    payload.lembar_modal_disetor_terbilang = capitalizeFirst(angkaKeTerbilang(lembarModalDisetor));
    payload.modal_disetor = formatRibuan(form.modal_disetor);
    payload.modal_disetor_terbilang = rupiahKeTerbilang(form.modal_disetor);

    // Rincian Saham (Pasal 20)
    payload.rincian_saham = form.pendiri
      .filter((p) => p.jumlah_lembar_saham > 0)
      .map((p, idx) => {
        const nominal = p.jumlah_lembar_saham * form.nominal_per_saham;
        return {
          huruf: String.fromCharCode(97 + idx), // a, b, c, ...
          sapaan: p.sapaan,
          nama_lengkap: p.nama_lengkap.toUpperCase(),
          jumlah_lembar: formatRibuan(p.jumlah_lembar_saham),
          jumlah_lembar_terbilang: capitalizeFirst(angkaKeTerbilang(p.jumlah_lembar_saham)),
          nominal_saham: formatRibuan(nominal),/*  */
          nominal_saham_terbilang: rupiahKeTerbilang(nominal),
        };
      });

    // Susunan Pengurus PT
    payload.daftar_direksi = form.pendiri
      .filter((p) => p.jabatan_pt === "DIREKTUR UTAMA" || p.jabatan_pt === "DIREKTUR")
      .map((p) => ({ jabatan: p.jabatan_pt, sapaan: p.sapaan, nama_lengkap: p.nama_lengkap.toUpperCase() }));

    payload.daftar_komisaris = form.pendiri
      .filter((p) => p.jabatan_pt === "KOMISARIS UTAMA" || p.jabatan_pt === "KOMISARIS")
      .map((p) => ({ jabatan: p.jabatan_pt, sapaan: p.sapaan, nama_lengkap: p.nama_lengkap.toUpperCase() }));
  } else {
    // Variabel Spesifik CV
    payload.modal_cv = formatRibuan(form.total_modal_cv);
    payload.modal_cv_terbilang = rupiahKeTerbilang(form.total_modal_cv);
    payload.pengadilan_negeri = form.pengadilan_negeri_cv;

    payload.rincian_modal_cv = form.pendiri.map((p, idx) => ({
      no: idx + 1,
      sapaan: p.sapaan,
      nama_lengkap: p.nama_lengkap.toUpperCase(),
      nominal_setoran: formatRibuan(p.nominal_modal_cv),
      nominal_setoran_terbilang: rupiahKeTerbilang(p.nominal_modal_cv),
      status_sekutu: p.jabatan_cv.includes("DIREKTUR") ? "Persero Pengurus" : "Persero Komanditer",
    }));

    const pengurus = form.pendiri
      .filter((p) => p.jabatan_cv.includes("DIREKTUR"))
      .map((p) => `${p.sapaan} ${p.nama_lengkap.toUpperCase()}`);
    const komanditer = form.pendiri
      .filter((p) => !p.jabatan_cv.includes("DIREKTUR"))
      .map((p) => `${p.sapaan} ${p.nama_lengkap.toUpperCase()}`);

    payload.daftar_nama_pengurus_cv = pengurus.join(", ") || "-";
    payload.daftar_nama_komanditer_cv = komanditer.join(", ") || "-";
  }

  // 6. Injeksi & Download
  doc.render(payload);
  const out = doc.getZip().generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  let finalFileName = customFileName?.trim();
  if (!finalFileName) {
    const cleanName = (form.nama_perusahaan || "BARU").trim().replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
    finalFileName = `DRAFT_PENDIRIAN_${form.jenis_badan_usaha}_${cleanName}.docx`;
  } else if (!finalFileName.toLowerCase().endsWith(".docx")) {
    finalFileName += ".docx";
  }

  saveAs(out, finalFileName);
  return finalFileName;
}


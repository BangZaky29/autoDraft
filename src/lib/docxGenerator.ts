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

  // 2. Inisialisasi Docxtemplater dengan sanitasi metadata (docProps)
  const zip = new PizZip(arrayBuffer);

  // Bersihkan kurung kurawal liar pada metadata dokumen jika ada (misal pEPSON scanner artifacts)
  ["docProps/core.xml", "docProps/app.xml", "docProps/custom.xml"].forEach((path) => {
    const f = zip.file(path);
    if (f) {
      const sanitized = f.asText().replace(/\{|\}/g, "");
      zip.file(path, sanitized);
    }
  });

  // Manajemen Dinamis Baris Tabel Tanda Tangan:
  // 1. Jika pendiri <= 2 orang, hapus baris tabel Word yang memuat ttd_pendiri 3 & 4 agar tidak ada baris/kolom kosong.
  // 2. Jika pendiri > 4 orang (misal 5 atau 6 orang), gandakan baris tersebut untuk ttd_pendiri 5 & 6.
  const docXmlFile = zip.file("word/document.xml");
  if (docXmlFile) {
    let docXml = docXmlFile.asText();
    const trList = docXml.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
    const trPendiri2 = trList.find(
      (tr) =>
        tr.includes("ttd_pendiri") &&
        !tr.includes("ttd_pendiri_1") &&
        !tr.includes("ttd_pendiri_2")
    );

    if (trPendiri2) {
      if (form.pendiri.length <= 2) {
        // Hapus total baris kedua pendiri (slot 3 & 4) jika pendiri <= 2 orang
        docXml = docXml.replace(trPendiri2, "");
      } else if (form.pendiri.length > 4) {
        // Gandakan baris untuk pendiri 5 & 6 jika lebih dari 4 orang
        const trPendiri3 = trPendiri2
          .replace(/<w:t>3<\/w:t>/g, "<w:t>5</w:t>")
          .replace(/<w:t>4<\/w:t>/g, "<w:t>6</w:t>")
          .replace(/\{ttd_pendiri_3\}/g, "{ttd_pendiri_5}")
          .replace(/\{ttd_pendiri_4\}/g, "{ttd_pendiri_6}");
        docXml = docXml.replace(trPendiri2, trPendiri2 + trPendiri3);
      }
      zip.file("word/document.xml", docXml);
    }

    // Saksi-Saksi (jika saksi > 2 orang, tambahkan baris saksi berikutnya)
    if (form.saksi.length > 2) {
      const trSaksi1 = trList.find((tr) => tr.includes("ttd_saksi_1") || tr.includes("ttd_saksi"));
      if (trSaksi1) {
        const trSaksi2 = trSaksi1
          .replace(/<w:t>1<\/w:t>/g, "<w:t>3</w:t>")
          .replace(/<w:t>2<\/w:t>/g, "<w:t>4</w:t>")
          .replace(/\{ttd_saksi_1\}/g, "{ttd_saksi_3}")
          .replace(/\{ttd_saksi_2\}/g, "{ttd_saksi_4}");
        docXml = docXml.replace(trSaksi1, trSaksi1 + trSaksi2);
      }
    }

    // 3. Kunci Halaman TTD (Page Break Terpadu):
    // Memastikan Blok Tanda Tangan (TTD) selalu diawali dengan Page Break tepat sebelum tabel tanda tangan.
    // Ini mengunci posisi TTD agar berada di halaman terakhir (Page 15 untuk CV, Page 23 untuk PT)
    // dan TIDAK PERNAH terangkat ke halaman sebelumnya (Page 14 atau Page 22).
    // Jika isi akta sebelumnya melebihi kapasitas halaman, akta akan split secara wajar ke halaman berikutnya (Page 16 / Page 24).
    let tblPos = 0;
    let targetTblPos = -1;
    while ((tblPos = docXml.indexOf("<w:tbl>", tblPos)) !== -1) {
      const endTbl = docXml.indexOf("</w:tbl>", tblPos);
      if (endTbl === -1) break;
      const tblXml = docXml.substring(tblPos, endTbl);
      if (tblXml.includes("ttd_pendiri")) {
        targetTblPos = tblPos;
        break;
      }
      tblPos = endTbl + 8;
    }

    if (targetTblPos !== -1) {
      const beforeTbl = docXml.substring(0, targetTblPos);
      const tblAndAfter = docXml.substring(targetTblPos);

      // Telusuri mundur paragraf kosong manual sebelum tabel dan bersihkan
      let currentEnd = beforeTbl.length;
      while (true) {
        const lastPEnd = beforeTbl.lastIndexOf("</w:p>", currentEnd - 1);
        if (lastPEnd === -1) break;
        let lastPStart = -1;
        let searchIdx = lastPEnd;
        while ((searchIdx = beforeTbl.lastIndexOf("<w:p", searchIdx - 1)) !== -1) {
          const nextChar = beforeTbl[searchIdx + 4];
          if (nextChar === " " || nextChar === ">") {
            lastPStart = searchIdx;
            break;
          }
        }
        if (lastPStart === -1) break;
        const fullP = beforeTbl.substring(lastPStart, lastPEnd + 6);
        if (!fullP.includes("<w:t>") && !fullP.includes("<w:t ")) {
          currentEnd = lastPStart;
        } else {
          break;
        }
      }

      // Sisipkan Page Break resmi tepat di batas tabel tanda tangan
      const pageBreakXml =
        '<w:p><w:pPr><w:spacing w:line="480" w:lineRule="auto"/><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:pPr><w:r><w:br w:type="page"/></w:r></w:p>';
      docXml = beforeTbl.substring(0, currentEnd) + pageBreakXml + tblAndAfter;
    }

    zip.file("word/document.xml", docXml);
  }

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
    nama_notaris: form.nama_notaris || "....................",
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

    // Blok Tanda Tangan (TTD Akta Otentik - Notaris Lengkap Dengan Gelar)
    ttd_notaris: form.nama_notaris || "....................",
    ttd_pendiri_1: form.pendiri[0]?.nama_lengkap.toUpperCase() || "....................",
    ttd_pendiri_2: form.pendiri[1]?.nama_lengkap.toUpperCase() || "....................",
    ttd_pendiri_3: form.pendiri[2]?.nama_lengkap.toUpperCase() || "",
    ttd_pendiri_4: form.pendiri[3]?.nama_lengkap.toUpperCase() || "",
    ttd_pendiri_5: form.pendiri[4]?.nama_lengkap.toUpperCase() || "",
    ttd_pendiri_6: form.pendiri[5]?.nama_lengkap.toUpperCase() || "",
    ttd_kuasa: form.kuasa?.nama_lengkap ? form.kuasa.nama_lengkap.toUpperCase() : "",
    ttd_saksi_1: form.saksi[0]?.nama_lengkap.toUpperCase() || "....................",
    ttd_saksi_2: form.saksi[1]?.nama_lengkap.toUpperCase() || "....................",
    ttd_saksi_3: form.saksi[2]?.nama_lengkap.toUpperCase() || "",
    ttd_saksi_4: form.saksi[3]?.nama_lengkap.toUpperCase() || "",
  };

  // Data Looping Berpasangan Dinamis untuk Tabel Word (Jika template memakai table row loop)
  const ttd_pendiri_rows: Array<{
    meterai: string;
    pendiri_kiri: string;
    pendiri_kanan: string;
  }> = [];

  for (let i = 0; i < form.pendiri.length; i += 2) {
    ttd_pendiri_rows.push({
      meterai: i === 0 ? "Materai 10.000\n\n\n\n" : "\n\n\n\n",
      pendiri_kiri: form.pendiri[i]?.nama_lengkap.toUpperCase() || "",
      pendiri_kanan: form.pendiri[i + 1]?.nama_lengkap.toUpperCase() || "",
    });
  }
  payload.ttd_pendiri_rows = ttd_pendiri_rows;

  const ttd_saksi_rows: Array<{
    saksi_kiri: string;
    saksi_kanan: string;
  }> = [];

  for (let i = 0; i < form.saksi.length; i += 2) {
    ttd_saksi_rows.push({
      saksi_kiri: form.saksi[i]?.nama_lengkap.toUpperCase() || "",
      saksi_kanan: form.saksi[i + 1]?.nama_lengkap.toUpperCase() || "",
    });
  }
  payload.ttd_saksi_rows = ttd_saksi_rows;

  // Alias kompatibilitas spasi atau variasi penulisan tag (Notaris Lengkap Dengan Gelar)
  payload[" nama_notaris "] = form.nama_notaris;
  payload["nama_notaris"] = form.nama_notaris;
  payload["ttd_notaris"] = form.nama_notaris;
  payload[" ttd_notaris "] = form.nama_notaris;
  payload[" ttd_pendiri_1 "] = payload.ttd_pendiri_1;
  payload[" ttd_pendiri_2 "] = payload.ttd_pendiri_2;
  payload[" ttd_pendiri_3 "] = payload.ttd_pendiri_3;
  payload[" ttd_pendiri_4 "] = payload.ttd_pendiri_4;
  payload[" ttd_saksi_1 "] = payload.ttd_saksi_1;
  payload[" ttd_saksi_2 "] = payload.ttd_saksi_2;
  payload[" ttd_saksi_3 "] = payload.ttd_saksi_3;
  payload[" ttd_saksi_4 "] = payload.ttd_saksi_4;

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


import React from "react";
import { AktaFormState } from "../../types/akta.types";
import { formatRibuan, rupiahKeTerbilang, tanggalKeTerbilang, angkaKeTerbilang, capitalizeFirst, padRtRw } from "../../lib/terbilang";
import { FileDown, Eye, Save, CheckCircle2 } from "lucide-react";
import { generateDeedWord } from "../../lib/docxGenerator";

interface LiveDeedViewerProps {
  form: AktaFormState;
  onClose?: () => void;
  onSaveDraft?: () => void;
  onRequestDownload?: () => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
  className?: string;
  onHeaderTouchStart?: React.TouchEventHandler;
  onHeaderTouchMove?: React.TouchEventHandler;
  onHeaderTouchEnd?: React.TouchEventHandler;
}

export const LiveDeedViewer: React.FC<LiveDeedViewerProps> = ({
  form,
  onClose,
  onSaveDraft,
  onRequestDownload,
  isSaving = false,
  lastSaved = null,
  className = "rounded-2xl border border-slate-200/90 shadow-sm",
  onHeaderTouchStart,
  onHeaderTouchMove,
  onHeaderTouchEnd,
}) => {
  const isPT = form.jenis_badan_usaha === "PT";
  const lembarModalDasar = form.nominal_per_saham > 0 ? Math.floor(form.modal_dasar / form.nominal_per_saham) : 0;
  const lembarModalDisetor = form.nominal_per_saham > 0 ? Math.floor(form.modal_disetor / form.nominal_per_saham) : 0;

  // Unik KBLI kategori
  const uniqueCategories = Array.from(
    new Set(form.kbli.map((k) => `KATEGORI ${k.kode_kategori} (${k.nama_kategori})`))
  );

  const handleDownload = () => {
    generateDeedWord(form);
  };

  return (
    <div className={`bg-white flex flex-col h-full overflow-hidden ${className}`}>

      {/* Top Bar Viewer */}
      <div
        onTouchStart={onHeaderTouchStart}
        onTouchMove={onHeaderTouchMove}
        onTouchEnd={onHeaderTouchEnd}
        className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="font-heading font-bold text-xs uppercase tracking-wide truncate max-w-[140px] sm:max-w-none">
            Akta Otentik
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Button Simpan Draf tepat di sebelah button Download .docx */}
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Simpan draf akta ke database Supabase"
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin text-amber-400" : "text-emerald-400"}`} />
              <span className="hidden sm:inline">{isSaving ? "Menyimpan..." : "Simpan Draf"}</span>
            </button>
          )}

          {/* Button Download .docx (Membuka popup edit nama berkas jika onRequestDownload tersedia) */}
          <button
            type="button"
            onClick={onRequestDownload || handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download .docx</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Parchment Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 parchment-paper text-slate-800 font-mono text-[11px] sm:text-xs leading-relaxed select-text space-y-4">

        {/* Judul Akta */}
        <div className="text-center space-y-1 pb-4 border-b border-slate-300">
          <h2 className="font-bold text-sm tracking-wider uppercase underline">
            AKTA PENDIRIAN {isPT ? "PERSEROAN TERBATAS" : "PERSEKUTUAN KOMANDITER"}
          </h2>
          <h3 className="font-bold text-base tracking-widest text-slate-900">
            {isPT ? "PT " : "CV "}
            {form.nama_perusahaan.toUpperCase() || "...................."}
          </h3>
          <p className="text-[11px] font-semibold text-slate-600">
            Nomor: {form.nomor_akta || "....."}.-
          </p>
        </div>

        {/* Pembuka & Notaris */}
        <p className="text-justify indent-8">
          ---Pada hari ini, tanggal tersebut pada bagian akhir akta ini, berhadapan dengan saya,{" "}
          <strong className="underline">{form.nama_notaris || "...................."}</strong>, Notaris di{" "}
          <strong>{form.wilayah_notaris || "...................."}</strong>, dengan dihadiri oleh saksi-saksi yang saya,
          Notaris kenal dan akan disebutkan pada bagian akhir akta ini:------------------
        </p>

        {/* Pihak Kuasa */}
        <p className="text-justify indent-8">
          ---<strong>{form.kuasa.sapaan} {form.kuasa.nama_lengkap || "...................."}</strong>, lahir di{" "}
          {form.kuasa.tempat_lahir || "....."}, tanggal {form.kuasa.tgl_lahir || "....."} ({form.kuasa.tgl_lahir ? tanggalKeTerbilang(form.kuasa.tgl_lahir) : "....."}),
          Warga Negara Indonesia, {form.kuasa.pekerjaan || "Staf Administrasi Notaris"}, bertempat tinggal di {form.kuasa.alamat_jalan || "....."},
          Rukun Tetangga {padRtRw(form.kuasa.rt)}, Rukun Warga {padRtRw(form.kuasa.rw)},
          Kelurahan/Desa {form.kuasa.kelurahan || "....."}, Kecamatan {form.kuasa.kecamatan || "....."}, {form.kuasa.kab_kota || form.wilayah_notaris},
          Provinsi {form.kuasa.provinsi || "....."}, pemegang Kartu Tanda Penduduk nomor:{" "}
          <strong>{form.kuasa.nik || "................"}</strong>; untuk sementara berada di {form.wilayah_notaris || "....."};-------
        </p>
        <p className="text-justify indent-8">
          ---menurut keterangannya dalam hal ini bertindak selaku kuasa berdasarkan surat kuasa di bawah
          tangan tertanggal {form.kuasa.tgl_surat_kuasa || "....."} ({form.kuasa.tgl_surat_kuasa ? tanggalKeTerbilang(form.kuasa.tgl_surat_kuasa) : "....."}),
          bermeterai cukup dan dilekatkan pada minuta akta ini, dari dan oleh karenanya untuk dan atas nama:
        </p>

        {/* Komparisi Para Pendiri */}
        <div className="space-y-3 pl-4">
          {form.pendiri.map((p, idx) => (
            <p key={idx} className="text-justify">
              <strong>{idx + 1}. {p.sapaan} {p.nama_lengkap || "..........."}</strong>, lahir di{" "}
              {p.tempat_lahir || "....."}, pada tanggal {p.tgl_lahir || "....."} ({p.tgl_lahir ? tanggalKeTerbilang(p.tgl_lahir) : "....."}),
              Warga Negara Indonesia, {p.pekerjaan || "....."}, bertempat tinggal di {p.alamat_jalan || "....."},
              Rukun Tetangga {padRtRw(p.rt)}, Rukun Warga {padRtRw(p.rw)}, Kelurahan/Desa {p.kelurahan || "....."},
              Kecamatan {p.kecamatan || "....."}, {p.kab_kota || "....."}, Provinsi {p.provinsi || "....."}, pemegang Kartu Tanda Penduduk
              nomor: <strong>{p.nik || "................"}</strong>;---------------------------------
            </p>
          ))}
        </div>

        {/* Pasal 1: Nama & Tempat Kedudukan */}
        <div className="pt-2 space-y-1">
          <p className="text-center font-bold">--- NAMA DAN TEMPAT KEDUDUKAN ---</p>
          <p className="text-center font-bold">Pasal 1</p>
          <p className="text-justify indent-8">
            1. Perseroan ini bernama <strong>{isPT ? "PT " : "CV "}{form.nama_perusahaan.toUpperCase() || "...................."}</strong>,
            berkedudukan di {form.kab_kota_perusahaan || "....."}.----------------------------------------
          </p>
          <p className="text-justify indent-8">
            2. Kantor Pusat beralamat di {form.alamat_perusahaan || "....."}, RT {padRtRw(form.rt_perusahaan)},
            RW {padRtRw(form.rw_perusahaan)}, Kelurahan {form.kel_perusahaan || "....."}, Kecamatan {form.kec_perusahaan || "....."},
            {form.kab_kota_perusahaan || "....."}, Provinsi {form.prov_perusahaan || "....."}, Kode Pos {form.kode_pos_perusahaan || "....."}.--
          </p>
        </div>

        {/* Pasal 3: KBLI */}
        <div className="pt-2 space-y-1">
          <p className="text-center font-bold">--- MAKSUD DAN TUJUAN SERTA KEGIATAN USAHA ---</p>
          <p className="text-center font-bold">Pasal 3</p>
          <p className="text-justify indent-8">
            1. Maksud dan tujuan Perseroan ini ialah:--------------------------------------
          </p>
          <div className="pl-4 space-y-1">
            {uniqueCategories.length > 0 ? (
              uniqueCategories.map((c, i) => (
                <p key={i}><strong>{i + 1}. {c}</strong></p>
              ))
            ) : (
              <p className="italic text-slate-400">(Belum ada KBLI yang dipilih)</p>
            )}
          </div>

          <p className="text-justify indent-8 pt-1">
            2. Untuk mencapai maksud dan tujuan tersebut di atas Perseroan dapat melaksanakan kegiatan usaha:
          </p>
          <div className="pl-4 space-y-1.5">
            {form.kbli.map((k, i) => (
              <p key={i} className="text-justify">
                <strong>{i + 1}. {k.kode_kbli} {k.judul_kbli}:</strong> {k.uraian_kbli}
              </p>
            ))}
          </div>
        </div>

        {/* Pasal 4: Modal */}
        <div className="pt-2 space-y-1">
          <p className="text-center font-bold">--- MODAL ---</p>
          <p className="text-center font-bold">Pasal 4</p>
          {isPT ? (
            <>
              <p className="text-justify indent-8">
                1. Modal dasar Perseroan berjumlah Rp {formatRibuan(form.modal_dasar)},- ({rupiahKeTerbilang(form.modal_dasar)}),
                terbagi atas {formatRibuan(lembarModalDasar)} ({capitalizeFirst(angkaKeTerbilang(lembarModalDasar))})
                lembar saham, masing-masing saham bernilai nominal Rp {formatRibuan(form.nominal_per_saham)},- ({rupiahKeTerbilang(form.nominal_per_saham)}).
              </p>
              <p className="text-justify indent-8">
                2. Dari modal dasar tersebut telah ditempatkan dan disetor sejumlah Rp {formatRibuan(form.modal_disetor)},- ({rupiahKeTerbilang(form.modal_disetor)}),
                atau sejumlah {formatRibuan(lembarModalDisetor)} ({capitalizeFirst(angkaKeTerbilang(lembarModalDisetor))}) lembar saham.
              </p>
            </>
          ) : (
            <p className="text-justify indent-8">
              Modal persekutuan ini adalah sebesar Rp {formatRibuan(form.total_modal_cv)},- ({rupiahKeTerbilang(form.total_modal_cv)}).
            </p>
          )}
        </div>

        {/* Penutup & Saksi-Saksi Akta (Pasal 40 UUJN - Dirender Dinamis & Lengkap) */}
        <div className="pt-4 border-t border-slate-300 space-y-2">
          <p className="text-justify indent-8">
            ---DEMIKIANLAH AKTA INI dibuat dan diselesaikan di <strong>{form.wilayah_notaris || "...................."}</strong>,
            pada hari, tanggal, bulan, dan tahun seperti disebutkan pada bagian awal akta ini, dengan dihadiri oleh:
          </p>

          <div className="space-y-2 pl-4">
            {form.saksi.map((s, idx) => (
              <p key={idx} className="text-justify">
                <strong>{idx + 1}. {s.sapaan} {s.nama_lengkap.toUpperCase() || "...................."}</strong>, lahir di{" "}
                {s.tempat_lahir || "....."}, pada tanggal {s.tgl_lahir || "....."} ({s.tgl_lahir ? tanggalKeTerbilang(s.tgl_lahir) : "....."}),
                Warga Negara Indonesia, {s.pekerjaan || "Karyawan Notaris"}, bertempat tinggal di {s.alamat_jalan || "....."},
                Rukun Tetangga {padRtRw(s.rt)}, Rukun Warga {padRtRw(s.rw)}, Kelurahan/Desa {s.kelurahan || "....."},
                Kecamatan {s.kecamatan || "....."}, {s.kab_kota || form.wilayah_notaris}, pemegang Kartu Tanda Penduduk
                nomor: <strong>{s.nik || "................"}</strong>;---------------------------------
              </p>
            ))}
          </div>

          <p className="text-justify indent-8">
            ---keduanya/para penghadap di atas adalah karyawan kantor Notaris yang saya, Notaris kenal dan bertindak
            sebagai saksi-saksi akta ini.-----------------------------------------------------------
          </p>
          <p className="text-justify indent-8">
            ---Segera setelah akta ini saya, Notaris bacakan kepada para penghadap dan para saksi, maka akta ini
            ditandatangani oleh para penghadap, para saksi, dan saya, Notaris.-----------------------
          </p>
          <p className="text-left font-mono">
            -Dibuat dengan...
          </p>

          {/* ===================== BLOK TANDA TANGAN (TTD AKTA OTENTIK) ===================== */}
          <div className="pt-6 pb-6 space-y-8 text-slate-900 select-text font-mono">
            
            {/* Baris 1: Para Penghadap / Pendiri / Pemegang Saham (Dinamis Berpasangan) */}
            <div className="space-y-4">
              {Array.from({ length: Math.max(1, Math.ceil(form.pendiri.length / 2)) }).map((_, rowIdx) => {
                const pKiri = form.pendiri[rowIdx * 2];
                const pKanan = form.pendiri[rowIdx * 2 + 1];
                const isFirstRow = rowIdx === 0;

                return (
                  <div key={rowIdx} className="grid grid-cols-2 gap-8 text-center items-end">
                    {/* Kolom Kiri */}
                    <div className="flex flex-col items-center">
                      {isFirstRow && (
                        <div className="mb-2 self-start pl-2">
                          <div className="border border-dashed border-slate-400 bg-amber-50/70 text-slate-600 text-[10px] px-2 py-0.5 rounded font-sans italic">
                            Materai 10.000
                          </div>
                        </div>
                      )}
                      <div className="h-16 flex items-end justify-center w-full">
                        <span className="font-bold underline text-[11px] sm:text-xs tracking-wider uppercase">
                          {pKiri?.nama_lengkap || "...................."}
                        </span>
                      </div>
                    </div>

                    {/* Kolom Kanan */}
                    <div className="flex flex-col items-center justify-end">
                      <div className="h-16 flex items-end justify-center w-full">
                        {pKanan ? (
                          <span className="font-bold underline text-[11px] sm:text-xs tracking-wider uppercase">
                            {pKanan.nama_lengkap}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Baris 2: Saksi-Saksi Akta (Dinamis Berpasangan) */}
            <div className="space-y-4 pt-2">
              {Array.from({ length: Math.max(1, Math.ceil(form.saksi.length / 2)) }).map((_, rowIdx) => {
                const sKiri = form.saksi[rowIdx * 2];
                const sKanan = form.saksi[rowIdx * 2 + 1];

                return (
                  <div key={rowIdx} className="grid grid-cols-2 gap-8 text-center items-end">
                    <div className="flex flex-col items-center justify-end">
                      <div className="h-16 flex items-end justify-center w-full">
                        <span className="font-bold underline text-[11px] sm:text-xs tracking-wider uppercase">
                          {sKiri?.nama_lengkap || "...................."}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-end">
                      <div className="h-16 flex items-end justify-center w-full">
                        {sKanan ? (
                          <span className="font-bold underline text-[11px] sm:text-xs tracking-wider uppercase">
                            {sKanan.nama_lengkap}
                          </span>
                        ) : (
                          <span className="font-bold underline text-[11px] sm:text-xs tracking-wider uppercase">
                            ....................
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Baris 3: Pejabat Notaris (Center Alignment - Lengkap Dengan Gelar) */}
            <div className="flex flex-col items-center justify-center pt-6 text-center">
              <div className="h-20 flex items-end justify-center w-full">
                <span className="font-bold underline text-[11px] sm:text-xs tracking-wider uppercase">
                  {form.nama_notaris || "...................."}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

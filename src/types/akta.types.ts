export type JenisBadanUsaha = "PT" | "CV";
export type Sapaan = "Tuan" | "Nyonya" | "Nona";

export interface DataKTP {
  id?: string;
  sapaan: Sapaan;
  nama_lengkap: string;
  tempat_lahir: string;
  tgl_lahir: string; // YYYY-MM-DD
  pekerjaan: string;
  alamat_jalan: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kab_kota: string;
  provinsi: string;
  nik: string;
}

export type JabatanPT = "DIREKTUR UTAMA" | "DIREKTUR" | "KOMISARIS UTAMA" | "KOMISARIS" | "PEMEGANG SAHAM";
export type JabatanCV = "PERSERO PENGURUS (DIREKTUR)" | "PERSERO KOMANDITER";

export interface PendiriAkta extends DataKTP {
  // Spesifik PT
  jumlah_lembar_saham: number;
  jabatan_pt: JabatanPT;
  // Spesifik CV
  nominal_modal_cv: number;
  jabatan_cv: JabatanCV;
}

export interface ItemKBLI {
  kode_kbli: string;
  judul_kbli: string;
  kode_kategori: string;
  nama_kategori: string;
  uraian_kbli: string;
}

export interface KuasaNotaris extends DataKTP {
  nomor_surat_kuasa: string;
  tgl_surat_kuasa: string;
}

export interface AktaFormState {
  nama_draft?: string;
  jenis_badan_usaha: JenisBadanUsaha;
  nama_perusahaan: string;
  nomor_akta: string;

  // Alamat Perusahaan (Pasal 1)
  alamat_perusahaan: string;
  rt_perusahaan: string;
  rw_perusahaan: string;
  kel_perusahaan: string;
  kec_perusahaan: string;
  kab_kota_perusahaan: string;
  prov_perusahaan: string;
  kode_pos_perusahaan: string;
  pengadilan_negeri_cv: string; // Khusus CV (Pasal 14)
  tgl_tutup_buku: string; // Default: YYYY-12-31

  // Modal PT (Pasal 4)
  modal_dasar: number;
  nominal_per_saham: number;
  modal_disetor: number;

  // Modal CV
  total_modal_cv: number;

  // Arrays
  pendiri: PendiriAkta[];
  kbli: ItemKBLI[];

  // Pihak Notariat
  nama_notaris: string;
  wilayah_notaris: string;
  sk_notaris: string;
  kuasa: KuasaNotaris;
  saksi: DataKTP[];
}


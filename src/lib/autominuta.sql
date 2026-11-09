-- ==============================================================================
-- AUTOMINUTA STUDIO - SUPABASE POSTGRESQL SCHEMA & MIGRATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.legal_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_email text NOT NULL UNIQUE,
  nama_notaris text NOT NULL DEFAULT 'JIHAN KHOIRINI, Sarjana Hukum, Magister Kenotariatan'::text,
  wilayah_notaris text NOT NULL DEFAULT 'Kabupaten Bandung Barat'::text,
  sk_notaris text DEFAULT 'AHU-00124.AH.02.01.TAHUN 2021'::text,
  kuasa jsonb NOT NULL DEFAULT '{"rt": "003", "rw": "008", "nik": "3216061904940001", "sapaan": "Tuan", "kab_kota": "Kabupaten Bekasi", "provinsi": "Jawa Barat", "kecamatan": "Cikarang Pusat", "kelurahan": "Sukamahi", "pekerjaan": "Staf Administrasi Notaris", "tgl_lahir": "1994-04-19", "alamat_jalan": "Jalan Boulevard Grand Surya No. 42", "nama_lengkap": "VIKRI FIRDAUS, S.H.", "tempat_lahir": "Bekasi", "tgl_surat_kuasa": "2026-03-10", "nomor_surat_kuasa": "SK-DIR/03/2026/08"}'::jsonb,
  saksi_1 jsonb NOT NULL DEFAULT '{"rt": "002", "rw": "005", "nik": "3201075508980002", "sapaan": "Nona", "kab_kota": "Kabupaten Bandung Barat", "provinsi": "Jawa Barat", "kecamatan": "Ngamprah", "kelurahan": "Gadobangkong", "pekerjaan": "Karyawan Notaris", "tgl_lahir": "1998-08-15", "alamat_jalan": "Jl. Raya Gadobangkong No. 12", "nama_lengkap": "ARUNI HUSNAYAINI", "tempat_lahir": "Bandung"}'::jsonb,
  saksi_2 jsonb NOT NULL DEFAULT '{"rt": "004", "rw": "011", "nik": "3201076211990004", "sapaan": "Nona", "kab_kota": "Kabupaten Bandung Barat", "provinsi": "Jawa Barat", "kecamatan": "Ngamprah", "kelurahan": "Tanimulya", "pekerjaan": "Karyawan Notaris", "tgl_lahir": "1999-11-22", "alamat_jalan": "Komplek Permata Cimahi Blok D-4", "nama_lengkap": "DINDA KHOIRINA", "tempat_lahir": "Cimahi"}'::jsonb,
  saksi jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT legal_profiles_pkey PRIMARY KEY (id)
);

-- MIGRATION: DUKUNGAN SAKSI DINAMIS (ARRAY JSONB)
ALTER TABLE public.legal_profiles 
ADD COLUMN IF NOT EXISTS saksi jsonb DEFAULT '[]'::jsonb;

-- Sinkronisasi data saksi_1 & saksi_2 ke array saksi
UPDATE public.legal_profiles
SET saksi = jsonb_build_array(saksi_1, saksi_2)
WHERE (saksi IS NULL OR jsonb_array_length(saksi) = 0)
  AND saksi_1 IS NOT NULL 
  AND saksi_2 IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.master_kbli (
  kode_kbli character varying NOT NULL,
  judul_kbli text NOT NULL,
  kode_kategori character varying NOT NULL,
  nama_kategori text NOT NULL,
  uraian_kbli text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_kbli_pkey PRIMARY KEY (kode_kbli)
);

CREATE TABLE IF NOT EXISTS public.akta_drafts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_email text NOT NULL,
  jenis_badan_usaha character varying NOT NULL CHECK (jenis_badan_usaha::text = ANY (ARRAY['PT'::character varying, 'CV'::character varying]::text[])),
  nama_perusahaan text NOT NULL,
  nama_draft text,
  nomor_akta character varying DEFAULT '08'::character varying,
  payload_json jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT akta_drafts_pkey PRIMARY KEY (id)
);

-- MIGRATION: DUKUNGAN BANYAK DRAF & NAMA FILE/JUDUL DRAF
ALTER TABLE public.akta_drafts 
ADD COLUMN IF NOT EXISTS nama_draft text;

-- Hapus constraint unique jika ada, agar user bisa menyimpan banyak versi draf untuk perusahaan yang sama
ALTER TABLE public.akta_drafts 
DROP CONSTRAINT IF EXISTS akta_drafts_user_email_nama_perusahaan_key;

CREATE TABLE IF NOT EXISTS public.dummy_dev_templates (
  id character varying NOT NULL,
  judul text NOT NULL,
  jenis_badan_usaha character varying NOT NULL CHECK (jenis_badan_usaha::text = ANY (ARRAY['PT'::character varying, 'CV'::character varying]::text[])),
  deskripsi text,
  payload_json jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT dummy_dev_templates_pkey PRIMARY KEY (id)
);

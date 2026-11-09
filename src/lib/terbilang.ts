const SATUAN = [
  "", "satu", "dua", "tiga", "empat", "lima",
  "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"
];

const BULAN_INDONESIA = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

/**
 * Mengubah angka menjadi teks terbilang gaya akta notaris (penulisan majemuk rapat)
 * Contoh: 250000 -> "duaratus limapuluh ribu"
 */
export function angkaKeTerbilang(n: number): string {
  if (n < 0) return "";
  if (n < 12) return SATUAN[n];
  if (n < 20) return angkaKeTerbilang(n - 10) + "belas";
  if (n < 100) {
    const depan = Math.floor(n / 10);
    const sisa = n % 10;
    return (SATUAN[depan] + "puluh" + (sisa > 0 ? " " + angkaKeTerbilang(sisa) : "")).trim();
  }
  if (n < 200) return "seratus" + (n - 100 > 0 ? " " + angkaKeTerbilang(n - 100) : "");
  if (n < 1000) {
    const depan = Math.floor(n / 100);
    const sisa = n % 100;
    return (SATUAN[depan] + "ratus" + (sisa > 0 ? " " + angkaKeTerbilang(sisa) : "")).trim();
  }
  if (n < 2000) return "seribu" + (n - 1000 > 0 ? " " + angkaKeTerbilang(n - 1000) : "");
  if (n < 1_000_000) {
    const depan = Math.floor(n / 1000);
    const sisa = n % 1000;
    return (angkaKeTerbilang(depan) + " ribu" + (sisa > 0 ? " " + angkaKeTerbilang(sisa) : "")).trim();
  }
  if (n < 1_000_000_000) {
    const depan = Math.floor(n / 1_000_000);
    const sisa = n % 1_000_000;
    return (angkaKeTerbilang(depan) + " Juta" + (sisa > 0 ? " " + angkaKeTerbilang(sisa) : "")).trim();
  }
  if (n < 1_000_000_000_000) {
    const depan = Math.floor(n / 1_000_000_000);
    const sisa = n % 1_000_000_000;
    return (angkaKeTerbilang(depan) + " Miliar" + (sisa > 0 ? " " + angkaKeTerbilang(sisa) : "")).trim();
  }
  return "";
}

export function capitalizeFirst(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatRibuan(n: number): string {
  if (isNaN(n) || n === null || n === undefined) return "0";
  return n.toLocaleString("id-ID");
}

export function rupiahKeTerbilang(nominal: number): string {
  if (!nominal || nominal <= 0) return "Nol Rupiah";
  return `${capitalizeFirst(angkaKeTerbilang(nominal))} Rupiah`;
}

/**
 * Konversi Tanggal "YYYY-MM-DD" atau "DD-MM-YYYY" ke Terbilang Akta
 * Contoh: "14-06-1995" -> "empatbelas Juni seribu sembilanratus sembilanpuluh lima"
 */
export function tanggalKeTerbilang(tglStr: string): string {
  if (!tglStr) return "";
  let hari = 0, bulan = 0, tahun = 0;

  if (tglStr.includes("-")) {
    const parts = tglStr.split("-");
    if (parts[0].length === 4) {
      // Format YYYY-MM-DD
      tahun = parseInt(parts[0], 10);
      bulan = parseInt(parts[1], 10);
      hari = parseInt(parts[2], 10);
    } else {
      // Format DD-MM-YYYY
      hari = parseInt(parts[0], 10);
      bulan = parseInt(parts[1], 10);
      tahun = parseInt(parts[2], 10);
    }
  } else {
    return "";
  }

  if (isNaN(hari) || isNaN(bulan) || isNaN(tahun)) return "";

  const hariTeks = angkaKeTerbilang(hari);
  const bulanTeks = BULAN_INDONESIA[bulan] || "";
  
  // Format tahun akta notaris (misal: 2026 -> "duaribu duapuluh enam")
  let tahunTeks = "";
  if (tahun >= 2000 && tahun < 2100) {
    tahunTeks = "duaribu" + (tahun - 2000 > 0 ? " " + angkaKeTerbilang(tahun - 2000) : "");
  } else {
    tahunTeks = angkaKeTerbilang(tahun);
  }

  return `${hariTeks} ${bulanTeks} ${tahunTeks}`.trim();
}

export function padRtRw(val: string | number): string {
  return String(val || "").padStart(3, "0");
}


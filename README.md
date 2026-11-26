# DompetKeluarga — Anggaran Keluarga Santoso

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/tuyullsxx1-cmd/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/tuyullsxx1-cmd/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

Situs anggaran rumah tangga untuk Keluarga Santoso, November 2026 — dibuat untuk
kompetisi make.fun [best-household-budget-site-20261126-1457](https://make.fun/bounty/best-household-budget-site-20261126-1457).
Semua angka nyata dan konsisten: pemasukan Rp23.100.000, pengeluaran Rp10.353.000,
sisa Rp12.747.000, dihitung dari transaksi yang sama di setiap halaman.

## Isi situs

- **Dashboard** — ringkasan bulan ini (pemasukan, pengeluaran, sisa, sisa anggaran),
  3 kategori terbesar, tagihan jatuh tempo minggu ini, dan tips bulan ini.
- **Transaksi** — tambah, ubah, dan hapus transaksi (tanggal, deskripsi, kategori,
  jumlah, jenis), filter per kategori, dan cari deskripsi. Total berjalan ikut berubah.
- **Anggaran** — progress bar per kategori dari transaksi nyata, atur ulang nominal
  anggaran, plus grafik tren 6 bulan dan aturan praktis 50/30/20.
- **Tren** — grafik batang SVG pemasukan vs pengeluaran Juni–November 2026, dengan
  mode tampilkan sisa tiap bulan dan tabel angka per bulan.
- **Tagihan** — tagihan rutin (SPP, listrik, air, internet, BPJS, asuransi, iuran RT)
  dengan tanggal jatuh tempo dan tombol tandai lunas/belum.
- **Tabungan** — target dana darurat, liburan, dan renovasi dapur dengan progress
  dan form tambah setoran.

Semua perubahan tersimpan di peramban (localStorage). Situs statis, tanpa
jaringan, tanpa font atau pustaka eksternal — buka di desktop maupun ponsel.

## Cara jalan

```sh
cd app && python3 -m http.server 8123
# buka http://localhost:8123/
```

## Struktur

- `app/index.html` — kerangka + navigasi hash route
- `app/style.css` — semua gaya
- `app/data.js` — data contoh + hitung-hitungan uang
- `app/views.js` — HTML tiap halaman
- `app/charts.js` — grafik batang SVG tren bulanan
- `app/main.js` — router + semua aksi pengguna
- `main.ts` — menyalin `app/` + `screenshots/` ke output dan menulis `dossier.json`
- `screenshots/` — 4 render nyata (dashboard, transaksi, anggaran, tampilan ponsel)

Entri untuk kompetisi make.fun `best-household-budget-site-20261126-1457`.
Lisensi MIT.

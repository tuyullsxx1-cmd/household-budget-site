/* DompetKeluarga — data & state. Satu job: data contoh + hitung-hitungan uang. */
(function () {
  'use strict';

  var KUNCI = 'dompetkeluarga-v1';

  var KATEGORI = ['Belanja', 'Makan', 'Transport', 'Tagihan', 'Pendidikan', 'Hiburan', 'Kesehatan', 'Lainnya'];

  // v2: satu warna khas per kategori, dipakai di mana-mana — batang anggaran,
  // titik di daftar teratas, dan tag kategori — supaya tiap kategori langsung
  // dikenali tanpa baca labelnya. Emas = Belanja (pengeluaran terbesar).
  var WARNA_KATEGORI = {
    Belanja: '#c98a1b', Makan: '#c65a3c', Transport: '#2e7d8a', Tagihan: '#7a5c9e',
    Pendidikan: '#166b4f', Hiburan: '#c24d6d', Kesehatan: '#4a7fb5', Lainnya: '#8a8f7a'
  };

  var ANGGARAN_AWAL = {
    Belanja: 3500000, Makan: 1200000, Transport: 1500000, Tagihan: 2800000,
    Pendidikan: 2000000, Hiburan: 800000, Kesehatan: 1000000, Lainnya: 600000
  };

  var PEMASUKAN_AWAL = [
    { id: 'm1', tanggal: '2026-11-01', deskripsi: 'Gaji Budi Santoso', kategori: 'Pemasukan', jumlah: 12500000, jenis: 'masuk' },
    { id: 'm2', tanggal: '2026-11-01', deskripsi: 'Gaji Sari Santoso', kategori: 'Pemasukan', jumlah: 8750000, jenis: 'masuk' },
    { id: 'm3', tanggal: '2026-11-15', deskripsi: 'Jualan online — toko Sari', kategori: 'Pemasukan', jumlah: 1850000, jenis: 'masuk' }
  ];

  var PENGELUARAN_AWAL = [
    { id: 't01', tanggal: '2026-11-01', deskripsi: 'Belanja mingguan — Pasar Minggu', kategori: 'Belanja', jumlah: 850000, jenis: 'keluar' },
    { id: 't02', tanggal: '2026-11-02', deskripsi: 'Bensin motor', kategori: 'Transport', jumlah: 300000, jenis: 'keluar' },
    { id: 't03', tanggal: '2026-11-03', deskripsi: 'Makan siang keluarga', kategori: 'Makan', jumlah: 185000, jenis: 'keluar' },
    { id: 't04', tanggal: '2026-11-04', deskripsi: 'Apotek — vitamin', kategori: 'Kesehatan', jumlah: 185000, jenis: 'keluar' },
    { id: 't05', tanggal: '2026-11-05', deskripsi: 'Supermarket — kebutuhan dapur', kategori: 'Belanja', jumlah: 720000, jenis: 'keluar' },
    { id: 't06', tanggal: '2026-11-05', deskripsi: 'SPP sekolah Dimas', kategori: 'Tagihan', jumlah: 750000, jenis: 'keluar' },
    { id: 't07', tanggal: '2026-11-06', deskripsi: 'Buku + alat tulis Dimas', kategori: 'Pendidikan', jumlah: 320000, jenis: 'keluar' },
    { id: 't08', tanggal: '2026-11-07', deskripsi: 'Bioskop keluarga', kategori: 'Hiburan', jumlah: 180000, jenis: 'keluar' },
    { id: 't09', tanggal: '2026-11-08', deskripsi: 'Makan malam di luar', kategori: 'Makan', jumlah: 240000, jenis: 'keluar' },
    { id: 't10', tanggal: '2026-11-09', deskripsi: 'Bensin mobil', kategori: 'Transport', jumlah: 280000, jenis: 'keluar' },
    { id: 't11', tanggal: '2026-11-09', deskripsi: 'Laundry', kategori: 'Lainnya', jumlah: 120000, jenis: 'keluar' },
    { id: 't12', tanggal: '2026-11-10', deskripsi: 'Listrik PLN', kategori: 'Tagihan', jumlah: 485000, jenis: 'keluar' },
    { id: 't13', tanggal: '2026-11-10', deskripsi: 'Langganan streaming', kategori: 'Hiburan', jumlah: 149000, jenis: 'keluar' },
    { id: 't14', tanggal: '2026-11-11', deskripsi: 'Tol + parkir', kategori: 'Transport', jumlah: 150000, jenis: 'keluar' },
    { id: 't15', tanggal: '2026-11-12', deskripsi: 'Belanja mingguan', kategori: 'Belanja', jumlah: 640000, jenis: 'keluar' },
    { id: 't16', tanggal: '2026-11-12', deskripsi: 'Air PDAM', kategori: 'Tagihan', jumlah: 165000, jenis: 'keluar' },
    { id: 't17', tanggal: '2026-11-13', deskripsi: 'Les piano Dimas', kategori: 'Pendidikan', jumlah: 500000, jenis: 'keluar' },
    { id: 't18', tanggal: '2026-11-14', deskripsi: 'Jajan anak + es krim', kategori: 'Makan', jumlah: 95000, jenis: 'keluar' },
    { id: 't19', tanggal: '2026-11-15', deskripsi: 'Internet rumah', kategori: 'Tagihan', jumlah: 349000, jenis: 'keluar' },
    { id: 't20', tanggal: '2026-11-15', deskripsi: 'Dokter gigi Dimas', kategori: 'Kesehatan', jumlah: 350000, jenis: 'keluar' },
    { id: 't21', tanggal: '2026-11-16', deskripsi: 'Makan siang kantor Sari', kategori: 'Makan', jumlah: 150000, jenis: 'keluar' },
    { id: 't22', tanggal: '2026-11-17', deskripsi: 'Ojek online', kategori: 'Transport', jumlah: 220000, jenis: 'keluar' },
    { id: 't23', tanggal: '2026-11-18', deskripsi: 'Kursus bahasa Inggris Sari', kategori: 'Pendidikan', jumlah: 450000, jenis: 'keluar' },
    { id: 't24', tanggal: '2026-11-19', deskripsi: 'Supermarket + daging', kategori: 'Belanja', jumlah: 580000, jenis: 'keluar' },
    { id: 't25', tanggal: '2026-11-20', deskripsi: 'BPJS Kesehatan', kategori: 'Tagihan', jumlah: 280000, jenis: 'keluar' },
    { id: 't26', tanggal: '2026-11-20', deskripsi: 'Potong rambut', kategori: 'Lainnya', jumlah: 150000, jenis: 'keluar' },
    { id: 't27', tanggal: '2026-11-21', deskripsi: 'Makan malam ulang tahun nenek', kategori: 'Makan', jumlah: 320000, jenis: 'keluar' },
    { id: 't28', tanggal: '2026-11-22', deskripsi: 'Mainan anak', kategori: 'Hiburan', jumlah: 220000, jenis: 'keluar' },
    { id: 't29', tanggal: '2026-11-23', deskripsi: 'Servis motor', kategori: 'Transport', jumlah: 350000, jenis: 'keluar' },
    { id: 't30', tanggal: '2026-11-24', deskripsi: 'Belanja mingguan', kategori: 'Belanja', jumlah: 410000, jenis: 'keluar' },
    { id: 't31', tanggal: '2026-11-25', deskripsi: 'Kopi + roti', kategori: 'Makan', jumlah: 210000, jenis: 'keluar' }
  ];

  var TAGIHAN_AWAL = [
    { id: 'b1', nama: 'SPP sekolah Dimas', jumlah: 750000, jatuhTempo: 5, dibayar: true },
    { id: 'b2', nama: 'Listrik PLN', jumlah: 485000, jatuhTempo: 10, dibayar: true },
    { id: 'b3', nama: 'Langganan streaming', jumlah: 149000, jatuhTempo: 10, dibayar: true },
    { id: 'b4', nama: 'Air PDAM', jumlah: 165000, jatuhTempo: 12, dibayar: true },
    { id: 'b5', nama: 'Internet rumah', jumlah: 349000, jatuhTempo: 15, dibayar: true },
    { id: 'b6', nama: 'BPJS Kesehatan', jumlah: 280000, jatuhTempo: 20, dibayar: true },
    { id: 'b7', nama: 'Asuransi jiwa', jumlah: 620000, jatuhTempo: 25, dibayar: false },
    { id: 'b8', nama: 'Iuran RT', jumlah: 50000, jatuhTempo: 28, dibayar: false }
  ];

  var TABUNGAN_AWAL = [
    { id: 's1', nama: 'Dana darurat', target: 30000000, terkumpul: 18500000, catatan: 'Target 6 bulan pengeluaran pokok.' },
    { id: 's2', nama: 'Liburan keluarga', target: 8000000, terkumpul: 3200000, catatan: 'Rencana ke Yogyakarta, Juni 2027.' },
    { id: 's3', nama: 'Renovasi dapur', target: 12000000, terkumpul: 4750000, catatan: 'Ganti kompor dan kabinet bawah.' }
  ];

  var TREN_AWAL = [
    { bulan: 'Jun', pemasukan: 21800000, pengeluaran: 9850000 },
    { bulan: 'Jul', pemasukan: 22400000, pengeluaran: 10120000 },
    { bulan: 'Agu', pemasukan: 22100000, pengeluaran: 9640000 },
    { bulan: 'Sep', pemasukan: 22900000, pengeluaran: 10480000 },
    { bulan: 'Okt', pemasukan: 23000000, pengeluaran: 10210000 },
    { bulan: 'Nov', pemasukan: 23100000, pengeluaran: 10353000 }
  ];

  function salin(obj) { return JSON.parse(JSON.stringify(obj)); }

  function dataAwal() {
    return {
      anggaran: salin(ANGGARAN_AWAL),
      transaksi: PEMASUKAN_AWAL.concat(PENGELUARAN_AWAL),
      tagihan: salin(TAGIHAN_AWAL),
      tabungan: salin(TABUNGAN_AWAL),
      tren: salin(TREN_AWAL)
    };
  }

  function muat() {
    try {
      var mentah = window.localStorage.getItem(KUNCI);
      if (!mentah) return dataAwal();
      var data = JSON.parse(mentah);
      if (!data || !Array.isArray(data.transaksi) || !data.anggaran) return dataAwal();
      return data;
    } catch (e) {
      return dataAwal();
    }
  }

  function simpan(data) {
    try { window.localStorage.setItem(KUNCI, JSON.stringify(data)); } catch (e) { /* penyimpanan penuh: tetap tampil */ }
  }

  function formatRp(nilai) {
    return 'Rp' + Math.round(nilai).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function formatTanggal(iso) {
    var p = iso.split('-');
    return parseInt(p[2], 10) + ' Nov 2026';
  }

  function totalJenis(data, jenis) {
    var total = 0;
    data.transaksi.forEach(function (t) { if (t.jenis === jenis) total += t.jumlah; });
    return total;
  }

  function totalKategori(data, kategori) {
    var total = 0;
    data.transaksi.forEach(function (t) {
      if (t.jenis === 'keluar' && t.kategori === kategori) total += t.jumlah;
    });
    return total;
  }

  function totalAnggaran(data) {
    var total = 0;
    KATEGORI.forEach(function (k) { total += data.anggaran[k] || 0; });
    return total;
  }

  function tigaTerbesar(data) {
    return KATEGORI.map(function (k) {
      return { kategori: k, jumlah: totalKategori(data, k) };
    }).sort(function (a, b) { return b.jumlah - a.jumlah; }).slice(0, 3);
  }

  function tagihanMingguIni(data) {
    // Hari ini 26 Nov 2026: jatuh tempo 25–30 Nov.
    return data.tagihan.filter(function (b) { return b.jatuhTempo >= 25 && b.jatuhTempo <= 30; });
  }

  window.DompetData = {
    KATEGORI: KATEGORI,
    WARNA_KATEGORI: WARNA_KATEGORI,
    muat: muat,
    simpan: simpan,
    formatRp: formatRp,
    formatTanggal: formatTanggal,
    totalJenis: totalJenis,
    totalKategori: totalKategori,
    totalAnggaran: totalAnggaran,
    tigaTerbesar: tigaTerbesar,
    tagihanMingguIni: tagihanMingguIni
  };
})();

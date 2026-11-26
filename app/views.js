/* DompetKeluarga — tampilan per halaman. Satu job: HTML tiap rute dari data. */
(function () {
  'use strict';
  var D = window.DompetData;
  var G = window.DompetGrafik;

  function esc(teks) {
    return String(teks).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function persen(terpakai, anggaran) {
    if (!anggaran) return 0;
    return Math.round(terpakai / anggaran * 100);
  }

  function kelasBar(p) {
    if (p >= 100) return 'bar lewat';
    if (p >= 90) return 'bar penuh';
    return 'bar';
  }

  function barAnggaran(kategori, terpakai, anggaran) {
    var p = persen(terpakai, anggaran);
    var sisa = anggaran - terpakai;
    // v2: isi batang memakai warna khas kategori (bukan satu hijau untuk semua),
    // dan angka persen ikut berwarna saat anggaran hampir habis (>=90% emas,
    // 100% merah) — sinyalnya tetap kebaca tanpa mengorbankan identitas warna.
    var warna = D.WARNA_KATEGORI[kategori] || '#166b4f';
    var warnaPersen = p >= 100 ? '#b3382e' : (p >= 90 ? '#8a5a00' : '#22302a');
    return '<div class="anggaran-item">' +
      '<div class="nama"><span><span class="dot" style="background:' + warna + '"></span>' + esc(kategori) + '</span><span>' + D.formatRp(terpakai) + ' dari ' + D.formatRp(anggaran) + '</span></div>' +
      '<div class="' + kelasBar(p) + '" role="progressbar" aria-valuenow="' + p + '" aria-valuemin="0" aria-valuemax="100" aria-label="Anggaran ' + esc(kategori) + '"><span style="width:' + Math.min(p, 100) + '%;background:' + warna + '"></span></div>' +
      '<div class="bar-row"><span class="persen" style="color:' + warnaPersen + '">' + p + '% terpakai</span><span>' + (sisa >= 0 ? 'Sisa ' + D.formatRp(sisa) : 'Lewat ' + D.formatRp(-sisa)) + '</span></div>' +
      '</div>';
  }

  function dashboard(data) {
    var masuk = D.totalJenis(data, 'masuk');
    var keluar = D.totalJenis(data, 'keluar');
    var sisa = masuk - keluar;
    var anggaranTotal = D.totalAnggaran(data);
    var sisaAnggaran = anggaranTotal - keluar;
    var besar = D.tigaTerbesar(data);
    var minggu = D.tagihanMingguIni(data);
    var belum = minggu.filter(function (b) { return !b.dibayar; });
    var belumTotal = 0;
    belum.forEach(function (b) { belumTotal += b.jumlah; });
    var darurat = data.tabungan[0];
    var trenMini = data.tren.slice();
    trenMini[trenMini.length - 1] = { bulan: 'Nov', pemasukan: masuk, pengeluaran: keluar };
    var h = [];
    // v2: hero band — pita hijau tua dengan cincin dana darurat + mini tren sisa
    // bulanan, supaya dashboard langsung terbaca sebagai aplikasi anggaran dalam
    // sekali pandang, bukan tabel polos. Semua angka dari data yang sama.
    h.push('<section class="hero" aria-label="Ringkasan bulan ini"><div class="hero-teks">' +
      '<p class="eyebrow">November 2026 &middot; Keluarga Santoso</p>' +
      '<h1>Dashboard November 2026</h1>' +
      '<p class="hero-angka">Sisa <strong>' + D.formatRp(sisa) + '</strong> <span>&middot; ' + Math.round(sisa / masuk * 100) + '% pemasukan masih di tangan</span></p>' +
      '<p class="hero-sub">Pemasukan ' + D.formatRp(masuk) + ', pengeluaran ' + D.formatRp(keluar) + ' — semua angka di bawah dihitung dari transaksi yang sama dengan halaman Transaksi dan Anggaran.</p>' +
      G.renderMiniTren(trenMini) +
      '<p class="hero-ket">Sisa tiap bulan, Jun&ndash;Nov 2026 — emas = bulan berjalan.</p>' +
      '</div><div class="hero-cincin">' + G.renderCincin(darurat.terkumpul, darurat.target, 132) +
      '<p><strong>Dana darurat</strong><br>' + D.formatRp(darurat.terkumpul) + ' dari ' + D.formatRp(darurat.target) + ' — kurang ' + D.formatRp(darurat.target - darurat.terkumpul) + '.</p>' +
      '<p><a href="#/tabungan">Lihat semua target &rarr;</a></p></div></section>');
    h.push('<div class="grid kpi" style="margin-top:16px">');
    h.push('<div class="card kpi-card masukan"><div class="label">Pemasukan</div><div class="nilai">' + D.formatRp(masuk) + '</div><div class="sub">Gaji + jualan online</div></div>');
    h.push('<div class="card kpi-card keluar"><div class="label">Pengeluaran</div><div class="nilai">' + D.formatRp(keluar) + '</div><div class="sub">' + data.transaksi.filter(function (t) { return t.jenis === 'keluar'; }).length + ' transaksi tercatat</div></div>');
    h.push('<div class="card kpi-card sisa"><div class="label">Sisa uang</div><div class="nilai">' + D.formatRp(sisa) + '</div><div class="sub">' + Math.round(sisa / masuk * 100) + '% dari pemasukan tersisa</div></div>');
    h.push('<div class="card kpi-card anggaran"><div class="label">Sisa anggaran</div><div class="nilai">' + D.formatRp(sisaAnggaran) + '</div><div class="sub">Dari total anggaran ' + D.formatRp(anggaranTotal) + '</div></div>');
    h.push('</div>');
    h.push('<div class="grid dua" style="margin-top:16px">');
    h.push('<div class="card"><h2>3 kategori terbesar</h2><ul class="daftar">');
    besar.forEach(function (b) {
      var warna = D.WARNA_KATEGORI[b.kategori] || '#166b4f';
      h.push('<li><span><span class="dot" style="background:' + warna + '"></span>' + esc(b.kategori) + ' <span style="color:#5d6d65">(' + persen(b.jumlah, data.anggaran[b.kategori]) + '% dari anggaran)</span></span><span class="angka">' + D.formatRp(b.jumlah) + '</span></li>');
    });
    h.push('</ul><p style="font-family:system-ui,sans-serif;font-size:15px;margin:14px 0 0"><a href="#/anggaran">Lihat semua anggaran &rarr;</a></p></div>');
    h.push('<div class="card"><h2>Tagihan jatuh tempo minggu ini</h2>');
    if (minggu.length === 0) {
      h.push('<p>Tidak ada tagihan jatuh tempo minggu ini.</p>');
    } else {
      h.push('<ul class="daftar">');
      minggu.forEach(function (b) {
        h.push('<li><span>' + esc(b.nama) + ' &middot; tgl ' + b.jatuhTempo + ' Nov</span><span class="angka">' + D.formatRp(b.jumlah) + ' ' + (b.dibayar ? '<span class="tag lunas">Lunas</span>' : '<span class="tag belum">Belum dibayar</span>') + '</span></li>');
      });
      h.push('</ul>');
      h.push('<p style="font-family:system-ui,sans-serif;font-size:15px;margin:14px 0 0">' + belum.length + ' belum dibayar, total <strong>' + D.formatRp(belumTotal) + '</strong>. <a href="#/tagihan">Atur tagihan &rarr;</a></p>');
    }
    h.push('</div></div>');
    h.push('<div class="card tips" style="margin-top:16px"><h2>Tips bulan ini</h2><p>Anggaran <strong>Makan sudah 100%</strong> (' + D.formatRp(D.totalKategori(data, 'Makan')) + ' dari ' + D.formatRp(data.anggaran.Makan) + ') — masak di rumah untuk sisa bulan. <strong>Belanja 91%</strong> — cukup untuk satu kali belanja mingguan lagi. Sisa uang ' + D.formatRp(sisa) + ' bisa masuk ke dana darurat: target masih kurang ' + D.formatRp(30000000 - data.tabungan[0].terkumpul) + '.</p></div>');
    return h.join('');
  }

  function barisTransaksi(t) {
    var warnaTag = t.kategori === 'Pemasukan' ? '#166b4f' : (D.WARNA_KATEGORI[t.kategori] || '#166b4f');
    return '<tr><td>' + D.formatTanggal(t.tanggal) + '</td><td>' + esc(t.deskripsi) + '</td><td><span class="tag"><span class="dot" style="background:' + warnaTag + '"></span>' + esc(t.kategori) + '</span></td>' +
      '<td class="angka ' + (t.jenis === 'masuk' ? 'masuk' : 'keluar') + '">' + (t.jenis === 'masuk' ? '+' : '&minus;') + D.formatRp(t.jumlah) + '</td>' +
      '<td class="angka"><button class="ghost kecil" data-edit="' + esc(t.id) + '" type="button">Ubah</button> <button class="bahaya kecil" data-hapus="' + esc(t.id) + '" type="button">Hapus</button></td></tr>';
  }

  function transaksi(data, filter) {
    var cari = (filter.cari || '').toLowerCase();
    var kat = filter.kategori || '';
    var daftar = data.transaksi.filter(function (t) {
      if (kat && t.kategori !== kat) return false;
      if (cari && t.deskripsi.toLowerCase().indexOf(cari) === -1) return false;
      return true;
    }).slice().sort(function (a, b) { return a.tanggal < b.tanggal ? 1 : -1; });
    var totalTampil = 0;
    daftar.forEach(function (t) { totalTampil += t.jenis === 'masuk' ? t.jumlah : -t.jumlah; });
    var h = [];
    h.push('<h1>Transaksi</h1>');
    h.push('<p class="lede">Semua pemasukan dan pengeluaran Keluarga Santoso bulan November 2026. Tambah, ubah, atau hapus — total dan progress anggaran ikut berubah.</p>');
    h.push('<div class="pesan" id="pesan"></div>');
    h.push('<div class="grid dua">');
    h.push('<div class="card"><h2>Tambah transaksi</h2><form id="form-transaksi">' +
      '<div class="form-grid">' +
      '<div class="field"><label for="f-tanggal">Tanggal</label><input id="f-tanggal" name="tanggal" type="date" value="2026-11-26" min="2026-11-01" max="2026-11-30" required></div>' +
      '<div class="field"><label for="f-jenis">Jenis</label><select id="f-jenis" name="jenis"><option value="keluar">Pengeluaran</option><option value="masuk">Pemasukan</option></select></div>' +
      '</div>' +
      '<div class="field"><label for="f-deskripsi">Deskripsi</label><input id="f-deskripsi" name="deskripsi" type="text" placeholder="cth. Belanja mingguan" required maxlength="80"></div>' +
      '<div class="form-grid">' +
      '<div class="field"><label for="f-kategori">Kategori</label><select id="f-kategori" name="kategori">' +
      D.KATEGORI.map(function (k) { return '<option>' + esc(k) + '</option>'; }).join('') +
      '<option>Pemasukan</option></select></div>' +
      '<div class="field"><label for="f-jumlah">Jumlah (Rp)</label><input id="f-jumlah" name="jumlah" type="number" min="1000" step="500" placeholder="150000" required></div>' +
      '</div>' +
      '<input type="hidden" id="f-id" name="id" value="">' +
      '<button type="submit" id="tombol-simpan">Simpan transaksi</button> <button type="button" class="ghost" id="tombol-batal" hidden>Batal ubah</button>' +
      '</form></div>');
    h.push('<div class="card"><h2>Ringkasan</h2><ul class="daftar">' +
      '<li><span>Pemasukan</span><span class="angka" style="color:#166b4f">' + D.formatRp(D.totalJenis(data, 'masuk')) + '</span></li>' +
      '<li><span>Pengeluaran</span><span class="angka" style="color:#b3382e">' + D.formatRp(D.totalJenis(data, 'keluar')) + '</span></li>' +
      '<li><span>Sisa</span><span class="angka">' + D.formatRp(D.totalJenis(data, 'masuk') - D.totalJenis(data, 'keluar')) + '</span></li>' +
      '<li><span>Total yang tampil (filter ini)</span><span class="angka" id="total-tampil">' + D.formatRp(totalTampil) + '</span></li>' +
      '</ul><p style="font-family:system-ui,sans-serif;font-size:15px;color:#5d6d65;margin:14px 0 0">Total tampil menjumlah pemasukan sebagai tambah dan pengeluaran sebagai kurang, untuk transaksi yang lolos filter.</p></div>');
    h.push('</div>');
    h.push('<div class="card" style="margin-top:16px"><h2>Daftar transaksi</h2>');
    h.push('<div class="toolbar"><div class="field"><label for="s-cari">Cari deskripsi</label><input id="s-cari" type="search" placeholder="cth. bensin" value="' + esc(filter.cari || '') + '"></div>' +
      '<div class="field"><label for="s-kategori">Kategori</label><select id="s-kategori"><option value="">Semua kategori</option>' +
      D.KATEGORI.concat(['Pemasukan']).map(function (k) { return '<option value="' + esc(k) + '"' + (kat === k ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') +
      '</select></div></div>');
    if (daftar.length === 0) {
      h.push('<p>Tidak ada transaksi yang cocok dengan filter ini. Ubah pencarian atau tambahkan transaksi baru.</p>');
    } else {
      h.push('<table><thead><tr><th>Tanggal</th><th>Deskripsi</th><th>Kategori</th><th class="angka">Jumlah</th><th class="angka">Aksi</th></tr></thead><tbody>');
      daftar.forEach(function (t) { h.push(barisTransaksi(t)); });
      h.push('</tbody></table>');
    }
    h.push('</div>');
    return h.join('');
  }

  function anggaran(data) {
    var keluar = D.totalJenis(data, 'keluar');
    var total = D.totalAnggaran(data);
    var h = [];
    h.push('<h1>Anggaran per kategori</h1>');
    h.push('<p class="lede">Anggaran November 2026 total <strong>' + D.formatRp(total) + '</strong>. Terpakai <strong>' + D.formatRp(keluar) + '</strong> (' + persen(keluar, total) + '%) — sisa <strong>' + D.formatRp(total - keluar) + '</strong>. Progress dihitung dari transaksi nyata di halaman Transaksi.</p>');
    h.push('<div class="pesan" id="pesan"></div>');
    h.push('<div class="grid dua">');
    h.push('<div class="card"><h2>Progress anggaran</h2>');
    D.KATEGORI.forEach(function (k) {
      h.push(barAnggaran(k, D.totalKategori(data, k), data.anggaran[k]));
    });
    h.push('</div>');
    h.push('<div><div class="card"><h2>Atur ulang anggaran</h2><p style="font-family:system-ui,sans-serif;font-size:15px;color:#5d6d65;margin-top:0">Ubah nominal per kategori, lalu simpan. Total anggaran baru langsung tampil di dashboard.</p><form id="form-anggaran">');
    D.KATEGORI.forEach(function (k) {
      h.push('<div class="field"><label for="a-' + esc(k) + '">' + esc(k) + ' (Rp)</label><input id="a-' + esc(k) + '" name="' + esc(k) + '" type="number" min="0" step="50000" value="' + data.anggaran[k] + '"></div>');
    });
    h.push('<button type="submit">Simpan anggaran</button></form></div>');
    h.push('<div class="card tips" style="margin-top:16px"><h2>Aturan praktis 50 / 30 / 20</h2><p>Kebutuhan (belanja, tagihan, transport, pendidikan) sebaiknya di bawah 50% pemasukan. Keluarga Santoso bulan ini di ' + Math.round((D.totalKategori(data, 'Belanja') + D.totalKategori(data, 'Tagihan') + D.totalKategori(data, 'Transport') + D.totalKategori(data, 'Pendidikan')) / D.totalJenis(data, 'masuk') * 100) + '% — masih aman.</p></div></div>');
    h.push('</div>');
    var trenMini = data.tren.slice();
    trenMini[trenMini.length - 1] = { bulan: 'Nov', pemasukan: D.totalJenis(data, 'masuk'), pengeluaran: D.totalJenis(data, 'keluar') };
    h.push('<div class="card" style="margin-top:16px"><h2>Tren 6 bulan — pemasukan vs pengeluaran</h2>' + G.renderTrenBulanan(trenMini, 'batang') + '<p style="font-family:system-ui,sans-serif;font-size:15px;margin:12px 0 0"><a href="#/tren">Lihat tren lengkap dengan angka per bulan &rarr;</a></p></div>');
    return h.join('');
  }

  function tren(data, mode) {
    var tren = data.tren.slice();
    tren[tren.length - 1] = {
      bulan: 'Nov',
      pemasukan: D.totalJenis(data, 'masuk'),
      pengeluaran: D.totalJenis(data, 'keluar')
    };
    var h = [];
    h.push('<h1>Tren 6 bulan</h1>');
    h.push('<p class="lede">Pemasukan (hijau) melawan pengeluaran (merah), Juni–November 2026. November dihitung dari transaksi bulan ini, jadi ikut berubah kalau Anda menambah transaksi.</p>');
    h.push('<div class="card"><div class="toolbar"><div class="field"><label for="mode-grafik">Tampilan grafik</label><select id="mode-grafik"><option value="batang"' + (mode !== 'sisa' ? ' selected' : '') + '>Batang pemasukan vs pengeluaran</option><option value="sisa"' + (mode === 'sisa' ? ' selected' : '') + '>Tampilkan sisa tiap bulan</option></select></div></div>');
    h.push(G.renderTrenBulanan(tren, mode));
    h.push('<p style="font-family:system-ui,sans-serif;font-size:14px;color:#5d6d65;margin:12px 0 0"><span style="color:#166b4f">\u25a0</span> Pemasukan &nbsp; <span style="color:#b3382e">\u25a0</span> Pengeluaran &nbsp; Skala 0–' + G.singkat(25000000) + '.</p></div>');
    h.push('<div class="card" style="margin-top:16px"><h2>Angka per bulan</h2><table><thead><tr><th>Bulan</th><th class="angka">Pemasukan</th><th class="angka">Pengeluaran</th><th class="angka">Sisa</th></tr></thead><tbody>');
    tren.forEach(function (b) {
      h.push('<tr><td>' + esc(b.bulan) + ' 2026</td><td class="angka">' + D.formatRp(b.pemasukan) + '</td><td class="angka">' + D.formatRp(b.pengeluaran) + '</td><td class="angka">' + D.formatRp(b.pemasukan - b.pengeluaran) + '</td></tr>');
    });
    h.push('</tbody></table><p style="font-family:system-ui,sans-serif;font-size:15px;margin:14px 0 0">Rata-rata sisa per bulan: <strong>' + D.formatRp(tren.reduce(function (a, b) { return a + b.pemasukan - b.pengeluaran; }, 0) / tren.length) + '</strong>. Pengeluaran paling rendah Agustus (' + D.formatRp(9640000) + '), paling tinggi September (' + D.formatRp(10480000) + ').</p></div>');
    return h.join('');
  }

  function tagihan(data) {
    var totalTagihan = 0, totalLunas = 0;
    data.tagihan.forEach(function (b) { totalTagihan += b.jumlah; if (b.dibayar) totalLunas += b.jumlah; });
    var h = [];
    h.push('<h1>Tagihan rutin</h1>');
    h.push('<p class="lede">Tagihan tetap Keluarga Santoso tiap bulan, total <strong>' + D.formatRp(totalTagihan) + '</strong>. Sudah dibayar <strong>' + D.formatRp(totalLunas) + '</strong>, sisa <strong>' + D.formatRp(totalTagihan - totalLunas) + '</strong>. Ketuk tombol untuk menandai sudah dibayar — status tersimpan.</p>');
    h.push('<div class="pesan" id="pesan"></div>');
    h.push('<div class="card"><h2>November 2026</h2>');
    data.tagihan.slice().sort(function (a, b) { return a.jatuhTempo - b.jatuhTempo; }).forEach(function (b) {
      var telat = !b.dibayar && b.jatuhTempo < 26;
      h.push('<div class="toggle-row"><div class="info"><strong>' + esc(b.nama) + '</strong><span>Jatuh tempo ' + b.jatuhTempo + ' Nov 2026 &middot; ' + D.formatRp(b.jumlah) + '</span></div>' +
        '<div style="display:flex;gap:8px;align-items:center">' + (b.dibayar ? '<span class="tag lunas">Lunas</span>' : telat ? '<span class="tag lewat">Terlewat</span>' : '<span class="tag belum">Belum dibayar</span>') +
        '<button type="button" class="ghost kecil" data-tagihan="' + esc(b.id) + '">' + (b.dibayar ? 'Tandai belum' : 'Tandai lunas') + '</button></div></div>');
    });
    h.push('<p style="font-family:system-ui,sans-serif;font-size:15px;margin:16px 0 0">Dua tagihan jatuh tempo minggu ini (25–28 Nov): asuransi jiwa ' + D.formatRp(620000) + ' dan iuran RT ' + D.formatRp(50000) + ' — keduanya belum dibayar.</p></div>');
    h.push('<div class="card tips" style="margin-top:16px"><h2>Supaya tidak telat</h2><p>Bayar tagihan tanggal 1–5, begitu gaji masuk: SPP, listrik, dan air paling aman dibayar di minggu pertama. Autodebet BPJS dan internet menghindari denda.</p></div>');
    return h.join('');
  }

  function tabungan(data) {
    var h = [];
    h.push('<h1>Target tabungan</h1>');
    h.push('<p class="lede">Tiga target Keluarga Santoso. Tambah setoran dan progress langsung naik — setoran tersimpan di peramban ini.</p>');
    h.push('<div class="pesan" id="pesan"></div>');
    h.push('<div class="grid tiga">');
    data.tabungan.forEach(function (t) {
      var p = Math.round(t.terkumpul / t.target * 100);
      h.push('<div class="card"><div class="tabungan-head"><strong>' + esc(t.nama) + '</strong><span>' + p + '%</span></div>' +
        '<p style="font-family:system-ui,sans-serif;font-size:14px;color:#5d6d65;margin:6px 0 10px">' + esc(t.catatan) + '</p>' +
        '<div class="bar" role="progressbar" aria-valuenow="' + p + '" aria-valuemin="0" aria-valuemax="100" aria-label="Tabungan ' + esc(t.nama) + '"><span style="width:' + Math.min(p, 100) + '%"></span></div>' +
        '<div class="bar-row"><span>' + D.formatRp(t.terkumpul) + '</span><span>dari ' + D.formatRp(t.target) + '</span></div>' +
        '<div class="bar-row"><span>Kurang ' + D.formatRp(Math.max(t.target - t.terkumpul, 0)) + '</span></div>' +
        '<form class="setoran" data-setoran="' + esc(t.id) + '"><input type="number" min="10000" step="10000" placeholder="Setoran Rp" aria-label="Setoran untuk ' + esc(t.nama) + '" required><button type="submit">+ Setor</button></form>' +
        '</div>');
    });
    h.push('</div>');
    var totalTerkumpul = data.tabungan.reduce(function (a, t) { return a + t.terkumpul; }, 0);
    var totalTarget = data.tabungan.reduce(function (a, t) { return a + t.target; }, 0);
    h.push('<div class="card" style="margin-top:16px"><h2>Total tabungan: ' + D.formatRp(totalTerkumpul) + ' dari ' + D.formatRp(totalTarget) + ' (' + Math.round(totalTerkumpul / totalTarget * 100) + '%)</h2><p style="font-family:system-ui,sans-serif;margin:0">Dana darurat ' + D.formatRp(data.tabungan[0].terkumpul) + ' menutup sekitar 1,8 bulan pengeluaran pokok (' + D.formatRp(D.totalJenis(data, 'keluar')) + ' per bulan). Target aman: 6 bulan, alias ' + D.formatRp(30000000) + '. Menyisihkan ' + D.formatRp(2000000) + ' per bulan dari sisa uang akan menutup kekurangan dalam 6 bulan.</p></div>');
    return h.join('');
  }

  window.DompetViews = {
    dashboard: dashboard,
    transaksi: transaksi,
    anggaran: anggaran,
    tren: tren,
    tagihan: tagihan,
    tabungan: tabungan
  };
})();

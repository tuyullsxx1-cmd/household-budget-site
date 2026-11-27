/* DompetKeluarga — grafik tren. Satu job: gambar SVG batang pemasukan vs pengeluaran. */
(function () {
  'use strict';

  // v3: nol dibaca 'Rp0' (bukan 'Rp0 rb' yang ceroboh), dan nilai negatif
  // memakai cabang yang benar ('−Rp1,8 jt', bukan 'Rp-1750 rb').
  function singkat(nilai) {
    if (nilai === 0) return 'Rp0';
    var tanda = nilai < 0 ? '−' : '';
    var abs = Math.abs(nilai);
    if (abs >= 1000000) return tanda + 'Rp' + (abs / 1000000).toFixed(1).replace('.', ',') + ' jt';
    return tanda + 'Rp' + Math.round(abs / 1000) + ' rb';
  }

  function esc(teks) {
    return String(teks).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Gambar grafik batang berpasangan (pemasukan hijau, pengeluaran merah) untuk 6 bulan.
  function renderTrenBulanan(tren, mode) {
    var lebar = 720, tinggi = 300, alas = 258, atas = 26;
    var maks = 0;
    tren.forEach(function (b) { maks = Math.max(maks, b.pemasukan, b.pengeluaran); });
    maks = Math.ceil(maks / 5000000) * 5000000;
    var skala = (alas - atas) / maks;
    var lebarGrup = lebar / tren.length;
    var batang = 26;
    var s = [];
    s.push('<svg class="grafik" viewBox="0 0 ' + lebar + ' ' + tinggi + '" role="img" aria-label="Grafik tren bulanan pemasukan dan pengeluaran Juni sampai November 2026">');
    var garis;
    for (garis = 0; garis <= 4; garis++) {
      var nilai = maks * garis / 4;
      var y = alas - nilai * skala;
      // v2: label sumbu di kiri (berakhir x=54) dan batang mulai x=55 — di v1
      // ekor label ("Rp18,8 jt" jadi "Rp18,") tertutup batang pertama.
      s.push('<line x1="60" y1="' + y.toFixed(1) + '" x2="' + (lebar - 8) + '" y2="' + y.toFixed(1) + '" stroke="#e3eae4" stroke-width="1"/>');
      s.push('<text x="54" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="#5d6d65">' + singkat(nilai) + '</text>');
    }
    tren.forEach(function (b, i) {
      var cx = i * lebarGrup + lebarGrup / 2 + 24;
      var xMasuk = cx - batang - 3;
      var xKeluar = cx + 3;
      var tMasuk = b.pemasukan * skala;
      var tKeluar = b.pengeluaran * skala;
      s.push('<rect x="' + xMasuk.toFixed(1) + '" y="' + (alas - tMasuk).toFixed(1) + '" width="' + batang + '" height="' + tMasuk.toFixed(1) + '" rx="3" fill="#166b4f"><title>' + esc(b.bulan) + ' pemasukan ' + singkat(b.pemasukan) + '</title></rect>');
      s.push('<rect x="' + xKeluar.toFixed(1) + '" y="' + (alas - tKeluar).toFixed(1) + '" width="' + batang + '" height="' + tKeluar.toFixed(1) + '" rx="3" fill="#b3382e"><title>' + esc(b.bulan) + ' pengeluaran ' + singkat(b.pengeluaran) + '</title></rect>');
      s.push('<text x="' + cx.toFixed(1) + '" y="' + (alas + 20) + '" text-anchor="middle" font-size="13" font-weight="600" fill="#22302a">' + esc(b.bulan) + '</text>');
      if (mode === 'sisa') {
        var sisa = b.pemasukan - b.pengeluaran;
        s.push('<text x="' + cx.toFixed(1) + '" y="' + (alas - Math.max(tMasuk, tKeluar) - 8).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#0d4d36">Sisa ' + singkat(sisa) + '</text>');
      }
    });
    s.push('<line x1="60" y1="' + alas + '" x2="' + (lebar - 8) + '" y2="' + alas + '" stroke="#9db3a4" stroke-width="1.5"/>');
    s.push('</svg>');
    return s.join('');
  }

  // v2: cincin target tabungan — lingkaran emas di atas hijau tua, persen di tengah.
  // Dipakai hero dashboard untuk dana darurat (terkumpul vs target).
  function renderCincin(terkumpul, target, ukuran) {
    var u = ukuran || 132;
    var r = (u - 16) / 2;
    var keliling = 2 * Math.PI * r;
    var p = Math.max(0, Math.min(1, terkumpul / target));
    var persen = Math.round(p * 100);
    return '<svg class="cincin" viewBox="0 0 ' + u + ' ' + u + '" width="' + u + '" height="' + u + '" role="img" aria-label="Dana darurat ' + persen + ' persen dari target">' +
      '<circle cx="' + u / 2 + '" cy="' + u / 2 + '" r="' + r + '" fill="none" stroke="#1e6b4a" stroke-width="12"/>' +
      '<circle cx="' + u / 2 + '" cy="' + u / 2 + '" r="' + r + '" fill="none" stroke="#e8b64c" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (keliling * p).toFixed(1) + ' ' + keliling.toFixed(1) + '" transform="rotate(-90 ' + u / 2 + ' ' + u / 2 + ')"/>' +
      '<text x="50%" y="47%" text-anchor="middle" font-size="26" font-weight="700" fill="#ffffff">' + persen + '%</text>' +
      '<text x="50%" y="63%" text-anchor="middle" font-size="11" fill="#cfe3d8">dari target</text>' +
      '</svg>';
  }

  // v2: mini tren — batang kecil sisa tiap bulan (pemasukan minus pengeluaran),
  // untuk hero dashboard. Emas untuk November (bulan berjalan), hijau untuk
  // bulan lalu. Nilai dihitung dari data tren yang sama dengan halaman Tren.
  function renderMiniTren(tren) {
    var lebar = 260, tinggi = 64, alas = 52;
    var maks = 0;
    tren.forEach(function (b) { maks = Math.max(maks, b.pemasukan - b.pengeluaran); });
    var skala = (alas - 12) / maks;
    var lebarGrup = lebar / tren.length;
    var s = [];
    s.push('<svg class="minitren" viewBox="0 0 ' + lebar + ' ' + tinggi + '" role="img" aria-label="Sisa tiap bulan Juni sampai November 2026">');
    tren.forEach(function (b, i) {
      var sisa = b.pemasukan - b.pengeluaran;
      var t = sisa * skala;
      var x = i * lebarGrup + 6;
      var w = lebarGrup - 12;
      // v3: sisa negatif (bulan defisit) digambar ke BAWAH dari garis alas
      // dengan warna merah, bukan hilang — batang negatif itu cerita.
      var isi = sisa < 0 ? '#b3382e' : ((i === tren.length - 1) ? '#e8b64c' : '#5fae87');
      var y = t >= 0 ? alas - t : alas;
      var tinggi = Math.abs(t);
      s.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + tinggi.toFixed(1) + '" rx="3" fill="' + isi + '"><title>' + esc(b.bulan) + ' sisa ' + singkat(sisa) + '</title></rect>');
      s.push('<text x="' + (x + w / 2).toFixed(1) + '" y="' + (tinggi - 2) + '" text-anchor="middle" font-size="10" fill="#cfe3d8">' + esc(b.bulan) + '</text>');
    });
    s.push('</svg>');
    return s.join('');
  }

  window.DompetGrafik = { renderTrenBulanan: renderTrenBulanan, singkat: singkat, renderCincin: renderCincin, renderMiniTren: renderMiniTren };
})();

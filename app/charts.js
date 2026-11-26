/* DompetKeluarga — grafik tren. Satu job: gambar SVG batang pemasukan vs pengeluaran. */
(function () {
  'use strict';

  function singkat(nilai) {
    if (nilai >= 1000000) return 'Rp' + (nilai / 1000000).toFixed(1).replace('.', ',') + ' jt';
    return 'Rp' + Math.round(nilai / 1000) + ' rb';
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
      s.push('<line x1="52" y1="' + y.toFixed(1) + '" x2="' + (lebar - 8) + '" y2="' + y.toFixed(1) + '" stroke="#e3eae4" stroke-width="1"/>');
      s.push('<text x="46" y="' + (y + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="#5d6d65">' + singkat(nilai) + '</text>');
    }
    tren.forEach(function (b, i) {
      var cx = i * lebarGrup + lebarGrup / 2;
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
    s.push('<line x1="52" y1="' + alas + '" x2="' + (lebar - 8) + '" y2="' + alas + '" stroke="#9db3a4" stroke-width="1.5"/>');
    s.push('</svg>');
    return s.join('');
  }

  window.DompetGrafik = { renderTrenBulanan: renderTrenBulanan, singkat: singkat };
})();

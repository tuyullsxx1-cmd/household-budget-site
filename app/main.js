/* DompetKeluarga — pengendali. Satu job: rute hash + semua aksi pengguna. */
(function () {
  'use strict';
  var D = window.DompetData;
  var V = window.DompetViews;
  var app = document.getElementById('app');
  var data = D.muat();
  var filter = { cari: '', kategori: '' };
  var modeGrafik = 'batang';
  var idBerikutnya = 100;

  function simpanDanRender() {
    D.simpan(data);
    render();
  }

  function tampilkanPesan(teks) {
    var el = document.getElementById('pesan');
    if (el) el.textContent = teks;
  }

  function rute() {
    var hash = window.location.hash || '#/';
    return hash.replace(/^#\/?/, '').split('/')[0];
  }

  function tandaiNav(r) {
    var tautan = document.querySelectorAll('.main-nav a');
    tautan.forEach(function (a) {
      if (a.getAttribute('data-route') === r) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  function render() {
    var r = rute();
    tandaiNav(r);
    if (r === 'transaksi') app.innerHTML = V.transaksi(data, filter);
    else if (r === 'anggaran') app.innerHTML = V.anggaran(data);
    else if (r === 'tren') app.innerHTML = V.tren(data, modeGrafik);
    else if (r === 'tagihan') app.innerHTML = V.tagihan(data);
    else if (r === 'tabungan') app.innerHTML = V.tabungan(data);
    else app.innerHTML = V.dashboard(data);
    window.scrollTo(0, 0);
  }

  function cariId(id) {
    for (var i = 0; i < data.transaksi.length; i++) {
      if (data.transaksi[i].id === id) return i;
    }
    return -1;
  }

  function isiFormUbah(t) {
    document.getElementById('f-id').value = t.id;
    document.getElementById('f-tanggal').value = t.tanggal;
    document.getElementById('f-deskripsi').value = t.deskripsi;
    document.getElementById('f-kategori').value = t.kategori;
    document.getElementById('f-jumlah').value = t.jumlah;
    document.getElementById('f-jenis').value = t.jenis;
    document.getElementById('tombol-simpan').textContent = 'Simpan perubahan';
    document.getElementById('tombol-batal').hidden = false;
    document.getElementById('f-deskripsi').focus();
  }

  app.addEventListener('submit', function (e) {
    var form = e.target;
    e.preventDefault();
    var formId = form.getAttribute('id'); // JANGAN form.id: kontrol bernama "id" menutupi atribut id form
    if (formId === 'form-transaksi') {
      var jumlah = parseInt(form.elements.jumlah.value, 10);
      var tanggal = form.elements.tanggal.value;
      var deskripsi = form.elements.deskripsi.value.trim();
      var kategori = form.elements.kategori.value;
      var jenis = form.elements.jenis.value;
      if (!tanggal || !deskripsi || !(jumlah > 0)) { tampilkanPesan('Lengkapi tanggal, deskripsi, dan jumlah yang benar.'); return; }
      if (jenis === 'masuk') kategori = 'Pemasukan';
      var idLama = form.elements.id.value;
      if (idLama) {
        var idx = cariId(idLama);
        if (idx >= 0) {
          data.transaksi[idx] = { id: idLama, tanggal: tanggal, deskripsi: deskripsi, kategori: kategori, jumlah: jumlah, jenis: jenis };
          simpanDanRender();
          tampilkanPesan('Transaksi "' + deskripsi + '" diubah. Total dan anggaran ikut berubah.');
        }
      } else {
        idBerikutnya += 1;
        data.transaksi.push({ id: 'u' + idBerikutnya, tanggal: tanggal, deskripsi: deskripsi, kategori: kategori, jumlah: jumlah, jenis: jenis });
        simpanDanRender();
        tampilkanPesan('Transaksi "' + deskripsi + '" (' + D.formatRp(jumlah) + ') ditambahkan.');
      }
    } else if (formId === 'form-anggaran') {
      D.KATEGORI.forEach(function (k) {
        var nilai = parseInt(form.elements[k].value, 10);
        if (!isNaN(nilai) && nilai >= 0) data.anggaran[k] = nilai;
      });
      simpanDanRender();
      tampilkanPesan('Anggaran disimpan. Total anggaran kini ' + D.formatRp(D.totalAnggaran(data)) + '.');
    } else if (form.hasAttribute('data-setoran')) {
      var input = form.querySelector('input');
      var setor = parseInt(input.value, 10);
      var targetId = form.getAttribute('data-setoran');
      if (!(setor > 0)) { tampilkanPesan('Masukkan jumlah setoran yang benar.'); return; }
      data.tabungan.forEach(function (t) {
        if (t.id === targetId) t.terkumpul += setor;
      });
      simpanDanRender();
      tampilkanPesan('Setoran ' + D.formatRp(setor) + ' ditambahkan ke tabungan.');
    }
  });

  app.addEventListener('click', function (e) {
    var tombol = e.target.closest('button');
    if (!tombol) return;
    if (tombol.id === 'tombol-batal') {
      render();
      return;
    }
    var idHapus = tombol.getAttribute('data-hapus');
    if (idHapus) {
      var idx = cariId(idHapus);
      if (idx >= 0) {
        var nama = data.transaksi[idx].deskripsi;
        data.transaksi.splice(idx, 1);
        simpanDanRender();
        tampilkanPesan('Transaksi "' + nama + '" dihapus.');
      }
      return;
    }
    var idEdit = tombol.getAttribute('data-edit');
    if (idEdit) {
      var i = cariId(idEdit);
      if (i >= 0) isiFormUbah(data.transaksi[i]);
      return;
    }
    var idTagihan = tombol.getAttribute('data-tagihan');
    if (idTagihan) {
      data.tagihan.forEach(function (b) {
        if (b.id === idTagihan) b.dibayar = !b.dibayar;
      });
      simpanDanRender();
      tampilkanPesan('Status tagihan diubah dan tersimpan.');
    }
  });

  app.addEventListener('input', function (e) {
    if (e.target.id === 's-cari') {
      filter.cari = e.target.value;
      var posisi = e.target.selectionStart;
      render();
      var ulang = document.getElementById('s-cari');
      if (ulang) { ulang.focus(); ulang.setSelectionRange(posisi, posisi); }
    }
  });

  app.addEventListener('change', function (e) {
    if (e.target.id === 's-kategori') {
      filter.kategori = e.target.value;
      render();
    } else if (e.target.id === 'mode-grafik') {
      modeGrafik = e.target.value;
      render();
    } else if (e.target.id === 'f-jenis') {
      var pilih = document.getElementById('f-kategori');
      pilih.value = e.target.value === 'masuk' ? 'Pemasukan' : 'Belanja';
    }
  });

  window.addEventListener('hashchange', render);
  render();
})();

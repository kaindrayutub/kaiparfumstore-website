# Kai Parfum Store — website + ongkir JNE REG otomatis

Isi folder:

- `index.html` dan `img/` — halaman toko (koleksi, checkout, contoh QRIS, halaman tarif JNE).
- `netlify/functions/destination.mjs` — cari kecamatan/kota/kode pos tujuan.
- `netlify/functions/cost.mjs` — hitung ongkir JNE Regular (REG) dari Surabaya.
- `netlify.toml` — mengarahkan `/api/*` ke kedua fungsi di atas.

Tanpa backend (misalnya dibuka sebagai file biasa), website memakai tabel tarif tetap 45 kota.
Begitu di-deploy ke Netlify dengan API key, kolom tujuan otomatis berubah jadi pencarian
kecamatan di seluruh Indonesia dan ongkirnya dihitung langsung.

## 1. Daftar API ongkir

1. Daftar di https://rajaongkir.com (sekarang dikelola Komerce) lalu masuk ke dashboard.
2. Salin **API key Shipping Cost**.

## 2. Deploy ke Netlify (gratis)

1. Upload folder ini ke GitHub (repo baru), lalu di https://app.netlify.com pilih
   *Add new site → Import an existing project* dan pilih repo tersebut.
   (Fungsi server tidak ikut jalan kalau pakai drag-and-drop folder; pakai GitHub atau Netlify CLI.)
2. Buka *Site configuration → Environment variables*, tambahkan:
   - `RAJAONGKIR_KEY` = API key dari langkah 1
   - `ORIGIN_ID` = id lokasi toko (lihat langkah 3)
3. Deploy ulang setelah mengisi variabel.

## 3. Mencari ORIGIN_ID (lokasi pengirim)

Setelah `RAJAONGKIR_KEY` terpasang dan situs ter-deploy, buka:

    https://NAMA-SITUSMU.netlify.app/api/destination?q=medokan ayu

Ambil angka `id` dari hasil yang sesuai alamat pengiriman toko, isi ke `ORIGIN_ID`, lalu deploy ulang.

## 4. Mengganti data toko

Di bagian `<script>` pada `index.html`:

- `WA_NUMBER` — nomor WhatsApp (format 62…).
- `P` — daftar produk (nama, harga, stok `true/false`, foto, link Shopee).
- `KG_PER_BOTTLE`, `PACK_KG` — perkiraan berat per botol dan kemasan.
- `R` — tabel tarif acuan untuk halaman Tarif JNE dan mode tanpa backend.

## 5. Nanti: Midtrans

Pembayaran saat ini masih **contoh QRIS** (diberi tanda "CONTOH"). Fungsi `startPayment`
di `index.html` sudah diberi catatan cara menggantinya dengan Midtrans Snap. Server Key
Midtrans harus disimpan sebagai environment variable dan dipakai di fungsi server baru
(misalnya `netlify/functions/create-transaction.mjs`), jangan ditulis di `index.html`.
Update: pasang API key ongkir
Fix nama variabel



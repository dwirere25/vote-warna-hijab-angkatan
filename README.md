# VOTE HIJAB — ANGKATAN 39 SMAN 3 BOJONEGORO

Website voting warna hijab: Hitam, Navy, Cream/Biskuit. HTML, CSS, JavaScript terpisah, aset dari gambar referensi yang diberikan.

## Isi folder
- `index.html` — halaman website
- `style.css` — desain responsif
- `app.js` — logika pilihan, grafik, Firebase, panel admin
- `firebase-config.example.js` — contoh konfigurasi Firebase
- `database.rules.json` — contoh aturan keamanan Realtime Database
- `assets/` — maskot, referensi kaos, logo 39

## Jalankan demo lokal (tanpa database)
1. Buka folder ini di VS Code.
2. Install ekstensi **Live Server**.
3. Klik kanan `index.html` → **Open with Live Server**.
4. Pilih warna dan kirim suara. Mode ini hanya tersimpan di browser/perangkat yang dipakai, bukan online. Data simulasi bisa direset dengan menghapus data situs/local storage browser.

## Supaya voting online dan bisa dipantau bersama
1. Buka https://console.firebase.google.com/ dan buat project baru, misalnya `vote-hijab-angkatan39`.
2. Tambahkan aplikasi Web (ikon `</>`), daftarkan nama aplikasi, lalu salin konfigurasi web.
3. Di Authentication → Sign-in method, aktifkan **Anonymous** dan **Email/Password**.
4. Di Realtime Database → Create Database. Pilih lokasi yang tersedia dan dekat dengan pengguna (misalnya Singapore/Asia Tenggara jika tersedia).
5. Buat file baru bernama `firebase-config.js` di folder yang sama dengan `app.js`. Salin isi `firebase-config.example.js` ke file itu, lalu ganti semua `PASTE_...` dengan konfigurasi Firebase asli.
6. Buka `firebase-config.js` yang sudah tersedia di folder, lalu isi nilai `PASTE_...` dengan konfigurasi Firebase asli. Tag pemanggil file ini sudah dipasang di `index.html`.
7. Di Authentication → Users, buat akun admin memakai email dan password panitia. Setelah akun dibuat, salin **UID** akun tersebut.
8. Buka `database.rules.json`. Ganti setiap `PASTE_ADMIN_UID` dengan UID admin tadi. Salin aturan tersebut ke Realtime Database → Rules → Publish.
9. Pastikan Realtime Database Rules sudah terpasang SEBELUM link dibagikan. Jangan gunakan aturan publik `".read": true, ".write": true`.
10. Uji dalam dua browser/perangkat: satu peserta voting, satu panitia login. Peserta tidak boleh bisa melihat grafik sebelum voting ditutup. Panitia klik **Tutup voting & buka hasil** untuk menampilkan hasil final.

### Catatan penting
- Firebase config web berisi identifier aplikasi yang normalnya terlihat di browser; keamanan utama berasal dari Authentication dan Database Rules.
- Mode voting sederhana memakai Firebase Anonymous Auth. Satu suara dibatasi per UID anonim/browser. Ini bukan verifikasi identitas sekolah yang kuat; peserta yang menghapus data browser atau pindah perangkat bisa berpotensi memperoleh UID baru. Untuk pemilihan resmi, gunakan kode unik per siswa atau login yang diverifikasi.
- Aturan ini mencegah UID peserta mengubah/menghapus suara setelah tersimpan. Jangan mengaktifkan voting sebelum UID admin diganti dan rules diuji.
- Hasil disembunyikan untuk peserta sampai `settings/closed` menjadi `true`. Setelah ditutup, hasil dapat dibaca semua pengunjung. Admin dapat membuka voting kembali melalui panel.
- Jangan unggah `firebase-config.js` berisi rahasia apa pun; jangan pernah taruh password admin di JavaScript.

## Publikasikan menjadi link dengan Netlify
1. Setelah uji lokal sukses, buka https://app.netlify.com/drop (login bila diminta).
2. Seret folder `vote_hijab_angkatan39` yang berisi `index.html`, `style.css`, `app.js`, `firebase-config.js`, dan folder `assets` ke area upload Netlify Drop. Jika upload folder tidak didukung di perangkatmu, zip folder lalu gunakan metode deploy manual yang tersedia di akun Netlify.
3. Netlify memberi alamat publik `https://...netlify.app`. Buka alamat tersebut dari HP lain untuk memastikan tampilannya benar.
4. Bagikan link kepada angkatan. Jangan membagikan akses email/password admin.

## Checklist sebelum dibagikan
- [ ] Firebase config asli sudah dipasang
- [ ] UID admin sudah dimasukkan ke database rules
- [ ] Rules sudah dipublish dan dites
- [ ] Voting dites di HP berbeda
- [ ] Hasil masih terkunci sebelum voting ditutup
- [ ] Hasil final terbuka setelah admin menutup voting
- [ ] Tanggal dan jam tutup voting sudah diumumkan di grup angkatan

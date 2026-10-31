# 📱 Auto Clicker APK

Aplikasi Android native untuk auto clicker. APK ini bisa klik di **layar mana saja** — tidak hanya di dalam aplikasi ini — lewat Accessibility Service.

## 🔧 Cara Build APK

### Cara 1: Via GitHub Actions (otomatis, rekomendasi)

1. Login ke GitHub di browser
2. Buka repository ini: `https://github.com/USER/autoclicker-apk` (ganti USER dengan username GitHub Anda)
3. Masuk ke tab **Actions** → workflow "Build APK" sudah otomatis berjalan
4. Tunggu ~8-12 menit sampai selesai
5. Di tab **Actions** → **Artifacts**, download file `app-release-apk`
6. APK siap diinstall ke HP!

### Cara 2: Build di komputer lokal

Persyaratan:
- Java JDK 17
- Android SDK
- Gradle 8.10.2+

```bash
# 1. Set environment
export JAVA_HOME=/path/to/jdk17
export ANDROID_HOME=/path/to/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/34.0.0

# 2. Install SDK packages
sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"

# 3. Build
cd android-app
gradle wrapper --gradle-version 8.10.2
./gradlew assembleRelease    # atau gradlew assembleRelease di Windows

# 4. APK ada di:
# app/build/outputs/apk/release/app-release-unsigned.apk
```

### Cara 3: Via Android Studio

1. Buka Android Studio → "Open an existing project"
2. Pilih folder `android-app/`
3. Klik tombol **Run** ▶️ (pilih device/emulator)
   
   Atau untuk release APK:
   **Build → Generate Signed Bundle/APK → APK → Next**
   Buat key baru atau pilih yang ada → **Finish**

## 📲 Cara Install APK di HP

### Syarat di HP:
1. **Settings → Security → Enable "Unknown Sources"** (untuk Android < 8)
   atau **Settings → Apps → Special App Access → Install unknown apps** (untuk Android 8+)
2. Buka file APK yang didownload → **Install**
3. Buka aplikasi

### Aktifkan Accessibility Service:
Setelah install dan buka aplikasi:
1. Jika muncul notifikasi, klik **"Enable Accessibility Service"**
2. Atau buka **Settings → Accessibility → Auto Clicker** → aktifkan
3. Konfirmasi dengan **"OK"** pada peringatan

> ⚠️ **Peringatan keamanan**: Android akan menampilkan peringatan untuk Accessibility Service. Ini normal — fitur ini diperlukan untuk auto-click di luar aplikasi.

## 🎯 Cara Pakai

1. **Buka aplikasi** → WebView akan menampilkan antarmuka auto clicker
2. **Klik tombol "Tambah Titik"** (hijau) → sentuh area untuk menentukan titik klik
3. Tambahkan beberapa titik sesuai kebutuhan
4. Atur **kecepatan** (ms), **mode** (Giliran/Acak), **jumlah klik**
5. **Klik "Mulai"** → klik otomatis akan dimulai
6. **Klik "Berhenti"** untuk memberhentikan

> Pwa juga bisa berjalan di browser (tanpa install APK) di: `http://localhost:8765` atau file `index.html` di folder induk.

## 📁 Struktur File

```
android-app/
├── AndroidManifest.xml       # Permission + service declaration
├── build.gradle              # Project config
├── app/
│   ├── build.gradle          # Module config (Kotlin, AndroidX)
│   ├── src/main/
│   │   ├── java/com/autoclicker/app/
│   │   │   ├── MainActivity.kt       # WebView + JS interface
│   │   │   └── AutoClickService.kt   # AccessibilityService
│   │   ├── res/                 # Layouts, icons, strings
│   │   └── assets/              # Web files (index.html, app.js)
│   └── proguard-rules.pro
└── .github/workflows/build-apk.yml   # CI/CD
```

## 🔒 Keamanan

- Tidak ada network request ke luar
- Data tidak dikirim ke server apapun
- Auto klik hanya berjalan ketika diinstruksikan pengguna
- Accessibility Service butuh izin eksplisit dari pengguna

## 🐛 Troubleshooting

| Problem | Solusi |
|---------|--------|
| Service tidak muncul di Settings | Restart HP, install ulang |
| Klik tidak berfungsi | Pastikan Accessibility Service sudah enabled |
| "AccessibilityService" error di log | Cek `accessibility_service_config.xml` |
| WebView kosong | Pastikan `assets/index.html` ada |

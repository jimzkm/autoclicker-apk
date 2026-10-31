# 📱 Auto Clicker - Android APK Build Guide

Panduan lengkap untuk membangun APK dari project ini.

## 📁 Struktur Project

```
android-app/
├── .github/workflows/build-apk.yml  # GitHub Actions workflow
├── build.gradle                     # Project-level Gradle config
├── settings.gradle                  # Module settings + repositories
├── gradle.properties                # Gradle properties
├── gradlew / gradlew.bat            # Gradle wrapper scripts
├── app/
│   ├── build.gradle                 # Module-level Gradle config
│   ├── proguard-rules.pro           # ProGuard rules
│   ├── src/main/
│   │   ├── AndroidManifest.xml      # App manifest + service declaration
│   │   ├── java/com/autoclicker/app/
│   │   │   ├── MainActivity.kt      # WebView activity
│   │   │   └── AutoClickService.kt  # AccessibilityService
│   │   ├── res/                     # Layouts, values, drawables, icons
│   │   └── assets/                  # Web app (index.html, app.js, icons)
│   └── proguard-rules.pro
└── gradle/wrapper/
    └── gradle-wrapper.properties
```

## 🛠️ Cara Build APK

### Opsi 1: GitHub Actions (Direkomendasikan - tidak perlu install tools)

#### Persiapan:
1. Buat akun GitHub di [github.com](https://github.com/) (gratis)
2. Install Git: https://git-scm.com/

#### Langkah demi langkah:
```bash
# 1. Buka terminal di folder ini, jalankan:
git init
git add .
git commit -m "Initial commit"

# 2. Login ke GitHub dan buat repository baru di:
#    https://github.com/new
#    (nama: misal "autoclicker-android")

# 3. Hubungkan dan push:
git remote add origin https://github.com/<username>/<repo-name>.git
git branch -M main
git push -u origin main

# 4. Buka repository di browser → tab "Actions"
#    → klik workflow "Build APK" → lihat progres

# 5. Setelah selesai → tab "Actions" → pilih run terakhir
#    → scroll ke "Artifacts" → download file APK
```

#### Hasil:
- **app-debug-apk**: APK debug (untuk testing, langsung bisa di-install)
- **app-release-apk**: APK release (perlu di-sign sebelum publish)

### Opsi 2: Build di Komputer Lokal (butuh Android Studio)

#### Persiapan:
1. Install **Android Studio** (termasuk JDK + Android SDK)
   - https://developer.android.com/studio
2. Buka Android Studio → "Open Project" → pilih folder `android-app/`
3. Tunggu sync Gradle selesai
4. Build → **Build Bundle(s) / APK(s)** → **Build APK(s)**
5. APK akan ada di: `app/build/outputs/apk/release/`

### Opsi 3: Build Manual (hanya untuk developer)

```bash
# 1. Install JDK 17+ dan Android SDK
# 2. Set environment:
export JAVA_HOME=/path/to/jdk
export ANDROID_HOME=/path/to/android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME

# 3. Install SDK packages:
sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"

# 4. Generate wrapper:
gradle wrapper --gradle-version 8.10.2 --distribution-type bin

# 5. Build:
./gradlew assembleRelease --no-daemon
```

## 📲 Cara Install APK di Android

1. **Transfer APK ke HP** (via kabel USB, email, atau Google Drive)
2. Buka file APK → jika ada peringatan "Blokir", buka:
   - **Settings → Security → "Unknown sources"** → aktifkan untuk browser/email
3. Tap **Install**
4. Buka aplikasi

## ⚠️ Aktifkan Accessibility Service

Ini langkah **wajib** agar auto klik bekerja:

1. Buka **Settings** → **Accessibility** (atau "Aksesibilitas" di HP Xiaomi/Realme)
2. Cari **"Auto Clicker"** atau **"Layanan Aksesibilitas"**
3. Aktifkan **Auto Clicker** → konfirmasi **OK**

> ⚠️ **Peringatan keamanan Android**: Sistem akan menampilkan peringatan. Ini normal karena AccessibilityService bisa mengontrol layar penuh. Baca dengan cermat lalu pilih **Izinkan**.

## 🧪 Cara Pakai

1. Buka aplikasi Auto Clicker
2. Tap **"➕ Tambah Titik"** (hijau)
3. Sentuh area abu-abu untuk **titik pertama**
4. Ulangi untuk **titik kedua, ketiga...**
5. Atur **kecepatan (ms)**, **mode** (Giliran/Acak), **jumlah klik** (0 = tak terbatas)
6. Tap **"▶️ Mulai"** — auto klik akan berjalan!
7. Tap **"⏹️ Berhenti"** untuk memberhentikan

## 🆘 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Service tidak aktif" | Aktifkan di Settings → Accessibility |
| Klik tidak berfungsi | Pastikan service sudah aktif + restart aplikasi |
| APK tidak bisa di-install | Aktifkan "Unknown sources" di Settings |
| Build gagal | Pastikan JDK 17+, Android SDK API 34 terpasan |

## 🔒 Keamanan

- Aplikasi ini **tidak mengirim data** ke internet
- Semua klik hanya terjadi **di dalam perangkat Anda**
- Kode sumber terbuka — bisa di-audit
- Tidak ada iklan, tidak ada tracking

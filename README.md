# EnerGym Mobile

Aplikasi mobile gym berbasis AI untuk Android dan iOS. Pengguna bisa browse workout, melakukan latihan dengan panduan pose estimation real-time dari webcam gym station, dan memantau histori performa form mereka.

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                  EnerGym Mobile App                  │
│                  (React Native + Expo)               │
└───────────────┬─────────────────────┬───────────────┘
                │                     │
    ┌───────────▼──────────┐   ┌──────▼────────────────┐
    │   Supabase (Cloud)   │   │  EnerGym AI Server     │
    │   - Auth             │   │  (Laptop Gym Station)  │
    │   - profiles         │   │  - Pose estimation     │
    │   - workouts         │   │  - Rep counting        │
    │   - workout_history  │   │  - Form detection      │
    │   - stations         │   │  HTTP + WebSocket      │
    └──────────────────────┘   └───────────────────────┘
```

---

## Fitur Utama

- **Autentikasi** — Sign up & sign in dengan Supabase Auth
- **Browse Workout** — Daftar workout dan exercise lengkap dengan gambar
- **Live Workout dengan AI** — Koneksi ke gym station via QR scan, tampil webcam real-time, rep counter otomatis, bad form alert
- **Multi-set & Rest Timer** — Manajemen set dengan timer istirahat otomatis 30 detik
- **Workout Summary** — Ringkasan post-workout dengan donut chart akurasi form, kalori dinamis berdasarkan berat badan
- **Histori Workout** — Grafik akurasi mingguan dan detail breakdown per exercise
- **Profil & Data Fisik** — Edit profil, upload foto, update data fisik (berat, tinggi, dll.)

---

## Struktur Project

```
energym-mobile/
├── App.js                    # Entry point, font loading, navigation setup
├── app.json                  # Expo config
├── index.js                  # Expo registerRootComponent
├── assets/                   # Icon, splash screen, favicon
├── src/
│   ├── assets/
│   │   ├── fonts/            # Satoshi font family (10 variants)
│   │   └── images/           # Gambar lokal (intro, workout)
│   ├── context/
│   │   └── WorkoutContext.js # State sesi workout (in-memory)
│   ├── navigation/
│   │   └── AppNavigator.js   # Stack + Bottom Tab navigator
│   ├── screens/
│   │   ├── Intro/            # WelcomeScreen, SignInScreen, SignUpScreen
│   │   ├── Home/             # HomeScreen
│   │   ├── Workout/          # WorkoutScreen, WorkoutDetailScreen,
│   │   │                     # ExerciseDetailScreen, LiveWorkoutScreen,
│   │   │                     # WorkoutSummaryScreen
│   │   ├── History/          # WorkoutHistoryScreen, WorkoutHistoryDetailScreen
│   │   ├── Profile/          # ProfileScreen, EditProfileScreen, PhysicalDataScreen
│   │   └── QR/               # ScanQRScreen
│   ├── services/
│   │   ├── supabase.js       # Supabase client singleton
│   │   └── aiService.js      # HTTP + WebSocket ke AI server
│   └── styles/
│       └── globalStyles.js   # Shared styles
├── package.json
└── README.md
```

---

## Instalasi & Setup

### Prasyarat

- Node.js 18+
- [Expo Go](https://expo.dev/go) terinstall di HP (Android/iOS)
- HP dan laptop di WiFi yang sama (untuk fitur AI)

### Setup

```bash
# Masuk ke folder project
cd energym-mobile

# Install dependencies
npm install

# Jalankan Expo dev server
npm start
```

Scan QR yang muncul di terminal dengan aplikasi Expo Go di HP.

> **Penting — Fitur AI memerlukan EnerGym AI Server:**
> Sebelum menggunakan Live Workout, pastikan server AI sudah berjalan di laptop gym station:
> ```bash
> cd energym-AI
> .venv\Scripts\activate
> energym-server
> ```
> Laptop dan HP harus berada di **WiFi yang sama**. Scan QR station untuk menghubungkan HP ke server.

---

## Alur Pengguna

### 1. Onboarding
```
WelcomeScreen → SignUpScreen (isi data profil + fisik) → SignInScreen
```

### 2. Workout dengan AI
```
HomeScreen → WorkoutScreen → WorkoutDetailScreen
    → ExerciseDetailScreen → ScanQRScreen
    → LiveWorkoutScreen (koneksi AI, rep counter, bad form alert)
    → WorkoutSummaryScreen (simpan ke DB)
```

### 3. Tanpa AI (manual)
```
WorkoutDetailScreen → ExerciseDetailScreen → tap "Start" tanpa QR scan
```

---

## Screens

### Intro
| Screen | Deskripsi |
|---|---|
| `WelcomeScreen` | Landing page aplikasi |
| `SignUpScreen` | Registrasi dengan data profil lengkap (nama, username, data fisik) |
| `SignInScreen` | Login dengan email & password |

### Workout
| Screen | Deskripsi |
|---|---|
| `WorkoutScreen` | Daftar semua workout (fetch dari Supabase) |
| `WorkoutDetailScreen` | Daftar exercise dalam workout, tracking progress per exercise |
| `ExerciseDetailScreen` | Detail exercise, steps, info AI support |
| `LiveWorkoutScreen` | Sesi latihan real-time dengan AI — webcam preview, rep counter, bad form banner, set/rest management |
| `WorkoutSummaryScreen` | Ringkasan post-workout, donut chart, simpan ke history |

### History
| Screen | Deskripsi |
|---|---|
| `WorkoutHistoryScreen` | Daftar riwayat workout + grafik akurasi form mingguan |
| `WorkoutHistoryDetailScreen` | Detail per-exercise: actual vs target reps, breakdown form |

### Profile
| Screen | Deskripsi |
|---|---|
| `ProfileScreen` | Statistik kumulatif (total kalori, akurasi, exercise count) |
| `EditProfileScreen` | Edit username, nama, nomor HP, foto profil |
| `PhysicalDataScreen` | Edit data fisik (usia, gender, tinggi, berat, dominant hand, injury history) |

### QR
| Screen | Deskripsi |
|---|---|
| `ScanQRScreen` | Scan QR gym station → cek status station di DB → navigasi ke LiveWorkout |

---

## Database Schema (Supabase)

### Tabel yang dibaca & ditulis mobile app

| Tabel | Operasi | Keterangan |
|---|---|---|
| `auth.users` | INSERT, AUTH | Supabase built-in auth |
| `profiles` | SELECT, INSERT, UPDATE | Data user & fisik |
| `workouts` | SELECT | Daftar program workout |
| `exercises` | SELECT | Detail exercise |
| `workout_exercises` | SELECT | Relasi workout ↔ exercise (target sets/reps) |
| `workout_history` | SELECT, INSERT | Rekap per sesi workout |
| `workout_history_exercises` | SELECT, INSERT | Detail per exercise per sesi |
| `stations` | SELECT, UPDATE | Status gym station (busy/free) |

### Storage Buckets

| Bucket | Digunakan untuk |
|---|---|
| `avatars` | Foto profil user |
| `workouts` | Gambar cover workout |
| `exercises` | Gambar exercise |

---

## Integrasi AI Server

Saat user scan QR, data berikut diekstrak dari QR:

```json
{
  "station_id": "STATION_01",
  "ip": "192.168.1.x",
  "port": 8000
}
```

Flow koneksi di `LiveWorkoutScreen`:

```
1. checkAIHealth(ip, port)          → GET /health
2. warmupAICamera(ip, port)         → POST /camera/warmup  (saat masuk screen)
3. startAISession({ ... })          → POST /session/start  → dapat session_id
4. connectAIWebSocket(session_id)   → WS  /ws/{session_id} → frame_update stream
5. stopAISession(session_id)        → POST /session/stop
```

### Data yang diterima dari WebSocket (per frame)

```js
{
  repCount: 5,          // Jumlah rep kumulatif
  state: "up",          // Status gerakan
  elbowAngle: 48.3,     // Sudut siku (derajat)
  isBadForm: false,     // Ada kesalahan postur?
  formIssues: [],       // ['body_sway', 'elbow_drift', 'too_fast', 'grip_rotation']
  activeArm: "right"    // Tangan aktif (alternating curl)
}
```

### Data yang disimpan ke DB setelah workout

```js
// workout_history_exercises
{
  perfect_reps, bad_reps,
  ai_accuracy,           // Akurasi dari AI (%)
  body_sway_count,       // Jumlah kejadian per jenis bad form
  elbow_drift_count,
  too_fast_count,
  grip_rotation_count,
  ai_session_id          // ID sesi AI untuk traceability
}
```

---

## Kalkulasi Kalori

Menggunakan formula MET (Metabolic Equivalent of Task) standar ACSM:

```
Kalori = MET × Berat (kg) × Durasi (jam)
MET Weight Training = 5.0
```

Berat badan diambil otomatis dari tabel `profiles`. Default 70 kg jika belum diisi.

---

## Dependency Utama

| Package | Versi | Kegunaan |
|---|---|---|
| `expo` | ~54.0 | Framework build & dev tooling |
| `react-native` | 0.81.5 | UI framework |
| `@supabase/supabase-js` | ^2.105.1 | Database & auth client |
| `@react-navigation/native` | ^6.1 | Navigasi antar screen |
| `expo-camera` | ~17.0 | QR scanner |
| `expo-image-picker` | ~17.0 | Upload foto profil |
| `react-native-chart-kit` | ^6.12 | Grafik akurasi mingguan |
| `react-native-svg` | ^15.15 | Donut chart summary |
| `date-fns` | ^4.1 | Kalkulasi tanggal & minggu |
| `react-native-safe-area-context` | ^4.14 | Safe area untuk notch/island |

---

## Troubleshooting

**Tidak bisa connect ke AI server**
- Pastikan HP dan laptop di WiFi yang sama
- Cek IP laptop dengan `ipconfig` (Windows) dan sesuaikan di QR
- Firewall Windows harus izinkan port 8000

**Expo tidak bisa scan QR**
- Jalankan `npm start -- --tunnel` untuk koneksi via tunnel (beda network)

**Font tidak load**
- Hapus `.expo/` folder lalu jalankan ulang `npm start`

**Session Supabase expired**
- Logout dan login ulang — token akan di-refresh otomatis via AsyncStorage

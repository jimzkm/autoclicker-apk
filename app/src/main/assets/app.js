/* =========================================================
   Auto Clicker - app.js
   - Klik hanya terjadi pada elemen di dalam halaman sendiri
   - Tidak ada permintaan jaringan, tidak kumpulkan data
   - Aman untuk dijalankan di browser Android
========================================================= */

// === Referensi elemen DOM ===
const clickArea    = document.getElementById('clickArea');
const overlayInstr = document.getElementById('overlayInstruction');
const btnAddPoint  = document.getElementById('btnAddPoint');
const btnStart     = document.getElementById('btnStart');
const btnStop      = document.getElementById('btnStop');
const btnClear     = document.getElementById('btnClear');
const speedInput   = document.getElementById('speed');
const modeInput    = document.getElementById('mode');
const repeatInput  = document.getElementById('repeat');
const pointCountEl = document.getElementById('pointCount');
const totalClicks  = document.getElementById('totalClicks');
const remainingEl  = document.getElementById('remainingClicks');
const statusDot    = document.getElementById('statusDot');
const statusText   = document.getElementById('statusText');

// === State aplikasi ===
let clickPoints   = [];      // [{x, y, elementId}]
let isAddingPoint = false;   // sedang dalam mode "tambah titik"
let isRunning     = false;   // sedang auto-klik aktif
let clickTimer    = null;    // ID interval
let currentPoint  = 0;       // indeks titik bergiliran
let clickCount    = 0;       // total klik yang sudah dilakukan

// Deteksi environment: Android (dengan JavaScript Interface) vs Web biasa
const isAndroid = typeof window.AndroidInterface !== 'undefined' && window.AndroidInterface !== null;
const isAccessibilityEnabled = isAndroid
    ? window.AndroidInterface.isServiceConnected()
    : false;

// === Inisialisasi ===
function init() {
    // Event listener untuk menambah titik
    btnAddPoint.addEventListener('click', toggleAddPointMode);

    // Event listener untuk area klik (menentukan titik ketika dalam mode tambah)
    clickArea.addEventListener('click', handleAreaClick);

    // Event listener tombol
    btnStart.addEventListener('click', startAutoClick);
    btnStop.addEventListener('click', stopAutoClick);
    btnClear.addEventListener('click', clearAllPoints);

    // Update tampilan saat input berubah
    speedInput.addEventListener('change', updateSpeedDisplay);

    updateUI();
}

// === Toggle mode "tambah titik" ===
function toggleAddPointMode() {
    isAddingPoint = !isAddingPoint;
    btnAddPoint.classList.toggle('active', isAddingPoint);

    if (isAddingPoint) {
        overlayInstr.textContent = 'Sentuh area di bawah untuk menentukan titik klik';
        overlayInstr.style.color = '#00d4ff';
    } else {
        overlayInstr.textContent = 'Klik "Tambah Titik" lalu sentuh area untuk menentukan titik klik';
        overlayInstr.style.color = '#a0a0a0';
    }
}

// === Handler klik pada area (untuk menambah titik) ===
function handleAreaClick(e) {
    if (!isAddingPoint || isRunning) return;
    // Mencegah penambahan titik saat sedang berjalan

    const rect = clickArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Cari elemen di koordinat tersebut
    const target = document.elementFromPoint(e.clientX, e.clientY);

    const newPoint = {
        x: x,
        y: y,
        elementId: target ? target.id : null,
        elementTag: target ? target.tagName : 'UNKNOWN'
    };

    clickPoints.push(newPoint);
    updateUI();
    showTemporaryPoint(x, y, clickPoints.length);

    // Kembali ke mode normal setelah menambah titik
    isAddingPoint = false;
    btnAddPoint.classList.remove('active');
    overlayInstr.textContent = 'Klik "Tambah Titik" lalu sentuh area untuk menentukan titik klik';
    overlayInstr.style.color = '#a0a0a0';
}

// === Tampilkan marker titik permanen di layar ===
function renderPoints() {
    // Hapus marker lama
    const oldMarkers = clickArea.querySelectorAll('.click-point');
    oldMarkers.forEach(m => m.remove());

    clickPoints.forEach((pt, idx) => {
        const marker = document.createElement('div');
        marker.className = 'click-point';
        marker.style.left = pt.x + 'px';
        marker.style.top  = pt.y + 'px';

        const label = document.createElement('div');
        label.className = 'point-label';
        label.textContent = `P${idx + 1}`;
        marker.appendChild(label);

        // Tombol hapus titik ini (hanya muncul saat tidak berjalan)
        if (!isRunning) {
            const btnRemove = document.createElement('button');
            btnRemove.className = 'btn-remove-point';
            btnRemove.textContent = '×';
            btnRemove.onclick = () => removePoint(idx);
            btnRemove.style.display = 'flex';
            btnRemove.style.alignItems = 'center';
            btnRemove.style.justifyContent = 'center';
            marker.appendChild(btnRemove);
        }

        clickArea.appendChild(marker);
    });
}

// === Tampilkan marker sementara saat menambah titik ===
function showTemporaryPoint(x, y, index) {
    const marker = document.createElement('div');
    marker.className = 'click-point';
    marker.style.left = x + 'px';
    marker.style.top  = y + 'px';
    marker.style.borderColor = '#2ecc71';

    const label = document.createElement('div');
    label.className = 'point-label';
    label.textContent = `P${index}`;
    marker.appendChild(label);

    clickArea.appendChild(marker);

    // Hilangkan setelah 1 detik
    setTimeout(() => {
        if (marker.parentNode) {
            marker.remove();
        }
    }, 1000);
}

// === Hapus satu titik ===
function removePoint(index) {
    clickPoints.splice(index, 1);
    updateUI();
}

// === Hapus semua titik ===
function clearAllPoints() {
    clickPoints = [];
    currentPoint = 0;
    clickCount = 0;
    updateUI();
    // Hapus semua marker dari layar
    const markers = clickArea.querySelectorAll('.click-point');
    markers.forEach(m => m.remove());
}

// === Mulai auto klik ===
function startAutoClick() {
    if (clickPoints.length === 0) {
        alert('Tambahkan setidaknya satu titik klik dulu!');
        return;
    }

    const speed = parseInt(speedInput.value);
    if (isNaN(speed) || speed < 100) {
        alert('Kecepatan minimal 100 ms!');
        return;
    }

    isRunning = true;
    clickCount = 0;
    currentPoint = 0;

    const repeat = parseInt(repeatInput.value);
    const mode   = modeInput.value;
    const maxClicks = repeat > 0 ? repeat : Infinity;

    // === ANDROID MODE: kirim ke service via JavaScript Interface ===
    if (isAndroid && window.AndroidInterface.isServiceConnected()) {
        // Format points ke JSON untuk Android
        const pointsJson = JSON.stringify(clickPoints.map((p, i) => ({
            x: Math.round(p.x),
            y: Math.round(p.y),
            label: 'P' + (i + 1)
        })));

        // Kirim ke Android service
        try {
            window.AndroidInterface.startClicking(pointsJson, speed, mode, repeat);
            btnStart.style.display = 'none';
            btnStop.style.display = 'inline-block';
            statusText.textContent = 'Berjalan (Android)';
            statusDot.classList.add('running');
            totalClicks.textContent = 0;
            remainingEl.textContent = repeat > 0 ? repeat : '-';
            // Nonaktifkan kontrol saat berjalan
            btnAddPoint.disabled = true;
            btnClear.disabled = true;
            overlayInstr.style.display = 'none';
            return;
        } catch(e) {
            console.warn('Android bridge failed, falling back to web mode:', e);
        }
    }

    // === WEB MODE: gunakan synthetic click (logika asli) ===
    updateUI();

    // Sembunyikan overlay instruksi
    overlayInstr.style.display = 'none';

    statusText.textContent = 'Berjalan';

    clickTimer = setInterval(() => {
        if (clickCount >= maxClicks) {
            stopAutoClick();
            return;
        }

        // Tentukan titik yang akan diklik
        let targetIdx;
        if (mode === 'cycle') {
            targetIdx = currentPoint;
            currentPoint = (currentPoint + 1) % clickPoints.length;
        } else {
            // Mode random
            targetIdx = Math.floor(Math.random() * clickPoints.length);
        }

        performClick(clickPoints[targetIdx], targetIdx);
        clickCount++;
        totalClicks.textContent = clickCount;
    }, speed);
}

// === Hentikan auto klik ===
function stopAutoClick() {
    // Android mode: kirim sinyal ke service
    if (isAndroid && window.AndroidInterface.isServiceConnected()) {
        try {
            window.AndroidInterface.stopClicking();
        } catch(e) {
            console.warn('Android stop failed:', e);
        }
    }

    isRunning = false;

    if (clickTimer) {
        clearInterval(clickTimer);
        clickTimer = null;
    }

    // Tampilkan kembali overlay instruksi
    overlayInstr.style.display = 'block';
    overlayInstr.textContent = 'Klik "Tambah Titik" lalu sentuh area untuk menentukan titik klik';
    overlayInstr.style.color = '#a0a0a0';

    statusText.textContent = 'Berhenti';
    updateUI();

    // Hapus semua efek visual klik
    const markers = clickArea.querySelectorAll('.click-point');
    markers.forEach(m => {
        m.classList.remove('active-click');
    });
}

// === Lakukan klik pada satu titik ===
function performClick(point, idx) {
    // 1. Efek visual: animasi pulsing pada marker
    const markers = clickArea.querySelectorAll('.click-point');
    markers.forEach(m => m.classList.remove('active-click'));

    // Cari marker yang sesuai
    const allMarkers = clickArea.querySelectorAll('.click-point');
    if (allMarkers[idx]) {
        allMarkers[idx].classList.add('active-click');
    }

    // 2. Klik secara programatik pada elemen di koordinat itu
    //    Menggunakan elementFromPoint untuk menemukan elemen
    const rect = clickArea.getBoundingClientRect();
    const clientX = rect.left + point.x;
    const clientY = rect.top + point.y;

    const targetEl = document.elementFromPoint(clientX, clientY);
    if (targetEl && typeof targetEl.click === 'function') {
        // Dispatch event klik secara aman (hanya pada elemen di halaman ini)
        targetEl.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: clientX,
            clientY: clientY
        }));
    }

    // 3. Dispatch custom event untuk tracking (hanya internal, tidak ke jaringan)
    clickArea.dispatchEvent(new CustomEvent('autoClick', {
        detail: { x: point.x, y: point.y, index: idx, count: clickCount + 1 }
    }));

    // 4. Update info visual
    showTemporaryPoint(point.x, point.y, idx + 1);
}

// === Update seluruh tampilan UI ===
function updateUI() {
    // Jumlah titik
    pointCountEl.textContent = clickPoints.length;

    // Total klik
    totalClicks.textContent = clickCount;

    // Sisa klik
    const repeat = parseInt(repeatInput.value);
    if (repeat > 0) {
        remainingEl.textContent = Math.max(0, repeat - clickCount);
    } else {
        remainingEl.textContent = '-';
    }

    // Tombol mulai/berhenti
    btnStart.style.display = isRunning ? 'none' : 'inline-block';
    btnStop.style.display  = isRunning ? 'inline-block' : 'none';

    // Status dot
    statusDot.classList.toggle('running', isRunning);

    // Render marker titik
    renderPoints();

    // Nonaktifkan tombol tambah titik & hapus saat berjalan
    btnAddPoint.disabled = isRunning;
    btnClear.disabled    = isRunning;
}

// === Inisialisasi saat DOM siap ===
document.addEventListener('DOMContentLoaded', init);

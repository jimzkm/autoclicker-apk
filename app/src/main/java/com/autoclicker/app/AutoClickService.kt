package com.autoclicker.app

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent

/**
 * AccessibilityService untuk menjalankan auto klik di sistem Android.
 * Service ini memungkinkan aplikasi mengirim gesture tap ke koordinat
 * mana saja di layar, di luar aplikasi ini.
 *
 * Cara pakai:
 * 1. Aktifkan service di Settings -> Accessibility -> Auto Clicker
 * 2. WebView mengirim perintah via JavaScript Interface
 * 3. Service menjalankan klik secara otomatis
 */
class AutoClickService : AccessibilityService() {

    companion object {
        /** Instance service yang sedang terhubung (untuk dispatchGesture) */
        var instance: AutoClickService? = null
            private set

        var isServiceConnected: Boolean = false
            private set

        var isRunning: Boolean = false
            private set

        // Titik-titik klik
        private val clickPoints: MutableList<ClickPoint> = mutableListOf()
        private var currentPointIndex: Int = 0
        private var clickCount: Int = 0

        // Konfigurasi
        var clickSpeed: Int = 500
        var clickMode: String = "cycle"
        var repeatCount: Int = 0

        // Callback
        var onStatusChanged: ((running: Boolean, count: Int) -> Unit)? = null

        private val handler = Handler(Looper.getMainLooper())
        private var autoClickRunnable: Runnable? = null

        fun startClicking(points: List<ClickPoint>, speed: Int, mode: String, repeat: Int) {
            if (instance == null) {
                onStatusChanged?.invoke(false, -1)
                return
            }
            synchronized(clickPoints) {
                clickPoints.clear()
                clickPoints.addAll(points)
            }
            clickSpeed = speed
            clickMode = mode
            repeatCount = repeat
            currentPointIndex = 0
            clickCount = 0
            startAutoClick()
        }

        fun stopClicking() {
            stopAutoClick()
        }

        private fun startAutoClick() {
            isRunning = true
            onStatusChanged?.invoke(true, 0)

            autoClickRunnable = object : Runnable {
                override fun run() {
                    if (!isRunning) return
                    val maxClicks = if (repeatCount > 0) repeatCount else Int.MAX_VALUE
                    if (clickCount >= maxClicks) {
                        stopAutoClick()
                        return
                    }
                    val pointsCopy: List<ClickPoint>
                    synchronized(clickPoints) {
                        if (clickPoints.isEmpty()) {
                            stopAutoClick()
                            return
                        }
                        pointsCopy = clickPoints.toList()
                    }
                    val targetIdx: Int
                    if (clickMode == "cycle") {
                        targetIdx = currentPointIndex
                        currentPointIndex = (currentPointIndex + 1) % pointsCopy.size
                    } else {
                        targetIdx = (0 until pointsCopy.size).random()
                    }
                    val point = pointsCopy[targetIdx]
                    instance?.performClickGesture(point.x, point.y)
                    clickCount++
                    onStatusChanged?.invoke(true, clickCount)
                    handler.postDelayed(this, clickSpeed.toLong())
                }
            }
            handler.post(autoClickRunnable as Runnable)
        }

        private fun stopAutoClick() {
            isRunning = false
            autoClickRunnable?.let { handler.removeCallbacks(it) }
            autoClickRunnable = null
            clickCount = 0
            onStatusChanged?.invoke(false, 0)
        }
    }

    data class ClickPoint(
        val x: Float,
        val y: Float,
        val label: String = ""
    )

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        isServiceConnected = true
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

    override fun onInterrupt() {
        stopAutoClick()
    }

    override fun onServiceDisconnected() {
        super.onServiceDisconnected()
        instance = null
        isServiceConnected = false
        stopAutoClick()
    }

    private fun performClickGesture(x: Float, y: Float) {
        val path = Path()
        path.moveTo(x, y)
        path.lineTo(x + 1, y + 1)

        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 200))
            .build()

        dispatchGesture(gesture, object : AccessibilityService.GestureResultCallback() {
            override fun onCompleted(gestureDescription: GestureDescription) {}
            override fun onCancelled(gestureDescription: GestureDescription) {}
        }, null)
    }
}

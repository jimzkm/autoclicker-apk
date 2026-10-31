package com.autoclicker.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var clickService: AutoClickService? = null
    private var isServiceConnected = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        setupWebView()
        loadWebApp()

        // Cek apakah accessibility service sudah aktif
        if (!isAccessibilityServiceEnabled()) {
            requestAccessibilityEnable()
        }
    }

    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewports = true
        settings.userAgentText = "AutoClicker-Android/1.0"

        // JavaScript Interface untuk komunikasi WebView <-> Android
        webView.addJavascriptInterface(WebAppInterface(this), "AndroidInterface")

        // Handle link klik di dalam WebView
        webView.setWebViewClient(object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                // Buka link eksternal di browser, bukan di WebView
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return false
                }
                return false
            }
        })

        // Enable debugging untuk development
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
            WebView.setWebChromeClient(WebChromeClient())
        }
    }

    private fun loadWebApp() {
        // Load file HTML dari assets
        webView.loadUrl("file:///android_asset/index.html")
    }

    private fun isAccessibilityServiceEnabled(): Boolean {
        val serviceName = "$packageName/$packageName.AutoClickService"
        val enabledServices = Settings.Secure.getString(
            contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        )
        return enabledServices?.contains(serviceName) == true
    }

    private fun requestAccessibilityEnable() {
        Toast.makeText(
            this,
            "Untuk auto klik ke bekerja, aktifkan Accessibility Service di Settings",
            Toast.LENGTH_LONG
        ).show()

        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        startActivity(intent)
    }

    // JavaScript Interface class
    inner class WebAppInterface(private val activity: MainActivity) {

        @JavascriptInterface
        fun startClicking(pointsJson: String, speed: Int, mode: String, repeat: Int) {
            if (!AutoClickService.isServiceConnected) {
                activity.runOnUiThread {
                    Toast.makeText(activity, "Aktifkan Accessibility Service dulu di Settings", Toast.LENGTH_LONG).show()
                }
                activity.requestAccessibilityEnable()
                return
            }

            try {
                // Parse JSON points dari JavaScript
                val points = parsePointsJson(pointsJson)
                if (points.isEmpty()) {
                    activity.runOnUiThread {
                        Toast.makeText(activity, "Tambahkan titik klik dulu", Toast.LENGTH_SHORT).show()
                    }
                    return
                }

                AutoClickService.startClicking(points, speed, mode, repeat)
                activity.runOnUiThread {
                    Toast.makeText(activity, "Auto click dimulai", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                activity.runOnUiThread {
                    Toast.makeText(activity, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }

        @JavascriptInterface
        fun stopClicking() {
            AutoClickService.stopClicking()
            activity.runOnUiThread {
                Toast.makeText(activity, "Auto click dihentikan", Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun isServiceConnected(): Boolean {
            return AutoClickService.isServiceConnected
        }

        @JavascriptInterface
        fun isRunning(): Boolean {
            return AutoClickService.isRunning
        }

        @JavascriptInterface
        fun showMessage(msg: String) {
            activity.runOnUiThread {
                Toast.makeText(activity, msg, Toast.LENGTH_SHORT).show()
            }
        }

        private fun parsePointsJson(json: String): List<AutoClickService.ClickPoint> {
            // Parse JSON manual (tanpa library tambahan)
            // Format: [{"x":100,"y":200,"label":"P1"},...]
            val points = mutableListOf<AutoClickService.ClickPoint>()
            try {
                // Simple parsing - remove brackets and split by object
                var trimmed = json.trim()
                if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                    trimmed = trimmed.substring(1, trimmed.length - 1)
                }

                // Split by },{ pattern (simple JSON parsing)
                val objects = trimmed.split(Regex("\\{.*?\\}"))
                for (obj in objects) {
                    val clean = obj.trim().trim('{').trim('}')
                    if (clean.isNotEmpty()) {
                        val parts = clean.split(",")
                        var x = 0f
                        var y = 0f
                        var label = ""

                        for (part in parts) {
                            val kv = part.split(":")
                            if (kv.size == 2) {
                                val key = kv[0].trim().trim('"')
                                var valStr = kv[1].trim().trim('"')

                                when (key) {
                                    "x" -> x = valStr.toFloatOrNull() ?: 0f
                                    "y" -> y = valStr.toFloatOrNull() ?: 0f
                                    "label" -> label = valStr
                                }
                            }
                        }
                        if (x > 0 || y > 0) {
                            points.add(AutoClickService.ClickPoint(x, y, label))
                        }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            return points
        }
    }
}

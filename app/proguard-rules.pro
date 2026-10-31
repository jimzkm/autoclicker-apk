# ProGuard / R8 rules for Auto Clicker
# Keep all public classes and methods used by JavaScript Interface
-keepclassmembers class com.autoclicker.app.** {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep AccessibilityService
-keep class android.accessibilityservice.** { *; }

# Keep model classes
-keepclassmembers class com.autoclicker.app.AutoClickService$ClickPoint { *; }

# Suppress warnings
-dontwarn android.webkit.**
-dontwarn android.accessibilityservice.**

# Keep Kotlin coroutines and metadata
-keepclassmembers,allow Shrinking,allow Shrinking class kotlin.Metadata { *; }
-keepclassmembers class kotlin.Metadata { *; }

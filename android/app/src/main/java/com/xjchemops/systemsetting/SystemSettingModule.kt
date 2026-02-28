package com.xjchemops.systemsetting

import android.os.Build
import android.content.Intent
import android.media.AudioManager
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.*

class SystemSettingModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "SystemSetting"

    private fun canWriteSettings(): Boolean {
        return Settings.System.canWrite(reactContext)
    }

    private fun requestWriteSettings(promise: Promise) {
        val intent = Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS).apply {
            data = Uri.parse("package:${reactContext.packageName}")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
        promise.reject("PERMISSION_REQUIRED", "Cần cấp quyền WRITE_SETTINGS, đã mở màn hình cấp quyền")
    }

    @ReactMethod
    fun getScreenTimeout(promise: Promise) {
        try {
            val timeout = Settings.System.getInt(
                reactContext.contentResolver,
                Settings.System.SCREEN_OFF_TIMEOUT
            )
            promise.resolve(timeout / 1000) // trả về giây
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setScreenTimeout(seconds: Int, promise: Promise) {
        if (!canWriteSettings()) {
            requestWriteSettings(promise)
            return
        }
        try {
            val ms = if (seconds == -1) Int.MAX_VALUE else seconds * 1000
            Settings.System.putInt(
                reactContext.contentResolver,
                Settings.System.SCREEN_OFF_TIMEOUT,
                ms
            )
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getVolume(streamType: String, promise: Promise) {
        try {
            val audioManager = reactContext.getSystemService(ReactApplicationContext.AUDIO_SERVICE) as AudioManager
            val stream = resolveStream(streamType)
            val current = audioManager.getStreamVolume(stream)
            val max = audioManager.getStreamMaxVolume(stream)
            val result = Arguments.createMap().apply {
                putInt("current", current)
                putInt("max", max)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setVolume(streamType: String, volume: Int, promise: Promise) {
        try {
            val audioManager = reactContext.getSystemService(ReactApplicationContext.AUDIO_SERVICE) as AudioManager
            val stream = resolveStream(streamType)
            val max = audioManager.getStreamMaxVolume(stream)
            val clamped = volume.coerceIn(0, max)
            audioManager.setStreamVolume(stream, clamped, 0)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun setMute(streamType: String, mute: Boolean, promise: Promise) {
        try {
            val audioManager = reactContext.getSystemService(ReactApplicationContext.AUDIO_SERVICE) as AudioManager
            val stream = resolveStream(streamType)
            audioManager.adjustStreamVolume(
                stream,
                if (mute) AudioManager.ADJUST_MUTE else AudioManager.ADJUST_UNMUTE,
                0
            )
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun canWrite(promise: Promise) {
        promise.resolve(canWriteSettings())
    }

    @ReactMethod
    fun requestWritePermission(promise: Promise) {
        requestWriteSettings(promise)
    }

    private fun resolveStream(streamType: String): Int {
        return when (streamType) {
            "music"  -> AudioManager.STREAM_MUSIC
            "ring"   -> AudioManager.STREAM_RING
            "alarm"  -> AudioManager.STREAM_ALARM
            "system" -> AudioManager.STREAM_SYSTEM
            else     -> AudioManager.STREAM_MUSIC
        }
    }

    @ReactMethod
    fun startPolling(serverIp: String, port: String, intervalSeconds: Int, idDrum: String, promise: Promise) {
    try {
        val intent = Intent(reactContext, PollingService::class.java).apply {
            putExtra(PollingService.EXTRA_SERVER_IP, serverIp)
            putExtra(PollingService.EXTRA_PORT, port)
            putExtra(PollingService.EXTRA_INTERVAL, intervalSeconds * 1000L)
            putExtra(PollingService.EXTRA_DRUM_ID, idDrum)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
        promise.resolve(true)
    } catch (e: Exception) {
        promise.reject("ERROR", e.message)
    }
}

@ReactMethod
fun stopPolling(promise: Promise) {
    try {
        reactContext.stopService(Intent(reactContext, PollingService::class.java))
        promise.resolve(true)
    } catch (e: Exception) {
        promise.reject("ERROR", e.message)
    }
}
}
package com.xjchemops.systemsetting

import android.app.*
import android.content.Intent
import android.media.AudioManager
import android.os.*
import android.provider.Settings
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class PollingService : Service() {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var pollingJob: Job? = null

    companion object {
        const val CHANNEL_ID = "system_setting_polling"
        const val NOTIF_ID = 1001
        const val EXTRA_SERVER_IP = "serverIp"
        const val EXTRA_PORT = "port"
        const val EXTRA_INTERVAL = "interval"
        const val EXTRA_DRUM_ID = "idDrum"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val serverIp = intent?.getStringExtra(EXTRA_SERVER_IP) ?: return START_NOT_STICKY
        val port = intent.getStringExtra(EXTRA_PORT) ?: return START_NOT_STICKY
        val interval = intent.getLongExtra(EXTRA_INTERVAL, 5000L)
        val idDrum = intent.getStringExtra(EXTRA_DRUM_ID) ?: return START_NOT_STICKY

        startForeground(NOTIF_ID, buildNotification())

        pollingJob?.cancel()
        pollingJob = scope.launch {
            while (isActive) {
                try {
                    fetchAndApply(serverIp, port, idDrum)
                } catch (e: Exception) {
                    // ignore, thử lại lần sau
                }
                delay(interval)
            }
        }

        return START_STICKY // Android tự restart nếu bị kill
    }

    private suspend fun fetchAndApply(serverIp: String, port: String, idDrum: String) {
        val url = URL("http://$serverIp:$port/portal/inject/config/$idDrum")
        val conn = url.openConnection() as HttpURLConnection
        conn.requestMethod = "GET"
        conn.connectTimeout = 3000
        conn.readTimeout = 3000

        if (conn.responseCode == 200) {
            val json = JSONObject(conn.inputStream.bufferedReader().readText())
            applySettings(json)
        }
        conn.disconnect()
    }

    private fun applySettings(json: JSONObject) {
        // Screen timeout
        if (json.has("lockScreen") && Settings.System.canWrite(this)) {
            val lock = json.getBoolean("lockScreen")
            Settings.System.putInt(
                contentResolver,
                Settings.System.SCREEN_OFF_TIMEOUT,
                if (lock) Int.MAX_VALUE else 30000
            )
        }

        // Volume
        if (json.has("volume")) {
            val audioManager = getSystemService(AUDIO_SERVICE) as AudioManager
            val volume = json.getInt("volume")
            val max = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
            val scaled = (volume / 100.0 * max).toInt().coerceIn(0, max)
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, scaled, 0)
        }

        // enableSound
        if (json.has("enableSound")) {
            val audioManager = getSystemService(AUDIO_SERVICE) as AudioManager
            val enable = json.getBoolean("enableSound")
            audioManager.adjustStreamVolume(
                AudioManager.STREAM_MUSIC,
                if (enable) AudioManager.ADJUST_UNMUTE else AudioManager.ADJUST_MUTE,
                0
            )
        }
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("XJChemOps")
            .setContentText("Đang đồng bộ cài đặt hệ thống...")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setSilent(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "System Setting Sync",
                NotificationManager.IMPORTANCE_LOW
            ).apply { setSound(null, null) }
            getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        scope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?) = null
}
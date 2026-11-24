package __PACKAGE__

import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.ViewManager
import java.io.File
import java.net.URL
import java.net.HttpURLConnection
import java.security.MessageDigest
import java.util.concurrent.Executors

class LoopUpdatesModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    private val executor = Executors.newSingleThreadExecutor()
    private var verifiedFile: File? = null
    private var verifiedHash: String? = null
    override fun getName() = "LoopUpdates"
    @Suppress("DEPRECATION")
    override fun getConstants(): Map<String, Any> {
        val info = context.packageManager.getPackageInfo(context.packageName, 0)
        val code = if (Build.VERSION.SDK_INT >= 28) info.longVersionCode else info.versionCode.toLong()
        return mapOf("version" to (info.versionName ?: "0.0.0"), "versionCode" to code.toDouble())
    }

    @ReactMethod fun addListener(name: String) {}
    @ReactMethod fun removeListeners(count: Int) {}

    private fun safeUrl(value: String): URL {
        val url = URL(value)
        require(url.protocol == "https" && url.host == "clpiran.com" && (url.port == -1 || url.port == 443)) { "Untrusted update origin" }
        require(url.path.matches(Regex("/downloads/android/(LoopUser|LoopTech)-[0-9]+\\.[0-9]+\\.[0-9]+\\.apk"))) { "Untrusted update path" }
        require(url.userInfo == null) { "Invalid URL" }
        return url
    }

    private fun sha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().buffered().use { input ->
            val buffer = ByteArray(64 * 1024)
            while (true) { val n = input.read(buffer); if (n < 0) break; digest.update(buffer, 0, n) }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    @Suppress("DEPRECATION")
    private fun signerHashes(info: PackageInfo): Set<String> {
        val signers = if (Build.VERSION.SDK_INT >= 28) info.signingInfo?.apkContentsSigners else info.signatures
        return signers?.map { signature -> MessageDigest.getInstance("SHA-256").digest(signature.toByteArray()).joinToString("") { "%02x".format(it) } }?.toSet() ?: emptySet()
    }

    @Suppress("DEPRECATION")
    private fun verifyPackage(file: File) {
        val flags = if (Build.VERSION.SDK_INT >= 28) PackageManager.GET_SIGNING_CERTIFICATES else PackageManager.GET_SIGNATURES
        val installed = context.packageManager.getPackageInfo(context.packageName, flags)
        val archive = context.packageManager.getPackageArchiveInfo(file.absolutePath, flags) ?: error("Invalid APK")
        require(archive.packageName == context.packageName) { "APK belongs to another application" }
        val currentVersion = if (Build.VERSION.SDK_INT >= 28) installed.longVersionCode else installed.versionCode.toLong()
        val archiveVersion = if (Build.VERSION.SDK_INT >= 28) archive.longVersionCode else archive.versionCode.toLong()
        require(archiveVersion > currentVersion) { "APK is not a newer version" }
        val installedSigners = signerHashes(installed)
        require(installedSigners.isNotEmpty() && installedSigners == signerHashes(archive)) { "APK signing certificate differs" }
    }

    @ReactMethod fun downloadUpdate(options: ReadableMap, promise: Promise) {
        executor.execute {
            val dir = File(context.cacheDir, "loop-updates").apply { mkdirs() }
            val part = File(dir, "update.apk.part")
            var connection: HttpURLConnection? = null
            try {
                val expectedHash = options.getString("sha256") ?: error("Missing hash")
                require(expectedHash.matches(Regex("[a-fA-F0-9]{64}"))) { "Invalid hash" }
                val bytes = options.getDouble("bytes").toLong()
                require(bytes in 1024..536870912) { "Invalid APK size" }
                var url = safeUrl(options.getString("url") ?: error("Missing URL"))
                var redirects = 0
                while (true) {
                    connection = url.openConnection() as HttpURLConnection
                    connection!!.instanceFollowRedirects = false
                    connection!!.connectTimeout = 20000; connection!!.readTimeout = 45000
                    connection!!.setRequestProperty("Accept-Encoding", "identity")
                    val status = connection!!.responseCode
                    if (status in listOf(301, 302, 303, 307, 308)) {
                        require(++redirects <= 5) { "Too many redirects" }
                        url = safeUrl(URL(url, connection!!.getHeaderField("Location")).toString())
                        connection!!.disconnect(); continue
                    }
                    require(status == 200) { "Update download failed ($status)" }; break
                }
                var received = 0L; var lastPercent = -1
                connection!!.inputStream.buffered().use { input -> part.outputStream().buffered().use { output ->
                    val buffer = ByteArray(64 * 1024)
                    while (true) {
                        val count = input.read(buffer); if (count < 0) break
                        received += count; require(received <= bytes) { "APK exceeds published size" }; output.write(buffer, 0, count)
                        val percent = (received * 100 / bytes).toInt()
                        if (percent != lastPercent && context.hasActiveReactInstance()) {
                            lastPercent = percent
                            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit("LoopUpdateProgress", percent)
                        }
                    }
                } }
                require(received == bytes) { "APK download incomplete" }
                require(sha256(part).equals(expectedHash, true)) { "APK hash differs from published release" }
                verifyPackage(part)
                val ready = File(dir, "update.apk")
                if (ready.exists()) ready.delete()
                require(part.renameTo(ready)) { "Could not save verified update" }
                verifiedFile = ready; verifiedHash = expectedHash
                promise.resolve(true)
            } catch (error: Exception) {
                part.delete(); promise.reject("UPDATE_DOWNLOAD_FAILED", error.message, error)
            } finally { connection?.disconnect() }
        }
    }

    @ReactMethod fun installUpdate(promise: Promise) {
        executor.execute {
            try {
                val file = verifiedFile ?: error("Download a verified update first")
                require(file.exists() && sha256(file).equals(verifiedHash, true)) { "Cached APK changed" }
                verifyPackage(file)
                if (Build.VERSION.SDK_INT >= 26 && !context.packageManager.canRequestPackageInstalls()) {
                    promise.resolve("permission_required"); return@execute
                }
                val uri = FileProvider.getUriForFile(context, context.packageName + ".loopupdates", file)
                val intent = Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/vnd.android.package-archive")
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent); promise.resolve("installer_opened")
            } catch (error: Exception) { promise.reject("UPDATE_INSTALL_FAILED", error.message, error) }
        }
    }

    @ReactMethod fun openInstallSettings(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= 26) context.startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + context.packageName)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            promise.resolve(true)
        } catch (error: Exception) { promise.reject("UPDATE_SETTINGS_FAILED", error.message, error) }
    }
}

class LoopUpdatesPackage : ReactPackage {
    override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(LoopUpdatesModule(context))
    override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

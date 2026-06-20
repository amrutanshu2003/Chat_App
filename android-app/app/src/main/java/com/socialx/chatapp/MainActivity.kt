package com.socialx.chatapp

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var permissionRequest: PermissionRequest? = null
    private val webRtcPermissionsRequestCode = 100

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        
        setupWebView()
    }

    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mediaPlaybackRequiresUserGesture = false

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                return false // Keep navigation inside the WebView
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                android.widget.Toast.makeText(
                    this@MainActivity,
                    "Failed to connect to web server: ${error?.description ?: "Cannot connect"}",
                    android.widget.Toast.LENGTH_LONG
                ).show()
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                permissionRequest = request
                val requestedResources = request.resources
                val permissionsToRequest = ArrayList<String>()

                for (resource in requestedResources) {
                    if (resource == PermissionRequest.RESOURCE_VIDEO_CAPTURE) {
                        permissionsToRequest.add(Manifest.permission.CAMERA)
                    } else if (resource == PermissionRequest.RESOURCE_AUDIO_CAPTURE) {
                        permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
                    }
                }

                if (permissionsToRequest.isNotEmpty()) {
                    val permissionsArray = permissionsToRequest.toTypedArray()
                    val neededPermissions = ArrayList<String>()
                    for (permission in permissionsArray) {
                        if (ContextCompat.checkSelfPermission(this@MainActivity, permission) != PackageManager.PERMISSION_GRANTED) {
                            neededPermissions.add(permission)
                        }
                    }

                    if (neededPermissions.isNotEmpty()) {
                        ActivityCompat.requestPermissions(
                            this@MainActivity,
                            neededPermissions.toTypedArray(),
                            webRtcPermissionsRequestCode
                        )
                    } else {
                        request.grant(requestedResources)
                    }
                } else {
                    request.grant(requestedResources)
                }
            }
        }

        // URL CONFIGURATION:
        // - Use "http://10.0.2.2:3000" to connect to your computer's localhost (for Emulator).
        // - Use your computer's Wi-Fi IP (e.g. "http://192.168.1.100:3000") to test on physical phones.
        // - Replace with your online hosted URL (e.g. "https://social-x.vercel.app") for production.
        val url = "https://socialx-chat.vercel.app" 
        webView.loadUrl(url)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == webRtcPermissionsRequestCode) {
            val request = permissionRequest
            if (request != null) {
                val grantedResources = ArrayList<String>()
                for (i in permissions.indices) {
                    if (grantResults[i] == PackageManager.PERMISSION_GRANTED) {
                        if (permissions[i] == Manifest.permission.CAMERA) {
                            grantedResources.add(PermissionRequest.RESOURCE_VIDEO_CAPTURE)
                        } else if (permissions[i] == Manifest.permission.RECORD_AUDIO) {
                            grantedResources.add(PermissionRequest.RESOURCE_AUDIO_CAPTURE)
                        }
                    }
                }
                if (grantedResources.isNotEmpty()) {
                    request.grant(grantedResources.toTypedArray())
                } else {
                    request.deny()
                }
                permissionRequest = null
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

package id.latihanskd.app;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.OutputStream;

/**
 * Pembungkus aplikasi. Mode online (bawaan): memuat Latihan Soal Pejuang NIP dari VPS (superfal-dev.com/tools/pejuang-nip/),
 * jadi setiap pembaruan langsung terpakai tanpa memasang APK baru; kunci Exclusive diketik sekali (sesi disimpan WebView).
 * Bila VPS tidak bisa dihubungi atau halaman belum tersedia, aplikasi memakai salinan bawaan APK (mode offline).
 * Saat pertama pindah ke mode online, progres yang tersimpan di salinan bawaan disalin ke versi online.
 */
public class MainActivity extends Activity {
    private static final int PINDAI = 7;
    static final String ONLINE = "https://superfal-dev.com/tools/pejuang-nip/";
    static final String LOKAL = "file:///android_asset/index.html";
    private static final String PREF = "aplikasi";
    private WebView web;
    private SharedPreferences pref;
    private boolean jatuhLokal = false;

    /** Jembatan kecil untuk halaman: simpan lembar hasil, pindai SSCASN, dan pilihan mode online/offline. */
    public class Bridge {
        @JavascriptInterface
        public String saveImage(String base64, String name, boolean share) {
            if (Build.VERSION.SDK_INT < 29) return "unsupported";
            try {
                byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                ContentValues v = new ContentValues();
                v.put(MediaStore.Images.Media.DISPLAY_NAME, name);
                v.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                v.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Latihan SKD");
                final Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, v);
                if (uri == null) return "error";
                OutputStream os = getContentResolver().openOutputStream(uri);
                if (os == null) return "error";
                os.write(bytes);
                os.close();
                if (share) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Intent i = new Intent(Intent.ACTION_SEND);
                            i.setType("image/png");
                            i.putExtra(Intent.EXTRA_STREAM, uri);
                            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            startActivity(Intent.createChooser(i, "Bagikan lembar hasil"));
                        }
                    });
                }
                return "ok";
            } catch (Exception e) {
                return "error";
            }
        }

        /** Buka layar pindai SSCASN; skrip pembaca berasal dari aplikasi sendiri (js/pindai.js). */
        @JavascriptInterface
        public void pindaiSscasn(final String skrip) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Intent i = new Intent(MainActivity.this, ScanActivity.class);
                    i.putExtra(ScanActivity.EXTRA_SKRIP, skrip);
                    startActivityForResult(i, PINDAI);
                }
            });
        }

        /** Hasil pindai terakhir (teks JSON) yang disimpan layar pindai. */
        @JavascriptInterface
        public String hasilPindai() {
            return getSharedPreferences(ScanActivity.PREF, MODE_PRIVATE).getString(ScanActivity.KEY, "");
        }

        /** "online" bila aplikasi memakai versi dari VPS, "offline" bila memakai salinan bawaan APK. */
        @JavascriptInterface
        public String mode() {
            return "offline";
        }

        /** Ganti mode lalu muat ulang dengan versi yang dipilih. */
        @JavascriptInterface
        public void aturMode(final String m) {
            pref.edit().putBoolean("offline", "offline".equals(m)).apply();
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    jatuhLokal = false;
                    web.loadUrl("offline".equals(m) ? LOKAL : ONLINE);
                }
            });
        }
    }

    private boolean bolehDiDalam(Uri u) {
        if ("file".equals(u.getScheme())) return true;
        String host = u.getHost() == null ? "" : u.getHost();
        String path = u.getPath() == null ? "" : u.getPath();
        return "https".equals(u.getScheme()) && (host.equals("superfal-dev.com") || host.equals("www.superfal-dev.com"))
                && (path.startsWith("/tools/pejuang-nip") || path.startsWith("/studio/"));
    }

    private void keLokal(WebView v) {
        if (jatuhLokal) return;
        jatuhLokal = true;
        v.loadUrl(LOKAL);
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        pref = getSharedPreferences(PREF, MODE_PRIVATE);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if ("pejuangnip".equals(u.getScheme())) {            // tautan "pakai versi offline" di halaman kunci
                    keLokal(v);
                    return true;
                }
                if (bolehDiDalam(u)) return false;
                startActivity(new Intent(Intent.ACTION_VIEW, u)); // tautan luar dibuka di browser
                return true;
            }

            @Override
            public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
                if (r.isForMainFrame() && !"file".equals(r.getUrl().getScheme())) keLokal(v);
            }

            @Override
            public void onReceivedHttpError(WebView v, WebResourceRequest r, WebResourceResponse e) {
                String path = r.getUrl().getPath() == null ? "" : r.getUrl().getPath();
                if (r.isForMainFrame() && e.getStatusCode() >= 400 && path.startsWith("/tools/pejuang-nip")) keLokal(v);
            }

            @Override
            public void onPageFinished(final WebView v, String url) {
                if (url == null) return;
                boolean online = !pref.getBoolean("offline", false);
                if (url.startsWith("file:") && online && !jatuhLokal && !pref.getBoolean("migrasi", false)) {
                    // salin progres dari salinan bawaan sebelum pindah ke versi online
                    v.evaluateJavascript("(function(){var o={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);"
                            + "if(k&&k.indexOf('skd.')===0)o[k]=localStorage.getItem(k);}return JSON.stringify(o);})()", nilai -> {
                        pref.edit().putString("salinan", nilai).apply();
                        v.loadUrl(ONLINE);
                    });
                } else if (url.startsWith(ONLINE)) {
                    // pastikan yang termuat memang aplikasi (bukan halaman lain); bila bukan, pakai salinan bawaan APK
                    v.evaluateJavascript("!!(window.SKD&&window.SKD.pindai)", ok -> {
                        if (!"true".equals(ok)) {
                            keLokal(v);
                            return;
                        }
                        if (pref.getBoolean("migrasi", false)) return;
                        String salinan = pref.getString("salinan", null);
                        if (salinan == null || "null".equals(salinan)) {
                            pref.edit().putBoolean("migrasi", true).apply();
                            return;
                        }
                        v.evaluateJavascript("(function(s){try{var o=JSON.parse(s),n=0;for(var k in o){if(localStorage.getItem(k)===null)"
                                + "{localStorage.setItem(k,o[k]);n++;}}return n;}catch(e){return -1;}})(" + salinan + ")", n -> {
                            pref.edit().putBoolean("migrasi", true).remove("salinan").apply();
                            if (n != null && !"0".equals(n) && !"-1".equals(n)) v.reload();
                        });
                    });
                } else if (url.contains("/studio/masuk")) {
                    // halaman kunci: beri jalan keluar ke salinan bawaan APK
                    v.evaluateJavascript("(function(){if(document.getElementById('pnip-off'))return;var p=document.createElement('p');p.id='pnip-off';"
                            + "p.style.cssText='margin:16px;font-size:16px';p.innerHTML='Latihan Soal Pejuang NIP: tanpa kunci atau tanpa internet? "
                            + "<a href=\"pejuangnip://offline\">Pakai versi offline di APK</a>';document.body.appendChild(p);})()", null);
                }
            }
        });
        setContentView(web);
        // APK untuk dipakai sendiri: selalu salinan bawaan APK, tanpa kunci Exclusive (kunci hanya untuk versi web publik).
        pref.edit().putBoolean("offline", true).putBoolean("migrasi", true).apply();
        if (state != null) {
            web.restoreState(state);
        } else {
            web.loadUrl(LOKAL);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PINDAI && resultCode == RESULT_OK && web != null) {
            web.evaluateJavascript("window.dispatchEvent(new Event('pindai-selesai'))", null);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}

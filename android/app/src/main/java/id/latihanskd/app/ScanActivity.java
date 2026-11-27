package id.latihanskd.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * Layar pindai SSCASN. Membuka halaman resmi daftar formasi seperti pengunjung biasa (user agent bawaan, tanpa login),
 * lalu menjalankan skrip pembaca dari aplikasi (dikirim lewat Intent) yang memakai filter halaman itu sendiri.
 * Hasil mentah (teks kartu dan detail formasi) disimpan di SharedPreferences dan diolah oleh halaman aplikasi.
 */
public class ScanActivity extends Activity {
    static final String PREF = "pindai";
    static final String KEY = "hasil";
    static final String EXTRA_SKRIP = "skrip";
    private static final String URL = "https://sscasn.bkn.go.id/daftar-formasi/";
    private static final int MAKS = 3 * 1024 * 1024;

    private WebView web;
    private TextView status;
    private String skrip;
    private boolean disuntik = false;
    private boolean selesai = false;

    /** Hanya dua metode yang bisa dipanggil halaman: laporan kemajuan dan hasil akhir (teks JSON). */
    public class PindaiBridge {
        @JavascriptInterface
        public void kemajuan(final String teks) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() { status.setText(teks == null ? "" : (teks.length() > 120 ? teks.substring(0, 120) : teks)); }
            });
        }

        @JavascriptInterface
        public void selesai(String json) {
            if (selesai) return;
            selesai = true;
            if (json != null && json.length() <= MAKS) {
                getSharedPreferences(PREF, MODE_PRIVATE).edit().putString(KEY, json).apply();
            }
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    setResult(RESULT_OK);
                    finish();
                }
            });
        }
    }

    private int dp(int v) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        skrip = getIntent().getStringExtra(EXTRA_SKRIP);

        LinearLayout akar = new LinearLayout(this);
        akar.setOrientation(LinearLayout.VERTICAL);
        LinearLayout bar = new LinearLayout(this);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setBackgroundColor(Color.rgb(19, 47, 90));
        bar.setPadding(dp(14), dp(8), dp(8), dp(8));
        status = new TextView(this);
        status.setTextColor(Color.WHITE);
        status.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        status.setText("Membuka daftar formasi SSCASN…");
        bar.addView(status, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
        Button tutup = new Button(this);
        tutup.setText("Tutup");
        tutup.setOnClickListener(v -> {
            setResult(RESULT_CANCELED);
            finish();
        });
        bar.addView(tutup);
        akar.addView(bar, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        web.addJavascriptInterface(new PindaiBridge(), "PindaiBridge");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                String host = u.getHost() == null ? "" : u.getHost();
                if ("sscasn.bkn.go.id".equals(host)) return false;
                startActivity(new Intent(Intent.ACTION_VIEW, u)); // tautan lain dibuka di browser
                return true;
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                if (!disuntik && skrip != null && url != null && url.contains("sscasn.bkn.go.id/daftar-formasi")) {
                    disuntik = true;
                    status.setText("Memindai formasi untuk Ilmu Komunikasi…");
                    v.evaluateJavascript(skrip, null);
                }
            }
        });
        akar.addView(web, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(akar);
        web.loadUrl(URL);
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.removeJavascriptInterface("PindaiBridge");
            web.destroy();
        }
        super.onDestroy();
    }
}

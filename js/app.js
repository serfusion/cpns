/* Tampilan: router hash + semua layar.
   Beranda, hasil, dan lembar hasil bergaya dasbor tryout; layar ujian meniru tata letak CAT BKN
   menurut buku panduan resmi BKN (informasi ujian, kotak nomor merah/hijau, "Simpan dan Lanjutkan").
   Bukan aplikasi resmi BKN dan tidak memakai logo BKN. */
(function () {
  "use strict";
  var SKD = window.SKD, CFG = SKD.config, E = SKD.engine, S = SKD.store, F = SKD.fig;
  var app = document.getElementById("app");
  var LET = ["A", "B", "C", "D", "E"];
  var PAKET_N = 6, NAV_PER_PAGE = 40;
  var BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  var BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  // ---------- util DOM ----------
  function h(tag, attrs) {
    var el = document.createElement(tag), k, i;
    if (attrs) {
      for (k in attrs) {
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === "class") el.className = v;
        else if (k === "html") el.innerHTML = v; // hanya untuk SVG buatan sendiri
        else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
        else if (v === true) el.setAttribute(k, "");
        else el.setAttribute(k, v);
      }
    }
    for (i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (c) { add(el, c); }); return; }
    el.appendChild(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtTime(sec, hours) {
    sec = Math.max(0, Math.round(sec));
    var hh = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60), ss = sec % 60;
    return hours ? pad(hh) + ":" + pad(mm) + ":" + pad(ss) : pad(hh * 60 + mm) + ":" + pad(ss);
  }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function dec(n) { return (Math.round(n * 10) / 10).toString().replace(".", ","); }
  function tglPendek(t) { var d = new Date(t); return d.getDate() + " " + BLN[d.getMonth()] + " " + d.getFullYear(); }
  function tglPanjang(t) { var d = new Date(t); return d.getDate() + " " + BULAN[d.getMonth()] + " " + d.getFullYear() + ", " + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function passOf(secId) { return S.settings().pass[secId]; }
  function isMiss(it) { return it.chosen == null ? true : it.pq.sec === "tkp" ? it.pts <= 3 : it.pts < 5; }
  function nama() { return S.settings().nama || ""; }
  function sapaan() { var n = nama(); return n ? n.split(/\s+/)[0] : "Pejuang NIP"; }

  var ICON = {
    rumah: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
    ujian: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4",
    latih: "M4 19.5V5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zM8 7h6",
    ulang: "M4 4v6h6M20 20v-6h-6M5.6 15a7 7 0 0 0 12.3 2M18.4 9A7 7 0 0 0 6.1 7",
    riwayat: "M4 19h16M7 16V10M12 16V6M17 16v-3",
    peta: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14",
    formasi: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6",
    hitung: "M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8M8 12h2M12 12h2M16 12v5M8 16h2M12 16h2",
    gaji: "M12 4c3.9 0 7 1.3 7 3s-3.1 3-7 3-7-1.3-7-3 3.1-3 7-3zM5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5",
    audio: "M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H4zM17 14h3v6h-3z",
    atur: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.9H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z",
    panah: "M9 6l6 6-6 6"
  };
  function icon(name) {
    return h("span", { class: "ico", "aria-hidden": "true", html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + ICON[name] + '"/></svg>' });
  }

  var ui = {
    route: "beranda", session: null, result: null, saved: null, prep: null,
    setup: { sec: "twk", off: {}, n: 10, hot: false, sangat: false, baru: false },
    rvFilter: "salah", railOpen: null, tick: null, lastTick: 0, ticks: 0,
    pending: null, navPage: 0, navOn: true, navSheet: false, animCur: -1
  };

  // ---------- dialog & toast ----------
  var modalRoot = document.getElementById("modal-root"), toastEl = document.getElementById("toast"), toastTimer = null;
  function closeModal() { modalRoot.textContent = ""; }
  function modal(o) {
    closeModal();
    var cancel = h("button", { class: "btn", type: "button", onclick: closeModal }, o.cancel || "Batal");
    var ok = h("button", { class: "btn " + (o.okClass || "primary"), type: "button", onclick: function () { closeModal(); o.onOk(); } }, o.ok);
    var box = h("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-ttl" },
      h("h2", { id: "modal-ttl" }, o.title), h("p", null, o.body), h("div", { class: "row end" }, cancel, ok));
    var bd = h("div", { class: "backdrop", onclick: function (e) { if (e.target === bd) closeModal(); } }, box);
    modalRoot.appendChild(bd);
    cancel.focus();
  }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2600);
  }

  // ---------- sesi ----------
  function isTryout(s) { return s && (s.kind === "tryout" || s.kind === "simulasi"); }
  function saveSession() { if (ui.session) S.saveSession(ui.session); }
  function begin(s) {
    ui.session = s;
    ui.saved = null;
    ui.railOpen = null;
    ui.pending = null;
    ui.navPage = 0;
    saveSession();
    go(isTryout(s) ? "ujian" : "kerjakan");
  }
  function guardNew(fn) {
    var sv = ui.saved || S.loadSession();
    var answered = sv ? sv.items.filter(function (i) { return i.chosen != null; }).length : 0;
    if (sv && answered > 0) {
      modal({
        title: "Mulai sesi baru?", ok: "Mulai baru",
        body: "Ada " + (isTryout(sv) ? "tryout" : "latihan") + " yang belum selesai (" + answered + " soal terjawab). Memulai sesi baru akan menghapusnya.",
        onOk: fn
      });
    } else fn();
  }
  function startPractice(o) {
    guardNew(function () {
      var items = E.buildPractice({ materi: o.materi, n: o.n, hot: o.hot, sangat: o.sangat, baru: o.baru, acak: o.acak, k26: o.k26 }, S.qstats());
      if (!items.length) { toast("Belum ada soal untuk pilihan ini."); return; }
      begin({ kind: "latihan", scale: null, title: o.title, instant: true, requeue: S.settings().requeue, items: items, cur: 0, limit: 0, elapsed: 0 });
    });
  }
  /** o: { paket: nomor | "acak", scale: "full" | "mini" } */
  function paketInfo(o) {
    var mini = o.scale === "mini";
    var label = o.paket === "acak" ? "Tryout Acak" : o.paket === "setara" ? "Tryout Setara CAT" : "Tryout SKD Paket " + o.paket;
    var kode = o.paket === "acak" ? "SKD-ACAK" : o.paket === "setara" ? "SKD-SETARA" : "SKD-P" + o.paket;
    return { paket: o.paket, scale: o.scale, title: label + (mini ? " (setengah)" : ""), kode: kode + (mini ? "-S" : "") };
  }
  function prepTryout(o) { guardNew(function () { ui.prep = paketInfo(o); go("masuk"); }); }
  function startTryout() {
    var p = ui.prep;
    if (!p) return;
    var items = p.paket === "acak" ? E.buildSimulation(p.scale, S.qstats()) : p.paket === "setara" ? E.buildSetara(1, p.scale, TIU_LUNAK) : E.buildPackage(p.paket, p.scale);
    begin({
      kind: "tryout", scale: p.scale, paket: p.paket, kode: p.kode, title: p.title, instant: false, requeue: false, items: items, cur: 0,
      limit: (p.scale === "mini" ? CFG.exam.minutes / 2 : CFG.exam.minutes) * 60, elapsed: 0
    });
  }
  function startReview(ids, title) {
    guardNew(function () {
      var items = E.buildFromIds(ids.slice(0, 30));
      if (!items.length) { toast("Tidak ada soal yang perlu diulang."); return; }
      begin({ kind: "latihan", scale: null, title: title, instant: true, requeue: true, items: items, cur: 0, limit: 0, elapsed: 0 });
    });
  }
  function resume() {
    var sv = ui.saved || S.loadSession();
    if (!sv) { toast("Tidak ada sesi tersimpan."); return; }
    ui.session = sv;
    ui.saved = null;
    ui.pending = null;
    go(isTryout(sv) ? "ujian" : "kerjakan");
  }

  function stopTimer() { clearInterval(ui.tick); ui.tick = null; }
  function startTimer() {
    stopTimer();
    ui.lastTick = Date.now();
    ui.tick = setInterval(function () {
      var s = ui.session;
      if (!s || (ui.route !== "kerjakan" && ui.route !== "ujian")) { stopTimer(); return; }
      var now = Date.now(), d = Math.round((now - ui.lastTick) / 1000);
      if (d < 1) return;
      ui.lastTick += d * 1000;
      s.elapsed += d;
      if (s.limit && s.elapsed >= s.limit) { s.elapsed = s.limit; finish(true); return; }
      paintClock();
      if (++ui.ticks % 10 === 0) saveSession();
    }, 500);
  }
  function paintClock() {
    var s = ui.session, el = document.getElementById("clock");
    if (!s || !el) return;
    var left = s.limit - s.elapsed;
    el.textContent = s.limit ? fmtTime(left, true) : fmtTime(s.elapsed);
    if (s.limit) el.classList.toggle("low", left <= 300);
  }

  // ---------- latihan (koreksi langsung) ----------
  function choose(idx) {
    var s = ui.session;
    if (!s) return;
    var it = s.items[s.cur];
    if (idx < 0 || idx >= it.pq.opts.length || it.done) return;
    it.chosen = idx;
    it.pts = it.pq.opts[idx].pts;
    it.done = true;
    S.record(it.pq, it.pts);
    if (s.requeue && isMiss(it) && (it.tries || 0) < 2) {
      var again = { pq: E.again(it.pq), chosen: null, pts: null, done: false, retry: true, tries: (it.tries || 0) + 1 };
      s.items.splice(Math.min(s.items.length, s.cur + 5), 0, again);
    }
    saveSession();
    render();
    var fb = document.getElementById("fb"), nx = document.getElementById("btn-next");
    if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (nx) nx.focus({ preventScroll: true });
  }
  function goTo(i) {
    var s = ui.session;
    if (!s || i < 0 || i >= s.items.length) return;
    s.cur = i;
    ui.pending = null;
    ui.navPage = Math.floor(i / NAV_PER_PAGE);
    saveSession();
    render(true);
  }
  function next() {
    var s = ui.session;
    if (!s) return;
    if (s.cur < s.items.length - 1) return goTo(s.cur + 1);
    var firstUn = -1;
    s.items.forEach(function (it, i) { if (firstUn < 0 && it.chosen == null) firstUn = i; });
    if (firstUn >= 0) { toast("Masih ada soal yang belum dijawab."); return goTo(firstUn); }
    finish();
  }
  function askEndPractice() {
    var s = ui.session;
    if (!s) return;
    var un = s.items.filter(function (i) { return i.chosen == null; }).length;
    if (!un) return finish();
    modal({ title: "Akhiri latihan?", ok: "Akhiri", okClass: "danger", cancel: "Kembali ke soal",
      body: "Masih ada " + un + " soal yang belum dijawab. Soal yang belum dijawab tidak dihitung.", onOk: function () { finish(); } });
  }

  // ---------- ujian CAT ----------
  function catPick(idx) {
    var it = ui.session.items[ui.session.cur];
    if (it.revealed) return; // sudah dikoreksi di mode belajar: jawaban terkunci
    ui.pending = idx; render();
  }
  function catNext() { var s = ui.session; if (s.cur < s.items.length - 1) goTo(s.cur + 1); else render(); }
  function catSave() {
    var s = ui.session, it = s.items[s.cur];
    if (it.revealed) return catNext(); // koreksi sudah tampil: tombol berfungsi sebagai Lanjut
    var sel = ui.pending != null ? ui.pending : it.chosen;
    if (sel == null) { toast("Pilih satu jawaban dulu, atau tekan Lewatkan soal ini."); return; }
    it.chosen = sel;
    it.pts = it.pq.opts[sel].pts;
    ui.pending = null;
    if (modeBelajar()) it.revealed = true;
    saveSession();
    if (!it.revealed) return catNext();
    if (it.pts === 5) { toast(it.pq.sec === "tkp" ? "Tepat, 5 poin" : "Benar"); return catNext(); }
    // Mode belajar: jawaban salah langsung dibenarkan di soal yang sama, pembahasan di bawahnya.
    render();
    var fb = document.getElementById("cat-koreksi");
    if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: "nearest" });
  }
  function modeBelajar() { try { return localStorage.getItem("skd.belajar") !== "0"; } catch (e) { return true; } }
  function catSkip() {
    var s = ui.session;
    ui.pending = null;
    if (s.cur < s.items.length - 1) goTo(s.cur + 1); else goTo(0);
  }
  function catAskFinish(force) {
    var s = ui.session;
    if (!s) return;
    var un = s.items.filter(function (i) { return i.chosen == null; }).length;
    closeModal();
    var box = h("div", { class: "cat-confirm", role: "dialog", "aria-modal": "true", "aria-labelledby": "cat-ttl" },
      h("p", { class: "cat-warn", id: "cat-ttl" }, "PERHATIAN !!!"),
      h("p", { class: "center" }, "Apakah Anda ingin mengakhiri ujian ini?"),
      h("p", { class: "center small" }, "Jika \"Ya\" maka Anda sudah dinyatakan selesai mengikuti ujian, dan Anda tidak bisa memperbaiki lembar kerja Anda. Jika \"Tidak\" maka Anda akan kembali ke lembar kerja dan silakan melanjutkan menjawab atau memperbaiki jawaban Anda."),
      h("p", { class: "cat-un" }, "SOAL BELUM DIJAWAB : " + un),
      force && un ? h("p", { class: "center small muted" }, "Pada CAT asli, tombol Selesai Ujian baru aktif setelah semua soal dijawab. Pintasan ini hanya ada di latihan.") : null,
      h("div", { class: "row center" },
        h("button", { class: "cat-or", type: "button", onclick: function () { closeModal(); finish(); } }, "Ya (Saya sudah selesai menjawab soal)"),
        h("button", { class: "cat-or", type: "button", id: "cat-tidak", onclick: closeModal }, "Tidak (Saya ingin melanjutkan menjawab soal)")));
    modalRoot.appendChild(h("div", { class: "backdrop top" }, box));
    document.getElementById("cat-tidak").focus();
  }

  // ---------- selesai ----------
  /** Nilai tryout per subtes; paket setengah disetarakan ke skala penuh. */
  function simScores(items, scale) {
    var sc = E.score(items), out = { total: 0, pass: true, sc: sc };
    CFG.sections.forEach(function (sec) {
      var b = sc.sec[sec.id], scaled = b.n ? Math.round((b.pts * sec.count) / b.n) : 0, ok = scaled >= passOf(sec.id);
      out[sec.id] = { raw: b.pts, scaled: scaled, ok: ok, answered: b.answered, n: b.n, right: b.right };
      out.total += scaled;
      if (!ok) out.pass = false;
    });
    return out;
  }
  function materiCompact(sc) {
    var m = {};
    for (var k in sc.materi) { var b = sc.materi[k]; m[k] = [b.right, b.n, b.pts, b.max]; }
    return m;
  }
  function finish(auto) {
    var s = ui.session;
    if (!s) return;
    stopTimer();
    closeModal();
    var tryout = isTryout(s);
    if (tryout) s.items.forEach(function (it) { if (it.chosen != null) S.record(it.pq, it.pts); });
    var sim = simScores(s.items.filter(function (i) { return !i.retry; }), s.scale);
    var at = Date.now();
    var res = {
      kind: tryout ? "tryout" : "latihan", paket: s.paket, kode: s.kode, title: s.title, scale: s.scale, items: s.items,
      sim: sim, elapsed: s.elapsed, limit: s.limit, auto: !!auto, at: at
    };
    if (tryout && sim.sc.answered > 0) {
      var hs = {};
      CFG.sections.forEach(function (sec) { hs[sec.id] = [sim[sec.id].scaled, sim[sec.id].answered, sim[sec.id].n]; });
      S.addHistory({ t: at, kind: s.scale || "full", p: s.title, k: s.kode, s: hs, total: sim.total, pass: sim.pass, dur: s.elapsed, instant: false,
        m: materiCompact(sim.sc), n: sim.sc.count, ans: sim.sc.answered });
      S.saveUlas({ t: at, title: s.title, kode: s.kode, scale: s.scale, elapsed: s.elapsed, items: s.items.map(function (it) { return { pq: it.pq, chosen: it.chosen, pts: it.pts }; }) });
    }
    S.clearSession();
    ui.session = null;
    ui.saved = null;
    ui.pending = null;
    ui.result = res;
    ui.rvFilter = "salah";
    go(tryout ? "nilai" : "hasil");
    if (auto) toast("Waktu habis. Ujian diakhiri otomatis.");
  }
  /** Buka kembali hasil tryout lama dari pembahasan yang tersimpan di perangkat. */
  function openAttempt(hEntry, route) {
    var u = S.ulas(hEntry.t);
    if (!u) { toast("Pembahasan percobaan ini tidak lagi tersimpan di perangkat."); return; }
    var items = u.items.map(function (x) { return { pq: x.pq, chosen: x.chosen, pts: x.pts, done: true }; });
    ui.result = { kind: "tryout", title: u.title || hEntry.p || "Tryout", kode: u.kode, scale: u.scale, items: items, sim: simScores(items, u.scale), elapsed: u.elapsed || hEntry.dur, limit: 0, at: hEntry.t };
    ui.rvFilter = "salah";
    go(route);
  }

  // ---------- potongan tampilan bersama ----------
  function figBox(spec) {
    return h("span", { class: "fig" + (spec.k === "q" ? " q" : ""), role: "img", "aria-label": F.describe(spec), html: F.svg(spec) });
  }
  function stemView(st) {
    if (!st) return null;
    if (st.layout === "matriks") return h("div", { class: "stem matriks" }, st.figs.map(figBox));
    if (st.layout === "jaring") return h("div", { class: "stem jaring" }, st.figs.map(figBox));
    var kids = [];
    st.figs.forEach(function (f, i) {
      if (st.layout === "analogi" && i > 0) kids.push(h("span", { class: "sep", "aria-hidden": "true" }, i === 2 ? "=" : ":"));
      kids.push(figBox(f));
    });
    return h("div", { class: "stem" }, kids);
  }
  function tableView(tb) {
    if (!tb) return null;
    return h("div", { class: "qtable" }, h("table", null,
      h("thead", null, h("tr", null, tb.h.map(function (c) { return h("th", null, c); }))),
      h("tbody", null, tb.r.map(function (r) { return h("tr", null, r.map(function (c) { return h("td", null, c); })); }))));
  }
  function ptsTag(pts) { return h("span", { class: "tag " + (pts === 5 ? "ok" : pts === 4 ? "accent" : pts === 3 ? "warn" : "bad") }, pts + " poin"); }
  function optsView(it, reveal, onPick) {
    var pq = it.pq, isFig = !!pq.opts[0].fig, tkp = pq.sec === "tkp";
    return h("ul", { class: "opts" + (isFig ? " figs" : "") }, pq.opts.map(function (o, i) {
      var cls = "opt", tag = null, mark = LET[i], picked = it.chosen === i;
      if (reveal) {
        if (tkp) {
          tag = ptsTag(o.pts);
          if (i === pq.best) { cls += " is-right"; mark = "✓"; }
          else if (picked) { cls += o.pts === 4 ? " is-mid" : " is-wrong"; }
          else cls += " is-dim";
          if (picked) tag = h("span", { class: "row tight" }, h("span", { class: "tag" }, "Pilihan Anda"), tag);
        } else if (i === pq.best) {
          cls += " is-right"; mark = "✓";
          tag = h("span", { class: "tag ok" }, picked ? "Benar" : "Jawaban benar");
        } else if (picked) {
          cls += " is-wrong"; mark = "✕";
          tag = h("span", { class: "tag bad" }, "Pilihan Anda");
        } else cls += " is-dim";
      } else if (picked) cls += " is-picked";
      var body = isFig ? h("span", { class: "opt-t" }, figBox(o.fig)) : h("span", { class: "opt-t" }, o.t);
      var label = "Pilihan " + LET[i] + (isFig ? ": " + F.describe(o.fig) : "");
      return h("li", null, h("button", {
        class: cls, type: "button", disabled: !onPick, "aria-label": isFig ? label : null, "aria-pressed": picked ? "true" : "false",
        "data-opt": i, onclick: onPick ? function () { onPick(i); } : null
      }, h("span", { class: "opt-k", "aria-hidden": isFig ? "true" : null }, mark), body, tag ? h("span", { class: "opt-tag" }, tag) : null));
    }));
  }
  function feedbackView(it) {
    var pq = it.pq, tkp = pq.sec === "tkp", cls, verdict;
    if (it.chosen == null) { cls = ""; verdict = "Tidak dijawab. Jawaban " + (tkp ? "bernilai 5: " : "benar: ") + LET[pq.best]; }
    else if (it.pts === 5) { cls = "right"; verdict = tkp ? "Tepat, 5 poin" : "Benar"; }
    else if (tkp) { cls = it.pts === 4 ? "mid" : "wrong"; verdict = it.pts + " poin. Jawaban bernilai 5: " + LET[pq.best]; }
    else { cls = "wrong"; verdict = "Salah. Jawaban benar: " + LET[pq.best]; }
    return h("div", { class: "feedback " + cls, id: "fb" },
      h("div", { class: "verdict" }, verdict),
      pq.expl ? [h("div", { class: "expl-l" }, "Pembahasan"), h("div", { class: "expl" }, pq.expl)] : null);
  }
  function materiName(id) { var m = E.materi(id); return m ? m.name : id; }
  function qHeadTags(it) {
    var pq = it.pq, sec = E.section(pq.sec);
    return [h("span", { class: "tag accent" }, sec.short), h("span", { class: "tag" }, materiName(pq.m)),
      pq.sangat ? h("span", { class: "tag hot", title: "Pola yang dilaporkan di 3 laporan peserta atau lebih" }, "Sangat sering keluar")
        : pq.hot ? h("span", { class: "tag warn", title: "Pola soal yang sering dilaporkan keluar" }, "Sering keluar") : null,
      pq.acak ? h("span", { class: "tag", title: "Dibangkitkan dari tabel fakta yang sudah diperiksa; berbeda setiap kali" }, "Soal acak") : null,
      pq.baru ? h("span", { class: "tag ok", title: "Set soal kasus bergaya HOTS dengan konteks 2024–2026" }, "HOTS 2026") : null,
      it.retry ? h("span", { class: "tag bad" }, "Ulangan") : null];
  }
  /** Teks soal dengan _kata_ ditampilkan miring (soal "makna kata bercetak miring"). */
  function rich(t) {
    if (!t || t.indexOf("_") < 0) return t;
    return String(t).split(/_([^_\n]+)_/).map(function (p, i) { return i % 2 ? h("em", null, p) : p; });
  }
  function qBody(pq) {
    return [pq.passage ? h("div", { class: "passage" }, pq.passage) : null, h("div", { class: "qtext" }, rich(pq.text)), tableView(pq.table), stemView(pq.stem)];
  }
  function badge(pass) { return h("span", { class: "pill " + (pass ? "ok" : "bad") }, pass ? "Lolos passing grade" : "Belum lolos passing grade"); }
  /** Batang skor subtes dengan garis ambang batas. dark = di atas kartu biru tua. */
  function subBar(sec, score, dark) {
    var p = passOf(sec.id), ok = score >= p;
    return h("div", { class: "sbar" },
      h("div", { class: "sbar-top" },
        h("span", { class: "sbar-name" }, h("b", null, sec.short), " " + sec.name),
        h("span", { class: "sbar-val" }, h("b", null, score), "/" + sec.max),
        h("span", { class: "sbar-st " + (ok ? "ok" : "bad") }, ok ? "Lolos" : "Kurang " + (p - score))),
      h("div", { class: "sbar-track", role: "img", "aria-label": sec.short + " " + score + " dari " + sec.max + ", ambang batas " + p },
        h("i", { class: "fill", style: "width:" + pct(score, sec.max) + "%" }),
        h("i", { class: "mark", style: "left:" + pct(p, sec.max) + "%" })));
  }
  function lastHistory() {
    var hist = S.history();
    return hist.length ? hist[hist.length - 1] : null;
  }

  // ---------- beranda ----------
  function resumeCard() {
    var sv = ui.saved;
    if (!sv) return null;
    var answered = sv.items.filter(function (i) { return i.chosen != null; }).length;
    return h("div", { class: "card resume" },
      h("div", null, h("b", null, sv.title + " belum selesai"),
        h("div", { class: "small muted" }, answered + " dari " + sv.items.length + " soal terjawab" + (sv.limit ? " · sisa waktu " + fmtTime(sv.limit - sv.elapsed, true) : ""))),
      h("div", { class: "row" },
        h("button", { class: "btn primary", type: "button", onclick: resume }, "Lanjutkan"),
        h("button", { class: "btn ghost", type: "button", onclick: function () { S.clearSession(); ui.saved = null; render(); } }, "Buang")));
  }
  function lastCard() {
    var x = lastHistory();
    if (!x) {
      return h("section", { class: "navy-card" },
        h("p", { class: "nc-kicker" }, "Belum ada tryout"),
        h("h2", { class: "nc-ttl" }, "Ukur kesiapan SKD Anda"),
        h("p", { class: "nc-text" }, "110 soal dalam 100 menit dengan layar seperti CAT BKN. Skor per subtes, lolos atau belum, dan pembahasan langsung muncul."),
        h("div", { class: "row" }, h("button", { class: "btn amber lg", type: "button", onclick: function () { go("tryout"); } }, "Mulai tryout")));
    }
    var hasUlas = !!S.ulas(x.t);
    return h("section", { class: "navy-card", "aria-labelledby": "nc-ttl" },
      h("p", { class: "nc-kicker", id: "nc-ttl" }, "Hasil terakhir · " + (x.p || "Simulasi CAT") + " · " + tglPendek(x.t)),
      h("div", { class: "nc-score" }, h("span", { class: "big" }, x.total), h("span", { class: "of" }, "/ 550"), badge(x.pass)),
      CFG.sections.map(function (sec) { return subBar(sec, x.s[sec.id] ? x.s[sec.id][0] : 0, true); }),
      h("p", { class: "nc-legend" }, h("i", { "aria-hidden": "true" }), "Garis putih = passing grade"),
      h("div", { class: "nc-actions" },
        hasUlas ? h("button", { class: "btn amber lg", type: "button", onclick: function () { openAttempt(x, "bahas"); } }, "Lihat pembahasan") : null,
        hasUlas ? h("button", { class: "btn outline-light lg", type: "button", onclick: function () { openAttempt(x, "hasil"); } }, "Hasil lengkap")
          : h("button", { class: "btn amber lg", type: "button", onclick: function () { go("tryout"); } }, "Tryout lagi")));
  }
  function histRow(x) {
    var can = !!S.ulas(x.t);
    var inner = [h("div", { class: "hr-l" }, h("b", null, x.p || "Simulasi CAT"), h("span", { class: "muted" }, tglPendek(x.t))),
      h("div", { class: "hr-r" }, h("b", { class: "num" }, x.total), h("span", { class: x.pass ? "ok-t" : "bad-t" }, x.pass ? "Lolos" : "Belum lolos"))];
    return can ? h("button", { class: "hist-row", type: "button", onclick: function () { openAttempt(x, "hasil"); } }, inner) : h("div", { class: "hist-row" }, inner);
  }
  function quickCard(ico, title, desc, onClick, href) {
    var kids = [icon(ico), h("span", { class: "q-t" }, h("b", null, title), h("span", null, desc))];
    return href ? h("a", { class: "quick", href: href, target: "_blank", rel: "noopener" }, kids) : h("button", { class: "quick", type: "button", onclick: onClick }, kids);
  }
  function viewHome() {
    var hist = S.history(), review = S.reviewIds().length, best = 0;
    hist.forEach(function (x) { best = Math.max(best, x.total); });
    return [
      h("div", { class: "greet" }, h("h1", null, "Halo, " + sapaan()), h("p", null, "Siap latihan SKD hari ini?")),
      h("div", { class: "stat2" },
        h("div", { class: "stat" }, h("span", { class: "l" }, "Tryout selesai"), h("span", { class: "v" }, hist.length)),
        h("div", { class: "stat" }, h("span", { class: "l" }, "Skor terbaik"), h("span", { class: "v" }, hist.length ? best : "–"))),
      resumeCard(),
      lastCard(),
      hist.length ? h("section", { class: "card" }, h("h2", null, "Riwayat tryout"),
        h("div", { class: "hist" }, hist.slice(-3).reverse().map(histRow)),
        h("button", { class: "btn block", type: "button", onclick: function () { go("riwayat"); } }, "Lihat semua riwayat")) : null,
      h("section", { class: "card" }, h("h2", null, "Mulai belajar"),
        h("div", { class: "quick-grid" },
          quickCard("ujian", "Tryout SKD", "110 soal · 100 menit · layar CAT", function () { go("tryout"); }),
          quickCard("latih", "Latihan per materi", "Koreksi langsung + pembahasan", function () { go("latihan"); }),
          quickCard("ulang", "Ulangi soal salah", review ? review + " soal menunggu" : "Belum ada", function () { go("ulang"); }),
          quickCard("audio", "Audio hafalan", "Per bagian, tanpa hitungan", null, "https://github.com/serfusion/cpns/releases?q=Audio+Hafalan"),
          quickCard("hitung", "Kalkulator formasi", "Peluang masuk SKB per formasi 2026", function () { go("kalkulator"); }),
          quickCard("formasi", "Strategi formasi", "S-1 Ilmu Komunikasi", function () { go("formasi"); }),
          quickCard("gaji", "Gaji & tunjangan", "Gaji pokok, tukin per instansi", function () { go("gaji"); }),
          quickCard("peta", "Peta materi", "Pola yang sering keluar", function () { go("peta"); }))),
      h("p", { class: "fine" }, "Ambang batas mengikuti KepmenPANRB 674/2026 untuk kebutuhan umum (TWK " + passOf("twk") + ", TIU " + passOf("tiu") + ", TKP " + passOf("tkp") + "), sama dengan 2024. Lulusan cumlaude dan diaspora memakai nilai kumulatif minimal 311 dengan TIU minimal 85.")
    ];
  }

  // ---------- tryout (paket) ----------
  function viewTryout() {
    var hist = S.history(), bestOf = {};
    hist.forEach(function (x) { var k = x.k || ""; if (!bestOf[k] || x.total > bestOf[k].total) bestOf[k] = x; });
    function paketCard(no, scale) {
      var info = paketInfo({ paket: no, scale: scale }), b = bestOf[info.kode];
      return h("article", { class: "paket" },
        h("div", { class: "pk-l" },
          h("b", null, info.title),
          h("span", { class: "muted small" }, (scale === "mini" ? "55 soal · 50 menit" : "110 soal · 100 menit") + (no === "acak" ? " · soal yang belum pernah dikerjakan didahulukan" : "")),
          b ? h("span", { class: "small" }, "Skor terbaik ", h("b", null, b.total), " · ", h("span", { class: b.pass ? "ok-t" : "bad-t" }, b.pass ? "Lolos" : "Belum lolos")) : h("span", { class: "small muted" }, "Belum dikerjakan")),
        h("button", { class: "btn " + (b ? "" : "primary"), type: "button", onclick: function () { prepTryout({ paket: no, scale: scale }); } }, b ? "Ulangi" : "Mulai"));
    }
    var setara = paketInfo({ paket: "setara", scale: "full" }), bS = bestOf[setara.kode];
    var V = validitas();
    var kartuSetara = h("section", { class: "card setara-card", "aria-labelledby": "setara-h" },
      h("div", { class: "row between" }, h("h2", { id: "setara-h" }, "Tryout Setara CAT"), h("span", { class: "tag ok" }, "paling mirip CAT asli")),
      h("p", { class: "small" }, "TWK 30 dan TKP 45 dari soal baru berkasus lebih panjang dengan kelima opsi sama panjang, jadi jawaban terbaik tidak bisa ditebak dari opsi terpanjang. TIU 35 tanpa hitungan berat (silogisme, penalaran induktif, analitis, deret, figural). 110 soal, 100 menit."),
      bS ? h("p", { class: "small" }, "Skor terbaik ", h("b", null, bS.total), " · ", h("span", { class: bS.pass ? "ok-t" : "bad-t" }, bS.pass ? "Lolos" : "Belum lolos")) : null,
      h("div", { class: "row" }, h("button", { class: "btn primary", type: "button", id: "btn-setara", onclick: function () { prepTryout({ paket: "setara", scale: "full" }); } }, bS ? "Ulangi" : "Mulai tryout setara CAT")),
      h("details", { class: "validitas" }, h("summary", null, h("b", null, "Seberapa mirip soal di aplikasi ini dengan CAT asli?")),
        h("ul", { class: "plain-list small" },
          h("li", null, "Soal CAT BKN rahasia dan diacak per peserta, jadi tidak ada yang bisa menjamin soal tertentu akan keluar. Soal di sini disusun sendiri mengikuti kisi-kisi resmi 2026 dan pola dari laporan peserta SKD 2024."),
          h("li", null, "Data BKN 2024: uji butir soal TKD menghasilkan komposisi mudah 39%, sedang 35%, sulit 26%. Pada SKD sekolah kedinasan 2024 hanya 65,9% peserta mencapai TWK 65 dan 66,3% mencapai TIU 80, sedangkan TKP 94,2%. TWK menjadi materi yang paling banyak menggugurkan peserta pada 2024."),
          h("li", null, "Audit bank soal aplikasi ini (dihitung langsung): jawaban terbaik adalah opsi terpanjang pada ", h("b", null, V.lama.tkp + "% soal TKP lama"), " dan ", h("b", null, V.lama.twk + "% soal TWK lama"), " (acak: 20%). Artinya soal lama lebih mudah daripada CAT asli; skor Paket latihan 1–6 cenderung lebih tinggi dari skor SKD sebenarnya."),
          h("li", null, "Soal setara CAT (" + V.setara.n + " soal): opsi terbaik paling panjang hanya di " + V.setara.pct + "% soal, kasus rata-rata " + V.setara.kata + " kata. Pakai skor tryout setara sebagai patokan utama."),
          h("li", null, "Target aman: skor tryout setara CAT minimal 400, dengan TWK dan TIU jauh di atas ambang (65 dan 80)."))));
    var list = [];
    for (var i = 1; i <= PAKET_N; i++) list.push(paketCard(i, "full"));
    return [
      h("div", { class: "page-head" }, h("h1", null, "Tryout SKD"),
        h("p", { class: "lede" }, "Layar ujian meniru CAT BKN: informasi ujian di atas, kotak nomor merah dan hijau, jawaban baru tersimpan setelah menekan Simpan dan Lanjutkan. Nilai dan pembahasan muncul setelah ujian selesai.")),
      resumeCard(),
      kartuSetara,
      h("div", { class: "info3" },
        h("div", null, h("b", null, "110"), h("span", null, "soal: TWK 30, TIU 35, TKP 45")),
        h("div", null, h("b", null, "100"), h("span", null, "menit")),
        h("div", null, h("b", null, passOf("twk") + "/" + passOf("tiu") + "/" + passOf("tkp")), h("span", null, "ambang batas"))),
      h("section", { class: "card" }, h("h2", null, "Paket latihan tetap"),
        h("p", { class: "small muted" }, "Soal, urutan, dan pilihan setiap paket selalu sama, jadi kenaikan skor bisa dibandingkan. Sebagian soal dapat muncul di lebih dari satu paket. Paket ini memakai bank soal lama yang lebih mudah dari CAT asli (lihat penjelasan Tryout Setara CAT)."),
        h("div", { class: "paket-list" }, list)),
      h("section", { class: "card" }, h("h2", null, "Variasi"),
        h("div", { class: "paket-list" }, paketCard("acak", "full"), paketCard(1, "mini")))
    ];
  }

  // ---------- validitas: isyarat panjang opsi pada bank soal (dihitung langsung) ----------
  var validitasCache = null;
  function validitas() {
    if (validitasCache) return validitasCache;
    var hit = { twk: [0, 0], tkp: [0, 0] }, st = { n: 0, panjang: 0, kata: 0 };
    (SKD.bankRaw || []).forEach(function (q) {
      if (!Array.isArray(q.o) || q.o.length !== 5) return;
      var best = q.sec === "tkp" ? 0 : q.a || 0, L = q.o.map(function (o) { return String(o).length; });
      var palingPanjang = L.every(function (x, i) { return i === best || x < L[best]; });
      if (q.v) { st.n++; if (palingPanjang) st.panjang++; st.kata += String(q.q).split(/\s+/).length; return; }
      if (hit[q.sec]) { hit[q.sec][1]++; if (palingPanjang) hit[q.sec][0]++; }
    });
    validitasCache = {
      lama: { twk: pct(hit.twk[0], hit.twk[1]), tkp: pct(hit.tkp[0], hit.tkp[1]) },
      setara: { n: st.n, pct: pct(st.panjang, st.n), kata: st.n ? Math.round(st.kata / st.n) : 0 }
    };
    return validitasCache;
  }

  // ---------- masuk (seperti halaman login CAT: nomor peserta + PIN) ----------
  function pinLatihan() {
    var n = S.nomorPeserta(), x = 7;
    for (var i = 0; i < n.length; i++) x = (x * 31 + n.charCodeAt(i)) % 1000000;
    return ("00000" + x).slice(-6);
  }
  function viewMasuk() {
    var p = ui.prep;
    var err = h("p", { class: "cat-err", id: "cat-err", role: "alert", hidden: true });
    var no = h("input", { class: "cat-in", id: "cat-no", name: "nomor", inputmode: "numeric", autocomplete: "off", maxlength: 20, value: S.nomorPeserta() });
    var pin = h("input", { class: "cat-in", id: "cat-pin", name: "pin", type: "password", inputmode: "numeric", autocomplete: "off", maxlength: 12, value: pinLatihan() });
    var lihat = h("button", { class: "cat-eye", type: "button", "aria-label": "Tampilkan PIN", "aria-pressed": "false", onclick: function () {
      var buka = pin.type === "password"; pin.type = buka ? "text" : "password";
      lihat.setAttribute("aria-pressed", buka ? "true" : "false"); lihat.textContent = buka ? "Sembunyikan" : "Lihat";
    } }, "Lihat");
    function masuk(e) {
      e.preventDefault();
      if (!no.value.trim() || !pin.value.trim()) { err.textContent = "Nomor Peserta dan PIN wajib diisi."; err.hidden = false; (no.value.trim() ? pin : no).focus(); return; }
      go("persiapan");
    }
    return h("div", { class: "cat-shell" },
      catBanner(),
      h("div", { class: "cat-page cat-login-page" },
        h("form", { class: "cat-login", onsubmit: masuk, "aria-labelledby": "cat-login-h", novalidate: true },
          h("div", { class: "cat-login-head" }, h("span", { class: "cat-lock", "aria-hidden": "true" }), h("h1", { id: "cat-login-h" }, "Login Peserta")),
          h("div", { class: "cat-login-body" },
            h("p", { class: "cat-login-sub" }, p.title.toUpperCase()),
            h("label", { class: "cat-field", for: "cat-no" }, "Nomor Peserta"), no,
            h("label", { class: "cat-field", for: "cat-pin" }, "PIN"), h("div", { class: "cat-pinrow" }, pin, lihat),
            err,
            h("button", { class: "cat-login-btn", id: "cat-login-btn", type: "submit" }, "LOGIN"),
            h("p", { class: "cat-hint" }, "Simulasi: nomor peserta dan PIN latihan sudah terisi, tekan LOGIN. Di lokasi ujian, PIN diberikan panitia."),
            h("button", { class: "cat-link", type: "button", onclick: function () { ui.prep = null; go("tryout"); } }, "Kembali ke daftar tryout")))),
      catFoot());
  }

  // ---------- konfirmasi data peserta (seperti halaman biodata CAT) ----------
  function viewPersiapan() {
    var p = ui.prep, nop = S.nomorPeserta();
    var row = function (k, v) { return h("tr", null, h("th", null, k), h("td", null, v)); };
    return h("div", { class: "cat-shell" },
      catBanner(),
      h("div", { class: "cat-page" },
        h("h1", { class: "cat-ttl" }, "Konfirmasi Data Peserta"),
        h("fieldset", { class: "cat-box" }, h("legend", null, "Informasi Ujian"),
          h("table", { class: "cat-kv" }, row("Nama Test", p.title.toUpperCase()), row("Kode Tes", p.kode), row("Jumlah Soal", p.scale === "mini" ? "55" : "110"), row("Waktu", (p.scale === "mini" ? 50 : 100) + " menit"))),
        h("fieldset", { class: "cat-box" }, h("legend", null, "Informasi Peserta"),
          h("table", { class: "cat-kv" }, row("Nama Peserta", (nama() || "PESERTA").toUpperCase()), row("Nomor Peserta", nop)),
          nama() ? null : h("p", { class: "small muted" }, "Isi nama Anda di Pengaturan agar tampil di layar ujian."),
          h("div", { class: "row" },
            h("button", { class: "cat-or", type: "button", id: "btn-start", onclick: startTryout }, "Mulai Ujian"),
            h("button", { class: "cat-or", type: "button", onclick: function () { ui.prep = null; go("tryout"); } }, "Batal"))),
        h("div", { class: "cat-tips" },
          h("b", null, "Cara menjawab seperti CAT BKN"),
          h("ul", null,
            h("li", null, "Pilih satu jawaban, lalu tekan Simpan dan Lanjutkan. Jawaban yang hanya diklik tanpa disimpan tidak terhitung."),
            h("li", null, "Kotak nomor merah berarti belum dijawab, hijau berarti sudah, beserta huruf jawaban Anda."),
            h("li", null, "Lewatkan soal ini untuk pindah tanpa menjawab. Tombol Selesai Ujian aktif setelah semua soal dijawab."),
            h("li", null, "Penilaian: TWK dan TIU benar 5, salah atau kosong 0; TKP bernilai 1 sampai 5, kosong 0. Tidak ada pengurangan nilai untuk jawaban salah, jadi jangan biarkan satu soal pun kosong."),
            h("li", null, "Nilai langsung muncul setelah selesai, sama seperti simulasi resmi di cat.bkn.go.id.")))),
      catFoot());
  }
  function catBanner() {
    return h("div", { class: "cat-banner" }, h("span", { class: "cat-logo", "aria-hidden": "true" }, "CAT"),
      h("span", { class: "cat-bt" }, "Simulasi Computer Assisted Test", h("small", null, "Latihan mandiri SKD CPNS")));
  }
  function catFoot() { return h("div", { class: "cat-foot" }, "Latihan mandiri meniru tata letak CAT BKN. Bukan aplikasi resmi BKN."); }

  // ---------- layar ujian CAT ----------
  function viewUjian() {
    var s = ui.session, total = s.items.length, it = s.items[s.cur];
    var answered = s.items.filter(function (i) { return i.chosen != null; }).length;
    var sel = ui.pending != null ? ui.pending : it.chosen, all = answered === total;
    var m = E.materi(it.pq.m), isFig = !!it.pq.opts[0].fig;
    var anim = ui.animCur !== s.cur; // animasi halus hanya saat nomor soal berganti, bukan saat memilih jawaban
    ui.animCur = s.cur;
    var nm = (nama() || "PESERTA").toUpperCase(), nop = S.nomorPeserta();

    var head = h("header", { class: "cat-head" },
      h("span", { class: "cat-logo sm", "aria-hidden": "true" }, "CAT"),
      h("table", { class: "cat-info" },
        h("thead", null, h("tr", null, h("th", null, "Nomor Peserta"), h("th", null, "Nama Peserta Ujian"), h("th", null, "Batas Waktu"),
          h("th", null, "Jumlah Soal"), h("th", { class: "g" }, "Soal Dijawab"), h("th", { class: "r" }, "Belum Dijawab"))),
        h("tbody", null, h("tr", null, h("td", null, nop), h("td", null, nm), h("td", null, Math.round(s.limit / 60) + " menit"),
          h("td", null, total), h("td", { class: "g" }, answered), h("td", { class: "r" }, total - answered)))),
      // ringkas untuk layar HP: identitas, kemajuan, tombol daftar soal
      h("div", { class: "cat-mid" },
        h("span", { class: "cat-mid-id" }, h("b", null, nop), " · " + nm),
        h("div", { class: "cat-mprog" },
          h("span", { class: "cat-mtrack", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": total, "aria-valuenow": answered, "aria-label": "Soal dijawab" },
            h("i", { style: "width:" + pct(answered, total) + "%" })),
          h("span", { class: "cat-mcount" }, h("b", { class: "g" }, answered), "/" + total + " dijawab"))),
      h("div", { class: "cat-right" },
        h("button", { class: "cat-end", type: "button", disabled: !all, title: all ? "Akhiri ujian" : "Aktif setelah semua soal dijawab", onclick: function () { catAskFinish(false); } }, "Selesai Ujian"),
        h("div", { class: "cat-clockbox" }, h("span", { class: "cat-clock-l" }, "Sisa Waktu"),
          h("div", { class: "cat-clock", id: "clock", role: "timer", "aria-label": "Sisa waktu" }, ""))),
      h("button", { class: "cat-mnav", type: "button", id: "cat-mnav", "aria-expanded": ui.navSheet ? "true" : "false", "aria-controls": "cat-nav",
        onclick: function () { ui.navSheet = !ui.navSheet; render(); } }, "Daftar Soal ", h("span", { class: "cat-mnav-n" }, (total - answered) + " belum")));

    var rv = !!it.revealed, tkp = it.pq.sec === "tkp";
    var opts = h("div", { class: "cat-opts" + (isFig ? " figs" : "") + (rv ? " rv" : ""), role: "radiogroup", "aria-label": "Pilihan jawaban" }, it.pq.opts.map(function (o, i) {
      var cls = "cat-opt" + (sel === i ? " on" : ""), tag = null;
      if (rv) {
        if (i === it.pq.best) { cls += " right"; tag = h("span", { class: "cat-tag ok" }, tkp ? "Nilai 5" : (it.chosen === i ? "Benar" : "Jawaban benar")); }
        else if (it.chosen === i) { cls += " wrong"; tag = h("span", { class: "cat-tag bad" }, tkp ? "Pilihan Anda, nilai " + o.pts : "Pilihan Anda"); }
      }
      return h("label", { class: cls },
        h("input", { type: "radio", name: "jawab", value: i, checked: sel === i, disabled: rv, onchange: function () { catPick(i); } }),
        h("span", { class: "cat-l" }, LET[i] + "."),
        o.fig ? figBox(o.fig) : h("span", { class: "cat-t" }, o.t), tag);
    }));
    var soal = h("section", { class: "cat-soal" },
      h("div", { class: "cat-sub" }, m ? (m.group ? m.group + " · " : "") + m.name : ""),
      h("fieldset", { class: "cat-q" + (anim ? " anim" : "") }, h("legend", null, "Soal No." + (s.cur + 1)),
        it.pq.passage ? h("div", { class: "passage" }, it.pq.passage) : null,
        h("div", { class: "qtext" }, rich(it.pq.text)), tableView(it.pq.table), stemView(it.pq.stem), opts,
        rv ? h("div", { class: "cat-koreksi", id: "cat-koreksi", role: "status" }, feedbackView(it)) : null),
      h("div", { class: "cat-actions" },
        h("button", { class: "cat-btn", type: "button", id: "btn-next", onclick: catSave }, rv ? (s.cur < total - 1 ? "Lanjut ke soal berikutnya" : "Lanjut") : "Simpan dan Lanjutkan"),
        rv ? null : h("button", { class: "cat-btn alt", type: "button", id: "btn-skip", onclick: catSkip }, "Lewatkan soal ini")),
      ui.pending != null && ui.pending !== it.chosen ? h("p", { class: "cat-note", role: "status" }, "Jawaban belum tersimpan. Tekan Simpan dan Lanjutkan.") : null);

    var pages = Math.ceil(total / NAV_PER_PAGE), pg = Math.min(ui.navPage, pages - 1), boxes = [];
    for (var i = pg * NAV_PER_PAGE; i < Math.min(total, (pg + 1) * NAV_PER_PAGE); i++) boxes.push(navBox(s, i));
    var tutupSheet = function () { ui.navSheet = false; render(); };
    var nav = h("aside", { class: "cat-nav" + (ui.navOn ? "" : " off") + (ui.navSheet ? " open" : ""), id: "cat-nav", "aria-label": "Navigasi nomor soal" },
      h("div", { class: "cat-sheet-head" }, h("b", null, "Daftar Soal"),
        h("span", { class: "cat-legend" }, h("i", { class: "un" }), "belum", h("i", { class: "ok" }), "sudah"),
        h("button", { class: "cat-sheet-x", type: "button", "aria-label": "Tutup daftar soal", onclick: tutupSheet }, "×")),
      ui.navOn ? h("div", { class: "cat-grid" }, boxes) : null,
      h("div", { class: "cat-pager" },
        h("button", { class: "cat-arrow", type: "button", "aria-label": "Nomor sebelumnya", disabled: pg <= 0, onclick: function () { ui.navPage = pg - 1; render(); } }, "‹"),
        h("span", { class: "small" }, (pg * NAV_PER_PAGE + 1) + "–" + Math.min(total, (pg + 1) * NAV_PER_PAGE)),
        h("button", { class: "cat-arrow", type: "button", "aria-label": "Nomor berikutnya", disabled: pg >= pages - 1, onclick: function () { ui.navPage = pg + 1; render(); } }, "›"),
        h("button", { class: "cat-switch" + (ui.navOn ? " on" : ""), type: "button", role: "switch", "aria-checked": ui.navOn ? "true" : "false", "aria-label": "Tampilkan navigasi", onclick: function () { ui.navOn = !ui.navOn; render(); } }, h("i"))),
      h("label", { class: "check small cat-belajar", title: "Setelah Simpan dan Lanjutkan, jawaban yang salah langsung dibenarkan di soal itu dan pembahasannya muncul di bawahnya. Matikan untuk simulasi seperti CAT asli." },
        h("input", { type: "checkbox", id: "mode-belajar", checked: modeBelajar(), onchange: function (e) {
          try { localStorage.setItem("skd.belajar", e.target.checked ? "1" : "0"); } catch (x) { /* abaikan */ }
        } }), h("span", null, h("b", null, "Mode belajar"), ": koreksi dan pembahasan langsung setelah Simpan. Matikan untuk simulasi seperti CAT asli.")),
      h("button", { class: "cat-link", type: "button", onclick: function () { catAskFinish(true); } }, "Akhiri sekarang (hanya di latihan)"));
    var sheetBg = ui.navSheet ? h("div", { class: "cat-sheet-bg", onclick: tutupSheet }) : null;
    return h("div", { class: "cat-shell cat-exam" + (ui.navSheet ? " sheet-open" : "") }, head, h("div", { class: "cat-main" }, soal, nav), sheetBg, catFoot());
  }
  function navBox(s, i) {
    var it = s.items[i], cls = "cat-no " + (it.chosen != null ? "ok" : "un") + (i === s.cur ? " cur" : "");
    return h("button", { class: cls, type: "button", "aria-label": "Soal " + (i + 1) + (it.chosen != null ? ", dijawab " + LET[it.chosen] : ", belum dijawab"), onclick: function () { ui.navSheet = false; goTo(i); } },
      h("span", { class: "n" }, i + 1), it.chosen != null ? h("span", { class: "a" }, LET[it.chosen]) : null);
  }

  // ---------- halaman nilai (seperti CAT) ----------
  function viewNilai() {
    var r = ui.result, sim = r.sim;
    var row = function (k, v, b) { return h("tr", null, h("th", null, k), h("td", null, b ? h("b", null, v) : v)); };
    return h("div", { class: "cat-shell" }, catBanner(),
      h("div", { class: "cat-page" },
        h("table", { class: "cat-nilai" }, h("tbody", null, h("tr", { class: "strip" }, h("td", { colspan: 2 })),
          row("NAMA TES", r.title.toUpperCase()), row("KODE TES", r.kode || "-"))),
        h("p", { class: "cat-cap" }, "Informasi Peserta"),
        h("table", { class: "cat-nilai" }, h("tbody", null, h("tr", { class: "strip" }, h("td", { colspan: 2 })),
          row("NAMA PESERTA", (nama() || "PESERTA").toUpperCase(), true), row("NO PESERTA", S.nomorPeserta(), true),
          row("TWK", sim.twk.scaled, true), row("TIU", sim.tiu.scaled, true), row("TKP", sim.tkp.scaled, true), row("Total Nilai", sim.total, true))),
        h("p", { class: "center" }, "Terimakasih sudah ikut serta dalam ujian"),
        h("div", { class: "row center" }, h("button", { class: "btn primary lg", type: "button", id: "btn-hasil", onclick: function () { go("hasil"); } }, "Lihat hasil dan pembahasan"))),
      catFoot());
  }

  // ---------- hasil ----------
  function analisisRows(sc) {
    var out = [];
    CFG.sections.forEach(function (sec) {
      var rows = [];
      CFG.materi.forEach(function (m) {
        var b = sc.materi[m.id];
        if (m.sec !== sec.id || !b || !b.n) return;
        var p = sec.id === "tkp" ? pct(b.pts, b.max) : pct(b.right, b.n);
        rows.push({ m: m, label: (m.group ? m.group + " · " : "") + m.name, p: p, d: sec.id === "tkp" ? "skor " + b.pts + "/" + b.max : b.right + "/" + b.n + " benar", n: b.n });
      });
      if (rows.length) out.push({ sec: sec, rows: rows });
    });
    return out;
  }
  function kuatLemah(sc) {
    var all = [];
    analisisRows(sc).forEach(function (g) { g.rows.forEach(function (r) { all.push(r); }); });
    var pool = all.filter(function (r) { return r.n >= 2; });
    if (!pool.length) pool = all;
    if (!pool.length) return null;
    var kuat = pool[0], lemah = pool[0];
    pool.forEach(function (r) { if (r.p > kuat.p) kuat = r; if (r.p < lemah.p) lemah = r; });
    return { kuat: kuat, lemah: lemah };
  }
  function analisisCard(sc) {
    return h("section", { class: "card" }, h("h2", null, "Analisis per topik"),
      analisisRows(sc).map(function (g) {
        return h("div", { class: "an-grp" }, h("p", { class: "an-sec" }, h("b", null, g.sec.short), " " + g.sec.name),
          g.rows.map(function (r) {
            return h("div", { class: "an-row" }, h("div", { class: "an-top" }, h("span", null, r.label), h("span", null, h("b", null, r.p + "%"), " · " + r.d)),
              h("div", { class: "an-track" }, h("i", { style: "width:" + r.p + "%" })));
          }));
      }));
  }
  function viewHasil() {
    var r = ui.result, sim = r.sim, sc = sim.sc, tryout = r.kind === "tryout";
    var real = r.items.filter(function (i) { return !i.retry; });
    var missIds = real.filter(function (i) { return isMiss(i) && i.pq.id; }).map(function (i) { return i.pq.id; });
    var head;
    if (tryout) {
      head = h("section", { class: "card" },
        h("p", { class: "small muted" }, r.title + " · " + tglPanjang(r.at)),
        h("h1", null, "Hasil tryout"),
        h("p", { class: "small muted" }, "Total skor"),
        h("div", { class: "score-line" }, h("span", { class: "big" }, sim.total), h("span", { class: "of" }, "/ 550")),
        badge(sim.pass),
        h("table", { class: "res-tab" },
          h("thead", null, h("tr", null, h("th", null, "Subtes"), h("th", { class: "n" }, "Skor"), h("th", { class: "n" }, "Batas"))),
          h("tbody", null, CFG.sections.map(function (sec) {
            var v = sim[sec.id];
            return h("tr", null, h("td", null, h("b", null, sec.short), " " + sec.name), h("td", { class: "n" }, h("b", null, v.scaled), " / " + sec.max),
              h("td", { class: "n " + (v.ok ? "ok-t" : "bad-t") }, passOf(sec.id)));
          }))),
        h("p", { class: "small muted" }, sc.answered + " dari " + sc.count + " soal dijawab · " + Math.round(r.elapsed / 60) + " menit" + (r.scale === "mini" ? " · paket setengah disetarakan ke skala penuh" : "") + (r.auto ? " · waktu habis" : "")));
    } else {
      var obj = sc.sec.twk.n + sc.sec.tiu.n, objRight = sc.sec.twk.right + sc.sec.tiu.right, tk = sc.sec.tkp;
      head = h("section", { class: "card" }, h("p", { class: "small muted" }, r.title), h("h1", null, "Hasil latihan"),
        obj ? h("div", { class: "score-line" }, h("span", { class: "big" }, objRight), h("span", { class: "of" }, "/ " + obj + " benar")) : null,
        tk.n ? h("p", null, "TKP rata-rata ", h("b", null, tk.answered ? dec(tk.pts / tk.answered) : "0"), " dari 5 poin") : null,
        h("p", { class: "small muted" }, "Waktu " + fmtTime(r.elapsed) + (sc.answered ? ", rata-rata " + Math.round(r.elapsed / sc.answered) + " detik per soal. Target ujian sekitar 54 detik per soal." : "")));
    }
    return [
      head,
      h("div", { class: "row wrap-btns" },
        h("button", { class: "btn amber", type: "button", onclick: function () { go("bahas"); } }, "Lihat pembahasan"),
        tryout ? h("button", { class: "btn primary", type: "button", onclick: function () { go("lembar"); } }, "Lembar hasil") : null,
        missIds.length ? h("button", { class: "btn", type: "button", onclick: function () { startReview(missIds, "Ulangi soal yang salah"); } }, "Ulangi " + Math.min(30, missIds.length) + " soal salah") : null,
        h("button", { class: "btn ghost", type: "button", onclick: function () { go(tryout ? "tryout" : "latihan"); } }, tryout ? "Tryout lagi" : "Latihan lagi")),
      analisisCard(sc)
    ];
  }

  // ---------- pembahasan ----------
  function viewBahas() {
    var r = ui.result, items = r.items.filter(function (i) { return !i.retry; });
    var f = ui.rvFilter, counts = { semua: items.length, salah: 0, benar: 0 };
    items.forEach(function (it) { if (isMiss(it)) counts.salah++; else counts.benar++; });
    if (f === "salah" && !counts.salah) f = "semua";
    var shown = items.map(function (it, i) { return { it: it, no: i + 1 }; }).filter(function (x) { return f === "semua" || (f === "salah") === isMiss(x.it); });
    function chip(v, label) {
      return h("button", { class: "chip", type: "button", "aria-pressed": f === v ? "true" : "false", onclick: function () { ui.rvFilter = v; render(); } }, label, h("span", { class: "n" }, counts[v]));
    }
    return [
      h("div", { class: "page-head" }, h("button", { class: "back", type: "button", onclick: function () { go("hasil"); } }, "‹ Hasil"),
        h("h1", null, "Pembahasan"), h("p", { class: "lede" }, r.title)),
      h("div", { class: "chips" }, chip("salah", "Salah atau kosong"), chip("benar", "Benar"), chip("semua", "Semua")),
      h("div", { class: "rv" }, shown.map(function (x) {
        return h("article", { class: "rv-item" },
          h("div", { class: "qhead" }, h("span", { class: "no" }, "No. " + x.no), qHeadTags(x.it)),
          qBody(x.it.pq), optsView(x.it, true, null), feedbackView(x.it));
      }))
    ];
  }

  // ---------- lembar hasil (gambar) ----------
  function lembarData() {
    var r = ui.result, sim = r.sim, kl = kuatLemah(sim.sc);
    return {
      title: r.title, date: tglPendek(r.at), total: sim.total, pass: sim.pass, answered: sim.sc.answered, n: sim.sc.count,
      minutes: Math.max(1, Math.round(r.elapsed / 60)), app: CFG.appName,
      rows: CFG.sections.map(function (sec) { return { code: sec.short, name: sec.name.replace(/^Tes /, ""), score: sim[sec.id].scaled, max: sec.max, batas: passOf(sec.id) }; }),
      kuat: kl ? kl.kuat.m.name + " " + kl.kuat.p + "%" : "-", lemah: kl ? kl.lemah.m.name + " " + kl.lemah.p + "%" : "-"
    };
  }
  function viewLembar() {
    var cv = h("canvas", { class: "sheet", width: 1080, height: 1350, role: "img", "aria-label": "Lembar hasil tryout" });
    var d = lembarData();
    var ready = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load("800 100px 'Plus Jakarta Sans'"), document.fonts.load("500 30px 'Plus Jakarta Sans'")]) : Promise.resolve();
    ready.then(function () { SKD.lembar.draw(cv, d); }, function () { SKD.lembar.draw(cv, d); });
    function simpan(share) {
      var data = cv.toDataURL("image/png"), name = "lembar-hasil-" + d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".png";
      if (window.AndroidBridge && window.AndroidBridge.saveImage) {
        var res = window.AndroidBridge.saveImage(data.split(",")[1], name, !!share);
        toast(res === "ok" ? (share ? "Membuka menu bagikan." : "Tersimpan di Galeri, folder Latihan SKD.") : "Belum bisa menyimpan di perangkat ini. Ambil tangkapan layar.");
        return;
      }
      var a = h("a", { href: data, download: name });
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast("Gambar diunduh.");
    }
    return [
      h("div", { class: "page-head" }, h("button", { class: "back", type: "button", onclick: function () { go("hasil"); } }, "‹ Hasil"),
        h("h1", null, "Lembar hasil"), h("p", { class: "lede" }, "Simpan sebagai gambar untuk dibagikan atau dibandingkan dengan tryout berikutnya.")),
      h("div", { class: "sheet-wrap" }, cv),
      h("div", { class: "row wrap-btns" },
        h("button", { class: "btn primary", type: "button", onclick: function () { simpan(false); } }, "Simpan gambar"),
        window.AndroidBridge ? h("button", { class: "btn", type: "button", onclick: function () { simpan(true); } }, "Bagikan") : null)
    ];
  }

  // ---------- latihan ----------
  // ---------- fokus TWK + TKP (TIU cukup aman lewat soal tanpa hitungan berat) ----------
  var TIU_LUNAK = ["sil", "ind", "anl", "der", "fig-ana", "fig-seri", "fig-mat", "fig-kubus"];
  var TARGET = { twk: 110, tiu: 85, tkp: 200 };
  function fokusCard() {
    var ids = function (sec) { return CFG.materi.filter(function (m) { return m.sec === sec; }).map(function (m) { return m.id; }); };
    var lunak = CFG.materi.filter(function (m) { return TIU_LUNAK.indexOf(m.id) >= 0; });
    var nLunak = lunak.reduce(function (a, m) { return a + m.quota; }, 0), tiuSec = E.section("tiu");
    var hist = S.history().filter(function (x) { return x.s && x.s.twk; }), last = hist[hist.length - 1];
    function cell(sec) {
      var info = E.section(sec), tgt = TARGET[sec], min = passOf(sec), v = last ? last.s[sec][0] : null;
      return h("div", null, h("span", null, info.short + " · target " + tgt),
        h("b", { class: v == null ? "" : v >= tgt ? "ok-t" : v >= min ? "warn-t" : "bad-t" }, v == null ? "–" : String(v)),
        h("span", null, "ambang " + min));
    }
    var lunakAcc = null;
    if (last && last.m) {
      var r = 0, n = 0;
      TIU_LUNAK.forEach(function (id) { var b = last.m[id]; if (b) { r += b[0]; n += b[1]; } });
      if (n) lunakAcc = Math.round((r / n) * 100);
    }
    return h("section", { class: "card stack fokus" },
      h("h2", null, "Fokus Anda: kuatkan TWK dan TKP"),
      h("p", { class: "small" }, "Ambang batas TIU " + passOf("tiu") + " berarti cukup " + Math.ceil(passOf("tiu") / 5) + " benar dari " + tiuSec.count + " soal. Sebanyak " + nLunak +
        " soal TIU tidak butuh hitungan berat (silogisme, penalaran induktif, analitis, deret, dan figural), jadi amankan TIU dari soal-soal itu dan kejar skor dari TWK dan TKP."),
      h("div", { class: "info3" }, cell("twk"), cell("tiu"), cell("tkp")),
      h("p", { class: "small muted" }, last ? "Angka di atas dari tryout terakhir (" + last.p + ")." + (lunakAcc != null ? " Ketepatan soal TIU tanpa hitungan berat: " + lunakAcc + "%." : "") : "Kerjakan satu tryout untuk melihat posisi Anda terhadap target."),
      h("div", { class: "row wrap" },
        h("button", { class: "btn primary", type: "button", id: "btn-fokus-hots", onclick: function () {
          startPractice({ materi: ids("twk").concat(ids("tkp")), n: 30, hot: false, baru: true, title: "Fokus TWK + TKP HOTS 2026" }); } }, "TWK + TKP HOTS (30 soal)"),
        h("button", { class: "btn", type: "button", id: "btn-fokus-all", onclick: function () {
          startPractice({ materi: ids("twk").concat(ids("tkp")), n: 50, hot: false, title: "Fokus TWK + TKP" }); } }, "TWK + TKP campuran (50 soal)"),
        h("button", { class: "btn", type: "button", id: "btn-tiu-lunak", onclick: function () {
          startPractice({ materi: lunak.map(function (m) { return m.id; }), n: 20, hot: false, title: "TIU tanpa hitungan berat" }); } }, "TIU tanpa hitungan berat (20 soal)")),
      h("p", { class: "small muted" }, "Saat ujian: kerjakan soal TIU yang tidak butuh hitungan lebih dulu, tekan \"Lewatkan soal ini\" untuk soal hitungan panjang, lalu kembali bila waktu tersisa."));
  }
  // ---------- sangat sering keluar (boleh diulang) dan soal acak (selalu baru) ----------
  var TIU_SANGAT = ["sil", "ind", "anl", "fig-mat"];
  function idsOf(sec) { return CFG.materi.filter(function (m) { return m.sec === sec; }).map(function (m) { return m.id; }); }
  function pracBtn(id, label, o, primary) {
    return h("button", { class: "btn" + (primary ? " primary" : ""), type: "button", id: id, onclick: function () { startPractice(o); } }, label);
  }
  function seringCard() {
    function n(list) { return list.reduce(function (a, id) { return a + E.poolOf(id).filter(function (q) { return q.sangat; }).length; }, 0); }
    var twk = idsOf("twk"), tkp = idsOf("tkp");
    return h("section", { class: "card stack" },
      h("h2", null, "Sangat sering keluar: boleh diulang-ulang"),
      h("p", { class: "small" }, "Pola yang tercantum di kisi-kisi 2026 (KepmenPANRB 674/2026) dan dilaporkan peserta di tiga laporan atau lebih (SKD CPNS 2024). Isinya: penerapan sila dan isi pasal, BPUPKI/PPKI dan sikap tokohnya, peristiwa sesudah kemerdekaan, lembaga negara, organisasi pergerakan, netralitas ASN, nasionalisme di media sosial, inti kalimat, kata bercetak miring, simpulan bacaan, silogisme, susunan duduk dan antrean, pola 9 kotak (penalaran matriks), menempatkan diri antara kesibukan dan pekerjaan, spionase, inovasi TIK dan rekan gaptek, serta penerapan BerAKHLAK. Ditambah penalaran induktif, materi baru 2026 yang pasti diujikan. Analogi kata tidak lagi masuk kisi-kisi 2026, jadi dikeluarkan dari set ini."),
      h("div", { class: "info3" },
        h("div", null, h("span", null, "TWK"), h("b", null, n(twk) + "+"), h("span", null, "soal + acak")),
        h("div", null, h("span", null, "TIU tanpa hitungan"), h("b", null, n(TIU_SANGAT) + "+"), h("span", null, "soal + acak")),
        h("div", null, h("span", null, "TKP"), h("b", null, String(n(tkp))), h("span", null, "soal"))),
      h("div", { class: "row wrap" },
        pracBtn("btn-sangat-mix", "Campuran tanpa hitungan (30 soal)", { materi: twk.concat(TIU_SANGAT).concat(tkp), n: 30, sangat: true, title: "Sangat sering keluar: campuran tanpa hitungan" }, true),
        pracBtn("btn-sangat-twk", "TWK (20 soal)", { materi: twk, n: 20, sangat: true, title: "Sangat sering keluar: TWK" }),
        pracBtn("btn-sangat-tkp", "TKP (" + Math.min(20, n(tkp)) + " soal)", { materi: tkp, n: 20, sangat: true, title: "Sangat sering keluar: TKP" }),
        pracBtn("btn-sangat-tiu", "TIU tanpa hitungan (15 soal)", { materi: TIU_SANGAT, n: 15, sangat: true, title: "Sangat sering keluar: TIU tanpa hitungan" })),
      h("p", { class: "small muted" }, "Soal yang sudah Anda kuasai muncul paling akhir, jadi setiap putaran mendahulukan yang belum dikuasai."));
  }
  // ---------- soal tambahan sesuai kisi-kisi 2026 (KepmenPANRB 674/2026) ----------
  var TIU_LOGIKA = ["sil", "ind", "anl"];
  function kisi26Card() {
    function n(list) { return list.reduce(function (a, id) { return a + E.poolOf(id).filter(function (q) { return q.k26; }).length; }, 0); }
    var twk = idsOf("twk"), tkp = idsOf("tkp");
    return h("section", { class: "card stack" },
      h("h2", null, "Soal baru kisi-kisi 2026"),
      h("p", { class: "small" }, "Disusun dari rumusan resmi KepmenPANRB 674/2026 dan pola soal CPNS 2024: empat konsensus kebangsaan berupa analisis kasus, nasionalisme, integritas, dan bela negara versi 2026, bahasa Indonesia untuk menilai informasi, TKP dengan penekanan baru tiap aspek, serta TIU logika (silogisme diperluas, penalaran induktif, dan analitis memilih tim dari syarat)."),
      h("div", { class: "info3" },
        h("div", null, h("span", null, "TWK"), h("b", null, String(n(twk))), h("span", null, "soal")),
        h("div", null, h("span", null, "TIU logika"), h("b", null, String(n(TIU_LOGIKA.concat(["pk"])))), h("span", null, "soal")),
        h("div", null, h("span", null, "TKP"), h("b", null, String(n(tkp))), h("span", null, "soal"))),
      h("div", { class: "row wrap" },
        pracBtn("btn-k26-mix", "Campuran 2026 (30 soal)", { materi: twk.concat(TIU_LOGIKA).concat(tkp), n: 30, k26: true, title: "Kisi-kisi 2026: campuran" }, true),
        pracBtn("btn-k26-twk", "TWK 2026 (20 soal)", { materi: twk, n: 20, k26: true, title: "Kisi-kisi 2026: TWK" }),
        pracBtn("btn-k26-tkp", "TKP 2026 (20 soal)", { materi: tkp, n: 20, k26: true, title: "Kisi-kisi 2026: TKP" }),
        pracBtn("btn-k26-tiu", "TIU logika 2026 (15 soal)", { materi: TIU_LOGIKA, n: 15, k26: true, title: "Kisi-kisi 2026: TIU logika" })),
      h("p", { class: "small muted" }, "Soal analitis memilih tim juga dibangkitkan acak tanpa batas lewat tombol TIU tanpa hitungan acak di bawah."));
  }
  function acakCard() {
    var F = SKD.fakta;
    return h("section", { class: "card stack" },
      h("h2", null, "Soal acak: selalu berbeda"),
      h("p", { class: "small" }, "Dibangkitkan setiap kali dari tabel fakta yang sudah diperiksa: 45 butir Pancasila, " + F.wewenang.length + " wewenang lembaga negara, " +
        F.pasal.length + " pasal UUD, sejarah BPUPKI, PPKI, proklamasi, dan pergerakan nasional, " + F.hari.length + " hari nasional, " + F.baku.length +
        " pasang kata baku. TIU tanpa hitungan: silogisme (termasuk bentuk diperluas 2026), susunan duduk dan antrean, memilih anggota tim dari syarat dan batasan, serta penalaran matriks (pola 9 kotak); kuncinya diperiksa otomatis ke semua kemungkinan. Kebanyakan berbentuk kasus, seperti laporan peserta 2024. Analogi kata acak (kisi-kisi 2024) masih ada di menu Latihan."),
      h("div", { class: "row wrap" },
        pracBtn("btn-acak-twk", "TWK acak (20 soal)", { materi: ["pilar", "nas", "bind"], n: 20, acak: true, title: "TWK acak" }, true),
        pracBtn("btn-acak-pilar", "Pancasila, UUD, lembaga (15 soal)", { materi: ["pilar"], n: 15, acak: true, title: "Pilar negara acak" }),
        pracBtn("btn-acak-sil", "Silogisme acak (10 soal)", { materi: ["sil"], n: 10, acak: true, title: "Silogisme acak" }),
        pracBtn("btn-acak-mat", "Penalaran matriks acak (10 soal)", { materi: ["fig-mat"], n: 10, acak: true, title: "Penalaran matriks acak" }),
        pracBtn("btn-acak-anl", "Susunan duduk dan antrean acak (10 soal)", { materi: ["anl"], n: 10, acak: true, title: "Analitis acak" }),
        pracBtn("btn-acak-tiu", "TIU tanpa hitungan acak (20 soal)", { materi: ["sil", "anl", "fig-mat"], n: 20, acak: true, title: "TIU tanpa hitungan acak" })));
  }
  function viewLatihan() {
    var st = ui.setup, mixed = st.sec === "mix";
    var mats = CFG.materi.filter(function (m) { return mixed || m.sec === st.sec; });
    var chosen = mats.filter(function (m) { return mixed || !st.off[m.id]; });
    var stock = 0, unlimited = false, baruOn = !!st.baru && (st.sec === "twk" || st.sec === "tkp");
    var filt = { hot: st.hot, sangat: st.sangat, baru: baruOn };
    chosen.forEach(function (m) {
      if (E.canGen(m, filt)) unlimited = true;
      stock += E.poolOf(m.id).filter(function (q) { return E.lolos(q, filt); }).length;
    });
    function seg(val, label) {
      return h("button", { type: "button", "aria-pressed": st.sec === val ? "true" : "false", onclick: function () { st.sec = val; render(); } }, label);
    }
    function nBtn(n) { return h("button", { type: "button", "aria-pressed": st.n === n ? "true" : "false", onclick: function () { st.n = n; render(); } }, n + " soal"); }
    var secName = mixed ? "campuran" : E.section(st.sec).short;
    return [
      h("div", { class: "page-head" }, h("h1", null, "Latihan per materi"), h("p", { class: "lede" }, "Setiap jawaban langsung dikoreksi: yang salah merah, jawaban benar hijau, lalu pembahasan muncul.")),
      resumeCard(),
      fokusCard(),
      kisi26Card(),
      seringCard(),
      acakCard(),
      h("section", { class: "card stack" },
        h("div", { class: "field" }, h("span", { class: "label" }, "Subtes"),
          h("div", { class: "seg", role: "group", "aria-label": "Subtes" }, seg("twk", "TWK"), seg("tiu", "TIU"), seg("tkp", "TKP"), seg("mix", "Campuran"))),
        mixed
          ? h("p", { class: "small muted" }, "Campuran mengambil soal dari ketiga subtes dengan perbandingan seperti ujian (30 : 35 : 45).")
          : h("div", { class: "field" }, h("span", { class: "label" }, "Materi"),
            h("div", { class: "chips" }, mats.map(function (m) {
              return h("button", { class: "chip", type: "button", "aria-pressed": st.off[m.id] ? "false" : "true", onclick: function () { st.off[m.id] = !st.off[m.id]; render(); } },
                m.name, h("span", { class: "n" }, m.gen >= 1 ? "∞" : E.poolOf(m.id).length + (m.gen ? "+" : "")));
            }))),
        h("div", { class: "field" }, h("span", { class: "label" }, "Jumlah soal"),
          h("div", { class: "seg", role: "group", "aria-label": "Jumlah soal" }, nBtn(10), nBtn(20), nBtn(30), nBtn(50))),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "opt-hot", checked: st.hot, onchange: function (e) { st.hot = e.target.checked; render(); } }),
          h("span", null, h("b", null, "Soal prioritas saja. "), "Hanya pola soal yang sering dilaporkan keluar oleh peserta.")),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "opt-sangat", checked: !!st.sangat, onchange: function (e) { st.sangat = e.target.checked; render(); } }),
          h("span", null, h("b", null, "Sangat sering keluar saja. "), "Pola yang dilaporkan di tiga laporan peserta atau lebih. Cocok untuk diulang-ulang.")),
        st.sec === "twk" || st.sec === "tkp" ? h("label", { class: "check" }, h("input", { type: "checkbox", id: "opt-baru", checked: !!st.baru, onchange: function (e) { st.baru = e.target.checked; render(); } }),
          h("span", null, h("b", null, (st.sec === "twk" ? "TWK" : "TKP") + " HOTS 2026 saja. "), st.sec === "twk"
            ? "Soal kasus panjang dengan pilihan mirip dan konteks terkini (KUHP baru, putusan MK, keamanan siber, deepfake, EYD V)."
            : "Kasus panjang dengan pilihan yang mirip-mirip untuk keenam aspek TKP (pelayanan publik, jejaring kerja, sosial budaya, TIK, profesionalisme, anti radikalisme).")) : null,
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "opt-requeue", checked: S.settings().requeue, onchange: function (e) { S.setFlag("requeue", e.target.checked); } }),
          h("span", null, h("b", null, "Ulangi yang salah sampai benar. "), "Soal yang dijawab salah muncul lagi beberapa soal kemudian dengan pilihan diacak ulang.")),
        h("div", { class: "row" },
          h("button", {
            class: "btn primary lg", type: "button", id: "btn-start", disabled: !chosen.length,
            onclick: function () { startPractice({ materi: chosen.map(function (m) { return m.id; }), n: st.n, hot: st.hot, sangat: st.sangat, baru: baruOn, title: "Latihan " + secName + (baruOn ? " HOTS 2026" : "") + (st.sangat ? " sangat sering keluar" : st.hot ? " prioritas" : "") }); }
          }, "Mulai latihan"),
          h("span", { class: "small muted" }, chosen.length ? "Tersedia " + stock + " soal bank" + (unlimited ? " + soal acak yang dibangkitkan otomatis." : ".") : "Pilih minimal satu materi."))),
      h("section", { class: "card" }, h("h2", null, "Langsung per materi"),
        CFG.sections.map(function (sec) {
          var ms = CFG.materi.filter(function (m) { return m.sec === sec.id; });
          return h("div", { class: "mat-grp" }, h("p", { class: "an-sec" }, h("b", null, sec.short), " " + sec.name),
            h("div", { class: "chips" }, ms.map(function (m) {
              return h("button", { class: "chip", type: "button", onclick: function () { startPractice({ materi: [m.id], n: 10, hot: false, title: "Latihan " + m.name }); } }, m.name);
            })));
        }))
    ];
  }

  // ---------- layar latihan ----------
  function numClass(s, it, i) {
    var c = "numb";
    if (i === s.cur) c += " cur";
    if (it.retry) c += " rt";
    if (it.done) c += it.pts === 5 ? " ok" : it.pq.sec === "tkp" && it.pts === 4 ? " mid" : " bad";
    return c;
  }
  function viewKerjakan() {
    var s = ui.session, it = s.items[s.cur], total = s.items.length;
    var answered = s.items.filter(function (i) { return i.chosen != null; }).length;
    var right = s.items.filter(function (i) { return i.done && i.pts === 5; }).length;
    var reveal = it.done, last = s.cur === total - 1;
    var bar = h("div", { class: "catbar" },
      h("div", { class: "ttl" }, s.title),
      h("div", { class: "cat-info2" },
        h("div", null, h("span", null, "Soal"), h("b", null, s.cur + 1 + " / " + total)),
        h("div", null, h("span", null, "Benar"), h("b", null, right + " / " + answered)),
        h("div", null, h("span", null, "Waktu"), h("b", { id: "clock" }, ""))),
      h("button", { class: "btn sm", type: "button", onclick: askEndPractice }, "Akhiri"));
    var actions = [
      it.done
        ? h("button", { class: "btn primary", id: "btn-next", type: "button", onclick: next }, last && answered === total ? "Lihat hasil" : "Soal berikutnya")
        : h("button", { class: "btn", type: "button", onclick: next }, "Lewati"),
      s.cur > 0 ? h("button", { class: "btn ghost", type: "button", onclick: function () { goTo(s.cur - 1); } }, "Sebelumnya") : null
    ];
    var card = h("section", { class: "qcard" },
      h("div", { class: "qhead" }, h("span", { class: "no" }, "Soal No. " + (s.cur + 1)), qHeadTags(it)),
      qBody(it.pq), optsView(it, reveal, reveal ? null : choose), h("div", { class: "qactions" }, actions), reveal ? feedbackView(it) : null);
    var wide = window.matchMedia("(min-width: 901px)").matches;
    var rail = h("details", { class: "rail", open: ui.railOpen == null ? wide : ui.railOpen, ontoggle: function () { ui.railOpen = rail.open; } },
      h("summary", null, "Nomor soal", h("span", { class: "tw" }, answered + " dari " + total + " dijawab")),
      h("div", { class: "rail-body" }, h("div", { class: "nums" }, s.items.map(function (x, i) {
        return h("button", { class: numClass(s, x, i), type: "button", "aria-label": "Soal " + (i + 1), "aria-current": i === s.cur ? "true" : null, onclick: function () { goTo(i); } }, i + 1);
      })), h("div", { class: "legend" }, h("span", null, h("i", { class: "ok" }), "Benar / 5 poin"), h("span", null, h("i", { class: "mid" }), "4 poin"), h("span", null, h("i", { class: "bad" }), "Salah"), h("span", null, h("i"), "Belum"))));
    return [bar, h("div", { class: "quiz" }, card, rail)];
  }

  // ---------- ulangi salah ----------
  function viewUlang() {
    var all = S.reviewIds(), bySec = {};
    CFG.sections.forEach(function (s) { bySec[s.id] = S.reviewIds(s.id); });
    if (!all.length) {
      return [h("div", { class: "page-head" }, h("h1", null, "Ulangi soal salah"),
        h("p", { class: "lede" }, "Belum ada soal yang perlu diulang. Soal yang Anda jawab salah saat latihan atau tryout terkumpul di sini dan keluar dari daftar setelah dijawab benar.")),
        h("div", { class: "row" }, h("button", { class: "btn primary", type: "button", onclick: function () { go("latihan"); } }, "Mulai latihan"))];
    }
    return [
      h("div", { class: "page-head" }, h("h1", null, "Ulangi soal salah"),
        h("p", { class: "lede" }, "Berisi soal yang terakhir kali dijawab salah (TKP: 3 poin atau kurang). Soal keluar dari daftar setelah dijawab benar.")),
      resumeCard(),
      h("div", { class: "stat4" },
        h("div", { class: "stat" }, h("span", { class: "l" }, "Perlu diulang"), h("span", { class: "v" }, all.length)),
        CFG.sections.map(function (s) { return h("div", { class: "stat" }, h("span", { class: "l" }, s.short), h("span", { class: "v" }, bySec[s.id].length)); })),
      h("div", { class: "row wrap-btns" },
        h("button", { class: "btn primary lg", type: "button", id: "btn-start", onclick: function () { startReview(all, "Ulangi soal salah"); } }, "Ulangi " + Math.min(30, all.length) + " soal terbaru"),
        CFG.sections.map(function (s) {
          return bySec[s.id].length ? h("button", { class: "btn", type: "button", onclick: function () { startReview(bySec[s.id], "Ulangi " + s.short); } }, "Hanya " + s.short) : null;
        }))
    ];
  }

  // ---------- riwayat & statistik ----------
  function viewRiwayat() {
    var ms = S.materiStats(), hist = S.history(), groups = [];
    CFG.sections.forEach(function (sec) {
      var rows = CFG.materi.filter(function (m) { return m.sec === sec.id && ms[m.id].seen; }).map(function (m) {
        var st = ms[m.id], p = sec.id === "tkp" ? pct(st.pts, st.seen * 5) : pct(st.right, st.seen);
        return h("div", { class: "an-row" },
          h("div", { class: "an-top" }, h("span", null, (m.group ? m.group + " · " : "") + m.name),
            h("span", null, h("b", null, p + "%"), " · " + (sec.id === "tkp" ? dec(st.pts / st.seen) + " poin rata-rata" : st.right + "/" + st.seen + " benar"))),
          h("div", { class: "an-track" }, h("i", { style: "width:" + p + "%" })));
      });
      if (rows.length) groups.push(h("div", { class: "an-grp" }, h("p", { class: "an-sec" }, h("b", null, sec.short), " " + sec.name), rows));
    });
    return [
      h("div", { class: "page-head" }, h("h1", null, "Riwayat & statistik"),
        h("p", { class: "lede" }, "Progres tersimpan di perangkat ini" + (S.cloudState() === "aktif" ? " dan tersinkron ke akun Anda." : "."))),
      h("section", { class: "card" }, h("h2", null, "Riwayat tryout"),
        hist.length ? h("div", { class: "hist" }, hist.slice().reverse().map(histRow)) : h("p", { class: "muted" }, "Belum ada tryout yang selesai."),
        hist.length ? h("p", { class: "small muted" }, "Pembahasan tersimpan untuk 3 tryout terakhir di perangkat ini.") : null),
      h("section", { class: "card" }, h("h2", null, "Akurasi per materi"),
        groups.length ? groups : h("p", { class: "muted" }, "Belum ada data. Kerjakan latihan atau tryout dulu."))
    ];
  }

  // ---------- peta materi ----------
  function viewPeta() {
    var R = CFG.riset;
    return [
      h("div", { class: "page-head" }, h("h1", null, "Peta materi"),
        h("p", { class: "lede" }, "Soal CAT rahasia dan diacak untuk tiap peserta, jadi yang bisa dipetakan adalah materi kisi-kisi dan pola yang paling sering dilaporkan peserta. Bank soal di sini ditimbang ke pola itu.")),
      h("section", { class: "card" }, h("h2", null, "Status per " + R.tanggal), h("ul", { class: "plain-list" }, R.status.map(function (t) { return h("li", null, t); }))),
      h("section", { class: "card" }, h("h2", null, "Yang paling sering dilaporkan keluar"),
        R.rumus ? h("p", { class: "note info" }, R.rumus) : null,
        h("ul", { class: "plain-list" }, R.temuan.map(function (t) { return h("li", null, t); }))),
      CFG.sections.map(function (sec) {
        return h("section", { class: "stack" }, h("h2", null, sec.short + " · " + sec.name),
          h("div", { class: "peta-grid" }, CFG.materi.filter(function (m) { return m.sec === sec.id; }).map(function (m) {
            return h("article", { class: "peta-card" },
              h("div", { class: "row between" }, h("h3", null, m.name), h("span", { class: "tag" }, m.lama ? "latihan tambahan" : (m.baru2026 ? "baru 2026 · ±" : "±") + m.quota + " soal")),
              h("p", { class: "small muted" }, m.def),
              h("ul", null, m.pola.map(function (p) { return h("li", null, p); })),
              h("div", { class: "row between" },
                h("span", { class: "small muted" }, m.gen >= 1 ? "Soal dibangkitkan otomatis" : E.poolOf(m.id).length + " soal di bank (" + E.poolOf(m.id).filter(function (q) { return q.sangat; }).length + " sangat sering keluar)" + (m.gen ? " + soal acak" : "")),
                h("button", { class: "btn sm", type: "button", onclick: function () { startPractice({ materi: [m.id], n: 10, hot: false, title: "Latihan " + m.name }); } }, "Latih")));
          })));
      }),
      h("section", { class: "card" }, h("h2", null, "Sumber"),
        h("p", { class: "small muted" }, "Jumlah soal per materi tidak dipublikasikan resmi; angka di atas perkiraan dari laporan peserta."),
        h("ul", { class: "plain-list" }, R.sumber.map(function (s) { return h("li", null, h("a", { href: s.u, target: "_blank", rel: "noopener" }, s.t)); })))
    ];
  }

  // ---------- formasi ----------
  function viewFormasi() {
    return SKD.formasiView({ h: h, toast: toast, rerender: function () { render(); }, history: function () { return S.history(); } });
  }

  // ---------- kalkulator formasi ----------
  function viewKalkulator() {
    return SKD.kalkulatorView({ h: h, toast: toast, rerender: function () { render(); }, history: function () { return S.history(); },
      pass: function () { return S.settings().pass; } });
  }

  // ---------- gaji & tunjangan ----------
  function viewGaji() {
    return SKD.gajiView({ h: h, toast: toast });
  }

  // ---------- pengaturan ----------
  // APK: pilih versi online (dari VPS, selalu terbaru; perlu kunci sekali) atau salinan bawaan APK (tanpa internet)
  function versiAplikasi() {
    var B = window.AndroidBridge;
    if (!B || typeof B.mode !== "function" || typeof B.aturMode !== "function") return null;
    var m = "online";
    try { m = B.mode() === "offline" ? "offline" : "online"; } catch (e) { return null; }
    var pilih = function (v) { return function () { if (v !== m) { toast(v === "online" ? "Membuka versi online…" : "Membuka versi bawaan APK…"); B.aturMode(v); } }; };
    return h("section", { class: "card stack" }, h("h2", null, "Versi aplikasi"),
      h("p", { class: "small muted" }, "Versi online dimuat dari superfal-dev.com, jadi soal dan data formasi selalu terbaru tanpa memasang APK baru (kunci Exclusive diketik sekali). Versi bawaan APK bisa dipakai tanpa internet."),
      h("div", { class: "seg", role: "group", "aria-label": "Versi aplikasi" },
        h("button", { type: "button", id: "set-online", "aria-pressed": m === "online" ? "true" : "false", onclick: pilih("online") }, "Online (terbaru)"),
        h("button", { type: "button", id: "set-offline", "aria-pressed": m === "offline" ? "true" : "false", onclick: pilih("offline") }, "Bawaan APK (offline)")),
      h("p", { class: "small" }, "Sedang dipakai: ", h("b", null, /^https?:$/.test(location.protocol) ? "versi online" : "versi bawaan APK"), "."));
  }
  function viewAtur() {
    var set = S.settings();
    return [
      h("div", { class: "page-head" }, h("h1", null, "Pengaturan")),
      h("section", { class: "card stack" }, h("h2", null, "Peserta"),
        h("label", { class: "field" }, h("span", { class: "label" }, "Nama (tampil di beranda dan layar ujian)"),
          h("input", { class: "input wide", id: "set-nama", maxlength: 40, value: set.nama || "", placeholder: "Nama Anda", onchange: function (e) { S.setNama(e.target.value); toast("Nama disimpan."); render(); } })),
        h("p", { class: "small muted" }, "Nomor peserta latihan: ", h("b", null, S.nomorPeserta()), ". Hanya tiruan untuk membiasakan layar ujian.")),
      h("section", { class: "card stack" }, h("h2", null, "Ambang batas"),
        h("p", { class: "small muted" }, "Bawaan mengikuti KepmenPANRB 674/2026 untuk kebutuhan umum: TWK 65, TIU 80, TKP 166. Jalur cumlaude dan diaspora memakai nilai kumulatif minimal 311 (TIU minimal 85); penyandang disabilitas dan putra/putri Papua kumulatif minimal 286 (TIU minimal 60)."),
        h("div", { class: "row" }, CFG.sections.map(function (s) {
          return h("label", { class: "field" }, h("span", { class: "label" }, s.short + " (maks " + s.max + ")"),
            h("input", {
              class: "input", type: "number", id: "pass-" + s.id, min: 1, max: s.max, value: set.pass[s.id], inputmode: "numeric",
              onchange: function (e) {
                var v = Math.round(Number(e.target.value));
                if (v >= 1 && v <= s.max) { S.setPass(s.id, v); toast("Ambang batas " + s.short + " disimpan: " + v); }
                else { e.target.value = set.pass[s.id]; toast("Isi angka 1 sampai " + s.max + "."); }
              }
            }));
        })),
        h("div", { class: "row" }, h("button", { class: "btn sm", type: "button", onclick: function () { S.resetPass(); render(); toast("Ambang batas dikembalikan ke 65, 80, 166."); } }, "Kembalikan ke bawaan"))),
      versiAplikasi(),
      h("section", { class: "card stack" }, h("h2", null, "Latihan"),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "set-requeue", checked: set.requeue, onchange: function (e) { S.setFlag("requeue", e.target.checked); } }),
          h("span", null, h("b", null, "Ulangi yang salah sampai benar. "), "Berlaku pada latihan per materi."))),
      h("section", { class: "card stack" }, h("h2", null, "Data progres"),
        h("p", { class: "small muted" }, S.cloudState() === "aktif" ? "Progres tersimpan di perangkat ini dan tersinkron ke akun Anda." : "Progres tersimpan di perangkat ini saja. Menghapus data aplikasi akan menghapus progres."),
        h("div", { class: "row" }, h("button", {
          class: "btn danger", type: "button",
          onclick: function () {
            modal({ title: "Hapus semua progres?", body: "Statistik per soal, daftar soal yang perlu diulang, riwayat tryout, dan pembahasan tersimpan akan dihapus. Tindakan ini tidak bisa dibatalkan.", ok: "Hapus", okClass: "danger", onOk: function () { S.resetAll(); ui.saved = null; ui.result = null; render(); toast("Progres dihapus."); } });
          }
        }, "Hapus semua progres")))
    ];
  }

  // ---------- router ----------
  var VIEWS = {
    beranda: viewHome, tryout: viewTryout, persiapan: viewPersiapan, ujian: viewUjian, nilai: viewNilai, hasil: viewHasil, bahas: viewBahas, lembar: viewLembar,
    latihan: viewLatihan, kerjakan: viewKerjakan, ulang: viewUlang, riwayat: viewRiwayat, peta: viewPeta, formasi: viewFormasi, gaji: viewGaji, atur: viewAtur,
    masuk: viewMasuk, kalkulator: viewKalkulator
  };
  var ALIAS = { simulasi: "tryout", statistik: "riwayat" };
  var CAT_ROUTES = { masuk: 1, persiapan: 1, ujian: 1, nilai: 1 };
  function go(route) {
    if (location.hash.slice(1) === route) onHash();
    else location.hash = route;
  }
  function onHash() {
    var r = location.hash.slice(1) || "beranda";
    if (ALIAS[r]) r = ALIAS[r];
    if (!VIEWS[r]) r = "beranda";
    if ((r === "kerjakan" && (!ui.session || isTryout(ui.session))) || (r === "ujian" && (!ui.session || !isTryout(ui.session)))) r = "beranda";
    if ((r === "hasil" || r === "bahas" || r === "lembar" || r === "nilai") && !ui.result) r = "beranda";
    if (r === "lembar" && ui.result && ui.result.kind !== "tryout") r = "hasil";
    if ((r === "persiapan" || r === "masuk") && !ui.prep) r = "tryout";
    if (r !== "ujian") ui.navSheet = false;
    if (r !== "kerjakan" && r !== "ujian" && ui.session) { saveSession(); ui.saved = ui.session; ui.session = null; stopTimer(); }
    ui.route = r;
    closeModal();
    setDrawer(false);
    render(true);
    if (r === "kerjakan" || r === "ujian") startTimer();
  }
  var NAV_OF = { hasil: "riwayat", bahas: "riwayat", lembar: "riwayat", kerjakan: "latihan" };
  function render(toTop) {
    var cat = !!CAT_ROUTES[ui.route];
    document.body.classList.toggle("in-cat", cat);
    document.body.classList.toggle("in-quiz", ui.route === "kerjakan");
    var active = NAV_OF[ui.route] || ui.route;
    Array.prototype.forEach.call(document.querySelectorAll("#drawer a[data-r]"), function (a) {
      if (a.getAttribute("data-r") === active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var av = document.getElementById("avatar");
    if (av) av.textContent = (nama() || "?").charAt(0).toUpperCase();
    var y = window.scrollY;
    app.textContent = "";
    app.classList.remove("enter");
    add(app, VIEWS[ui.route]());
    if (toTop && !cat) { void app.offsetWidth; app.classList.add("enter"); } // gerak halus hanya saat pindah halaman
    if (ui.route === "kerjakan" || ui.route === "ujian") paintClock();
    if (toTop) window.scrollTo(0, 0); else window.scrollTo(0, y);
  }

  // ---------- laci menu ----------
  var drawer = document.getElementById("drawer"), scrim = document.getElementById("scrim"), menuBtn = document.getElementById("menu-btn");
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle("open", open);
    scrim.hidden = !open;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { var first = drawer.querySelector("a"); if (first) first.focus(); }
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () { setDrawer(!drawer.classList.contains("open")); });
    scrim.addEventListener("click", function () { setDrawer(false); });
    Array.prototype.forEach.call(drawer.querySelectorAll("a[data-r]"), function (a) {
      var r = a.getAttribute("data-r");
      a.insertBefore(icon(a.getAttribute("data-i")), a.firstChild);
      a.addEventListener("click", function () { setDrawer(false); if (location.hash.slice(1) === r) onHash(); });
    });
    var ext = drawer.querySelector("a[data-x]");
    if (ext) ext.insertBefore(icon(ext.getAttribute("data-i")), ext.firstChild);
  }

  document.addEventListener("keydown", function (e) {
    if (modalRoot.firstChild) { if (e.key === "Escape") closeModal(); return; }
    if (e.key === "Escape" && drawer && drawer.classList.contains("open")) { setDrawer(false); menuBtn.focus(); return; }
    if ((ui.route !== "kerjakan" && ui.route !== "ujian") || !ui.session || e.ctrlKey || e.metaKey || e.altKey) return;
    var tg = e.target, tn = tg && tg.tagName;
    if (tn === "TEXTAREA" || tn === "SELECT" || (tn === "INPUT" && tg.type !== "radio")) return;
    var k = e.key.toLowerCase(), idx = "abcde".indexOf(k);
    if (idx < 0 && k.length === 1) idx = "12345".indexOf(k);
    var s = ui.session, it = s.items[s.cur];
    if (idx >= 0 && k.length === 1 && idx < it.pq.opts.length) { e.preventDefault(); if (ui.route === "ujian") catPick(idx); else choose(idx); return; }
    if (e.key === "Enter" && tn !== "BUTTON" && tn !== "A" && tn !== "SUMMARY") {
      e.preventDefault();
      if (ui.route === "ujian") catSave(); else if (it.done) next();
    }
  });
  window.addEventListener("hashchange", onHash);
  window.addEventListener("pagehide", saveSession);

  S.init();
  S.onChange(function () { if (ui.route !== "kerjakan" && ui.route !== "ujian") render(); });
  ui.saved = S.loadSession();
  // Halaman dimuat ulang di tengah sesi: langsung lanjutkan, jangan lempar ke beranda.
  var hsh = location.hash.slice(1);
  if ((hsh === "kerjakan" || hsh === "ujian") && ui.saved) { ui.session = ui.saved; ui.saved = null; }
  onHash();

  SKD.ui = ui; // untuk pengujian
})();

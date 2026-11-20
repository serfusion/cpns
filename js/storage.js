/* Penyimpanan progres. Selalu ke localStorage; bila halaman dibuka sebagai Artifact claude.ai,
   progres juga disinkronkan ke penyimpanan pribadi pengguna supaya terbawa antarperangkat. */
(function () {
  "use strict";
  var SKD = (window.SKD = window.SKD || {});
  var CFG = SKD.config;
  var KEY = "skd.progres.v1", KEY_SESI = "skd.sesi.v1", KEY_ULAS = "skd.ulas.v1";

  function num(v) { return typeof v === "number" && isFinite(v) ? v : 0; }
  function blank() {
    var pass = {};
    CFG.sections.forEach(function (s) { pass[s.id] = s.pass; });
    // q[id] = [dilihat, benar, beruntun benar, waktu terakhir, poin terakhir, jumlah poin]
    return { v: 1, q: {}, hist: [], set: { pass: pass, instant: true, requeue: true, nama: "", nop: "", ts: 0 }, resetAt: 0 };
  }
  function sane(d) {
    var b = blank(), k;
    if (!d || typeof d !== "object" || d.v !== 1) return b;
    if (d.q && typeof d.q === "object") {
      for (k in d.q) {
        var e = d.q[k];
        if (Array.isArray(e) && e.length >= 5) b.q[k] = [num(e[0]), num(e[1]), num(e[2]), num(e[3]), num(e[4]), num(e[5])];
      }
    }
    if (Array.isArray(d.hist)) b.hist = d.hist.filter(function (h) { return h && typeof h.t === "number" && h.s; }).slice(-60);
    if (d.set && typeof d.set === "object") {
      if (d.set.pass && typeof d.set.pass === "object") {
        CFG.sections.forEach(function (s) {
          var v = num(d.set.pass[s.id]);
          if (v > 0 && v <= s.max) b.set.pass[s.id] = Math.round(v);
        });
      }
      b.set.instant = d.set.instant !== false;
      b.set.requeue = d.set.requeue !== false;
      b.set.nama = typeof d.set.nama === "string" ? d.set.nama.slice(0, 40) : "";
      b.set.nop = typeof d.set.nop === "string" && /^\d{6,16}$/.test(d.set.nop) ? d.set.nop : "";
      b.set.ts = num(d.set.ts);
    }
    b.resetAt = num(d.resetAt);
    return b;
  }

  var data = blank(), listeners = [];
  var cloud = { state: "lokal", doc: null, busy: false, dirty: false, timer: null };

  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k) { try { window.localStorage.removeItem(k); } catch (e) { /* abaikan */ } }
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { /* abaikan */ } }); }

  function persist() {
    lsSet(KEY, JSON.stringify(data));
    schedulePush();
  }

  // ---------- sinkronisasi (hanya bila tersedia) ----------
  function mergeIn(remote) {
    var resetAt = Math.max(data.resetAt, remote.resetAt), q = {}, seenT = {}, hist = [];
    [data.q, remote.q].forEach(function (src) {
      for (var k in src) {
        var e = src[k];
        if (e[3] <= resetAt) continue;
        if (!q[k] || e[3] > q[k][3]) q[k] = e;
      }
    });
    data.hist.concat(remote.hist).forEach(function (h) {
      if (h.t > resetAt && !seenT[h.t]) { seenT[h.t] = 1; hist.push(h); }
    });
    hist.sort(function (a, b) { return a.t - b.t; });
    data = { v: 1, q: q, hist: hist.slice(-60), set: remote.set.ts > data.set.ts ? remote.set : data.set, resetAt: resetAt };
  }
  function timeout(p, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error("timeout")); }, ms);
      p.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }
  function initCloud() {
    if (!window.claude || typeof window.claude.use !== "function") return;
    Promise.all([window.claude.use("db"), window.claude.use("user")]).then(function (r) {
      var db = r[0], user = r[1];
      if (!db || !user) throw new Error("tidak tersedia");
      return user.id().then(function (uid) {
        if (!uid) throw new Error("tanpa identitas");
        cloud.doc = db.doc("data/users/" + uid + "/progres");
        return timeout(cloud.doc.get(), 10000);
      });
    }).then(function (snap) {
      if (snap && snap.exists) {
        var remote = snap.data();
        if (remote) mergeIn(sane(JSON.parse(JSON.stringify(remote))));
      }
      cloud.state = "aktif";
      lsSet(KEY, JSON.stringify(data));
      emit();
      push();
    }).catch(function () {
      cloud.state = "lokal";
      cloud.doc = null;
    });
  }
  function schedulePush() {
    if (!cloud.doc || cloud.state !== "aktif") return;
    clearTimeout(cloud.timer);
    cloud.timer = setTimeout(push, 2500);
  }
  function push() {
    if (!cloud.doc || cloud.state !== "aktif") return;
    if (cloud.busy) { cloud.dirty = true; return; }
    cloud.busy = true;
    cloud.dirty = false;
    cloud.doc.set(JSON.parse(JSON.stringify(data))).then(null, function (e) {
      var code = e && e.code;
      if (code !== "unavailable" && code !== "resource_exhausted") { cloud.state = "lokal"; cloud.doc = null; emit(); }
    }).then(function () {
      cloud.busy = false;
      if (cloud.dirty) schedulePush();
    });
  }

  // ---------- API ----------
  function record(pq, pts) {
    var key = pq.id || "gen:" + pq.m, e = data.q[key] || [0, 0, 0, 0, 0, 0];
    e[0]++;
    if (pts === 5) { e[1]++; e[2]++; } else e[2] = 0;
    e[3] = Date.now();
    e[4] = pts;
    e[5] += pts;
    data.q[key] = e;
    persist();
  }
  /** Ringkasan per materi: { id: {seen, right, pts, uniq, review, mastered, total} } */
  function materiStats() {
    var out = {}, E = SKD.engine;
    CFG.materi.forEach(function (m) {
      out[m.id] = { seen: 0, right: 0, pts: 0, uniq: 0, review: 0, mastered: 0, total: E.poolOf(m.id).length };
    });
    for (var k in data.q) {
      var e = data.q[k], m, q = null;
      if (k.indexOf("gen:") === 0) m = k.slice(4);
      else { q = E.byId(k); if (!q) continue; m = q.m; }
      var o = out[m];
      if (!o) continue;
      o.seen += e[0];
      o.right += e[1];
      o.pts += e[5];
      if (q) {
        o.uniq++;
        if (E.needsReview(q.sec, e)) o.review++;
        else if (e[2] >= 2) o.mastered++;
      }
    }
    return out;
  }
  function reviewIds(sec) {
    var out = [], E = SKD.engine;
    for (var k in data.q) {
      if (k.indexOf("gen:") === 0) continue;
      var q = E.byId(k);
      if (q && (!sec || q.sec === sec) && E.needsReview(q.sec, data.q[k])) out.push({ id: k, t: data.q[k][3] });
    }
    out.sort(function (a, b) { return b.t - a.t; });
    return out.map(function (x) { return x.id; });
  }

  SKD.store = {
    init: function () {
      var raw = lsGet(KEY);
      if (raw) { try { data = sane(JSON.parse(raw)); } catch (e) { data = blank(); } }
      initCloud();
    },
    onChange: function (fn) { listeners.push(fn); },
    record: record,
    qstats: function () { return data.q; },
    materiStats: materiStats,
    reviewIds: reviewIds,
    history: function () { return data.hist; },
    addHistory: function (h) { data.hist.push(h); data.hist = data.hist.slice(-60); persist(); },
    settings: function () { return data.set; },
    setPass: function (sec, v) { data.set.pass[sec] = v; data.set.ts = Date.now(); persist(); },
    setFlag: function (k, v) { data.set[k] = !!v; data.set.ts = Date.now(); persist(); },
    resetPass: function () { data.set.pass = blank().set.pass; data.set.ts = Date.now(); persist(); },
    saveSession: function (s) { return lsSet(KEY_SESI, JSON.stringify(s)); },
    loadSession: function () {
      var raw = lsGet(KEY_SESI);
      if (!raw) return null;
      try { var s = JSON.parse(raw); return s && Array.isArray(s.items) && s.items.length ? s : null; } catch (e) { return null; }
    },
    clearSession: function () { lsDel(KEY_SESI); },
    setNama: function (v) { data.set.nama = String(v || "").trim().slice(0, 40); data.set.ts = Date.now(); persist(); emit(); },
    /** Nomor peserta tiruan untuk layar ujian; dibuat sekali lalu disimpan. */
    nomorPeserta: function () {
      if (!data.set.nop) {
        var n = "2026";
        for (var i = 0; i < 8; i++) n += Math.floor(Math.random() * 10);
        data.set.nop = n;
        persist();
      }
      return data.set.nop;
    },
    /** Pembahasan tryout terakhir (hanya di perangkat ini, maksimal 3 percobaan). */
    saveUlas: function (entry) {
      var list = [];
      try { list = JSON.parse(lsGet(KEY_ULAS) || "[]"); } catch (e) { list = []; }
      if (!Array.isArray(list)) list = [];
      list.push(entry);
      while (list.length > 3) list.shift();
      if (!lsSet(KEY_ULAS, JSON.stringify(list)) && list.length > 1) lsSet(KEY_ULAS, JSON.stringify(list.slice(-1)));
    },
    ulas: function (t) {
      var list = [];
      try { list = JSON.parse(lsGet(KEY_ULAS) || "[]"); } catch (e) { list = []; }
      if (!Array.isArray(list)) return null;
      for (var i = list.length - 1; i >= 0; i--) if (list[i] && list[i].t === t && Array.isArray(list[i].items)) return list[i];
      return null;
    },
    resetAll: function () {
      var set = data.set;
      data = blank();
      data.set = set;
      data.resetAt = Date.now();
      lsDel(KEY_SESI);
      lsDel(KEY_ULAS);
      persist();
      emit();
    },
    cloudState: function () { return cloud.state; },
    _sane: sane
  };
})();

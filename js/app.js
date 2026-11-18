/* Tampilan: router hash + semua layar. */
(function () {
  "use strict";
  var SKD = window.SKD, CFG = SKD.config, E = SKD.engine, S = SKD.store, F = SKD.fig;
  var app = document.getElementById("app");
  var LET = ["A", "B", "C", "D", "E"];

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
  function fmtDate(t) {
    var d = new Date(t), bln = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return d.getDate() + " " + bln[d.getMonth()] + " " + d.getFullYear() + ", " + pad(d.getHours()) + "." + pad(d.getMinutes());
  }
  function meter(p, cls) {
    return h("div", { class: "meter" + (cls ? " " + cls : ""), role: "img", "aria-label": p + " persen" }, h("i", { style: "width:" + Math.max(0, Math.min(100, p)) + "%" }));
  }
  function sevClass(p) { return p >= 70 ? "" : p >= 50 ? "warn" : "bad"; }
  function isMiss(it) { return it.chosen == null ? true : it.pq.sec === "tkp" ? it.pts <= 3 : it.pts < 5; }
  function passOf(secId) { return S.settings().pass[secId]; }

  var ui = {
    route: "beranda", session: null, result: null, saved: null,
    setup: { sec: "twk", off: {}, n: 10, hot: false },
    sim: { scale: "full", instant: null },
    rvFilter: "salah", railOpen: null, tick: null, lastTick: 0, ticks: 0
  };

  // ---------- dialog & toast ----------
  var modalRoot = document.getElementById("modal-root"), toastEl = document.getElementById("toast"), toastTimer = null;
  function closeModal() { modalRoot.textContent = ""; }
  function modal(o) {
    closeModal();
    var cancel = h("button", { class: "btn", type: "button", onclick: closeModal }, o.cancel || "Batal");
    var ok = h("button", { class: "btn " + (o.okClass || "primary"), type: "button", onclick: function () { closeModal(); o.onOk(); } }, o.ok);
    var box = h("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-ttl" },
      h("h2", { id: "modal-ttl" }, o.title), h("p", null, o.body), h("div", { class: "row" }, cancel, ok));
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
  function saveSession() { if (ui.session) S.saveSession(ui.session); }
  function begin(s) {
    ui.session = s;
    ui.saved = null;
    ui.railOpen = null;
    saveSession();
    go("kerjakan");
  }
  function guardNew(fn) {
    var sv = ui.saved || S.loadSession();
    var answered = sv ? sv.items.filter(function (i) { return i.chosen != null; }).length : 0;
    if (sv && answered > 0) {
      modal({
        title: "Mulai sesi baru?", ok: "Mulai baru",
        body: "Ada " + (sv.kind === "simulasi" ? "simulasi" : "latihan") + " yang belum selesai (" + answered + " soal terjawab). Memulai sesi baru akan menghapusnya.",
        onOk: fn
      });
    } else fn();
  }
  function startPractice(o) {
    guardNew(function () {
      var items = E.buildPractice({ materi: o.materi, n: o.n, hot: o.hot }, S.qstats());
      if (!items.length) { toast("Belum ada soal untuk pilihan ini."); return; }
      begin({ kind: "latihan", scale: null, title: o.title, instant: true, requeue: S.settings().requeue, items: items, cur: 0, limit: 0, elapsed: 0 });
    });
  }
  function startSim(scale, instant) {
    guardNew(function () {
      var items = E.buildSimulation(scale, S.qstats());
      begin({
        kind: "simulasi", scale: scale, title: "Simulasi CAT SKD", instant: instant, requeue: false, items: items, cur: 0,
        limit: (scale === "mini" ? CFG.exam.minutes / 2 : CFG.exam.minutes) * 60, elapsed: 0
      });
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
    go("kerjakan");
  }

  function stopTimer() { clearInterval(ui.tick); ui.tick = null; }
  function startTimer() {
    stopTimer();
    ui.lastTick = Date.now();
    ui.tick = setInterval(function () {
      var s = ui.session;
      if (!s || ui.route !== "kerjakan") { stopTimer(); return; }
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
    if (s.limit) el.parentNode.className = "time" + (left <= 300 ? " low" : "");
  }

  function choose(idx) {
    var s = ui.session;
    if (!s) return;
    var it = s.items[s.cur];
    if (idx < 0 || idx >= it.pq.opts.length) return;
    if (s.instant) {
      if (it.done) return;
      it.chosen = idx;
      it.pts = it.pq.opts[idx].pts;
      it.done = true;
      S.record(it.pq, it.pts);
      if (s.requeue && isMiss(it) && (it.tries || 0) < 2) {
        var again = { pq: E.again(it.pq), chosen: null, pts: null, done: false, retry: true, tries: (it.tries || 0) + 1 };
        s.items.splice(Math.min(s.items.length, s.cur + 5), 0, again);
      }
    } else {
      it.chosen = idx;
      it.pts = it.pq.opts[idx].pts;
    }
    saveSession();
    render();
    var fb = document.getElementById("fb"), nx = document.getElementById("btn-next");
    if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (nx && s.instant) nx.focus({ preventScroll: true });
  }
  function goTo(i) {
    var s = ui.session;
    if (!s || i < 0 || i >= s.items.length) return;
    s.cur = i;
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
    if (s.kind === "latihan") finish(); else askFinish();
  }
  function askFinish() {
    var s = ui.session;
    if (!s) return;
    var un = s.items.filter(function (i) { return i.chosen == null; }).length, exam = s.kind === "simulasi";
    if (!exam && !un) return finish();
    modal({
      title: exam ? "Selesaikan ujian?" : "Akhiri latihan?", ok: exam ? "Ya, selesai" : "Akhiri", okClass: "danger", cancel: "Kembali ke soal",
      body: (un ? "Masih ada " + un + " soal yang belum dijawab. " : "Semua soal sudah dijawab. ") + (exam ? "Setelah selesai, jawaban tidak bisa diubah." : "Soal yang belum dijawab tidak dihitung."),
      onOk: function () { finish(); }
    });
  }
  function finish(auto) {
    var s = ui.session;
    if (!s) return;
    stopTimer();
    closeModal();
    if (!s.instant) s.items.forEach(function (it) { if (it.chosen != null) S.record(it.pq, it.pts); });
    var sc = E.score(s.items), res = { kind: s.kind, scale: s.scale, title: s.title, instant: s.instant, items: s.items, score: sc, elapsed: s.elapsed, limit: s.limit, auto: !!auto, at: Date.now() };
    if (s.kind === "simulasi" && sc.answered > 0) {
      var hs = {}, sim = simScores(res);
      CFG.sections.forEach(function (sec) { hs[sec.id] = [sim[sec.id].scaled, sc.sec[sec.id].answered, sc.sec[sec.id].n]; });
      S.addHistory({ t: res.at, kind: s.scale, s: hs, total: sim.total, pass: sim.pass, dur: s.elapsed, instant: s.instant });
    }
    S.clearSession();
    ui.session = null;
    ui.saved = null;
    ui.result = res;
    ui.rvFilter = "salah";
    go("hasil");
    if (auto) toast("Waktu habis. Ujian diakhiri otomatis.");
  }
  /** Nilai simulasi per subtes; paket setengah disetarakan ke skala penuh. */
  function simScores(res) {
    var out = { total: 0, pass: true };
    CFG.sections.forEach(function (sec) {
      var b = res.score.sec[sec.id], scaled = b.n ? Math.round((b.pts * sec.count) / b.n) : 0, ok = scaled >= passOf(sec.id);
      out[sec.id] = { raw: b.pts, scaled: scaled, ok: ok };
      out.total += scaled;
      if (!ok) out.pass = false;
    });
    return out;
  }

  // ---------- bagian soal ----------
  function figBox(spec) {
    return h("span", { class: "fig" + (spec.k === "q" ? " q" : ""), role: "img", "aria-label": F.describe(spec), html: F.svg(spec) });
  }
  function stemView(st) {
    if (!st) return null;
    if (st.layout === "matriks") return h("div", { class: "stem matriks" }, st.figs.map(figBox));
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
  function ptsTag(pts) {
    return h("span", { class: "tag " + (pts === 5 ? "ok" : pts === 4 ? "accent" : pts === 3 ? "warn" : "bad") }, pts + " poin");
  }
  /** Daftar opsi. reveal = tampilkan kunci; onPick = null berarti hanya baca. */
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
        } else if (i === pq.best) {
          cls += " is-right"; mark = "✓";
          tag = h("span", { class: "tag ok" }, picked ? "Benar" : "Jawaban benar");
        } else if (picked) {
          cls += " is-wrong"; mark = "✕";
          tag = h("span", { class: "tag bad" }, "Pilihan Anda");
        } else cls += " is-dim";
        if (tkp && picked) tag = h("span", { class: "row", style: "gap:6px" }, h("span", { class: "tag" }, "Pilihan Anda"), tag);
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
  function qHeadTags(it) {
    var pq = it.pq, sec = E.section(pq.sec), m = E.materi(pq.m);
    return [h("span", { class: "tag accent" }, sec.short), h("span", { class: "tag" }, m ? m.name : pq.m),
      pq.hot ? h("span", { class: "tag warn", title: "Pola soal yang sering dilaporkan keluar" }, "Sering keluar") : null,
      it.retry ? h("span", { class: "tag bad" }, "Ulangan") : null];
  }
  function qBody(pq) {
    return [pq.passage ? h("div", { class: "passage" }, pq.passage) : null, h("div", { class: "qtext" }, pq.text), tableView(pq.table), stemView(pq.stem)];
  }

  // ---------- layar kuis ----------
  function numClass(s, it, i) {
    var c = "numb";
    if (i === s.cur) c += " cur";
    if (it.retry) c += " rt";
    if (s.instant) {
      if (it.done) c += it.pts === 5 ? " ok" : it.pq.sec === "tkp" && it.pts === 4 ? " mid" : " bad";
    } else c += it.chosen != null ? " ans" : " un";
    return c;
  }
  function viewQuiz() {
    var s = ui.session, it = s.items[s.cur], exam = s.kind === "simulasi", total = s.items.length;
    var answered = s.items.filter(function (i) { return i.chosen != null; }).length;
    var right = s.items.filter(function (i) { return i.done && i.pts === 5; }).length;
    var reveal = s.instant && it.done, last = s.cur === total - 1;

    var info = exam
      ? [h("div", { class: "opt-hide" }, h("span", null, "Batas waktu"), h("b", null, Math.round(s.limit / 60) + " menit")),
        h("div", { class: "opt-hide" }, h("span", null, "Jumlah soal"), h("b", null, total)),
        h("div", null, h("span", null, "Dijawab"), h("b", null, answered)),
        h("div", null, h("span", null, "Belum dijawab"), h("b", null, total - answered)),
        h("div", { class: "time" }, h("span", null, "Sisa waktu"), h("b", { id: "clock" }, ""))]
      : [h("div", null, h("span", null, "Soal"), h("b", null, s.cur + 1 + " / " + total)),
        h("div", null, h("span", null, "Benar"), h("b", null, right + " / " + answered)),
        h("div", { class: "time" }, h("span", null, "Waktu"), h("b", { id: "clock" }, ""))];
    var bar = h("div", { class: "catbar" },
      h("div", { class: "ttl" }, s.title, exam ? h("span", { class: "tag" }, s.instant ? "Koreksi langsung" : "Seperti ujian asli") : null),
      h("div", { class: "cat-info" }, info),
      h("button", { class: "btn sm " + (exam ? "danger" : ""), type: "button", onclick: askFinish }, exam ? "Selesai Ujian" : "Akhiri latihan"));

    var actions;
    if (s.instant) {
      actions = [
        it.done
          ? h("button", { class: "btn primary", id: "btn-next", type: "button", onclick: next }, last && answered === total ? "Lihat hasil" : "Soal berikutnya")
          : h("button", { class: "btn warn", type: "button", onclick: next }, exam ? "Lewatkan soal ini" : "Lewati"),
        s.cur > 0 ? h("button", { class: "btn ghost", type: "button", onclick: function () { goTo(s.cur - 1); } }, "Sebelumnya") : null,
        h("span", { class: "hint" }, "Pilih dengan ", h("span", { class: "kbd" }, "A"), "–", h("span", { class: "kbd" }, "E"), " lanjut dengan ", h("span", { class: "kbd" }, "Enter"))
      ];
    } else {
      actions = [
        h("button", { class: "btn ok", id: "btn-next", type: "button", onclick: next }, "Simpan dan Lanjutkan"),
        h("button", { class: "btn warn", type: "button", onclick: next }, "Lewatkan soal ini"),
        h("span", { class: "hint" }, "Pilih dengan ", h("span", { class: "kbd" }, "A"), "–", h("span", { class: "kbd" }, "E"), " lanjut dengan ", h("span", { class: "kbd" }, "Enter"))
      ];
    }
    var card = h("section", { class: "qcard", "aria-live": "off" },
      h("div", { class: "qhead" }, h("span", { class: "no" }, "Soal No. " + (s.cur + 1)), qHeadTags(it)),
      qBody(it.pq),
      optsView(it, reveal, reveal ? null : choose),
      h("div", { class: "qactions" }, actions),
      reveal ? feedbackView(it) : null);

    // rel nomor soal
    var groups = [];
    if (exam) {
      CFG.sections.forEach(function (sec) {
        var btns = [];
        s.items.forEach(function (x, i) { if (x.pq.sec === sec.id) btns.push(numBtn(s, x, i)); });
        if (btns.length) groups.push(h("div", { class: "rail-sec" }, sec.short), h("div", { class: "nums" }, btns));
      });
    } else groups.push(h("div", { class: "nums" }, s.items.map(function (x, i) { return numBtn(s, x, i); })));
    var legend = s.instant
      ? h("div", { class: "legend" }, h("span", null, h("i", { class: "ok" }), "Benar / 5 poin"), h("span", null, h("i", { class: "mid" }), "4 poin"), h("span", null, h("i", { class: "bad" }), "Salah"), h("span", null, h("i"), "Belum dijawab"))
      : h("div", { class: "legend" }, h("span", null, h("i", { class: "ok" }), "Sudah dijawab"), h("span", null, h("i", { class: "bad" }), "Belum dijawab"));
    var wide = window.matchMedia("(min-width: 901px)").matches;
    var rail = h("details", { class: "rail", open: ui.railOpen == null ? wide : ui.railOpen, ontoggle: function () { ui.railOpen = rail.open; } },
      h("summary", null, "Nomor soal", h("span", { class: "tw" }, answered + " dari " + total + " dijawab")),
      h("div", { class: "rail-body" }, groups, legend));

    return [bar, h("div", { class: "quiz" }, card, rail)];
  }
  function numBtn(s, it, i) {
    return h("button", { class: numClass(s, it, i), type: "button", "aria-label": "Soal " + (i + 1), "aria-current": i === s.cur ? "true" : null, onclick: function () { goTo(i); } }, i + 1);
  }

  // ---------- beranda ----------
  function sectionCard(sec, ms) {
    var mats = CFG.materi.filter(function (m) { return m.sec === sec.id; }), rows = [], lastGroup = null, seen = 0, uniq = 0, total = 0, right = 0;
    mats.forEach(function (m) {
      var st = ms[m.id];
      seen += st.seen; uniq += st.uniq; total += st.total; right += st.right;
      if (m.group && m.group !== lastGroup) { rows.push(h("li", { class: "mgroup" }, m.group)); lastGroup = m.group; }
      rows.push(h("li", null, h("button", {
        class: "mrow", type: "button",
        onclick: function () { startPractice({ materi: [m.id], n: 10, hot: false, title: "Latihan " + m.name }); }
      }, h("span", { class: "nm" }, m.name), h("span", { class: "ct" }, m.gen >= 1 ? "tanpa batas" : st.uniq + "/" + st.total + (m.gen ? "+" : "")))));
    });
    var p = pct(uniq, total);
    return h("article", { class: "sec-card" },
      h("div", { class: "sec-top" },
        h("div", { class: "row between" }, h("span", { class: "short" }, sec.short), h("span", { class: "tag" }, sec.count + " soal · min. " + passOf(sec.id))),
        h("div", { class: "small muted" }, sec.name),
        meter(p), h("div", { class: "small muted" }, uniq + " dari " + total + " soal bank sudah dicoba")),
      h("ul", { class: "mlist" }, rows),
      h("div", { class: "sec-foot" },
        h("button", { class: "btn sm primary", type: "button", onclick: function () { startPractice({ materi: mats.map(function (m) { return m.id; }), n: 20, hot: false, title: "Latihan " + sec.short }); } }, "Latihan " + sec.short + " 20 soal"),
        h("button", { class: "btn sm", type: "button", onclick: function () { startPractice({ materi: mats.map(function (m) { return m.id; }), n: 15, hot: true, title: sec.short + " soal prioritas" }); } }, "Soal prioritas")));
  }
  function resumeCard() {
    var sv = ui.saved;
    if (!sv) return null;
    var answered = sv.items.filter(function (i) { return i.chosen != null; }).length;
    return h("div", { class: "note info row between" },
      h("div", null, h("b", null, sv.title + " belum selesai. "), answered + " dari " + sv.items.length + " soal terjawab" + (sv.limit ? ", sisa waktu " + fmtTime(sv.limit - sv.elapsed, true) : "") + "."),
      h("div", { class: "row" },
        h("button", { class: "btn sm primary", type: "button", onclick: resume }, "Lanjutkan"),
        h("button", { class: "btn sm", type: "button", onclick: function () { S.clearSession(); ui.saved = null; render(); } }, "Buang")));
  }
  function viewHome() {
    var ms = S.materiStats(), bankN = E.bank().length, review = S.reviewIds().length;
    var hero = h("section", { class: "hero" },
      h("div", { class: "hero-main" },
        h("div", { class: "stack" }, h("h1", null, "Latihan SKD CPNS 2026"),
          h("p", null, "Soal TWK, TIU, dan TKP dengan urutan soal dan pilihan jawaban yang selalu diacak. Begitu Anda memilih, jawaban benar langsung ditandai hijau lengkap dengan pembahasannya.")),
        h("div", { class: "row" },
          h("a", { class: "btn lg", href: "#latihan" }, "Mulai latihan"),
          h("a", { class: "btn lg ghost", href: "#simulasi" }, "Simulasi 110 soal"))),
      h("div", { class: "format", "aria-label": "Format ujian" },
        h("div", { class: "fact" }, h("b", null, "110 soal"), h("span", null, "TWK 30 · TIU 35 · TKP 45")),
        h("div", { class: "fact" }, h("b", null, CFG.exam.minutes + " menit"), h("span", null, "sekitar 54 detik per soal")),
        CFG.sections.map(function (s) { return h("div", { class: "fact" }, h("b", null, "≥ " + passOf(s.id)), h("span", null, "ambang batas " + s.short + " dari " + s.max)); }),
        h("div", { class: "fact" }, h("b", null, bankN), h("span", null, "soal di bank, ditambah figural dan deret tanpa batas"))));
    var reviewNote = review
      ? h("div", { class: "note row between" }, h("div", null, h("b", null, review + " soal perlu diulang. "), "Soal yang terakhir Anda jawab salah dikumpulkan di sini."),
        h("a", { class: "btn sm", href: "#ulang" }, "Ulangi sekarang"))
      : null;
    return [hero, resumeCard(), reviewNote,
      h("section", { class: "stack" }, h("h2", null, "Pilih materi"), h("p", { class: "lede" }, "Klik satu materi untuk langsung berlatih 10 soal. Angka di kanan menunjukkan soal bank yang sudah Anda coba."),
        h("div", { class: "sec-grid" }, CFG.sections.map(function (s) { return sectionCard(s, ms); }))),
      h("div", { class: "note info row between" },
        h("div", null, h("b", null, "Strategi formasi CPNS 2026. "), "Jabatan yang menerima S-1 Ilmu Komunikasi, peta persaingan, dan kalkulator peluang."),
        h("a", { class: "btn sm", href: "#formasi" }, "Lihat strategi")),
      h("p", { class: "note info" }, "Aturan ambang batas khusus CPNS 2026 belum terbit per " + CFG.riset.tanggal + ". Angka di atas mengikuti seleksi CPNS terakhir (KepmenPANRB 321/2024) dan bisa diubah di menu Pengaturan.")];
  }

  // ---------- latihan ----------
  function viewPractice() {
    var st = ui.setup, mixed = st.sec === "mix";
    var mats = CFG.materi.filter(function (m) { return mixed || m.sec === st.sec; });
    var chosen = mats.filter(function (m) { return mixed || !st.off[m.id]; });
    var stock = 0, unlimited = false;
    chosen.forEach(function (m) {
      if (m.gen) unlimited = true;
      stock += E.poolOf(m.id).filter(function (q) { return !st.hot || q.hot; }).length;
    });
    function seg(val, label) {
      return h("button", { type: "button", "aria-pressed": st.sec === val ? "true" : "false", onclick: function () { st.sec = val; render(); } }, label);
    }
    function nBtn(n) {
      return h("button", { type: "button", "aria-pressed": st.n === n ? "true" : "false", onclick: function () { st.n = n; render(); } }, n + " soal");
    }
    var secName = mixed ? "campuran" : E.section(st.sec).short;
    return [
      h("div", { class: "stack" }, h("h1", null, "Latihan"), h("p", { class: "lede" }, "Setiap jawaban langsung dikoreksi. Pilihan yang salah ditandai merah, jawaban benar ditandai hijau, lalu pembahasannya muncul.")),
      resumeCard(),
      h("section", { class: "panel" },
        h("div", { class: "field" }, h("span", { class: "label" }, "Subtes"),
          h("div", { class: "seg", role: "group", "aria-label": "Subtes" }, seg("twk", "TWK"), seg("tiu", "TIU"), seg("tkp", "TKP"), seg("mix", "Campuran"))),
        mixed
          ? h("p", { class: "small muted" }, "Campuran mengambil soal dari ketiga subtes dengan perbandingan seperti ujian (30 : 35 : 45).")
          : h("div", { class: "field" }, h("span", { class: "label" }, "Materi"),
            h("div", { class: "chips" }, mats.map(function (m) {
              return h("button", { class: "chip", type: "button", "aria-pressed": st.off[m.id] ? "false" : "true", onclick: function () { st.off[m.id] = !st.off[m.id]; render(); } },
                m.name, h("span", { class: "n" }, m.gen >= 1 ? "∞" : E.poolOf(m.id).length));
            }))),
        h("div", { class: "field" }, h("span", { class: "label" }, "Jumlah soal"),
          h("div", { class: "seg", role: "group", "aria-label": "Jumlah soal" }, nBtn(10), nBtn(20), nBtn(30), nBtn(50))),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "opt-hot", checked: st.hot, onchange: function (e) { st.hot = e.target.checked; render(); } }),
          h("span", null, h("b", null, "Soal prioritas saja. "), "Hanya pola soal yang paling sering dilaporkan keluar oleh peserta.")),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "opt-requeue", checked: S.settings().requeue, onchange: function (e) { S.setFlag("requeue", e.target.checked); } }),
          h("span", null, h("b", null, "Ulangi yang salah sampai benar. "), "Soal yang dijawab salah muncul lagi beberapa soal kemudian dengan pilihan yang diacak ulang.")),
        h("div", { class: "row" },
          h("button", {
            class: "btn primary lg", type: "button", id: "btn-start", disabled: !chosen.length,
            onclick: function () { startPractice({ materi: chosen.map(function (m) { return m.id; }), n: st.n, hot: st.hot, title: "Latihan " + secName + (st.hot ? " prioritas" : "") }); }
          }, "Mulai latihan"),
          h("span", { class: "small muted" }, chosen.length ? "Tersedia " + stock + " soal bank" + (unlimited ? " ditambah soal yang dibangkitkan otomatis." : ".") : "Pilih minimal satu materi.")))
    ];
  }

  // ---------- simulasi ----------
  function viewSim() {
    var st = ui.sim, instant = st.instant == null ? S.settings().instant : st.instant, full = st.scale === "full";
    function scaleBtn(v, label) { return h("button", { type: "button", "aria-pressed": st.scale === v ? "true" : "false", onclick: function () { st.scale = v; render(); } }, label); }
    function modeBtn(v, label) { return h("button", { type: "button", "aria-pressed": instant === v ? "true" : "false", onclick: function () { st.instant = v; S.setFlag("instant", v); render(); } }, label); }
    var hist = S.history().slice(-5).reverse();
    return [
      h("div", { class: "stack" }, h("h1", null, "Simulasi CAT"), h("p", { class: "lede" }, "Susunan soal, batas waktu, nomor soal, dan tombolnya mengikuti alur ujian CAT. Soal diambil acak dari bank, dengan soal yang belum pernah Anda kerjakan didahulukan.")),
      resumeCard(),
      h("section", { class: "panel" },
        h("div", { class: "tablewrap" }, h("table", { class: "data" },
          h("thead", null, h("tr", null, h("th", null, "Subtes"), h("th", { class: "n" }, "Soal"), h("th", { class: "n" }, "Nilai maksimal"), h("th", { class: "n" }, "Ambang batas"))),
          h("tbody", null, CFG.sections.map(function (s) {
            return h("tr", null, h("td", null, s.short + " · " + s.name), h("td", { class: "n" }, full ? s.count : E.simCount(s, "mini")), h("td", { class: "n" }, s.max), h("td", { class: "n" }, passOf(s.id)));
          })))),
        h("div", { class: "field" }, h("span", { class: "label" }, "Paket"),
          h("div", { class: "seg", role: "group", "aria-label": "Paket" }, scaleBtn("full", "Penuh · 110 soal · 100 menit"), scaleBtn("mini", "Setengah · 55 soal · 50 menit")),
          full ? null : h("p", { class: "small muted" }, "Nilai paket setengah disetarakan ke skala penuh agar bisa dibandingkan dengan ambang batas.")),
        h("div", { class: "field" }, h("span", { class: "label" }, "Koreksi"),
          h("div", { class: "seg", role: "group", "aria-label": "Koreksi" }, modeBtn(true, "Langsung setelah menjawab"), modeBtn(false, "Di akhir, seperti ujian asli")),
          h("p", { class: "small muted" }, instant ? "Jawaban benar langsung ditandai hijau dan pembahasan muncul. Jawaban terkunci setelah dipilih." : "Tidak ada koreksi selama ujian. Jawaban boleh diganti sampai Anda menekan Selesai Ujian, lalu nilai dan pembahasan ditampilkan.")),
        h("div", { class: "row" }, h("button", { class: "btn primary lg", type: "button", id: "btn-start", onclick: function () { startSim(st.scale, instant); } }, "Mulai simulasi"))),
      hist.length ? h("section", { class: "stack" }, h("h2", null, "Simulasi terakhir"), histTable(hist)) : null
    ];
  }
  function histTable(list) {
    return h("div", { class: "card tablewrap" }, h("table", { class: "data" },
      h("thead", null, h("tr", null, h("th", null, "Waktu"), h("th", null, "Paket"), h("th", { class: "n" }, "TWK"), h("th", { class: "n" }, "TIU"), h("th", { class: "n" }, "TKP"), h("th", { class: "n" }, "Total"), h("th", null, "Ambang batas"))),
      h("tbody", null, list.map(function (x) {
        return h("tr", null, h("td", null, fmtDate(x.t)), h("td", null, x.kind === "mini" ? "Setengah" : "Penuh"),
          h("td", { class: "n" }, x.s.twk[0]), h("td", { class: "n" }, x.s.tiu[0]), h("td", { class: "n" }, x.s.tkp[0]), h("td", { class: "n" }, h("b", null, x.total)),
          h("td", null, h("span", { class: "tag " + (x.pass ? "ok" : "bad") }, x.pass ? "Terpenuhi" : "Belum terpenuhi")));
      }))));
  }

  // ---------- hasil ----------
  function materiTable(res) {
    var rows = [];
    CFG.sections.forEach(function (sec) {
      var mats = CFG.materi.filter(function (m) { return m.sec === sec.id && res.score.materi[m.id]; });
      if (!mats.length) return;
      rows.push(h("tr", { class: "grp" }, h("td", { colspan: 4 }, sec.short + " · " + sec.name)));
      mats.forEach(function (m) {
        var b = res.score.materi[m.id], p = pct(b.pts, b.max);
        rows.push(h("tr", null, h("td", null, m.name), h("td", { class: "n" }, b.answered + " / " + b.n),
          h("td", { class: "n" }, sec.id === "tkp" ? (b.answered ? dec(b.pts / b.answered) : "0") + " poin" : b.right + " benar"),
          h("td", null, h("div", { class: "row", style: "gap:8px;flex-wrap:nowrap" }, meter(p, sevClass(p)), h("span", { class: "small tab" }, p + "%")))));
      });
    });
    return h("div", { class: "card tablewrap" }, h("table", { class: "data" },
      h("thead", null, h("tr", null, h("th", null, "Materi"), h("th", { class: "n" }, "Dijawab"), h("th", { class: "n" }, "Hasil"), h("th", null, "Perolehan poin"))),
      h("tbody", null, rows)));
  }
  function viewResult() {
    var res = ui.result, sc = res.score, exam = res.kind === "simulasi", head;
    var real = res.items.filter(function (i) { return !i.retry; });
    var missIds = real.filter(function (i) { return isMiss(i) && i.pq.id; }).map(function (i) { return i.pq.id; });
    if (exam) {
      var sim = simScores(res);
      head = [
        h("div", { class: "verdict-box " + (sim.pass ? "pass" : "fail") },
          h("div", { class: "small muted" }, res.title + " · " + (res.scale === "mini" ? "paket setengah, disetarakan ke skala penuh" : "paket penuh") + " · " + fmtTime(res.elapsed, true)),
          h("div", { class: "big" }, sim.total + " / 550"),
          h("div", { class: "st" }, sim.pass ? "Memenuhi ambang batas ketiga subtes" : "Belum memenuhi ambang batas"),
          h("div", { class: "small" }, sc.answered + " dari " + sc.count + " soal dijawab." + (res.auto ? " Waktu habis." : ""))),
        h("div", { class: "card tablewrap" }, h("table", { class: "data" },
          h("thead", null, h("tr", null, h("th", null, "Subtes"), h("th", { class: "n" }, "Dijawab"), h("th", { class: "n" }, "Nilai"), h("th", { class: "n" }, "Ambang batas"), h("th", null, "Status"))),
          h("tbody", null, CFG.sections.map(function (sec) {
            var b = sc.sec[sec.id], v = sim[sec.id];
            return h("tr", null, h("td", null, h("b", null, sec.short), " · " + sec.name), h("td", { class: "n" }, b.answered + " / " + b.n),
              h("td", { class: "n" }, h("b", null, v.scaled), res.scale === "mini" ? h("span", { class: "muted" }, " (" + v.raw + ")") : null),
              h("td", { class: "n" }, passOf(sec.id)), h("td", null, h("span", { class: "tag " + (v.ok ? "ok" : "bad") }, v.ok ? "Terpenuhi" : "Kurang " + (passOf(sec.id) - v.scaled))));
          }))))
      ];
    } else {
      var obj = sc.sec.twk.n + sc.sec.tiu.n, objRight = sc.sec.twk.right + sc.sec.tiu.right, tk = sc.sec.tkp, parts = [];
      if (obj) parts.push(objRight + " dari " + obj + " benar");
      if (tk.n) parts.push("TKP rata-rata " + (tk.answered ? dec(tk.pts / tk.answered) : "0") + " dari 5 poin");
      head = [h("div", { class: "verdict-box" },
        h("div", { class: "small muted" }, res.title),
        h("div", { class: "big" }, parts.join(" · ")),
        h("div", { class: "small" }, "Waktu " + fmtTime(res.elapsed) + (sc.answered ? ", rata-rata " + Math.round(res.elapsed / sc.answered) + " detik per soal" : "") + ". Target ujian sekitar 54 detik per soal."))];
    }
    return [
      h("h1", null, exam ? "Hasil simulasi" : "Hasil latihan"), head,
      h("div", { class: "row" },
        missIds.length ? h("button", { class: "btn primary", type: "button", onclick: function () { startReview(missIds, "Ulangi soal yang salah"); } }, "Ulangi " + Math.min(30, missIds.length) + " soal yang salah") : null,
        h("a", { class: "btn", href: exam ? "#simulasi" : "#latihan" }, exam ? "Simulasi baru" : "Latihan lagi"),
        h("a", { class: "btn ghost", href: "#beranda" }, "Beranda")),
      h("section", { class: "stack" }, h("h2", null, "Per materi"), materiTable(res)),
      reviewSection(real)
    ];
  }
  function reviewSection(items) {
    var f = ui.rvFilter, counts = { semua: items.length, salah: 0, benar: 0 };
    items.forEach(function (it) { if (isMiss(it)) counts.salah++; else counts.benar++; });
    if (f === "salah" && !counts.salah) f = "semua";
    var shown = items.map(function (it, i) { return { it: it, no: i + 1 }; }).filter(function (x) { return f === "semua" || (f === "salah") === isMiss(x.it); });
    function chip(v, label) {
      return h("button", { class: "chip", type: "button", "aria-pressed": f === v ? "true" : "false", onclick: function () { ui.rvFilter = v; render(); } }, label, h("span", { class: "n" }, counts[v]));
    }
    return h("section", { class: "stack", id: "bahas" }, h("h2", null, "Pembahasan"),
      h("div", { class: "chips" }, chip("salah", "Salah atau kosong"), chip("benar", "Benar"), chip("semua", "Semua")),
      h("div", { class: "rv" }, shown.map(function (x) {
        return h("article", { class: "rv-item" },
          h("div", { class: "qhead" }, h("span", { class: "no" }, "No. " + x.no), qHeadTags(x.it)),
          qBody(x.it.pq), optsView(x.it, true, null), feedbackView(x.it));
      })));
  }

  // ---------- ulangi salah ----------
  function viewReview() {
    var all = S.reviewIds(), bySec = {};
    CFG.sections.forEach(function (s) { bySec[s.id] = S.reviewIds(s.id); });
    if (!all.length) {
      return [h("div", { class: "stack" }, h("h1", null, "Ulangi soal yang salah"),
        h("p", { class: "lede" }, "Belum ada soal yang perlu diulang. Soal yang Anda jawab salah saat latihan atau simulasi akan terkumpul di sini, dan keluar dari daftar setelah dijawab benar.")),
        h("div", { class: "row" }, h("a", { class: "btn primary", href: "#latihan" }, "Mulai latihan"))];
    }
    return [
      h("div", { class: "stack" }, h("h1", null, "Ulangi soal yang salah"),
        h("p", { class: "lede" }, "Daftar ini berisi soal yang terakhir kali Anda jawab salah (untuk TKP: 3 poin atau kurang). Soal keluar dari daftar setelah Anda menjawabnya dengan benar.")),
      resumeCard(),
      h("div", { class: "tiles" },
        h("div", { class: "tile" }, h("span", { class: "l" }, "Perlu diulang"), h("span", { class: "v" }, all.length)),
        CFG.sections.map(function (s) { return h("div", { class: "tile" }, h("span", { class: "l" }, s.short), h("span", { class: "v" }, bySec[s.id].length)); })),
      h("div", { class: "row" },
        h("button", { class: "btn primary lg", type: "button", id: "btn-start", onclick: function () { startReview(all, "Ulangi soal yang salah"); } }, "Ulangi " + Math.min(30, all.length) + " soal terbaru"),
        CFG.sections.map(function (s) {
          return bySec[s.id].length ? h("button", { class: "btn", type: "button", onclick: function () { startReview(bySec[s.id], "Ulangi " + s.short); } }, "Hanya " + s.short) : null;
        }))
    ];
  }

  // ---------- statistik ----------
  function viewStats() {
    var ms = S.materiStats(), tot = { seen: 0, right: 0 }, tkp = { seen: 0, pts: 0 }, rows = [], hist = S.history();
    CFG.sections.forEach(function (sec) {
      rows.push(h("tr", { class: "grp" }, h("td", { colspan: 5 }, sec.short + " · " + sec.name)));
      CFG.materi.filter(function (m) { return m.sec === sec.id; }).forEach(function (m) {
        var st = ms[m.id], p = sec.id === "tkp" ? pct(st.pts, st.seen * 5) : pct(st.right, st.seen);
        if (sec.id === "tkp") { tkp.seen += st.seen; tkp.pts += st.pts; } else { tot.seen += st.seen; tot.right += st.right; }
        rows.push(h("tr", null, h("td", null, m.name), h("td", { class: "n" }, st.seen),
          h("td", { class: "n" }, m.gen >= 1 ? "–" : st.mastered + " / " + st.total), h("td", { class: "n" }, m.gen >= 1 ? "–" : st.review),
          h("td", null, st.seen ? h("div", { class: "row", style: "gap:8px;flex-wrap:nowrap" }, meter(p, sevClass(p)), h("span", { class: "small tab" }, sec.id === "tkp" ? dec(st.pts / st.seen) + " poin" : p + "%")) : h("span", { class: "muted small" }, "belum ada data"))));
      });
    });
    var best = hist.reduce(function (a, x) { return Math.max(a, x.total); }, 0);
    return [
      h("div", { class: "stack" }, h("h1", null, "Statistik"), h("p", { class: "lede" }, "Progres tersimpan di perangkat ini" + (S.cloudState() === "aktif" ? " dan tersinkron ke akun Anda." : "."))),
      h("div", { class: "tiles" },
        h("div", { class: "tile" }, h("span", { class: "l" }, "Soal dikerjakan"), h("span", { class: "v" }, tot.seen + tkp.seen)),
        h("div", { class: "tile" }, h("span", { class: "l" }, "Akurasi TWK dan TIU"), h("span", { class: "v" }, tot.seen ? pct(tot.right, tot.seen) + "%" : "–")),
        h("div", { class: "tile" }, h("span", { class: "l" }, "Rata-rata poin TKP"), h("span", { class: "v" }, tkp.seen ? dec(tkp.pts / tkp.seen) : "–"), h("span", { class: "d" }, "butuh sekitar 3,7 untuk ambang batas 166")),
        h("div", { class: "tile" }, h("span", { class: "l" }, "Nilai simulasi terbaik"), h("span", { class: "v" }, hist.length ? best : "–"), h("span", { class: "d" }, hist.length + " simulasi selesai"))),
      h("section", { class: "stack" }, h("h2", null, "Per materi"),
        h("div", { class: "card tablewrap" }, h("table", { class: "data" },
          h("thead", null, h("tr", null, h("th", null, "Materi"), h("th", { class: "n" }, "Dikerjakan"), h("th", { class: "n" }, "Dikuasai"), h("th", { class: "n" }, "Perlu diulang"), h("th", null, "Akurasi"))),
          h("tbody", null, rows))),
        h("p", { class: "small muted" }, "Dikuasai berarti soal dijawab benar dua kali berturut-turut. Soal figural dan sebagian deret dibangkitkan otomatis, jadi tidak dihitung per butir.")),
      h("section", { class: "stack" }, h("h2", null, "Riwayat simulasi"),
        hist.length ? histTable(hist.slice().reverse()) : h("p", { class: "muted" }, "Belum ada simulasi yang selesai."))
    ];
  }

  // ---------- peta materi ----------
  function viewMap() {
    var R = CFG.riset;
    return [
      h("div", { class: "stack" }, h("h1", null, "Peta materi"),
        h("p", { class: "lede" }, "Soal CAT bersifat rahasia dan diacak untuk tiap peserta, jadi tidak ada yang bisa memastikan soal tertentu keluar. Yang bisa dipetakan adalah materi dalam kisi-kisi resmi dan pola soal yang paling sering dilaporkan peserta. Bank soal di sini ditimbang ke pola-pola itu.")),
      h("section", { class: "panel" }, h("h2", null, "Status per " + R.tanggal), h("ul", { class: "plain-list" }, R.status.map(function (t) { return h("li", null, t); }))),
      h("section", { class: "panel" }, h("h2", null, "Yang paling sering dilaporkan keluar"), h("ul", { class: "plain-list" }, R.temuan.map(function (t) { return h("li", null, t); }))),
      CFG.sections.map(function (sec) {
        return h("section", { class: "stack" }, h("h2", null, sec.short + " · " + sec.name),
          h("div", { class: "peta-grid" }, CFG.materi.filter(function (m) { return m.sec === sec.id; }).map(function (m) {
            return h("article", { class: "peta-card" },
              h("div", { class: "row between" }, h("h3", null, m.name), h("span", { class: "tag" }, "±" + m.quota + " soal per ujian")),
              h("p", { class: "small muted" }, m.def),
              h("ul", null, m.pola.map(function (p) { return h("li", null, p); })),
              h("div", { class: "row between" },
                h("span", { class: "small muted" }, m.gen >= 1 ? "Soal dibangkitkan otomatis" : E.poolOf(m.id).length + " soal di bank" + (m.gen ? ", ditambah soal otomatis" : "")),
                h("button", { class: "btn sm", type: "button", onclick: function () { startPractice({ materi: [m.id], n: 10, hot: false, title: "Latihan " + m.name }); } }, "Latih materi ini")));
          })));
      }),
      h("section", { class: "panel" }, h("h2", null, "Sumber"),
        h("p", { class: "small muted" }, "Jumlah soal per materi tidak dipublikasikan resmi. Angka perkiraan di atas disusun dari laporan peserta dan bisa berbeda di ujian sesungguhnya."),
        h("ul", { class: "plain-list" }, R.sumber.map(function (s) { return h("li", null, h("a", { href: s.u, target: "_blank", rel: "noopener" }, s.t)); })))
    ];
  }

  // ---------- pengaturan ----------
  function viewSettings() {
    var set = S.settings();
    return [
      h("div", { class: "stack" }, h("h1", null, "Pengaturan")),
      h("section", { class: "panel" }, h("h2", null, "Ambang batas"),
        h("p", { class: "small muted" }, "Bawaan mengikuti KepmenPANRB 321/2024. Ubah bila keputusan untuk CPNS 2026 menetapkan angka lain."),
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
      h("section", { class: "panel" }, h("h2", null, "Cara berlatih"),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "set-instant", checked: set.instant, onchange: function (e) { S.setFlag("instant", e.target.checked); ui.sim.instant = null; } }),
          h("span", null, h("b", null, "Koreksi langsung pada simulasi. "), "Jawaban benar ditandai hijau begitu Anda memilih. Matikan untuk simulasi seperti ujian asli.")),
        h("label", { class: "check" }, h("input", { type: "checkbox", id: "set-requeue", checked: set.requeue, onchange: function (e) { S.setFlag("requeue", e.target.checked); } }),
          h("span", null, h("b", null, "Ulangi yang salah sampai benar. "), "Berlaku pada mode latihan."))),
      h("section", { class: "panel" }, h("h2", null, "Data progres"),
        h("p", { class: "small muted" }, S.cloudState() === "aktif" ? "Progres tersimpan di perangkat ini dan tersinkron ke akun Anda, sehingga terbawa ke perangkat lain." : "Progres tersimpan di peramban perangkat ini saja. Menghapus data situs akan menghapus progres."),
        h("div", { class: "row" }, h("button", {
          class: "btn danger", type: "button",
          onclick: function () {
            modal({ title: "Hapus semua progres?", body: "Statistik per soal, daftar soal yang perlu diulang, dan riwayat simulasi akan dihapus. Tindakan ini tidak bisa dibatalkan.", ok: "Hapus", okClass: "danger", onOk: function () { S.resetAll(); ui.saved = null; ui.result = null; render(); toast("Progres dihapus."); } });
          }
        }, "Hapus semua progres")))
    ];
  }

  // ---------- formasi (isi ada di js/formasi.js) ----------
  function viewFormasi() {
    return SKD.formasiView({ h: h, toast: toast, rerender: function () { render(); }, history: function () { return S.history(); } });
  }

  // ---------- router ----------
  var VIEWS = { beranda: viewHome, latihan: viewPractice, simulasi: viewSim, ulang: viewReview, statistik: viewStats, peta: viewMap, formasi: viewFormasi, atur: viewSettings, kerjakan: viewQuiz, hasil: viewResult };
  function go(route) {
    if (location.hash.slice(1) === route) onHash();
    else location.hash = route;
  }
  function onHash() {
    var r = location.hash.slice(1) || "beranda";
    if (!VIEWS[r]) r = "beranda";
    if (r === "kerjakan" && !ui.session) r = "beranda";
    if (r === "hasil" && !ui.result) r = "beranda";
    if (r !== "kerjakan" && ui.session) { saveSession(); ui.saved = ui.session; ui.session = null; stopTimer(); }
    ui.route = r;
    closeModal();
    render(true);
    if (r === "kerjakan") startTimer();
  }
  function render(toTop) {
    document.body.classList.toggle("in-quiz", ui.route === "kerjakan");
    Array.prototype.forEach.call(document.querySelectorAll("#nav a"), function (a) {
      if (a.getAttribute("href") === "#" + ui.route) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    var sync = document.getElementById("sync");
    sync.hidden = S.cloudState() !== "aktif";
    var y = window.scrollY;
    app.textContent = "";
    add(app, VIEWS[ui.route]());
    if (ui.route === "kerjakan") paintClock();
    if (toTop) window.scrollTo(0, 0); else window.scrollTo(0, y);
  }

  document.addEventListener("keydown", function (e) {
    if (modalRoot.firstChild) { if (e.key === "Escape") closeModal(); return; }
    if (ui.route !== "kerjakan" || !ui.session || e.ctrlKey || e.metaKey || e.altKey) return;
    var tg = e.target, tn = tg && tg.tagName;
    if (tn === "INPUT" || tn === "TEXTAREA" || tn === "SELECT") return;
    var k = e.key.toLowerCase(), idx = "abcde".indexOf(k);
    if (idx < 0 && k.length === 1) idx = "12345".indexOf(k);
    if (idx >= 0 && k.length === 1) { e.preventDefault(); choose(idx); return; }
    if (e.key === "Enter" && tn !== "BUTTON" && tn !== "A" && tn !== "SUMMARY") {
      var s = ui.session, it = s.items[s.cur];
      if (!s.instant || it.done) { e.preventDefault(); next(); }
    }
  });
  window.addEventListener("hashchange", onHash);
  window.addEventListener("pagehide", saveSession);

  S.init();
  S.onChange(function () { if (ui.route !== "kerjakan") render(); });
  ui.saved = S.loadSession();
  // Halaman dimuat ulang di tengah sesi: langsung lanjutkan, jangan lempar ke beranda.
  if (location.hash === "#kerjakan" && ui.saved) { ui.session = ui.saved; ui.saved = null; }
  onHash();

  SKD.ui = ui; // untuk pengujian
})();

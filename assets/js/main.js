/* ==========================================================================
   OSCILLATOR — interface
   One requestAnimationFrame loop drives every moving part; each module only
   draws while it is on screen.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.OSCILLATOR;
  var E = window.OscEngine;
  if (!D) return;

  /* ─── utils ─────────────────────────────────────────────────────────── */
  var TAU = Math.PI * 2;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var pad = function (n, l) { return String(n).padStart(l || 2, '0'); };

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var DPR = function (cap) { return Math.min(window.devicePixelRatio || 1, cap || 2); };

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // *text* → <em>text</em>
  function rich(s) { return esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>'); }
  function fmtDur(sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s);
  }
  function fmtDate(iso) { return String(iso).split('-').join('.'); }

  function rand1(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return (x - Math.floor(x)) * 2 - 1; }
  function noise1(x) {
    var i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return lerp(rand1(i), rand1(i + 1), u);
  }

  // p is measured in cycles
  function waveAt(type, p) {
    var f = p - Math.floor(p);
    switch (type) {
      case 'square': return f < 0.5 ? 1 : -1;
      case 'saw': return 1 - 2 * f;
      case 'triangle': return 1 - 4 * Math.abs(f - 0.5);
      case 'pulse': return f < 0.22 ? 1 : -1;
      case 'fold': return Math.sin(Math.sin(p * TAU) * 2.3);
      case 'noise': return noise1(p * 6) * 0.9;
      default: return Math.sin(p * TAU);
    }
  }

  // every artist gets a deterministic "signal signature" from their slug
  var SIG_TYPES = ['sine', 'square', 'saw', 'triangle', 'pulse', 'fold'];
  var sigCache = {};
  function signature(slug) {
    if (sigCache[slug]) return sigCache[slug];
    var h = hash(slug), r = rng(h);
    return (sigCache[slug] = {
      seed: h,
      type: SIG_TYPES[Math.floor(r() * SIG_TYPES.length)],
      a: 1 + Math.floor(r() * 4),
      b: 2 + Math.floor(r() * 4),
      phase: r(),
      speed: 0.5 + r() * 0.9,
      cycles: 3 + Math.floor(r() * 4),
      rings: 13 + Math.floor(r() * 9),
      lobes: [r(), r(), r(), r(), r()]
    });
  }

  // concentric contour "sigil" — used when an artist has no photo
  function drawSigil(c, sig, t, w, h, accent) {
    c.fillStyle = '#070707';
    c.fillRect(0, 0, w, h);
    var cx = w / 2, cy = h * 0.5, R = Math.min(w, h) * 0.43, N = sig.rings;
    c.lineWidth = Math.max(1, w / 360);
    for (var k = 0; k < N; k++) {
      var f = (k + 1) / N, base = R * (0.1 + 0.9 * f);
      c.beginPath();
      for (var j = 0; j <= 160; j++) {
        var th = (j / 160) * TAU, m = 0;
        for (var q = 0; q < sig.lobes.length; q++) {
          m += (sig.lobes[q] - 0.5) * Math.cos((q + 2) * th) * (0.42 / (q + 1)) *
               (1 + 0.4 * Math.sin(t * sig.speed * (q + 1) * 0.6 + q * 1.7));
        }
        var r = base * (1 + m * f * 1.5);
        var x = cx + Math.sin(th) * r, y = cy - Math.cos(th) * r * 1.1;
        if (j) c.lineTo(x, y); else c.moveTo(x, y);
      }
      c.strokeStyle = 'rgba(233,231,223,' + (0.18 + 0.72 * f).toFixed(3) + ')';
      c.stroke();
    }
    c.fillStyle = accent || '#e9e7df';
    c.beginPath(); c.arc(cx, cy, Math.max(2, w / 80), 0, TAU); c.fill();
  }

  function sizeCanvas(cvs, cap) {
    var r = cvs.getBoundingClientRect(), d = DPR(cap);
    var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (cvs.width !== w || cvs.height !== h) { cvs.width = w; cvs.height = h; }
    return { w: w, h: h, d: d, ctx: cvs.getContext('2d') };
  }

  /* ─── shared state ──────────────────────────────────────────────────── */
  var S = {
    t: 0, dt: 0.016,
    vw: innerWidth, vh: innerHeight,
    mx: innerWidth / 2, my: innerHeight / 2, nx: 0.5, ny: 0.5, mvx: 0, mvy: 0,
    hasMouse: false, speed: 0,
    sy: scrollY, lastSy: scrollY, sv: 0,
    beat: 0, level: 0
  };
  var vis = {};
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { vis[e.target.dataset.watch] = e.isIntersecting; });
  }, { rootMargin: '120px 0px' }) : null;
  function watch(el, key) {
    if (!el) return;
    el.dataset.watch = key; vis[key] = true;
    if (io) io.observe(el);
  }

  /* ─── glyphs: tiny looping waveforms ────────────────────────────────── */
  function initGlyphs() {
    $$('svg.glyph').forEach(function (svg) {
      var type = svg.dataset.wave || 'sine', d = '';
      for (var i = 0; i <= 240; i++) {
        var y = type === 'noise' ? rand1(Math.floor(i / 3) % 40) * 0.95 : waveAt(type, i / 40);
        d += (i ? 'L' : 'M') + i + ' ' + (12 - y * 8.5).toFixed(2);
      }
      svg.innerHTML = '<g class="glyph__run"><path d="' + d + '"/></g>';
    });
  }

  /* ─── boot ─────────────────────────────────────────────────────────── */
  function boot() {
    return new Promise(function (resolve) {
      var el = $('.boot'), skip = reduced;
      try { if (sessionStorage.getItem('osc:booted')) skip = true; sessionStorage.setItem('osc:booted', '1'); } catch (e) { /* storage blocked */ }
      var done = function () { document.body.classList.remove('is-booting'); resolve(); };
      if (skip || !el) { if (el) el.remove(); done(); return; }

      var path = $('.boot__line path'), pct = $('.boot__pct'), t0 = performance.now(), DUR = 1500, fontsReady = false;
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { fontsReady = true; });
      (function step(now) {
        var k = Math.min(1, (now - t0) / DUR);
        var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var d = '';
        for (var i = 0; i <= 200; i++) {
          var env = Math.sin(Math.PI * i / 200);
          var y = 100 + Math.sin(i * 0.2 - now * 0.012) * 78 * e * env + (Math.random() - 0.5) * 10 * (1 - e) * env;
          d += (i ? 'L' : 'M') + i * 5 + ' ' + y.toFixed(1);
        }
        path.setAttribute('d', d);
        pct.textContent = pad(Math.floor(e * 100), 3);
        if (k < 1 || (!fontsReady && now - t0 < 3500)) requestAnimationFrame(step);
        else {
          el.classList.add('is-out');
          setTimeout(done, 300);
          setTimeout(function () { el.remove(); }, 1100);
        }
      })(t0);
    });
  }

  /* ─── clock ────────────────────────────────────────────────────────── */
  function initClock() {
    var els = $$('.nav__clock, .js-clock');
    var fmt;
    try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); }
    catch (e) { fmt = null; }
    var tick = function () {
      var s = fmt ? fmt.format(new Date()) : new Date().toTimeString().slice(0, 8);
      els.forEach(function (el) { el.textContent = (el.classList.contains('nav__clock') ? 'TEH ' : '') + s; });
    };
    tick(); setInterval(tick, 1000);
  }

  /* ─── 00 hero: wordmark + oscilloscope ─────────────────────────────── */
  var hero = { el: $('.hero'), wm: $('.wordmark'), letters: [], amp: 26, phase: 0, fx: 2.5, fy: 2, ph: 0, frame: 0 };

  function initHero() {
    $('.hero__tag').innerHTML = rich(D.label.tagline);
    hero.wm.innerHTML = D.label.name.toUpperCase().split('').map(function (c) {
      return '<span aria-hidden="true">' + esc(c) + '</span>';
    }).join('');
    hero.letters = $$('span', hero.wm);
    hero.cvs = $('.scope');
    hero.readX = $('.hero__x'); hero.readY = $('.hero__y'); hero.readP = $('.hero__phi'); hero.mode = $('.hero__hintmode');
    watch(hero.el, 'hero');
  }

  function fitWordmark() {
    var wm = hero.wm;
    wm.style.fontSize = '100px';
    hero.letters.forEach(function (l) { l.style.fontStretch = '100%'; l.style.fontWeight = '700'; });
    var w = hero.letters.reduce(function (s, l) { return s + l.getBoundingClientRect().width; }, 0) || 1;
    var target = hero.el.clientWidth * 0.93;
    wm.style.fontSize = (100 * target / w).toFixed(2) + 'px';
  }

  function resizeScope() {
    var s = sizeCanvas(hero.cvs, 1.6);
    hero.ctx = s.ctx; hero.w = s.w; hero.h = s.h; hero.d = s.d;
    hero.ctx.fillStyle = '#070707'; hero.ctx.fillRect(0, 0, s.w, s.h);
  }

  function drawHero() {
    var n = hero.letters.length;
    // wordmark: a travelling wave through font-stretch & weight (the sum of widths stays ~constant)
    if (!reduced) {
      var prox = 0.5;
      if (S.hasMouse) prox = clamp(S.my / S.vh, 0, 1);
      hero.amp = lerp(hero.amp, Math.min(44, 20 + prox * 22 + S.beat * 12), 0.06);
      hero.phase += S.dt * (1.1 + S.nx * 2.4 + S.level * 3);
      for (var i = 0; i < n; i++) {
        var ph = hero.phase - (i * TAU) / n;
        var st = clamp(100 + hero.amp * Math.sin(ph), 50, 150);
        var wg = clamp(560 + 250 * Math.sin(ph + 1.3) + S.beat * 170, 100, 900);
        hero.letters[i].style.fontStretch = st.toFixed(1) + '%';
        hero.letters[i].style.fontWeight = wg.toFixed(0);
      }
    }

    // scope
    var c = hero.ctx, w = hero.w, h = hero.h, d = hero.d;
    if (!c) return;
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = reduced ? '#070707' : 'rgba(7,7,7,0.17)';
    c.fillRect(0, 0, w, h);
    var cx = w / 2, cy = h * 0.4, R = Math.min(w * 0.3, h * 0.27);
    c.beginPath();
    var buf = E && E.on ? E.wave() : null;
    if (buf) {
      // delay-coordinate embedding of the live audio: x = s(t), y = s(t + τ)
      // one-pole lowpass so the hats don't fray the figure — kick & bass draw the shape
      var sm = hero.sm || (hero.sm = new Float32Array(buf.length)), acc = buf[0];
      for (var q = 0; q < buf.length; q++) { acc += (buf[q] - acc) * 0.22; sm[q] = acc; }
      var lag = 12 + Math.round(S.nx * 70), N = buf.length - lag, G = R * 2.1;
      for (var k = 0; k < N; k += 2) {
        var x = cx + sm[k] * G, y = cy - sm[k + lag] * G;
        if (k) c.lineTo(x, y); else c.moveTo(x, y);
      }
      if (++hero.frame % 6 === 0) {
        hero.readX.textContent = 'τ ' + pad(lag, 3) + ' SMP';
        hero.readY.textContent = 'LPF ' + Math.round(90 + Math.pow(E.cutoff, 2.2) * 4200) + ' HZ';
        hero.readP.textContent = 'RMS ' + S.level.toFixed(3);
      }
    } else {
      hero.fx = lerp(hero.fx, 1 + S.nx * 3, 0.03);
      hero.fy = lerp(hero.fy, 1 + (1 - S.ny) * 3, 0.03);
      hero.ph += S.dt * 0.35;
      var P = 900;
      for (var j = 0; j <= P; j++) {
        var s = (j / P) * TAU * 2;
        var m = 1 + 0.035 * Math.sin(s * 9 + S.t * 2);
        var lx = cx + Math.sin(hero.fx * s + hero.ph) * R * 1.35 * m;
        var ly = cy - Math.sin(hero.fy * s) * R * m;
        if (j) c.lineTo(lx, ly); else c.moveTo(lx, ly);
      }
      if (++hero.frame % 6 === 0) {
        hero.readX.textContent = 'X ' + hero.fx.toFixed(3);
        hero.readY.textContent = 'Y ' + hero.fy.toFixed(3);
        hero.readP.textContent = 'φ ' + ((hero.ph / Math.PI) % 2).toFixed(2) + 'π';
      }
    }
    c.globalCompositeOperation = 'lighter';
    c.lineJoin = 'round';
    c.strokeStyle = 'rgba(228, 228, 24,0.09)'; c.lineWidth = 7 * d; c.stroke();
    c.strokeStyle = 'rgba(228, 228, 24,0.85)'; c.lineWidth = 1.15 * d; c.stroke();
  }

  /* ─── rail: the one line that runs down the page ────────────────────── */
  var rail = { cvs: $('.rail__canvas'), label: $('.rail__label'), amp: 6, type: 'sine' };
  function resizeRail() {
    if (!rail.cvs || !rail.cvs.offsetWidth) { rail.ctx = null; return; }
    var s = sizeCanvas(rail.cvs, 2);
    rail.ctx = s.ctx; rail.w = s.w; rail.h = s.h; rail.d = s.d;
  }
  function drawRail() {
    var c = rail.ctx;
    if (!c) return;
    var w = rail.w, h = rail.h, d = rail.d;
    c.clearRect(0, 0, w, h);
    // ruler
    c.fillStyle = 'rgba(233,231,223,.18)';
    var step = 24 * d, off = ((S.sy * 0.5 * d) % step + step) % step;
    for (var y = -off, i = 0; y < h; y += step, i++) {
      var idx = Math.floor((S.sy * 0.5 * d + y) / step);
      var long = ((idx % 5) + 5) % 5 === 0;
      c.fillRect(w - (long ? 14 : 7) * d, y, (long ? 14 : 7) * d, 1 * d);
    }
    // waveform
    var target = 5 + Math.min(Math.abs(S.sv) * 0.012, 14) + S.level * 34 + S.beat * 5;
    rail.amp = lerp(rail.amp, reduced ? 5 : target, 0.12);
    var cx = w * 0.42, period = 84 * d, shift = (S.sy * 0.8 + (reduced ? 0 : S.t * 36)) * d;
    c.beginPath();
    for (var yy = 0; yy <= h; yy += 2 * d) {
      var x = cx + rail.amp * d * waveAt(rail.type, (yy + shift) / period);
      if (yy) c.lineTo(x, yy); else c.moveTo(x, yy);
    }
    c.strokeStyle = 'rgba(233,231,223,.62)'; c.lineWidth = 1.1 * d; c.stroke();
    // position marker
    var max = Math.max(1, S.docH - S.vh);
    c.fillStyle = '#e4e418';
    c.fillRect(w - 18 * d, (S.sy / max) * (h - 3 * d), 18 * d, 3 * d);
  }

  /* ─── crosshair cursor ─────────────────────────────────────────────── */
  var ch = { el: $('.crosshair'), x: $('.crosshair__x'), y: $('.crosshair__y'), read: $('.crosshair__read'), label: '', text: '' };
  function cursorLabel(el) {
    if (el.dataset.cursor) return el.dataset.cursor;
    if (el.classList.contains('tx__wave')) return 'Seek';
    if (el.tagName === 'A') return el.target === '_blank' ? 'Open ↗' : 'Go';
    if (el.tagName === 'SUMMARY') return 'Expand';
    return 'Press';
  }
  function initCursor() {
    if (!finePointer) return;
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('a, button, summary, [data-cursor], .tx__wave');
      ch.label = t ? cursorLabel(t) : '';
      ch.el.classList.toggle('is-link', !!t);
    });
  }
  function drawCursor() {
    if (!finePointer || !S.hasMouse) return;
    ch.x.style.transform = 'translate3d(0,' + S.my + 'px,0)';
    ch.y.style.transform = 'translate3d(' + S.mx + 'px,0,0)';
    var right = S.mx > S.vw - 160, bottom = S.my > S.vh - 60;
    ch.read.style.transform = 'translate3d(' + (right ? S.mx - 12 : S.mx + 12) + 'px,' + (bottom ? S.my - 28 : S.my + 10) + 'px,0)' + (right ? ' translateX(-100%)' : '');
    var txt = ch.label || (S.nx.toFixed(3) + ' · ' + (1 - S.ny).toFixed(3));
    if (txt !== ch.text) { ch.read.textContent = txt; ch.text = txt; }
  }

  /* ─── 01 carrier ───────────────────────────────────────────────────── */
  var carrier = { box: $('.carrier__text'), words: [] };
  function initCarrier() {
    carrier.box.innerHTML = D.label.about.map(function (p) { return '<p>' + rich(p) + '</p>'; }).join('');
    // wrap every word so it can be "tuned" individually
    var walker = document.createTreeWalker(carrier.box, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
        var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = tok;
        frag.appendChild(sp);
      });
      node.parentNode.replaceChild(frag, node);
    });
    carrier.words = $$('.w', carrier.box).map(function (el, i) { return { el: el, i: i, y: 0, h: 0, tx: -1, op: -1 }; });
    $('.facts').innerHTML = D.label.facts.map(function (f) {
      return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>';
    }).join('');
    watch(carrier.box, 'carrier');
  }
  function measureCarrier() {
    var top = carrier.box.getBoundingClientRect().top;
    carrier.words.forEach(function (w) { var r = w.el.getBoundingClientRect(); w.y = r.top - top; w.h = r.height; });
  }
  function drawCarrier() {
    if (reduced) return;
    var top = carrier.top, half = S.vh * 0.5;
    for (var i = 0; i < carrier.words.length; i++) {
      var w = carrier.words[i];
      var dist = (top + w.y + w.h / 2 - half) / half;
      var f = clamp(1 - Math.max(0, Math.abs(dist) - 0.2) * 1.4, 0, 1);
      var j = 1 - f;
      var tx = j * (Math.sin(w.i * 12.9898 + S.t * 9) * 26 + Math.sin(w.i * 3.1 + S.t * 23) * 9);
      var op = 0.1 + 0.9 * f;
      if (Math.abs(tx - w.tx) > 0.15 || Math.abs(op - w.op) > 0.004) {
        w.el.style.transform = tx ? 'translate3d(' + tx.toFixed(1) + 'px,0,0)' : '';
        w.el.style.opacity = op.toFixed(3);
        w.tx = tx; w.op = op;
      }
    }
  }

  /* ─── 02 voices: roster + preview ──────────────────────────────────── */
  var roster = { list: $('.roster'), rows: [] };
  var pv = { el: $('.preview'), cvs: $('.preview canvas'), row: null, x: 0, y: 0, rot: 0, disp: 1, on: false };

  function initRoster() {
    var A = D.artists;
    $('.voices__count').textContent = pad(A.length) + ' channels';
    roster.list.innerHTML = A.map(function (a, i) {
      return '<li class="row' + (a.placeholder ? ' is-placeholder' : '') + '">' +
        '<a class="row__link" href="#/artist/' + esc(a.slug) + '" data-slug="' + esc(a.slug) + '" data-cursor="Tune in">' +
          '<span class="row__ch mono">CH.' + pad(i + 1) + '</span>' +
          '<span class="row__name">' + esc(a.name) + '</span>' +
          '<span class="row__meta mono"><span class="row__city">' + esc(a.city || '') + '</span><span class="row__role">' + esc(a.role || '') + '</span></span>' +
          '<canvas class="row__wave" aria-hidden="true"></canvas>' +
          '<span class="row__arrow" aria-hidden="true">→</span>' +
          '<span class="row__thumb" aria-hidden="true">' + (a.photo ? '<img src="' + esc(a.photo) + '" alt="" loading="lazy">' : '<canvas></canvas>') + '</span>' +
        '</a></li>';
    }).join('');

    roster.rows = $$('.row__link', roster.list).map(function (link, i) {
      var a = A[i], row = { link: link, a: a, i: i, sig: signature(a.slug), cvs: $('.row__wave', link), amp: 0.3, hover: false, img: null };
      if (a.photo) { row.img = new Image(); row.img.src = a.photo; }
      var thumb = $('.row__thumb canvas', link);
      if (thumb) row.thumb = thumb;
      link.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') setHover(row, true); });
      link.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') setHover(row, false); });
      link.addEventListener('focus', function () { setHover(row, true, true); });
      link.addEventListener('blur', function () { setHover(row, false); });
      return row;
    });
    watch(roster.list, 'roster');
  }

  function setHover(row, on, noPreview) {
    row.hover = on;
    row.link.classList.toggle('is-hover', on);
    roster.list.classList.toggle('is-hovering', roster.rows.some(function (r) { return r.hover; }));
    if (on && !noPreview && finePointer) {
      if (!pv.on) { pv.x = S.mx + 30; pv.y = S.my - 150; }
      pv.row = row; pv.on = true; pv.disp = 1;
      pv.el.classList.add('is-on');
    } else if (!on && pv.row === row) {
      pv.on = false; pv.el.classList.remove('is-on');
    }
  }

  function resizeRoster() {
    roster.rows.forEach(function (r) {
      var s = sizeCanvas(r.cvs, 2);
      r.ctx = s.ctx; r.w = s.w; r.h = s.h; r.d = s.d;
      if (r.thumb) { var t = sizeCanvas(r.thumb, 2); drawSigil(t.ctx, r.sig, 0, t.w, t.h); }
    });
    if (pv.cvs) {
      var p = sizeCanvas(pv.cvs, 1.5); pv.ctx = p.ctx; pv.w = p.w; pv.h = p.h;
      pv.elW = pv.el.offsetWidth; pv.elH = pv.el.offsetHeight;
    }
  }

  function drawRoster() {
    for (var i = 0; i < roster.rows.length; i++) {
      var r = roster.rows[i], c = r.ctx;
      if (!c || !r.w) continue;
      c.clearRect(0, 0, r.w, r.h);
      r.amp = lerp(r.amp, r.hover ? 1 : 0.32, 0.1);
      var sig = r.sig, spd = reduced ? 0 : S.t * sig.speed * (r.hover ? 1.8 : 0.55);
      c.beginPath();
      for (var x = 0; x <= r.w; x += 1.5 * r.d) {
        var p = (x / r.w) * sig.cycles + spd;
        var y = waveAt(sig.type, p) * 0.72 + 0.28 * Math.sin(p * TAU * sig.b + sig.phase * TAU);
        var edge = Math.sin(Math.PI * x / r.w); // taper the ends
        var yy = r.h / 2 - y * r.amp * edge * r.h * 0.4 * (1 + S.beat * 0.25);
        if (x) c.lineTo(x, yy); else c.moveTo(x, yy);
      }
      c.strokeStyle = r.hover ? '#e4e418' : 'rgba(233,231,223,.42)';
      c.lineWidth = 1.3 * r.d;
      c.stroke();
    }
  }

  function drawPreview() {
    if (!pv.on || !pv.ctx) return;
    var elW = pv.elW, elH = pv.elH;
    var tx = clamp(S.mx + 36, 8, S.vw - elW - 8), ty = clamp(S.my - elH / 2, 8, S.vh - elH - 8);
    if (S.mx + 36 + elW > S.vw - 8) tx = S.mx - elW - 36;
    pv.x = lerp(pv.x, tx, 0.16); pv.y = lerp(pv.y, ty, 0.16);
    pv.rot = lerp(pv.rot, clamp(S.mvx * 0.35, -7, 7), 0.1);
    pv.el.style.transform = 'translate3d(' + pv.x.toFixed(1) + 'px,' + pv.y.toFixed(1) + 'px,0) rotate(' + pv.rot.toFixed(2) + 'deg)';
    pv.el.classList.toggle('is-tint', S.beat > 0.55);

    var c = pv.ctx, w = pv.w, h = pv.h, row = pv.row;
    pv.disp = lerp(pv.disp, reduced ? 0 : 0.05 + Math.min(S.speed * 0.012, 0.5), 0.07);
    var img = row.img;
    if (img && img.complete && img.naturalWidth) {
      c.fillStyle = '#070707'; c.fillRect(0, 0, w, h);
      // cover-crop
      var ir = img.naturalWidth / img.naturalHeight, cr = w / h, sw, sh, sx, sy;
      if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) / 2; sy = 0; }
      else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) / 2; }
      var n = 56, dh = h / n, srcH = sh / n;
      for (var i = 0; i < n; i++) {
        var off = (Math.sin(i * 0.43 + S.t * 7) * 0.12 + Math.sin(i * 1.7 - S.t * 13) * 0.03) * w * pv.disp;
        c.drawImage(img, sx, sy + i * srcH, sw, srcH, off, i * dh, w, dh + 1);
      }
    } else {
      drawSigil(c, row.sig, S.t, w, h);
    }
  }

  /* ─── artist profile + routing ─────────────────────────────────────── */
  var pf = { el: $('#profile'), body: $('.profile__body'), open: false, slug: null, pushed: false, canvases: [], lastFocus: null };
  var LINK_NAMES = { instagram: 'Instagram', soundcloud: 'SoundCloud', residentadvisor: 'Resident Advisor', bandcamp: 'Bandcamp', beatport: 'Beatport', spotify: 'Spotify', youtube: 'YouTube' };

  function artistIndex(slug) { for (var i = 0; i < D.artists.length; i++) if (D.artists[i].slug === slug) return i; return -1; }

  function bookingHref() { return D.label.email ? 'mailto:' + D.label.email : D.label.instagram; }

  function profileHTML(a, i) {
    var n = D.artists.length, next = D.artists[(i + 1) % n], sig = signature(a.slug);
    var tx = (a.transmissions || []).map(function (id) { return D.transmissions.filter(function (t) { return t.id === id; })[0]; }).filter(Boolean);
    var links = Object.keys(a.links || {}).filter(function (k) { return a.links[k]; }).map(function (k) {
      return '<a class="mono" href="' + esc(a.links[k]) + '" target="_blank" rel="noopener">' + esc(LINK_NAMES[k] || k) + ' ↗</a>';
    }).join('');
    var videos = (a.videos || []).map(function (v) {
      if (v.youtube) return '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.youtube) + '" title="' + esc(v.caption || a.name + ' video') + '" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      return '<video src="' + esc(v.src) + '"' + (v.poster ? ' poster="' + esc(v.poster) + '"' : '') + ' controls playsinline preload="metadata"></video>';
    }).join('');
    var gallery = (a.photos || []).map(function (src) { return '<figure><img src="' + esc(src) + '" alt="' + esc(a.name) + '" loading="lazy"></figure>'; }).join('');

    return '<div class="pf">' +
      '<aside class="pf__media">' +
        '<div class="pf__portrait">' + (a.photo
          ? '<img src="' + esc(a.photo) + '" alt="' + esc(a.name) + ' portrait"><i class="pf__tint"></i>'
          : '<canvas class="pf__sigil" aria-hidden="true"></canvas>') + '</div>' +
        '<div class="pf__sig"><canvas class="pf__sigmini" aria-hidden="true"></canvas>' +
          '<dl class="mono"><dt>Wave</dt><dd>' + sig.type + '</dd><dt>Ratio</dt><dd>' + sig.a + ':' + sig.b + '</dd>' +
          '<dt>Phase</dt><dd>' + (sig.phase * 2).toFixed(2) + 'π</dd><dt>Seed</dt><dd>#' + sig.seed.toString(16).toUpperCase().slice(0, 6) + '</dd></dl>' +
        '</div>' +
      '</aside>' +
      '<div class="pf__content">' +
        '<p class="pf__role mono">' + ['<b>CH.' + pad(i + 1) + '</b>'].concat([a.role, a.city].filter(Boolean).map(esc)).join(' — ') + '</p>' +
        '<h2 class="pf__name" id="pf-name">' + esc(a.name) + '</h2>' +
        (a.placeholder ? '<p class="pf__note mono">Placeholder channel — replace in assets/js/data.js</p>' : '') +
        '<div class="pf__bio">' + (a.bio || []).map(function (p) { return '<p>' + rich(p) + '</p>'; }).join('') + '</div>' +
        (links ? '<div class="pf__links">' + links + '</div>' : '') +
        (tx.length ? '<section class="pf__block"><h3 class="mono"><span>Transmissions</span><span>' + pad(tx.length) + '</span></h3>' +
          tx.map(function (t) {
            return '<div class="pf__tx"><img src="' + esc(t.cover) + '" alt="" loading="lazy"><div><strong>' + esc(t.title) + '</strong>' +
              '<span class="mono">' + esc(t.type) + ' · ' + fmtDate(t.date) + ' · ' + fmtDur(t.duration) + '</span></div>' +
              '<a class="mono" href="#tx-' + esc(t.id) + '" data-listen="' + esc(t.id) + '" data-cursor="Play">Listen →</a></div>';
          }).join('') + '</section>' : '') +
        (videos ? '<section class="pf__block"><h3 class="mono"><span>Video</span><span>' + pad((a.videos || []).length) + '</span></h3><div class="pf__videos">' + videos + '</div></section>' : '') +
        (gallery ? '<section class="pf__block"><h3 class="mono"><span>Frames</span><span>' + pad(a.photos.length) + '</span></h3><div class="pf__gallery">' + gallery + '</div></section>' : '') +
        '<a class="cta pf__book" href="' + esc(bookingHref()) + '" target="_blank" rel="noopener">Booking &amp; inquiries — ' + esc(D.label.email || D.label.handle) + ' ↗</a>' +
      '</div>' +
    '</div>' +
    '<a class="pf__next" href="#/artist/' + esc(next.slug) + '" data-swap="' + esc(next.slug) + '" data-cursor="Next channel">' +
      '<span class="mono">Next channel — CH.' + pad(((i + 1) % n) + 1) + '</span><span class="pf__nextname">' + esc(next.name) + '</span></a>';
  }

  function renderProfile(slug) {
    var i = artistIndex(slug), a = D.artists[i], n = D.artists.length;
    pf.slug = slug;
    pf.body.innerHTML = profileHTML(a, i);
    $('.profile__ch').textContent = 'CH.' + pad(i + 1) + ' / ' + pad(n);
    $('.profile__prev').setAttribute('href', '#/artist/' + D.artists[(i - 1 + n) % n].slug);
    $('.profile__prev').dataset.swap = D.artists[(i - 1 + n) % n].slug;
    $('.profile__next').setAttribute('href', '#/artist/' + D.artists[(i + 1) % n].slug);
    $('.profile__next').dataset.swap = D.artists[(i + 1) % n].slug;
    pf.canvases = $$('.pf__sigil, .pf__sigmini', pf.body).map(function (cv) { return { cv: cv, sig: signature(slug) }; });
    requestAnimationFrame(sizeProfileCanvases);
    fitProfileName();
    if (E && E.on) E.setPattern(signature(slug).seed);
  }
  // keep the longest word of the name on one line (at its final, widest stretch)
  function fitProfileName() {
    var el = $('.pf__name', pf.body);
    if (!el) return;
    el.style.fontSize = '';
    var longest = Math.max.apply(null, el.textContent.split(/\s+/).map(function (w) { return w.length; }));
    var max = el.parentNode.clientWidth / (longest * 0.92);
    if (parseFloat(getComputedStyle(el).fontSize) > max) el.style.fontSize = max.toFixed(1) + 'px';
  }
  function sizeProfileCanvases() {
    pf.canvases.forEach(function (p) { var s = sizeCanvas(p.cv, 2); p.ctx = s.ctx; p.w = s.w; p.h = s.h; });
  }
  function drawProfile() {
    if (!pf.open) return;
    for (var i = 0; i < pf.canvases.length; i++) {
      var p = pf.canvases[i];
      if (p.ctx) drawSigil(p.ctx, p.sig, reduced ? 0 : S.t, p.w, p.h, '#e4e418');
    }
  }

  function bandFor(slug) {
    var link = $('.row__link[data-slug="' + slug + '"]');
    var r = link ? link.getBoundingClientRect() : null;
    if (!r || r.bottom < 0 || r.top > S.vh) r = { top: S.vh / 2 - 1, bottom: S.vh / 2 + 1 };
    pf.el.style.setProperty('--ct', Math.max(0, r.top) + 'px');
    pf.el.style.setProperty('--cb', Math.max(0, S.vh - r.bottom) + 'px');
  }

  function openProfile(slug, pushed) {
    if (artistIndex(slug) < 0) return;
    if (pf.open) {
      if (slug === pf.slug) return;
      pf.body.classList.add('is-swapping');
      setTimeout(function () {
        renderProfile(slug);
        pf.el.scrollTop = 0;
        pf.body.classList.remove('is-swapping');
        // replay the name stretch
        var name = $('.pf__name', pf.body);
        if (name) { name.style.transition = 'none'; name.style.fontStretch = '50%'; void name.offsetWidth; name.style.transition = ''; name.style.fontStretch = ''; }
      }, 320);
      return;
    }
    pf.pushed = !!pushed;
    pf.lastFocus = document.activeElement;
    renderProfile(slug);
    bandFor(slug);
    pf.el.hidden = false;
    pf.el.scrollTop = 0;
    document.documentElement.classList.add('is-locked');
    pv.on = false; pv.el.classList.remove('is-on');
    roster.rows.forEach(function (r) { r.hover = false; r.link.classList.remove('is-hover'); });
    roster.list.classList.remove('is-hovering');
    void pf.el.offsetWidth;
    requestAnimationFrame(function () {
      pf.el.classList.add('is-open');
      pf.open = true;
      $('.profile__close').focus({ preventScroll: true });
    });
  }

  function closeProfile() {
    if (!pf.open) return;
    pf.open = false;
    bandFor(pf.slug);
    pf.el.classList.remove('is-open');
    if (E && E.on) E.setPattern(null);
    setTimeout(function () {
      if (pf.open) return;
      pf.el.hidden = true;
      pf.body.innerHTML = '';
      document.documentElement.classList.remove('is-locked');
      if (pf.lastFocus && pf.lastFocus.focus) pf.lastFocus.focus({ preventScroll: true });
    }, 900);
  }

  function requestClose() {
    if (pf.pushed) { history.back(); return; }
    history.replaceState(null, '', location.pathname + location.search);
    closeProfile();
  }

  function route(pushed) {
    var m = location.hash.match(/^#\/artist\/([\w-]+)$/);
    if (m) openProfile(m[1], pushed);
    else if (pf.open) closeProfile();
  }

  function initProfile() {
    $('.profile__close').addEventListener('click', requestClose);
    pf.el.addEventListener('click', function (e) {
      var swap = e.target.closest('[data-swap]');
      if (swap) { e.preventDefault(); location.replace('#/artist/' + swap.dataset.swap); return; }
      var listen = e.target.closest('[data-listen]');
      if (listen) {
        e.preventDefault();
        var id = listen.dataset.listen;
        requestClose();
        setTimeout(function () {
          var el = document.getElementById('tx-' + id);
          if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
          var o = txs.filter(function (x) { return x.t.id === id; })[0];
          if (o) Player.toggle(o);
        }, 950);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (!pf.open) return;
      if (e.key === 'Escape') { e.preventDefault(); requestClose(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (/INPUT|TEXTAREA|VIDEO/.test(document.activeElement.tagName)) return;
        var sel = e.key === 'ArrowRight' ? '.profile__next' : '.profile__prev';
        location.replace('#/artist/' + $(sel).dataset.swap);
      } else if (e.key === 'Tab') {
        // keep focus inside the dialog
        var f = $$('a[href], button, video, iframe, [tabindex]:not([tabindex="-1"])', pf.el).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('hashchange', function () { route(true); });
  }

  /* ─── 03 transmissions + player ────────────────────────────────────── */
  var txs = [];
  var ICON_PLAY = '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
  var ICON_PAUSE = '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>';

  function artistName(slug) { var i = artistIndex(slug); return i < 0 ? slug : D.artists[i].name; }

  function initTransmissions() {
    var list = $('.tx-list'), T = D.transmissions;
    var maxDur = Math.max.apply(null, T.map(function (t) { return t.duration || 1; }));
    list.innerHTML = T.map(function (t, i) {
      var tl = t.tracklist || [];
      var by = artistIndex(t.artist) >= 0
        ? '<a href="#/artist/' + esc(t.artist) + '">' + esc(artistName(t.artist)) + '</a>'
        : esc(t.artist || '');
      return '<article class="tx" id="tx-' + esc(t.id) + '" data-reveal>' +
        '<div class="tx__cover"><img src="' + esc(t.cover) + '" alt="' + esc(t.title) + ' — cover" loading="lazy"></div>' +
        '<div class="tx__body">' +
          '<p class="tx__meta mono"><span>TX—' + pad(i + 1) + '</span><span>' + esc(t.type) + '</span><span>' + fmtDate(t.date) + '</span><span>' + fmtDur(t.duration) + '</span>' +
            (tl.length ? '<span>' + tl.length + ' tracks</span>' : '') + '</p>' +
          '<h3 class="tx__title">' + esc(t.title) + '</h3>' +
          '<p class="tx__by">by ' + by + '</p>' +
          '<div class="tx__deck">' +
            '<button class="tx__play" type="button" aria-label="Play ' + esc(t.title) + '" data-cursor="Play">' + ICON_PLAY + ICON_PAUSE + '</button>' +
            '<div class="tx__wave" style="--len:' + ((t.duration || maxDur) / maxDur).toFixed(3) + '" role="slider" aria-label="Seek ' + esc(t.title) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><canvas aria-hidden="true"></canvas><span class="tx__time mono"></span></div>' +
          '</div>' +
          '<div class="tx__dur mono" style="--len:' + ((t.duration || maxDur) / maxDur).toFixed(3) + '"><span class="tx__pos">0:00</span><span>' + fmtDur(t.duration) + '</span></div>' +
          '<div class="tx__player"></div>' +
          (tl.length ? '<details class="tx__tracks"><summary class="mono"><span>Tracklist — ' + pad(tl.length) + '</span></summary><ol>' +
            tl.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></details>' : '') +
          (t.soundcloud ? '<a class="tx__ext mono" href="' + esc(t.soundcloud) + '" target="_blank" rel="noopener">Open on SoundCloud ↗</a>' : '') +
        '</div></article>';
    }).join('');

    txs = $$('.tx', list).map(function (el, i) {
      var o = { el: el, t: T[i], wave: $('.tx__wave', el), cvs: $('.tx__wave canvas', el), time: $('.tx__time', el), pos: $('.tx__pos', el), hover: -1, progress: 0, sec: 0 };
      var data = o.t.waveform;
      if (!data || !data.length) { var r = rng(hash(o.t.id)); data = []; for (var k = 0; k < 200; k++) data.push(0.25 + 0.75 * Math.pow(r(), 0.6)); }
      o.data = data;
      $('.tx__play', el).addEventListener('click', function () { Player.toggle(o); });
      o.wave.addEventListener('pointermove', function (e) {
        var r = o.wave.getBoundingClientRect(), f = clamp((e.clientX - r.left) / r.width, 0, 1);
        o.hover = f; o.time.textContent = fmtDur(f * o.t.duration); o.time.style.left = (f * 100) + '%';
        drawTx(o);
      });
      o.wave.addEventListener('pointerleave', function () { o.hover = -1; drawTx(o); });
      o.wave.addEventListener('click', function (e) {
        var r = o.wave.getBoundingClientRect();
        Player.toggle(o, clamp((e.clientX - r.left) / r.width, 0, 1));
      });
      o.wave.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Player.toggle(o); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          Player.toggle(o, clamp(o.progress + (e.key === 'ArrowRight' ? 0.05 : -0.05), 0, 1));
        }
      });
      var cover = $('.tx__cover', el);
      if (finePointer && !reduced) {
        cover.addEventListener('pointermove', function (e) {
          var r = cover.getBoundingClientRect();
          cover.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 16).toFixed(2) + 'deg');
          cover.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - 0.5) * 16).toFixed(2) + 'deg');
        });
        cover.addEventListener('pointerleave', function () { cover.style.setProperty('--rx', '0deg'); cover.style.setProperty('--ry', '0deg'); });
      }
      return o;
    });
  }

  function resizeTx() {
    txs.forEach(function (o) { var s = sizeCanvas(o.cvs, 2); o.ctx = s.ctx; o.w = s.w; o.h = s.h; o.d = s.d; drawTx(o); });
  }
  function drawTx(o) {
    var c = o.ctx;
    if (!c) return;
    var w = o.w, h = o.h, d = o.d, bw = 2 * d, gap = 2 * d, n = Math.max(1, Math.floor(w / (bw + gap)));
    c.clearRect(0, 0, w, h);
    for (var i = 0; i < n; i++) {
      var f = i / n, v = o.data[Math.floor(f * o.data.length)] || 0;
      var bh = Math.max(2 * d, v * h * 0.94);
      c.fillStyle = f < o.progress ? '#e4e418' : (o.hover >= 0 && f < o.hover ? 'rgba(233,231,223,.78)' : 'rgba(233,231,223,.26)');
      c.fillRect(i * (bw + gap), (h - bh) / 2, bw, bh);
    }
  }

  var deck = { el: $('.deck'), title: $('.deck__title'), time: $('.deck__time'), btn: $('.deck__toggle') };
  deck.show = function (o) {
    deck.cur = o; deck.el.hidden = false;
    document.documentElement.classList.add('has-deck');
    deck.title.textContent = o.t.title + ' — ' + artistName(o.t.artist);
    deck.update(o);
  };
  deck.update = function (o) {
    if (deck.cur !== o) return;
    deck.time.textContent = fmtDur(o.sec) + ' / ' + fmtDur(o.t.duration);
    deck.btn.textContent = o.playing ? '❚❚' : '▶';
    deck.btn.setAttribute('aria-label', o.playing ? 'Pause' : 'Play');
  };

  var Player = {
    api: null,
    loadApi: function () {
      if (window.SC && window.SC.Widget) return Promise.resolve();
      if (this.api) return this.api;
      var self = this;
      this.api = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://w.soundcloud.com/player/api.js'; s.async = true;
        s.onload = function () { resolve(); };
        s.onerror = function () { self.api = null; reject(new Error('SoundCloud API unavailable')); };
        document.head.appendChild(s);
      });
      return this.api;
    },
    pauseAll: function (except) {
      txs.forEach(function (x) { if (x !== except && x.widget && x.playing) x.widget.pause(); });
    },
    toggle: function (o, frac) {
      if (!o.t.soundcloud) return;
      if (E && E.on) setSignal(false);
      this.pauseAll(o);
      if (o.widget && o.ready) {
        if (frac != null) { o.widget.seekTo(frac * o.t.duration * 1000); o.widget.play(); }
        else o.widget.toggle();
        return;
      }
      if (o.loading) { o.pendingSeek = frac; return; }
      o.loading = true; o.pendingSeek = frac;
      o.el.classList.add('is-loading');
      var self = this;
      this.loadApi().then(function () {
        var box = $('.tx__player', o.el), ifr = document.createElement('iframe');
        ifr.allow = 'autoplay; encrypted-media';
        ifr.title = 'SoundCloud player — ' + o.t.title;
        ifr.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(o.t.soundcloud) +
          '&color=%23e4e418&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false';
        box.appendChild(ifr);
        var w = o.widget = window.SC.Widget(ifr), EV = window.SC.Widget.Events;
        var fail = setTimeout(function () { if (!o.ready) self.fail(o); }, 12000);
        w.bind(EV.READY, function () {
          o.ready = true; clearTimeout(fail);
          if (o.pendingSeek != null) w.seekTo(o.pendingSeek * o.t.duration * 1000);
          w.play();
          // if the browser blocked playback, reveal the real player so it can be pressed directly
          setTimeout(function () { if (!o.playing) { box.classList.add('is-visible'); o.el.classList.remove('is-loading'); } }, 2600);
        });
        w.bind(EV.PLAY, function () {
          o.playing = true; o.loading = false;
          o.el.classList.remove('is-loading'); o.el.classList.add('is-playing');
          if (E && E.on) setSignal(false);
          self.pauseAll(o);
          deck.show(o);
        });
        var stop = function () { o.playing = false; o.el.classList.remove('is-playing'); deck.update(o); };
        w.bind(EV.PAUSE, stop);
        w.bind(EV.FINISH, stop);
        w.bind(EV.PLAY_PROGRESS, function (e) {
          o.progress = e.relativePosition; o.sec = e.currentPosition / 1000;
          o.pos.textContent = fmtDur(o.sec);
          o.wave.setAttribute('aria-valuenow', Math.round(o.progress * 100));
          drawTx(o); deck.update(o);
        });
      }).catch(function () { self.fail(o); });
    },
    fail: function (o) {
      o.loading = false;
      o.el.classList.remove('is-loading');
      if ($('.tx__error', o.el)) return;
      var p = document.createElement('p');
      p.className = 'tx__error mono';
      p.innerHTML = 'SoundCloud couldn\'t be reached from here — <a href="' + esc(o.t.soundcloud) + '" target="_blank" rel="noopener">listen on SoundCloud ↗</a>';
      $('.tx__player', o.el).after(p);
    }
  };
  deck.btn.addEventListener('click', function () { if (deck.cur && deck.cur.widget) Player.toggle(deck.cur); });

  /* ─── 04 feedback: panorama + contact sheet ────────────────────────── */
  var fb = { track: $('.feedback__track'), pano: $('.pano'), img: null, x: 0, lastX: 0, v: 0, strips: reduced ? 1 : 9, tc: $('.feedback__tc') };
  function initFeedback() {
    var F = D.feedback || {};
    $('.feedback__cap').innerHTML = rich(F.caption || '');
    if (F.panorama) {
      fb.pano.innerHTML = '<canvas></canvas>';
      fb.cvs = $('canvas', fb.pano);
      fb.img = new Image();
      fb.img.src = F.panorama;
    } else {
      fb.track.style.height = 'auto';
    }
    var media = F.media || [];
    $('.sheet').innerHTML = media.map(function (m, i) {
      var inner = m.type === 'video'
        ? '<video src="' + esc(m.src) + '"' + (m.poster ? ' poster="' + esc(m.poster) + '"' : '') + ' muted loop playsinline preload="metadata"></video>'
        : '<img src="' + esc(m.src) + '" alt="' + esc(m.caption || '') + '" loading="lazy">';
      return '<figure class="frame" data-reveal><div class="frame__media">' + inner + '</div>' +
        '<figcaption class="frame__cap mono"><b>FR ' + pad(i + 1) + '</b><span>' + esc(m.caption || '') + '</span></figcaption></figure>';
    }).join('');
    // videos play only while visible
    if (io) {
      var vio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); } else e.target.pause(); });
      }, { threshold: 0.25 });
      $$('.sheet video').forEach(function (v) { vio.observe(v); });
    }
    watch($('.feedback__pin'), 'feedback');
  }
  function resizeFeedback() {
    if (!fb.cvs) return;
    var s = sizeCanvas(fb.cvs, 1.5);
    fb.ctx = s.ctx; fb.w = s.w; fb.h = s.h; fb.d = s.d;
  }
  // the panorama is cut into horizontal strips that shear apart with scroll speed
  function drawFeedback() {
    var img = fb.img, c = fb.ctx;
    if (!c || !img || !img.complete || !img.naturalWidth) return;
    var r = fb.rect;
    var p = clamp(-r.top / Math.max(1, r.height - S.vh), 0, 1);
    var scale = fb.h / img.naturalHeight, dw = img.naturalWidth * scale;
    var target = -Math.max(0, dw - fb.w) * p;
    fb.x = reduced ? target : lerp(fb.x, target, 0.14);
    fb.v = lerp(fb.v, fb.x - fb.lastX, 0.3);
    fb.lastX = fb.x;
    var shear = reduced ? 0 : Math.min(Math.abs(fb.v) * 2.2, 70 * fb.d) + S.beat * 8 * fb.d;
    var n = fb.strips, sh = fb.h / n, srcH = img.naturalHeight / n;
    c.fillStyle = '#070707'; c.fillRect(0, 0, fb.w, fb.h);
    for (var i = 0; i < n; i++) {
      var off = Math.sin(i * 0.95 + S.t * 5) * shear;
      c.drawImage(img, 0, i * srcH, img.naturalWidth, srcH, fb.x + off, i * sh, dw, sh + 1);
    }
    var frames = Math.floor(p * 3 * 60 * 25);
    fb.tc.textContent = '00:' + pad(Math.floor(frames / 1500)) + ':' + pad(Math.floor(frames / 25) % 60) + ':' + pad(frames % 25);
  }

  /* ─── 05 next signal ───────────────────────────────────────────────── */
  var ns = { cvs: null };
  function initEvents() {
    var box = $('.events'), E_ = (D.events || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (!E_.length) {
      box.innerHTML = '<div class="nosignal">' +
        '<canvas class="nosignal__line" aria-hidden="true"></canvas>' +
        '<p class="nosignal__big">No signal</p>' +
        '<div class="nosignal__row"><p>Nothing scheduled — yet. New dates are announced first on Instagram.</p>' +
        '<a class="cta" href="' + esc(D.label.instagram) + '" target="_blank" rel="noopener">Follow ' + esc(D.label.handle) + ' ↗</a></div></div>';
      ns.cvs = $('.nosignal__line', box);
      watch(ns.cvs, 'events');
      return;
    }
    var today = new Date().toISOString().slice(0, 10);
    box.innerHTML = E_.map(function (ev) {
      var parts = ev.date.split('-');
      var lineup = (ev.lineup || []).map(function (x) {
        return artistIndex(x) >= 0 ? '<a href="#/artist/' + esc(x) + '">' + esc(artistName(x)) + '</a>' : esc(x);
      }).join(', ');
      return '<article class="event' + (ev.date < today ? ' is-past' : '') + '" data-reveal>' +
        '<p class="event__date">' + parts[2] + '.' + parts[1] + '<small class="mono">' + parts[0] + (ev.date < today ? ' — past' : '') + '</small></p>' +
        '<div><h3 class="event__title">' + esc(ev.title) + '</h3>' +
        '<p class="event__where mono">' + esc([ev.venue, ev.city].filter(Boolean).join(' — ')) + '</p>' +
        (lineup ? '<p class="event__lineup">' + lineup + '</p>' : '') + '</div>' +
        (ev.link ? '<a class="cta" href="' + esc(ev.link) + '" target="_blank" rel="noopener">Info ↗</a>' : '<span></span>') +
        '</article>';
    }).join('');
  }
  function resizeEvents() { if (ns.cvs) { var s = sizeCanvas(ns.cvs, 2); ns.ctx = s.ctx; ns.w = s.w; ns.h = s.h; ns.d = s.d; } }
  function drawEvents() {
    var c = ns.ctx;
    if (!c) return;
    var w = ns.w, h = ns.h, d = ns.d, cy = h / 2;
    c.clearRect(0, 0, w, h);
    var period = w * 1.4, head = reduced ? w * 0.6 : ((S.t * w * 0.22) % period);
    c.beginPath();
    for (var x = 0; x <= w; x += 2 * d) {
      var dx = (x - head) / (w * 0.03);
      var blip = Math.exp(-dx * dx) * Math.sin(dx * 3.2) * h * 0.38;
      var y = cy + blip + noise1(x * 0.05 + S.t * 3) * 1.2 * d;
      if (x) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.strokeStyle = 'rgba(233,231,223,.55)'; c.lineWidth = 1.2 * d; c.stroke();
    c.fillStyle = '#e4e418';
    c.beginPath(); c.arc(head, cy, 3 * d, 0, TAU); c.fill();
  }

  /* ─── 06 output: theremin text ─────────────────────────────────────── */
  var th = { el: $('.theremin'), letters: [] };
  function initOutput() {
    var lines = [['Send', 'us'], ['your', '*signal*']];
    th.el.innerHTML = lines.map(function (words) {
      return '<span class="ln">' + words.map(function (wd) {
        var accent = /^\*.*\*$/.test(wd), word = wd.replace(/\*/g, '');
        return '<span class="wd">' + word.split('').map(function (ch_) {
          return '<span class="l"' + (accent ? ' style="color:var(--acid)"' : '') + ' aria-hidden="true">' + esc(ch_) + '</span>';
        }).join('') + '</span>';
      }).join(' ') + '</span>';
    }).join('');
    th.letters = $$('.l', th.el).map(function (el, i) { return { el: el, i: i, x: 0, y: 0, st: -1, wg: -1 }; });

    var L = D.label, keyv = D.artists[0];
    var follow = ['<li><a href="' + esc(L.instagram) + '" target="_blank" rel="noopener">Instagram ↗</a></li>'];
    if (L.soundcloud) follow.push('<li><a href="' + esc(L.soundcloud) + '" target="_blank" rel="noopener">SoundCloud ↗</a></li>');
    if (keyv && keyv.links && keyv.links.soundcloud) follow.push('<li><a href="' + esc(keyv.links.soundcloud) + '" target="_blank" rel="noopener">' + esc(keyv.name) + ' — SoundCloud ↗</a></li>');
    $('.output__grid').innerHTML =
      '<div><h3 class="mono">Demos &amp; bookings</h3><p>' + rich(L.demos) + '</p>' +
        '<a class="cta" href="' + esc(bookingHref()) + '" target="_blank" rel="noopener">' + (L.email ? 'Email ' + esc(L.email) : 'DM ' + esc(L.handle)) + ' ↗</a></div>' +
      '<div><h3 class="mono">Follow the signal</h3><ul>' + follow.join('') + '</ul></div>' +
      '<div><h3 class="mono">Transmitting from</h3><p class="output__city">' + esc(L.origin) + '</p><p class="mono js-clock" style="margin-top:10px;color:var(--acid)">--:--:--</p></div>';
    $('.year').textContent = new Date().getFullYear();
    watch(th.el, 'output');
  }
  function measureOutput() {
    th.letters.forEach(function (l) {
      var r = l.el.getBoundingClientRect();
      l.x = r.left + r.width / 2; l.y = r.top + S.sy + r.height / 2;
    });
  }
  function drawOutput() {
    if (reduced) return;
    var sig = S.vw * 0.13, sig2 = 2 * sig * sig, range = S.vw < 860 ? 40 : 95;
    for (var i = 0; i < th.letters.length; i++) {
      var l = th.letters[i], k;
      if (S.hasMouse) {
        var dx = l.x - S.mx, dy = l.y - S.sy - S.my;
        k = Math.exp(-(dx * dx + dy * dy) / sig2);
      } else {
        k = 0.5 + 0.5 * Math.sin(S.t * 1.6 - l.i * 0.45);
      }
      k = Math.min(1, k + S.beat * 0.15);
      var st = Math.round(55 + range * k), wg = Math.round(250 + 600 * k);
      if (st !== l.st || wg !== l.wg) {
        l.el.style.fontStretch = st + '%';
        l.el.style.fontWeight = wg;
        l.st = st; l.wg = wg;
      }
    }
  }

  /* ─── nav, menu, reveal, sections ──────────────────────────────────── */
  var sections = [];
  function initNav() {
    sections = $$('main > section, main > footer').map(function (el) {
      return { el: el, id: el.id, wave: el.dataset.wave || 'sine', label: el.dataset.label || '', link: $('.nav__links a[href="#' + el.id + '"]') };
    });
    var menu = $('#menu'), btn = $('.nav__menu');
    var setMenu = function (open) {
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close' : 'Menu';
      document.documentElement.classList.toggle('is-locked', open);
    };
    btn.addEventListener('click', function () { setMenu(menu.hidden); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

    if (io) {
      var rio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      $$('[data-reveal]').forEach(function (el) { rio.observe(el); });
    } else {
      $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
    }
  }
  var currentSection = null;
  function updateSection() {
    var mid = S.vh * 0.45, cur = sections[0];
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { cur = sections[i]; break; }
    }
    if (cur === currentSection) return;
    currentSection = cur;
    rail.type = cur.wave;
    if (rail.label) rail.label.textContent = cur.label;
    sections.forEach(function (s) { if (s.link) s.link.classList.toggle('is-active', s === cur); });
  }

  /* ─── signal (audio) ───────────────────────────────────────────────── */
  function applySignalUI() {
    var on = !!(E && E.on);
    document.documentElement.classList.toggle('signal-on', on);
    $$('.pwr').forEach(function (b) {
      b.setAttribute('aria-pressed', String(on));
      var l = $('.pwr__label', b);
      if (l) l.textContent = b.classList.contains('hero__pwr') ? (on ? 'Cut the signal' : 'Turn on the signal') : (on ? 'Signal on' : 'Signal off');
    });
    if (hero.mode) hero.mode.textContent = on ? 'x: delay τ · y: filter cutoff' : 'x: ratio · y: phase';
  }
  function setSignal(on) {
    if (!E || !E.supported()) return;
    if (on) {
      Player.pauseAll();
      E.start().then(function (ok) {
        if (!ok) return;
        E.setPattern(pf.open ? signature(pf.slug).seed : null);
        applySignalUI();
      });
    } else {
      E.stop();
      applySignalUI();
    }
  }
  function initSignal() {
    if (!E || !E.supported()) { $$('.pwr').forEach(function (b) { b.hidden = true; }); return; }
    $$('.pwr').forEach(function (b) { b.addEventListener('click', function () { setSignal(!E.on); }); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && E.on) setSignal(false); });
  }

  /* ─── input ────────────────────────────────────────────────────────── */
  function initInput() {
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse' && !S.hasMouse) { S.hasMouse = true; document.documentElement.classList.add('has-cursor'); }
      S.mvx = e.clientX - S.mx; S.mvy = e.clientY - S.my;
      S.mx = e.clientX; S.my = e.clientY;
      S.nx = S.mx / S.vw; S.ny = S.my / S.vh;
    }, { passive: true });
    document.addEventListener('pointerleave', function () { document.documentElement.classList.remove('has-cursor'); S.hasMouse = false; });
    window.addEventListener('scroll', function () { S.sy = window.scrollY; }, { passive: true });
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resizeAll, 120); });
  }

  // section titles never overflow their row
  function fitTitles() {
    $$('.sec__title').forEach(function (t) {
      t.style.fontSize = '';
      var avail = t.parentNode.clientWidth, w = t.scrollWidth;
      if (w > avail) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * avail / w * 0.98).toFixed(1) + 'px';
    });
  }

  function resizeAll() {
    S.vw = innerWidth; S.vh = innerHeight; S.sy = scrollY;
    fitTitles(); fitWordmark(); resizeScope(); resizeRail(); measureCarrier(); resizeRoster();
    resizeTx(); resizeFeedback(); resizeEvents(); measureOutput();
    if (pf.open) { sizeProfileCanvases(); fitProfileName(); }
  }

  /* ─── the loop ─────────────────────────────────────────────────────── */
  var pwrs = $$('.pwr');
  var last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    S.dt = dt; S.t += dt;

    // scroll velocity & pointer speed
    S.sv = lerp(S.sv, (S.sy - S.lastSy) / Math.max(dt, 0.001), 0.2);
    S.lastSy = S.sy;
    S.speed = lerp(S.speed, Math.hypot(S.mvx, S.mvy), 0.2);
    S.mvx *= 0.8; S.mvy *= 0.8;
    if (!S.hasMouse) { S.nx = 0.5 + 0.32 * Math.sin(S.t * 0.13); S.ny = 0.5 + 0.3 * Math.cos(S.t * 0.1); }

    // audio → visuals
    S.beat *= Math.exp(-dt * 7);
    if (E && E.on) {
      var at = E.now();
      while (E.beats.length && E.beats[0] <= at) { E.beats.shift(); S.beat = 1; }
      S.level = lerp(S.level, E.level(), 0.35);
      E.setCutoff(S.hasMouse ? 1 - S.ny : 0.38 + 0.3 * Math.sin(S.t * 0.35) + Math.min(Math.abs(S.sv) * 0.0005, 0.3));
    } else {
      S.level *= 0.9;
    }
    var b = S.beat.toFixed(3);
    if (b !== S.lastBeat) {
      S.lastBeat = b;
      hero.el.style.setProperty('--beat', b);
      for (var pi = 0; pi < pwrs.length; pi++) pwrs[pi].style.setProperty('--beat', b);
    }

    if (pf.open) { drawProfile(); drawCursor(); return; }

    // layout reads first, then writes — no forced reflow mid-frame
    updateSection();
    S.docH = document.documentElement.scrollHeight;
    if (vis.carrier) carrier.top = carrier.box.getBoundingClientRect().top;
    if (vis.feedback) fb.rect = fb.track.getBoundingClientRect();
    if (vis.hero !== false) drawHero();
    drawRail();
    drawCursor();
    if (vis.carrier) drawCarrier();
    if (vis.roster) drawRoster();
    drawPreview();
    if (vis.feedback) drawFeedback();
    if (vis.events) drawEvents();
    if (vis.output) drawOutput();
  }

  /* ─── go ───────────────────────────────────────────────────────────── */
  initGlyphs();
  initHero();
  initCarrier();
  initRoster();
  initTransmissions();
  initFeedback();
  initEvents();
  initOutput();
  initClock();
  initNav();
  initProfile();
  initCursor();
  initSignal();
  initInput();
  applySignalUI();
  resizeAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resizeAll);
  window.addEventListener('load', resizeAll);

  boot().then(function () {
    resizeAll();
    route(false);
  });
  requestAnimationFrame(frame);
})();

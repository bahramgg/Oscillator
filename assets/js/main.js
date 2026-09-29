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
    beat: 0, level: 0, beatCount: 0
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

  /* ─── boot: the "Oscillator Rises" intro ─────────────────────────────
     plays the label's own reel (muted: browsers only autoplay silently,
     with a Sound on button). If a phone refuses to autoplay, or the video
     is slow to start, a drawn version of the same sequence runs instead:
     black → centre mark → rotates & grows → yellow cuts → neon logo in the
     OSCILLATOR/ ring → WE ARE OSCILLATOR → hands over to the hero */
  function boot() {
    return new Promise(function (resolve) {
      var el = $('.boot'), skip = reduced;
      try { if (sessionStorage.getItem('osc:booted')) skip = true; sessionStorage.setItem('osc:booted', '1'); } catch (e) { /* storage blocked */ }
      var done = function () { document.body.classList.remove('is-booting'); resolve(); };
      if (skip || !el) { if (el) el.remove(); done(); return; }

      var pct = $('.boot__pct'), vid = $('.boot__video'), snd = $('.boot__sound');
      var t0 = performance.now(), timers = [], finished = false, mode = null;
      var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
      var cls = function (c, on) { el.classList.toggle(c, on !== false); };
      var flash = function (ms) { at(ms, function () { cls('is-flash'); }); at(ms + 110, function () { cls('is-flash', false); }); };
      var whenFonts = function (fn) { (document.fonts ? document.fonts.ready : Promise.resolve()).then(fn); };
      var finish = function () {
        if (finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        if (vid) { try { vid.pause(); } catch (e) { /* already gone */ } }
        el.classList.remove('is-flash');
        el.classList.add('is-out');
        done();
        setTimeout(function () { el.remove(); }, 900);
      };

      function cssIntro() {
        if (mode || finished) return;
        mode = 'css';
        if (vid) { try { vid.pause(); } catch (e) { /* noop */ } vid.remove(); vid = null; }
        if (snd) snd.hidden = true;
        t0 = performance.now();
        at(250, function () { cls('st-1'); });
        at(900, function () { cls('st-2'); });
        flash(1700); flash(2050); flash(2400);          // ≤ 3 flashes per second
        at(2700, function () { cls('st-3'); });
        flash(2750);
        at(3250, function () { cls('st-4'); });
        at(4300, function () { whenFonts(finish); });
      }
      function videoIntro() {
        if (mode || finished) return;
        mode = 'video';
        el.classList.add('is-video');
        if (snd) snd.hidden = false;
        vid.addEventListener('ended', function () { whenFonts(finish); });
        // the reel's yellow cuts fill the whole screen, not just the video square:
        // sample the frame and switch the page background with it
        var probe = document.createElement('canvas'); probe.width = probe.height = 8;
        var pc = probe.getContext('2d', { willReadFrequently: true });
        (function sync() {
          if (finished || !vid) return;
          try {
            pc.drawImage(vid, 0, 0, 8, 8);
            // average the frame's outer ring and paint the page with it, so the
            // video edge and the page are always the same colour
            var d = pc.getImageData(0, 0, 8, 8).data, r = 0, g = 0, bl = 0, n = 0;
            for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
              if (x > 0 && x < 7 && y > 0 && y < 7) continue;
              var k = (y * 8 + x) * 4; r += d[k]; g += d[k + 1]; bl += d[k + 2]; n++;
            }
            r /= n; g /= n; bl /= n;
            var lit = (r + g) / 2 > 100;
            el.classList.toggle('is-flash', lit);
            el.style.backgroundColor = lit ? 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (bl | 0) + ')' : '';
          } catch (e) { return; }
          requestAnimationFrame(sync);
        })();
        at(((isFinite(vid.duration) && vid.duration ? vid.duration : 7) + 1.5) * 1000, finish);  // if 'ended' never comes
      }

      // H.264 where supported (smallest), VP9 WebM otherwise
      var src = null;
      if (vid && vid.canPlayType) {
        if (vid.canPlayType('video/mp4; codecs="avc1.64001F, mp4a.40.2"')) src = vid.getAttribute('data-mp4');
        else if (vid.canPlayType('video/webm; codecs="vp9, opus"')) src = vid.getAttribute('data-webm');
      }
      if (src) {
        vid.addEventListener('playing', videoIntro, { once: true });
        vid.addEventListener('error', cssIntro, { once: true });
        vid.src = src;
        var p = vid.play();
        if (p && p.catch) p.catch(cssIntro);
        at(2500, function () { if (!mode) cssIntro(); });   // slow network: don't sit on a black screen
      } else {
        cssIntro();
      }

      if (snd) snd.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!vid) return;
        vid.muted = !vid.muted;
        if (!vid.muted) { vid.volume = 1; var pp = vid.play(); if (pp && pp.catch) pp.catch(function () {}); }
        snd.textContent = vid.muted ? 'Sound on' : 'Sound off';
        snd.setAttribute('aria-pressed', String(!vid.muted));
      });
      el.addEventListener('click', finish);
      document.addEventListener('keydown', function onKey(e) {
        if (e.target === snd && (e.key === 'Enter' || e.key === ' ')) return;
        document.removeEventListener('keydown', onKey);
        finish();
      });
      (function tick(now) {
        if (finished) return;
        var k = mode === 'video' && vid && vid.duration ? vid.currentTime / vid.duration : (now - t0) / 4300;
        pct.textContent = pad(Math.min(100, Math.floor(k * 100)), 3);
        requestAnimationFrame(tick);
      })(t0);
    });
  }

  /* ─── strobe: the reel's hard yellow cuts, on the hero only ───────────
     never more than two flashes a second; off for reduced motion */
  var strobe = { busy: false, next: 0 };
  function fireStrobe(pattern) {
    if (reduced || strobe.busy || !vis.hero || document.body.classList.contains('is-booting')) return;
    strobe.busy = true;
    var t = 0;
    (pattern || [90, 380, 90]).forEach(function (ms, i) {
      setTimeout(function () { hero.el.classList.toggle('is-strobe', i % 2 === 0); }, t);
      t += ms;
    });
    setTimeout(function () { hero.el.classList.remove('is-strobe'); strobe.busy = false; }, t);
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

  /* ─── 00 hero: logo halo + oscilloscope ───────────────────────────── */
  var hero = { el: $('.hero'), halo: $('.hero__halo'), fx: 2.5, fy: 2, ph: 0, frame: 0 };

  function initHero() {
    $('.hero__tag').innerHTML = rich(D.label.tagline);
    hero.cvs = $('.scope');
    hero.readX = $('.hero__x'); hero.readY = $('.hero__y'); hero.readP = $('.hero__phi'); hero.mode = $('.hero__hintmode');
    watch(hero.el, 'hero');
  }

  function resizeScope() {
    var s = sizeCanvas(hero.cvs, 1.6);
    hero.ctx = s.ctx; hero.w = s.w; hero.h = s.h; hero.d = s.d;
    // the trace orbits the logo halo
    var hr = hero.halo.getBoundingClientRect(), cr = hero.cvs.getBoundingClientRect();
    hero.cx = (hr.left + hr.width / 2 - cr.left) * s.d;
    hero.cy = (hr.top + hr.height / 2 - cr.top) * s.d;
    hero.R = hr.width * 0.62 * s.d;
  }

  function drawHero() {
    // scope
    var c = hero.ctx, w = hero.w, h = hero.h, d = hero.d;
    if (!c) return;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, w, h);   // transparent: no trail residue, no visible edge
    var cx = hero.cx, cy = hero.cy, R = hero.R;
    var pts = hero.pts || (hero.pts = new Float32Array(4400)), n = 0;
    var buf = E && E.on ? E.wave() : null;
    if (buf) {
      // delay-coordinate embedding of the live audio: x = s(t), y = s(t + τ)
      // one-pole lowpass so the hats don't fray the figure — kick & bass draw the shape
      var sm = hero.sm || (hero.sm = new Float32Array(buf.length)), acc = buf[0];
      for (var q = 0; q < buf.length; q++) { acc += (buf[q] - acc) * 0.22; sm[q] = acc; }
      var lag = 12 + Math.round(S.nx * 70), N = buf.length - lag, G = R * 3.4;
      for (var k = 0; k < N && n < 4400; k += 2) { pts[n++] = cx + sm[k] * G; pts[n++] = cy - sm[k + lag] * G; }
      if (hero.readX && ++hero.frame % 6 === 0) {
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
        pts[n++] = cx + Math.sin(hero.fx * s + hero.ph) * R * 1.35 * m;
        pts[n++] = cy - Math.sin(hero.fy * s) * R * m;
      }
      if (hero.readX && ++hero.frame % 6 === 0) {
        hero.readX.textContent = 'X ' + hero.fx.toFixed(3);
        hero.readY.textContent = 'Y ' + hero.fy.toFixed(3);
        hero.readP.textContent = 'φ ' + ((hero.ph / Math.PI) % 2).toFixed(2) + 'π';
      }
    }
    punkTrace(c, pts, n, d, !!buf);
  }

  // cheap deterministic noise: same inputs → same value, so the line "boils" in held frames
  function hsh(a, b) { var x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); }

  // photocopied, hand-cut trace: boiling jitter, torn gaps, uneven ink, off-register ghost,
  // a slice of the figure jumping sideways now and then, toner specks
  function punkTrace(c, pts, n, d, live) {
    if (reduced) { c.beginPath(); for (var r0 = 0; r0 < n; r0 += 2) { if (r0) c.lineTo(pts[r0], pts[r0 + 1]); else c.moveTo(pts[r0], pts[r0 + 1]); } c.strokeStyle = 'rgba(210,210,30,.8)'; c.lineWidth = d; c.stroke(); return; }
    var tq = Math.floor(S.t * 9), tg = Math.floor(S.t * 3), jit = (live ? 1.2 : 2.6) * d;
    var K = live ? 1 : 0.34;   // before the signal is on, the trace stays faint behind the logo
    // glitch slice: a horizontal band shifted sideways (about a third of the time)
    var gOn = hsh(tg, 7) < 0.34, gy = (0.2 + hsh(tg, 8) * 0.6) * hero.h, gh = (10 + hsh(tg, 9) * 60) * d, gdx = (hsh(tg, 10) - 0.5) * 120 * d;
    var SEG = 22, segs = Math.ceil(n / 2 / SEG);
    c.lineJoin = 'miter'; c.lineCap = 'butt';
    for (var pass = 0; pass < 2; pass++) {
      // pass 0: bone ghost, off-register; pass 1: the yellow ink
      var ox = pass ? 0 : 3 * d, oy = pass ? 0 : -2 * d;
      for (var sg = 0; sg < segs; sg++) {
        var cut = hsh(sg, Math.floor(S.t * 2) + pass * 13);
        if (cut < (pass ? 0.12 : 0.45)) continue;               // torn gaps
        var i0 = sg * SEG * 2, i1 = Math.min(n, i0 + SEG * 2 + 2);
        c.beginPath();
        for (var i = i0; i < i1; i += 2) {
          var x = pts[i], y = pts[i + 1], v = i >> 1;
          x += (hsh(v, tq) - 0.5) * jit; y += (hsh(v + 0.5, tq) - 0.5) * jit;
          if (gOn && y > gy && y < gy + gh) x += gdx;
          if (i === i0) c.moveTo(x + ox, y + oy); else c.lineTo(x + ox, y + oy);
        }
        var ink = hsh(sg, tq + 3);
        if (pass) {
          c.strokeStyle = 'rgba(0,0,0,' + (0.75 * K).toFixed(2) + ')'; c.lineWidth = 4 * d; c.stroke();
          c.strokeStyle = 'rgba(214,214,28,' + ((0.55 + ink * 0.4) * K).toFixed(2) + ')';
          c.lineWidth = (0.6 + ink * ink * (live ? 2.4 : 1.2)) * d;
        } else {
          c.strokeStyle = 'rgba(233,231,223,' + (0.22 * K).toFixed(2) + ')'; c.lineWidth = 0.8 * d;
        }
        c.stroke();
      }
    }
    // toner specks & scratches near the line
    c.fillStyle = 'rgba(233,231,223,' + (0.5 * K).toFixed(2) + ')';
    for (var k = 0; k < 26; k++) {
      var pi = (Math.floor(hsh(k, tq) * (n / 2)) * 2);
      var sx = pts[pi] + (hsh(k, tq + 1) - 0.5) * 40 * d, sy = pts[pi + 1] + (hsh(k, tq + 2) - 0.5) * 40 * d;
      var big = hsh(k, tq + 4);
      if (big > 0.9) c.fillRect(sx, sy, (8 + big * 20) * d, 1 * d);      // scratch
      else c.fillRect(sx, sy, (1 + big * 1.5) * d, (1 + big * 1.5) * d);
    }
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

  /* ─── 01 carrier ───────────────────────────────────────────────────── */
  var carrier = { box: $('.carrier__text'), words: [] };
  function initCarrier() {
    carrier.box.innerHTML = D.label.about.map(function (p) { return '<p>' + rich(p) + '</p>'; }).join('');
    carrier.words = [];
    $('.facts').innerHTML = D.label.facts.map(function (f) {
      return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>';
    }).join('');
    watch(carrier.box, 'carrier');
  }
  /* ─── tape: yellow strips cut in the logo's geometry (45° corners, a notch like its stroke ends),
     stuck on slightly crooked when they come into view ─────────────────── */
  function initTape() {
    var els = $$('.carrier__text em, .feedback__cap em, .pf__bio em, .theremin .tape');
    els.forEach(function (el, i) {
      el.classList.add('tape');
      var h = function (k) { return hsh(i + 1, 41 + k); }, sgn = i % 2 ? 1 : -1;
      el.style.setProperty('--tilt', (sgn * (1.2 + h(0) * 2)).toFixed(2) + 'deg');
      el.style.setProperty('--nudge', ((h(9) - 0.5) * 0.12).toFixed(3) + 'em');
      // each strip cut by hand: ends sliced at an angle, 45° corners of uneven size,
      // a stepped notch somewhere along the bottom, edges not quite parallel
      var a = (0.18 + h(1) * 0.3).toFixed(2), b = (0.18 + h(2) * 0.3).toFixed(2);
      var cl = (h(3) * 0.35).toFixed(2), cr = (h(4) * 0.35).toFixed(2);           // slanted end cuts
      var tl = (h(5) * 0.1).toFixed(3), br = (h(6) * 0.1).toFixed(3);             // edge drift
      var nx = (12 + h(7) * 60).toFixed(1), nw = (0.25 + h(8) * 0.3).toFixed(2);  // notch
      el.style.clipPath = 'polygon(' + [
        'calc(' + a + 'em + ' + cl + 'em) ' + tl + 'em',
        '100% 0',
        '100% calc(100% - ' + b + 'em)',
        'calc(100% - ' + b + 'em - ' + cr + 'em) calc(100% - ' + br + 'em)',
        'calc(' + nx + '% + ' + nw + 'em) calc(100% - ' + br + 'em)',
        'calc(' + nx + '% + ' + nw + 'em - .16em) calc(100% - .18em)',
        'calc(' + nx + '% + .16em) calc(100% - .18em)',
        nx + '% 100%',
        '0 100%',
        cl + 'em ' + a + 'em'
      ].join(',') + ')';
    });
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-on'); }); return; }
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; tio.unobserve(el);
        setTimeout(function () { el.classList.add('is-on'); }, 180 + Math.random() * 260);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { tio.observe(el); });
  }

  /* ─── footer: the logo cut into strips ─────────────────────────────── */
  // the footer logo, cut into strips that slip out of register and snap back
  function initCutLogo() {
    var el = $('.output__logo.cut'); if (!el) return;
    var N = 9, strips = [];
    for (var i = 0; i < N; i++) {
      var s = document.createElement('i'); s.className = 'logo';
      s.style.clipPath = 'inset(' + (i * 100 / N).toFixed(2) + '% 0 ' + (100 - (i + 1) * 100 / N).toFixed(2) + '% 0)';
      el.appendChild(s); strips.push(s);
    }
    var hold = false;
    el.addEventListener('pointerenter', function () { hold = true; strips.forEach(function (s) { s.style.transform = ''; }); });
    el.addEventListener('pointerleave', function () { hold = false; });
    if (reduced) return;
    var k = 0;
    setInterval(function () {
      if (hold || !vis.output || document.hidden) return;
      k++;
      strips.forEach(function (s, i) {
        var r = hsh(i, k), off = r < 0.3 ? (hsh(i + 9, k) - 0.5) * 16 : 0;   // % of width
        s.style.transform = off ? 'translateX(' + off.toFixed(1) + '%)' : '';
      });
      // snap most of it back a beat later, like a copier catching the paper
      setTimeout(function () { strips.forEach(function (s, i) { if (hsh(i, k + 99) < 0.7) s.style.transform = ''; }); }, 260);
    }, 1900);
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

  /* ─── 02 voices: the roster as the label's poster series ───────────────
     photo in yellow corner brackets + yellow panel with the name set
     vertically, like the Instagram artist posters. Photos glitch-cut on
     hover, once when they scroll in, and now and then on their own. */
  var roster = { list: $('.roster'), cards: [], next: 0 };

  // custom-property urls resolve against the stylesheet, so pass absolute ones
  function absUrl(u) { try { return new URL(u, location.href).href; } catch (e) { return u; } }

  function glitch(el) {
    if (reduced || !el || el.classList.contains('is-glitch')) return;
    el.classList.add('is-glitch');
    setTimeout(function () { el.classList.remove('is-glitch'); }, 520);
  }

  function initRoster() {
    var A = D.artists;
    $('.voices__count').textContent = pad(A.length) + ' channels';
    // each card is the label's Instagram artist poster: torn-edge photo in
    // hook brackets, the name set vertically in its own bracketed box, a
    // symbol box + series number box, and the logotype underneath
    var hooks = '<i class="hk hk--tl"></i><i class="hk hk--tr"></i><i class="hk hk--bl"></i><i class="hk hk--br"></i>';
    var shooks = '<i class="hk hk--s hk--tl"></i><i class="hk hk--s hk--tr"></i><i class="hk hk--s hk--bl"></i><i class="hk hk--s hk--br"></i>';
    roster.list.innerHTML = A.map(function (a, i) {
      var photo = a.photo
        ? '<img src="' + esc(a.photo) + '" alt="' + esc(a.name) + '" loading="lazy">'
        : '<canvas aria-hidden="true"></canvas>';
      var words = String(a.name).toUpperCase().split(/\s+/);
      // long names are set twice, side by side, like the MAHYAR ARABIYAN poster
      var full = words.join(' ');
      var lines = a.name.length > 9 ? [full, full] : [full];
      return '<li class="pc">' +
        '<a class="pc__link" href="#/artist/' + esc(a.slug) + '" data-slug="' + esc(a.slug) + '" aria-label="' + esc(a.name) + '">' +
          '<span class="pc__frame" aria-hidden="true">' + hooks +
            '<span class="pc__torn"></span>' +
            '<span class="pc__photo"' + (a.photo ? ' style="--img:url(\'' + esc(absUrl(a.photo)) + '\')"' : '') + '>' + photo + '</span>' +
          '</span>' +
          '<span class="pc__namebox" aria-hidden="true">' + hooks +
            '<span class="pc__name">' + lines.map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('') + '</span>' +
          '</span>' +
          '<span class="pc__sym" aria-hidden="true">' + shooks + '<i class="pc__glyph"></i></span>' +
          '<span class="pc__num" aria-hidden="true">' + shooks + '<span class="pc__no">' + pad(i + 1, 3) + '</span></span>' +
          '<span class="pc__type" aria-hidden="true"></span>' +
        '</a></li>';
    }).join('');
    roster.cards = $$('.pc', roster.list).map(function (li, i) {
      var c = { li: li, photo: $('.pc__photo', li), name: $('.pc__name', li), box: $('.pc__namebox', li), no: $('.pc__no', li), num: $('.pc__num', li), cvs: $('.pc__photo canvas', li), sig: signature(A[i].slug) };
      li.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') glitch(c.photo); });
      return c;
    });
    if (io) {
      var gio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { setTimeout(function () { glitch(e.target); }, 150 + Math.random() * 400); gio.unobserve(e.target); } });
      }, { threshold: 0.4 });
      roster.cards.forEach(function (c) { gio.observe(c.photo); });
    }
    watch(roster.list, 'roster');
    initReel();
  }

  // the roster scrolls sideways like the label's poster carousel:
  // swipe on touch, arrows or drag with a mouse, counter + progress line
  function initReel() {
    var R = roster.list, count = $('.reel-count b'), bar = $('.reel-progress i');
    var prev = $('.reel-prev'), next = $('.reel-next');
    $('.reel-total').textContent = pad(roster.cards.length);
    var step = function () {
      var c = roster.cards[0] && roster.cards[0].li;
      return c ? c.getBoundingClientRect().width + (parseFloat(getComputedStyle(R).columnGap) || 0) : R.clientWidth;
    };
    var sync = function () {
      var max = R.scrollWidth - R.clientWidth, st = step();
      var idx = Math.min(roster.cards.length - 1, Math.max(0, Math.round(R.scrollLeft / st)));
      count.textContent = pad(idx + 1);
      var w = R.scrollWidth ? R.clientWidth / R.scrollWidth : 1;
      bar.style.width = (Math.min(1, w) * 100).toFixed(2) + '%';
      bar.style.left = (max > 0 ? (R.scrollLeft / max) * (1 - w) * 100 : 0).toFixed(2) + '%';
      var atS = R.scrollLeft <= 2, atE = R.scrollLeft >= max - 2;
      if (atE && !atS && document.activeElement === next) prev.focus({ preventScroll: true });
      if (atS && !atE && document.activeElement === prev) next.focus({ preventScroll: true });
      prev.disabled = atS;
      next.disabled = atE;
    };
    var ticking = false;
    R.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; sync(); });
    }, { passive: true });
    var go = function (dir) { R.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' }); };
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });

    // mouse drag (touch already scrolls natively)
    var drag = null, dragged = false, relTok = 0;
    R.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: R.scrollLeft, moved: false };
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; R.classList.add('is-drag'); }
      if (drag.moved) R.scrollLeft = drag.left - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!drag) return;
      var moved = drag.moved;
      drag = null;
      if (!moved) return;
      dragged = true;
      setTimeout(function () { dragged = false; }, 250);
      // ease to the nearest poster while snapping is still off, then turn it back on
      var st = step(), my = ++relTok;
      R.scrollTo({ left: Math.round(R.scrollLeft / st) * st, behavior: reduced ? 'auto' : 'smooth' });
      var done = function () {
        R.removeEventListener('scrollend', done);
        if (my === relTok && !(drag && drag.moved)) R.classList.remove('is-drag');
      };
      R.addEventListener('scrollend', done);
      setTimeout(done, 700);
    });
    // a drag must not also open the artist it started on
    R.addEventListener('click', function (e) { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true);
    R.addEventListener('dragstart', function (e) { e.preventDefault(); });
    // keyboard focus on a half-visible poster brings the whole poster into view
    R.addEventListener('focusin', function (e) {
      var li = e.target.closest('.pc');
      if (!li || !e.target.matches(':focus-visible')) return;
      var r = li.getBoundingClientRect(), b = R.getBoundingClientRect(),
          p = parseFloat(getComputedStyle(R).scrollPaddingLeft) || 0;
      if (r.left < b.left + p - 1 || r.right > b.right - p + 1)
        li.scrollIntoView({ block: 'nearest', inline: 'start', behavior: reduced ? 'auto' : 'smooth' });
    });
    roster.syncReel = sync;
    sync();
  }

  // fit each vertical name to its panel
  // stretch each name to fill its box exactly (the posters distort the type to fit)
  function fitStretch(el, box, padX, padY) {
    el.style.transform = 'none';
    el.style.fontSize = '100px';
    var w = el.offsetWidth, h = el.offsetHeight;
    var bw = box.clientWidth * (1 - padX), bh = box.clientHeight * (1 - padY);
    if (!w || !h || !bw || !bh) return;
    el.style.transform = 'translate(-50%, -50%) scale(' + (bw / w).toFixed(4) + ',' + (bh / h).toFixed(4) + ')';
  }
  function resizeRoster() {
    roster.cards.forEach(function (c) {
      fitStretch(c.name, c.box, 0.14, 0.09);
      fitStretch(c.no, c.num, 0.2, 0.2);
      if (c.cvs) { var t = sizeCanvas(c.cvs, 2); drawSigil(t.ctx, c.sig, 0, t.w, t.h); }
    });
    if (roster.syncReel) roster.syncReel();
  }

  function drawRoster() {
    if (reduced || !roster.cards.length) return;
    if (!roster.next) roster.next = S.t + 3;
    if (S.t > roster.next) {
      glitch(roster.cards[Math.floor(Math.random() * roster.cards.length)].photo);
      roster.next = S.t + 3 + Math.random() * 3;
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
      return '<a class="mono" href="' + esc(a.links[k]) + '" target="_blank" rel="noopener">' + esc(LINK_NAMES[k] || k) + ' ↗︎</a>';
    }).join('');
    var videos = (a.videos || []).map(function (v) {
      if (v.youtube) return '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.youtube) + '" title="' + esc(v.caption || a.name + ' video') + '" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      return '<video src="' + esc(v.src) + '"' + (v.poster ? ' poster="' + esc(v.poster) + '"' : '') + ' controls playsinline preload="metadata"></video>';
    }).join('');
    var gallery = (a.photos || []).map(function (src) { return '<figure><img src="' + esc(src) + '" alt="' + esc(a.name) + '" loading="lazy"></figure>'; }).join('');

    return '<div class="pf">' +
      '<aside class="pf__media">' +
        '<div class="pf__portrait"' + (a.photo ? ' style="--img:url(\'' + esc(absUrl(a.photo)) + '\')"' : '') + '>' + (a.photo
          ? '<img src="' + esc(a.photo) + '" alt="' + esc(a.name) + ' portrait"><i class="brk" aria-hidden="true"></i>'
          : '<canvas class="pf__sigil" aria-hidden="true"></canvas>') + '</div>' +
        '<div class="pf__sig"><canvas class="pf__sigmini" aria-hidden="true"></canvas>' +
          '<dl class="mono"><dt>Wave</dt><dd>' + sig.type + '</dd><dt>Ratio</dt><dd>' + sig.a + ':' + sig.b + '</dd>' +
          '<dt>Phase</dt><dd>' + (sig.phase * 2).toFixed(2) + 'π</dd><dt>Seed</dt><dd>#' + sig.seed.toString(16).toUpperCase().slice(0, 6) + '</dd></dl>' +
        '</div>' +
      '</aside>' +
      '<div class="pf__content">' +
        '<p class="pf__role mono">' + ['<b>CH.' + pad(i + 1) + '</b>'].concat([a.role, a.city].filter(Boolean).map(esc)).join(' · ') + '</p>' +
        '<h2 class="pf__name" id="pf-name">' + esc(a.name) + '</h2>' +
        (a.placeholder ? '<p class="pf__note mono">Placeholder channel: replace in assets/js/data.js</p>' : '') +
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
        '<a class="cta pf__book" href="' + esc(bookingHref()) + '" target="_blank" rel="noopener">Booking &amp; inquiries · ' + esc(D.label.email || D.label.handle) + ' ↗︎</a>' +
      '</div>' +
    '</div>' +
    '<a class="pf__next" href="#/artist/' + esc(next.slug) + '" data-swap="' + esc(next.slug) + '" data-cursor="Next channel">' +
      '<span class="mono">Next channel · CH.' + pad(((i + 1) % n) + 1) + '</span><span class="pf__nextname">' + esc(next.name) + '</span></a>';
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
    setTimeout(function () { glitch($('.pf__portrait', pf.body)); }, 700);
    if (E && E.on) E.setPattern(signature(slug).seed);
  }
  // keep the longest word of the name on one line (at its final, widest stretch)
  function fitProfileName() {
    var el = $('.pf__name', pf.body);
    if (!el) return;
    el.style.fontSize = '';
    if (!el.parentNode.clientWidth) return;   // not laid out yet (dialog still hidden)
    var longest = Math.max.apply(null, el.textContent.split(/\s+/).map(function (w) { return w.length; }));
    var max = el.parentNode.clientWidth / (longest * 0.56);
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
        if (name) { name.style.transition = 'none'; name.style.letterSpacing = '-.02em'; void name.offsetWidth; name.style.transition = ''; name.style.letterSpacing = ''; }
      }, 320);
      return;
    }
    pf.pushed = !!pushed;
    pf.lastFocus = document.activeElement;
    renderProfile(slug);
    bandFor(slug);
    pf.el.hidden = false;
    pf.el.scrollTop = 0;
    fitProfileName();
    document.documentElement.classList.add('is-locked');
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
      if (stage.isOpen) return;
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
      var lnk = e.target.closest('[data-listen]');
      if (lnk) {
        e.preventDefault();
        var id = lnk.dataset.listen;
        requestClose();
        setTimeout(function () {
          var el = document.getElementById('tx-' + id);
          if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
          var o = txs.filter(function (x) { return x.t.id === id; })[0];
          if (o) listen(o, null, el);
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

  /* ─── 03 transmissions ─────────────────────────────────────────────────
     the list stays simple (cover, title, waveform line). Pressing play opens
     the stage: a full-screen "now playing" page where the cover spins as a
     record inside a ring of the mix's real waveform. Minimise it and the mix
     keeps playing in the bottom bar. Audio comes from hidden SoundCloud
     widgets driven through their API. */
  var txs = [];
  var ICON_PLAY = '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
  var ICON_PAUSE = '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z"/></svg>';

  function artistName(slug) { var i = artistIndex(slug); return i < 0 ? slug : D.artists[i].name; }
  // 0:00:07 for mixes over an hour, 0:07 otherwise
  function fmtClock(sec, total) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return total >= 3600 ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s);
  }
  function byline(t) {
    return artistIndex(t.artist) >= 0
      ? '<a href="#/artist/' + esc(t.artist) + '">' + esc(artistName(t.artist)) + '</a>'
      : esc(t.artist || '');
  }
  function metaline(t, i) {
    var tl = t.tracklist || [];
    return '<span>TX-' + pad(i + 1) + '</span><span>' + esc(t.type) + '</span><span>' + fmtDate(t.date) + '</span><span>' + fmtClock(t.duration, t.duration) + '</span>' +
      (tl.length ? '<span>' + tl.length + ' tracks</span>' : '');
  }

  function initTransmissions() {
    var list = $('.tx-list'), T = D.transmissions;
    list.innerHTML = T.map(function (t, i) {
      var tl = t.tracklist || [];
      return '<article class="tx" id="tx-' + esc(t.id) + '">' +
        '<button class="tx__cover" type="button" aria-label="Play ' + esc(t.title) + '">' +
          '<img src="' + esc(t.cover) + '" alt="" loading="lazy"><i class="brk" aria-hidden="true"></i>' +
        '</button>' +
        '<div class="tx__body">' +
          '<p class="tx__meta mono">' + metaline(t, i) + '</p>' +
          '<h3 class="tx__title">' + esc(t.title) + '</h3>' +
          '<p class="tx__by">by ' + byline(t) + '</p>' +
          '<div class="tx__deck">' +
            '<button class="tx__play" type="button" aria-label="Play ' + esc(t.title) + '">' + ICON_PLAY + ICON_PAUSE + '</button>' +
            '<div class="tx__wave" role="slider" tabindex="0" aria-label="Seek ' + esc(t.title) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><canvas aria-hidden="true"></canvas></div>' +
          '</div>' +
          '<div class="tx__dur mono"><span class="tx__pos">' + fmtClock(0, t.duration) + '</span><span>' + fmtClock(t.duration, t.duration) + '</span></div>' +
          (tl.length ? '<details class="tx__tracks"><summary class="mono"><span>Tracklist · ' + pad(tl.length) + '</span></summary><ol>' +
            tl.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></details>' : '') +
          (t.soundcloud ? '<a class="tx__ext mono" href="' + esc(t.soundcloud) + '" target="_blank" rel="noopener">Open on SoundCloud ↗︎</a>' : '') +
        '</div></article>';
    }).join('');

    txs = $$('.tx', list).map(function (el, i) {
      var o = {
        el: el, t: T[i], i: i, wave: $('.tx__wave', el), cvs: $('.tx__wave canvas', el), pos: $('.tx__pos', el),
        playBtn: $('.tx__play', el), stateText: 'Standby', hover: -1, progress: 0, sec: 0
      };
      var data = o.t.waveform;
      if (!data || !data.length) { var r = rng(hash(o.t.id)); data = []; for (var k = 0; k < 200; k++) data.push(0.25 + 0.75 * Math.pow(r(), 0.6)); }
      o.data = data;

      // card play: pause if it's playing, otherwise start it and open the stage
      o.playBtn.addEventListener('click', function () { if (o.playing) Player.toggle(o); else listen(o, null, o.playBtn); });
      $('.tx__cover', el).addEventListener('click', function (e) { listen(o, null, e.currentTarget); });
      o.wave.addEventListener('pointermove', function (e) {
        var r = o.wave.getBoundingClientRect();
        o.hover = clamp((e.clientX - r.left) / r.width, 0, 1);
        drawLine(o);
      });
      o.wave.addEventListener('pointerleave', function () { o.hover = -1; drawLine(o); });
      o.wave.addEventListener('click', function (e) {
        var r = o.wave.getBoundingClientRect();
        listen(o, clamp((e.clientX - r.left) / r.width, 0, 1), o.wave);
      });
      o.wave.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); listen(o, null, o.wave); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          Player.toggle(o, clamp(o.progress + (e.key === 'ArrowRight' ? 0.02 : -0.02), 0, 1));
        }
      });
      return o;
    });
    initStage();
  }

  // start (or seek) a mix and bring up the stage
  function listen(o, frac, fromEl) {
    stage.show(o, fromEl);
    if (frac != null) Player.toggle(o, frac);
    else if (!o.playing) Player.toggle(o);
  }

  function setState(o, text) {
    o.stateText = text;
    if (stage.cur === o) stage.state.textContent = text;
  }

  function resizeTx() {
    txs.forEach(function (o) { var s = sizeCanvas(o.cvs, 2); o.ctx = s.ctx; o.w = s.w; o.h = s.h; o.d = s.d; drawLine(o); });
    if (stage.isOpen) stage.resize();
  }

  // the list card's waveform line
  function drawLine(o) {
    var c = o.ctx;
    if (!c) return;
    var w = o.w, h = o.h, d = o.d, bw = 2 * d, gap = 2 * d, n = Math.max(1, Math.floor(w / (bw + gap)));
    c.clearRect(0, 0, w, h);
    for (var i = 0; i < n; i++) {
      var f = i / n, v = o.data[Math.floor(f * o.data.length)] || 0;
      var bh = Math.max(2 * d, v * h * 0.94);
      c.fillStyle = f < o.progress ? '#e4e418' : (o.hover >= 0 && f < o.hover ? 'rgba(233,231,223,.7)' : 'rgba(233,231,223,.24)');
      c.fillRect(i * (bw + gap), (h - bh) / 2, bw, bh);
    }
  }

  function updateTx(o) {
    o.pos.textContent = fmtClock(o.sec, o.t.duration);
    o.wave.setAttribute('aria-valuenow', Math.round(o.progress * 100));
    drawLine(o);
    if (stage.cur === o) stage.update();
  }

  /* ─── the stage: full-screen now-playing page ───────────────────────── */
  var stage = { el: $('#stage'), isOpen: false, cur: null, hover: -1, dirty: true, lastFocus: null };

  function initStage() {
    var S_ = stage, el = S_.el;
    S_.bg = $('.stage__bg', el); S_.platter = $('.stage__platter', el); S_.cvs = $('.stage__ring', el);
    S_.disc = $('.stage__disc img', el); S_.play = $('.stage__play', el); S_.tip = $('.stage__tip', el);
    S_.meta = $('.stage__meta', el); S_.title = $('.stage__title', el); S_.by = $('.stage__by', el);
    S_.now = $('.stage__now', el); S_.total = $('.stage__total', el); S_.state = $('.stage__state', el);
    S_.seek = $('.stage__seek', el); S_.toggle = $('.stage__toggle', el); S_.tracks = $('.stage__tracks', el);
    S_.ext = $('.stage__ext', el); S_.close = $('.stage__close', el);

    var toggleCur = function () { if (S_.cur) Player.toggle(S_.cur); };
    S_.play.addEventListener('click', function (e) { e.stopPropagation(); toggleCur(); });
    S_.toggle.addEventListener('click', toggleCur);
    $$('.stage__skip', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var o = S_.cur; if (!o) return;
        Player.toggle(o, clamp((o.sec + Number(b.dataset.skip)) / o.t.duration, 0, 0.999));
      });
    });
    S_.platter.addEventListener('pointermove', function (e) {
      var f = ringFrac(e);
      S_.hover = f; S_.dirty = true;
      S_.platter.classList.toggle('is-seek', f >= 0);
      if (f >= 0 && S_.cur) {
        var r = S_.platter.getBoundingClientRect();
        S_.tip.textContent = fmtClock(f * S_.cur.t.duration, S_.cur.t.duration);
        S_.tip.style.left = (e.clientX - r.left) + 'px'; S_.tip.style.top = (e.clientY - r.top) + 'px';
      }
      S_.tip.classList.toggle('is-on', f >= 0 && e.pointerType === 'mouse');
    });
    S_.platter.addEventListener('pointerleave', function () { S_.hover = -1; S_.dirty = true; S_.tip.classList.remove('is-on'); S_.platter.classList.remove('is-seek'); });
    S_.platter.addEventListener('click', function (e) {
      var f = ringFrac(e);
      if (f >= 0 && S_.cur) Player.toggle(S_.cur, f);
    });
    var seekTo = function (e) {
      var r = S_.seek.getBoundingClientRect();
      if (S_.cur) Player.toggle(S_.cur, clamp((e.clientX - r.left) / r.width, 0, 0.999));
    };
    S_.seek.addEventListener('click', seekTo);
    S_.seek.addEventListener('keydown', function (e) {
      var o = S_.cur; if (!o) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        Player.toggle(o, clamp(o.progress + (e.key === 'ArrowRight' ? 0.02 : -0.02), 0, 0.999));
      }
    });
    S_.close.addEventListener('click', function () { S_.hide(); });
    document.addEventListener('keydown', function (e) {
      if (!S_.isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); S_.hide(); }
      else if (e.key === 'Tab') {
        var f = $$('a[href], button, [tabindex]:not([tabindex="-1"]), summary', el).filter(function (x) { return x.offsetParent !== null; });
        var ifr = scHost.classList.contains('is-visible') && $('.sc-slot.is-cur iframe', scHost);
        if (ifr) f.push(ifr);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1], a = document.activeElement;
        var inside = el.contains(a) || (ifr && a === ifr);
        if (!inside) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
        else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      }
    });
    el.addEventListener('click', function (e) {
      // the artist link closes the stage (the profile opens underneath via the hash)
      if (e.target.closest('.stage__by a')) S_.hide();
    });
  }

  // pointer → position on the ring (0 at 12 o'clock, clockwise), or -1 off the ring
  function ringFrac(e) {
    var r = stage.platter.getBoundingClientRect();
    var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
    var dist = Math.sqrt(x * x + y * y) / (r.width / 2);
    if (dist < 0.6 || dist > 1.02) return -1;
    var a = Math.atan2(y, x) + Math.PI / 2;
    if (a < 0) a += TAU;
    return a / TAU;
  }

  stage.fill = function (o) {
    var t = o.t, tl = t.tracklist || [];
    stage.cur = o;
    stage.el.classList.toggle('is-playing', !!o.playing);
    stage.bg.style.backgroundImage = 'url("' + absUrl(t.cover) + '")';
    if (stage.disc.getAttribute('src') !== t.cover) stage.disc.setAttribute('src', t.cover);
    stage.meta.innerHTML = metaline(t, o.i);
    stage.title.textContent = t.title;
    stage.by.innerHTML = 'by ' + byline(t);
    stage.total.textContent = '/ ' + fmtClock(t.duration, t.duration);
    stage.seek.setAttribute('aria-label', 'Seek ' + t.title);
    stage.tracks.hidden = !tl.length;
    stage.tracks.innerHTML = tl.length ? '<summary class="mono"><span>Tracklist · ' + pad(tl.length) + '</span></summary><ol>' +
      tl.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' : '';
    stage.ext.hidden = !t.soundcloud;
    if (t.soundcloud) stage.ext.setAttribute('href', t.soundcloud);
    stage.state.textContent = o.stateText;
    stage.update();
  };
  stage.update = function () {
    var o = stage.cur; if (!o) return;
    stage.now.textContent = fmtClock(o.sec, o.t.duration);
    stage.seek.style.setProperty('--p', o.progress.toFixed(4));
    stage.seek.setAttribute('aria-valuenow', Math.round(o.progress * 100));
    var label = (o.playing ? 'Pause ' : 'Play ') + o.t.title;
    stage.play.setAttribute('aria-label', label);
    stage.toggle.setAttribute('aria-label', label);
    stage.el.classList.toggle('is-playing', !!o.playing);
    stage.el.classList.toggle('is-loading', !!o.loading);
    stage.dirty = true;
  };
  stage.resize = function () {
    var s = sizeCanvas(stage.cvs, 2); stage.ctx = s.ctx; stage.w = s.w; stage.h = s.h; stage.d = s.d; stage.dirty = true;
  };
  stage.show = function (o, fromEl) {
    stage.fill(o);
    if (o.blocked && o.ready && !o.started) scReveal(o, true);   // reopened a blocked mix
    if (stage.isOpen) return;
    // open as a circle growing from whatever was pressed
    var r = fromEl && fromEl.getBoundingClientRect ? fromEl.getBoundingClientRect() : null;
    stage.el.style.setProperty('--ox', r ? (r.left + r.width / 2) + 'px' : '50%');
    stage.el.style.setProperty('--oy', r ? (r.top + r.height / 2) + 'px' : '50%');
    stage.lastFocus = document.activeElement;
    stage.el.hidden = false;
    document.documentElement.classList.add('is-locked', 'stage-open');
    stage.resize();
    void stage.el.offsetWidth;
    requestAnimationFrame(function () {
      stage.el.classList.add('is-open');
      stage.isOpen = true;
      stage.close.focus({ preventScroll: true });
    });
  };
  stage.hide = function () {
    if (!stage.isOpen) return;
    stage.isOpen = false;
    scReveal(null, false);
    stage.el.classList.remove('is-open');
    document.documentElement.classList.remove('stage-open');
    if (deck.cur && deck.cur.started) deck.show(deck.cur);
    setTimeout(function () {
      if (stage.isOpen) return;
      stage.el.hidden = true;
      if (!pf.open) document.documentElement.classList.remove('is-locked');
      if (stage.lastFocus && stage.lastFocus.focus && document.contains(stage.lastFocus)) stage.lastFocus.focus({ preventScroll: true });
    }, reduced ? 0 : 700);
  };

  function drawStage() {
    var o = stage.cur, c = stage.ctx;
    if (!o || !c) return;
    var w = stage.w, h = stage.h, d = stage.d, cx = w / 2, cy = h / 2;
    var R = Math.min(w, h) / 2 * 0.97, r0 = R * 0.66, span = R - r0, track = r0 - 7 * d;
    c.clearRect(0, 0, w, h);
    c.lineCap = 'butt';
    c.lineWidth = 1 * d; c.strokeStyle = 'rgba(233,231,223,.16)';
    c.beginPath(); c.arc(cx, cy, track, 0, TAU); c.stroke();
    if (o.progress > 0) {
      c.lineWidth = 2 * d; c.strokeStyle = '#e4e418';
      c.beginPath(); c.arc(cx, cy, track, -Math.PI / 2, -Math.PI / 2 + o.progress * TAU); c.stroke();
    }
    var N = 160, live = o.playing && !reduced;
    c.lineCap = 'round';
    c.lineWidth = Math.max(1.4 * d, (TAU * r0 / N) * 0.42);
    for (var i = 0; i < N; i++) {
      var f = i / N, v = o.data[Math.floor(f * o.data.length)] || 0;
      if (live && Math.abs(f - o.progress) < 0.025) v = Math.min(1, v * (0.7 + 0.4 * Math.abs(Math.sin(S.t * 11 + i * 1.7))));
      var len = span * (0.12 + 0.86 * v) * 0.9, a = -Math.PI / 2 + f * TAU, ca = Math.cos(a), sa = Math.sin(a);
      c.strokeStyle = f < o.progress ? '#e4e418'
        : (stage.hover >= 0 && f < stage.hover ? 'rgba(233,231,223,.62)' : 'rgba(233,231,223,.22)');
      c.beginPath();
      c.moveTo(cx + ca * r0, cy + sa * r0);
      c.lineTo(cx + ca * (r0 + len), cy + sa * (r0 + len));
      c.stroke();
    }
    var ha = -Math.PI / 2 + o.progress * TAU;
    c.fillStyle = '#e4e418';
    c.beginPath(); c.arc(cx + Math.cos(ha) * track, cy + Math.sin(ha) * track, 3.5 * d, 0, TAU); c.fill();
    stage.dirty = false;
  }

  /* now-playing bar (shown while the stage is minimised) */
  var deck = { el: $('.deck'), title: $('.deck__title'), time: $('.deck__time'), btn: $('.deck__toggle'), disc: $('.deck__disc img'), open: $('.deck__open') };
  deck.show = function (o) {
    deck.cur = o;
    deck.el.hidden = false;
    document.documentElement.classList.add('has-deck');
    deck.title.textContent = o.t.title + ' · ' + artistName(o.t.artist);
    if (deck.disc.getAttribute('src') !== o.t.cover) deck.disc.setAttribute('src', o.t.cover);
    deck.update(o);
  };
  deck.update = function (o) {
    if (deck.cur !== o) return;
    deck.time.textContent = fmtClock(o.sec, o.t.duration) + ' / ' + fmtClock(o.t.duration, o.t.duration);
    deck.el.style.setProperty('--p', o.progress.toFixed(4));
    deck.el.classList.toggle('is-playing', !!o.playing);
    deck.btn.setAttribute('aria-label', o.playing ? 'Pause' : 'Play');
  };

  /* hidden SoundCloud widgets: one slot per mix in a shared host. The host
     only becomes visible (above the stage) when a browser blocks playback
     that was started from outside the widget. */
  var scHost = $('.sc-host');
  function scSlot(o) {
    if (!o.slot) { o.slot = document.createElement('div'); o.slot.className = 'sc-slot'; scHost.appendChild(o.slot); }
    return o.slot;
  }
  function scReveal(o, on) {
    scHost.classList.toggle('is-visible', on);
    scHost.inert = !on;
    // the fallback sits outside the dialog: let assistive tech reach it while shown
    if (on) stage.el.removeAttribute('aria-modal'); else stage.el.setAttribute('aria-modal', 'true');
    txs.forEach(function (x) { if (x.slot) x.slot.classList.toggle('is-cur', on && x === o); });
  }

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
    // the mix the visitor asked for last; a mix that finishes loading after
    // the visitor has moved on must not start on its own
    want: null,
    setPlaying: function (o, on) {
      o.playing = on;
      o.el.classList.toggle('is-playing', on);
      o.playBtn.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + o.t.title);
      if (stage.cur === o) stage.update();
      deck.update(o);
    },
    toggle: function (o, frac) {
      if (!o.t.soundcloud) return;
      Player.want = o;
      if (E && E.on) setSignal(false);
      this.pauseAll(o);
      if (frac != null) { o.progress = frac; o.sec = frac * o.t.duration; updateTx(o); }
      if (o.widget && o.ready) {
        if (frac != null) { o.widget.seekTo(frac * o.t.duration * 1000); o.widget.play(); }
        else o.widget.toggle();
        return;
      }
      if (o.loading) { if (frac != null) o.pendingSeek = frac; return; }
      o.loading = true; o.pendingSeek = frac;
      scReveal(null, false);
      // each attempt gets a token; handlers of an abandoned attempt ignore their events
      var gen = o.gen = (o.gen || 0) + 1;
      var err = $('.tx__error', o.el); if (err) err.remove();
      o.el.classList.add('is-loading');
      setState(o, 'Tuning in');
      if (stage.cur === o) stage.update();
      var self = this;
      this.loadApi().then(function () {
        if (o.gen !== gen) return;
        var slot = scSlot(o), ifr = document.createElement('iframe');
        ifr.allow = 'autoplay; encrypted-media';
        ifr.title = 'SoundCloud player: ' + o.t.title;
        ifr.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(o.t.soundcloud) +
          '&color=%23e4e418&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true';
        slot.appendChild(ifr);
        var w = o.widget = window.SC.Widget(ifr), EV = window.SC.Widget.Events;
        var fail = setTimeout(function () { if (o.gen === gen && !o.ready) self.fail(o); }, 12000);
        w.bind(EV.READY, function () {
          if (o.gen !== gen) return;
          o.ready = true; clearTimeout(fail);
          if (o.pendingSeek != null) w.seekTo(o.pendingSeek * o.t.duration * 1000);
          if (Player.want !== o) {            // visitor moved on while this was loading
            o.loading = false;
            o.el.classList.remove('is-loading');
            setState(o, 'Standby');
            if (stage.cur === o) stage.update();
            return;
          }
          w.play();
          // some mobile browsers block playback started from outside the widget:
          // only then (playback never started) show SoundCloud's own player to tap
          setTimeout(function () {
            if (o.gen !== gen || o.started) return;
            w.isPaused(function (paused) {
              if (o.gen !== gen || !paused || o.started || Player.want !== o) return;
              o.loading = false; o.blocked = true;
              o.el.classList.remove('is-loading');
              setState(o, 'Tap play in the player below');
              if (stage.cur === o) stage.update();
              if (stage.isOpen && stage.cur === o) scReveal(o, true);
            });
          }, 5000);
        });
        w.bind(EV.PLAY, function () {
          if (o.gen !== gen) return;
          Player.want = o;                     // also counts a tap inside SoundCloud's own player
          o.started = true; o.loading = false;
          o.el.classList.remove('is-loading');
          scReveal(o, false);
          setState(o, 'On air');
          if (E && E.on) setSignal(false);
          self.pauseAll(o);
          Player.setPlaying(o, true);
          if (!stage.isOpen) deck.show(o); else deck.cur = o;
        });
        var stop = function () {
          if (o.gen !== gen) return;
          Player.setPlaying(o, false);
          setState(o, o.progress > 0.999 ? 'Ended' : 'Paused');
        };
        w.bind(EV.PAUSE, stop);
        w.bind(EV.FINISH, stop);
        w.bind(EV.PLAY_PROGRESS, function (e) {
          if (o.gen !== gen) return;
          o.progress = e.relativePosition; o.sec = e.currentPosition / 1000;
          updateTx(o); deck.update(o);
        });
      }).catch(function () { if (o.gen === gen) self.fail(o); });
    },
    // tear the attempt down completely so a retry starts clean and a late
    // READY from the dead widget can't start a second, unreachable copy
    fail: function (o) {
      o.gen = (o.gen || 0) + 1;
      if (o.slot) o.slot.innerHTML = '';
      scReveal(o, false);
      o.widget = null; o.ready = false; o.loading = false;
      o.el.classList.remove('is-loading');
      Player.setPlaying(o, false);
      setState(o, 'Offline');
      if ($('.tx__error', o.el)) return;
      var p = document.createElement('p');
      p.className = 'tx__error mono';
      p.innerHTML = 'SoundCloud couldn\'t be reached from here. <a href="' + esc(o.t.soundcloud) + '" target="_blank" rel="noopener">Listen on SoundCloud ↗︎</a>';
      $('.tx__dur', o.el).after(p);
    }
  };
  deck.btn.addEventListener('click', function () { if (deck.cur && deck.cur.widget) Player.toggle(deck.cur); });
  deck.open.addEventListener('click', function () { if (deck.cur) { deck.el.hidden = true; stage.show(deck.cur, deck.open); } });

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
    var media = F.media || [], sheet = $('.sheet');
    sheet.hidden = !media.length;
    sheet.innerHTML = media.map(function (m, i) {
      var cap = '<figcaption class="frame__cap mono"><b>FR ' + pad(i + 1) + '</b><i aria-hidden="true"></i><span>' + esc(m.caption || '') + '</span></figcaption>';
      var inner = m.type === 'video'
        ? '<video src="' + esc(m.src) + '"' + (m.poster ? ' poster="' + esc(m.poster) + '"' : '') + ' muted loop playsinline preload="metadata"></video>'
        : '<img src="' + esc(m.src) + '" alt="' + esc(m.caption || '') + '" loading="lazy">';
      return '<figure class="frame' + (m.wide ? ' frame--wide' : '') + '"><div class="frame__media"' + (m.type !== 'video' ? ' style="--img:url(\'' + esc(absUrl(m.src)) + '\')"' : '') + '>' + inner + '<i class="brk" aria-hidden="true"></i></div>' + cap + '</figure>';
    }).join('');
    $$('.sheet .frame__media').forEach(function (f) { f.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') glitch(f); }); });
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
        '<div class="nosignal__row"><p>Nothing scheduled yet. New dates are announced first on Instagram.</p>' +
        '<a class="cta" href="' + esc(D.label.instagram) + '" target="_blank" rel="noopener">Follow ' + esc(D.label.handle) + ' ↗︎</a></div></div>';
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
        '<p class="event__date">' + parts[2] + '.' + parts[1] + '<small class="mono">' + parts[0] + (ev.date < today ? ' · past' : '') + '</small></p>' +
        '<div><h3 class="event__title">' + esc(ev.title) + '</h3>' +
        '<p class="event__where mono">' + esc([ev.venue, ev.city].filter(Boolean).join(' · ')) + '</p>' +
        (lineup ? '<p class="event__lineup">' + lineup + '</p>' : '') + '</div>' +
        (ev.link ? '<a class="cta" href="' + esc(ev.link) + '" target="_blank" rel="noopener">Info ↗︎</a>' : '<span></span>') +
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
        return '<span class="wd' + (accent ? ' tape' : '') + '">' + word.split('').map(function (ch_) {
          return '<span class="l" aria-hidden="true">' + esc(ch_) + '</span>';
        }).join('') + '</span>';
      }).join(' ') + '</span>';
    }).join('');
    th.letters = $$('.l', th.el).map(function (el, i) { return { el: el, i: i, x: 0, y: 0, st: -1, wg: -1 }; });

    var L = D.label, keyv = D.artists[0];
    var follow = ['<li><a href="' + esc(L.instagram) + '" target="_blank" rel="noopener">Instagram ↗︎</a></li>'];
    if (L.soundcloud) follow.push('<li><a href="' + esc(L.soundcloud) + '" target="_blank" rel="noopener">SoundCloud ↗︎</a></li>');
    if (keyv && keyv.links && keyv.links.soundcloud) follow.push('<li><a href="' + esc(keyv.links.soundcloud) + '" target="_blank" rel="noopener">' + esc(keyv.name) + ' on SoundCloud ↗︎</a></li>');
    $('.output__grid').innerHTML =
      '<div><h3 class="mono">Demos &amp; bookings</h3><p>' + rich(L.demos) + '</p>' +
        '<a class="cta" href="' + esc(bookingHref()) + '" target="_blank" rel="noopener">' + (L.email ? 'Email ' + esc(L.email) : 'DM ' + esc(L.handle)) + ' ↗︎</a></div>' +
      '<div><h3 class="mono">Follow the signal</h3><ul>' + follow.join('') + '</ul></div>';
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
    var sig = S.vw * 0.13, sig2 = 2 * sig * sig, range = S.vw < 860 ? 35 : 60;
    for (var i = 0; i < th.letters.length; i++) {
      var l = th.letters[i], k;
      if (S.hasMouse) {
        var dx = l.x - S.mx, dy = l.y - S.sy - S.my;
        k = Math.exp(-(dx * dx + dy * dy) / sig2);
      } else {
        k = 0.5 + 0.5 * Math.sin(S.t * 1.6 - l.i * 0.45);
      }
      k = Math.min(1, k + S.beat * 0.15);
      var sc = Math.round((1 + k * range / 160) * 100) / 100;
      if (sc !== l.st) {
        l.el.style.transform = sc === 1 ? '' : 'scaleY(' + sc + ')';
        l.st = sc;
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
    if (hero.mode && hero.mode.isConnected) hero.mode.textContent = on ? 'x: delay τ · y: filter cutoff' : 'x: ratio · y: phase';
  }
  function setSignal(on) {
    if (!E || !E.supported()) return;
    if (on) {
      Player.want = null;
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
    fitTitles(); resizeScope(); resizeRail(); measureCarrier(); resizeRoster();
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
      while (E.beats.length && E.beats[0] <= at) {
        E.beats.shift(); S.beat = 1;
        if (++S.beatCount % 32 === 0) fireStrobe([80]);   // one cut every 8 bars
      }
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

    if (!E || !E.on) {
      if (!strobe.next) strobe.next = S.t + 7;
      if (S.t > strobe.next) { fireStrobe(); strobe.next = S.t + 10 + Math.random() * 6; }
    }

    if (stage.isOpen) { if (stage.cur && (stage.cur.playing || stage.dirty)) drawStage(); return; }
    if (pf.open) { drawProfile(); return; }

    // layout reads first, then writes — no forced reflow mid-frame
    updateSection();
    S.docH = document.documentElement.scrollHeight;
    if (vis.feedback) fb.rect = fb.track.getBoundingClientRect();
    if (vis.hero !== false) drawHero();
    drawRail();
    if (vis.roster) drawRoster();
    if (vis.feedback) drawFeedback();
    if (vis.events) drawEvents();
  }

  /* ─── go ───────────────────────────────────────────────────────────── */
  initGlyphs();
  initHero();
  initCarrier();
  initCutLogo();
  initRoster();
  initTransmissions();
  initFeedback();
  initEvents();
  initOutput();
  initClock();
  initTape();
  initNav();
  initProfile();
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

/* Tehran Movement: the pictures. Everything here is painted with the logo's own brush: a row of hairs that carry paint, streak and
   run dry. Paint only, the logo's yellow on black: nothing glows.
     logo     the logo of the first screen, alone; it can be painted stroke by stroke as you arrive
     wall     strokes as large as the wall, black on black, behind the first screen (the stylesheet moves it)
     slash    one stroke across the head of a page
     bar      the same stroke lying across the foot of every page, as the bar of the T lies over the M
     zigzag   the M of the logo, walked as one line (the menu)
     gesture  three strokes as large as the wall (the label)
     dab      one mark for one thing the label has made
   A stroke is painted the way a hand paints it: from its start to its end, in time, once, when it comes onto the screen.
   A canvas with data-fx="name" is painted at the size it is shown; TM_FX.all(root) watches every one inside root. */
(function () {
  'use strict';
  var Y = '#FFFE26', BONE = '#F1EFE6';
  var still = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function hash(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function noise(a, b) { var i = Math.floor(b), f = b - i, u = f * f * (3 - 2 * f); return (hash(a * 17.13 + i) * (1 - u) + hash(a * 17.13 + i + 1) * u) * 2 - 1; }
  function spline(pts, step) {
    var q = [pts[0]].concat(pts, [pts[pts.length - 1]]), out = [];
    for (var i = 1; i < q.length - 2; i++) {
      var p0 = q[i - 1], p1 = q[i], p2 = q[i + 1], p3 = q[i + 2], n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
      for (var k = 0; k < n; k++) {
        var t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // straight runs with corners, the way the logo itself is built
  function poly(pts, step) {
    var out = [];
    for (var i = 0; i < pts.length - 1; i++) { var a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (var k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
    out.push(pts[pts.length - 1]);
    return out;
  }

  /* the brush of the logo: hairs that carry paint, streak and run dry. `dry` = how many of its own lengths the load lasts.
     ragged: so many points the slowest hairs trail behind the fastest (the brush's front is then not a straight edge but its hairs'
     own tips, in bundles); soft: the hairs at the two sides carry less paint, so the sides break up.
     What comes back is the stroke not yet painted: s.n steps along its path, and s.to(k) paints it as far as step k. */
  function stroke(c, pts, w, o) {
    o = o || {};
    var step = Math.max(3, w / 40), pp = o.sharp ? poly(pts, step) : spline(pts, step), N = pp.length, cum = [0], nrm = [], i;
    for (i = 1; i < N; i++) cum.push(cum[i - 1] + Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]));
    for (i = 0; i < N; i++) { var a = pp[Math.max(0, i - 2)], b = pp[Math.min(N - 1, i + 2)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; nrm.push([-(b[1] - a[1]) / l, (b[0] - a[0]) / l]); }
    var dry = cum[N - 1] * (o.dry || 1.8), n = Math.max(8, Math.min(190, Math.round(w * 0.62))), hs = [], seed = o.seed || 1, run0 = (o.start || 0) * dry, k = (o.grain || 1), at = 0, col = o.color || Y, lw = Math.max(1, w / n * 1.75);
    var rag = o.ragged ? Math.round(o.ragged / step) : 0, steps = N + rag;
    for (i = 0; i < n; i++) {
      var t = (i + 0.5) / n * 2 - 1;
      hs.push({ t: t, load: (0.8 + hash(seed + i * 3.1) * 0.5) * (o.soft ? 1 - 0.5 * Math.pow(Math.abs(t), 4) : 1), ph: hash(seed + i * 7.7) * 900, cut: 1 - hash(seed + i * 1.3) * 0.13,
        lag: rag ? Math.round(rag * Math.pow(0.5 + 0.5 * noise(seed + 3, i * 0.12), 1.3) * (0.55 + 0.45 * hash(seed + i * 5.9))) : 0, px: 0, py: 0, on: false });
    }
    return {
      n: steps, pts: pp,
      to: function (m) {
        m = Math.min(steps, Math.ceil(m)); if (m <= at) return;
        c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = lw;
        for (var i = at; i < m; i++) {
          c.beginPath();
          for (var j = 0; j < n; j++) {
            var h = hs[j], ii = i - h.lag; if (ii < 0 || ii >= N) continue;
            var run = run0 + cum[ii], u = Math.pow(Math.min(1, run / dry), 1.6), q = nrm[ii];
            var wob = noise(h.ph + 77, run * 0.02 / k) * 0.006 * w, X = pp[ii][0] + q[0] * (h.t * w / 2 + wob), Yy = pp[ii][1] + q[1] * (h.t * w / 2 + wob);
            var on = u <= h.cut && (h.load - 0.78 * u + 0.3 * noise(h.ph, run * 0.0034 / k) >= 0.5);
            if (on && h.on && ii > 0) { c.moveTo(h.px, h.py); c.lineTo(X, Yy); }
            h.px = X; h.py = Yy; h.on = on;
          }
          c.stroke();
        }
        at = m;
      }
    };
  }
  function paint(c, pts, w, o) { var s = stroke(c, pts, w, o); s.to(s.n); }

  // the logo's ink as a picture, in the yellow
  var mark = null, waiting = [];
  function withMark(fn) {
    if (mark) { fn(mark); return; }
    waiting.push(fn); if (waiting.length > 1) return;
    var im = new Image();
    im.onload = function () { var o = document.createElement('canvas'); o.width = im.naturalWidth; o.height = im.naturalHeight; var g = o.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = Y; g.fillRect(0, 0, o.width, o.height); mark = o; waiting.forEach(function (f) { f(mark); }); waiting = []; };
    // (the larger picture where the screen has the points to show it: a wide screen, or one with fine points)
    im.src = (document.documentElement.getAttribute('data-assets') || 'assets/') + (window.innerWidth * (window.devicePixelRatio || 1) > 1500 ? 'brush/mark-1800.webp' : 'brush/mark.webp');
  }

  /* the logo, painted: its own five strokes in the order a hand paints them: both legs together, the V, and the bar last, laid
     over the M. (Never the bar over one leg alone.) The picture of the logo is uncovered along each stroke's path, so what appears
     is the logo's real paint. loop: after a while the brush takes the paint back, the bar first, and paints it again. */
  var MARK = { U: 1490, s: [
    { p: [[245, 1459], [255, 839], [313, 269]], w: 214, t: [0, 0.36] }, { p: [[1183, 169], [1245, 799], [1223, 1499]], w: 214, t: [0.04, 0.4] },
    { p: [[263, 189], [513, 639], [738, 1089]], w: 214, t: [0.34, 0.54] }, { p: [[713, 1129], [943, 659], [1183, 179]], w: 214, t: [0.5, 0.7] },
    { p: [[13, 239], [653, 175], [1483, 89]], w: 190, t: [0.66, 1] }] };
  function writeLogo(c, el, run, im, x0, y0, mw, mh, loop) {
    var dpr = el.width / el.clientWidth || 1, W = Math.ceil(mw * dpr), H = Math.ceil(mh * dpr), k = W / MARK.U;
    var mask = document.createElement('canvas'), comp = document.createElement('canvas'); mask.width = comp.width = W; mask.height = comp.height = H;
    var m = mask.getContext('2d'), q = comp.getContext('2d'), timer = 0;
    q.imageSmoothingQuality = 'high';
    var paths = MARK.s.map(function (s) { return spline(s.p.map(function (p) { return [p[0] * k, p[1] * k]; }), 6 * dpr); });
    function line(i, t) {
      var s = MARK.s[i], p = (t - s.t[0]) / (s.t[1] - s.t[0]); if (p <= 0) return;
      p = 1 - Math.pow(1 - Math.min(1, p), 2);
      var pts = paths[i], n = Math.max(1, Math.round((pts.length - 1) * p));
      m.lineWidth = s.w * k * 1.32; m.beginPath(); m.moveTo(pts[0][0], pts[0][1]); for (var j = 1; j <= n; j++) m.lineTo(pts[j][0], pts[j][1]); m.stroke();
    }
    function whole() { c.clearRect(x0 - 2, y0 - 2, mw + 4, mh + 4); c.drawImage(im, x0, y0, mw, mh); }
    function part(t) {      // t: 0 nothing painted yet, 1 all of it
      m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H); m.lineCap = 'square'; m.lineJoin = 'round'; m.strokeStyle = '#fff';
      for (var i = 0; i < 4; i++) line(i, t);
      m.globalCompositeOperation = 'destination-out'; line(4, 9);      // where the bar will lie nothing shows until the bar is painted
      m.globalCompositeOperation = 'source-over'; line(4, t);
      q.globalCompositeOperation = 'source-over'; q.clearRect(0, 0, W, H); q.drawImage(mask, 0, 0); q.globalCompositeOperation = 'source-in'; q.drawImage(im, 0, 0, W, H);
      c.clearRect(x0 - 2, y0 - 2, mw + 4, mh + 4); c.drawImage(comp, x0, y0, mw, mh);
    }
    function alive() { return el._run === run && el.isConnected !== false; }
    function seen() { var r = el.getBoundingClientRect(); return !document.hidden && r.bottom > 80 && r.top < window.innerHeight; }
    function go(dir) {
      var t0 = null, D = dir > 0 ? 1500 : 620, done = false;
      function end() {
        if (done || !alive()) return; done = true;
        if (dir < 0) { c.clearRect(x0 - 2, y0 - 2, mw + 4, mh + 4); go(1); return; }
        whole();
        if (loop) timer = setTimeout(again, 8500);
      }
      function frame(now) {
        if (done || !alive()) return;
        if (t0 == null) t0 = now;
        var p = (now - t0) / D;
        if (p >= 1) { end(); return; }
        part(dir > 0 ? p : 1 - p);
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      setTimeout(end, D + 500);      // if the browser gives no frames, the logo still stands there
    }
    function again() { if (!alive()) return; if (!seen()) { timer = setTimeout(again, 2500); return; } go(-1); }
    go(1);
  }
  // the width of the brush that paints the strokes of a page: the same on every page of one screen
  function brush(w) { return Math.max(26, Math.min(70, w * 0.047)); }

  /* every picture hands its strokes to go({ ms, acts }): acts are [stroke, from, to], the part of the time each one takes */
  var DRAW = {
    // the logo of the first screen, alone: nothing hangs on it. data-motion="once": the brush paints it as you arrive;
    // "loop": and paints it again every few seconds; without it the logo simply stands there
    logo: function (c, w, h, el, go, live) {
      var run = el._run, motion = el.getAttribute('data-motion');
      withMark(function (im) {
        if (el._run !== run) return;
        // on a phone the logo stands at the top right, over the name; on a wide screen at the right, beside it, at the name's own height
        var narrow = w < 700, mh = Math.round(narrow ? Math.min(h * 0.3, w * 0.54 * im.height / im.width) : Math.min(h * 0.5, w * 0.27 * im.height / im.width)), mw = Math.round(mh * im.width / im.height);
        var x0 = Math.round(narrow ? w - mw - 20 : w * 0.76 - mw * 0.5), y0 = Math.round((narrow ? h * 0.3 : h * 0.53) - mh / 2);
        c.imageSmoothingQuality = 'high';
        if (motion && live && !still) writeLogo(c, el, run, im, x0, y0, mw, mh, motion === 'loop'); else c.drawImage(im, x0, y0, mw, mh);
      });
    },
    // the wall behind the first screen: one line of the brush that goes up and down across it like the shape of a sound, in black
    // paint on black, so that only the brushwork shows. Nothing in it is even: its middle wanders up and down the screen, no two
    // crests are as high or as wide, and its legs lean one way and the other, as a hand draws it. It is painted wider than the screen,
    // from its left end to its right, while you look; the stylesheet then moves it slowly from side to side.
    // The brush does not hold paint for so long a line: every few crests it runs dry, is dipped again and set down a little before
    // where it stopped, with a little more or less weight on it, so the line is a row of strokes, each wet where it begins and dry
    // where it ends
    wall: function (c, w, h, el, go) {
      var bw = Math.max(18, h * 0.037), r0 = bw * 1.38, runs = [], cur, x = -3 * r0, y, i = 0, a;
      // where the middle of the line is at a crest: it wanders slowly, and a little from one crest to the next
      function mid(i) { return h * (0.55 + 0.13 * noise(3, i * 0.19) + 0.045 * noise(11, i * 0.67)); }
      // how far a crest stands from the middle: a loudness that swells and falls, with crests that are suddenly small or suddenly tall
      function far(i) { var e = 0.5 + 0.5 * noise(7, i * 0.23), v = Math.pow(Math.max(0, Math.min(1, 0.56 * e + 0.7 * hash(i * 1.7 + 3) - 0.12)), 1.5); return h * (0.03 + 0.27 * v); }
      // along a leg to a place; dip: the brush is dipped part of the way along this leg
      function leg(tx, ty, dip) {
        var m = Math.max(2, Math.round(Math.hypot(tx - x, ty - y) / (r0 * 1.1))), fx = x, fy = y, at = Math.ceil(m / 2);
        for (var q = 1; q <= m; q++) {
          cur.push([fx + (tx - fx) * q / m, fy + (ty - fy) * q / m]);
          if (dip && q === at) { runs.push(cur); cur = [[fx + (tx - fx) * (q - 1) / m, fy + (ty - fy) * (q - 1) / m], [fx + (tx - fx) * q / m, fy + (ty - fy) * q / m]]; }
        }
        x = tx; y = ty;
      }
      y = mid(0); cur = [[x, y]];
      while (x < w + 3 * r0) {
        // up (or down) a leg that leans, round the crest in half a turn (a wide turn or a narrow one), and on to the next leg
        var up = i % 2 === 0, r = r0 * (0.7 + 1.05 * hash(i * 2.9 + 5)), reach = Math.max(r * 1.25, far(i) * (up ? 1 : 0.55 + 0.75 * hash(i * 4.1 + 2)));
        var tip = up ? mid(i) - reach : mid(i) + reach, cy = up ? tip + r : tip - r, lean = r0 * (hash(i * 3.3 + 1) * 1.5 - 0.4);
        leg(x + lean, cy, i > 0 && hash(i * 5.7 + 9) < 0.34);
        for (a = 1; a <= 8; a++) { var t = a / 8 * Math.PI; cur.push([x + r - r * Math.cos(t), cy + (up ? -1 : 1) * r * Math.sin(t)]); }
        x += 2 * r; y = cy; i++;
      }
      leg(x + r0, mid(i)); runs.push(cur);
      // one stroke after the other at one pace: each takes the share of the time that its length is of the whole line
      var k = Math.max(0.6, h / 760), lens = runs.map(function (p) { var s = 0; for (var j = 1; j < p.length; j++) s += Math.hypot(p[j][0] - p[j - 1][0], p[j][1] - p[j - 1][1]); return s; }), all = lens.reduce(function (s, v) { return s + v; }, 0), done = 0;
      go({ ms: 5600, even: true, acts: runs.map(function (p, j) { var from = done / all; done += lens[j]; return [stroke(c, p, bw * (0.8 + 0.42 * hash(j * 1.9 + 4)), { color: '#151512', dry: 1.14 + hash(j * 2.3 + 1) * 0.34, seed: 51 + j * 3, grain: k, soft: true }), from, done / all]; }) });
    },
    // three strokes as large as the wall (the board's own three, stretched to the room)
    gesture: function (c, w, h, el, go) {
      var sx = w / 390, sy = h / 760, k = Math.sqrt(sx * sy), P = function (pts) { return pts.map(function (q) { return [q[0] * sx, q[1] * sy]; }); };
      go({ ms: 1300, acts: [
        [stroke(c, P([[96, -50], [80, 200], [124, 470]]), 124 * k, { dry: 1.15, seed: 5, grain: k }), 0, 0.42],
        [stroke(c, P([[-70, 690], [120, 520], [250, 330], [450, 80]]), 172 * k, { dry: 1.2, seed: 3, grain: k }), 0.28, 0.8],
        [stroke(c, P([[170, 590], [300, 566], [440, 572]]), 66 * k, { dry: 1.1, seed: 9, color: BONE, grain: k }), 0.72, 1]] });
    },
    // one mark of the brush. data-kind: m (a mix, yellow, upright), a (an artist, bone, upright), n (a night, yellow, lying); data-n: which one
    dab: function (c, w, h, el, go) {
      var kind = el.getAttribute('data-kind'), n = +el.getAttribute('data-n') || 0, s = Math.min(w / 50, h / 58), x = w / 2, y = h / 2, j = (hash(n * 2.3) - 0.5) * 7 * s;
      go({ ms: 150, acts: [[kind === 'n' ? stroke(c, [[x - 20 * s, y + j], [x + 20 * s, y - j * 0.5]], 15 * s, { dry: 1.2 + hash(n), seed: n, grain: s })
        : stroke(c, [[x + j, y - 21 * s], [x - j * 0.5, y + 21 * s]], 15 * s, { dry: 1.1 + hash(n) * 1.5, seed: n, color: kind === 'a' ? BONE : Y, grain: s }), 0, 1]] });
    },
    // the foot of every page: the stroke lying, rising a little to the right and running dry there, as the logo's own bar does
    bar: function (c, w, h, el, go) {
      var bw = brush(w);
      go({ ms: 820, acts: [[stroke(c, [[-14, h * 0.62], [w * 0.5, h * 0.52], [w + 14, h * 0.38]], bw, { dry: 1.2, seed: 12, grain: bw / 26 }), 0, 1]] });
    },
    // the M of the logo, walked
    zigzag: function (c, w, h, el, go) {
      var sx = w / 390, sy = h / 760, k = Math.sqrt(sx * sy);
      var Z = [[36, 150], [352, 262], [36, 392], [352, 512], [36, 632], [214, 704]].map(function (q) { return [q[0] * sx, q[1] * sy]; });
      go({ ms: 760, even: true, acts: [[stroke(c, Z, 26 * k, { dry: 1.3, sharp: true, seed: 4, grain: k }), 0, 1]] });
    },
    // one stroke across the head of a page. data-dir: 1 runs down to the right, -1 down to the left
    slash: function (c, w, h, el, go) {
      // data-part: how much of the canvas's height the stroke's own band takes
      var dir = +el.getAttribute('data-dir') || 1, seed = +el.getAttribute('data-seed') || 31, k = h * (parseFloat(el.getAttribute('data-part')) || 1) / 112;
      var S = dir > 0 ? [[-10 * k, 24 * k], [w + 10 * k, 96 * k]] : [[w + 10 * k, 24 * k], [-10 * k, 96 * k]];
      go({ ms: 640, acts: [[stroke(c, S, 26 * k, { dry: 1.3, sharp: true, seed: seed, grain: k }), 0, 1]] });
    }
  };

  // paint a picture's strokes in time, the way the hand moves: quick off the mark, slower as the brush runs dry. If the browser
  // gives no frames (a tab in the background), a timer finishes the picture
  function play(el, plan, live, run) {
    var acts = plan.acts, done = false, wait = +el.getAttribute('data-wait') || 0, t0 = null;
    function finish() { if (done || el._run !== run) return; done = true; acts.forEach(function (a) { a[0].to(a[0].n); }); }
    if (!live || still) { finish(); return; }
    function frame(now) {
      if (done || el._run !== run) return;
      if (t0 == null) t0 = now;
      var t = (now - t0 - wait) / plan.ms;
      if (t >= 1) { finish(); return; }
      if (t > 0) acts.forEach(function (a) { var p = (t - a[1]) / (a[2] - a[1]); if (p > 0) { p = Math.min(1, p); a[0].to(a[0].n * (plan.even ? p : 1 - Math.pow(1 - p, 2.2))); } });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    setTimeout(finish, wait + plan.ms + 400);
  }
  // live: painted in time (it has just come onto the screen); otherwise at once. again: paint it even if it is already painted at this size
  function draw(el, live, again) {
    var fn = DRAW[el.getAttribute('data-fx')]; if (!fn) return;
    var w = el.clientWidth, h = el.clientHeight; if (!w || !h) return;
    if (!again && el._w && Math.abs(el._w - w) / el._w < 0.06 && Math.abs(el._h - h) / el._h < 0.06) return;      // already painted at this size
    el._w = w; el._h = h; var run = el._run = (el._run || 0) + 1;
    // (a large picture is painted with fewer points than the screen has, to keep it light; the logo is not: it has to be sharp)
    var dpr = el.getAttribute('data-fx') === 'logo' ? Math.min(window.devicePixelRatio || 1, 2.5) : Math.min(window.devicePixelRatio || 1, w * h > 900000 ? 1.5 : 2);
    el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
    var c = el.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    fn(c, w, h, el, function (plan) { if (el._run === run) play(el, plan, live, run); }, live);
  }
  var seen = null;
  // watch every picture inside root: each is painted when it comes onto the screen
  function all(root) {
    var list = Array.prototype.slice.call((root || document).querySelectorAll('canvas[data-fx]'));
    if (!('IntersectionObserver' in window)) { list.forEach(function (el) { draw(el); }); return; }
    if (!seen) seen = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { seen.unobserve(e.target); draw(e.target, true); } }); }, { rootMargin: still ? '60% 0px' : '0px 0px -6% 0px' });
    list.forEach(function (el) { seen.observe(el); });
  }
  // the page has changed: stop watching the pictures of the one before
  function forget() { if (seen) seen.disconnect(); }

  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { Array.prototype.slice.call(document.querySelectorAll('canvas[data-fx]')).forEach(function (el) { if (el._w) draw(el); }); }, 220); });
  // (mark, withMark and spline: the logo's five strokes, its ink as a picture and the curve through points, for the parts of a page that move with the scroll)
  window.TM_FX = { all: all, draw: draw, paint: paint, stroke: stroke, forget: forget, still: still, mark: MARK, withMark: withMark, spline: spline };
})();

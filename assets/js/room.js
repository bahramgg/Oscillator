/* Tehran Movement: the room (/room), entered from "The room" on the home page.
   A corridor drawn as a grid of light and walked like a room: photographs of Keyv's nights, in black and white, hang on its walls
   and lie on its floor and its ceiling, the newest first (the content is `room` in data.js; in the code below each one is still
   called a set, as the posters of the first room were). The visitor walks as a person would, toward where they face: the wheel, a
   finger up and down, the arrow keys up and down walk on and step back (turned round to the door, on is toward the door). The head
   turns only by hand, all the way round: the mouse held down or a finger sideways (it stays the way it was turned), a little toward
   the pointer on a computer. Nothing moves by itself. The set the visitor is coming up to is named at the foot of the screen and
   marked on the rule at the right. A set pointed at says "Open"; opened, it leaves its place, turns and comes to the front, the corridor dims
   behind it and its story stands beside it; closed, it goes back to its place. At the far end the logo is on the wall.
   It is meant as a room, not a picture of one: every set throws its own colour onto the walls and the floor around it, the floor is
   polished and holds their reflection, and dust hangs in the air and stirs as you walk.
   One WebGL canvas, no library. The surfaces draw their own lines, one point wide at any distance; the whole picture is bent at its
   edges like a wide lens, and it is drawn larger than the screen, so that the bending never makes its middle soft. An open set is
   drawn from its large picture, not from the copy on the wall.
   app.js shows the page (VIEWS.room, with html() below) and starts it as a part that moves with the scroll (data-scene="tunnel").
   Where motion is not wanted, or the browser cannot draw it, the page is the same sets as a plain list. */
(function () {
  'use strict';
  var D = window.TM || {}, LIST = D.room || [], EVENTS = D.events || [], root = document.documentElement;
  var MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function inOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function hash(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  // a day the way the posters write it (OCT.15 . 2026); a month alone as SEP . 2025
  function when(iso) { var p = String(iso || '').split('-'); return p.length === 3 ? MON[+p[1] - 1] + '.' + p[2] + ' . ' + p[0] : p.length === 2 ? MON[+p[1] - 1] + ' . ' + p[0] : String(iso || ''); }
  function thumb(src) { return String(src).replace(/\/([^\/]+)\.(jpe?g|png)$/i, '/t/$1.webp'); }
  function byDate(d) { for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].date === d) return EVENTS[i]; return null; }

  /* ─── the sets, as the room shows them ─────────────────────────────── */
  // image: the picture on the wall; full: the picture when it is open. A photograph brings its own; a night without one shows its
  // poster (its small copy on the wall, the poster itself when open). A photograph taken at a night is under the night's name, with
  // the hour it was taken: the night's line-up and page come from the night
  var ITEMS = LIST.map(function (r) {
    var e = r.night ? byDate(r.night) : null, own = !!r.image, rows = [], t = String(r.taken || '').split(' ');
    if (r.night && !e) return null;
    if (e && own) rows.push(['Night', e.title + ', ' + when(e.date)]);
    if (e && (e.lineup || []).length) rows.push(['Line-up', e.lineup.join(', ')]);
    if (e && !own) { rows.push(['Date', when(e.date)]); if (e.designer) rows.push(['Poster', e.designer]); }
    (r.rows || []).forEach(function (x) { rows.push(x); });
    if (r.taken) rows.push(['Taken', when(t[0]) + (t[1] ? ', ' + t[1] : '')]);
    else if (!e && r.date) rows.push(['Date', when(r.date)]);
    var title = r.title || (e ? e.title : ''), date = e ? e.date : r.date || (r.taken ? t[0] : '');
    return { title: title, date: date, at: r.taken ? t[1] || '' : '', image: own ? r.image : e ? thumb(e.poster) : '', full: own ? r.full || r.image : e ? e.poster : '',
      kind: r.kind || (e && own ? e.title : ''), who: r.who || '', sub: r.sub || '', say: r.say || '', rows: rows,
      alt: r.alt || (e ? 'The poster for ' + title + ', ' + when(date) : title), link: e ? '/events/' + e.date : r.link || '', linkLabel: e ? 'The night' : r.linkLabel || 'More', ig: r.ig || '' };
  }).filter(function (it) { return it && it.title && it.image; });
  ITEMS.forEach(function (it, i) { it.i = i; });
  var N = ITEMS.length;

  // the small line under a name: what it was, with whom, the hour, the day (the dots between are drawn, the brush font has none)
  function tag(it) { return [it.kind, it.who, it.at, when(it.date)].filter(Boolean).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join(''); }
  function hrefOf(env, p) { return /^\//.test(p) && env && env.href ? env.href(p) : p; }
  function aTo(env, p, cls, inner) {
    if (/^\//.test(p)) return '<a class="' + cls + '" href="' + esc(hrefOf(env, p)) + '" data-link data-route="' + esc(p) + '">' + inner + '</a>';
    return '<a class="' + cls + '" href="' + esc(p) + '" target="_blank" rel="noopener">' + inner + '</a>';
  }
  var I_MOON = '<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z"/></svg>';
  var I_SUN = '<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.4"/><path d="M12 1.8v3M12 19.2v3M1.8 12h3M19.2 12h3M4.8 4.8l2.1 2.1M17.1 17.1l2.1 2.1M4.8 19.2l2.1-2.1M17.1 6.9l2.1-2.1"/></svg>';
  var I_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>';
  var I_ARROW = '<svg class="rm__arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5"/></svg>';

  // the page: the corridor's stage (fixed on the screen: the room takes the walk's gestures itself) and the same sets as a list, for
  // where the corridor is not drawn
  function html(env) {
    env = env || {};
    var first = ITEMS[0] || { title: '', i: 0 };
    var stage = '<div class="rm__stage">' +
      '<canvas class="rm__cv" aria-hidden="true"></canvas>' +
      '<div class="rm__top"><a class="rm__brand" href="' + esc(hrefOf(env, '/')) + '" data-link data-route="/"><i class="rm__mark" aria-hidden="true"></i><span><b>Tehran Movement</b><small>The room / Keyv, live</small></span></a>' +
        '<div class="rm__tools">' + (SND ? '<button class="rm__snd" type="button" aria-pressed="false" aria-label="Sound" title="' + esc('Sound: ' + SND.title + ', ' + SND.artist) + '"><i></i><i></i><i></i><i></i></button>' : '') +
        '<button class="rm__mode" type="button" aria-pressed="false" aria-label="Light room">' + I_MOON + I_SUN + '</button>' +
        '<button class="rm__pill rm__ix" type="button" aria-expanded="false" aria-controls="rm-index">Index<sup>' + N + '</sup></button>' +
        '<a class="rm__pill" href="' + esc(hrefOf(env, '/')) + '" data-link data-route="/" data-room-exit>Exit</a></div></div>' +
      '<div class="rm__now"><p class="rm__no"><b>' + pad(1) + '</b> / ' + pad(N) + '</p><h2 class="rm__title">' + esc(first.title) + '</h2><p class="rm__tag"><i></i>' + (ITEMS[0] ? tag(first) : '') + '</p>' +
        '<p class="rm__hint"><span class="rm__hint-p">Scroll to walk the room<span>Drag to look around</span><span>Click a photo to open it</span></span><span class="rm__hint-t">Swipe up to walk, down to step back<span>Sideways to look around</span><span>Tap a photo to open it</span></span></p></div>' +
      '<div class="rm__end"><p class="rm__no">The end of the room</p><p class="rm__endh">' + esc(N + ' photos, ' + (ITEMS[N - 1] ? String(ITEMS[N - 1].date).slice(0, 4) : '') + ' to ' + (ITEMS[0] ? String(ITEMS[0].date).slice(0, 4) : '')) + '</p>' +
        (SND ? '<p class="rm__endsnd">Sound: ' + esc(SND.title + ', ' + SND.artist) + '</p>' : '') +
        '<p class="rm__endgo"><button class="rm__pill rm__pill--solid" type="button" data-room-top>Back to the start</button><a class="rm__pill" href="' + esc(hrefOf(env, '/')) + '" data-link data-route="/" data-room-exit>Exit</a></p></div>' +
      '<nav class="rm__rule" aria-label="The photos in the room">' + ITEMS.map(function (it) { return '<button class="rm__tick" type="button" data-i="' + it.i + '" aria-label="' + esc(pad(it.i + 1) + ', ' + it.title + ', ' + when(it.date)) + '"><span>' + esc(it.title) + '</span></button>'; }).join('') + '</nav>' +
      '<p class="rm__tip" aria-hidden="true"><i></i><span>Open</span><b></b></p><i class="rm__dot" aria-hidden="true"></i>' +
      '<section class="rm__open" role="dialog" aria-modal="true" aria-labelledby="rm-open-h" hidden><button class="rm__x" type="button" aria-label="Close, back to the room">' + I_X + '</button>' +
        '<div class="rm__info"><p class="rm__kind"><i></i><span></span></p><h2 class="rm__h" id="rm-open-h"></h2><p class="rm__sub"></p><p class="rm__say"></p><dl class="rm__rows"></dl>' +
        '<div class="rm__act"><p class="rm__links"></p><p class="rm__next"><span>Next photo</span><button type="button"></button></p></div></div></section>' +
      '<section class="rm__index" id="rm-index" aria-label="Every photo in the room" hidden><div class="rm__ixin"><p class="rm__ixh">Index<sup>' + N + '</sup></p><ol>' + ITEMS.map(function (it) {
        return '<li><button type="button" data-i="' + it.i + '"><span class="rm__ixno">' + pad(it.i + 1) + '</span><span class="rm__ixt">' + esc(it.title) + '</span><span class="rm__ixtag">' + tag(it) + '</span></button></li>';
      }).join('') + '</ol></div></section>' +
      '</div>';
    var flat = '<div class="rm__flat">' + (env.head ? env.head('r', 'The room', 'Keyv’s nights in black and white, the newest first.') : '<h1 class="g">The room</h1>') +
      '<ol class="rm__cards">' + ITEMS.map(function (it) {
        var links = [it.link ? aTo(env, it.link, '', esc(it.linkLabel)) : '', it.ig ? aTo(env, it.ig, '', 'On Instagram') : ''].join('');
        return '<li class="rmc"><figure class="rmc__img"><img src="' + esc(it.image) + '" loading="lazy" decoding="async" alt="' + esc(it.alt) + '"></figure>' +
          '<div class="rmc__txt"><p class="rmc__no g">' + pad(it.i + 1) + ' / ' + pad(N) + '</p><h2 class="rmc__h g">' + esc(it.title) + '</h2><p class="rmc__tag g">' + tag(it) + '</p>' +
          (it.sub ? '<p class="rmc__sub">' + esc(it.sub) + '</p>' : '') + (it.say ? '<p class="rmc__say">' + esc(it.say) + '</p>' : '') +
          '<dl class="rmc__rows">' + it.rows.map(function (r) { return '<div><dt class="g">' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
          (links ? '<p class="links">' + links + '</p>' : '') + '</div></li>';
      }).join('') + '</ol>' + (env.foot ? env.foot() : '') + '</div>';
    return '<section class="rm" data-scene="tunnel" aria-label="The room: Keyv’s nights in photographs">' + stage + flat + '</section>';
  }

  /* ─── small vector tools ───────────────────────────────────────────── */
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function scl(a, k) { return [a[0] * k, a[1] * k, a[2] * k]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.sqrt(dot(a, a)) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function lerp3(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
  // a turn as a quaternion, from the three axes of a thing (its right, its up, its face), and back
  function quat(r, u, f) {
    var m00 = r[0], m11 = u[1], m22 = f[2], t = m00 + m11 + m22, s;
    if (t > 0) { s = Math.sqrt(t + 1) * 2; return [(u[2] - f[1]) / s, (f[0] - r[2]) / s, (r[1] - u[0]) / s, 0.25 * s]; }
    if (m00 > m11 && m00 > m22) { s = Math.sqrt(1 + m00 - m11 - m22) * 2; return [0.25 * s, (u[0] + r[1]) / s, (f[0] + r[2]) / s, (u[2] - f[1]) / s]; }
    if (m11 > m22) { s = Math.sqrt(1 + m11 - m00 - m22) * 2; return [(u[0] + r[1]) / s, 0.25 * s, (f[1] + u[2]) / s, (f[0] - r[2]) / s]; }
    s = Math.sqrt(1 + m22 - m00 - m11) * 2; return [(f[0] + r[2]) / s, (f[1] + u[2]) / s, 0.25 * s, (r[1] - u[0]) / s];
  }
  function slerp(a, b, t) {
    var c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3], s = 1, k0, k1;
    if (c < 0) { c = -c; s = -1; }
    if (c > 0.9995) { k0 = 1 - t; k1 = t * s; }
    else { var o = Math.acos(c), so = Math.sin(o); k0 = Math.sin((1 - t) * o) / so; k1 = Math.sin(t * o) / so * s; }
    var q = [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1, a[3] * k0 + b[3] * k1], l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]) || 1;
    return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
  }
  function axes(q) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    return { r: [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w)], u: [2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w)] };
  }

  /* ─── the corridor's measures (one unit is one square of the grid) ──── */
  // K: how much the picture bends at its edges (it is drawn K larger than the screen, so that its middle is never stretched)
  var HW = 4, HH = 3, GAP = 6.4, Z0 = -6, AHEAD = 4.6, EPS = 0.02, K = 0.34, SS = 1 + K, NL = 6, DUST = 800, AIR = 40;
  // where each set is: on which surface, and how far off the middle of it (the order of the old corridor: right, left, above, below)
  var SURF = ['right', 'left', 'ceil', 'floor', 'right', 'left', 'floor', 'ceil', 'left', 'right', 'floor', 'right', 'ceil', 'left'];
  var OFF = [0.15, -0.35, 0.55, -0.45, -0.2, 0.3, 0.5, -0.6, 0.05, 0.45, -0.3, -0.55, 0.2, 0.35];
  function zOf(i) { return Z0 - i * GAP; }
  function station(i) { return zOf(i) + AHEAD; }      // where the camera stands when a set is the one named
  // the walk begins well before the first set (far enough for a phone's narrow view to have it in sight) and ends a little past
  // the last one, before the wall at the end. Behind the start the room is closed by the wall it is entered through, with its door
  var Z_START = zOf(0) + 11, Z_LAST = station(Math.max(0, N - 1)), Z_END = Z_LAST - 6, Z_WALL = zOf(Math.max(0, N - 1)) - 11, Z_BACK = Z_START + 9;
  var DOOR = { C: [0, -HH + 2.6, Z_BACK - EPS], U: [-1, 0, 0], V: [0, 1, 0], N: [0, 0, -1], w: 2.6, h: 5.2 };
  var DARK = { bg: [0, 0, 0], ink: [0.7, 0.7, 0.68], fog: 30, vig: 0.58, dimTo: [0, 0, 0] }, LIGHT = { bg: [0.957, 0.953, 0.937], ink: [0.62, 0.614, 0.59], fog: 34, vig: 0.2, dimTo: [0.975, 0.972, 0.96] };
  var YELLOW = [1, 0.996, 0.149];

  /* ─── the shaders ──────────────────────────────────────────────────────
     The light of the sets (up to six, the nearest) is worked out at the corners of the corridor's small squares and spread between
     them: a soft pool of each picture's colour on the surfaces in front of it, and a little on the wall it hangs on. */
  var LIGHT_GLSL = 'uniform vec3 uLP[6]; uniform vec3 uLN[6]; uniform vec4 uLC[6];\n' +
    'vec3 lightAt(vec3 p, vec3 n, float reach) {\n' +
    '  vec3 s = vec3(0.0);\n' +
    '  for (int i = 0; i < 6; i++) {\n' +
    '    vec3 d = p - uLP[i]; float r = max(uLC[i].a, 0.001) * reach;\n' +
    '    float f = exp(-dot(d, d) / (r * r)) * mix(0.42, 1.0, smoothstep(-0.3, 1.0, dot(d, uLN[i])));\n' +
    '    f *= clamp(dot(n, -normalize(d + vec3(0.0, 0.0, 0.0001))) * 0.7 + 0.45, 0.0, 1.0);\n' +
    '    s += uLC[i].rgb * f;\n' +
    '  }\n' +
    '  return s;\n' +
    '}\n';
  var GRID_V = 'precision highp float;\nattribute vec3 aPos; attribute vec2 aGrid; attribute vec3 aN; uniform mat4 uPV; varying vec3 vW; varying vec2 vG; varying vec3 vLit;\n' + LIGHT_GLSL +
    'void main() { vW = aPos; vG = aGrid; vLit = lightAt(aPos, aN, 1.0); gl_Position = uPV * vec4(aPos, 1.0); }';
  var GRID_F = '#extension GL_OES_standard_derivatives : enable\nprecision highp float;\n' +
    'varying vec3 vW; varying vec2 vG; varying vec3 vLit;\n' +
    'uniform vec3 uCam, uInk, uBg, uDimTo; uniform float uFog, uShow, uDim, uPx, uK, uMode; uniform vec2 uRes, uAsp;\n' +
    'void main() {\n' +
    '  vec2 f = fwidth(vG);\n' +
    // a line is one point wide on the screen: where the bending squeezes the picture, it is drawn wider here
    '  vec2 q = (gl_FragCoord.xy / uRes * 2.0 - 1.0) * uAsp; float px = uPx * (1.0 + 2.0 * uK * dot(q, q));\n' +
    '  vec2 d = abs(fract(vG + 0.5) - 0.5) / max(f, vec2(1e-5));\n' +
    '  float l = 1.0 - smoothstep(px * 0.5 - 0.5, px * 0.5 + 0.55, min(d.x, d.y));\n' +
    '  float crowd = 1.0 - smoothstep(0.24, 0.62, max(f.x, f.y));\n' +
    '  float dist = distance(vW, uCam);\n' +
    '  float fog = exp(-pow(dist / uFog, 1.4)) * (0.55 + 0.45 * smoothstep(14.0, 1.5, dist));\n' +
    '  vec3 lit = vLit * uShow; float k = clamp(max(lit.r, max(lit.g, lit.b)), 0.0, 1.0); vec3 hue = lit / max(max(lit.r, max(lit.g, lit.b)), 0.001);\n' +
    // in the dark the light brightens and colours the lines and washes the surface; in the light room it colours the lines
    '  vec3 ink = mix(uInk + lit * 1.2, mix(uInk, hue * 0.62, k * 0.8), uMode);\n' +
    '  vec3 base = uBg + lit * 0.12 * (1.0 - uMode) * fog;\n' +
    '  float a = l * crowd * fog * uShow;\n' +
    '  gl_FragColor = vec4(mix(mix(base, ink, a), uDimTo, uDim * 0.7), 1.0);\n' +
    '}';
  // a picture in the room, or its reflection in the floor (mirrored, fainter the higher the picture hangs, and soft)
  var PANEL_V = 'precision highp float;\nattribute vec2 aQ; uniform mat4 uPV; uniform vec3 uC, uU, uV; uniform float uMirror, uFloorY; varying vec2 vUv; varying vec3 vW; varying float vUp;\n' +
    'void main() { vec3 p = uC + uU * aQ.x + uV * aQ.y; vUp = p.y - uFloorY; if (uMirror > 0.5) p.y = 2.0 * uFloorY - p.y; vW = p; vUv = aQ + 0.5; gl_Position = uPV * vec4(p, 1.0); }';
  var PANEL_F = '#extension GL_OES_standard_derivatives : enable\nprecision highp float;\n' +
    'varying vec2 vUv; varying vec3 vW; varying float vUp; uniform sampler2D uTex; uniform vec3 uCam, uBg, uTint, uDimTo; uniform float uFog, uA, uDim, uInk, uMirror, uRefl;\n' +
    'void main() {\n' +
    '  vec4 t = uMirror > 0.5 ? texture2D(uTex, vUv, 2.4) : texture2D(uTex, vUv);\n' +
    '  vec2 fw = fwidth(vUv) * 1.3;\n' +
    '  vec2 e = smoothstep(vec2(0.0), fw, vUv) * smoothstep(vec2(0.0), fw, vec2(1.0) - vUv);\n' +
    '  float fog = exp(-pow(distance(vW, uCam) / uFog, 1.4));\n' +
    '  vec3 c = mix(mix(t.rgb, uTint, uInk), uDimTo, uDim * 0.72);\n' +
    '  float a = e.x * e.y * uA * mix(1.0, t.a, uInk);\n' +
    '  if (uMirror > 0.5) a *= uRefl * exp(-vUp * 0.5);\n' +
    '  gl_FragColor = vec4(mix(uBg, c, fog), a);\n' +
    '}';
  // the soft yellow light round a picture, like a frame of light (the owner's wish, so that the black and white photographs stand out
  // from the dark walls): strongest at the picture's edge and gone a little way out, on the picture's own surface and never past that
  // surface's edges. In the dark room it is light added; in the light room a yellow tint. The floor mirrors it with the picture
  var HALO_V = 'precision highp float;\nattribute vec2 aQ; uniform mat4 uPV; uniform vec3 uC, uU, uV; uniform vec2 uHalf; uniform float uM, uMirror, uFloorY; varying vec2 vS; varying vec3 vW, vP; varying float vUp;\n' +
    'void main() { vS = aQ * 2.0 * (uHalf + uM); vec3 p = uC + uU * vS.x + uV * vS.y; vP = p; vUp = p.y - uFloorY; if (uMirror > 0.5) p.y = 2.0 * uFloorY - p.y; vW = p; gl_Position = uPV * vec4(p, 1.0); }';
  var HALO_F = 'precision highp float;\n' +
    'varying vec2 vS; varying vec3 vW, vP; varying float vUp; uniform vec2 uHalf, uBox; uniform vec3 uCam, uCol; uniform float uM, uA, uFog, uMode, uMirror, uRefl;\n' +
    'void main() {\n' +
    '  if (abs(vP.x) > uBox.x || abs(vP.y) > uBox.y) discard;\n' +
    '  float d = length(max(abs(vS) - uHalf, 0.0));\n' +
    '  float g = 1.0 - smoothstep(0.0, uM, d); g *= g * (0.4 + 0.6 * exp(-d * 7.0));\n' +
    '  float a = uA * g * exp(-pow(distance(vW, uCam) / uFog, 1.4));\n' +
    '  if (uMirror > 0.5) a *= uRefl * exp(-vUp * 0.5);\n' +
    '  gl_FragColor = vec4(uCol * a, a * uMode);\n' +
    '}';
  var HALO_M = 0.6, HALO_A = [0.36, 0.5];      // how far out it reaches (units of the room), and how strong it is (dark room, light room)
  // dust in the air: fixed in the room (so it passes by as you walk), lit by the pictures near it, stirred a little by the walk
  var DUST_V = 'precision highp float;\nattribute vec4 aD; uniform mat4 uPV; uniform vec3 uCam; uniform float uT, uLen, uPx, uFog, uA, uMode; varying float vA; varying vec3 vC;\n' + LIGHT_GLSL +
    'void main() {\n' +
    '  float w = uCam.z + 12.0 - mod(uCam.z + 12.0 - aD.z * uLen, uLen);\n' +
    '  vec3 p = vec3(aD.x * 3.8 + sin(uT + aD.w * 6.283) * 0.22, aD.y * 2.8 + sin(uT * 0.8 + aD.w * 11.0) * 0.16, w);\n' +
    '  float dist = distance(p, uCam), back = uCam.z + 12.0 - w;\n' +
    '  vA = uA * (0.22 + 0.4 * fract(aD.w * 7.31)) * exp(-pow(dist / uFog, 1.4)) * smoothstep(0.5, 1.8, dist) * smoothstep(0.0, 3.0, back) * smoothstep(uLen, uLen - 6.0, back);\n' +
    '  vec3 lit = lightAt(p, vec3(0.0, 1.0, 0.0), 1.25);\n' +
    '  vC = mix(vec3(0.86, 0.85, 0.8) + lit * 1.7, vec3(0.2, 0.2, 0.19) + lit * 0.3, uMode);\n' +
    '  gl_Position = uPV * vec4(p, 1.0);\n' +
    '  gl_PointSize = uPx * (1.3 + 2.2 * fract(aD.w * 3.7)) * clamp(4.2 / dist, 0.6, 3.0);\n' +
    '}';
  var DUST_F = 'precision mediump float;\nvarying float vA; varying vec3 vC;\nvoid main() { float a = smoothstep(0.5, 0.06, length(gl_PointCoord - 0.5)) * vA; gl_FragColor = vec4(vC * a, a); }';
  var POST_V = 'attribute vec2 aP; varying vec2 vUv; void main() { vUv = aP * 0.5 + 0.5; gl_Position = vec4(aP, 0.0, 1.0); }';
  var POST_F = 'precision mediump float;\nvarying vec2 vUv; uniform sampler2D uScene; uniform vec2 uAsp; uniform float uK, uVig; uniform vec3 uBg;\n' +
    'void main() {\n' +
    '  vec2 p = vUv * 2.0 - 1.0; vec2 q = p * uAsp; float r2 = dot(q, q);\n' +
    '  vec2 s = p * (1.0 + uK * r2) / (1.0 + uK);\n' +
    '  vec3 c = texture2D(uScene, s * 0.5 + 0.5).rgb;\n' +
    '  gl_FragColor = vec4(mix(uBg, c, mix(1.0, smoothstep(1.2, 0.42, sqrt(r2)), uVig)), 1.0);\n' +
    '}';

  /* ─── the room on the screen ───────────────────────────────────────── */
  var back = false;      // the visitor left by "Exit" or by going back: the home page opens where they went in
  /* ─── the room's sound ─────────────────────────────────────────────── */
  // One track (`roomSound` in data.js), looped on its own bars: each pass begins a whole number of bars after the one before, and
  // that one's last sound rings on into it, so the seam is not heard. Web Audio, so that the loop is exact and the sound can fade in
  // and out (a phone does not let a page fade an <audio>). A browser lets sound begin only from a visitor's hand: the click on
  // "Enter the room" is that hand, or, in a room opened from a link, the first touch, click or key in it. The round button with the
  // four bars (they move with the music) turns it off and on, and the choice is kept in the browser. It is quiet while the page is
  // not on the screen, and it fades out when the visitor leaves the room.
  var SND = D.roomSound || null;
  var Sound = (function () {
    var AC = window.AudioContext || window.webkitAudioContext, VOL = 0.6, KEY = 'tm:room-sound', BANDS = [[1, 4], [4, 16], [16, 60], [60, 220]];
    var ctx = null, out = null, meter = null, bins = null, buf = null, asked = false, off = 0, L = 0;
    var want = true, where = 'out', playing = false, next = 0, timer = 0, srcs = [], old = [], btn = null, bars = [], raf = 0, drawn = 0;      // where: out, coming (the door was pressed), in
    try { want = localStorage.getItem(KEY) !== 'off'; } catch (e) { /* no storage: on */ }
    function can() { return !!(SND && SND.src && AC); }
    // made and woken inside the visitor's gesture, the only moment a phone allows it
    function wake() {
      if (!can()) return;
      try {
        if (navigator.audioSession) navigator.audioSession.type = 'playback';      // as a film is: a phone's silent switch does not hold it back
        if (!ctx) {
          ctx = new AC(); out = ctx.createGain(); out.gain.value = 0;
          meter = ctx.createAnalyser(); meter.fftSize = 1024; meter.smoothingTimeConstant = 0.7; bins = new Uint8Array(meter.frequencyBinCount);
          out.connect(meter); meter.connect(ctx.destination);
        }
        if (ctx.state !== 'running' && !document.hidden) ctx.resume();
        if (where === 'out') where = 'coming';
        var s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0);      // an older iPhone wants a sound begun in the gesture itself
      } catch (e) { return; }
      load();
    }
    function load() {
      if (!ctx || buf || asked) return;
      asked = true;
      fetch(SND.src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(function (ab) {
        ctx.decodeAudioData(ab, function (b) { asked = false; if (where === 'out') return; buf = b; measure(b); go(); }, function () { asked = false; });
      }).catch(function () { asked = false; });
    }
    // where the music begins in the file (an encoder puts a moment of silence before it), and how long a pass is: whole bars
    function measure(b) {
      var d = b.getChannelData(0), n = d.length, i = 0;
      while (i < n && Math.abs(d[i]) < 0.02) i++;
      off = Math.max(0, i / b.sampleRate - 0.01);
      L = SND.bars && SND.bpm ? SND.bars * 240 / SND.bpm : 0;
      if (!(L > 2) || off + L > b.duration) L = b.duration - off;
    }
    // it plays when all is there: the visitor's choice, the room on the screen, the music, a woken context
    function go() {
      if (!want || where !== 'in' || !buf || !ctx || playing) return;
      playing = true; paint();
      old.forEach(function (s) { try { s.stop(); } catch (e) { /* ended */ } }); old = [];      // a pass still fading from a moment ago
      if (ctx.state !== 'running' && !document.hidden) ctx.resume();
      next = ctx.currentTime + 0.06; queue(); fade(VOL, 2.6);
      if (!raf) raf = requestAnimationFrame(draw);
    }
    function queue() {
      clearTimeout(timer); if (!playing) return;
      while (next < ctx.currentTime + 1.5) {
        var s = ctx.createBufferSource(); s.buffer = buf; s.connect(out); s.start(next, off); srcs.push(s);
        s.onended = (function (s) { return function () { var k = srcs.indexOf(s); if (k >= 0) srcs.splice(k, 1); }; })(s);
        next += L;
      }
      timer = setTimeout(queue, 500);
    }
    function fade(to, sec) {
      var g = out.gain, now = ctx.currentTime;
      try { g.cancelScheduledValues(now); } catch (e) { /* nothing scheduled */ }
      g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(to, now + sec);
    }
    // fades out; then the passes are stopped and the context sleeps
    function stop(sec) {
      if (!playing) return;
      playing = false; paint(); clearTimeout(timer);
      var mine = srcs; srcs = []; old = old.concat(mine);
      fade(0, sec);
      setTimeout(function () {
        mine.forEach(function (s) { try { s.stop(); } catch (e) { /* ended */ } var k = old.indexOf(s); if (k >= 0) old.splice(k, 1); });
        if (!playing && ctx && ctx.state === 'running') ctx.suspend();
      }, sec * 1000 + 80);
    }
    // the four bars: low, low middle, high middle, high, as loud as the music is in each
    function draw(t) {
      raf = 0;
      if (!playing || document.hidden || !bars.length) { bars.forEach(function (b) { b.style.transform = ''; }); return; }
      raf = requestAnimationFrame(draw);
      if (t - drawn < 33) return; drawn = t;
      meter.getByteFrequencyData(bins);
      for (var k = 0; k < 4; k++) {
        var m = 0; for (var i = BANDS[k][0]; i < BANDS[k][1]; i++) if (bins[i] > m) m = bins[i];
        bars[k].style.transform = 'scaleY(' + clamp((m - 70) / 160, 0.16, 1).toFixed(3) + ')';
      }
    }
    function paint() {
      if (!btn) return;
      btn.setAttribute('aria-pressed', String(want)); btn.classList.toggle('is-off', !want); btn.classList.toggle('is-on', playing);
    }
    // the room is on the screen
    function enter(el) {
      where = 'in'; btn = $('.rm__snd', el); bars = btn ? $$('i', btn) : [];
      if (btn && !can()) btn.hidden = true;
      paint();
      if (ctx && want) { wake(); go(); }
    }
    // the room is left: the music fades out, and what it took of the memory is let go (a next visit fetches it again, from the cache)
    function leave() {
      where = 'out'; stop(0.7); btn = null; bars = [];
      setTimeout(function () { if (where === 'out' && !playing) buf = null; }, 1500);
    }
    // the round button
    function press() {
      if (want && !playing) { wake(); go(); paint(); return; }      // on, but not heard yet (no hand had come): now it is
      want = !want;
      try { localStorage.setItem(KEY, want ? 'on' : 'off'); } catch (e) { /* not kept */ }
      if (want) { wake(); go(); } else stop(0.5);
      paint();
    }
    // a touch, a click or a key in the room: music that should be on and is not heard yet begins now
    function hand(e) {
      if (!want || where !== 'in' || !can() || (playing && ctx && ctx.state === 'running')) return;
      if (e && e.target && e.target.closest && e.target.closest('.rm__snd')) return;
      wake(); go();
    }
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      if (document.hidden) { if (ctx.state === 'running') ctx.suspend(); }
      else if (playing && where === 'in') { ctx.resume(); if (!raf) raf = requestAnimationFrame(draw); }
    });
    return { wake: function () { if (want) wake(); }, enter: enter, leave: leave, press: press, hand: hand };
  })();

  function mount(el) {
    if (el._room) return el._room;
    if (!N) return null;
    var cv = $('.rm__cv', el), gl = null;
    try { gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: true, stencil: false, premultipliedAlpha: false, powerPreference: 'high-performance' }); } catch (e) { gl = null; }
    if (!gl || !gl.getExtension('OES_standard_derivatives')) return null;
    var aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'), maxAniso = aniso ? gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
    var maxTex = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), 8192);
    var G, P, U, Q, H;
    function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    function program(vs, fs, attrs) {
      var p = gl.createProgram(); gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
      attrs.forEach(function (a, i) { gl.bindAttribLocation(p, i, a); }); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
      return { p: p, u: u };
    }
    try { G = program(GRID_V, GRID_F, ['aPos', 'aGrid', 'aN']); P = program(PANEL_V, PANEL_F, ['aQ']); H = program(HALO_V, HALO_F, ['aQ']); U = program(DUST_V, DUST_F, ['aD']); Q = program(POST_V, POST_F, ['aP']); }
    catch (e) { return null; }

    // the corridor, in squares of half a unit (the light is worked out at their corners): the floor first (it is drawn on its own,
    // under the reflections), then the ceiling, the two walls, the wall at the end and the wall behind the start. Each surface has
    // its own two measures for the grid, and the way it faces
    var C = (function () {
      var V = [], I = [];
      function surface(o, a, la, b, lb, n, grid) {
        var na = Math.max(1, Math.round(la / 0.5)), nb = Math.max(1, Math.round(lb / 0.5)), sa = la / na, sb = lb / nb, base = V.length / 8, i, j;
        for (j = 0; j <= nb; j++) for (i = 0; i <= na; i++) {
          var p = [o[0] + a[0] * i * sa + b[0] * j * sb, o[1] + a[1] * i * sa + b[1] * j * sb, o[2] + a[2] * i * sa + b[2] * j * sb], g = grid(p);
          V.push(p[0], p[1], p[2], g[0], g[1], n[0], n[1], n[2]);
        }
        for (j = 0; j < nb; j++) for (i = 0; i < na; i++) { var k = base + j * (na + 1) + i; I.push(k, k + 1, k + na + 2, k, k + na + 2, k + na + 1); }
      }
      var L = Z_BACK - Z_WALL, xz = function (p) { return [p[0], p[2]]; }, yz = function (p) { return [p[1], p[2]]; };
      surface([-HW, -HH, Z_BACK], [1, 0, 0], 2 * HW, [0, 0, -1], L, [0, 1, 0], xz);
      var floor = I.length;
      surface([-HW, HH, Z_BACK], [1, 0, 0], 2 * HW, [0, 0, -1], L, [0, -1, 0], xz);
      surface([-HW, -HH, Z_BACK], [0, 1, 0], 2 * HH, [0, 0, -1], L, [1, 0, 0], yz);
      surface([HW, -HH, Z_BACK], [0, 1, 0], 2 * HH, [0, 0, -1], L, [-1, 0, 0], yz);
      surface([-HW, -HH, Z_WALL], [1, 0, 0], 2 * HW, [0, 1, 0], 2 * HH, [0, 0, 1], function (p) { return [p[0], p[1]]; });
      surface([HW, -HH, Z_BACK], [-1, 0, 0], 2 * HW, [0, 1, 0], 2 * HH, [0, 0, -1], function (p) { return [p[0], p[1]]; });
      var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(V), gl.STATIC_DRAW);
      var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(I), gl.STATIC_DRAW);
      return { vb: vb, ib: ib, floor: floor, all: I.length };
    })();
    var card = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, card); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]), gl.STATIC_DRAW);
    var tri = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, tri); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var dust = gl.createBuffer(), DD = new Float32Array(DUST * 4);
    for (var di = 0; di < DUST; di++) { DD[di * 4] = hash(di * 1.7) * 2 - 1; DD[di * 4 + 1] = hash(di * 2.9 + 5) * 2 - 1; DD[di * 4 + 2] = hash(di * 4.3 + 11); DD[di * 4 + 3] = hash(di * 7.1 + 17); }
    gl.bindBuffer(gl.ARRAY_BUFFER, dust); gl.bufferData(gl.ARRAY_BUFFER, DD, gl.STATIC_DRAW);
    var fbo = { fb: gl.createFramebuffer(), tex: gl.createTexture(), depth: gl.createRenderbuffer() };

    var stage = $('.rm__stage', el), now = $('.rm__now', el), noEl = $('.rm__no b', now), titleEl = $('.rm__title', now), tagEl = $('.rm__tag', now);
    var ticks = $$('.rm__tick', el), tip = $('.rm__tip', el), tipB = $('b', tip), tipWord = $('span', tip), tipDot = $('i', tip), dotEl = $('.rm__dot', el), dlg = $('.rm__open', el), info = $('.rm__info', dlg), ixBtn = $('.rm__ix', el), ixEl = $('.rm__index', el), modeBtn = $('.rm__mode', el);
    var coarse = !!(window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches), lowMem = (navigator.deviceMemory || 4) <= 2;

    // each set as a picture in the corridor: placed when its picture has come (its shape decides its size)
    var panels = ITEMS.map(function (it) { return { it: it, ready: false, a: 0, tex: null, big: null, fade: 0, color: '', glow: [1, 1, 1] }; });
    var markTex = null, markA = 0, bigs = [], bigV = 0;
    function pot(n, cap) { var p = 1; while (p < n && p < cap) p *= 2; return p; }
    function texture(im, alpha, cap) {
      var w = pot(im.naturalWidth || im.width, cap), h = pot(im.naturalHeight || im.height, cap), c = document.createElement('canvas'); c.width = w; c.height = h;
      var g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, w, h);
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, alpha ? gl.RGBA : gl.RGB, alpha ? gl.RGBA : gl.RGB, gl.UNSIGNED_BYTE, c);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, maxAniso));
      return t;
    }
    // the picture's own colours: the most vivid part (for the dot beside its name; none for a grey picture), and the colour of
    // the light it gives the room (its whole colour, made bright)
    function colours(im) {
      try {
        var c = document.createElement('canvas'); c.width = c.height = 24; var g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0, 24, 24);
        var d = g.getImageData(0, 0, 24, 24).data, px = [], R = 0, Gr = 0, B = 0, i;
        for (i = 0; i < d.length; i += 4) { var mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); px.push([(mx ? (mx - mn) / mx : 0) * Math.sqrt(mx / 255), d[i], d[i + 1], d[i + 2]]); R += d[i]; Gr += d[i + 1]; B += d[i + 2]; }
        var top = Math.max(R, Gr, B, 1), glow = [R / top, Gr / top, B / top].map(function (v) { return mix(v, 1, 0.12); });
        px.sort(function (a, b) { return b[0] - a[0]; });
        if (px[0][0] < 0.3) return { css: '', glow: glow };
        var some = px.slice(0, 24), r = 0, gg = 0, b = 0; some.forEach(function (p) { r += p[1]; gg += p[2]; b += p[3]; });
        r /= some.length; gg /= some.length; b /= some.length;
        var k = 235 / Math.max(r, gg, b, 1);
        return { css: 'rgb(' + Math.round(Math.min(255, r * k)) + ',' + Math.round(Math.min(255, gg * k)) + ',' + Math.round(Math.min(255, b * k)) + ')', glow: glow };
      } catch (e) { return { css: '', glow: [1, 1, 1] }; }
    }
    function place(pn) {
      var i = pn.it.i, s = SURF[i % SURF.length], o = OFF[i % OFF.length], z = zOf(i), a = pn.a, w, h;
      if (s === 'right' || s === 'left') {
        h = Math.min(4.3, 5.2 / a); w = h * a; if (w > 5.2) { w = 5.2; h = w / a; }
        var y = clamp(o * 0.7, -HH + h / 2 + 0.25, HH - h / 2 - 0.25);
        pn.C = [s === 'right' ? HW - EPS : -HW + EPS, y, z]; pn.U = [0, 0, s === 'right' ? 1 : -1]; pn.V = [0, 1, 0];
      } else {
        h = Math.min(4.7, 5 / a); w = h * a; if (w > 4.8) { w = 4.8; h = w / a; }      // h runs along the corridor
        var x = clamp(o * 1.4, -HW + w / 2 + 0.3, HW - w / 2 - 0.3);
        pn.C = [x, s === 'floor' ? -HH + EPS : HH - EPS, z]; pn.U = [1, 0, 0]; pn.V = [0, 0, s === 'floor' ? -1 : 1];
      }
      pn.floor = s === 'floor'; pn.ceil = s === 'ceil';
      pn.w = w; pn.h = h; pn.N = norm(cross(pn.U, pn.V)); pn.q = quat(pn.U, pn.V, pn.N);
    }
    var asked = 0;
    function fetchNext() {
      // the pictures come in the order they are met: the first few at once, the rest when the room has arrived
      var upto = Math.min(panels.length, ready ? panels.length : cur + 6);
      while (asked < upto) {
        (function (pn) {
          var im = new Image(); im.decoding = 'async';
          im.onload = function () { if (dead) return; var c = colours(im); pn.a = im.naturalWidth / im.naturalHeight || 1; place(pn); pn.tex = texture(im, false, lowMem ? 512 : 1024); pn.color = c.css; pn.glow = c.glow; pn.ready = true; if (pn.it.i === cur) paintNow(true); kick(); };
          im.onerror = function () { pn.failed = true; };
          im.src = pn.it.image;
        })(panels[asked]);
        asked++;
      }
    }
    // the poster itself, for a set that is pointed at or opened: two at most are kept, the older one gives its room back
    function wantBig(pn) {
      if (!pn || !pn.ready || pn.big || pn.bigAsked || !pn.it.full) return;
      pn.bigAsked = true;
      var im = new Image(); im.decoding = 'async';
      im.onload = function () {
        if (dead) return;
        pn.big = texture(im, false, lowMem ? 1024 : 2048); bigs.push(pn); bigV++;
        for (var j = 0; bigs.length > 2 && j < bigs.length;) {
          var o = bigs[j];
          if (o !== pn && o !== panels[oi]) { gl.deleteTexture(o.big); o.big = null; o.bigAsked = false; bigs.splice(j, 1); } else j++;
        }
        kick();
      };
      im.onerror = function () { pn.bigAsked = false; };
      im.src = pn.it.full;
    }
    (function () {
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { if (dead) return; markTex = texture(im, true, 512); markA = im.naturalWidth / im.naturalHeight || 1; kick(); };
      im.src = (root.getAttribute('data-assets') || 'assets/') + 'brush/mark-320.webp';
    })();
    // the door in the wall behind the start, the way the visitor came in (and the way out: pressed, it leaves the room): its frame
    // standing on the floor, and EXIT over it in the brush, painted once on a sheet
    var doorTex = null;
    (function () {
      function paint() {
        if (dead || doorTex) return;
        var c = document.createElement('canvas'); c.width = 512; c.height = 1024; var g = c.getContext('2d');
        g.strokeStyle = g.fillStyle = '#fff'; g.lineJoin = 'miter';
        g.lineWidth = 10; g.beginPath(); g.moveTo(70, 1024); g.lineTo(70, 214); g.lineTo(442, 214); g.lineTo(442, 1024); g.stroke();
        g.lineWidth = 3; g.beginPath(); g.moveTo(98, 1024); g.lineTo(98, 242); g.lineTo(414, 242); g.lineTo(414, 1024); g.stroke();
        g.font = '132px "TM Brush", "League Gothic", "Arial Narrow", sans-serif'; g.textAlign = 'center'; g.fillText('EXIT', 256, 168);
        doorTex = texture(c, true, 1024); kick();
      }
      if (document.fonts && document.fonts.load) document.fonts.load('132px "TM Brush"').then(paint, paint); else paint();
      setTimeout(paint, 2500);
    })();

    /* the state of the walk */
    var dead = false, raf = 0, last = 0, t0 = 0, vw = 1, vh = 1, aspect = 1, dpr = 1, rs = 1, rsMax = Infinity, cw = 0, ch = 0, fw = 0, fh = 0, slow = 0;
    var camZ = Z_START, tz = Z_START, mx = 0, my = 0, tmx = 0, tmy = 0, px = -1, py = -1, pointing = false, speed = 0, fovNow = 1.2, air = 0;
    var dragY = 0, dragP = 0, yawT = 0, pitchT = 0, dragId = -1, dragX0 = 0, dragY0 = 0, dragFrom = 0, pitchFrom = 0, dragging = false, dragged = false, dragMouse = false, doorLit = false, turning = false;
    // a finger on the room: it looks (sideways) or walks (up and down), whichever way it set off; a walk let go of glides on (vel)
    var gesture = '', lastY = 0, trail = [], vel = 0;
    var eye = [0, 0, Z_START], R = { r: [1, 0, 0], u: [0, 1, 0], b: [0, 0, 1] }, PV = new Float32Array(16), LP = new Float32Array(NL * 3), LN = new Float32Array(NL * 3), LC = new Float32Array(NL * 4);
    var cur = 0, shownCur = -1, atEnd = false, hover = -1, tipW = 0, state = 'walk', oi = -1, ot = 0, after = null, pending = -1, lastFocus = null;
    var light = false, lt = 0, sig = '', lastSig = '', walked = false, ready = false;
    try { light = localStorage.getItem('tm:room') === 'light'; } catch (e) { /* no storage: dark */ }
    lt = light ? 1 : 0; el.classList.toggle('is-light', light); modeBtn.setAttribute('aria-pressed', String(light)); modeBtn.setAttribute('aria-label', light ? 'Dark room' : 'Light room');

    // the canvas has all the screen's points; the picture of the room is drawn K larger than that (up to what the device can carry,
    // less if it turns out slow), so that after the bending its middle has one point of the picture for one point of the screen
    function size() {
      vw = stage.clientWidth || window.innerWidth; vh = stage.clientHeight || window.innerHeight; aspect = vw / vh;
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      rs = Math.max(0.75, Math.min(dpr, rsMax, Math.sqrt((coarse ? 5.2e6 : 8.6e6) / (vw * vh * SS * SS))));
      var w = Math.round(vw * dpr), h = Math.round(vh * dpr), fw2 = Math.min(maxTex, Math.round(vw * rs * SS)), fh2 = Math.min(maxTex, Math.round(vh * rs * SS));
      if (w !== cw || h !== ch) { cw = cv.width = w; ch = cv.height = h; }
      if (fw2 !== fw || fh2 !== fh) {
        fw = fw2; fh = fh2;
        gl.bindTexture(gl.TEXTURE_2D, fbo.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.depth); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, fw, fh);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbo.tex, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, fbo.depth); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      sig = '';
    }

    /* walking, as a person in the room walks: the wheel, a finger up and down, the arrow keys up and down. On is always toward
       where the visitor faces (turned round to the door, on is toward the door), back is a step back without turning. The page itself
       does not scroll: the walk goes from the door behind the start to a little before the wall at the end */
    var Z_NEAR = Z_BACK - 2.5, Z_FAR = Z_WALL + 3;
    function along() { return Math.cos(dragY) >= 0 ? 1 : -1; }      // 1: facing on into the room, -1: facing the door
    function perPx() { return GAP / (vh * (vw < 760 ? 0.72 : 0.85)); }      // a little less than a screen's swipe from one set to the next
    function walk(u) { if (!u || state !== 'walk') return; var z = clamp(tz - along() * u, Z_FAR, Z_NEAR); if (z === tz) vel = 0; tz = z; kick(); }
    function fovBase() { return (aspect >= 1.2 ? 80 : mix(100, 80, clamp((aspect - 0.45) / 0.75, 0, 1))) * Math.PI / 180; }

    // the camera: where it stands, where it looks, and the picture of the room it takes. It turns only when the visitor turns it:
    // the far end of the corridor goes a little toward the pointer (the camera turns the other way), as in the walk this room is
    // made after, and a drag turns the head all the way round (dragY, dragP). Nothing turns it by itself
    function camera(introZ, fovExtra) {
      var yaw = mx * 0.075 - dragY, pitch = clamp(-my * 0.05 + dragP, -1.2, 1.2), roll = -mx * 0.012;
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
      // R = turn about y, then about x, then about z; its columns are the camera's right, up and back
      var ry = [[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], rx = [[1, 0, 0], [0, cp, -sp], [0, sp, cp]], rz = [[cr, -sr, 0], [sr, cr, 0], [0, 0, 1]];
      function mm(a, b) { var o = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) o[i][j] = a[i][0] * b[0][j] + a[i][1] * b[1][j] + a[i][2] * b[2][j]; return o; }
      var m = mm(mm(ry, rx), rz);
      R = { r: [m[0][0], m[1][0], m[2][0]], u: [m[0][1], m[1][1], m[2][1]], b: [m[0][2], m[1][2], m[2][2]] };
      eye = [mx * 0.32, my * 0.16 - 0.1, camZ + introZ];
      fovNow = fovBase() + fovExtra + Math.min(0.07, Math.abs(speed) * 0.004);
      var f = 1 / Math.tan(fovNow / 2), n = 0.05, fa = 220, nf = 1 / (n - fa), pr = [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (fa + n) * nf, -1, 0, 0, 2 * fa * n * nf, 0];
      var r = R.r, u = R.u, b = R.b, v = [r[0], u[0], b[0], 0, r[1], u[1], b[1], 0, r[2], u[2], b[2], 0, -dot(r, eye), -dot(u, eye), -dot(b, eye), 1];
      for (var c = 0; c < 4; c++) for (var w = 0; w < 4; w++) PV[c * 4 + w] = pr[w] * v[c * 4] + pr[4 + w] * v[c * 4 + 1] + pr[8 + w] * v[c * 4 + 2] + pr[12 + w] * v[c * 4 + 3];
    }
    // a point of the screen (as the visitor sees it, bent) to a ray into the room
    function ray(x, y) {
      var p = [x / vw * 2 - 1, -(y / vh * 2 - 1)], l = Math.sqrt(aspect * aspect + 1), q0 = p[0] * aspect / l, q1 = p[1] / l, k = (1 + K * (q0 * q0 + q1 * q1)) / (1 + K);
      var ty = Math.tan(fovNow / 2), d = norm([p[0] * k * ty * aspect, p[1] * k * ty, -1]);
      return norm(add(add(scl(R.r, d[0]), scl(R.u, d[1])), scl(R.b, d[2])));
    }
    function pick(x, y) {
      var d = ray(x, y), best = -1, bt = 1e9;
      panels.forEach(function (pn, i) {
        if (!pn.ready || (state !== 'walk' && i !== oi)) return;
        var g = geo(pn, i), den = dot(d, g.N); if (Math.abs(den) < 1e-6) return;
        var t = dot(sub(g.C, eye), g.N) / den; if (t <= 0.05 || t >= bt || t > 40) return;
        var hit = sub(add(eye, scl(d, t)), g.C), a = dot(hit, g.U) / g.w, b = dot(hit, g.V) / g.h;
        if (Math.abs(a) <= 0.5 && Math.abs(b) <= 0.5) { best = i; bt = t; }
      });
      return best;
    }
    // where the open set stands: in front of the camera, at the left (above, on a narrow screen), as large as the screen allows
    function front(pn) {
      var narrow = vw < 760 || aspect < 0.9, d = 3, ty = Math.tan(fovNow / 2);
      var cx = narrow ? 0 : -0.36, cy = narrow ? 0.4 : 0.0, hf = narrow ? 0.5 : 0.69, wf = narrow ? 0.88 : 0.47;
      // the screen is bent at its edges: undo that for the place and the size, near enough
      var l = Math.sqrt(aspect * aspect + 1), q0 = cx * aspect / l, q1 = cy / l, k = (1 + K * (q0 * q0 + q1 * q1)) / (1 + K);
      var vH = 2 * d * ty, vW = vH * aspect, h = vH * hf * k, w = h * pn.a;
      if (w > vW * wf * k) { w = vW * wf * k; h = w / pn.a; }
      var c = [cx * k * d * ty * aspect, cy * k * d * ty, -d];
      return { C: add(eye, add(add(scl(R.r, c[0]), scl(R.u, c[1])), scl(R.b, c[2]))), q: quat(R.r, R.u, R.b), w: w, h: h };
    }
    // a set's place now: in the corridor, or on its way to the front and back
    function geo(pn, i) {
      if (i !== oi || ot <= 0) return { C: pn.C, U: pn.U, V: pn.V, N: pn.N, w: pn.w, h: pn.h };
      var f = front(pn), e = inOut(clamp(ot, 0, 1)), q = slerp(pn.q, f.q, e), ax = axes(q);
      // it leaves its surface first, toward the middle of the corridor, and comes to the front in an arc
      var C = add(lerp3(pn.C, f.C, e), scl(pn.N, Math.sin(Math.PI * e) * 0.9));
      return { C: C, U: ax.r, V: ax.u, N: norm(cross(ax.r, ax.u)), w: mix(pn.w, f.w, e), h: mix(pn.h, f.h, e) };
    }
    // the lights of the room this frame: the nearest sets, each in its own colour, and the logo's yellow near the end
    function lights(panelsA, dim) {
      var near = [], n = 0;
      LP.fill(0); LN.fill(0); LC.fill(0);
      function set(p, nn, col, s, r) { if (n >= NL || s <= 0) return; LP.set(p, n * 3); LN.set(nn, n * 3); LC.set([col[0] * s, col[1] * s, col[2] * s, r], n * 4); n++; }
      if (markTex && Math.abs(Z_WALL - eye[2]) < 42) set([0, 0.1, Z_WALL + 0.8], [0, 0, 1], [1, 0.93, 0.12], 0.8 * panelsA, 5.2);
      if (doorTex && Math.abs(Z_BACK - eye[2]) < 42) set([0, -0.6, Z_BACK - 0.8], [0, 0, -1], [1, 0.93, 0.12], (doorLit ? 0.85 : 0.5) * panelsA, 4.4);
      panels.forEach(function (pn, i) { if (pn.ready) { var dz = Math.abs(pn.C[2] - eye[2]); if (dz < 40) near.push({ pn: pn, i: i, dz: dz }); } });
      near.sort(function (a, b) { return a.dz - b.dz; });
      near.forEach(function (o) { var pn = o.pn; set(add(pn.C, scl(pn.N, 0.3)), pn.N, pn.glow, 0.92 * pn.fade * panelsA * (o.i === oi ? 1 - dim : 1), 0.62 * (pn.w + pn.h)); });
    }

    /* drawing */
    function draw(show, panelsA, dim, reach) {
      var c = colors(), bg = c.bg, fog = c.fog * reach, l = Math.sqrt(aspect * aspect + 1);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fb); gl.viewport(0, 0, fw, fh);
      gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true); gl.disable(gl.BLEND);

      // the surfaces: first the floor
      gl.useProgram(G.p);
      gl.uniformMatrix4fv(G.u.uPV, false, PV); gl.uniform3fv(G.u.uLP, LP); gl.uniform3fv(G.u.uLN, LN); gl.uniform4fv(G.u.uLC, LC);
      gl.uniform3fv(G.u.uCam, eye); gl.uniform3fv(G.u.uInk, c.ink); gl.uniform3fv(G.u.uBg, bg); gl.uniform3fv(G.u.uDimTo, c.dimTo);
      gl.uniform1f(G.u.uFog, fog); gl.uniform1f(G.u.uShow, show); gl.uniform1f(G.u.uDim, dim); gl.uniform1f(G.u.uPx, Math.max(1, rs));
      gl.uniform1f(G.u.uK, K); gl.uniform1f(G.u.uMode, c.mode); gl.uniform2f(G.u.uRes, fw, fh); gl.uniform2f(G.u.uAsp, aspect / l, 1 / l);
      function corridor(from, count) {
        gl.useProgram(G.p);
        gl.bindBuffer(gl.ARRAY_BUFFER, C.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, C.ib);
        gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 32, 12); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 32, 20);
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, from * 2);
        gl.disableVertexAttribArray(1); gl.disableVertexAttribArray(2);
      }
      corridor(0, C.floor);

      // the pictures' program, for their reflections first
      gl.useProgram(P.p); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, card); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
      gl.uniformMatrix4fv(P.u.uPV, false, PV); gl.uniform3fv(P.u.uCam, eye); gl.uniform3fv(P.u.uBg, bg); gl.uniform3fv(P.u.uDimTo, c.dimTo); gl.uniform1f(P.u.uFog, fog); gl.uniform1f(P.u.uFloorY, -HH);
      gl.activeTexture(gl.TEXTURE0); gl.uniform1i(P.u.uTex, 0);
      function one(g, tex, a, dm, ink, tint, mirror, refl) {
        gl.uniform3fv(P.u.uC, g.C); gl.uniform3fv(P.u.uU, scl(g.U, g.w)); gl.uniform3fv(P.u.uV, scl(g.V, g.h));
        gl.uniform1f(P.u.uA, a); gl.uniform1f(P.u.uDim, dm); gl.uniform1f(P.u.uInk, ink); gl.uniform3fv(P.u.uTint, tint || [1, 1, 1]);
        gl.uniform1f(P.u.uMirror, mirror ? 1 : 0); gl.uniform1f(P.u.uRefl, refl || 0);
        gl.bindTexture(gl.TEXTURE_2D, tex); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      // the yellow light round the pictures (drawn before them, without the depth: it lies on their own surfaces, which nothing in the
      // corridor hides); afterwards the pictures' program is the one in use again
      var haloA = mix(HALO_A[0], HALO_A[1], c.mode);
      function halos(list, mirror, refl) {
        if (!list.length) return;
        gl.useProgram(H.p); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
        gl.bindBuffer(gl.ARRAY_BUFFER, card); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
        gl.uniformMatrix4fv(H.u.uPV, false, PV); gl.uniform3fv(H.u.uCam, eye); gl.uniform1f(H.u.uFog, fog); gl.uniform1f(H.u.uFloorY, -HH);
        gl.uniform3fv(H.u.uCol, YELLOW); gl.uniform1f(H.u.uMode, c.mode); gl.uniform2f(H.u.uBox, HW + 0.002, HH + 0.002);
        gl.uniform1f(H.u.uMirror, mirror ? 1 : 0); gl.uniform1f(H.u.uRefl, refl || 0);
        list.forEach(function (o) { var g = o.g; gl.uniform3fv(H.u.uC, g.C); gl.uniform3fv(H.u.uU, g.U); gl.uniform3fv(H.u.uV, g.V); gl.uniform2f(H.u.uHalf, g.w / 2, g.h / 2); gl.uniform1f(H.u.uM, o.m || HALO_M); gl.uniform1f(H.u.uA, o.a); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); });
        gl.useProgram(P.p); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }
      // (the room can be looked at all the way round: the sets behind the camera are drawn as well)
      function visible(pn, i) { return pn.ready && !(i === oi && ot > 0) && Math.abs(pn.C[2] - eye[2]) < 75; }
      var mark = markTex ? { C: [0, 0.1, Z_WALL + EPS], U: [1, 0, 0], V: [0, 1, 0], w: 3.2 * markA, h: 3.2 } : null, doorInk = lerp3(YELLOW, [0.13, 0.13, 0.12], c.mode);
      // the polished floor holds the sets on the walls and the ceiling, and the logo. A reflection lies beyond the floor, so it is
      // drawn over the floor alone (nothing else stands where it can be seen)
      gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
      var shine = 0.26 * (1 - 0.55 * c.mode);
      halos(panels.filter(function (pn, i) { return visible(pn, i) && !pn.floor && !pn.ceil; }).map(function (pn) { return { g: pn, a: haloA * pn.fade * panelsA * (1 - 0.75 * dim) }; }), true, shine);
      panels.forEach(function (pn, i) { if (visible(pn, i) && !pn.floor) one(pn, pn.big || pn.tex, pn.fade * panelsA, dim, 0, null, true, pn.ceil ? shine * 0.5 : shine); });
      if (mark) one(mark, markTex, panelsA, dim, 1, YELLOW, true, shine);
      if (doorTex) one(DOOR, doorTex, panelsA, dim, 1, doorInk, true, shine);
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND);

      // the rest of the corridor
      corridor(C.floor, C.all - C.floor);

      // the sets in their places, each in its yellow light, and the logo on the wall at the end, in the paint's yellow
      halos(panels.filter(visible).map(function (pn) { return { g: pn, a: haloA * pn.fade * panelsA * (1 - 0.75 * dim) }; }), false);
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
      gl.useProgram(P.p); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, card); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
      panels.forEach(function (pn, i) { if (visible(pn, i)) one(pn, pn.big || pn.tex, pn.fade * panelsA, dim, 0); });
      if (mark) one(mark, markTex, panelsA, dim, 1, YELLOW);
      if (doorTex) one(DOOR, doorTex, panelsA * (doorLit ? 1 : 0.85), dim, 1, doorInk);

      // the dust: in front of the walls, behind the sets, never hiding anything
      gl.useProgram(U.p); gl.depthMask(false); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, dust); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
      gl.uniformMatrix4fv(U.u.uPV, false, PV); gl.uniform3fv(U.u.uCam, eye); gl.uniform1f(U.u.uT, air); gl.uniform1f(U.u.uLen, AIR); gl.uniform1f(U.u.uPx, Math.max(1, rs));
      gl.uniform1f(U.u.uFog, fog * 0.8); gl.uniform1f(U.u.uA, show * (1 - 0.6 * c.mode) * (1 - 0.75 * dim)); gl.uniform1f(U.u.uMode, c.mode);
      gl.uniform3fv(U.u.uLP, LP); gl.uniform3fv(U.u.uLN, LN); gl.uniform4fv(U.u.uLC, LC);
      gl.drawArrays(gl.POINTS, 0, DUST);
      gl.depthMask(true);

      // the open set, in front of everything
      if (oi >= 0 && ot > 0) { gl.useProgram(P.p); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.bindBuffer(gl.ARRAY_BUFFER, card); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0); gl.disable(gl.DEPTH_TEST); var og = geo(panels[oi], oi), oe = inOut(clamp(ot, 0, 1)); halos([{ g: og, a: haloA * panels[oi].fade * mix(1, 0.7, oe), m: HALO_M * mix(1, 0.4, oe) }], false); gl.bindBuffer(gl.ARRAY_BUFFER, card); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0); one(og, panels[oi].big || panels[oi].tex, panels[oi].fade, 0, 0); }

      // the whole picture onto the screen, bent at its edges
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cw, ch); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
      gl.useProgram(Q.p); gl.bindBuffer(gl.ARRAY_BUFFER, tri); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, fbo.tex); gl.uniform1i(Q.u.uScene, 0);
      gl.uniform2f(Q.u.uAsp, aspect / l, 1 / l); gl.uniform1f(Q.u.uK, K); gl.uniform1f(Q.u.uVig, c.vig); gl.uniform3fv(Q.u.uBg, bg);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function colors() { var e = smooth(0, 1, lt); return { bg: lerp3(DARK.bg, LIGHT.bg, e), ink: lerp3(DARK.ink, LIGHT.ink, e), dimTo: lerp3(DARK.dimTo, LIGHT.dimTo, e), fog: mix(DARK.fog, LIGHT.fog, e), vig: mix(DARK.vig, LIGHT.vig, e), mode: e }; }

    /* the words on the screen */
    function paintNow(force) {
      if (cur === shownCur && !force) return;
      var it = ITEMS[cur], pn = panels[cur]; shownCur = cur;
      noEl.textContent = pad(cur + 1); titleEl.textContent = it.title; tagEl.innerHTML = '<i></i>' + tag(it);
      $('i', tagEl).style.background = pn.color || '';
      if (!force) { now.classList.remove('is-in'); void now.offsetWidth; now.classList.add('is-in'); }
      ticks.forEach(function (t, i) { t.classList.toggle('is-on', i === cur); if (i === cur) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
    }
    function fill(i) {
      var it = ITEMS[i], pn = panels[i], nx = ITEMS[(i + 1) % N];
      $('.rm__kind span', info).innerHTML = tag(it); $('.rm__kind i', info).style.background = pn.color || '';
      $('.rm__h', info).textContent = it.title; $('.rm__sub', info).textContent = it.sub; $('.rm__say', info).textContent = it.say;
      $('.rm__rows', info).innerHTML = it.rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
      $('.rm__links', info).innerHTML = (it.link ? aTo(null, it.link, 'rm__go', esc(it.linkLabel) + I_ARROW) : '') + (it.ig ? aTo(null, it.ig, 'rm__go rm__go--line', 'On Instagram' + I_ARROW) : '');
      // a link to a page of the site is answered by the site's own router (app.js reads data-route); its address as the site writes it
      $$('a[data-route]', info).forEach(function (a) { var r = a.getAttribute('data-route'); a.setAttribute('href', root.getAttribute('data-router') === 'hash' || location.protocol === 'file:' ? hashOf(r) : r); });
      var nb = $('.rm__next button', info); nb.textContent = nx.title; nb.setAttribute('data-i', String(nx.i)); nb.setAttribute('aria-label', 'Next photo: ' + nx.title);
      $('.rm__next', info).hidden = N < 2;
    }
    function hashOf(p) { var s = p.split('/').filter(Boolean); return !s.length ? '#home' : '#' + (s.length > 1 ? s[0].replace(/e?s$/, '') + '-' + s[1] : s[0]); }

    /* opening and closing a set */
    function lock(on) { root.classList.toggle('room-held', on); }
    function open(i) {
      if (state !== 'walk' || !panels[i] || !panels[i].ready) return;
      state = 'opening'; oi = i; ot = 0; vel = 0; lastFocus = document.activeElement; lock(true); wantBig(panels[i]);
      fill(i); dlg.hidden = false; void dlg.offsetWidth; el.classList.add('is-open'); tip.classList.remove('is-on'); hover = -1;
      setTimeout(function () { if (state === 'opening' || state === 'open') $('.rm__x', dlg).focus({ preventScroll: true }); }, 60);
      kick();
    }
    function close(then) {
      if (state !== 'open' && state !== 'opening') return;
      state = 'closing'; after = then || null; el.classList.remove('is-open'); kick();
    }
    function closed() {
      state = 'walk'; oi = -1; ot = 0; dlg.hidden = true; lock(false);
      if (lastFocus && lastFocus.focus && document.contains(lastFocus) && lastFocus !== document.body) lastFocus.focus({ preventScroll: true });
      var f = after; after = null; if (f) f();
    }
    // after a jump the visitor faces on into the room, level (turning the shorter way round)
    function faceOn() {
      var d = -yawT; d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
      if (Math.abs(d) < 0.0001 && Math.abs(pitchT) < 0.0001) return;
      yawT += d; pitchT = 0; turning = true; kick();
    }
    // to a set: the camera goes to where it is named, and faces it; with open, it opens when the camera is there
    function goTo(i, andOpen) {
      i = clamp(i, 0, N - 1);
      if (state !== 'walk') { close(function () { goTo(i, andOpen); }); return; }
      faceOn(); vel = 0; tz = station(i); pending = andOpen ? i : -1; kick();
    }
    function index(on) {
      ixEl.hidden = !on; ixBtn.setAttribute('aria-expanded', String(on)); el.classList.toggle('is-index', on); lock(on || state !== 'walk');
      if (on) { var b = $('button[data-i="' + cur + '"]', ixEl) || $('button', ixEl); if (b) b.focus({ preventScroll: true }); } else ixBtn.focus({ preventScroll: true });
    }
    function setLight(on) {
      light = on; el.classList.toggle('is-light', on); modeBtn.setAttribute('aria-pressed', String(on)); modeBtn.setAttribute('aria-label', on ? 'Dark room' : 'Light room');
      try { localStorage.setItem('tm:room', on ? 'light' : 'dark'); } catch (e) { /* not kept */ }
      kick();
    }

    /* each frame: the camera follows the walk and the pointer, the head turns, the open set travels, and the picture is drawn when
       anything moved; when nothing moves, no frames run */
    function frame(t) {
      raf = 0;
      if (dead) return;
      if (!el.isConnected) { destroy(); return; }
      if (!t0) t0 = t;
      var dt = Math.min(0.1, last ? (t - last) / 1000 : 0.016); last = t;      // (a slow screen keeps time, up to ten frames a second)
      // the way in: the lines come out of the dark and the light reaches down the corridor, the camera arrives, then the sets show,
      // then the words
      var ti = clamp((t - t0) / 1400, 0, 1), introZ = 5 * (1 - outCubic(ti)), fovExtra = 0.22 * (1 - outCubic(clamp(ti * 1.6, 0, 1)));
      var show = smooth(0, 0.2, ti), reach = 0.07 + 0.93 * outCubic(clamp(ti / 0.5, 0, 1)), panelsA = smooth(0.3, 0.62, ti);
      if (!ready && ti > 0.55) { ready = true; el.classList.add('is-ready'); }
      // a walk let go of glides on and slows, as a step does
      if (vel && state === 'walk') { walk(vel * dt); vel *= Math.pow(0.95, dt * 60); if (Math.abs(vel) < 0.05) vel = 0; }
      var before = camZ; camZ += (tz - camZ) * (1 - Math.pow(0.9, dt * 60)); if (Math.abs(tz - camZ) < 0.0004) camZ = tz;
      speed = (camZ - before) / Math.max(dt, 0.001); air += Math.abs(camZ - before) * 0.3;
      var km = 1 - Math.pow(0.94, dt * 60); mx += (tmx - mx) * km; my += (tmy - my) * km;
      // a turn (after a jump, or asked for with the arrow keys) is made smoothly; a drag turns the head at once, and where it is left it stays
      if (!dragging) {
        var kt = 1 - Math.pow(turning ? 0.93 : 0.86, dt * 60); dragY += (yawT - dragY) * kt; dragP += (pitchT - dragP) * kt;
        if (Math.abs(yawT - dragY) < 0.0005) { dragY = yawT; turning = false; } if (Math.abs(pitchT - dragP) < 0.0005) dragP = pitchT;
      }
      lt += ((light ? 1 : 0) - lt) * (1 - Math.pow(0.88, dt * 60)); if (Math.abs((light ? 1 : 0) - lt) < 0.002) lt = light ? 1 : 0;
      panels.forEach(function (pn) { if (pn.ready && pn.fade < 1) pn.fade = Math.min(1, pn.fade + dt * 2.5); });
      if (state === 'opening') { ot = Math.min(1, ot + dt / 0.85); if (ot >= 1) state = 'open'; }
      if (state === 'closing') { ot = Math.max(0, ot - dt / 0.65); if (ot <= 0) closed(); }
      var dim = inOut(clamp(ot, 0, 1));

      // which set is named: the one the visitor is coming up to, the way they face (its place is a little before it); past the last
      // one, walking on, the end
      var on = along() > 0, best = 0, bd = 1e9; for (var i = 0; i < N; i++) { var dd = Math.abs(camZ - (on ? station(i) : zOf(i) - AHEAD)); if (dd < bd) { bd = dd; best = i; } }
      if (state === 'walk' || state === 'closing') cur = best;
      camera(introZ, fovExtra);
      var end = on && camZ < Z_LAST - 2.2; if (end !== atEnd) { atEnd = end; el.classList.toggle('is-end', end); }
      if (ready) paintNow(false);
      fetchNext();
      if (!walked && Math.abs(camZ - Z_START) > 1.2) { walked = true; el.classList.add('is-walked'); }
      if (pending >= 0 && Math.abs(camZ - tz) < 0.25) { var p = pending; pending = -1; open(p); }

      // the pointer: what is under it, and the word that goes with it
      // (-2: the door in the wall behind the start)
      if (pointing && state === 'walk' && ready && !dragging) {
        var h = pick(px, py); if (h < 0 && onDoor(px, py)) h = -2;
        if (h !== hover) {
          hover = h; doorLit = h === -2; tip.classList.toggle('is-on', h !== -1); el.classList.toggle('is-over', h !== -1);
          if (h >= 0) { tipWord.textContent = 'Open'; tipB.textContent = ITEMS[h].title; tipDot.style.background = panels[h].color || ''; wantBig(panels[h]); }
          else if (h === -2) { tipWord.textContent = 'Exit'; tipB.textContent = 'the room'; tipDot.style.background = ''; }
          tipW = tip.offsetWidth;
        }
      } else if (hover !== -1 && (state !== 'walk' || dragging)) { hover = -1; doorLit = false; tip.classList.remove('is-on'); el.classList.remove('is-over'); }
      // the word stands at the pointer's right, or at its left near the right edge
      if (pointing) { var tx = px + 18 + tipW > vw - 12 ? px - 18 - tipW : px + 18; tip.style.transform = 'translate3d(' + Math.round(tx) + 'px,' + Math.round(py - 14) + 'px,0)'; dotEl.style.transform = 'translate3d(' + Math.round(px) + 'px,' + Math.round(py) + 'px,0)'; }

      lights(panelsA, dim);
      var s = [camZ.toFixed(4), mx.toFixed(4), my.toFixed(4), dragY.toFixed(4), dragP.toFixed(4), doorLit ? 1 : 0, doorTex ? 1 : 0, ot.toFixed(4), lt.toFixed(3), show.toFixed(3), reach.toFixed(3), panelsA.toFixed(3), cw, ch, fw, fh, bigV, panels.reduce(function (a, pn) { return a + pn.fade; }, 0).toFixed(3), markTex ? 1 : 0].join();
      if (s !== sig) { sig = s; draw(show, panelsA, dim, reach); }
      // keep going while anything still moves; otherwise wait for the next scroll, pointer, finger or picture
      var still = s === lastSig && ti >= 1 && state !== 'opening' && state !== 'closing' && pending < 0; lastSig = s;
      // a device that cannot keep up draws the room with fewer points (never fewer than the page has)
      if (!still && ti >= 1 && document.visibilityState === 'visible') {
        if (dt > 0.034) slow++; else if (slow > 0) slow -= 0.5;
        if (slow > 18 && rs > 1.001) { slow = 0; rsMax = Math.max(1, rs * 0.82); size(); }
      }
      if (!still) kick();
    }
    function kick() { if (!raf && !dead) raf = requestAnimationFrame(frame); }

    /* what the visitor does */
    // the pointer anywhere turns the camera; over the room itself (not over a button) it is the dot, and says "Open" over a set
    function onPointer(e) {
      if (e.pointerType === 'touch') return;
      px = e.clientX; py = e.clientY; tmx = clamp(px / vw * 2 - 1, -1, 1); tmy = clamp(-(py / vh * 2 - 1), -1, 1);
      var over = e.target === cv;
      if (over !== pointing) { pointing = over; el.classList.toggle('is-pointing', over); if (!over) onLeave(); }
      kick();
    }
    function onLeave() { pointing = false; doorLit = false; el.classList.remove('is-pointing', 'is-over'); tip.classList.remove('is-on'); hover = -1; kick(); }
    // on the room a finger looks or walks, whichever way it sets off: sideways it turns the head all the way round, up it walks on
    // and down it steps back (and let go, the walk glides on a little). The mouse held down turns the head, and tilts it up and down
    // as well; its wheel walks. Let go, the head stays the way it was turned: the room moves only by hand (the owner's wish,
    // 2026-11-25), and can be looked at, and walked, behind as much as ahead
    function onDown(e) {
      if (state !== 'walk' || (e.pointerType === 'mouse' && e.button !== 0)) return;
      dragId = e.pointerId; dragX0 = e.clientX; dragY0 = e.clientY; dragFrom = dragY; pitchFrom = dragP; dragging = false; dragged = false; dragMouse = e.pointerType !== 'touch';
      gesture = ''; lastY = e.clientY; trail = [[e.timeStamp, e.clientY]]; vel = 0;
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* the gesture still works over the room */ }
    }
    function onDrag(e) {
      if (e.pointerId !== dragId) return;
      var dx = e.clientX - dragX0, dy = e.clientY - dragY0;
      if (!gesture) {
        if (dragMouse ? Math.abs(dx) + Math.abs(dy) > 6 : Math.abs(dx) > 9 || Math.abs(dy) > 9) gesture = dragMouse || Math.abs(dx) > Math.abs(dy) ? 'look' : 'walk';
        if (!gesture) return;
        dragged = true; lastY = e.clientY;
        if (gesture === 'look') { dragging = true; el.classList.add('is-dragging'); }
      }
      if (gesture === 'walk') {
        walk((lastY - e.clientY) * perPx()); lastY = e.clientY;
        trail.push([e.timeStamp, e.clientY]); while (trail.length > 2 && e.timeStamp - trail[0][0] > 90) trail.shift();
        return;
      }
      dragY = yawT = dragFrom - dx / vw * Math.PI * (dragMouse ? 1 : 1.3);
      if (dragMouse) dragP = pitchT = clamp(pitchFrom + dy / vh * 1.6, -0.75, 0.75);
      kick();
    }
    function onUp(e) {
      if (e.pointerId !== dragId) return;
      // a walk let go of while the finger still moved goes on a little by itself, as a step does
      if (gesture === 'walk' && trail.length > 1) { var a = trail[0], b = trail[trail.length - 1], ms = Math.max(16, b[0] - a[0]); if (e.timeStamp - b[0] < 80) vel = clamp((a[1] - b[1]) / ms * 1000 * perPx(), -50, 50); }
      dragId = -1; dragging = false; gesture = ''; el.classList.remove('is-dragging'); kick();
    }
    // the wheel walks (down on, up back), toward where the visitor faces; over the index or an open set it scrolls those instead
    function onWheel(e) {
      if (dead || e.ctrlKey || state !== 'walk' || !ixEl.hidden) return;
      e.preventDefault(); vel = 0;
      walk(e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1) * perPx());
    }
    // the door in the wall behind the start, under a point of the screen
    function onDoor(x, y) {
      if (!doorTex) return false;
      var d = ray(x, y), den = dot(d, DOOR.N); if (Math.abs(den) < 1e-6) return false;
      var t = dot(sub(DOOR.C, eye), DOOR.N) / den; if (t <= 0.05 || t > 40) return false;
      var hit = sub(add(eye, scl(d, t)), DOOR.C), a = dot(hit, DOOR.U) / DOOR.w, b = dot(hit, DOOR.V) / DOOR.h;
      return Math.abs(a) <= 0.37 && b >= -0.5 && b <= 0.3;
    }
    function onClick(e) {
      if (dragged) { dragged = false; return; }
      if (state !== 'walk' || !ready) return;
      if (pick(e.clientX, e.clientY) < 0 && onDoor(e.clientX, e.clientY)) { var ex = $('.rm__tools [data-room-exit]', el); if (ex) ex.click(); return; }
      var h = pick(e.clientX, e.clientY); if (h >= 0) open(h);
    }
    function onKey(e) {
      if (dead) return;
      if (e.key === 'Escape') { if (!ixEl.hidden) { e.preventDefault(); index(false); return; } if (state === 'open' || state === 'opening') { e.preventDefault(); close(); return; } }
      var tgt = e.target, typing = tgt && /INPUT|TEXTAREA|SELECT/.test(tgt.tagName);
      if (typing) return;
      if (e.key !== 'Escape' && e.key !== 'Tab') Sound.hand(e);
      if (state === 'walk' && ixEl.hidden && e.key === 'Enter' && (tgt === document.body || tgt === main())) { e.preventDefault(); open(cur); return; }
      // the arrow keys to the sides turn the head; up and down (and the page keys) walk on and step back, toward where it faces
      if (state === 'walk' && ixEl.hidden && (tgt === document.body || tgt === main() || tgt === cv)) {
        var k = e.key, step = { ArrowUp: 1.2, w: 1.2, W: 1.2, ArrowDown: -1.2, s: -1.2, S: -1.2, PageDown: GAP, PageUp: -GAP, ' ': e.shiftKey ? -GAP : GAP }[k];
        if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); yawT += k === 'ArrowLeft' ? -0.4 : 0.4; kick(); return; }
        if (step) { e.preventDefault(); vel = 0; walk(step); return; }
        if (k === 'Home') { e.preventDefault(); faceOn(); vel = 0; tz = Z_START; kick(); return; }
      }
      // the dialog keeps the focus within itself
      if (e.key === 'Tab' && (state === 'open' || state === 'opening')) {
        var f = $$('button, a[href]', dlg).filter(function (x) { return x.offsetParent !== null && !x.closest('[hidden]'); }); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    function main() { return document.getElementById('main'); }
    function onResize() { size(); kick(); }
    function onPop() { back = true; }
    function onLost(e) { e.preventDefault(); destroy(); el.classList.remove('is-live'); }
    window.addEventListener('pointermove', onPointer, { passive: true });
    cv.addEventListener('pointerleave', onLeave);
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onDrag); cv.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('click', onClick);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    window.addEventListener('popstate', onPop);
    cv.addEventListener('webglcontextlost', onLost);
    el.addEventListener('click', function (e) {
      var t = e.target;
      var tk = t.closest('.rm__tick'); if (tk) { goTo(+tk.getAttribute('data-i'), e.detail === 0); return; }      // from the keyboard: it opens too
      if (t.closest('.rm__ix')) { index(ixEl.hidden); return; }
      var ib = t.closest('.rm__index button[data-i]'); if (ib) { index(false); goTo(+ib.getAttribute('data-i'), true); return; }
      if (t.closest('.rm__index') && !t.closest('button')) { index(false); return; }
      if (t.closest('.rm__x')) { close(); return; }
      var nb = t.closest('.rm__next button'); if (nb) { var n = +nb.getAttribute('data-i'); close(function () { goTo(n, true); }); return; }
      // (a button pressed with the mouse gives the focus back, so that the keys walk again)
      if (t.closest('.rm__mode')) { setLight(!light); if (e.detail) t.closest('.rm__mode').blur(); return; }
      if (t.closest('.rm__snd')) { Sound.press(); if (e.detail) t.closest('.rm__snd').blur(); return; }
      if (t.closest('[data-room-top]')) { faceOn(); vel = 0; tz = Z_START; kick(); return; }
      if (t.closest('[data-room-exit]')) { back = true; return; }
      // a click beside the open set's story, on the dimmed room, closes it (a click on the set itself does nothing)
      if (t === dlg && pick(e.clientX, e.clientY) !== oi) { close(); return; }
    });

    function destroy() {
      if (dead) return; dead = true;
      Sound.leave();
      if (raf) cancelAnimationFrame(raf); raf = 0;
      window.removeEventListener('pointermove', onPointer); window.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); window.removeEventListener('popstate', onPop);
      root.classList.remove('room-live', 'room-held');
      var lose = gl.getExtension('WEBGL_lose_context'); if (lose && el.isConnected === false) lose.loseContext();
    }

    el._room = { update: function () { if (state === 'walk') kick(); }, measure: function () { size(); kick(); } };
    el.classList.add('is-live'); root.classList.add('room-live');
    live = { el: el, destroy: destroy };
    ['pointerdown', 'pointerup', 'touchend', 'click'].forEach(function (k) { el.addEventListener(k, Sound.hand, true); });
    Sound.enter(el);
    size(); fetchNext(); kick();
    return el._room;
  }
  var live = null, homeY = -1;
  // where the home page was when "Enter the room" was pressed: leaving the room goes back to that very place
  // (and the click on it is the visitor's hand that lets the room's music begin)
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.room__enter')) { homeY = window.scrollY; Sound.wake(); } }, true);

  // a page has been put on the screen (app.js, show): a room that is no longer on it is let go at once (the top bar comes back);
  // coming back from the room to the home page, it opens where the visitor went in (or at the room's part of it)
  function landed(r, main) {
    if (live && !live.el.isConnected) { live.destroy(); live = null; }
    var was = back; back = false;
    if (!was || r !== '/') return;
    var s = main && main.querySelector('.scene--room'); if (!s) return;
    var top = Math.round(s.getBoundingClientRect().top + window.scrollY), y = homeY >= top && homeY <= top + s.offsetHeight ? homeY : top;
    window.scrollTo(0, Math.max(0, y));
  }

  window.TM_ROOM = { html: html, mount: mount, landed: landed, items: ITEMS };
})();

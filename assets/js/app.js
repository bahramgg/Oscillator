/* Tehran Movement: the site.
   A label's site in full: a home page, the mixes and a page for each, the artists and a page for each, the events and a page for
   each, the label, contact, and a menu that shows the whole site on one screen.
   Its look is one thing: the logo's own brush (see assets/js/fx.js). The logo with the paint a dry brush has dragged out of it
   (home), one stroke across the head of a page, the same stroke standing (events) and lying across the foot of every page, one
   mark for everything the label has made, the M walked as one line (the menu), three strokes as large as the wall (the label).
   Paint only: nothing glows. Nothing else is drawn.

   How it moves is one thing too, the pass of the brush: a page is painted over and the next one painted in (Wipe), a stroke is
   painted from its start to its end when it comes onto the screen (fx.js), and a heading is uncovered the way the brush runs
   (Reveal, and the arrival rules in the stylesheet). Type never travels; with "reduce motion" set, nothing moves at all.

   The sound comes from SoundCloud: one widget of theirs, kept out of sight and driven from here. The bars under a mix are the
   shape of its sound: press them and it plays from there.
   The content is window.TM (assets/js/data.js); window.TM_EXTRA holds what the mixes' own pages add (tracklists).
   Two switches on <html>, set by the preview build: data-router="hash" (addresses like #mixes, #mix-031) and data-preview="1"
   (no SoundCloud, no form relay: the time then runs in silence so the page can still be seen working). */
(function () {
  'use strict';
  var D = window.TM || {}, L = D.label || {}, ARTISTS = D.artists || [], SERIES = D.series || [], EVENTS = D.events || [], EXTRA = window.TM_EXTRA || {}, FX = window.TM_FX;
  var root = document.documentElement, main = document.getElementById('main');
  var HASH = root.getAttribute('data-router') === 'hash' || location.protocol === 'file:';
  var PREVIEW = root.getAttribute('data-preview') === '1';
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── small tools ───────────────────────────────────────────────────── */
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  // once, at the next frame; or a little later if the browser gives no frame (a tab in the background, a slow start)
  function soon(fn) { var ran = false, run = function () { if (!ran) { ran = true; fn(); } }; requestAnimationFrame(run); setTimeout(run, 160); }
  function clock(sec) { sec = Math.max(0, Math.floor(sec)); var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return h ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s); }
  var MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  function date(iso) { var p = String(iso).split('-'); return p.length === 3 ? MON[+p[1] - 1] + '.' + p[2] + ' . ' + p[0] : String(iso); }      // the way the posters write a day (its spaces do not break: a day stays on one line)
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function thumb(src) { return String(src).replace(/\/([^\/]+)\.(jpe?g|png)$/i, '/t/$1.webp'); }
  function hash(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  var I_PLAY = '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v16l14-8z"/></svg>', I_PAUSE = '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';

  /* ─── the content ───────────────────────────────────────────────────── */
  var TOTAL = SERIES.reduce(function (s, t) { return s + (t.duration || 0); }, 0);
  function mixById(id) { for (var i = 0; i < SERIES.length; i++) if (SERIES[i].id === id) return SERIES[i]; return null; }
  function mixNo(t) { return /^osc-\d+$/.test(t.id) ? t.id.slice(4) : ''; }
  function mixByNo(no) { return mixById('osc-' + no); }
  function artistBySlug(slug) { for (var i = 0; i < ARTISTS.length; i++) if (ARTISTS[i].slug === slug) return ARTISTS[i]; return null; }
  function mixWho(t) { var a = artistBySlug(t.artist); return a ? a.name : (t.artist || t.title || ''); }
  function mixLabel(t) { return (mixNo(t) ? mixNo(t) + ' ' : '') + mixWho(t); }
  function mixesOf(a) { return SERIES.filter(function (t) { return t.artist === a.slug; }); }
  function plain(s) { return String(s).toLowerCase().replace(/\s*\(.*?\)/g, '').trim(); }
  function eventsOf(a) { return EVENTS.filter(function (e) { return (e.lineup || []).some(function (n) { return plain(n) === plain(a.name); }); }); }
  function artistByName(n) { for (var i = 0; i < ARTISTS.length; i++) if (plain(ARTISTS[i].name) === plain(n)) return ARTISTS[i]; return null; }
  function eventByDate(d) { for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].date === d) return EVENTS[i]; return null; }
  // the artists in the order of their mixes, the newest first
  var PEOPLE = ARTISTS.slice().sort(function (a, b) { var x = mixesOf(a)[0], y = mixesOf(b)[0]; return (y ? +mixNo(y) : -1) - (x ? +mixNo(x) : -1); });
  var LINKS = { instagram: 'Instagram', soundcloud: 'SoundCloud', residentadvisor: 'Resident Advisor', bandcamp: 'Bandcamp', beatport: 'Beatport', spotify: 'Spotify', youtube: 'YouTube' };
  function years(list) { var m = {}, out = []; list.forEach(function (x) { var y = String(x.date).slice(0, 4); if (!m[y]) { m[y] = { y: y, n: 0 }; out.push(m[y]); } m[y].n++; }); return out.sort(function (a, b) { return b.y - a.y; }); }
  // the picture of a mix: its artist's poster where there is one (the same picture, larger), its cover otherwise
  function bigArt(t) { var a = artistBySlug(t.artist); return a ? a.poster : t.cover; }

  /* ─── where a page lives ────────────────────────────────────────────── */
  var MOVED = { sound: 'mixes', people: 'artists', nights: 'events', write: 'contact', about: 'label' };      // earlier addresses
  // '/mixes/031' as an address, or as '#mix-031' where the page has no addresses of its own
  function href(p) {
    if (!HASH) return p;
    var s = p.split('/').filter(Boolean);
    if (!s.length) return '#home';
    return '#' + (s.length > 1 ? s[0].replace(/e?s$/, '') + '-' + s[1] : s[0]);
  }
  function where() {
    var s;
    // (#hero-1, -2, -3 were the three first screens shown to choose from: they lead home)
    if (HASH) { var h = location.hash.replace(/^#\/?/, ''), m = /^(mix|artist|event)-(.+)$/.exec(h); if (/^hero-[123]$/.test(h)) h = ''; s = m ? [{ mix: 'mixes', artist: 'artists', event: 'events' }[m[1]], m[2]] : (h && h !== 'home' ? [h] : []); }
    else s = location.pathname.split('/').filter(Boolean);
    if (s[0] && MOVED[s[0]]) s[0] = MOVED[s[0]];
    return '/' + s.slice(0, 2).join('/');
  }
  function link(p, cls, inner, more) { return '<a class="' + cls + '" href="' + href(p) + '" data-link data-route="' + p + '"' + (more || '') + '>' + inner + '</a>'; }

  /* ─── the pieces of a page ──────────────────────────────────────────── */
  function fx(name, cls, more) { return '<canvas class="fx ' + (cls || '') + '" data-fx="' + name + '"' + (more || '') + ' aria-hidden="true"></canvas>'; }
  function playBtn(t, cls) { return '<button class="pl ' + (cls || '') + '" type="button" data-play="' + esc(t.id) + '" aria-label="Play ' + esc(mixLabel(t)) + '">' + I_PLAY + I_PAUSE + '</button>'; }
  function bars(t, cls) { return '<canvas class="bars ' + (cls || '') + '" data-bars="' + esc(t.id) + '" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="' + esc(mixLabel(t)) + ': the shape of its sound. Press to play from that place"></canvas>'; }
  function img(src, w, h, alt, cls) { return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + esc(src) + '" width="' + w + '" height="' + h + '" loading="lazy" decoding="async" alt="' + esc(alt) + '">'; }
  function linkList(o, keys, cls) { var out = keys.filter(function (k) { return o[k] && LINKS[k]; }).map(function (k) { return '<a href="' + esc(o[k]) + '" target="_blank" rel="noopener">' + LINKS[k] + '</a>'; }).join(''); return out ? '<p class="' + (cls || 'links') + '">' + out + '</p>' : ''; }
  // a mix as a row: number, who, day and length, the shape of its sound, play
  function mixRow(t) {
    return '<li class="row">' + link('/mixes/' + mixNo(t), 'row__no g', mixNo(t)) + '<div class="row__txt">' + link('/mixes/' + mixNo(t), 'row__who g', esc(mixWho(t))) +
      '<p class="row__meta g">' + date(t.date) + '<span>' + clock(t.duration) + '</span></p>' + bars(t, 'row__bars') + '</div>' + playBtn(t) + '</li>';
  }
  // a mix as a card: its cover, its number, who
  function mixCard(t) {
    return '<article class="card card--mix" data-year="' + String(t.date).slice(0, 4) + '">' + link('/mixes/' + mixNo(t), 'card__img', img(t.cover, 360, 360, 'Cover of mix ' + mixNo(t) + ', ' + mixWho(t))) + playBtn(t, 'card__pl') +
      '<p class="card__no g">' + mixNo(t) + '</p><h3 class="card__who g">' + link('/mixes/' + mixNo(t), '', esc(mixWho(t))) + '</h3><p class="card__meta g">' + date(t.date) + '<span>' + clock(t.duration) + '</span></p></article>';
  }
  function artistCard(a) {
    var t = mixesOf(a)[0];
    return link('/artists/' + a.slug, 'card card--artist', img(thumb(a.poster), 640, 640, 'Poster for ' + a.name) + '<span class="card__who g">' + esc(a.name) + '</span>' + (t ? '<span class="card__meta g">Mix ' + mixNo(t) + '</span>' : ''));
  }
  function lineup(e) { return (e.lineup || []).map(function (n) { var a = artistByName(n); return a ? link('/artists/' + a.slug, '', esc(n)) : esc(n); }).join(', '); }
  function eventRow(e) {
    return '<li class="erow">' + link('/events/' + e.date, 'erow__img', img(thumb(e.poster), 760, 1086, 'Poster for ' + e.title + ', ' + date(e.date))) +
      '<div class="erow__txt"><p class="erow__when g">' + date(e.date) + '</p><h3 class="erow__title g">' + link('/events/' + e.date, '', esc(e.title)) + '</h3><p class="erow__who">' + lineup(e) + '</p></div></li>';
  }
  function letter() {
    return '<form class="letter" novalidate><label><span class="g">Event letter</span><input name="contact" type="text" placeholder="Email or Instagram" autocomplete="email" autocapitalize="none" required></label>' +
      '<input class="form__hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn" type="submit">Send</button><p class="letter__status" role="status"></p></form>';
  }
  function nums() {
    return '<ul class="nums">' + [[SERIES.length, 'mixes'], [ARTISTS.length, 'artists'], [EVENTS.length, 'events'], [clock(TOTAL), 'of sound']].map(function (q) { return '<li><b class="g">' + q[0] + '</b><span>' + q[1] + '</span></li>'; }).join('') + '</ul>';
  }
  // the foot of every page: the brush's stroke lying across it, the name as the brush writes it, the event letter, what is newest
  // (the latest mix, the next or last event), every page and every place the label lives, and the way back up.
  // home: the home page has just shown the latest mix and the event itself, so its foot leaves those two out
  function foot(home) {
    var e = home ? null : coming[0] || EVENTS[0], name = esc(L.name || 'Tehran Movement'), t0 = home ? null : SERIES[0];
    return '<footer class="foot">' + fx('bar', 'foot__fx') +
      '<div class="foot__top"><div class="foot__brand">' + link('/', 'foot__name', '<i class="ink ink--name" aria-hidden="true"></i><span class="vh">' + name + ', home</span>') + '<p>' + esc(L.tag || 'Techno label and artist collective. Tehran.') + '</p></div>' +
      '<div class="foot__letter"><h2 class="g">Event letter</h2><p>Be the first to know the next date.</p>' + letter() + '</div></div>' +
      '<div class="foot__cols' + (home ? ' foot__cols--two' : '') + '">' +
      (t0 ? '<div class="foot__col foot__col--wide"><p class="foot__k g">Latest mix</p><div class="foot__mix">' + playBtn(t0) + '<p class="g">' + link('/mixes/' + mixNo(t0), '', '<b>' + mixNo(t0) + '</b> ' + esc(mixWho(t0))) + '<span>' + date(t0.date) + '&nbsp;&nbsp;' + clock(t0.duration) + '</span></p></div></div>' : '') +
      (e ? '<div class="foot__col foot__col--wide"><p class="foot__k g">' + (coming.length ? 'Next event' : 'Last event') + '</p>' + link('/events/' + e.date, 'foot__ev g', '<span>' + date(e.date) + '</span>' + esc(e.title)) + '</div>' : '') +
      '<nav class="foot__col foot__nav g" aria-label="Pages"><p class="foot__k">Site</p>' + link('/mixes', '', 'Mixes <b>' + SERIES.length + '</b>') + link('/artists', '', 'Artists <b>' + ARTISTS.length + '</b>') + link('/events', '', 'Events <b>' + EVENTS.length + '</b>') + link('/label', '', 'The label') + link('/contact', '', 'Contact') + '</nav>' +
      '<div class="foot__col foot__nav g"><p class="foot__k">Follow</p>' + ['instagram', 'soundcloud', 'youtube'].filter(function (k) { return L[k]; }).map(function (k) { return '<a href="' + esc(L[k]) + '" target="_blank" rel="noopener">' + LINKS[k] + '</a>'; }).join('') + '</div></div>' +
      '<div class="foot__end"><p>&copy; ' + new Date().getFullYear() + ' ' + name + '</p>' + (L.was ? '<p>Formerly ' + esc(L.was) + '</p>' : '') + (L.since ? '<p>Tehran, since ' + esc(L.since) + '</p>' : '') + '<button class="foot__up g" type="button" data-top>Back to the top</button></div></footer>';
  }
  // the head of a page: one stroke of the brush, and the page's word under its high end.
  // 'r': the stroke runs down to the right; 'l': down to the left
  function head(kind, title, say) {
    return '<header class="phead phead--' + kind + '"><div class="phead__band">' + fx('slash', 'phead__fx', ' data-part=".5" data-dir="' + (kind === 'l' ? -1 : 1) + '" data-seed="' + (31 + title.length) + '"') + '<h1 class="g">' + esc(title) + '</h1></div>' + (say ? '<p class="phead__say">' + say + '</p>' : '') + '</header>';
  }
  /* ─── the pages ─────────────────────────────────────────────────────── */
  var t0 = SERIES[0], coming = EVENTS.filter(function (e) { return e.date >= today(); }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  var VIEWS = {
    home: function () {
      var a0 = t0 && artistBySlug(t0.artist), big = (D.transmissions && D.transmissions[0] && D.transmissions[0].cover) || (t0 && t0.cover);
      var e = coming[0] || EVENTS[0], run = e ? new Array(7).join('<span>' + esc(e.title) + '</span>') : '';
      // The first screen: the brush paints the logo, once; then the wall behind it is painted, black on black, and moves slowly.
      // data-scene: what moves with the scroll (see Scenes): the logo and the wall fall behind a little as the first screen leaves
      return '<section class="hero" data-scene="lag"><div class="hero__bg">' + fx('wall', 'hero__wall', ' data-wait="1300"') + '</div>' + fx('logo', 'hero__fx', ' data-motion="once"') +
          '<div class="hero__txt"><h1 class="hero__name g"><span>Tehran</span> <span>Movement</span></h1>' +
          '<p class="hero__what">' + esc('Techno label and artist collective') + '</p>' + (t0 ? '<div class="hero__go">' + playBtn(t0, 'pl--big') + '<p class="g"><b>Latest mix</b><span>' + esc(mixLabel(t0)) + '&nbsp;&nbsp;' + clock(t0.duration) + '</span></p>' + bars(t0, 'hero__bars') + '</div>' : '') + '</div></section>' +
        // the newest mix, in full; the three before it
        (t0 ? '<section class="mod mod--latest"><h2 class="mod__h g">Latest mix</h2><div class="latest">' + link('/mixes/' + mixNo(t0), 'latest__img', img(big, 900, 900, 'Cover of mix ' + mixNo(t0) + ', ' + mixWho(t0))) +
          '<div class="latest__txt"><p class="latest__no g">' + mixNo(t0) + '</p><h3 class="latest__who g">' + link('/mixes/' + mixNo(t0), '', esc(mixWho(t0))) + '</h3><p class="latest__meta g">' + date(t0.date) + '<span>' + clock(t0.duration) + '</span></p>' +
          '<div class="latest__play">' + playBtn(t0, 'pl--big') + bars(t0) + '</div><p class="links">' + (a0 ? link('/artists/' + a0.slug, '', 'The artist') : '') + (t0.soundcloud ? '<a href="' + esc(t0.soundcloud) + '" target="_blank" rel="noopener">SoundCloud</a>' : '') + '</p></div></div>' +
          '<ul class="rows">' + SERIES.slice(1, 4).map(mixRow).join('') + '</ul>' + link('/mixes', 'more g', 'All ' + SERIES.length + ' mixes') + '</section>' : '') +
        // movement: a part that is only paint, held on the screen and moved by the scroll (data-scene="meet"): the logo's five strokes
        // meet, and the name is written beside the logo as on the banner. A reader that does not see the picture is told the name
        '<section class="scene scene--meet" data-scene="meet"><div class="scene__pin"><canvas class="meet__cv" aria-hidden="true"></canvas><p class="vh">' + esc(L.name || 'Tehran Movement') + '</p></div></section>' +
        // the event that is coming, or the last one: its poster whole and still; behind it the event's name, as large as the room, runs one
        // way and the other as the page scrolls (data-scene="runs")
        (e ? '<section class="mod ev" data-scene="runs"><div class="ev__runs g" aria-hidden="true"><p class="ev__run">' + run + '</p><p class="ev__run ev__run--b">' + run + '</p></div>' +
          '<div class="ev__head"><h2 class="mod__h g">' + (coming.length ? 'Next event' : 'Last event') + '</h2><p class="ev__when g">' + date(e.date) + '</p><h3 class="vh">' + esc(e.title) + '</h3></div>' +
          link('/events/' + e.date, 'ev__img', img(thumb(e.poster), 760, 1086, 'Poster for ' + e.title + ', ' + date(e.date))) +
          '<div class="ev__foot"><p class="ev__who">' + lineup(e) + '</p>' + link('/events', 'more g', 'All ' + EVENTS.length + ' events') + '</div></section>' : '') +
        // the artists
        '<section class="mod mod--artists"><h2 class="mod__h g">Artists</h2><div class="strip">' + PEOPLE.slice(0, 8).map(artistCard).join('') + '</div>' + link('/artists', 'more g', 'All ' + ARTISTS.length + ' artists') + '</section>' +
        // the room: the old site's scene, as it was there. A photograph of one of the nights in a wide frame, held on the screen; it travels
        // from its ceiling down to the dancer on the floor as the page scrolls, and its strips slip sideways with the speed of the scroll
        '<section class="scene scene--room" data-scene="room"><div class="scene__pin"><h2 class="mod__h g">The room</h2><div class="scene__view">' +
          '<div class="scene__band room__pano"><canvas aria-hidden="true"></canvas><img class="room__img" src="assets/img/room.webp" width="1720" height="2576" loading="lazy" decoding="async" alt="One of the nights: a room under green light, people dancing, seen from behind"></div>' +
          '<div class="room__foot"><p class="room__cap">The room is the instrument.</p><p class="room__rec g" aria-hidden="true"><i></i>REC <span class="room__tc">00:00:00:00</span></p></div></div></div></section>' +
        // (what the label is, its other pages and the event letter are in the foot, which follows at once: the home page says each thing once)
        foot(true);
    },
    mixes: function () {
      var ys = years(SERIES);
      // every mix as a card, the newest first; a year's button shows that year only
      return head('r', 'Mixes', SERIES.length + ' mixes &nbsp; ' + clock(TOTAL)) +
        '<div class="tools" role="group" aria-label="Year"><button class="chip is-on" type="button" data-year="">All<span>' + SERIES.length + '</span></button>' + ys.map(function (y) { return '<button class="chip" type="button" data-year="' + y.y + '">' + y.y + '<span>' + y.n + '</span></button>'; }).join('') + '</div>' +
        '<div class="grid grid--mix">' + SERIES.map(function (t) { return mixCard(t); }).join('') + '</div>' + foot();
    },
    mix: function (no) {
      var t = mixByNo(no); if (!t) return VIEWS.lost();
      var a = artistBySlug(t.artist), i = SERIES.indexOf(t), newer = SERIES[i - 1], older = SERIES[i + 1], list = (EXTRA.tracklists || {})[t.id], art = bigArt(t), w = a ? 1000 : 360;
      var same = SERIES.filter(function (x) { return x !== t && String(x.date).slice(0, 4) === String(t.date).slice(0, 4); }).slice(0, 4);
      return '<article class="detail detail--mix">' + fx('slash', 'detail__slash', ' data-part=".5" data-dir="-1" data-seed="' + (40 + i) + '"') + link('/mixes', 'back g', 'Mixes') +
        '<div class="detail__grid"><div class="detail__art">' + img(a ? thumb(art) : art, w, w, 'Cover of mix ' + mixNo(t) + ', ' + mixWho(t)) + '</div>' +
        '<div class="detail__txt"><p class="detail__no g">' + mixNo(t) + '</p><h1 class="detail__h g">' + esc(mixWho(t)) + '</h1><p class="detail__meta g">' + date(t.date) + '<span>' + clock(t.duration) + '</span></p>' +
        '<div class="detail__play">' + playBtn(t, 'pl--big') + bars(t) + '</div>' +
        '<p class="links">' + (t.soundcloud ? '<a href="' + esc(t.soundcloud) + '" target="_blank" rel="noopener">SoundCloud</a>' : '') + '<button class="copy" type="button" data-copy>Copy the link</button></p>' +
        (a ? '<div class="who">' + link('/artists/' + a.slug, 'who__img', img(thumb(a.poster), 640, 640, 'Poster for ' + a.name)) + '<p class="g"><span>The artist</span>' + link('/artists/' + a.slug, '', esc(a.name)) + '</p></div>' : '') + '</div></div>' +
        (list && list.length ? '<section class="tl"><h2 class="g">Tracklist</h2><ol>' + list.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></section>' : '') +
        '<nav class="pn" aria-label="Other mixes">' + (newer ? link('/mixes/' + mixNo(newer), 'pn__a', '<span class="g">Newer</span><b class="g">' + mixNo(newer) + ' ' + esc(mixWho(newer)) + '</b>') : '<span></span>') + (older ? link('/mixes/' + mixNo(older), 'pn__a pn__a--r', '<span class="g">Older</span><b class="g">' + mixNo(older) + ' ' + esc(mixWho(older)) + '</b>') : '<span></span>') + '</nav>' +
        (same.length ? '<section class="also"><h2 class="g">Also from ' + String(t.date).slice(0, 4) + '</h2><div class="grid grid--mix">' + same.map(function (x) { return mixCard(x); }).join('') + '</div></section>' : '') + '</article>' + foot();
    },
    artists: function () { return head('l', 'Artists', ARTISTS.length + ' artists') + '<div class="grid grid--artist">' + PEOPLE.map(artistCard).join('') + '</div>' + foot(); },
    artist: function (slug) {
      var a = artistBySlug(slug); if (!a) return VIEWS.lost();
      var ms = mixesOf(a), es = eventsOf(a), i = PEOPLE.indexOf(a), prev = PEOPLE[i - 1], next = PEOPLE[i + 1];
      return '<article class="detail detail--artist">' + fx('slash', 'detail__slash', ' data-part=".5" data-dir="1" data-seed="' + (60 + i) + '"') + link('/artists', 'back g', 'Artists') +
        '<div class="detail__grid"><a class="detail__art" href="' + esc(PREVIEW ? thumb(a.poster) : a.poster) + '" target="_blank" rel="noopener" aria-label="' + esc(a.name) + ': the poster, whole">' + img(thumb(a.poster), 640, 640, 'Poster for ' + a.name) + '</a>' +
        '<div class="detail__txt"><h1 class="detail__h g">' + esc(a.name) + '</h1>' + ((a.bio || []).length ? '<div class="bio">' + a.bio.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' : '') +
        (ms.length ? '<section class="sub"><h2 class="g">' + (ms.length > 1 ? 'Mixes' : 'Mix') + '</h2><ul class="rows">' + ms.map(mixRow).join('') + '</ul></section>' : '') +
        (es.length ? '<section class="sub"><h2 class="g">Played at</h2><ul class="plain">' + es.map(function (e) { return '<li>' + link('/events/' + e.date, '', '<span class="g">' + date(e.date) + '</span> ' + esc(e.title)) + '</li>'; }).join('') + '</ul></section>' : '') +
        linkList(a.links || {}, Object.keys(LINKS)) + link('/contact', 'btn btn--line', 'Booking and contact') + '</div></div>' +
        '<nav class="pn" aria-label="Other artists">' + (prev ? link('/artists/' + prev.slug, 'pn__a', '<span class="g">Before</span><b class="g">' + esc(prev.name) + '</b>') : '<span></span>') + (next ? link('/artists/' + next.slug, 'pn__a pn__a--r', '<span class="g">Next</span><b class="g">' + esc(next.name) + '</b>') : '<span></span>') + '</nav></article>' + foot();
    },
    events: function () {
      var past = EVENTS.filter(function (e) { return coming.indexOf(e) < 0; }), ys = years(past);
      return head('r', 'Events', EVENTS.length + ' events since ' + (EVENTS.length ? EVENTS[EVENTS.length - 1].date.slice(0, 4) : '')) +
        '<section class="sec"><h2 class="sec__h g">Next</h2>' + (coming.length ? '<ul class="erows">' + coming.map(eventRow).join('') + '</ul>' : '<p class="quiet">' + esc(L.quiet || 'No date announced yet. New nights are announced first on Instagram.') + '</p>') + letter() + '</section>' +
        ys.map(function (y) { return '<section class="sec"><h2 class="sec__h g">' + y.y + '</h2><ul class="erows">' + past.filter(function (e) { return e.date.slice(0, 4) === y.y; }).map(eventRow).join('') + '</ul></section>'; }).join('') + foot();
    },
    event: function (d) {
      var e = eventByDate(d); if (!e) return VIEWS.lost();
      var i = EVENTS.indexOf(e), newer = EVENTS[i - 1], older = EVENTS[i + 1];
      return '<article class="detail detail--event">' + fx('slash', 'detail__slash', ' data-part=".5" data-dir="-1" data-seed="' + (80 + i) + '"') + link('/events', 'back g', 'Events') +
        '<div class="detail__grid"><a class="detail__art" href="' + esc(PREVIEW ? thumb(e.poster) : e.poster) + '" target="_blank" rel="noopener" aria-label="' + esc(e.title) + ': the poster, whole">' + img(thumb(e.poster), 760, 1086, 'Poster for ' + e.title + ', ' + date(e.date)) + '</a>' +
        '<div class="detail__txt"><p class="detail__when g">' + date(e.date) + '</p><h1 class="detail__h g">' + esc(e.title) + '</h1>' +
        ((e.lineup || []).length ? '<section class="sub"><h2 class="g">Line-up</h2><ul class="lineup g">' + e.lineup.map(function (n) { var a = artistByName(n); return '<li>' + (a ? link('/artists/' + a.slug, '', esc(n)) : esc(n)) + '</li>'; }).join('') + '</ul></section>' : '') +
        (e.designer ? '<p class="credit">Poster by ' + esc(e.designer) + '</p>' : '') + letter() + '</div></div>' +
        '<nav class="pn" aria-label="Other events">' + (newer ? link('/events/' + newer.date, 'pn__a', '<span class="g">Later</span><b class="g">' + esc(newer.title) + '</b>') : '<span></span>') + (older ? link('/events/' + older.date, 'pn__a pn__a--r', '<span class="g">Earlier</span><b class="g">' + esc(older.title) + '</b>') : '<span></span>') + '</nav></article>' + foot();
    },
    label: function () {
      var my = years(SERIES), ey = years(EVENTS), all = {}; my.forEach(function (y) { all[y.y] = { m: y.n, e: 0 }; }); ey.forEach(function (y) { (all[y.y] = all[y.y] || { m: 0, e: 0 }).e = y.n; });
      var longest = SERIES.slice().sort(function (a, b) { return b.duration - a.duration; })[0], first = SERIES[SERIES.length - 1];
      return '<section class="lhero">' + fx('gesture', 'lhero__fx') + '<div class="plate"><h1 class="vh">The label</h1><i class="ink ink--name" aria-hidden="true"></i><p class="plate__say">' + esc(L.name || 'Tehran Movement') + ' is a techno label and artist collective from Tehran.</p></div></section>' +
        '<section class="sec sec--facts">' + nums() + '<p class="lead">' + esc(L.mixes || '') + '</p>' +
        '<dl class="facts"><div><dt class="g">Since</dt><dd>' + (L.since || '') + '</dd></div>' +
        (first ? '<div><dt class="g">First mix</dt><dd>' + link('/mixes/' + mixNo(first), '', mixNo(first) + ' ' + esc(mixWho(first))) + ', ' + date(first.date) + '</dd></div>' : '') +
        (t0 ? '<div><dt class="g">Latest mix</dt><dd>' + link('/mixes/' + mixNo(t0), '', mixNo(t0) + ' ' + esc(mixWho(t0))) + ', ' + date(t0.date) + '</dd></div>' : '') +
        (longest ? '<div><dt class="g">Longest mix</dt><dd>' + link('/mixes/' + mixNo(longest), '', mixNo(longest) + ' ' + esc(mixWho(longest))) + ', ' + clock(longest.duration) + '</dd></div>' : '') +
        (L.was ? '<div><dt class="g">Formerly</dt><dd>' + esc(L.was) + '</dd></div>' : '') + '</dl></section>' +
        '<section class="sec"><h2 class="sec__h g">Year by year</h2><ul class="yrs">' + Object.keys(all).sort().reverse().map(function (y) {
          var ms = SERIES.filter(function (t) { return String(t.date).slice(0, 4) === y; }).reverse(), es = EVENTS.filter(function (e) { return e.date.slice(0, 4) === y; }).reverse();
          return '<li><b class="g">' + y + '</b><div class="yr"><p class="yr__say">' + [all[y].m ? all[y].m + (all[y].m > 1 ? ' mixes' : ' mix') : '', all[y].e ? all[y].e + (all[y].e > 1 ? ' events' : ' event') : ''].filter(Boolean).join(', ') + '</p><div class="yr__marks">' +
            // data-wait: the marks of a year are made one after the other, as a hand makes them
            ms.map(function (t, i) { return link('/mixes/' + mixNo(t), 'dab', fx('dab', '', ' data-kind="m" data-n="' + (+mixNo(t)) + '" data-wait="' + i * 34 + '"') + '<span class="dab__no g">' + mixNo(t) + '</span>', ' aria-label="Mix ' + esc(mixLabel(t)) + '" title="' + esc(mixLabel(t)) + '"'); }).join('') +
            es.map(function (e, i) { return link('/events/' + e.date, 'dab dab--n', fx('dab', '', ' data-kind="n" data-n="' + (51 + i) + '" data-wait="' + (ms.length + i) * 34 + '"') + '<span class="dab__no g">' + MON[+e.date.slice(5, 7) - 1] + '.' + e.date.slice(8) + '</span>', ' aria-label="Event ' + esc(e.title + ', ' + date(e.date)) + '" title="' + esc(e.title) + '"'); }).join('') + '</div></div></li>';
        }).join('') + '</ul><ul class="tally__key g"><li class="k-m">A mix</li><li class="k-n">An event</li></ul></section>' +
        '<section class="sec sec--end">' + linkList(L, ['instagram', 'soundcloud', 'youtube'], 'biglinks g') + link('/contact', 'btn', 'Write to us') + '</section>' + foot();
    },
    contact: function () {
      return head('r', 'Contact', esc(L.contact || 'Demos, bookings, collaborations. Every message is read.')) +
        '<form class="form" novalidate><div class="chips" role="radiogroup" aria-label="What is it about">' + ['Demo', 'Booking', 'Collaboration', 'Other'].map(function (k, i) { return '<label class="chip chip--pick"><input type="radio" name="about" value="' + k + '"' + (i ? '' : ' checked') + '><span>' + k + '</span></label>'; }).join('') + '</div>' +
        '<label class="f"><span>Your name</span><input name="name" type="text" autocomplete="name" required></label>' +
        '<label class="f"><span>Email or Instagram</span><input name="contact" type="text" autocomplete="email" autocapitalize="none" required></label>' +
        '<label class="f"><span>Your message</span><textarea name="message" rows="4" required></textarea></label>' +
        '<input class="form__hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn" type="submit">Send</button><p class="form__status" role="status"></p></form>' +
        '<section class="sec sec--end">' + linkList(L, ['instagram', 'soundcloud', 'youtube'], 'biglinks g') + '</section>' + foot();
    },
    lost: function () { return head('l', 'Not here', 'This page does not exist.') + '<section class="sec">' + link('/', 'btn', 'Home') + '</section>' + foot(); }
  };
  function page(r) {
    var s = r.split('/').filter(Boolean);
    if (!s.length) return { html: VIEWS.home(), title: (L.name || 'Tehran Movement') + ' | Techno label and artist collective', nav: '/' };
    var one = { mixes: 'mix', artists: 'artist', events: 'event' }[s[0]];
    if (s.length > 1 && one) { var x = one === 'mix' ? mixByNo(s[1]) : one === 'artist' ? artistBySlug(s[1]) : eventByDate(s[1]); return { html: VIEWS[one](s[1]), title: (x ? (one === 'mix' ? mixLabel(x) : one === 'artist' ? x.name : x.title) : 'Not here') + ' | ' + L.name, nav: '/' + s[0] }; }
    if (s.length === 1 && VIEWS[s[0]] && s[0] !== 'home' && s[0] !== 'lost' && !/^(mix|artist|event)$/.test(s[0])) return { html: VIEWS[s[0]](), title: { mixes: 'Mixes', artists: 'Artists', events: 'Events', label: 'The label', contact: 'Contact' }[s[0]] + ' | ' + L.name, nav: '/' + s[0] };
    return { html: VIEWS.lost(), title: 'Not here | ' + L.name, nav: '' };
  }

  /* ─── going from page to page ───────────────────────────────────────── */
  var route = null;
  // put the page of the present address on the screen
  function show() {
    var r = where(), first = route === null, p = page(r);
    route = r;
    FX.forget(); Scenes.stop(); main.innerHTML = p.html; document.title = p.title;
    $$('.top__nav a').forEach(function (a) { if (a.getAttribute('data-route') === p.nav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    root.setAttribute('data-page', r === '/' ? 'home' : r.split('/')[1] + (r.split('/')[2] ? '-one' : ''));
    window.scrollTo(0, 0);
    tone(); Scenes.start(); FX.all(main); Reveal.watch(); drawBars(); initForms(); paintPlay();
    if (!first) main.focus({ preventScroll: true });
  }
  // the address has changed: the brush passes over the page that is there, and the new one stands behind it. From the menu the
  // new page is simply there when the menu lifts; so it is the first time, and wherever motion is not wanted
  function render(keep) {
    if (where() === route && keep) return;
    if (route === null || reduced || !Menu.el.hidden) { show(); Menu.close(); return; }
    Wipe.pass(show);
  }
  function go(r) {
    if (r === route) { Menu.close(); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); return; }
    if (r === where()) return;      // already on the way there
    if (HASH) location.hash = href(r).slice(1); else { history.pushState(null, '', r); render(); }
  }

  /* ─── the pass of the brush between two pages ───────────────────────────
     A wide brush crosses the screen from the left: black paint, with the yellow still wet on the tips of some of its hairs. When
     it has covered the page, the new page is put there and the paint lifts. Under the top bar and the player, which stay. */
  var Wipe = {
    el: $('.wipe'), busy: 0, run: 0,
    pass: function (swap) {
      var self = this, cv = this.el;
      if (!cv || !cv.getContext) { swap(); return; }
      if (this.busy === 1) return;      // already crossing: the page it uncovers will be the newest
      this.busy = 1; var run = ++this.run;
      var w = window.innerWidth, h = window.innerHeight, n = Math.max(60, Math.round(h / 3.2)), hairs = [], j;
      cv.width = w; cv.height = h; cv.classList.remove('is-off'); cv.hidden = false;
      var c = cv.getContext('2d');
      // fine hairs in bundles, as on the logo's own edges: each runs a little behind or ahead of the ones beside it, and most
      // carry a streak of the yellow ahead of them, long in one bundle and short in the next
      for (j = 0; j < n; j++) hairs.push({ y: Math.floor(j * h / n), hh: Math.ceil(h / n) + 1, lag: (0.5 + 0.5 * Math.sin(j * 0.071 + 1.7) * Math.sin(j * 0.023 + 0.4)) * 0.13 * w + hash(j * 2.9) * 0.025 * w,
        tip: hash(j * 5.3) < 0.3 ? 0 : 4 + Math.pow(0.5 + 0.5 * Math.sin(j * 0.19 + 0.6), 2) * 0.09 * w * (0.25 + 0.75 * hash(j * 1.9)), x: 0 });
      var D = 270, t0 = null, done = false, span = w * 1.24 + 60;
      function end() {
        if (done) return; done = true;
        c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
        swap(); self.busy = 2; cv.classList.add('is-off');
        setTimeout(function () { if (self.run !== run) return; cv.hidden = true; cv.classList.remove('is-off'); self.busy = 0; }, 240);
      }
      function frame(now) {
        if (done) return;
        if (t0 == null) t0 = now;
        var p = Math.min(1, (now - t0) / D), front = p * p * (3 - 2 * p) * span;
        for (var i = 0; i < n; i++) {
          var b = hairs[i], x = Math.max(0, front - b.lag);
          if (x <= b.x) continue;
          c.fillStyle = '#000'; c.fillRect(b.x - 1, b.y, x - b.x + 1, b.hh);
          if (b.tip) { c.fillStyle = '#FFFE26'; c.fillRect(x, b.y, b.tip, Math.max(1, b.hh - 2)); }
          b.x = x;
        }
        if (p >= 1) end(); else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      setTimeout(end, D + 130);      // if the browser gives no frames, the page still changes
    }
  };

  /* ─── a heading is uncovered the way the brush runs, when it comes onto the screen ─── */
  var Reveal = {
    io: null,
    watch: function () {
      if (reduced || !('IntersectionObserver' in window)) return;
      if (this.io) this.io.disconnect();
      var io = this.io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -7% 0px', threshold: 0.15 });
      $$('.mod__h, .sec__h, .foot__name', main).forEach(function (el) { el.classList.add('rv'); io.observe(el); });
    }
  };
  $$('a[data-link]').forEach(function (a) { var r = a.getAttribute('href'); a.setAttribute('data-route', r); a.setAttribute('href', href(r)); });
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[data-link]'); if (!a) return;
    e.preventDefault(); go(a.getAttribute('data-route'));
  });
  window.addEventListener(HASH ? 'hashchange' : 'popstate', function () { render(true); });
  // the top is clear over the first picture of the home page and solid everywhere else
  function tone() { var h = $('.hero', main); root.classList.toggle('at-hero', !!h && h.getBoundingClientRect().bottom > 90); }
  var asked = false;
  window.addEventListener('scroll', function () { if (asked) return; asked = true; soon(function () { asked = false; tone(); }); }, { passive: true });

  /* ─── what moves with the scroll ─────────────────────────────────────────
     Driven by the page's own scroll and nothing else (no dragging, no pointing). A part of a page says which it is with data-scene:
       lag    the logo and the wall of the first screen fall behind a little as it leaves
       meet   movement: a part that is only paint, held on the screen: the logo's five strokes come across the screen and meet as the
              logo; then the view draws back and the brush writes the rest of the name beside it, as on the label's banner
       runs   the event's name, as large as the room, runs one way and the other behind its poster while the part crosses the screen
       room   the old site's scene, kept as it was there: a photograph in a wide frame, held on the screen; it travels from its top to its
              foot, and its strips slip sideways with the speed of the scroll
     A held part (class scene) is as tall as the screen plus the way it has to travel; its inside (scene__pin) sticks to the top meanwhile.
     Where motion is not wanted none of this starts: the moving paint is left out, the name stands still, the photograph stands whole. */
  /* ─── the name as on the label's banner ───
     The logo stands for the T of TEHRAN and the M of MOVEMENT, and the rest of the name is written beside it: EHRAN over OVEMENT.
     The picture is assets/brush/lockup.webp; it and these numbers come from dev/brush/make.js (the accepted outlines).
     U: the picture's own measure; cut: where the logo ends and the letters begin; mark: where the logo's own picture lies in it
     (x, y, width, height); s: every letter in the order the hand writes them: its box (x0, y0, x1, y1: nothing of the letter shows
     outside it), then its swipes, each [width of the brush, x, y, x, y ...] */
  var LOCK = { U: [10584, 3190], cut: 2991, mark: [128.55, 127.05, 2917.3, 2935], s: [
      [2991, 0, 4619, 1595, [214, 3443, 1480, 3435, 840, 3450, 170], [214, 3399, 262, 3961, 234, 4543, 198], [214, 3441, 842, 3833, 826, 4279, 802], [214, 3399, 1380, 3982, 1358, 4565, 1326]],
      [4619, 0, 6087, 1595, [214, 4791, 1480, 4794, 820, 4808, 150], [214, 5917, 140, 5928, 800, 5913, 1480], [214, 4791, 846, 5353, 824, 5917, 796]],
      [6087, 0, 7464, 1595, [214, 6261, 1480, 6254, 820, 6269, 160], [214, 6237, 250, 6819, 230, 7210, 440, 6977, 762, 6290, 802], [214, 6639, 792, 7041, 1140, 7432, 1480]],
      [7464, 0, 9011, 1595, [214, 7497, 1480, 7857, 810, 8227, 170], [214, 8227, 160, 8592, 810, 8957, 1480], [214, 7815, 1045, 8227, 1028, 8650, 1002]],
      [9011, 0, 10584, 1595, [214, 9184, 1480, 9182, 820, 9197, 150], [214, 9224, 180, 9746, 830, 10257, 1440], [214, 10310, 1480, 10316, 810, 10302, 140]],
      [2991, 1595, 3991, 3190, [214, 3546, 1772, 3168, 1832, 3028, 2240, 3108, 2772, 3428, 3010, 3768, 2818, 3868, 2330, 3746, 1882, 3506, 1768, 3196, 1802]],
      [3991, 1595, 5036, 3190, [214, 4036, 1720, 4276, 2400, 4488, 3050], [214, 4518, 3040, 4741, 2380, 4986, 1710]],
      [5036, 1595, 5981, 3190, [214, 5198, 3050, 5190, 2410, 5204, 1740], [214, 5156, 1830, 5506, 1805, 5896, 1772], [214, 5196, 2410, 5446, 2398, 5736, 2378], [214, 5156, 2950, 5526, 2932, 5916, 2906]],
      [5981, 1595, 7321, 3190, [214, 6148, 3010, 6158, 2390, 6216, 1820], [214, 6166, 1740, 6416, 2190, 6641, 2640], [214, 6616, 2680, 6846, 2210, 7086, 1730], [214, 7086, 1720, 7148, 2350, 7126, 3050]],
      [7321, 1595, 8281, 3190, [214, 7498, 3050, 7490, 2410, 7504, 1740], [214, 7456, 1830, 7806, 1805, 8196, 1772], [214, 7496, 2410, 7746, 2398, 8036, 2378], [214, 7456, 2950, 7826, 2932, 8216, 2906]],
      [8281, 1595, 9371, 3190, [214, 8458, 3050, 8456, 2390, 8470, 1720], [214, 8496, 1750, 8826, 2400, 9151, 3010], [214, 9204, 3050, 9210, 2380, 9196, 1710]],
      [9371, 1595, 10584, 3190, [190, 9426, 1850, 9926, 1810, 10426, 1765], [214, 9931, 1830, 9926, 2430, 9916, 3050]]
    ] };

  function held(el) { var r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - el.firstElementChild.offsetHeight), 0, 1); }
  var Scenes = {
    list: [], asked: false,
    start: function () {
      var self = this;
      if (reduced) return;
      $$('[data-scene]', main).forEach(function (el) { var make = self.kinds[el.getAttribute('data-scene')], s = make && make(el); if (s) self.list.push(s); });
      this.measure();
    },
    stop: function () { this.list = []; },
    measure: function () { this.list.forEach(function (s) { if (s.measure) s.measure(); }); this.run(); },
    run: function () { var vh = window.innerHeight; this.list.forEach(function (s) { s.update(vh); }); },
    kick: function () { var self = this; if (this.asked || !this.list.length) return; this.asked = true; requestAnimationFrame(function () { self.asked = false; self.run(); }); },
    kinds: {
      lag: function (el) {
        var logo = $('.hero__fx', el), wall = $('.hero__bg', el);
        return { update: function () { var y = clamp(window.scrollY, 0, el.offsetHeight); if (logo) logo.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)'; if (wall) wall.style.transform = 'translate3d(0,' + (y * 0.4).toFixed(1) + 'px,0)'; } };
      },
      runs: function (el) {
        var a = $('.ev__run', el), b = $('.ev__run--b', el);
        return { update: function (vh) {
          var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
          var s = (clamp((vh - r.top) / (vh + r.height), 0, 1) - 0.5) * window.innerWidth * 1.5;
          a.style.transform = 'translate3d(calc(-50% + ' + (-s).toFixed(1) + 'px),0,0)'; b.style.transform = 'translate3d(calc(-50% + ' + s.toFixed(1) + 'px),0,0)';
        } };
      },
      /* movement (the part in the middle of the home page, held on the screen): only the logo's paint, moved by the scroll alone.
         The logo's five strokes come across the screen, each along its own way, and meet: first the four of the M, then the bar over
         it, last (never the bar with one leg); for a moment the logo stands. Nothing parts again after that: the view draws back, so
         that the logo grows small and goes to its place at the head of the name, and then the brush writes the rest of the name
         beside it, EHRAN over OVEMENT, both lines at once, as on the label's banner (LOCK above; the picture is
         assets/brush/lockup.webp, a larger one on a large screen). The name is written at the size it keeps: nothing grows large on
         the way. Scrolling back undoes it.
         It is drawn with all the points the screen has (up to a limit), and the finished name is the picture itself, point for point
         where the picture is large enough: it must stand sharp.
         The way, in shares: the M is whole at A1, the bar lies at A2, the view draws back from B0 to B1, the name is written from C0
         to C1. The frames run only while something still moves. */
      meet: function (el) {
        var pin = el.firstElementChild, cv = $('canvas', el), c = cv.getContext('2d'), M = FX.mark, A1 = 0.34, A2 = 0.42, B0 = 0.47, B1 = 0.6, C0 = 0.6, C1 = 0.93, HAIRS = 13;
        var W = 0, H = 0, sized = '', parts = null, real = null, name = null, geo = null, cam = null, both = null, veil = null, pad = 0, rows = null, s = 0, to = 0, shown = -1, busy = false, run = 0, asked = '';
        el.classList.add('is-pinned');
        // how far the part has come: 0 when it is still 0.6 of a screen below its place, 1 when it lets go
        function way(vh) { var r = el.getBoundingClientRect(), lead = vh * 0.6; return clamp((lead - r.top) / (lead + Math.max(1, r.height - pin.offsetHeight)), 0, 1); }
        function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
        // the rest of the name, once: its two rows, each with its letters; every swipe of a letter as points close together, how far
        // along each lies, the turn of the brush at each, and when it is written (as a share of its row: both rows end together)
        function write() {
          var seed = 1;
          rows = [[], []];
          LOCK.s.forEach(function (L) { rows[L[1] < LOCK.U[1] / 2 - 1 && L[3] <= LOCK.U[1] / 2 + 1 ? 0 : 1].push(L); });
          rows = rows.map(function (list) {
            var t = 0, letters = list.map(function (L) {
              var o = { x: L[0], y: L[1], w: L[2] - L[0], h: L[3] - L[1], s: [], t0: t, t1: 0 };
              for (var q = 4; q < L.length; q++) {
                var raw = L[q], w = raw[0], ctl = [], i, a, b, l;
                for (i = 1; i < raw.length; i += 2) ctl.push([raw[i], raw[i + 1]]);
                // the brush is set down a little before the swipe's first point and lifted a little after its last
                a = ctl[0]; b = ctl[1]; l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; ctl.unshift([a[0] - (b[0] - a[0]) / l * w * 0.3, a[1] - (b[1] - a[1]) / l * w * 0.3]);
                a = ctl[ctl.length - 1]; b = ctl[ctl.length - 2]; l = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; ctl.push([a[0] + (a[0] - b[0]) / l * w * 0.3, a[1] + (a[1] - b[1]) / l * w * 0.3]);
                var P = FX.spline(ctl, 40), n = P.length, cum = [0], nx = [], ny = [], lag = [];
                for (i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
                for (i = 0; i < n; i++) { a = P[Math.max(0, i - 1)]; b = P[Math.min(n - 1, i + 1)]; l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; nx.push(-(b[1] - a[1]) / l); ny.push((b[0] - a[0]) / l); }
                for (i = 0; i < HAIRS; i++) { l = hash(seed * 7.3 + i * 3.1); lag.push(l * l * w * 0.6); }      // most hairs are at the front, a few come late
                o.s.push({ P: P, cum: cum, nx: nx, ny: ny, n: n, w: w, len: cum[n - 1], lag: lag, t0: t, t1: t + cum[n - 1] + w * 0.6 });
                t += cum[n - 1] + w * 0.25; seed++;      // the next swipe begins while the last hairs of this one still arrive
              }
              o.t1 = o.s[o.s.length - 1].t1; return o;
            });
            return { letters: letters, T: letters[letters.length - 1].t1 };
          });
        }
        // the name's picture (its ink as white), made yellow once. It is asked for a moment after the page itself; which of the two
        // sizes is said by the size the part has (file)
        function ask(file) {
          if (asked === file) return;      // (the same picture as before: it is kept)
          asked = file; name = null;
          var pic = new Image();
          pic.onload = function () { if (asked !== file) return; var o = document.createElement('canvas'); o.width = pic.naturalWidth; o.height = pic.naturalHeight; var g = o.getContext('2d'); g.drawImage(pic, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = getComputedStyle(root).getPropertyValue('--y').trim() || '#FFFE26'; g.fillRect(0, 0, o.width, o.height); name = o; shown = -1; go(); };
          setTimeout(function () { pic.src = (root.getAttribute('data-assets') || 'assets/') + file; }, 700);
        }
        // made for the size the part has now, and again only when that size has changed
        function size() {
          var w = pin.clientWidth, h = pin.clientHeight; if (!w || !h) return false;
          if (w + 'x' + h === sized) return true;
          sized = w + 'x' + h; var mine = ++run;
          // all the points of the screen, as long as that stays under six and a half million of them
          var d = Math.min(window.devicePixelRatio || 1, 2.5, Math.sqrt(6.5e6 / (w * h))), top = (parseFloat(getComputedStyle(pin).paddingTop) || 0) * d;
          W = Math.round(w * d); H = Math.round(h * d); cv.width = W; cv.height = H; c.imageSmoothingQuality = 'high'; parts = null; shown = -1;
          if (!rows) write();
          // the whole name at last: about three fifths of a wide screen's width (nearly all of a narrow one's, or the letters could
          // not be read), never wider than its picture, so that the picture is never stretched
          var want = W * (w < 900 ? 0.9 : 0.6), big = want > 1650, wide = Math.round(Math.min(want, big ? 2800 : 1600)), tall = Math.round(wide * LOCK.U[1] / LOCK.U[0]), room = H - top;
          var fin = { x: Math.round((W - wide) / 2), y: Math.round(top + (room - tall) / 2), w: wide, h: tall, k: wide / LOCK.U[0] };
          ask(big ? 'brush/lockup-2800.webp' : 'brush/lockup.webp');
          veil = document.createElement('canvas'); veil.width = wide; veil.height = tall;
          FX.withMark(function (im) {
            if (mine !== run || !main.contains(el)) return;
            var mh = Math.min(room * 0.6, W * 0.72 * im.height / im.width), mw = mh * im.width / im.height, k = mw / M.U;
            pad = Math.ceil(130 * k); geo = { x: Math.round((W - mw) / 2), y: Math.round(top + (room - mh) / 2), w: mw, h: mh };
            // the logo's own picture, brought once to the size it is shown at when it has met (so that no frame has to bring the large picture down)
            real = document.createElement('canvas'); real.width = Math.ceil(mw); real.height = Math.ceil(mh);
            var rg = real.getContext('2d'); rg.imageSmoothingQuality = 'high'; rg.drawImage(im, 0, 0, real.width, real.height);
            // each stroke painted whole on a sheet of its own with the logo's brush, so that it is a whole stroke while it is alone;
            // it comes along its own direction, from where the hand began it toward where the hand ended it
            parts = M.s.map(function (st, i) {
              var o = document.createElement('canvas'); o.width = Math.ceil(mw) + 2 * pad; o.height = Math.ceil(mh) + 2 * pad;
              var a = st.p[0], b = st.p[st.p.length - 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
              FX.paint(o.getContext('2d'), st.p.map(function (p) { return [p[0] * k + pad, p[1] * k + pad]; }), st.w * k, { dry: [1.5, 1.35, 1.45, 1.3, 1.15][i], seed: 21 + i * 4, grain: k * 1.5, ragged: st.w * k * 0.16 });
              return { im: o, ux: (b[0] - a[0]) / l, uy: (b[1] - a[1]) / l, far: i === 4 ? W / 2 + mw * 0.66 : mh * (i < 2 ? 1.3 : 1.4) };
            });
            // the five painted strokes in their places, on one sheet: what the logo's own picture takes the place of
            both = document.createElement('canvas'); both.width = parts[0].im.width; both.height = parts[0].im.height;
            var bg = both.getContext('2d'); parts.forEach(function (p) { bg.drawImage(p.im, 0, 0); });
            // the view: at first the logo as it stands when it has met (k0), at last the logo in its place in the whole name (fin)
            var mx = LOCK.mark[0] + LOCK.mark[2] / 2, my = LOCK.mark[1] + LOCK.mark[3] / 2;
            cam = { k0: mw / LOCK.mark[2], k1: fin.k, mx: mx, my: my, x0: geo.x + mw / 2, y0: geo.y + mh / 2, x1: fin.x + mx * fin.k, y1: fin.y + my * fin.k, fin: fin };
            shown = -1; go();
          });
          return true;
        }
        // a line of the brush from the start of a swipe to a place along it, moved sideways by off
        function hair(g, sw, off, upto) {
          if (upto <= 0) return;
          g.moveTo(sw.P[0][0] + sw.nx[0] * off, sw.P[0][1] + sw.ny[0] * off);
          for (var i = 1; i < sw.n; i++) {
            if (sw.cum[i] <= upto) { g.lineTo(sw.P[i][0] + sw.nx[i] * off, sw.P[i][1] + sw.ny[i] * off); continue; }
            var f = (upto - sw.cum[i - 1]) / ((sw.cum[i] - sw.cum[i - 1]) || 1), ax = sw.P[i - 1][0] + sw.nx[i - 1] * off, ay = sw.P[i - 1][1] + sw.ny[i - 1] * off;
            g.lineTo(ax + (sw.P[i][0] + sw.nx[i] * off - ax) * f, ay + (sw.P[i][1] + sw.ny[i] * off - ay) * f); break;
          }
        }
        // what of the name is uncovered when the writing has come so far (0 to 1): in each row the letters done, whole; of the letter
        // being written, the swipes done and the one under the brush, hair by hair; nothing of a letter outside its own box
        function uncover(g, share) {
          g.fillStyle = g.strokeStyle = '#000'; g.lineJoin = 'round';
          rows.forEach(function (row) {
            var t = share * row.T;
            for (var i = 0; i < row.letters.length; i++) {
              var L = row.letters[i]; if (L.t0 >= t) break;
              if (L.t1 <= t) { g.fillRect(L.x, L.y, L.w, L.h); continue; }
              g.save(); g.beginPath(); g.rect(L.x, L.y, L.w, L.h); g.clip();
              for (var j = 0; j < L.s.length; j++) {
                var sw = L.s[j], band = sw.w * 1.36; if (sw.t0 >= t) break;
                if (sw.t1 <= t) { g.lineCap = 'butt'; g.lineWidth = band; g.beginPath(); hair(g, sw, 0, sw.len); g.stroke(); continue; }
                g.lineCap = 'round'; g.lineWidth = band / HAIRS * 1.4; g.beginPath();
                for (var h = 0; h < HAIRS; h++) hair(g, sw, ((h + 0.5) / HAIRS - 0.5) * band, Math.min(sw.len, t - sw.t0 - sw.lag[h]));
                g.stroke();
              }
              g.restore();
            }
          });
        }
        function draw(v) {
          c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, W, H);
          if (!parts) return;
          var t, f = cam.fin;
          if (v <= B0 || !name) {
            // the strokes come and meet. When the bar lies, the logo's own picture takes the place of the five painted strokes over a short
            // way, and never through a dim state: first it comes over them (t from 0 to 1), then they go from under it (t from 1 to 2)
            t = clamp((v - A2) / 0.006, 0, 2);
            if (t <= 1) parts.forEach(function (p, i) {
              var g = i < 4 ? -Math.pow(1 - clamp(v / A1, 0, 1), 1.5) : v <= A1 ? -1 : smooth((v - A1) / (A2 - A1)) - 1;
              if (g > -1) c.drawImage(p.im, geo.x - pad + p.ux * g * p.far, geo.y - pad + p.uy * g * p.far);
            });
            else if (t < 2) { c.globalAlpha = 2 - t; c.drawImage(both, geo.x - pad, geo.y - pad); c.globalAlpha = 1; }
            if (t > 0) { c.globalAlpha = Math.min(1, t); c.drawImage(real, geo.x, geo.y, geo.w, geo.h); c.globalAlpha = 1; }
            return;
          }
          var share = Math.min(1, (v - C0) / (C1 - C0));
          // the name is whole: its picture itself, point for point
          if (share >= 1) { c.drawImage(name, f.x, f.y, f.w, f.h); return; }
          // the view draws back: the logo grows small and goes to its place at the head of the name
          var e = smooth((v - B0) / (B1 - B0));
          if (e < 1) { var k = cam.k0 * Math.pow(cam.k1 / cam.k0, e), ox = cam.x0 + (cam.x1 - cam.x0) * e - cam.mx * k, oy = cam.y0 + (cam.y1 - cam.y0) * e - cam.my * k; c.drawImage(real, ox + LOCK.mark[0] * k, oy + LOCK.mark[1] * k, LOCK.mark[2] * k, LOCK.mark[3] * k); return; }
          // it stands there (taken from the name's own picture, so that nothing shifts when the name is whole); the name is written beside it
          var cut = LOCK.cut / LOCK.U[0];
          c.drawImage(name, 0, 0, name.width * cut, name.height, f.x, f.y, f.w * cut, f.h);
          if (share <= 0) return;
          var g2 = veil.getContext('2d'); g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'source-over'; g2.clearRect(0, 0, f.w, f.h);
          g2.setTransform(f.k, 0, 0, f.k, 0, 0); uncover(g2, share);
          g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'source-in'; g2.imageSmoothingQuality = 'high'; g2.drawImage(name, 0, 0, f.w, f.h);
          c.drawImage(veil, f.x, f.y);
        }
        function frame() {
          busy = false; if (!main.contains(el)) return;
          s = Math.abs(to - s) < 0.0005 ? to : s + (to - s) * 0.16;
          if (s !== shown) { draw(s); shown = s; }
          if (s !== to) go();
        }
        function go() { if (!busy) { busy = true; requestAnimationFrame(frame); } }
        return {
          measure: function () { size(); },
          update: function (vh) { var r = el.getBoundingClientRect(); if (r.bottom < -40 || r.top > vh + 40) return; to = way(vh); if (to !== s || shown < 0) go(); }
        };
      },
      /* the room: the old site's "Feedback" scene, ported as it was. The picture covers its frame and travels along its longer side
         with the scroll (a tall picture tilts from the ceiling down to the floor); its nine strips slip sideways the faster the page
         moves, and come back to rest; the counter under it runs with the travel. The frames run only while something still moves. */
      room: function (el) {
        var pano = $('.room__pano', el), cv = $('canvas', pano), im = $('img', pano), tc = $('.room__tc', el), c = cv.getContext('2d');
        var W = 0, H = 0, d = 1, x = 0, y = 0, lx = 0, ly = 0, v = 0, busy = false, fresh = true, t0 = 0;
        el.classList.add('is-pinned');
        function frame(now) {
          busy = false;
          if (!main.contains(el) || !W || !im.complete || !im.naturalWidth) return;
          if (!t0) t0 = now;
          var p = held(el), iw = im.naturalWidth, ih = im.naturalHeight, sc = Math.max(W / iw, H / ih), dw = iw * sc, dh = ih * sc;
          var tx = -Math.max(0, dw - W) * p, ty = -Math.max(0, dh - H) * p;
          if (fresh) { x = lx = tx; y = ly = ty; v = 0; fresh = false; }
          x += (tx - x) * 0.14; y += (ty - y) * 0.14; v += ((x - lx) + (y - ly) - v) * 0.3; lx = x; ly = y;
          var shear = Math.min(Math.abs(v) * 2.2, 70 * d), n = 9, sh = H / n, t = (now - t0) / 1000;
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
          for (var i = 0; i < n; i++) {
            var off = Math.sin(i * 0.95 + t * 5) * shear, sy = (i * sh - y) / sc, sH = Math.min((sh + 1) / sc, ih - sy);
            if (sH > 0) c.drawImage(im, 0, sy, iw, sH, x + off, i * sh, dw, sH * sc);
          }
          var fr = Math.floor(p * 3 * 60 * 25);
          if (tc) tc.textContent = '00:' + pad(Math.floor(fr / 1500)) + ':' + pad(Math.floor(fr / 25) % 60) + ':' + pad(fr % 25);
          if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3 || Math.abs(v) > 0.08) go();
        }
        function go() { if (!busy) { busy = true; requestAnimationFrame(frame); } }
        im.addEventListener('load', go);
        return {
          measure: function () { d = Math.min(window.devicePixelRatio || 1, 1.5); W = Math.round(pano.clientWidth * d); H = Math.round(pano.clientHeight * d); if (W && H) { cv.width = W; cv.height = H; } fresh = true; go(); },
          update: function (vh) { var r = el.getBoundingClientRect(); if (r.bottom > -40 && r.top < vh + 40) go(); }
        };
      }
    }
  };
  window.addEventListener('scroll', function () { Scenes.kick(); }, { passive: true });
  var st = 0;
  window.addEventListener('resize', function () { clearTimeout(st); st = setTimeout(function () { Scenes.measure(); }, 180); });
  window.addEventListener('load', function () { Scenes.measure(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { Scenes.measure(); });

  /* ─── the menu: the M walked, a page at every turn ──────────────────── */
  var Menu = {
    el: $('#menu'), btn: $('.top__menu'),
    init: function () {
      var self = this;
      $('.menu__nav', this.el).innerHTML = link('/', 'menu__home', '<i class="ink ink--name" aria-hidden="true"></i><span class="vh">Home</span>') +
        link('/mixes', 'menu__a menu__a--1 g', 'Mixes <b>' + SERIES.length + '</b>') + link('/artists', 'menu__a menu__a--2 g', '<b>' + ARTISTS.length + '</b> Artists') +
        link('/events', 'menu__a menu__a--3 g', 'Events <b>' + EVENTS.length + '</b>') + link('/contact', 'menu__a menu__a--4 g', 'Write to us') + link('/label', 'menu__a menu__a--5 g', 'The label');
      this.btn.addEventListener('click', function () { if (self.el.hidden) self.open(); else self.close(); });
      $('.menu__close', this.el).addEventListener('click', function () { self.close(); self.btn.focus(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !self.el.hidden) { self.close(); self.btn.focus(); } });
    },
    // opening: the line is walked from the top, and each page's word is there when the line reaches its turn (the stylesheet times them)
    open: function () { clearTimeout(this.t); this.el.classList.remove('is-out'); this.el.hidden = false; root.classList.add('menu-open'); this.btn.setAttribute('aria-expanded', 'true'); FX.draw($('.menu__fx', this.el), true, true); $('.menu__close', this.el).focus(); },
    close: function () {
      var el = this.el; if (el.hidden || el.classList.contains('is-out')) return;
      root.classList.remove('menu-open'); this.btn.setAttribute('aria-expanded', 'false');
      if (reduced) { el.hidden = true; return; }
      el.classList.add('is-out'); this.t = setTimeout(function () { el.hidden = true; el.classList.remove('is-out'); }, 180);
    }
  };

  /* ─── the shape of a mix's sound, as bars ───────────────────────────── */
  function wsample(t, f) { var w = t.waveform || [], x = clamp(f, 0, 1) * (w.length - 1), i = Math.floor(x), fr = x - i, v = w.length ? w[i] * (1 - fr) + w[Math.min(w.length - 1, i + 1)] * fr : 0.7; return clamp((v - 0.3) / 0.7, 0, 1); }
  function drawBar(cv) {
    var t = mixById(cv.getAttribute('data-bars')); if (!t) return;
    var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), on = Player.cur === t ? Player.frac : -1, bw = h > 40 ? 3 : 2, gap = bw, n = Math.floor(w / (bw + gap)), k = on < 0 ? -1 : Math.round(on * n);
    if (cv._w === w && cv._h === h && cv._k === k) return;
    cv._w = w; cv._h = h; cv._k = k;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (var i = 0; i < n; i++) {
      var v = (0.12 + 0.88 * Math.pow(wsample(t, i / n), 2)) * (0.76 + 0.24 * hash(i * 3.7 + t.duration)), l = Math.max(bw, v * h);
      c.fillStyle = i < k ? '#FFFE26' : 'rgba(241,239,230,.6)'; c.fillRect(i * (bw + gap), (h - l) / 2, bw, l);
    }
    cv.setAttribute('aria-valuenow', String(on < 0 ? 0 : Math.round(on * 100)));
  }
  function drawBars() { $$('.bars', main).forEach(drawBar); }
  var bt = 0;
  window.addEventListener('resize', function () { clearTimeout(bt); bt = setTimeout(function () { drawBars(); tone(); if (Player.cur) Player.height(); }, 200); });

  /* ─── the player ────────────────────────────────────────────────────────
     One hidden SoundCloud widget, driven from here. The bar at the foot stays wherever you go. If a browser will not let a page start
     sound, SoundCloud's own player is shown for one tap. In a preview there is no SoundCloud: the time runs in silence. */
  var Player = {
    cur: null, frac: 0, sec: 0, state: 'idle', el: null, widget: null, ready: false, api: null, gen: 0, want: false, seekTo: null, started: false, retries: 0, askedAt: 0, shown: false, note: '', sim: 0,
    init: function () {
      var el = this.el = $('.player'); if (!el) return;
      this.bar = $('.player__bar', el);
      $('.player__toggle', el).addEventListener('click', function () { if (Player.cur) Player.play(Player.cur.id); });
      $('.player__close', el).addEventListener('click', function () { Player.stop(); });
      var fracOf = function (e) { var r = Player.bar.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 0.999); };
      this.bar.addEventListener('click', function (e) { if (Player.cur) Player.play(Player.cur.id, fracOf(e)); });
      this.bar.addEventListener('keydown', function (e) {
        if (!Player.cur) return;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); Player.play(Player.cur.id, clamp(Player.frac + (e.key === 'ArrowRight' ? 0.02 : -0.02), 0, 0.999)); }
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); Player.play(Player.cur.id); }
      });
    },
    loadApi: function () {
      if (window.SC && window.SC.Widget) return Promise.resolve();
      if (this.api) return this.api;
      var self = this;
      this.api = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://w.soundcloud.com/player/api.js'; s.async = true;
        s.onload = function () { resolve(); };
        s.onerror = function () { self.api = null; reject(new Error('no SoundCloud')); };
        document.head.appendChild(s);
        setTimeout(function () { if (!(window.SC && window.SC.Widget)) { self.api = null; reject(new Error('timeout')); } }, 12000);
      });
      return this.api;
    },
    // play a mix, or stop and start the one that is on; frac: from that place in it (0 to 1)
    play: function (id, frac) {
      var t = mixById(id); if (!t) return;
      if (this.cur !== t) { this.open(t, frac); return; }
      if (frac != null) { this.frac = frac; this.sec = frac * t.duration; }
      if (PREVIEW) { if (frac == null) this.state = this.state === 'playing' ? 'paused' : 'playing'; else this.state = 'playing'; this.paint(); return; }
      if (this.state === 'error') { this.open(t, frac); return; }
      if (!this.ready) { if (frac != null) this.seekTo = frac; this.want = true; this.paint(); return; }
      if (frac != null) { this.widget.seekTo(frac * t.duration * 1000); this.ask(); }
      else if (this.state === 'playing') { this.want = false; this.widget.pause(); }
      else this.ask();
      this.paint();
    },
    ask: function () { this.want = true; this.askedAt = Date.now(); this.retries = 0; this.widget.play(); },
    open: function (t, frac) {
      var self = this, gen = ++this.gen;
      this.cur = t; this.frac = frac || 0; this.sec = this.frac * t.duration; this.seekTo = frac == null ? null : frac;
      this.state = 'loading'; this.want = true; this.started = false; this.ready = false; this.note = '';
      this.reveal(false); this.show(); this.paint();
      if (PREVIEW) {      // no SoundCloud in a preview: the time runs, in silence
        this.state = 'playing'; this.note = 'A preview: no sound here. On the real site this plays from SoundCloud.';
        clearInterval(this.sim); this.sim = setInterval(function () { if (!self.cur || self.state !== 'playing') return; self.sec = Math.min(self.cur.duration, self.sec + 0.25); self.frac = self.sec / self.cur.duration; self.paint(true); }, 250);
        this.paint(); return;
      }
      if (!t.soundcloud) { this.state = 'error'; this.note = 'This mix has no address on SoundCloud yet.'; this.paint(); return; }
      var fail = setTimeout(function () { if (self.gen === gen && !self.ready) self.fail(); }, 14000);
      this.loadApi().then(function () {
        if (self.gen !== gen) return;
        var opts = { auto_play: true, hide_related: true, show_comments: false, show_user: true, show_reposts: false, show_teaser: false, visual: false, color: 'FFFE26' };
        var onReady = function () {
          if (self.gen !== gen) return;
          clearTimeout(fail); self.ready = true;
          if (self.seekTo != null) { self.widget.seekTo(self.seekTo * t.duration * 1000); self.seekTo = null; }
          if (self.want) self.ask();
          setTimeout(function () {
            if (self.gen !== gen || self.started || !self.want) return;
            self.widget.isPaused(function (paused) { if (self.gen !== gen || !paused || self.started) return; self.state = 'blocked'; self.reveal(true); self.paint(); });
          }, 5000);
        };
        if (self.widget) { self.widget.load(t.soundcloud, Object.assign({ callback: onReady }, opts)); return; }
        var ifr = document.createElement('iframe');
        ifr.allow = 'autoplay; encrypted-media'; ifr.title = 'SoundCloud player';
        ifr.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(t.soundcloud) + '&color=%23FFFE26&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false';
        $('.player__frame', self.el).appendChild(ifr);
        var w = self.widget = window.SC.Widget(ifr), EV = window.SC.Widget.Events;
        w.bind(EV.READY, onReady);
        w.bind(EV.PLAY, function () {
          if (!self.want && !self.shown) { self.widget.pause(); return; }      // SoundCloud starts again by itself after a jump: hold it to the last wish
          self.started = true; self.want = true; self.state = 'playing'; self.reveal(false); self.paint();
        });
        w.bind(EV.PAUSE, function () {
          if (self.want && Date.now() - self.askedAt < 8000 && self.retries < 4) { self.retries++; var g2 = self.gen; setTimeout(function () { if (self.gen === g2 && self.want) self.widget.play(); }, 350 * self.retries); return; }
          if (self.want && !self.started) { self.state = 'blocked'; self.reveal(true); self.paint(); return; }
          self.state = 'paused'; self.paint();
        });
        w.bind(EV.FINISH, function () { self.want = false; self.state = 'paused'; self.frac = 0; self.sec = 0; self.paint(); });
        w.bind(EV.PLAY_PROGRESS, function (e) {
          if (!self.cur) return;
          self.started = true;
          if (self.state !== 'playing' && self.want) { self.state = 'playing'; self.reveal(false); }
          self.frac = e.relativePosition; self.sec = e.currentPosition / 1000; self.paint(true);
        });
        if (EV.ERROR) w.bind(EV.ERROR, function () { if (!self.started) self.fail(); });
      }).catch(function () { if (self.gen === gen) { clearTimeout(fail); self.fail(); } });
    },
    fail: function () {
      this.gen++; this.ready = false; this.want = false; this.state = 'error';
      this.note = 'SoundCloud did not answer. From Iran it needs a VPN.';
      var f = $('.player__frame', this.el); if (f) f.innerHTML = '';
      this.widget = null; this.reveal(false); this.paint();
    },
    stop: function () {
      this.gen++; this.want = false; clearInterval(this.sim);
      if (this.widget && this.ready) { try { this.widget.pause(); } catch (e) { /* gone */ } }
      this.cur = null; this.state = 'idle'; this.frac = 0; this.sec = 0;
      this.reveal(false); this.el.hidden = true; root.classList.remove('has-player'); root.style.removeProperty('--player-h');
      paintPlay();
    },
    show: function () {
      var t = this.cur, el = this.el;
      el.hidden = false; root.classList.add('has-player');
      $('.player__no', el).textContent = mixNo(t); $('.player__who', el).textContent = mixWho(t); $('.player__total', el).textContent = clock(t.duration);
      var ext = $('.player__ext', el); if (t.soundcloud) { ext.href = t.soundcloud; ext.hidden = false; ext.setAttribute('aria-label', 'Open ' + mixLabel(t) + ' on SoundCloud'); } else ext.hidden = true;
      this.bar.setAttribute('aria-label', 'Seek ' + mixLabel(t));
      this.height();
    },
    height: function () { var el = this.el; requestAnimationFrame(function () { if (!el.hidden) root.style.setProperty('--player-h', el.offsetHeight + 'px'); }); },
    reveal: function (on) { var box = $('.player__sc', this.el); if (!box) return; this.shown = !!on; box.hidden = !on; box.inert = !on; this.height(); },
    paint: function (lite) {
      var t = this.cur, el = this.el; if (!t) return;
      var st = this.state;
      $('.player__now', el).textContent = clock(this.sec);
      $('i', this.bar).style.width = (this.frac * 100).toFixed(2) + '%'; this.bar.setAttribute('aria-valuenow', String(Math.round(this.frac * 100)));
      if (!lite || this._st !== st) {
        this._st = st; el.setAttribute('data-state', st);
        $('.player__toggle', el).setAttribute('aria-label', (st === 'playing' ? 'Pause ' : 'Play ') + mixLabel(t));
        $('.player__state', el).textContent = st === 'loading' ? 'Loading' : st === 'blocked' ? 'Tap play in the SoundCloud player below' : (st === 'error' || PREVIEW) ? this.note : '';
        this.height();
      }
      paintPlay(lite);
    }
  };

  // the page shows what the player is doing: the mix that is on has its bars lit as far as it has played
  function paintPlay(lite) {
    var cur = Player.cur, playing = Player.state === 'playing';
    $$('.bars', main).forEach(function (cv) { if (cur && cv.getAttribute('data-bars') === cur.id) drawBar(cv); else if (cv._k !== -1 && cv._k != null) drawBar(cv); });
    if (lite) return;
    $$('[data-play]', main).forEach(function (c) { var on = !!cur && c.getAttribute('data-play') === cur.id && playing; c.classList.toggle('is-on', on); c.setAttribute('aria-label', (on ? 'Pause ' : 'Play ') + mixLabel(mixById(c.getAttribute('data-play')))); });
  }
  main.addEventListener('click', function (e) {
    var p = e.target.closest('[data-play]'); if (p) { Player.play(p.getAttribute('data-play')); return; }
    var b = e.target.closest('.bars'); if (b) { var r = b.getBoundingClientRect(); if (e.detail === 0) Player.play(b.getAttribute('data-bars')); else Player.play(b.getAttribute('data-bars'), clamp((e.clientX - r.left) / r.width, 0, 0.999)); return; }
    // a year's button shows that year's mixes only
    var y = e.target.closest('.chip[data-year]');
    if (y) { var want = y.getAttribute('data-year'); $$('.chip[data-year]', main).forEach(function (c) { c.classList.toggle('is-on', c === y); }); $$('.card--mix', $('.grid', main)).forEach(function (c) { c.hidden = !!want && c.getAttribute('data-year') !== want; }); return; }
    if (e.target.closest('[data-top]')) { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); return; }
    var cp = e.target.closest('[data-copy]');
    if (cp) { var done = function (ok) { cp.textContent = ok ? 'Copied' : location.href; }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(function () { done(true); }, function () { done(false); }); else done(false); }
  });
  main.addEventListener('keydown', function (e) {
    var b = e.target.closest && e.target.closest('.bars'); if (!b || e.target !== b) return;
    var id = b.getAttribute('data-bars');
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Player.play(id); }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && Player.cur && Player.cur.id === id) { e.preventDefault(); Player.play(id, clamp(Player.frac + (e.key === 'ArrowRight' ? 0.02 : -0.02), 0, 0.999)); }
  });

  /* ─── writing to the label: the contact form, and the event letter ──── */
  function send(payload, status, btn, okText, form) {
    if (PREVIEW || !L.form) { status.textContent = 'A preview: on the real site this is sent from here.'; return; }
    btn.disabled = true; status.textContent = 'Sending';
    fetch(L.form, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) { if (!res.ok || String(res.j.success) === 'false') throw new Error(res.j.message || 'failed'); form.reset(); status.textContent = okText; })
      .catch(function () { status.innerHTML = 'It did not go through. Try again, or write to <a href="' + esc(L.instagram || '#') + '" target="_blank" rel="noopener">' + esc(L.handle || 'us') + '</a> on Instagram.'; })
      .then(function () { btn.disabled = false; });
  }
  function initForms() {
    $$('.letter', main).forEach(function (F) {
      F.addEventListener('submit', function (e) {
        e.preventDefault();
        var status = $('.letter__status', F), v = ($('input[name=contact]', F).value || '').trim();
        if (!v) { status.textContent = 'Write an email or an Instagram name.'; $('input[name=contact]', F).focus(); return; }
        if ($('.form__hp', F).value) return;
        var payload = { _subject: (L.name || 'Tehran Movement') + ', event letter', _template: 'table', _captcha: 'false', Contact: v, Message: 'Add me to the event letter.' };
        if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) payload._replyto = v;
        send(payload, status, $('button', F), 'You are on the letter. Thank you.', F);
      });
    });
    var F = $('.form', main); if (!F) return;
    var status = $('.form__status', F);
    F.addEventListener('input', function (e) { var l = e.target.closest('.f'); if (l) l.classList.remove('is-bad'); });
    F.addEventListener('submit', function (e) {
      e.preventDefault(); status.textContent = '';
      var bad = [], fd = {};
      $$('input[type=text], textarea', F).forEach(function (i) {
        if (i.classList.contains('form__hp')) return;
        var v = (i.value || '').trim(); fd[i.name] = v;
        if (!v) { bad.push(i); i.closest('.f').classList.add('is-bad'); }
      });
      if (bad.length) { status.textContent = bad.length === 1 ? 'One field is still empty.' : bad.length + ' fields are still empty.'; bad[0].focus(); return; }
      if ($('.form__hp', F).value) return;
      var about = ($('input[name=about]:checked', F) || {}).value || 'Other';
      var payload = { _subject: (L.name || 'Tehran Movement') + ', ' + about.toLowerCase() + ' from ' + fd.name, _template: 'table', _captcha: 'false', About: about, Name: fd.name, Contact: fd.contact, Message: fd.message };
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fd.contact)) payload._replyto = fd.contact;
      send(payload, status, $('.btn', F), 'Sent. Thank you.', F);
    });
  }

  /* ─── go ─────────────────────────────────────────────────────────────── */
  Menu.init(); Player.init(); render();
})();

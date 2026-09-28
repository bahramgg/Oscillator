/* ==========================================================================
   OSCILLATOR — signal engine
   A tiny techno machine built on the Web Audio API: kick, hats, clap and an
   acid bassline. Nothing is sampled — every sound is synthesized live.
   Each artist has their own seeded bassline (setPattern).
   ========================================================================== */
(function () {
  'use strict';

  var BPM = 132;
  var STEP = 60 / BPM / 4;       // one 16th note, in seconds
  var LOOKAHEAD = 0.12;          // schedule this far ahead
  var NOTES = [0, 0, 0, 0, 12, 3, 7, 10, -2, 5, 15];

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makePattern(seed) {
    var r = rng(seed || 1);
    var p = [];
    for (var i = 0; i < 16; i++) {
      var onKick = i % 4 === 0;
      p.push({
        gate: r() < (onKick ? 0.18 : 0.66),
        note: NOTES[Math.floor(r() * NOTES.length)],
        accent: r() < 0.3,
        slide: r() < 0.22
      });
    }
    // make sure the line always has some movement
    if (p.filter(function (s) { return s.gate; }).length < 6) p[2].gate = p[6].gate = p[10].gate = p[14].gate = true;
    return p;
  }

  function Engine() {
    this.on = false;
    this.ctx = null;
    this.step = 0;
    this.bar = 0;
    this.cutoff = 0.35;
    this.targetCutoff = 0.35;
    this.beats = [];
    this.pattern = makePattern(0x05C1);
    this.defaultPattern = this.pattern;
    this.bpm = BPM;
  }

  Engine.prototype.supported = function () {
    return !!(window.AudioContext || window.webkitAudioContext);
  };

  Engine.prototype.build = function () {
    var AC = window.AudioContext || window.webkitAudioContext;
    var c = this.ctx = new AC();

    this.master = c.createGain();
    this.master.gain.value = 0;

    var comp = c.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 8; comp.ratio.value = 4;
    comp.attack.value = 0.003; comp.release.value = 0.18;

    this.analyser = c.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.5;
    this.timeData = new Float32Array(this.analyser.fftSize);

    this.bus = c.createGain();
    this.bus.gain.value = 0.9;
    this.bus.connect(comp);
    comp.connect(this.master);
    this.master.connect(this.analyser);
    this.analyser.connect(c.destination);

    // one second of white noise, reused by hats & clap
    var len = c.sampleRate;
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;

    // dotted-eighth feedback delay as a send
    this.delay = c.createDelay(1.5);
    this.delay.delayTime.value = STEP * 3;
    var fb = c.createGain(); fb.gain.value = 0.34;
    var tone = c.createBiquadFilter(); tone.type = 'bandpass'; tone.frequency.value = 1400; tone.Q.value = 0.7;
    this.delay.connect(tone); tone.connect(fb); fb.connect(this.delay);
    tone.connect(this.bus);
    this.send = c.createGain(); this.send.gain.value = 0.28;
    this.send.connect(this.delay);

    // the acid voice: one persistent saw → resonant lowpass → vca (allows slides)
    this.bOsc = c.createOscillator(); this.bOsc.type = 'sawtooth'; this.bOsc.frequency.value = 55;
    this.bSub = c.createOscillator(); this.bSub.type = 'square'; this.bSub.frequency.value = 27.5;
    var subGain = c.createGain(); subGain.gain.value = 0.18;
    this.bFilt = c.createBiquadFilter(); this.bFilt.type = 'lowpass'; this.bFilt.Q.value = 13; this.bFilt.frequency.value = 400;
    this.bVca = c.createGain(); this.bVca.gain.value = 0;
    this.bOsc.connect(this.bFilt);
    this.bSub.connect(subGain); subGain.connect(this.bFilt);
    this.bFilt.connect(this.bVca);
    this.bVca.connect(this.bus);
    this.bVca.connect(this.send);
    this.bOsc.start(); this.bSub.start();
  };

  Engine.prototype.start = function () {
    var self = this;
    if (!this.supported()) return Promise.resolve(false);
    if (!this.ctx) this.build();
    return this.ctx.resume().then(function () {
      var c = self.ctx, now = c.currentTime, g = self.master.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(0.62, now + 0.5);
      self.on = true;
      self.step = 0; self.bar = 0;
      self.nextTime = now + 0.08;
      self.beats.length = 0;
      clearInterval(self.timer);
      self.timer = setInterval(function () { self.tick(); }, 25);
      return true;
    }).catch(function () { return false; });
  };

  Engine.prototype.stop = function () {
    if (!this.ctx) return;
    var self = this, c = this.ctx, now = c.currentTime, g = this.master.gain;
    this.on = false;
    clearInterval(this.timer);
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + 0.35);
    this.bVca.gain.cancelScheduledValues(now);
    this.bVca.gain.setTargetAtTime(0, now, 0.05);
    this.beats.length = 0;
    setTimeout(function () { if (!self.on && self.ctx.state === 'running') self.ctx.suspend(); }, 500);
  };

  Engine.prototype.setPattern = function (seed) {
    this.pattern = seed == null ? this.defaultPattern : makePattern(seed);
  };

  // 0..1 — mapped exponentially onto the filter cutoff
  Engine.prototype.setCutoff = function (v) {
    this.targetCutoff = Math.max(0, Math.min(1, v));
  };

  Engine.prototype.tick = function () {
    var c = this.ctx;
    this.cutoff += (this.targetCutoff - this.cutoff) * 0.25;
    while (this.nextTime < c.currentTime + LOOKAHEAD) {
      this.play(this.step, this.nextTime);
      this.nextTime += STEP;
      this.step = (this.step + 1) % 16;
      if (this.step === 0) this.bar++;
    }
  };

  Engine.prototype.play = function (s, t) {
    // gentle swing on the off-16ths
    var tt = s % 2 ? t + STEP * 0.06 : t;
    if (s % 4 === 0) { this.kick(t); this.beats.push(t); }
    if (s % 4 === 2) this.hat(tt, 0.55, 0.11);
    else if (s % 2 === 1) this.hat(tt, 0.16 + (s === 15 ? 0.1 : 0), 0.03);
    if ((s === 4 || s === 12) && this.bar % 2 === 1) this.clap(t);
    if (s === 14 && this.bar % 4 === 3) this.clap(t);
    var n = this.pattern[s];
    if (n.gate) this.bass(t, n);
  };

  Engine.prototype.kick = function (t) {
    var c = this.ctx;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(170, t);
    o.frequency.exponentialRampToValueAtTime(52, t + 0.07);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.38);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + 0.003);
    g.gain.setValueAtTime(1, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.44);
    o.connect(g); g.connect(this.bus);
    o.start(t); o.stop(t + 0.46);

    // click transient
    var n = c.createBufferSource(), hp = c.createBiquadFilter(), ng = c.createGain();
    n.buffer = this.noise; hp.type = 'highpass'; hp.frequency.value = 2500;
    ng.gain.setValueAtTime(0.22, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.012);
    n.connect(hp); hp.connect(ng); ng.connect(this.bus);
    n.start(t, Math.random() * 0.5); n.stop(t + 0.02);

    // sidechain feel: duck the bass under the kick
    var v = this.bVca.gain;
    if (v.value > 0.01) { v.setTargetAtTime(v.value * 0.35, t, 0.004); }
  };

  Engine.prototype.hat = function (t, vel, dec) {
    var c = this.ctx;
    var src = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain();
    src.buffer = this.noise;
    hp.type = 'highpass'; hp.frequency.value = 7800;
    g.gain.setValueAtTime(vel * 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dec);
    src.connect(hp); hp.connect(g); g.connect(this.bus);
    if (vel > 0.3) g.connect(this.send);
    src.start(t, Math.random() * 0.8); src.stop(t + dec + 0.02);
  };

  Engine.prototype.clap = function (t) {
    var c = this.ctx;
    var src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
    src.buffer = this.noise;
    bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 1.4;
    g.gain.setValueAtTime(0.0001, t);
    [0, 0.011, 0.022].forEach(function (o) {
      g.gain.setValueAtTime(0.32, t + o);
      g.gain.exponentialRampToValueAtTime(0.03, t + o + 0.009);
    });
    g.gain.setValueAtTime(0.26, t + 0.031);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    src.connect(bp); bp.connect(g); g.connect(this.bus); g.connect(this.send);
    src.start(t, Math.random() * 0.5); src.stop(t + 0.26);
  };

  Engine.prototype.bass = function (t, n) {
    var freq = 55 * Math.pow(2, n.note / 12);
    var p = this.bOsc.frequency, sp = this.bSub.frequency;
    p.cancelScheduledValues(t); sp.cancelScheduledValues(t);
    if (n.slide) { p.setTargetAtTime(freq, t, 0.035); sp.setTargetAtTime(freq / 2, t, 0.035); }
    else { p.setValueAtTime(freq, t); sp.setValueAtTime(freq / 2, t); }

    var base = 90 + Math.pow(this.cutoff, 2.2) * 4200;
    var peak = Math.min(base * (n.accent ? 4.2 : 2.4) + 300, 12000);
    var f = this.bFilt.frequency;
    f.cancelScheduledValues(t);
    f.setValueAtTime(peak, t);
    f.setTargetAtTime(base, t + 0.004, n.accent ? 0.11 : 0.07);
    this.bFilt.Q.setValueAtTime(n.accent ? 17 : 12, t);

    var v = this.bVca.gain;
    v.cancelScheduledValues(t);
    v.setTargetAtTime(n.accent ? 0.34 : 0.22, t, 0.003);
    v.setTargetAtTime(0, t + STEP * (n.slide ? 1.02 : 0.55), 0.018);
  };

  // time-domain signal for the scope (Float32 −1..1)
  Engine.prototype.wave = function () {
    if (!this.analyser) return null;
    this.analyser.getFloatTimeDomainData(this.timeData);
    return this.timeData;
  };

  Engine.prototype.level = function () {
    var d = this.wave();
    if (!d) return 0;
    var s = 0;
    for (var i = 0; i < d.length; i += 4) s += d[i] * d[i];
    return Math.sqrt(s / (d.length / 4));
  };

  Engine.prototype.now = function () { return this.ctx ? this.ctx.currentTime : 0; };

  window.OscEngine = new Engine();
})();

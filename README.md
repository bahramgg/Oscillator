# OSCILLATOR

Website for **Oscillator** — a techno label & artist collective curated by Keyv.

The site is built as an instrument. Every section is a waveform:

| # | Section | Wave | What it is |
|---|---------|------|------------|
| 00 | Power | — | Intro plays the label's "Oscillator Rises" reel (muted, Sound on button, tap to skip, once per session; a drawn version runs if autoplay is blocked; skipped for reduced motion). Hero: neon logo in a rotating OSCILLATOR/ ring, yellow strobe cuts, faint live oscilloscope |
| 01 | Carrier | sine | The label manifesto |
| 02 | Voices | square | The roster as a swipeable reel of cards that also advances by itself every 2 s (pauses on touch, drag or hover), rebuilt from the label's Instagram artist posters (torn-edge photo in hook brackets, stretched vertical name in Rajdhani, symbol + number boxes, logotype); each opens a profile (`#/artist/<slug>`) |
| 03 | Transmissions | saw | Mixes & releases, then **The Oscillator Series**: the label's numbered mixes (#001–#031 from soundcloud.com/oscillatorr, `series` in data.js) as a compact archive; each roster artist's mix also appears on their profile. Play opens the stage: a full-screen now-playing page (blurred cover, spinning disc inside the waveform ring, time readout, ±30 s, tracklist). Minimise to the bottom bar. Audio via hidden SoundCloud widgets |
| 04 | Feedback | noise | The room: the crowd panorama pinned to the screen, panning sideways as you scroll (strips shear with scroll speed), with a running REC timecode; 'the room is THE INSTRUMENT'. Then Keyv's logo on its own in bone white: whole while it sits in view, scroll on and it breaks into particles that fall away downward, scroll back and they fly home; photos in `feedback.media` appear as a grid underneath |
| 05 | Next signal | triangle | Events (shows a "no signal" state when nothing is upcoming); past dates with a `poster` form the "Past signals" archive |
| 06 | Output | pulse | Contact: 'Send a signal' opens a full-screen form (Demo / Booking / Collaboration / Other, fields follow the choice; an artist's profile opens it as a booking for that artist). Submissions go through FormSubmit (`label.form` in data.js) to the label's inbox |

Press **Turn on the signal** and the site generates a techno loop live in the browser
with the Web Audio API (kick, hats, clap, acid bassline — no samples). The scope then
draws the real signal, the mouse's Y position opens the filter, and every artist
profile has its own bassline.

No framework, no build step: plain HTML, CSS and JavaScript. Fonts are self-hosted.

## Run it

```bash
npx serve .          # or: python3 -m http.server
```

Then open the printed local address.

## Edit the content

**Everything lives in [`assets/js/data.js`](assets/js/data.js).** You should never need
to touch the HTML, CSS or other scripts to update the site.

- **Artists** — add an object to `artists`. Put photos in `assets/img/` (black & white
  works best). An artist without a photo automatically gets a generated contour "sigil".
  Roster photos are cropped from the label's Instagram posters (low resolution) — swap in originals when available.
- **Transmissions** — mixes/releases. `soundcloud` is the public track URL; `duration`
  is in seconds; `waveform` is optional.
- **Events** — leave `events: []` for the "no signal" state, or add dates. Past dates with a `poster` appear in the "Past signals" archive.
- **Series** — add a new numbered mix to the top of `series`.
- **Feedback** — `panorama` is the wide image; `media` holds extra photos and `.mp4` videos.
- `*asterisks*` in any text switch to the italic serif accent.
- Empty links (`''`) are hidden automatically.

## Deploy

Live: **https://bahramgg.github.io/Oscillator/**, served by GitHub Pages straight from the
`claude/epic-knuth-vwd8m2` branch (root folder); every push redeploys it within a minute or two.
(It was on Render until the Render workspace was suspended for billing.)

It's a static site — upload the folder to any host (GitHub Pages, Netlify, Cloudflare
Pages, a plain server). For GitHub Pages: *Settings → Pages → Deploy from a branch*.

## Notes

- Instagram requires a login, so the initial content was taken from Keyv's public
  SoundCloud (the DEMONSTRATOR mixes, artwork, portrait, crowd panorama and real
  waveforms). Bio copy is a starting draft — please review it.
- Intro video: `assets/video/oscillator-rises.mp4` (H.264, 1080px, lanczos upscale + light sharpening, ~1.5 MB) with a VP9 `.webm` fallback,
  both cut from the original reel (first 1.2 s of black trimmed, near-blacks crushed to true black, no denoise).
- Logo files (`assets/img/logo-*.png`, favicon, touch icon) are generated from the 2000px originals.
- Colours: ink `#070707`, bone `#e9e7df`, yellow `#e4e418` (from the label logo).
- Fonts (matched to the label's posters and the "Oscillator Rises" reel): Anton, Tenor Sans
  (the KIARASH poster type), Orbitron, Rajdhani (the artist-poster names) — all SIL OFL,
  see [`assets/fonts/LICENSE.md`](assets/fonts/LICENSE.md).
- Tape: highlighted words (`*asterisks*`) and the footer's SIGNAL sit on yellow tape cut by hand in the logo's geometry (angled end cuts, uneven 45° corners, a stepped notch, each strip different), stuck on crooked as they scroll into view.
- The footer logo is cut into strips that slip out of register now and then.
- Respects `prefers-reduced-motion`; works on touch devices (no custom cursor, tap to open).

---

## راهنمای کوتاه (فارسی)

تمام محتوای سایت (آرتیست‌ها، میکس‌ها، ایونت‌ها، عکس‌ها و ویدئوها) فقط در یک فایل است:
`assets/js/data.js`

- برای اضافه کردن آرتیست، یک آیتم به لیست `artists` اضافه کنید و عکسش را در پوشه‌ی `assets/img/` بگذارید.
- عکس آرتیست‌ها از پوسترهای اینستاگرام لیبل برش خورده و کیفیت پایینی دارد؛ هر وقت عکس اصلی رسید جایگزین کنید.
- اگر آرتیستی عکس نداشته باشد، سایت به‌طور خودکار یک طرح گرافیکی مخصوص او می‌سازد.
- برای اجرا روی کامپیوتر: `npx serve .`

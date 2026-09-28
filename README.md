# OSCILLATOR

Website for **Oscillator** — a techno label & artist collective curated by Keyv.

The site is built as an instrument. Every section is a waveform:

| # | Section | Wave | What it is |
|---|---------|------|------------|
| 00 | Power | — | Live oscilloscope + the wordmark, whose letters oscillate in width and weight |
| 01 | Carrier | sine | The label manifesto — words drift in and out of tune as you scroll |
| 02 | Voices | square | The artist roster; each artist opens a full profile (`#/artist/<slug>`) |
| 03 | Transmissions | saw | Mixes & releases with a custom SoundCloud player (click the waveform to seek) |
| 04 | Feedback | noise | Scroll-scrubbed panorama that shears with scroll speed, plus a photo/video sheet |
| 05 | Next signal | triangle | Events (shows a "no signal" state when empty) |
| 06 | Output | pulse | Contact / demos — the headline reacts to the cursor like a theremin |

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
- **Events** — leave `events: []` for the "no signal" state, or add dates.
- **Feedback** — `panorama` is the wide image; `media` holds extra photos and `.mp4` videos.
- `*asterisks*` in any text switch to the italic serif accent.
- Empty links (`''`) are hidden automatically.

## Deploy

It's a static site — upload the folder to any host (GitHub Pages, Netlify, Cloudflare
Pages, a plain server). For GitHub Pages: *Settings → Pages → Deploy from a branch*.

## Notes

- Instagram requires a login, so the initial content was taken from Keyv's public
  SoundCloud (the DEMONSTRATOR mixes, artwork, portrait, crowd panorama and real
  waveforms). Bio copy is a starting draft — please review it.
- Colours: ink `#070707`, bone `#e9e7df`, yellow `#e4e418` (from the label logo).
- Fonts: Anybody (variable width 50–150 %), Instrument Serif, Martian Mono — all SIL OFL,
  see [`assets/fonts/LICENSE.md`](assets/fonts/LICENSE.md).
- Respects `prefers-reduced-motion`; works on touch devices (no custom cursor, tap to open).

---

## راهنمای کوتاه (فارسی)

تمام محتوای سایت (آرتیست‌ها، میکس‌ها، ایونت‌ها، عکس‌ها و ویدئوها) فقط در یک فایل است:
`assets/js/data.js`

- برای اضافه کردن آرتیست، یک آیتم به لیست `artists` اضافه کنید و عکسش را در پوشه‌ی `assets/img/` بگذارید.
- عکس آرتیست‌ها از پوسترهای اینستاگرام لیبل برش خورده و کیفیت پایینی دارد؛ هر وقت عکس اصلی رسید جایگزین کنید.
- اگر آرتیستی عکس نداشته باشد، سایت به‌طور خودکار یک طرح گرافیکی مخصوص او می‌سازد.
- برای اجرا روی کامپیوتر: `npx serve .`

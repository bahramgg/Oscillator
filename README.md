# OSCILLATOR

Website for **Oscillator**, a techno label & artist collective.

The site is built as an instrument, and it is laid out as one system:

- **Type comes from the label's own posters**, one role each (measured against the posters, see
  [`assets/fonts/LICENSE.md`](assets/fonts/LICENSE.md)):
  Six Caps, the compressed headline face of the 2026 event posters (section names, NO SIGNAL, the
  Output line, event titles); League Gothic, the names on the series posters (artist names, mix
  rows, lineups); Teko, the boxed series numbers (every number); Lalezar, the posters' Persian
  (Persian dates); Tenor Sans, the KIARASH poster face (all reading text and labels).
  The hero keeps the reel's ring (Anton) and "We are Oscillator" (Orbitron), cut down to those letters.
- **Every section opens the way the posters open:** its name, closed by a rule. The rule is a wire:
  when the section scrolls in, a pulse of signal runs along it and lights it yellow as it passes;
  while the synth plays, every kick sends another one. The section's number sits at one end of the
  rule and what it holds at the other.
- **Dates are written the way the posters write them**, `OCT.15 . 2026`, and every event carries the
  Persian date beside it (۲۳ مهر ۱۴۰۵, from the browser's Persian calendar). Lineups are names
  joined by dots, as on the posters (`KENZO.POOYAN.LA HERA`).
- **Labels** are one style everywhere (small spaced capitals). **Yellow** means signal: numbers,
  play buttons, the tape, whatever is live. **Text buttons** are hairline pills; **play
  buttons** are yellow circles. External links carry a drawn arrow.

**Pages** are made of the home page's own parts, so the site reads as one piece. Besides the home
page there are three pages with their own addresses, all in the same document so moving between
them never reloads (a mix keeps playing in the bar):
`/artists` (the roster set as a poster lineup, then every poster as the same straight tile as the
home reel; each opens `/artists/<slug>`), `/mixes` (the home page's series continued: the same
latest-mix block and rows, all 31, grouped by year, with a search by artist, date or number; the
series block itself moves into the page, so a playing row keeps its place) and `/events` (every
coming night with its poster as sent, then the "Past signals" wall with the posters' credit line;
any event poster opens full size, uncropped). The home page shows the reel and the latest five
mixes with links to them. Netlify serves `index.html` for these paths (`_redirects`).

| # | Section | What it is |
|---|---------|------------|
| 00 | Power | Intro plays the label's "Oscillator Rises" reel (muted, Sound on button, tap to skip, once per session; a drawn version runs if autoplay is blocked; skipped for reduced motion). Hero: the logo in a rotating OSCILLATOR/ ring, yellow strobe cuts, faint live oscilloscope. The header carries the label's own wordmark (the glyph and the OSCILLATOR logotype from the posters) on a solid band |
| 01 | Carrier | The label manifesto |
| 02 | Voices | The roster as a swipeable reel that also advances by itself every 2 s (pauses on touch, drag or hover). Each card is the artist's own series poster, shown as-is (`poster` in data.js), in series order; an artist without a poster gets a card rebuilt in the poster language from their photo. Each opens a profile (`/artists/<slug>`; old `#/artist/<slug>` links still work) |
| 03 | Transmissions | A featured film from the label's YouTube channel (`video` in data.js; the player loads only when pressed; the site's own controls: timeline, speed 0.5–2×, quality Auto/HD, mute, full screen; on iPhone, where pages can't use the browser's full screen, a full-screen layer that lies the video sideways). Then **The Oscillator Series**: the latest mix large (`transmissions`), then one row per mix (#001–#031 from soundcloud.com/oscillatorr, `series`): number, artist, waveform. Play opens the stage, a full-screen now-playing page with the SoundCloud link (and the video, for mixes that were filmed). Audio via hidden SoundCloud widgets |
| 04 | Feedback | The room: a photo pinned to the screen and travelling as you scroll (a tall one tilts from the ceiling to the floor, a wide one pans across; strips shear with scroll speed), with a running REC timecode; 'the room is THE INSTRUMENT'. Photos in `feedback.media` appear as a grid underneath |
| 05 | Next signal | On the home page the next two nights (and a link to `/events`); when nothing is upcoming, a "no signal" screen (a flat line with a passing blip, NO SIGNAL dimmed in the headline face, the follow button, and a link to the past signals). Past dates with a `poster` form the "Past signals" archive |
| 06 | Output | Contact, a centred close under a still headline (SEND US YOUR SIGNAL, SIGNAL on yellow tape): 'Send a signal' opens a full-screen form (Demo / Booking / Collaboration / Other, fields follow the choice; an artist's profile opens it as a booking for that artist). Submissions go through FormSubmit (`label.form` in data.js) to the label's inbox |

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
  Roster cards show the artists' series posters as-is (`assets/img/posters/`); the black & white photo crops are the fallback.
- **Transmissions** — mixes/releases. `soundcloud` is the public track URL; `duration`
  is in seconds; `waveform` is optional.
- **Events** — leave `events: []` for the "no signal" state, or add dates. Past dates with a `poster` appear in the "Past signals" archive; `designer` names who made the poster (credited above the archive).
- **Series** — add a new numbered mix to the top of `series`.
- **Feedback** — `panorama` is the wide image; `media` holds extra photos and `.mp4` videos.
- `*asterisks*` in any text switch to the italic serif accent.
- Empty links (`''`) are hidden automatically.

## Deploy

Live: **https://wonderful-puffpuff-2bc46d.netlify.app**, a free Netlify site that redeploys from
the `claude/epic-knuth-vwd8m2` branch on every push. (It was on Render until the Render workspace
was suspended for billing.)

It's a static site — upload the folder to any host (GitHub Pages, Netlify, Cloudflare
Pages, a plain server). For GitHub Pages: *Settings → Pages → Deploy from a branch*.

## Notes

- Mixes come from the label's own SoundCloud (soundcloud.com/oscillatorr) and videos from its
  YouTube channel (youtube.com/@oscillator2510). Bio copy is a starting draft — please review it.
- Intro video: `assets/video/oscillator-rises.mp4` (H.264, 1080px, lanczos upscale + light sharpening, ~1.5 MB) with a VP9 `.webm` fallback,
  both cut from the original reel (first 1.2 s of black trimmed, near-blacks crushed to true black, no denoise).
- Logo files (`assets/img/logo-*.png`, favicon, touch icon) are generated from the 2000px originals.
- Colours: ink `#070707`, bone `#e9e7df`, yellow `#e4e418` (from the label logo).
- Fonts: Six Caps, League Gothic, Teko, Lalezar and Tenor Sans, plus the hero's Anton and Orbitron,
  all SIL OFL, self-hosted and cut down to the characters the site uses (about 71 KB together),
  see [`assets/fonts/LICENSE.md`](assets/fonts/LICENSE.md).
- Tape: highlighted words (`*asterisks*`) and the footer's SIGNAL sit on yellow tape cut by hand in the logo's geometry (angled end cuts, uneven 45° corners, a stepped notch, each strip different), stuck on crooked as they scroll into view; on headline-size words the cuts are scaled down so they never bite into the letters.
- Text never moves: headlines and names are set still; only the lines, the trace and the tape move.
- Respects `prefers-reduced-motion`; works on touch devices (no custom cursor, tap to open).

---

## راهنمای کوتاه (فارسی)

تمام محتوای سایت (آرتیست‌ها، میکس‌ها، ایونت‌ها، عکس‌ها و ویدئوها) فقط در یک فایل است:
`assets/js/data.js`

- برای اضافه کردن آرتیست، یک آیتم به لیست `artists` اضافه کنید و عکسش را در پوشه‌ی `assets/img/` بگذارید.
- عکس آرتیست‌ها از پوسترهای اصلی سری لیبل برش خورده و سیاه‌وسفید شده است.
- اگر آرتیستی عکس نداشته باشد، سایت به‌طور خودکار یک طرح گرافیکی مخصوص او می‌سازد.
- برای اجرا روی کامپیوتر: `npx serve .`

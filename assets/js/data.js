/* ==========================================================================
   TEHRAN MOVEMENT: the site's content
   --------------------------------------------------------------------------
   Everything on the site is made from this one file. To update the site you
   should only ever need to edit what is below.

   • Images go in assets/img/ and are named by their path from the site's root.
   • Any link left as '' (empty) is simply hidden.
   • Posters are shown as they are. For a new poster no other file is needed:
     the small copies in the "t" folders only make the pages load faster.
   ========================================================================== */

window.TM = {

  label: {
    name: 'Tehran Movement',
    was: 'Oscillator',          // the name until the rename; shown as "Formerly Oscillator". Leave '' to stop showing it
    handle: '@tehranmovement',
    instagram: 'https://www.instagram.com/tehranmovement/',
    soundcloud: 'https://on.soundcloud.com/1oNQcz1onDKpvNzims',
    youtube: 'https://www.youtube.com/@oscillator2510',
    // the contact form posts here (FormSubmit relays each message to the label's inbox by email)
    form: 'https://formsubmit.co/ajax/info@tehranmovement.com',
    since: 2020,

    // the two lines under the name on the first screen
    what: 'Underground techno from Tehran.',
    line: 'A label and artist collective.',
    // the line that goes with the name wherever the name stands alone (the foot of every page)
    tag: 'Techno label and artist collective. Tehran.',
    // the lines beside the section words
    mixes: 'One DJ each. The series began in 2020 as the Oscillator Series, and the numbers carry on.',
    artists: 'Each poster comes from that artist\'s mix in the series.',
    quiet: 'No date announced yet. New nights are announced first on Instagram.',
    contact: 'Demos, bookings, collaborations. Every message is read.'
  },

  /* ------------------------------------------------------------------------
     ARTISTS
     slug         the address: /artists/<slug>
     num          the number on the artist's poster (their mix in the series);
                  optional: taken from their series mix (osc-031 → 031) when left out
     poster       the artist's series poster, shown as it is on the artist's card and page
     photo        a portrait, used only when there is no poster
          transmissions the ids of the artist's mixes, from the series further down
     videos       { youtube: 'VIDEO_ID', caption: '' }, shown as links to YouTube
     links        instagram / soundcloud / residentadvisor / bandcamp /
                  beatport / spotify / youtube: empty ones are hidden
     ------------------------------------------------------------------------ */
  artists: [
    // Roster in series order (newest first), each with their series poster
    { slug: 'la-hera', name: 'La Hera', poster: 'assets/img/posters/la-hera.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/dj_la_hera/', soundcloud: '' }, transmissions: ['osc-019'], videos: [] },
    { slug: 'kenzo', name: 'Kenzo', poster: 'assets/img/posters/kenzo.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/shayan.kenzo/', soundcloud: '' }, transmissions: ['osc-031'], videos: [] },
    { slug: 'mahyar-arabiyan', name: 'Mahyar Arabiyan', poster: 'assets/img/posters/mahyar-arabiyan.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/mah7arr/', soundcloud: '' }, transmissions: ['osc-030'], videos: [] },
    { slug: 'pooyan', name: 'Pooyan', poster: 'assets/img/posters/pooyan.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/pooyansaadati/', soundcloud: '' }, transmissions: ['osc-029'], videos: [] },
    { slug: 'barbad', name: 'Barbad', poster: 'assets/img/posters/barbad.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-028'], videos: [] },
    { slug: 'del4raa', name: 'Del4raa', poster: 'assets/img/posters/del4raa.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/delara.toyuri/', soundcloud: '' }, transmissions: ['osc-027'], videos: [] },
    { slug: 'kiarash', name: 'Kiarash', poster: 'assets/img/posters/kiarash.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-026'], videos: [] },
    { slug: 'traumatic', name: 'Traumatic', poster: 'assets/img/posters/traumatic.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/trmc.live/', soundcloud: '' }, transmissions: ['osc-025'], videos: [] },
    { slug: 'xaxwave', name: 'Xaxwave', poster: 'assets/img/posters/xaxwave.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-024'], videos: [] },
    { slug: 'badador', name: 'Badador', poster: 'assets/img/posters/badador.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-023'], videos: [] },
    { slug: 'ronin', name: 'Ronin', poster: 'assets/img/posters/ronin.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-022'], videos: [] },
    { slug: 'dynno', name: 'Dynno', poster: 'assets/img/posters/dynno.jpg', role: 'Resident artist', city: 'Tehran', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/dynno.music/', soundcloud: '' }, transmissions: ['osc-021'], videos: [] },
    // #020 and earlier: guests, each with their series poster
    { slug: 'shabi-seyf', name: 'Shabi Seyf', poster: 'assets/img/posters/shabi-seyf.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/shabiseyf/', soundcloud: '' }, transmissions: ['osc-020'], videos: [] },
    { slug: 'natalia-zaneti', name: 'Natalia Zaneti', poster: 'assets/img/posters/natalia-zaneti.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/nataliazaneti/', soundcloud: '' }, transmissions: ['osc-018'], videos: [] },
    { slug: 'araam', name: 'Araam', poster: 'assets/img/posters/araam.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: 'https://www.instagram.com/aramdien/', soundcloud: '' }, transmissions: ['osc-017'], videos: [] },
    { slug: 'farnaz', name: 'Farnaz', poster: 'assets/img/posters/farnaz.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-016'], videos: [] },
    { slug: 'razkod', name: 'RAZKOD', poster: 'assets/img/posters/razkod.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-015'], videos: [] },
    { slug: 'holdkedveset', name: 'HOLDKEDVESET', poster: 'assets/img/posters/holdkedveset.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-014'], videos: [] },
    { slug: 'zola', name: 'Zola', poster: 'assets/img/posters/zola.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-013'], videos: [] },
    { slug: 'pakaniz', name: 'Pakaniz', poster: 'assets/img/posters/pakaniz.jpg', role: '', city: '', photo: '', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: ['osc-012'], videos: [] }
  ],

  /* ------------------------------------------------------------------------
     THE LATEST MIX
     transmissions: a larger cover for the mix shown large (the latest one): { ref: 'osc-031', cover: '…' }.
     A mix that was also filmed carries its YouTube id in the series below (youtube: '…') and gets a Video link.
     ------------------------------------------------------------------------ */
  transmissions: [
    { ref: 'osc-031', cover: 'assets/img/series/031-large.jpg' }
  ],

  /* ------------------------------------------------------------------------
     THE SERIES: the label's numbered mixes on SoundCloud (soundcloud.com/oscillatorr). Newest first.
     They began as the Oscillator Series, so their titles keep that name; the site shows the number and the DJ. 'artist' is a roster slug when
     the DJ is on the roster (the mix then also shows on their profile),
     otherwise the guest's name.
     ------------------------------------------------------------------------ */
  series: [
    { id: 'osc-031', title: 'Oscillator #031', artist: 'kenzo', type: 'Series', date: '2026-08-11', duration: 3147, cover: 'assets/img/series/031.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/031-kenzo', waveform: [0.89,0.89,0.94,0.91,0.49,0.88,0.88,0.97,0.86,0.83,0.84,0.84,0.91,0.9,0.87,0.69,0.85,0.89,0.87,0.9,0.89,0.86,0.88,0.86,0.87,0.89,0.86,0.94,0.88,0.84,0.86,0.84,0.88,0.79,0.84,0.89,0.9,0.9,0.89,0.78,1.0,0.9,0.91,0.91,0.83,0.91,0.91,0.93,0.93,0.91,0.76,0.91,0.93,0.93,0.9,0.9,0.63,0.9,0.94,0.91,0.91,0.84,0.92,0.91,0.92,0.94,0.94,0.93,0.93,0.92,0.94,0.81,0.94,0.94,0.94,0.93,0.66,0.94,0.92,0.78,0.73,0.86,0.91,0.9,0.92,0.94,0.92,0.91,0.89,0.91,0.91,0.92,0.91,0.92,0.9,0.91,0.91,0.91,0.89,0.89,0.91,0.89,0.89,0.89,0.89,0.89,0.9,0.87,0.74,0.89,0.89,0.89,0.89,0.9,0.89,0.89,0.94,0.89,0.88,0.89] },
    { id: 'osc-030', title: 'Oscillator #030', artist: 'mahyar-arabiyan', type: 'Series', date: '2026-07-13', duration: 3535, cover: 'assets/img/series/030.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/030-mahyar-arabiyan', waveform: [0.69,0.86,0.91,0.91,0.89,0.89,0.86,0.87,0.86,0.88,0.92,0.94,0.94,0.93,0.93,0.93,0.96,0.98,0.97,0.96,0.89,0.89,0.87,0.89,0.87,0.88,0.91,0.91,0.89,0.91,0.96,0.91,0.92,0.92,0.92,0.93,0.91,0.93,0.91,0.9,0.9,0.89,0.89,0.89,0.87,0.94,0.93,0.89,0.87,0.89,0.87,0.85,0.96,0.96,0.95,0.95,0.92,0.95,0.95,0.94,0.94,0.92,0.93,0.9,0.89,0.9,0.91,0.94,0.93,0.96,0.92,0.96,0.91,0.91,0.89,0.9,0.89,0.91,0.93,0.93,0.94,0.92,0.93,0.93,0.99,0.96,0.94,0.94,0.93,0.92,0.87,0.9,0.89,1.0,0.94,0.96,0.94,0.96,0.92,0.92,0.91,0.91,0.94,0.94,0.94,0.96,0.97,0.97,0.96,0.96,0.95,0.9,0.89,0.89,0.88,0.87,0.88,0.89,0.88,0.76] },
    { id: 'osc-029', title: 'Oscillator #029', artist: 'pooyan', type: 'Series', date: '2026-07-08', duration: 3824, cover: 'assets/img/series/029.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/pooyan', waveform: [0.69,0.85,0.96,0.99,0.99,1.0,0.99,0.99,0.98,0.98,0.98,0.99,0.99,0.98,0.99,0.99,0.91,0.91,0.91,0.9,0.89,0.91,0.91,0.91,0.92,0.92,0.91,0.91,0.91,0.92,0.92,0.91,0.93,0.91,0.9,0.9,0.9,0.91,0.91,0.91,0.91,0.9,0.97,0.96,0.98,0.97,0.97,0.92,0.91,0.91,0.92,0.92,0.93,0.93,0.94,0.93,0.94,0.93,0.92,0.94,0.93,0.93,0.93,0.92,0.91,0.92,0.93,0.93,0.92,0.92,0.91,0.92,0.93,0.91,0.92,0.9,0.91,0.9,0.9,0.86,0.86,0.86,0.86,0.87,0.86,0.86,0.84,0.84,0.86,0.84,0.85,0.84,0.84,0.82,0.82,0.81,0.81,0.82,0.82,0.94,0.95,0.94,0.95,0.94,0.94,0.94,0.95,0.93,0.95,0.94,0.93,0.93,0.9,0.89,0.88,0.89,0.89,0.91,0.91,0.89] },
    { id: 'osc-028', title: 'Oscillator #028', artist: 'barbad', type: 'Series', date: '2025-12-28', duration: 3538, cover: 'assets/img/series/028.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/028-barbad', waveform: [0.89,0.91,0.91,0.9,0.91,0.91,0.89,0.87,0.89,0.87,0.88,0.91,0.91,0.92,0.91,0.9,0.95,0.94,0.91,0.86,0.86,0.87,0.86,0.86,0.93,0.94,0.94,0.96,0.96,0.96,0.94,0.94,0.9,0.9,0.89,0.89,0.89,0.87,0.89,0.86,0.85,0.86,0.94,0.94,0.93,0.93,0.92,0.92,0.93,0.91,0.91,0.96,0.96,0.92,0.88,0.88,0.89,0.92,0.94,0.94,0.92,0.94,0.93,0.91,0.91,0.9,0.94,0.94,0.94,0.92,0.86,0.86,0.88,0.87,0.88,0.86,0.86,0.82,0.84,0.86,0.91,0.91,0.93,0.91,0.87,0.87,0.84,0.84,0.84,0.96,0.96,0.94,0.96,0.95,0.9,0.93,0.9,0.92,0.93,0.9,0.93,0.91,0.93,0.9,0.86,0.88,0.87,0.88,0.89,0.91,0.96,0.98,0.96,0.98,0.97,0.99,1.0,0.99,0.85,0.86] },
    { id: 'osc-027', title: 'Oscillator #027', artist: 'del4raa', type: 'Series', date: '2025-11-29', duration: 3312, cover: 'assets/img/series/027.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/027-del4raa', waveform: [0.62,0.73,0.77,0.8,0.83,0.89,0.8,0.8,0.81,0.81,0.81,0.81,0.84,0.79,0.81,0.82,0.81,0.81,0.81,0.8,0.78,0.8,0.89,0.85,0.83,0.83,0.94,0.83,0.91,0.8,0.8,0.8,0.8,0.81,0.8,0.8,0.85,0.84,0.89,0.89,0.86,0.86,0.86,0.81,0.84,0.85,0.84,0.84,0.88,0.87,0.87,0.88,0.86,0.88,1.0,0.86,0.84,0.85,0.84,0.84,0.84,0.84,0.84,0.84,0.86,0.85,0.84,0.85,0.85,0.84,0.89,0.85,0.87,0.88,0.85,0.84,0.84,0.85,0.86,0.86,0.86,0.86,0.84,0.84,0.85,0.86,0.81,0.81,0.81,0.79,0.81,0.81,0.81,0.84,0.85,0.82,0.82,0.85,0.84,0.84,0.85,0.86,0.85,0.82,0.85,0.84,0.67,0.81,0.81,0.79,0.82,0.81,0.8,0.79,0.79,0.8,0.79,0.79,0.79,0.79] },
    { id: 'osc-026', title: 'Oscillator #026', artist: 'kiarash', type: 'Series', date: '2025-11-19', duration: 3633, cover: 'assets/img/series/026.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/026-kiarash', waveform: [0.91,0.95,0.95,0.91,0.91,0.91,0.95,0.94,0.95,0.96,0.95,0.94,0.97,0.94,0.94,0.92,0.91,0.9,0.91,0.91,0.89,0.89,0.89,0.91,0.91,0.93,0.89,0.92,0.89,0.91,0.94,0.95,0.96,0.95,0.94,0.94,0.94,0.92,0.91,0.91,0.91,0.91,0.91,0.88,0.87,0.86,0.86,0.94,0.94,0.94,0.93,0.94,1.0,0.96,0.96,0.96,0.94,0.95,0.97,0.99,0.96,0.96,0.96,0.96,0.96,0.96,0.96,0.96,0.96,0.96,0.96,0.94,0.95,0.97,0.98,0.94,0.94,0.95,0.93,0.94,0.95,0.94,0.91,0.91,0.9,0.91,0.91,0.89,0.92,0.93,0.91,0.93,0.9,0.88,0.88,0.87,0.87,0.88,0.88,0.97,0.95,0.94,0.93,0.93,0.94,0.92,0.92,0.91,0.91,0.92,0.92,0.92,0.92,0.92,0.86,0.86,0.89,0.89,0.82,0.87] },
    { id: 'osc-025', title: 'Oscillator #025', artist: 'traumatic', type: 'Series', date: '2025-10-07', duration: 3006, cover: 'assets/img/series/025.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/025-traumatic', waveform: [0.5,0.51,0.84,0.86,0.88,0.86,0.89,0.87,0.89,0.87,0.84,0.79,0.78,0.78,0.77,0.84,0.84,0.83,0.84,0.83,0.81,0.81,0.81,0.82,0.8,0.81,0.81,0.82,0.87,0.87,0.86,0.86,0.84,0.84,0.84,0.84,0.84,0.84,0.84,0.86,0.84,0.86,0.84,0.86,0.87,0.87,0.86,0.86,0.86,0.87,0.84,0.84,0.83,0.82,0.84,0.85,0.86,0.84,0.82,0.82,0.79,0.76,0.79,0.8,0.79,0.79,0.82,0.81,0.79,0.79,0.8,0.79,0.86,0.87,0.89,0.89,0.87,0.9,0.87,0.89,0.89,0.96,0.99,1.0,0.99,0.99,0.94,0.94,0.94,0.86,0.88,0.89,0.82,0.88,0.89,0.87,0.87,0.89,0.87,0.89,0.86,0.95,0.92,0.98,0.97,0.86,0.98,0.96,0.94,0.94,0.96,0.59,0.47,0.56,0.5,0.53,0.54,0.5,0.55,0.5] },
    { id: 'osc-024', title: 'Oscillator #024', artist: 'xaxwave', type: 'Series', date: '2025-09-21', duration: 3677, cover: 'assets/img/series/024.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/024-xaxwave', waveform: [0.92,0.99,0.99,1.0,0.94,0.94,0.93,0.8,0.96,0.95,0.87,0.86,0.9,0.95,0.96,0.97,0.95,0.94,0.97,0.96,0.86,0.93,0.94,0.92,0.9,0.84,0.93,0.92,0.96,0.97,0.96,0.96,0.96,0.97,0.97,0.94,0.94,0.94,0.94,0.95,0.99,0.94,0.93,0.94,0.91,0.91,0.92,0.96,0.95,0.94,0.94,0.96,0.98,0.98,0.98,0.89,0.97,0.98,0.98,0.96,0.96,0.95,0.95,0.91,0.9,0.96,0.94,0.96,0.96,0.95,0.95,0.95,0.94,0.95,0.96,0.96,0.96,0.96,0.96,0.92,0.93,0.93,0.88,0.92,0.93,0.94,0.94,0.95,0.94,0.93,0.95,0.96,0.95,0.96,0.71,0.96,0.86,0.98,0.97,0.99,0.98,0.99,0.97,0.99,0.97,0.96,0.89,0.96,0.96,0.96,0.96,0.81,0.86,0.87,0.85,0.71,0.86,0.86,0.86,0.84] },
    { id: 'osc-023', title: 'Oscillator #023', artist: 'badador', type: 'Series', date: '2025-09-15', duration: 3552, cover: 'assets/img/series/023.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/badador', waveform: [0.69,0.69,0.67,0.57,0.98,0.96,0.96,0.97,0.97,0.93,0.95,0.96,0.94,0.94,0.92,0.91,0.94,0.95,0.94,0.94,0.94,0.94,0.94,0.9,0.92,0.93,0.91,0.94,0.92,0.91,0.91,0.91,0.95,0.94,0.94,0.94,0.95,0.95,0.94,0.95,0.95,0.84,0.95,0.91,0.87,0.91,0.89,0.9,0.89,0.89,0.88,0.89,0.89,0.84,0.87,0.86,0.86,0.86,0.86,0.86,0.92,0.94,0.97,0.96,0.97,1.0,0.98,0.99,0.98,0.98,0.99,0.92,0.94,0.96,0.98,0.94,0.96,0.95,0.96,0.95,0.96,0.95,0.96,0.97,0.96,0.97,0.98,0.99,0.99,0.98,0.94,0.91,0.91,0.94,0.93,0.94,0.95,0.92,0.91,0.91,0.94,0.93,0.93,0.93,0.91,0.89,0.87,0.91,0.89,0.9,0.91,0.96,0.95,0.97,0.94,0.91,0.92,0.94,0.91,0.91] },
    { id: 'osc-022', title: 'Oscillator #022', artist: 'ronin', type: 'Series', date: '2025-09-06', duration: 3791, cover: 'assets/img/series/022.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/ronin', waveform: [0.98,0.99,0.99,0.98,0.99,0.94,0.96,0.98,0.99,0.98,0.94,0.93,0.93,0.92,0.94,0.96,0.96,0.94,0.96,0.95,0.96,0.92,0.94,0.94,0.95,0.95,0.95,0.93,0.98,0.98,0.99,0.99,1.0,0.98,0.93,0.99,0.96,0.98,0.97,0.98,0.97,0.91,0.87,0.91,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.97,0.98,0.96,0.94,0.91,0.89,0.89,0.89,0.9,0.71,0.77,0.9,0.89,0.86,0.91,0.95,0.94,0.94,0.94,0.91,0.97,0.98,0.97,0.97,0.98,0.96,0.95,0.97,0.97,0.96,0.95,0.95,0.95,0.94,0.94,0.94,0.92,0.88,0.95,0.94,0.94,0.94,0.95,0.94,0.96,0.88,0.96,0.97,0.98,0.97,0.97,0.97,0.98,0.93,0.96,0.97,0.98,0.97,0.98,0.97,0.96,0.95,0.96,0.94,0.95] },
    { id: 'osc-021', title: 'Oscillator #021', artist: 'dynno', type: 'Series', date: '2025-09-03', duration: 4414, cover: 'assets/img/series/021.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/021-dynno', waveform: [0.66,0.94,0.92,0.93,0.94,0.87,0.86,0.86,0.86,0.84,0.84,0.84,0.89,0.96,0.94,0.95,0.95,0.96,0.89,0.85,0.87,0.95,0.95,0.94,0.91,0.92,0.93,0.9,0.91,0.91,0.93,0.92,0.89,0.93,0.9,0.91,0.9,0.92,0.9,0.91,0.91,0.94,0.94,0.96,0.96,0.91,0.86,0.61,0.94,0.9,0.94,0.95,0.98,0.98,0.95,0.86,0.89,0.9,0.91,0.86,0.91,0.93,0.96,0.93,0.93,0.91,0.96,0.98,0.96,0.98,0.97,0.97,0.96,0.97,0.91,0.93,0.91,0.95,0.92,0.71,0.79,0.96,0.94,0.97,0.95,0.97,0.99,0.96,1.0,0.99,0.94,0.92,0.91,0.92,0.86,0.93,0.95,0.94,0.91,0.91,0.91,0.98,0.96,0.97,0.96,0.88,0.86,0.66,0.9,0.92,0.85,0.86,0.69,0.8,0.86,0.86,0.86,0.86,0.86,0.87] },
    { id: 'osc-020', title: 'Oscillator #020', artist: 'shabi-seyf', type: 'Series', date: '2022-01-23', duration: 3245, cover: 'assets/img/series/020.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/020-shabi-seyf', waveform: [0.49,0.85,0.63,0.64,0.89,0.89,0.9,0.89,0.89,0.88,0.89,0.9,0.88,0.87,0.85,0.86,0.88,0.87,0.89,0.89,0.86,0.86,0.56,0.89,0.92,0.94,0.93,0.81,0.82,0.82,0.84,0.84,0.86,0.83,0.83,0.83,0.84,0.84,0.92,0.93,0.92,0.93,0.59,0.93,0.93,0.93,0.92,0.93,0.91,0.7,0.79,0.89,0.9,0.7,0.89,0.88,0.89,0.89,0.85,0.72,0.91,0.9,0.92,0.93,0.91,0.9,0.99,0.99,0.99,0.94,0.94,0.99,0.99,0.99,0.99,0.97,0.97,0.97,0.94,0.94,0.9,0.93,0.94,0.94,0.94,0.84,0.94,0.94,0.91,0.91,0.87,0.69,0.91,0.9,0.9,0.9,0.91,1.0,0.98,0.92,0.94,0.94,0.62,0.95,0.94,0.94,0.96,0.92,0.95,0.92,0.91,0.93,0.93,0.91,0.92,0.93,0.93,0.91,0.86,0.71] },
    { id: 'osc-019', title: 'Oscillator #019', artist: 'la-hera', type: 'Series', date: '2022-01-05', duration: 3667, cover: 'assets/img/series/019.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/019-la-hera', waveform: [0.94,0.96,0.98,0.98,0.99,0.96,0.96,0.99,0.99,0.99,0.99,0.99,0.96,0.98,0.97,0.95,0.97,0.98,0.99,0.99,0.98,0.96,0.99,0.99,0.96,0.97,0.97,0.97,0.99,0.99,0.97,0.97,0.98,0.96,0.75,0.76,0.97,0.98,0.98,0.98,0.99,0.99,0.99,0.81,0.99,0.99,0.98,0.99,0.53,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.98,0.69,0.99,0.99,0.99,0.99,0.97,0.99,0.99,0.98,0.97,0.98,0.97,0.94,0.97,0.99,0.97,0.99,0.99,1.0,0.99,0.96,0.88,0.99,0.99,0.98,0.99,0.98,0.96,0.94,0.96,0.95,0.66,0.71,0.94,0.96,0.96,0.96,0.99,0.99,0.99,0.99,0.99,0.99,0.74,0.97,0.99,0.99,0.99,0.99,0.98,0.99,0.99,0.99,0.98,0.99,0.98,0.97,0.94,0.97,0.98,0.99,0.99,0.99] },
    { id: 'osc-018', title: 'Oscillator #018', artist: 'natalia-zaneti', type: 'Series', date: '2021-12-20', duration: 3540, cover: 'assets/img/series/018.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/018-natalia-zaneti', waveform: [0.92,0.91,0.91,0.91,0.94,0.94,0.94,0.93,0.93,0.94,0.59,0.59,0.89,0.93,0.97,0.98,0.94,0.79,0.77,0.95,0.97,0.96,0.75,0.97,1.0,0.9,0.91,0.92,0.92,0.91,0.64,0.92,0.93,0.9,0.9,0.91,0.96,0.96,0.95,0.94,0.74,0.74,0.61,0.71,0.62,0.96,0.96,0.95,0.94,0.89,0.94,0.91,0.91,0.91,0.92,0.92,0.91,0.93,0.92,0.91,0.91,0.91,0.95,0.96,0.97,0.96,0.96,0.64,0.67,0.97,0.96,0.96,0.97,0.96,0.95,0.94,0.82,0.96,0.94,0.91,0.94,0.65,0.91,0.94,0.95,0.98,0.94,0.94,0.94,0.94,0.94,0.78,0.94,0.94,0.94,0.96,0.94,0.93,0.94,0.94,0.93,0.92,0.74,0.82,0.93,0.93,0.95,0.99,0.99,0.98,0.98,0.99,0.99,0.7,0.86,0.97,0.99,0.98,0.98,0.99] },
    { id: 'osc-017', title: 'Oscillator #017', artist: 'araam', type: 'Series', date: '2021-11-04', duration: 3460, cover: 'assets/img/series/017.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/araam', waveform: [0.53,0.76,0.89,0.89,0.9,0.89,0.9,0.9,0.91,0.94,0.96,0.89,0.9,0.93,0.93,0.98,0.98,0.97,0.96,0.96,0.96,0.95,0.96,0.96,0.98,0.98,0.96,0.96,0.96,0.96,0.96,0.96,0.98,0.95,0.95,0.93,0.91,0.89,0.9,0.91,0.91,0.89,0.91,0.96,0.94,0.94,0.94,0.91,0.91,0.99,0.99,0.99,0.99,0.99,0.99,0.96,0.89,0.92,0.93,0.93,0.93,0.91,0.94,0.96,0.89,0.89,0.91,0.97,0.91,0.89,0.88,0.89,0.93,0.94,0.96,0.94,0.94,0.96,0.96,0.93,0.92,0.94,0.93,0.91,0.85,0.84,0.84,0.92,0.94,0.92,0.91,0.91,0.91,0.9,0.9,0.85,0.91,0.92,0.91,0.91,0.91,0.91,0.91,0.9,0.91,0.94,0.92,0.92,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,0.99,1.0,0.99] },
    { id: 'osc-016', title: 'Oscillator #016', artist: 'farnaz', type: 'Series', date: '2021-09-11', duration: 3597, cover: 'assets/img/series/016.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/farnaz', waveform: [0.81,0.94,0.93,0.94,0.92,0.78,0.93,0.92,0.95,0.91,0.92,0.92,0.92,0.91,0.69,0.66,0.92,0.92,0.92,0.97,0.95,0.96,0.97,0.99,0.99,0.96,0.97,0.96,0.95,0.98,0.96,0.69,0.97,0.97,0.96,0.96,0.96,0.96,0.96,0.96,0.98,0.96,0.98,0.96,0.96,0.97,0.98,0.97,0.96,0.97,0.97,0.96,0.97,0.97,0.97,0.96,0.95,0.94,0.93,0.92,0.94,0.95,0.96,0.95,0.96,0.96,0.96,0.96,0.96,0.92,0.93,0.93,0.94,0.94,0.92,0.93,0.92,0.94,0.93,0.93,0.93,0.95,0.94,0.94,0.95,0.95,0.94,0.94,0.92,0.96,0.96,0.96,0.96,0.98,0.96,0.99,0.98,0.99,0.98,0.97,0.96,0.98,0.98,0.98,0.99,0.99,0.99,0.94,0.92,0.91,0.91,0.98,0.99,0.98,0.97,0.98,0.98,0.99,0.99,1.0] },
    { id: 'osc-015', title: 'Oscillator #015', artist: 'razkod', type: 'Series', date: '2021-09-06', duration: 3232, cover: 'assets/img/series/015.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/razkod', waveform: [0.46,0.4,0.53,0.61,0.67,0.74,0.89,0.89,0.88,0.87,0.89,0.88,0.87,0.9,0.89,0.89,0.84,0.86,0.91,0.91,0.91,0.91,0.94,0.97,0.96,0.91,0.88,0.87,0.61,0.91,0.91,0.91,0.91,0.91,0.77,0.98,0.98,0.99,0.95,0.96,0.96,0.95,0.95,0.9,0.9,0.98,0.99,0.99,0.99,0.99,0.98,0.97,0.98,0.98,0.99,0.98,0.99,1.0,0.97,0.97,0.97,0.96,0.99,0.98,0.96,0.96,0.94,0.9,0.9,0.86,0.91,0.9,0.85,0.9,0.92,0.9,0.92,0.91,0.9,0.9,0.91,0.91,0.99,0.98,0.99,0.98,0.98,0.98,0.97,0.92,0.96,0.96,0.95,0.96,0.95,0.95,0.95,0.95,0.94,0.96,0.96,0.96,0.92,0.89,0.89,0.88,0.89,0.87,0.86,0.89,0.89,0.88,0.89,0.91,0.94,0.93,0.93,0.94,0.93,0.91] },
    { id: 'osc-014', title: 'Oscillator #014', artist: 'holdkedveset', type: 'Series', date: '2021-07-31', duration: 7521, cover: 'assets/img/series/014.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/holdkedveset', waveform: [0.91,0.91,0.91,0.91,0.92,0.92,0.89,0.86,0.86,0.93,0.91,0.97,0.97,1.0,0.96,0.91,0.91,0.94,0.91,0.85,0.85,0.88,0.83,0.82,0.86,0.86,0.82,0.82,0.86,0.84,0.83,0.86,0.85,0.86,0.88,0.86,0.9,0.87,0.88,0.83,0.82,0.83,0.78,0.78,0.78,0.79,0.82,0.81,0.76,0.84,0.87,0.88,0.89,0.9,0.88,0.86,0.96,0.96,0.94,0.95,0.96,0.94,0.94,0.93,0.94,0.94,0.66,0.71,0.86,0.92,0.91,0.92,0.95,0.99,0.94,0.83,0.84,0.82,0.84,0.86,0.84,0.91,0.94,0.92,0.94,0.93,0.8,0.87,0.9,0.76,0.91,0.93,0.91,0.86,0.86,0.85,0.79,0.79,0.88,0.86,0.79,0.79,0.89,0.9,0.88,0.89,0.89,0.89,0.89,0.89,0.89,0.91,0.94,0.88,0.87,0.91,0.93,0.91,0.92,0.92] },
    { id: 'osc-013', title: 'Oscillator #013', artist: 'zola', type: 'Series', date: '2021-05-03', duration: 3282, cover: 'assets/img/series/013.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/zola', waveform: [0.91,0.94,0.95,0.94,0.95,0.92,0.94,0.92,0.94,0.96,0.93,0.96,0.96,0.94,0.96,0.9,0.92,0.91,0.91,0.91,0.81,0.76,0.81,0.8,0.84,0.85,0.82,0.84,0.84,0.84,0.81,0.79,0.83,0.87,0.84,0.84,0.82,0.81,0.79,0.74,0.91,0.95,0.94,0.94,0.98,0.96,0.94,0.99,0.93,0.99,0.97,0.93,0.95,0.94,0.94,0.91,0.94,0.9,0.69,0.91,0.89,0.91,0.89,0.86,0.88,0.91,0.89,0.81,0.89,0.89,0.89,0.89,0.96,0.98,0.96,0.96,0.96,0.99,0.95,0.96,0.96,0.99,0.97,0.99,0.93,0.98,0.95,0.96,1.0,0.99,0.94,0.91,0.94,0.92,0.95,0.92,0.88,0.84,0.85,0.84,0.86,0.86,0.81,0.89,0.84,0.86,0.86,0.9,0.88,0.87,0.88,0.89,0.9,0.9,0.9,0.94,0.93,0.9,0.9,0.89] },
    { id: 'osc-012', title: 'Oscillator #012', artist: 'pakaniz', type: 'Series', date: '2021-04-10', duration: 2753, cover: 'assets/img/series/012.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/pakaniz', waveform: [0.79,0.86,0.99,0.98,0.94,0.96,0.96,0.95,0.95,0.91,0.93,0.96,0.96,0.95,0.65,0.96,0.96,0.96,0.96,0.96,0.96,0.96,0.84,0.86,0.85,0.84,0.85,0.85,0.85,0.85,0.85,0.91,0.91,0.91,0.91,0.91,0.91,0.9,0.91,0.9,0.91,0.91,0.91,0.91,0.64,0.89,0.89,0.89,0.89,0.59,0.58,0.89,0.9,0.89,0.89,0.89,0.88,0.9,0.88,0.96,0.96,0.98,0.97,0.99,0.98,0.98,1.0,0.99,0.99,0.99,0.99,0.6,0.56,0.57,0.95,0.95,0.94,0.94,0.94,0.81,0.83,0.95,0.94,0.96,0.95,0.95,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.94,0.9,0.89,0.93,0.91,0.91,0.89,0.94,0.59,0.56,0.87,0.88,0.88,0.88,0.88,0.88,0.88,0.88,0.88,0.89,0.89,0.89,0.89] },
    { id: 'osc-011', title: 'Oscillator #011', artist: 'Maram', type: 'Series', date: '2021-03-15', duration: 3077, cover: 'assets/img/series/011.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/maram', youtube: 'VYurLarL5Sw', waveform: [0.87,0.89,0.92,0.93,0.92,0.93,0.92,0.99,0.96,0.97,0.98,0.97,0.97,0.97,0.96,0.93,0.95,0.94,0.95,0.96,0.94,0.95,0.94,0.97,0.98,0.97,0.99,0.99,0.97,0.69,0.97,0.96,0.99,0.99,0.97,0.96,0.96,1.0,0.99,0.96,0.96,0.95,0.94,0.93,0.92,0.93,0.64,0.66,0.95,0.97,0.66,0.96,0.98,0.98,0.98,0.99,0.91,0.96,0.94,0.96,0.96,0.94,0.98,0.94,0.94,0.96,0.96,0.96,0.96,0.96,0.91,0.91,0.91,0.89,0.91,0.93,0.91,0.96,0.96,0.96,0.96,0.96,0.94,0.94,0.94,0.94,0.95,0.96,0.96,0.99,0.99,0.99,0.97,0.96,0.96,0.93,0.93,0.94,0.92,0.91,0.69,0.94,0.91,0.94,0.95,0.94,0.95,0.91,0.94,0.95,0.95,0.97,0.96,0.98,0.99,0.98,0.97,0.97,0.99,0.96] },
    { id: 'osc-010', title: 'Oscillator #010', artist: 'Blacktextured', type: 'Series', date: '2021-02-21', duration: 3468, cover: 'assets/img/series/010.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/blacktextured', waveform: [0.62,0.99,0.99,0.99,0.97,0.98,0.98,0.97,0.79,0.99,1.0,0.9,0.91,0.91,0.91,0.91,0.93,0.72,0.9,0.93,0.92,0.92,0.92,0.93,0.93,0.94,0.95,0.93,0.91,0.93,0.92,0.96,0.95,0.94,0.95,0.94,0.94,0.74,0.96,0.95,0.88,0.9,0.9,0.87,0.88,0.89,0.89,0.86,0.87,0.91,0.91,0.91,0.88,0.88,0.9,0.78,0.89,0.89,0.91,0.89,0.87,0.87,0.86,0.89,0.84,0.86,0.86,0.86,0.86,0.86,0.86,0.86,0.85,0.85,0.84,0.84,0.86,0.84,0.84,0.84,0.85,0.85,0.86,0.85,0.84,0.89,0.9,0.91,0.9,0.9,0.9,0.89,0.64,0.89,0.89,0.89,0.9,0.9,0.89,0.78,0.89,0.89,0.61,0.9,0.89,0.89,0.89,0.64,0.89,0.96,0.96,0.98,0.99,0.94,0.96,0.96,0.96,0.94,0.96,0.94] },
    { id: 'osc-009', title: 'Oscillator #009', artist: 'Nyctophilia', type: 'Series', date: '2021-02-14', duration: 3089, cover: 'assets/img/series/009.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/nyctophilia', youtube: 'BoNZnhLXuRs', waveform: [0.35,0.93,0.95,0.94,0.94,0.92,0.94,0.94,0.93,0.9,0.93,0.93,0.95,0.94,0.97,0.94,0.96,0.94,0.94,0.94,0.94,0.95,0.96,0.94,0.91,0.94,0.94,0.82,0.93,0.94,0.94,0.93,0.91,0.69,0.91,0.9,0.93,0.97,0.98,0.99,0.98,0.96,0.96,0.69,0.95,0.94,0.95,0.98,0.99,0.96,0.94,0.52,0.97,1.0,0.99,0.99,0.99,0.99,0.99,0.95,0.99,0.99,0.99,0.99,0.94,0.99,0.97,0.81,0.98,0.96,0.95,0.6,0.96,0.95,0.94,0.94,0.94,0.95,0.94,0.94,0.94,0.91,0.91,0.93,0.93,0.86,0.94,0.96,0.96,0.95,0.96,0.96,0.96,0.96,0.96,0.97,0.94,0.95,0.96,0.91,0.94,0.95,0.96,0.96,0.94,0.93,0.93,0.94,0.94,0.93,0.89,0.91,0.89,0.88,0.89,0.91,0.91,0.92,0.94,0.93] },
    { id: 'osc-008', title: 'Oscillator #008', artist: 'Bruna Belter', type: 'Series', date: '2021-01-30', duration: 4244, cover: 'assets/img/series/008.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/bruna-belter', waveform: [0.95,0.94,0.94,0.92,0.91,0.93,0.93,0.87,0.9,0.87,0.87,0.89,0.86,0.98,0.88,0.86,0.87,0.87,0.87,0.84,0.88,0.9,0.96,0.97,0.96,0.97,0.87,0.88,0.86,0.86,0.9,0.77,0.86,0.86,0.92,0.94,0.95,0.94,0.93,0.92,0.91,0.89,0.94,0.91,0.93,0.96,0.96,0.94,0.96,0.96,0.96,0.98,0.96,0.95,0.96,0.94,0.95,0.94,0.89,0.93,0.94,0.91,0.87,0.89,0.89,0.86,0.89,0.89,0.88,0.94,0.94,0.94,0.95,0.94,0.93,0.92,0.95,0.94,0.93,0.92,0.94,0.94,0.92,0.95,0.96,0.96,0.95,0.95,0.95,0.94,0.95,0.96,0.96,0.96,0.97,0.97,0.96,0.97,0.96,0.95,0.99,0.97,0.88,0.84,0.94,0.97,0.98,0.96,0.97,0.96,0.96,0.96,0.97,0.99,0.99,0.99,0.99,0.99,1.0,0.99] },
    { id: 'osc-007', title: 'Oscillator #007', artist: 'Vedad', type: 'Series', date: '2020-12-02', duration: 3476, cover: 'assets/img/series/007.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/vedad', youtube: 'W0dFRji2BWY', waveform: [0.51,0.6,0.81,0.81,0.83,0.81,0.82,0.83,0.83,0.83,0.81,0.83,0.81,0.81,0.65,0.84,0.83,0.86,0.84,0.34,0.84,0.85,0.85,0.88,0.86,0.87,0.89,0.89,0.88,0.89,0.91,0.91,0.89,0.88,0.9,0.89,0.89,0.98,0.93,0.89,0.94,0.98,0.97,0.99,0.99,0.98,0.8,0.8,0.81,0.82,0.81,0.81,0.81,0.81,0.8,0.8,0.94,0.91,0.91,0.91,0.93,0.91,0.91,0.91,0.9,0.91,0.86,0.86,0.86,0.84,0.63,0.91,0.92,0.91,0.91,0.94,0.96,0.95,0.97,0.94,0.94,0.93,0.96,0.97,0.95,0.93,0.92,0.9,0.85,0.89,0.86,0.88,0.86,0.86,0.86,0.84,0.89,0.89,0.91,0.91,0.94,0.9,0.92,0.91,0.87,0.87,0.86,0.86,0.88,0.86,0.86,0.92,0.94,0.93,0.51,0.99,0.99,1.0,0.95,0.52] },
    { id: 'osc-006', title: 'Oscillator #006', artist: 'Keyv B2B Amiri', type: 'Series', date: '2020-11-03', duration: 7043, cover: 'assets/img/series/006.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/keyv-b2b-amiri', youtube: 'POCYIXH-Hp4', waveform: [0.44,0.89,0.88,0.89,0.88,0.9,0.91,0.94,0.93,0.91,0.93,0.89,0.86,0.86,0.85,0.85,0.88,0.86,0.84,0.81,0.82,0.91,0.92,0.91,0.94,0.94,0.94,0.94,0.91,0.89,0.89,0.94,0.93,0.91,0.6,0.87,0.95,0.96,0.96,0.96,0.96,0.9,0.91,0.91,0.91,0.99,0.98,0.99,0.74,0.98,1.0,0.93,0.96,0.97,0.91,0.96,0.98,0.99,0.93,0.93,0.89,0.9,0.91,0.91,0.92,0.91,0.95,0.95,0.92,0.94,0.92,0.94,0.93,0.94,0.94,0.91,0.91,0.94,0.93,0.94,0.94,0.93,0.93,0.93,0.93,0.94,0.91,0.93,0.94,0.94,0.87,0.94,0.85,0.87,0.87,0.95,0.91,0.92,0.8,0.71,0.96,0.97,0.94,0.91,0.89,0.9,0.9,0.94,0.66,0.91,0.91,0.93,0.91,0.92,0.94,0.91,0.91,0.92,0.89,0.88] },
    { id: 'osc-005', title: 'Oscillator #005', artist: 'Fallz', type: 'Series', date: '2020-10-25', duration: 3559, cover: 'assets/img/series/005.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/fallz', waveform: [0.24,0.94,0.95,0.94,0.93,0.93,0.93,0.93,0.97,0.97,0.98,0.96,0.59,0.95,0.94,0.94,0.94,0.91,0.94,0.91,0.94,0.94,0.95,0.92,0.93,0.92,0.92,0.95,0.96,0.95,0.94,0.99,1.0,0.99,0.99,0.99,0.99,0.64,0.99,0.99,0.99,0.99,0.96,0.94,0.96,0.96,0.94,0.92,0.87,0.86,0.9,0.88,0.86,0.86,0.92,0.93,0.92,0.91,0.91,0.96,0.96,0.95,0.95,0.95,0.95,0.87,0.84,0.81,0.79,0.83,0.79,0.88,0.88,0.87,0.87,0.86,0.94,0.89,0.89,0.89,0.89,0.84,0.83,0.83,0.83,0.83,0.9,0.91,0.92,0.93,0.93,0.93,0.89,0.88,0.86,0.85,0.85,0.88,0.89,0.89,0.87,0.86,0.89,0.89,0.9,0.92,0.92,0.91,0.91,0.92,0.91,0.91,0.81,0.8,0.8,0.8,0.8,0.79,0.82,0.83] },
    { id: 'osc-004', title: 'Oscillator #004', artist: 'Fardin Ameri', type: 'Series', date: '2020-10-13', duration: 4001, cover: 'assets/img/series/004.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/fardin-ameri', youtube: 'KTl0FLSyqpA', waveform: [0.66,0.61,0.74,0.82,0.91,0.86,0.83,0.81,0.85,0.89,0.9,0.9,0.75,0.82,0.85,0.84,0.84,0.81,0.85,0.82,0.79,0.77,0.86,0.94,0.88,0.91,0.94,0.9,0.88,0.91,0.86,0.86,0.87,0.88,0.91,0.92,0.86,0.9,0.9,0.9,0.92,0.88,0.79,0.79,0.79,0.83,0.77,0.73,0.74,0.89,0.98,0.98,0.98,0.96,0.97,0.97,0.97,0.99,1.0,0.98,0.99,0.99,0.98,0.99,0.86,0.89,0.8,0.81,0.87,0.88,0.88,0.9,0.89,0.91,0.87,0.85,0.85,0.9,0.91,0.86,0.92,0.89,0.91,0.94,0.93,0.92,0.92,0.81,0.66,0.81,0.79,0.81,0.82,0.89,0.9,0.91,0.87,0.86,0.88,0.88,0.83,0.96,0.91,0.92,0.89,0.83,0.89,0.89,0.89,0.91,0.93,0.86,0.86,0.77,0.87,0.86,0.86,0.85,0.86,0.85] },
    { id: 'osc-003', title: 'Oscillator #003', artist: 'Daimonic', type: 'Series', date: '2020-10-05', duration: 3568, cover: 'assets/img/series/003.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/daimonic', youtube: '01olKAimRvY', waveform: [0.96,0.97,0.96,0.96,0.97,0.96,0.97,0.97,0.96,0.98,0.98,0.97,0.98,0.89,0.96,0.96,0.97,0.96,0.99,0.98,0.98,0.98,0.98,0.96,0.98,0.99,0.99,1.0,0.99,0.98,0.98,0.99,0.98,0.98,0.72,0.98,0.97,0.96,0.94,0.97,0.99,0.99,0.98,0.94,0.96,0.95,0.95,0.96,0.95,0.96,0.96,0.96,0.96,0.96,0.55,0.95,0.96,0.96,0.94,0.88,0.93,0.94,0.95,0.92,0.94,0.94,0.94,0.94,0.94,0.98,0.98,0.98,0.98,0.97,0.99,0.99,0.97,0.97,0.97,0.97,0.97,0.95,0.95,0.94,0.95,0.94,0.96,0.96,0.95,0.96,0.94,0.96,0.97,0.95,0.95,0.95,0.94,0.94,0.94,0.91,0.9,0.91,0.91,0.92,0.94,0.91,0.93,0.91,0.94,0.99,0.98,0.96,0.89,0.98,0.99,0.97,0.99,0.98,0.99,0.91] },
    { id: 'osc-002', title: 'Oscillator #002', artist: 'Armin K', type: 'Series', date: '2020-09-12', duration: 4256, cover: 'assets/img/series/002.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/armin-k', youtube: 'nMfXXrolN6Q', waveform: [0.98,0.97,0.96,0.97,0.97,0.63,0.88,0.86,0.84,0.91,0.93,0.88,0.91,0.85,0.9,0.91,0.9,0.89,0.91,0.86,0.88,0.88,0.87,0.93,0.91,0.91,0.96,0.96,0.95,0.96,0.97,0.99,0.99,0.96,0.99,0.97,0.99,0.98,0.98,0.86,0.87,0.89,0.89,0.86,0.89,0.96,0.97,0.95,0.94,0.95,0.69,0.88,0.89,0.72,0.96,0.94,0.94,0.77,0.96,0.94,0.94,0.9,0.97,0.95,0.95,0.93,0.93,0.97,0.96,0.93,0.89,0.89,0.89,0.89,0.9,0.91,0.94,0.94,0.94,0.94,0.95,0.92,0.94,0.96,0.94,0.95,0.92,0.95,0.93,0.91,0.88,0.91,0.99,0.99,0.98,0.89,0.89,0.91,0.9,0.91,1.0,0.99,0.98,0.99,0.69,0.67,0.99,0.99,0.98,0.88,0.94,0.91,0.91,0.98,0.95,0.94,0.91,0.89,0.98,0.96] },
    { id: 'osc-001', title: 'Oscillator #001', artist: 'Borna Farshid', type: 'Series', date: '2020-09-01', duration: 4443, cover: 'assets/img/series/001.jpg', soundcloud: 'https://soundcloud.com/oscillatorr/borna-farshid', waveform: [0.97,0.96,0.97,0.97,0.96,0.96,0.97,0.95,0.93,0.95,0.86,0.88,0.86,0.89,0.94,0.86,0.89,0.79,0.84,0.84,0.89,0.95,0.95,0.98,0.93,0.94,0.94,0.96,0.96,0.99,0.98,0.98,0.98,0.98,0.98,0.97,0.96,0.96,0.98,1.0,0.96,0.94,0.98,0.98,0.96,0.97,0.96,0.96,0.96,0.96,0.94,0.94,0.95,0.96,0.94,0.95,0.94,0.94,0.95,0.84,0.85,0.84,0.89,0.86,0.94,0.95,0.94,0.94,0.94,0.95,0.95,0.95,0.95,0.96,0.96,0.96,0.96,0.92,0.96,0.96,0.96,0.97,0.96,0.95,0.96,0.94,0.95,0.94,0.94,0.94,0.94,0.92,0.97,0.95,0.96,0.97,0.96,0.95,0.96,0.97,0.96,0.96,0.94,0.92,0.94,0.94,0.94,0.96,0.96,0.94,0.89,0.91,0.88,0.89,0.91,0.92,0.94,0.89,0.85,0.78] }
  ],
  /* ------------------------------------------------------------------------
     NIGHTS (on the home page: the coming ones and the latest posters; all of them on /events).
     With no coming date the site says so and points to Instagram. Posters go in assets/img/events/.
     { date: '2026-11-14', title: 'Night 01', venue: 'Secret location', city: 'Tehran',
       lineup: ['kenzo', 'pooyan', 'Guest Name'], poster: 'assets/img/events/2026-11-14.jpg',
       link: 'https://…', linkLabel: 'Tickets', designer: 'Erfan Jamshidi' }
     lineup takes artist slugs (they link to the artist) or plain names; link / linkLabel are optional.
     designer: who made the poster (credited under the posters).
     Dates are shown the way the posters write them, OCT.15 . 2026, next to the Persian date.
     Dates that have passed move by themselves into the past nights on /events.
     Every poster opens whole when tapped. Posters are shown as they are: never cropped or recoloured.
     more:   further posters of the same event (shown under its line-up; made like the first: dev\event-poster.js).
     motion: the poster as a short film, 'assets/video/<date>.mp4' (made by dev\video.ps1), with a still of it beside it under the
             same name as .webp. The event's page shows the still; the film loads and sounds only when the visitor plays it.
     What is written here is what the posters themselves say (date, names, designer).
     ------------------------------------------------------------------------ */
  events: [
    { date: '2026-10-15', title: 'All Night in Hell', lineup: ['Keyv', 'Erfa (opening)'],
      poster: 'assets/img/events/2026-10-15-all-night-in-hell.jpg', designer: 'Erfan Jamshidi' },
    { date: '2026-09-10', title: 'Tehran Underground x Oscillator',
      lineup: ['Keyv', 'ronin', 'Nastish', 'Kuttle', 'Neevak', 'dynno', 'Srvsh.iv', 'Therapist', 'Aivy'],
      poster: 'assets/img/events/2026-09-10-tehran-underground.jpg', designer: 'Erfan Jamshidi' },
    { date: '2026-08-27', title: 'All Night Long', lineup: ['Keyv', 'Msiyan'],
      poster: 'assets/img/events/2026-08-27-all-night-long.jpg', designer: 'Erfan Jamshidi' },
    { date: '2026-07-23', title: 'All Night Long', lineup: ['Keyv'],
      poster: 'assets/img/events/2026-07-23-all-night-long.jpg', designer: 'Erfan Jamshidi' },
    { date: '2026-06-11', title: 'All Night Long', lineup: ['Keyv'],
      poster: 'assets/img/events/2026-06-11-all-night-long.jpg', designer: 'Erfan Jamshidi' },
    { date: '2025-08-28', title: 'Oscillator', lineup: ['Keyv', 'Elfa (visual)'],
      poster: 'assets/img/events/2025-08-28-oscillator.jpg', designer: 'Erfan Jamshidi' },
    { date: '2023-09-14', title: 'Oscillator', lineup: ['Keyv', 'Hamed', 'Nycto', 'Sosu'],
      poster: 'assets/img/events/2023-09-14-oscillator.jpg', designer: 'Erfan Jamshidi', motion: 'assets/video/2023-09-14.mp4' },
    { date: '2023-08-17', title: 'Oscillator', lineup: ['Gia', 'Medo', 'Daimonic', 'Hamed', 'Keyv'],
      poster: 'assets/img/events/2023-08-17-oscillator.jpg', designer: 'Erfan Jamshidi' },
    { date: '2023-08-03', title: 'Oscillator', lineup: ['dynno', 'Nevak', 'Hamed', 'Keyv'],
      poster: 'assets/img/events/2023-08-03-oscillator.jpg', designer: 'Erfan Jamshidi', motion: 'assets/video/2023-08-03.mp4',
      more: ['assets/img/events/2023-08-03-oscillator-2.jpg'] },
    { date: '2023-07-13', title: 'Oscillator', lineup: ['Keyv', 'Hamed', 'Del4raa b2b Mah7arr'],
      poster: 'assets/img/events/2023-07-13-oscillator.jpg', designer: 'Erfan Jamshidi', motion: 'assets/video/2023-07-13.mp4' },
    { date: '2023-03-09', title: 'The Last Event of the Year', lineup: ['Hamed', 'Siamo', 'Keyv'],
      poster: 'assets/img/events/2023-03-09-the-last-event-of-the-year.jpg', designer: 'Erfan Jamshidi', motion: 'assets/video/2023-03-09.mp4' }
  ],

  /* ------------------------------------------------------------------------
     THE ROOM (/room, entered from "The room" on the home page): a corridor walked like a room, hung with photographs of Keyv's
     nights in black and white: the newest first, and the photographs of one night in the order they were taken. Keyv sent them to
     the label (2026-11-25, and five more on 2026-11-26 in place of the first two, the last two and the hooks close up). They are in
     assets/img/room/, each one twice: for the wall, and larger in full/ for when it is opened.
     image, full  the photograph on the wall, and the larger one for when it is opened
     taken        when it was taken, 'YYYY-MM-DD HH:MM', as the camera wrote it
     night        the date of a night above, when it was taken at one: the night's name, line-up and page come from there
                  (a night with no image of its own shows its poster)
     title        its name; date ('YYYY-MM' when only the month is known) when there is no night and no time it was taken
     alt          what the photograph shows, for those who cannot see it
     kind, who    the small line under the name: what it was, and with whom (for a night: the night's name)
     sub          the line under the name when it is open
     say          one or two sentences
     rows         more [label, value] pairs for when it is open (the night, its line-up and when it was taken are written already)
     link, linkLabel   where the whole thing is (a night links to its page)
     ig           the post on Instagram, when there is one
     ------------------------------------------------------------------------ */
  room: [
    { title: 'No Smoking', taken: '2023-09-01 04:19',
      image: 'assets/img/room/2023-09-01-0419.webp', full: 'assets/img/room/full/2023-09-01-0419.webp',
      alt: 'A dark corridor ending at a steel door with four No Smoking signs on it, light coming round its edges, and a poster with KEYV on it on the wall',
      sub: 'Four signs on one steel door',
      say: 'The end of a dark corridor: one steel door, No Smoking four times over, light leaking round its edges, and KEYV on the poster beside it. The sound is on the other side.' },
    { night: '2023-08-17', title: 'Under the Hooks', taken: '2023-08-18 02:21',
      image: 'assets/img/room/2023-08-18-0221.webp', full: 'assets/img/room/full/2023-08-18-0221.webp',
      alt: 'Rows of steel hooks hanging over a tiled wall with posters on it, three people walking past',
      sub: 'Steel overhead, posters on the tiles',
      say: 'Steel hooks in rows off the ceiling, the label’s posters along the tiles underneath, and the night walking past in between.' },
    { night: '2023-08-17', title: 'Club Door', taken: '2023-08-18 04:33',
      image: 'assets/img/room/2023-08-18-0433.webp', full: 'assets/img/room/full/2023-08-18-0433.webp',
      alt: 'A steel door covered in stickers, one of them CLUB, the night’s poster on the wall beside it and someone standing in the doorway',
      sub: 'Stickers on the steel',
      say: 'The steel door stickered over, CLUB in big letters, the night’s own poster pasted up beside it, and someone standing in the doorway.' },
    { night: '2023-08-03', title: 'Two at the Table', taken: '2023-08-04 01:24',
      image: 'assets/img/room/2023-08-04-0124.webp', full: 'assets/img/room/full/2023-08-04-0124.webp',
      alt: 'Two DJs behind a table of gear, cables and bottles, seen from above',
      sub: 'One table, four hands',
      say: 'One table, two DJs: the mixer in the middle, a player either side, cables all over and the bottles standing by.' },
    { night: '2023-08-03', title: 'From the Floor', taken: '2023-08-04 01:38',
      image: 'assets/img/room/2023-08-04-0138.webp', full: 'assets/img/room/full/2023-08-04-0138.webp',
      alt: 'The room from the floor: two DJs at the far wall between speakers on stands, a steel frame with lights above them, heads in front',
      sub: 'Speakers, the frame, the heads',
      say: 'Fourteen minutes later, from the floor: speakers up on stands, the steel frame with its lights, two at the decks against the far wall, and nothing between them and the heads but a table.' },
    { night: '2023-08-03', title: 'White Tee', taken: '2023-08-04 04:16',
      image: 'assets/img/room/2023-08-04-0416.webp', full: 'assets/img/room/full/2023-08-04-0416.webp',
      alt: 'A DJ in a white T-shirt and a cap, headphones round the neck, dancing at the decks with the crowd close around',
      sub: 'Cap down, headphones round the neck',
      say: 'A white tee, a cap pulled low, a fist up, the crowd pressed right against the decks, and the gear in front gone to streaks of light.' },
    { night: '2023-08-03', title: 'Straight Lines', taken: '2023-08-04 05:20',
      image: 'assets/img/room/2023-08-04-0520.webp', full: 'assets/img/room/full/2023-08-04-0520.webp',
      alt: 'Laser beams running down the middle of a packed narrow room toward a bright light, hooks on rails along the ceiling',
      sub: 'Lasers down the middle of the room',
      say: 'Near dawn, and the lasers still run straight down the middle of the room: the hooks on their rails overhead, speakers either side, every head turned to the light.' },
    { night: '2023-08-03', title: '6 in the Morning', taken: '2023-08-04 06:08',
      image: 'assets/img/room/2023-08-04-0608.webp', full: 'assets/img/room/full/2023-08-04-0608.webp',
      alt: 'The crowd with hands in the air around the DJ in the white T-shirt and the cap, someone clapping at the front',
      sub: 'The hands still up',
      say: 'The hands are still up: a pair clapping right at the decks, a smile at the front, and the white tee still at it.' },
    { night: '2023-08-03', title: 'Ink', taken: '2023-08-04 06:09',
      image: 'assets/img/room/2023-08-04-0609.webp', full: 'assets/img/room/full/2023-08-04-0609.webp',
      alt: 'A DJ head down over the mixer in a packed crowd, a fan open above them and a tattooed arm raised in front',
      sub: 'A tattooed arm up, head down at the mixer',
      say: 'One minute later. A tattooed arm thrown up in front of the lens, a fan open over the crowd, and the head down over the mixer.' },
    { night: '2023-07-13', title: 'Shades at Four', taken: '2023-07-14 04:02',
      image: 'assets/img/room/2023-07-14-0402.webp', full: 'assets/img/room/full/2023-07-14-0402.webp',
      alt: 'A crowd seen from behind the DJ in a narrow room, some in sunglasses, a beam of light across a ceiling of hooks on rails',
      sub: 'The room, from behind the decks',
      say: 'Four in the morning, seen from behind the decks: a beam across the ceiling, the hooks in their rows, the crowd pressed close, and sunglasses on in the dark.' },
    { night: '2023-07-13', title: 'Caught in the Beam', taken: '2023-07-14 04:33',
      image: 'assets/img/room/2023-07-14-0433.webp', full: 'assets/img/room/full/2023-07-14-0433.webp',
      alt: 'A DJ in a cap at the decks, beams of light cutting across the dark',
      sub: 'Beams across the decks',
      say: 'Two beams cut across the dark and land on the decks: a cap, a beard, both hands on the mixer.' },
    { night: '2023-07-13', title: 'Door Left Open', taken: '2023-07-14 07:13',
      image: 'assets/img/room/2023-07-14-0713.webp', full: 'assets/img/room/full/2023-07-14-0713.webp',
      alt: 'A heavy steel door standing open in a tiled stone wall, the night’s poster on it',
      sub: 'The night’s poster, still on the door',
      say: 'Morning. The heavy steel door stands open onto the dark, and the night’s poster is still on it.' },
    { night: '2023-07-13', title: 'Still Here', taken: '2023-07-14 07:33',
      image: 'assets/img/room/2023-07-14-0733.webp', full: 'assets/img/room/full/2023-07-14-0733.webp',
      alt: 'Beams of light crossing over the dark shapes of the crowd',
      sub: 'Light over the heads',
      say: 'Broad day outside by now, and in here the beams are still crossing over the heads.' },
    { title: 'Full House', taken: '2023-06-30 00:40',
      image: 'assets/img/room/2023-06-30-0040.webp', full: 'assets/img/room/full/2023-06-30-0040.webp',
      alt: 'From behind a DJ in a cap and headphones on a raised stage, a crowd filling the space below a steel truss, buildings and stairs around it',
      sub: 'The whole place, seen from the decks',
      say: 'Twenty to one and the place is full to the walls: a cap and a pair of headphones at the decks, a steel truss overhead, and heads as far back as the stairs.' },
    { title: 'Through the Fence', taken: '2023-05-26 07:31',
      image: 'assets/img/room/2023-05-26-0731.webp', full: 'assets/img/room/full/2023-05-26-0731.webp',
      alt: 'Through a chain-link fence: someone dancing with eyes closed and head tipped back beside a DJ with both hands on the decks',
      sub: 'A morning set behind the wire',
      say: 'Half past seven in the morning, and nobody has noticed. Through the wire: eyes shut, head back, lost in it, and both hands on the decks.' },
    { title: 'Wire and Smoke', taken: '2023-05-26 08:41',
      image: 'assets/img/room/2023-05-26-0841.webp', full: 'assets/img/room/full/2023-05-26-0841.webp',
      alt: 'A DJ in headphones with a cigarette in the mouth, seen from low down through a chain-link fence, the decks in front',
      sub: 'Headphones on, a cigarette, the wire in front',
      say: 'Twenty to nine, the sun long up and the set still going. Headphones on, a cigarette at the lips, and the fence between the decks and the lens.' }
  ],

  // THE ROOM'S SOUND: one track, looped on its own bars while the visitor is in the room (bpm and bars give the length of one pass,
  // so that each pass begins on the beat of the one before). Keyv sent it for the room when the owner asked for music (2026-11-25)
  roomSound: { src: 'assets/audio/room-breakthrough.mp3', title: 'Breakthrough', artist: 'Deep Mind Direction', from: 'Confinement LP, Darkart, 2022', bpm: 79, bars: 25 }
};

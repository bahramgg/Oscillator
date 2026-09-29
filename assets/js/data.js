/* ==========================================================================
   OSCILLATOR — site content
   --------------------------------------------------------------------------
   Everything on the site is generated from this one file. To update the
   site you should only ever need to edit what's below.

   • Images go in assets/img/ and are referenced by relative path.
   • Text in *asterisks* is rendered in the italic serif accent face.
   • Any link left as '' (empty) is simply hidden.
   • An artist without a photo gets a generated contour "sigil" instead.
   ========================================================================== */

window.OSCILLATOR = {

  label: {
    name: 'Oscillator',
    handle: '@oscillator__',
    instagram: 'https://www.instagram.com/oscillator__/',
    soundcloud: 'https://on.soundcloud.com/1oNQcz1onDKpvNzims',
    email: '',                 // e.g. 'demos@oscillator.xyz' — hidden when empty
    curator: 'Keyv',
    origin: 'Tehran',
    tagline: 'a techno label & artist collective, curated by *Keyv*',

    // "01 — Carrier" manifesto. One string per paragraph.
    about: [
      'Oscillator is a techno label and artist collective curated by Keyv. We don\'t sign sounds. We *tune into them*.',
      'A home for the artists who live in the low end, in the dark, in the repetition. Each one a different frequency; together, *one signal*.'
    ],

    facts: [
      ['Curator', 'Keyv'],
      ['Sound', 'Techno'],
      ['Signal origin', 'Tehran'],
      ['Transmits on', 'Instagram · SoundCloud']
    ],

    demos: 'Send a private link via Instagram DM. Every signal gets heard.'
  },

  /* ------------------------------------------------------------------------
     ARTISTS — "02 — Voices"
     slug         url id  →  #/artist/<slug>
     photo        main portrait (black & white works best)
     photos       extra images shown in the profile
     transmissions ids from the list further down
     videos       { src: 'assets/video/x.mp4', poster: '...', caption: '' }
                  or { youtube: 'VIDEO_ID', caption: '' }
     links        instagram / soundcloud / residentadvisor / bandcamp /
                  beatport / spotify / youtube — empty ones are hidden
     ------------------------------------------------------------------------ */
  artists: [
    {
      slug: 'keyv',
      name: 'Keyv',
      role: 'Founder · Curator · DJ',
      city: 'Tehran',
      photo: 'assets/img/keyv-artist.jpg',
      photos: ['assets/img/keyv-live.jpg', 'assets/img/keyv-mark.jpg'],
      bio: [
        '*Keyv* is the Tehran-based DJ behind Oscillator. The ear that decides which frequencies make it onto the label.',
        'The DEMONSTRATOR series documents that sound in long form: driving, hypnotic, peak-time techno with no room to breathe.'
      ],
      links: {
        instagram: 'https://www.instagram.com/keyvdj/',
        soundcloud: 'https://soundcloud.com/keyvdj',
        residentadvisor: '',
        bandcamp: '',
        beatport: '',
        spotify: '',
        youtube: ''
      },
      transmissions: ['demonstrator-2', 'demonstrator-1'],
      videos: []
    },

    // Roster from the label's Instagram — photos cropped from the label's artist posters
    { slug: 'enzo', name: 'Enzo', role: '', city: '', photo: 'assets/img/artist-enzo.jpg', bio: [], links: { instagram: 'https://www.instagram.com/shayan.kenzo/', soundcloud: '' }, transmissions: [], videos: [] },
    { slug: 'mahyar-arabiyan', name: 'Mahyar Arabiyan', role: '', city: '', photo: 'assets/img/artist-mahyar-arabiyan.jpg', bio: [], links: { instagram: 'https://www.instagram.com/mah7arr/', soundcloud: '' }, transmissions: [], videos: [] },
    { slug: 'pooyan', name: 'Pooyan', role: '', city: '', photo: 'assets/img/artist-pooyan.jpg', bio: [], links: { instagram: 'https://www.instagram.com/pooyansaadati/', soundcloud: '' }, transmissions: [], videos: [] },
    { slug: 'barbad', name: 'Barbad', role: '', city: '', photo: 'assets/img/artist-barbad.jpg', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: [], videos: [] },
    { slug: 'el4raa', name: 'El4raa', role: '', city: '', photo: 'assets/img/artist-el4raa.jpg', bio: [], links: { instagram: 'https://www.instagram.com/delara.toyuri/', soundcloud: '' }, transmissions: [], videos: [] },
    { slug: 'kiarash', name: 'Kiarash', role: '', city: '', photo: 'assets/img/artist-kiarash.jpg', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: [], videos: [] },
    { slug: 'traumatic', name: 'Traumatic', role: '', city: '', photo: 'assets/img/artist-traumatic.jpg', bio: [], links: { instagram: 'https://www.instagram.com/trmc.live/', soundcloud: '' }, transmissions: [], videos: [] },
    { slug: 'xaxwave', name: 'Xaxwave', role: '', city: '', photo: 'assets/img/artist-xaxwave.jpg', bio: [], links: { instagram: '', soundcloud: '' }, transmissions: [], videos: [] },
    { slug: 'dynno', name: 'Dynno', role: 'Resident artist', city: 'Tehran', photo: 'assets/img/dynno.jpg', bio: [], links: { instagram: 'https://www.instagram.com/dynno.music/', soundcloud: '' }, transmissions: [], videos: [] }
  ],

  /* ------------------------------------------------------------------------
     TRANSMISSIONS — "03" — mixes, releases, podcasts
     duration in seconds. waveform = 0..1 heights (optional, drawn as bars).
     soundcloud = public track URL (the player loads only when pressed).
     ------------------------------------------------------------------------ */
  transmissions: [
    {
      id: 'demonstrator-2',
      title: 'Demonstrator #2',
      artist: 'keyv',
      type: 'Mix',
      date: '2023-11-18',
      duration: 4522,
      cover: 'assets/img/cover-demonstrator-2.jpg',
      soundcloud: 'https://soundcloud.com/keyvdj/demonstrator-2',
      tracklist: [
        'Parapher - Pasiphae\'s Curse (Hatelove Remix)',
        'Strange Arrival - Draw Distance',
        'Brais - Artes Oscuras',
        'Face - CrackLand',
        'EDUVEK - Metalic Discussion',
        'Deep Secrets - Techno Girl',
        'Axel Picodot - Heating',
        'Hardtrax - Schabernack',
        'HRD.303 - Legionnaires',
        'Neagles - Ride Soundless',
        'raneo - night, shift',
        'Back2school - Without Thinking',
        'Morison - Vision',
        'Niereich - The Power',
        'Onelas - Real Life',
        'Yuhas - Inside You',
        'Back2school - I Don\'t Like Speeches',
        'Datcher - Payback',
        'Giovanni Carozza - S2000',
        '0.B.I. - Gib Mir Alles (feat. Timo Revna)',
        'Keyv - Unreleased',
        'Baumeister - Endless Lonely Universe'
      ],
      waveform: [0.65,0.87,0.92,0.96,0.93,0.85,0.66,0.5,0.76,0.85,0.84,0.84,0.4,0.9,0.81,0.79,0.86,0.89,0.91,0.97,0.99,0.63,0.93,0.96,0.98,1.0,0.61,0.88,0.79,0.83,0.82,0.39,0.46,0.77,0.68,0.78,0.55,0.82,0.85,0.21,0.38,0.86,0.75,0.33,0.66,0.68,0.76,0.72,0.73,0.29,0.15,0.64,0.76,0.81,0.82,0.88,0.9,0.84,0.31,0.86,0.85,0.72,0.93,0.94,0.95,0.8,0.98,0.55,0.4,0.89,0.87,0.83,0.87,0.87,0.86,0.35,0.32,0.84,0.72,0.65,0.78,0.35,0.85,0.76,0.77,0.6,0.8,0.66,0.45,0.29,0.81,0.74,0.69,0.73,0.27,0.57,0.78,0.83,0.81,0.6,0.62,0.88,0.91,0.82,0.65,0.72,0.76,0.61,0.55,0.52,0.77,0.7,0.76,0.84,0.86,0.42,0.36,0.88,0.71,0.17,0.54,0.88,0.89,0.89,0.86,0.86,0.82,0.6,0.5,0.3,0.85,0.89,0.79,0.9,0.77,0.87,0.69,0.4,0.45,0.97,0.7,0.71,0.71,0.78,0.77,0.17,0.15,0.59,0.84,0.73,0.92,0.91,0.41,0.64,0.9,0.86,0.64,0.83,0.66,0.86,0.17,0.16,0.54,0.8,0.82,0.54,0.87,0.91,0.85,0.22,0.21,0.75,0.57,0.82,0.51,0.99,0.92,0.77,0.43,0.17,0.4,0.84,0.82,0.85,0.63,0.52,0.74,0.87,0.76,0.52,0.35,0.25,0.64,0.43,0.88,0.86,0.59,0.86,0.41,0.31]
    },
    {
      id: 'demonstrator-1',
      title: 'Demonstrator #1',
      artist: 'keyv',
      type: 'Mix',
      date: '2020-04-06',
      duration: 3653,
      cover: 'assets/img/cover-demonstrator-1.jpg',
      soundcloud: 'https://soundcloud.com/keyvdj/demonstrator',
      tracklist: [],
      waveform: [0.15,0.34,0.45,0.86,0.97,0.97,0.96,0.97,0.96,0.96,0.96,0.97,0.97,0.95,0.95,0.95,0.75,0.77,0.8,0.83,0.79,0.78,0.77,0.77,0.77,0.76,0.76,0.59,0.49,0.74,0.71,0.68,0.69,0.69,0.88,0.86,0.58,0.91,0.89,0.9,0.68,0.93,0.91,0.92,0.85,0.81,0.84,0.82,0.84,0.77,0.83,0.82,0.82,0.8,0.82,0.8,0.33,0.5,0.78,0.8,0.81,0.83,0.81,0.76,0.79,0.73,0.78,0.77,0.62,0.76,0.69,0.68,0.71,0.7,0.65,0.71,0.7,0.67,0.63,0.9,0.88,0.88,0.89,0.66,0.77,0.92,0.84,0.9,0.57,0.69,0.92,0.88,0.91,0.89,0.48,0.86,0.85,0.8,0.76,0.48,0.84,0.87,0.71,0.73,0.86,0.85,0.69,0.91,0.84,0.84,0.84,0.82,0.32,0.54,0.91,0.91,0.92,0.3,0.49,0.94,0.95,0.93,0.91,0.91,0.9,0.74,0.19,0.19,0.21,0.35,0.92,0.91,0.91,0.75,0.63,0.66,0.66,0.63,0.67,0.68,0.67,0.61,0.6,0.62,0.59,0.62,0.65,0.94,0.97,0.97,0.9,0.89,0.98,0.98,0.97,0.6,0.28,1.0,0.92,0.82,0.97,0.97,0.89,0.8,0.82,0.91,0.89,0.86,0.93,0.92,0.89,0.93,0.87,0.85,0.87,0.93,0.83,0.84,0.83,0.86,0.83,0.84,0.33,0.3,0.67,0.83,0.93,0.83,0.92,0.88,0.88,0.63,0.31,0.31,0.94,0.94,0.92,0.91,0.41,0.19]
    }
  ],

  /* ------------------------------------------------------------------------
     EVENTS — "05 — Next signal". Leave empty to show the "no signal" state.
     { date: '2026-11-14', title: 'Oscillator Night 01', venue: 'Secret location',
       city: 'Tehran', lineup: ['keyv', 'artist-02'], link: 'https://…' }
     lineup accepts artist slugs (linked) or plain names.
     ------------------------------------------------------------------------ */
  events: [],

  /* ------------------------------------------------------------------------
     FEEDBACK — "04" — the visual archive.
     panorama: the wide image the section pans across while scrolling.
     media: extra photos / videos shown underneath.
       { type: 'image', src: 'assets/img/x.jpg', caption: '' }
       { type: 'video', src: 'assets/video/x.mp4', poster: 'assets/img/x.jpg', caption: '' }
     ------------------------------------------------------------------------ */
  feedback: {
    panorama: 'assets/img/crowd-panorama.jpg',
    caption: 'the room is *the instrument*',
    // extra photos / videos from the nights (shown as a grid under the room)
    media: [
      { type: 'image', src: 'assets/img/keyv-night-2.jpg', caption: 'Keyv live' },
      { type: 'image', src: 'assets/img/keyv-night-1.jpg', caption: 'Keyv, the booth' },
      { type: 'image', src: 'assets/img/keyv-night-3.jpg', caption: 'Keyv, hands on' }
    ]
  }
};

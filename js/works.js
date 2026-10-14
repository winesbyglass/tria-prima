'use strict';

// Works data, copied from the hql portfolio (video projects + three photography series).
// img: file name in assets/works/{full,mid,thumb}/
// media.type: "vimeo" | "youtube" | "youtube-series" | "gdrive" (Google Drive file id) | "pending" (no link yet) | "photo"
// poster: cover picture over the project page player; ink: 'light' keeps the Works text white
// phone: overrides used on phones only (e.g. another cover picture)
const DIRECTOR = 'Haohao Qiaoshi Liu';

const motionWorks = [
  { title: 'Distant and Known', type: 'Narrative Short Film', year: '2026', img: '01-01', media: { type: 'vimeo', id: '1116019493' },
    credits: [['Director', DIRECTOR], ['Screenwriter', DIRECTOR], ['Producer', DIRECTOR], ['Co-Producers', 'Anna Mayo / Kennie Zhou'], ['Casting', 'Nicole Hanzi Zhang / Anna Ting Möller / Matthew Yifeng'], ['Cinematographer', 'Myles Caba'], ['Editor', DIRECTOR], ['Music', 'Mikko Aaltio'], ['Sound', 'Carol Yan Li'], ['Production Designer', 'Julia Sy'], ['Art Assistants', 'Alice Zhang / Ester Elise Poussot'], ['Gaffer', 'Neha Fernandes'], ['Sound Recordist', 'Wes Manginsay'], ['1st AD', 'Adeline Blue'], ['2nd AD', 'Natalie Rudzinski'], ['Script Supervisor', 'Olya Sukonrat'], ['Trinity Operator', 'Solomon Sylvester'], ['1st AC', 'Omar Garcia'], ['2nd AC', 'Lorelei Essman-Freeman'], ['G&E', 'Yaw Agyapong'], ['Hair & Makeup', 'Lareina Chen'], ['Costume Designers', 'Julia Sy / Ester Elise Poussot'], ['Dance Choreographer', 'Chloe Tsoi'], ['Dance Coach', 'Alexandra Ling'], ['BTS Photographer', 'Ethan Chan'], ['Poster Design', 'Lea Alda Copat'], ['Song Lyrics', 'Taotao Huang / Chengkangjie “Eric” Huang'], ['In Association With', 'Accent Sisters'], ['Distribution', 'Inwave Films']] },
  { title: 'Signature Payroll', type: 'Commercial Film', year: '2026', img: '04-01', media: { type: 'vimeo', id: '1227710649' },
    credits: [['Client', 'Signature Payroll'], ['Writer-Director', DIRECTOR], ['Director of Photography', 'Kyan Paltoft'], ['Gaffer', 'Lucky Chen'], ['Best Person', 'Bennie Acosta'], ['Editor', DIRECTOR], ['Colourist', DIRECTOR]] },
  { title: 'I Just Wanna Be Liked By You', type: 'Music Video', year: '2026', client: 'Glen Gold', img: '05-01', media: { type: 'vimeo', id: '1192974168' },
    credits: [['Artist', 'Glen Gold'], ['Writer-Director', DIRECTOR], ['Director of Photography', 'Kyan Paltoft'], ['Editor', DIRECTOR], ['Colourist', DIRECTOR]] },
  { title: 'State of No Cause', type: 'Documentary Short Film', year: 'Coming Soon', img: '06-01', media: { type: 'vimeo', id: '1175622234' },
    credits: [['Filmmakers', 'Malik Clyde Terrab / Brandon Mioduszewski'], ['Colourist', DIRECTOR]] },
  { title: 'New York c. May 2025', type: 'Super 8mm Video', year: '2026', img: '10-01', media: { type: 'vimeo', id: '1228072459' },
    credits: [['Director', DIRECTOR], ['DP', DIRECTOR], ['Editor', DIRECTOR], ['Colourist', DIRECTOR], ['Audio', 'Joel Meyerowitz — 2026 ICP Infinity Awards speech']] },
  // No film link yet (media "pending"); credits and write-up still placeholders.
  { title: 'A Day in Eden', type: 'Drama / Magical Realism', duration: '16:29', year: '2026', img: '18-01', media: { type: 'pending' },
    credits: [['Director', '[DIRECTOR]']] },
  { title: 'A Little Regret in Helsinki', type: 'Documentary Short Film', year: '2025', img: '02-01', media: { type: 'vimeo', id: '1110984253' },
    credits: [['Writer / Script', DIRECTOR], ['Producers', 'Haohao Qiaoshi Liu / Wertti Majamaa / Kauri Seppälä'], ['DOP', DIRECTOR], ['Editor', DIRECTOR], ['Music', 'Eddy Zhang'], ['Sound Design', DIRECTOR], ['Production Design', DIRECTOR], ['Distribution', 'AFF Distribution']] },
  { title: 'Early Years', type: 'Narrative Short Film', year: '2024', img: '03-04', phone: { img: '03-02', ink: 'light' }, media: { type: 'vimeo', id: '1016622750' },
    credits: [['Writer / Director / Editor', DIRECTOR], ['Producer', 'Andrew Tuoriniemi'], ['1st Assistant Director', 'Saimi Räty'], ['2nd Assistant Director', 'Lukas Jokilehto'], ['Personal Assistant to Director', 'Taotao Huang'], ['Clapper', 'Holly Hefan Xiao'], ['Casting Director', DIRECTOR], ['Assistant Casting Director', 'Michael Yang'], ['Sound', 'Mikko Tripakis / Michael Yang'], ['Original Score', 'Mikko Aaltio / Michael Yang / Mikko Tripakis / Eddy Zhang'], ['Director of Photography', DIRECTOR], ['Camera Operator', 'Kristian Presnal'], ['Camcorder Operators', 'Andrew Tuoriniemi / Cindia Ma'], ['Wardrobe Stylist', 'Carmen Roux'], ['Moodboard', 'Carmen Roux'], ['Behind the Scenes', 'Holly Hefan Xiao / Carmen Roux'], ['Concept Poster Design', 'Lea Alda Copat'], ['Head of Logistics', 'Jun Liu']] },
  // Film: Google Drive file (festival cut). Description still a placeholder.
  { title: 'The 180 End', type: 'Drama', duration: '36:08', year: '2024', img: '17-01', poster: '17-01', ink: 'light', media: { type: 'gdrive', id: '1Pyc6bfPCjBtH0d7mtleyYgshkzV9w2X9' },
    credits: [['Writer-Director', 'Jalsa Amidah Drinkard'], ['Producer', 'Jalsa Amidah Drinkard']] },
  { title: "POTE'CAST", type: 'Podcast Video Series', year: '2023–2024', img: '07-01', media: { type: 'youtube-series', episodes: [
    { id: 'WmM7TZO3HDc', label: 'EPISODE 01' }, { id: 'Vi3096sogVQ', label: 'EPISODE 02' }, { id: '2-0PuID-h1Q', label: 'EPISODE 03' }] },
    credits: [['Director', DIRECTOR], ['Producer', DIRECTOR], ['Editor', DIRECTOR], ['Colourist', DIRECTOR]] },
  { title: 'La Rêverie Festival Trailer', type: 'Trailer', year: '2023', img: '08-01', media: { type: 'youtube', id: 'ykr8qHLEXoE' },
    credits: [['Director', DIRECTOR], ['Editor', DIRECTOR], ['Animator', DIRECTOR]] },
  { title: 'When Does It All Begin To Matter?', type: 'Video Series', year: '2022', img: '16-01', media: { type: 'youtube-series', episodes: [
    { id: 'HQQyPLwQlTI', label: 'EPISODE 01' }, { id: 'mF1fQz0FQEE', label: 'EPISODE 02' }, { id: 'G8Ff1I_uvBI', label: 'EPISODE 03' }] },
    credits: [['Director', DIRECTOR], ['Producer', DIRECTOR], ['DP', DIRECTOR], ['Editor', DIRECTOR], ['Colourist', DIRECTOR]] },
  { title: 'Artoon Network Campaign Video', type: 'Campaign Video', year: '2022', img: '12-01', media: { type: 'youtube', id: 'bGwgyBPhRuE', start: 5 },
    credits: [['Co-Director', DIRECTOR], ['Co-Producer', DIRECTOR], ['DP', DIRECTOR], ['Editor', DIRECTOR], ['Colourist', DIRECTOR]] }
].map(work => ({ ...work, kind: 'motion' }));

// Photo numbers are as filed in the hql portfolio (Sciences Po has no 10).
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, k) => from + k);
const photoSeries = [
  { title: 'Return to Helsinki', type: '35mm Series', year: '2026', prefix: '09', numbers: range(1, 23), credits: [['Photographer', DIRECTOR]] },
  { title: 'Double Exposure Series', type: 'Photography Series', year: '2023', prefix: '13', numbers: range(1, 14), credits: [['Photographer', DIRECTOR], ['Location', 'Reims and Avignon, France']] },
  { title: 'Sciences Po Year 2', type: '35mm Series', year: '2023', prefix: '11', numbers: [...range(1, 9), ...range(11, 15)], credits: [['Photographer', DIRECTOR]] }
];

// One Works item per photography project, shown by its first photograph; all of the
// project's photographs are on its project page.
const photoWorks = photoSeries.map(series => {
  const photos = series.numbers.map(n => `${series.prefix}-${String(n).padStart(2, '0')}`);
  return {
    title: series.title, type: series.type, year: series.year, credits: series.credits,
    img: photos[0], photos, media: { type: 'photo' }, kind: 'photo'
  };
});

// Every individual photograph (the home page slideshow draws from these).
const allPhotos = photoWorks.flatMap(project => project.photos.map(img => ({ img })));

// Project page details (description, role, stills, festivals, distribution), copied from the hql portfolio.
const projectDetails = {
  "A Day in Eden": {
    "description": "[DESCRIPTION]",
    "medium": "[MEDIUM]",
    "role": "[ROLE]",
    "stills": [
      "18-02",
      "18-03",
      "18-04",
      "18-05",
      "18-06",
      "18-01"
    ]
  },
  "The 180 End": {
    "description": "[DESCRIPTION]",
    "medium": "Digital 4K",
    "role": "Writer-Director / Producer",
    "stills": [
      "17-01",
      "17-02",
      "17-03",
      "17-04",
      "17-05",
      "17-06",
      "17-07"
    ],
    "festivals": [
      [
        "Newark International Film Festival",
        "USA"
      ]
    ]
  },
  "Distant and Known": {
    "description": "Xiang, dressed in a silk qipao, awakens in a hazy banquet hall, having forgotten her name. Dance and song pave her way back home.",
    "medium": "Digital 4K",
    "role": "Writer-Director / Editor / Colourist",
    "stills": [
      "01-01",
      "01-02",
      "01-03",
      "01-04",
      "01-05",
      "01-06"
    ],
    "partners": [
      {
        "name": "Inwave Films",
        "href": "https://inwavefilms.com/"
      }
    ]
  },
  "Signature Payroll": {
    "description": "Brand film shot for Signature Payroll Australia's 2026 relaunch.",
    "medium": "Digital 4K",
    "role": "Writer-Director / Editor / Colourist",
    "stills": [
      "04-01",
      "04-02",
      "04-03",
      "04-04",
      "04-05"
    ]
  },
  "I Just Wanna Be Liked By You": {
    "description": "Music video for Glen Gold, shot in Sydney.",
    "medium": "Digital 4K",
    "role": "Writer-Director / Editor / Colourist",
    "stills": [
      "05-01",
      "05-02",
      "05-03",
      "05-04",
      "05-05"
    ]
  },
  "State of No Cause": {
    "description": "In rural Vermont, shortly after a near-fatal fall, an elderly couple faces a \"no-cause\" eviction that threatens to sever their connection to the world. Childless but bound by a deep, reciprocal care for their animals and community, their enduring love is documented through a fragile landline connection and the drawings they make to survive a life without screens.",
    "medium": "Digital 4K / Camcorder HD",
    "role": "Colourist",
    "stills": [
      "06-01",
      "06-02",
      "06-03",
      "06-04",
      "06-05",
      "06-06"
    ]
  },
  "Return to Helsinki": {
    "description": "35mm photography series.",
    "medium": "35mm",
    "role": "Photographer"
  },
  "New York c. May 2025": {
    "description": "Super 8mm video. Audio borrowed from Joel Meyerowitz's speech at the 2026 ICP Infinity Awards.",
    "medium": "Super 8mm",
    "role": "Director / DP / Editor / Colourist",
    "stills": [
      "10-01",
      "10-02",
      "10-03",
      "10-04",
      "10-05",
      "10-06"
    ]
  },
  "A Little Regret in Helsinki": {
    "description": "A Chinese girl returns home to Helsinki, with a desire to reassess her feelings about home, perfection, friendship, and regret. A tender dialogue is raised between father and daughter.",
    "medium": "Super 8mm",
    "role": "Writer-Director / Editor / Colourist",
    "stills": [
      "02-01",
      "02-02",
      "02-03",
      "02-04",
      "02-05",
      "02-06",
      "02-07"
    ],
    "festivals": [
      [
        "Tirana International Film Festival",
        "ALB"
      ],
      [
        "Leiden Shorts",
        "NLD"
      ],
      [
        "Buffalo International Film Festival",
        "USA"
      ],
      [
        "Hobnobben Film Festival",
        "USA"
      ],
      [
        "Canberra Short Film Festival",
        "AUS"
      ],
      [
        "Beijing International Short Film Festival",
        "CHN"
      ],
      [
        "MINT Chinese Film Festival",
        "UK"
      ],
      [
        "NFFTY — National Film Festival for Talented Youth",
        "USA"
      ],
      [
        "Play-Doc International Film Festival",
        "ESP"
      ],
      [
        "Korea Diaspora Film Festival",
        "KOR"
      ],
      [
        "Houston Asian American Pacific Islander Film Festival",
        "USA"
      ],
      [
        "Blue Sea Film Festival",
        "FIN"
      ]
    ],
    "partners": [
      {
        "name": "AFF Distribution",
        "href": "https://asianfilmfestivals.com/distribution/"
      }
    ]
  },
  "Early Years": {
    "description": "Early Years is a poignant drama short film that follows a Chinese immigrant father and his daughter, navigating the intricacies of growing up in a foreign country, the challenges of trying to fit in, and the nuanced gestures exchanged between a parent and their child.",
    "medium": "Digital 4K / Camcorder HD",
    "role": "Writer-Director / Editor / Colourist",
    "stills": [
      "03-01",
      "03-02",
      "03-03",
      "03-04"
    ],
    "festivals": [
      [
        "Helsinki International Film Festival — Love & Anarchy Shorts",
        "FIN"
      ]
    ]
  },
  "POTE'CAST": {
    "description": "POTE'CAST is a playful series of video podcasts entre potes, hosted by Haohao Qiaoshi Liu.\n\nThe series reached over 200k views within 9 months of its launch, gaining viewership across TikTok, Instagram, Youtube, and Spotify.",
    "medium": "Digital 4K",
    "role": "Director / Producer / Editor / Colourist"
  },
  "La Rêverie Festival Trailer": {
    "description": "Festival trailer combining live-action footage and animation.",
    "medium": "Digital 4K / Animation",
    "role": "Director / Editor / Animator"
  },
  "Double Exposure Series": {
    "description": "Photography series shot in Reims and Avignon, France.",
    "medium": "Photography",
    "role": "Photographer"
  },
  "Sciences Po Year 2": {
    "description": "35mm photography series.",
    "medium": "35mm",
    "role": "Photographer"
  },
  "When Does It All Begin To Matter?": {
    "description": "“When Does It All Begin To Matter?” is a three-part series based on commonly experienced limbo when placed between familiarity and a hard place. Meaning and message is pursued through intersection of written word and cinema.",
    "medium": "Digital 4K",
    "role": "Director / Producer / DP / Editor / Colourist"
  },
  "Artoon Network Campaign Video": {
    "description": "Campaign Week video for Artoon Network, created for the Bureau des Arts (BDA) at Sciences Po's Reims campus.",
    "medium": "Digital 4K",
    "role": "Co-Director / Co-Producer / DP / Editor / Colourist",
    "stills": [
      "12-01",
      "12-02",
      "12-03"
    ]
  }
};
const works = [...motionWorks, ...photoWorks].map(work => {
  const extra = projectDetails[work.title] || {};
  // Shown under the title on the project page: the director, else the filmmakers / photographer.
  const lead = work.credits.find(([role]) => /director/i.test(role))
    || work.credits.find(([role]) => /filmmaker|photographer/i.test(role));
  return {
    ...work,
    ...extra,
    director: lead ? lead[1] : DIRECTOR,
    // Client, where the hql portfolio names one (shown on the stills of video projects).
    client: work.client || (work.credits.find(([role]) => role === 'Client') || [])[1] || null,
    slug: work.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  };
});

function workImage(work, size) {
  return `assets/works/${size}/${work.img}.jpg?v=5`; // bump when the images are re-exported
}
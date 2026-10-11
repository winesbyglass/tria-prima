'use strict';

// Works data, copied from the hql portfolio (video projects + three photography series).
// img: file name in assets/works/{full,mid,thumb}/
// media.type: "vimeo" | "youtube" | "youtube-series" | "photo"
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
  { title: 'A Little Regret in Helsinki', type: 'Documentary Short Film', year: '2025', img: '02-01', media: { type: 'vimeo', id: '1110984253' },
    credits: [['Writer / Script', DIRECTOR], ['Producers', 'Haohao Qiaoshi Liu / Wertti Majamaa / Kauri Seppälä'], ['DOP', DIRECTOR], ['Editor', DIRECTOR], ['Music', 'Eddy Zhang'], ['Sound Design', DIRECTOR], ['Production Design', DIRECTOR], ['Distribution', 'AFF Distribution']] },
  { title: 'Early Years', type: 'Narrative Short Film', year: '2024', img: '03-04', media: { type: 'vimeo', id: '1016622750' },
    credits: [['Writer / Director / Editor', DIRECTOR], ['Producer', 'Andrew Tuoriniemi'], ['1st Assistant Director', 'Saimi Räty'], ['2nd Assistant Director', 'Lukas Jokilehto'], ['Personal Assistant to Director', 'Taotao Huang'], ['Clapper', 'Holly Hefan Xiao'], ['Casting Director', DIRECTOR], ['Assistant Casting Director', 'Michael Yang'], ['Sound', 'Mikko Tripakis / Michael Yang'], ['Original Score', 'Mikko Aaltio / Michael Yang / Mikko Tripakis / Eddy Zhang'], ['Director of Photography', DIRECTOR], ['Camera Operator', 'Kristian Presnal'], ['Camcorder Operators', 'Andrew Tuoriniemi / Cindia Ma'], ['Wardrobe Stylist', 'Carmen Roux'], ['Moodboard', 'Carmen Roux'], ['Behind the Scenes', 'Holly Hefan Xiao / Carmen Roux'], ['Concept Poster Design', 'Lea Alda Copat'], ['Head of Logistics', 'Jun Liu']] },
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

const photoSeries = [
  { title: 'Return to Helsinki', type: '35mm Series', year: '2026', prefix: '09', credits: [['Photographer', DIRECTOR]] },
  { title: 'Double Exposure Series', type: 'Photography Series', year: '2023', prefix: '13', credits: [['Photographer', DIRECTOR], ['Location', 'Reims and Avignon, France']] },
  { title: 'Sciences Po Year 2', type: '35mm Series', year: '2023', prefix: '11', credits: [['Photographer', DIRECTOR]] }
];

// Each photograph is its own item (one per screen in the list view).
const photoWorks = photoSeries.flatMap(series => [1, 2, 3, 4, 5].map(n => ({
  title: series.title, type: series.type, year: series.year, credits: series.credits,
  number: `${String(n).padStart(2, '0')} / 05`, img: `${series.prefix}-0${n}`, media: { type: 'photo' }, kind: 'photo'
})));

const works = [...motionWorks, ...photoWorks];

function workImage(work, size) {
  return `assets/works/${size}/${work.img}.jpg?v=4`; // bump when the images are re-exported
}

'use strict';

// Video projects for the Works gallery. Copied from the hql portfolio's video projects.
// media.type: "vimeo" | "youtube" | "youtube-series"
const works = [
  { title: 'Distant and Known', type: 'Narrative Short Film', year: '2026', thumb: 'assets/works/project-01-01.jpg', media: { type: 'vimeo', id: '1116019493' } },
  { title: 'Signature Payroll', type: 'Commercial Film', year: '2026', thumb: 'assets/works/project-04-01.jpg', media: { type: 'vimeo', id: '1227710649' } },
  { title: 'I Just Wanna Be Liked By You', type: 'Music Video', year: '2026', thumb: 'assets/works/project-05-01.jpg', media: { type: 'vimeo', id: '1192974168' } },
  { title: 'State of No Cause', type: 'Documentary Short Film', year: 'Coming Soon', thumb: 'assets/works/project-06-01.jpg', media: { type: 'vimeo', id: '1175622234' } },
  { title: 'New York c. May 2025', type: 'Super 8mm Video', year: '2026', thumb: 'assets/works/project-10-01.jpg', media: { type: 'vimeo', id: '1228072459' } },
  { title: 'A Little Regret in Helsinki', type: 'Documentary Short Film', year: '2025', thumb: 'assets/works/project-02-01.jpg', media: { type: 'vimeo', id: '1110984253' } },
  { title: 'Early Years', type: 'Narrative Short Film', year: '2024', thumb: 'assets/works/project-03-04.jpg', media: { type: 'vimeo', id: '1016622750' } },
  { title: "POTE'CAST", type: 'Podcast Video Series', year: '2023–2024', thumb: 'assets/works/project-07-01.jpg', media: { type: 'youtube-series', episodes: [
    { id: 'WmM7TZO3HDc', label: 'EPISODE 01' }, { id: 'Vi3096sogVQ', label: 'EPISODE 02' }, { id: '2-0PuID-h1Q', label: 'EPISODE 03' } ] } },
  { title: 'La Rêverie Festival Trailer', type: 'Trailer', year: '2023', thumb: 'assets/works/project-08-01.jpg', media: { type: 'youtube', id: 'ykr8qHLEXoE' } },
  { title: 'When Does It All Begin To Matter?', type: 'Video Series', year: '2022', thumb: 'assets/works/project-16-01.jpg', media: { type: 'youtube-series', episodes: [
    { id: 'HQQyPLwQlTI', label: 'EPISODE 01' }, { id: 'mF1fQz0FQEE', label: 'EPISODE 02' }, { id: 'G8Ff1I_uvBI', label: 'EPISODE 03' } ] } },
  { title: 'Artoon Network Campaign Video', type: 'Campaign Video', year: '2022', thumb: 'assets/works/project-12-01.jpg', media: { type: 'youtube', id: 'bGwgyBPhRuE', start: 5 } }
];

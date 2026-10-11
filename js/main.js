'use strict';

const home = document.getElementById('home');
const pages = [...document.querySelectorAll('.page')];
const transition = document.getElementById('transition');
const heroVideo = document.getElementById('heroVideo');
const filmModal = document.getElementById('filmModal');
const modalFrame = document.getElementById('modalFrame');
let navigating = false;

// ---------- Hero background film (muted MP4 autoplay) ----------
function playHero() {
  heroVideo.muted = true;
  heroVideo.play().catch(() => {});
}
function pauseHero() { heroVideo.pause(); }

// Some browsers hold autoplay until the first interaction; retry then.
['pointerdown', 'touchstart', 'keydown'].forEach(type => {
  document.addEventListener(type, () => { if (filmShowing() && heroVideo.paused) playHero(); }, { once: true, passive: true });
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && filmShowing()) playHero(); });

function filmShowing() { return !home.hidden && !home.classList.contains('photo-mode'); }

// ---------- Page navigation ----------
function revealPage(target) {
  home.hidden = target !== 'home';
  document.body.classList.toggle('on-home', target === 'home');
  pages.forEach(page => {
    const active = page.id === target;
    page.hidden = !active;
    page.classList.toggle('active', active);
  });
  updateWorksSnap();
  window.scrollTo({ top: 0, behavior: 'instant' });
  updateToTop();
  // On the home page only one of film / slideshow runs, depending on the page-turn state.
  if (target === 'home' && !home.classList.contains('photo-mode')) playHero();
  else pauseHero();
  if (target === 'home' && home.classList.contains('photo-mode')) startSlideshow();
  else stopSlideshow();
}

const PAGES = ['home', 'works', 'process', 'contact'];

function pageTitle(target) {
  return `TRIA PRIMA — ${target === 'home' ? 'Film & Media' : target[0].toUpperCase() + target.slice(1)}`;
}

function pageFromHash() {
  const hash = location.hash.slice(1);
  return PAGES.includes(hash) ? hash : 'home';
}

// Each page gets its own history entry (#works etc.), so the browser Back button works.
// fromHistory: triggered by Back/Forward, so don't push another entry.
function navigate(target, source, fromHistory = false) {
  if (navigating || !PAGES.includes(target)) return;
  if ((target === 'home' && !home.hidden) || (target !== 'home' && !document.getElementById(target).hidden)) return;
  navigating = true;
  if (!fromHistory) history.pushState({ page: target }, '', target === 'home' ? location.pathname : `#${target}`);
  circleWipe(source, () => {
    revealPage(target);
    document.title = pageTitle(target);
  }, () => {
    navigating = false;
    // Back pressed again mid-transition: catch up with where history now is.
    const current = pageFromHash();
    if (current !== target) navigate(current, null, true);
  });
}

// Expanding circles from the clicked control; onCovered runs while the screen is covered.
function circleWipe(source, onCovered, onDone) {
  const rect = source ? source.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  transition.style.setProperty('--x', `${rect.left + rect.width / 2}px`);
  transition.style.setProperty('--y', `${rect.top + rect.height / 2}px`);
  transition.classList.remove('running');
  void transition.offsetWidth;
  transition.classList.add('running');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(onCovered, reduceMotion ? 0 : 850);
  window.setTimeout(() => {
    transition.classList.remove('running');
    onDone();
  }, reduceMotion ? 25 : 1360);
}

window.addEventListener('popstate', () => {
  if (!filmModal.hidden) closeModal();
  navigate(pageFromHash(), null, true);
});

document.querySelectorAll('[data-target]').forEach(button => {
  button.addEventListener('click', () => navigate(button.dataset.target, button));
});
document.querySelectorAll('[data-home]').forEach(button => {
  button.addEventListener('click', () => navigate('home', button));
});


// ---------- Work modal (film embed or photograph) ----------
const modalEpisodes = document.getElementById('modalEpisodes');

function embedUrl(media, id) {
  if (media.type === 'vimeo') return `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&color=000000`;
  return `https://www.youtube.com/embed/${id}?rel=0&autoplay=1${media.start ? `&start=${media.start}` : ''}`;
}

function showEmbed(work, id) {
  const iframe = document.createElement('iframe');
  iframe.src = embedUrl(work.media, id);
  iframe.title = work.title;
  iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  iframe.allowFullscreen = true;
  modalFrame.replaceChildren(iframe);
}

function openWork(work) {
  const episodes = work.media.episodes || [];
  modalFrame.classList.toggle('is-photo', work.kind === 'photo');
  if (work.kind === 'photo') {
    const img = document.createElement('img');
    img.src = workImage(work, 'full');
    img.alt = `${work.title} ${work.number}`;
    modalFrame.replaceChildren(img);
  } else {
    showEmbed(work, episodes.length ? episodes[0].id : work.media.id);
  }
  modalEpisodes.replaceChildren(...episodes.map((episode, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = episode.label;
    button.classList.toggle('active', i === 0);
    button.addEventListener('click', () => {
      showEmbed(work, episode.id);
      modalEpisodes.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === button));
    });
    return button;
  }));
  modalEpisodes.hidden = !episodes.length;
  filmModal.hidden = false;
  filmModal.classList.add('open');
}

function closeModal() {
  modalFrame.replaceChildren();
  modalEpisodes.replaceChildren();
  filmModal.classList.remove('open');
  filmModal.hidden = true;
}
document.getElementById('modalClose').addEventListener('click', closeModal);
filmModal.addEventListener('click', event => { if (event.target === filmModal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !filmModal.hidden) closeModal(); });

// ---------- Works page: list (full screen + thumbnail strip) and grid ----------
const worksPage = document.getElementById('works');
const workList = document.getElementById('workList');
const workGrid = document.getElementById('workGrid');
const workStrip = document.getElementById('workStrip');
let currentFilter = 'all';
let currentView = 'list';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function workSub(work) {
  return work.kind === 'photo' ? `${work.type} · ${work.number}` : `${work.client || work.type} · ${work.year}`;
}

const slides = [];
const thumbs = [];
const gridItems = [];

works.forEach((work, i) => {
  const slide = el('button', 'work-slide');
  slide.type = 'button';
  slide.style.backgroundImage = `url("${workImage(work, 'full')}")`;
  slide.append(el('span', 'work-slide-sub', workSub(work)), el('span', 'work-slide-title', work.title),
    el('span', 'work-slide-cta', work.kind === 'photo' ? 'VIEW PHOTO ↗' : 'PLAY FILM ↗'));
  slide.addEventListener('click', () => openWork(work));
  slide.dataset.index = i;
  slides.push(slide);

  const thumb = el('button', 'strip-thumb');
  thumb.type = 'button';
  thumb.style.backgroundImage = `url("${workImage(work, 'thumb')}")`;
  thumb.setAttribute('aria-label', `${work.title}${work.number ? ` ${work.number}` : ''}`);
  thumb.addEventListener('click', () => slide.scrollIntoView({ behavior: 'smooth' }));
  thumbs.push(thumb);

  const item = el('button', 'grid-item');
  item.type = 'button';
  item.style.backgroundImage = `url("${workImage(work, 'mid')}")`;
  const info = el('span', 'grid-info');
  const credits = el('dl', 'grid-credits');
  work.credits.slice(0, 6).forEach(([role, name]) => credits.append(el('dt', '', role), el('dd', '', name)));
  info.append(el('span', 'grid-info-sub', workSub(work)), el('span', 'grid-info-title', work.title), credits);
  item.append(info);
  item.addEventListener('click', () => openWork(work));
  gridItems.push(item);
});
workList.append(...slides);
const stripTrack = el('div', 'strip-track');
stripTrack.append(...thumbs);
workStrip.append(stripTrack);
workGrid.append(...gridItems);
document.getElementById('countMotion').textContent = `(${motionWorks.length})`;
document.getElementById('countPhoto').textContent = `(${photoWorks.length})`;

function setActiveThumb(i) {
  thumbs.forEach((thumb, j) => thumb.classList.toggle('active', j === i));
  // Slide the track so the current thumbnail sits mid-screen, but never past either end.
  const thumb = thumbs[i];
  const maxShift = Math.max(0, stripTrack.offsetHeight - workStrip.clientHeight);
  const shift = Math.min(maxShift, Math.max(0, thumb.offsetTop + thumb.offsetHeight / 2 - workStrip.clientHeight / 2));
  stripTrack.style.transform = `translateY(${-shift}px)`;
}

// The work filling the screen drives the strip.
const slideObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) setActiveThumb(Number(entry.target.dataset.index)); });
}, { threshold: 0.6 });
slides.forEach(slide => slideObserver.observe(slide));

function applyFilter(filter) {
  currentFilter = filter;
  works.forEach((work, i) => {
    const show = filter === 'all' || work.kind === filter;
    slides[i].hidden = thumbs[i].hidden = gridItems[i].hidden = !show;
  });
  document.querySelectorAll('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
  window.scrollTo({ top: 0, behavior: 'instant' });
  const first = works.findIndex(work => filter === 'all' || work.kind === filter);
  if (first >= 0) setActiveThumb(first);
}

function setView(view) {
  currentView = view;
  workList.hidden = workStrip.hidden = view !== 'list';
  workGrid.hidden = view !== 'grid';
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  updateWorksSnap();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Snap one work per screen, only while the list view is showing.
function updateWorksSnap() {
  document.documentElement.classList.toggle('works-snap', !worksPage.hidden && currentView === 'list');
  document.documentElement.classList.toggle('works-open', !worksPage.hidden);
}

document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
  if (navigating || b.dataset.view === currentView) return;
  navigating = true;
  circleWipe(b, () => setView(b.dataset.view), () => { navigating = false; });
}));

// ---------- Back to top (Works page) ----------
const toTop = document.getElementById('toTop');

// Only exists on the Works page; hidden everywhere else (home, Process, Contact).
function updateToTop() {
  toTop.hidden = worksPage.hidden;
  toTop.classList.toggle('visible', !worksPage.hidden && window.scrollY > 400);
}
window.addEventListener('scroll', updateToTop, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ---------- Home page turn: film <-> photo slideshow ----------
const splitToggle = document.getElementById('splitToggle');
const photoStage = document.getElementById('photoStage');
const aboutPanel = document.getElementById('about');
const verticalTurn = window.matchMedia('(max-width: 800px)');
const SLIDE_MS = 3000;
const TURN_MS = 2000;
let slideTimer = null;
let slideOrder = [];
let turning = false;

function nextPhoto() {
  if (!slideOrder.length) slideOrder = photoWorks.map((_, i) => i).sort(() => Math.random() - 0.5);
  const work = photoWorks[slideOrder.pop()];
  const img = new Image();
  img.alt = '';
  img.src = workImage(work, 'full');
  return img.decode().catch(() => {}).then(() => {
    const previous = photoStage.querySelector('img.shown');
    photoStage.append(img);
    requestAnimationFrame(() => img.classList.add('shown'));
    if (previous) setTimeout(() => previous.remove(), 900);
  });
}

function startSlideshow() {
  if (slideTimer) return;
  if (!photoStage.querySelector('img')) nextPhoto();
  slideTimer = setInterval(nextPhoto, SLIDE_MS);
}
function stopSlideshow() {
  clearInterval(slideTimer);
  slideTimer = null;
}

// Resting divider position: the About edge (left edge on desktop, top edge on mobile).
function restSplit() {
  const a = aboutPanel.getBoundingClientRect();
  const h = home.getBoundingClientRect();
  return verticalTurn.matches ? a.top - h.top : a.left - h.left;
}

function animateSplit(from, to, done) {
  const start = performance.now();
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = now => {
    const t = Math.min(1, (now - start) / TURN_MS);
    home.style.setProperty('--split', `${from + (to - from) * ease(t)}px`);
    if (t < 1) requestAnimationFrame(step);
    else done();
  };
  requestAnimationFrame(step);
}

function turnToPhotos() {
  turning = true;
  const from = restSplit();
  home.style.setProperty('--split', `${from}px`);
  home.classList.add('flipping');
  startSlideshow();
  animateSplit(from, 0, () => {
    home.classList.remove('flipping');
    home.classList.add('photo-mode');
    pauseHero();
    splitToggle.textContent = '▶';
    splitToggle.setAttribute('aria-label', 'Show film');
    turning = false;
  });
}

function turnToFilm() {
  turning = true;
  playHero();
  home.classList.remove('photo-mode');
  home.classList.add('flipping');
  animateSplit(0, restSplit(), () => {
    home.classList.remove('flipping');
    home.style.removeProperty('--split');
    stopSlideshow();
    splitToggle.textContent = '◀';
    splitToggle.setAttribute('aria-label', 'Show photographs');
    turning = false;
  });
}

splitToggle.addEventListener('click', () => {
  if (turning) return;
  if (home.classList.contains('photo-mode')) turnToFilm();
  else turnToPhotos();
});

// Initial page: honour a direct link such as …/tria-prima/#works.
const initialPage = pageFromHash();
history.replaceState({ page: initialPage }, '');
revealPage(initialPage);
document.title = pageTitle(initialPage);
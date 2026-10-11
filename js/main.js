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

// Grid images: preload once the page has settled, fade each square in as it arrives.
function preloadGrid() {
  works.forEach((work, i) => {
    const img = new Image();
    img.onload = img.onerror = () => gridItems[i].classList.add('loaded');
    img.src = workImage(work, 'mid');
  });
  // Never leave a square invisible if a load event is missed.
  setTimeout(() => gridItems.forEach(item => item.classList.add('loaded')), 4000);
}
if (document.readyState === 'complete') setTimeout(preloadGrid, 800);
else window.addEventListener('load', () => setTimeout(preloadGrid, 800), { once: true });
workList.append(...slides);
const stripTrack = el('div', 'strip-track');
const stripWindow = el('div', 'strip-window');
stripTrack.append(...thumbs);
stripWindow.append(stripTrack);
workStrip.append(stripWindow);
workGrid.append(...gridItems);
document.getElementById('countMotion').textContent = `(${motionWorks.length})`;
document.getElementById('countPhoto').textContent = `(${photoWorks.length})`;

const stripMaxShift = () => Math.max(0, stripTrack.offsetHeight - stripWindow.clientHeight);
const setStripShift = px => { stripTrack.style.transform = `translateY(${-Math.min(stripMaxShift(), Math.max(0, px))}px)`; };
let stripHovered = false;

function setActiveThumb(i) {
  thumbs.forEach((thumb, j) => thumb.classList.toggle('active', j === i));
  updateWorksInk(i);
  // While the pointer is browsing the strip it stays where the pointer put it.
  if (stripHovered) return;
  // Slide the track so the current thumbnail sits mid-screen, but never past either end.
  const thumb = thumbs[i];
  setStripShift(thumb.offsetTop + thumb.offsetHeight / 2 - stripWindow.clientHeight / 2);
}

// Pointer position over the strip scrolls it directly: top of the strip = first thumbnail,
// bottom = last, so the whole list is reachable without paging through the works.
workStrip.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse') return;
  stripHovered = true;
  workStrip.classList.add('browsing');
  const r = stripWindow.getBoundingClientRect();
  const t = Math.min(1, Math.max(0, ((event.clientY - r.top) / r.height - 0.1) / 0.8));
  setStripShift(t * stripMaxShift());
});
workStrip.addEventListener('pointerleave', () => {
  stripHovered = false;
  workStrip.classList.remove('browsing');
  setActiveThumb(activeIndex);
});

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
  updateWorksInk(activeIndex);
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
  morphView(b.dataset.view, () => { navigating = false; });
}));

// List <-> Grid morph: every visible work flies between its strip thumbnail and its grid square,
// swapping the view underneath.
function morphView(view, onDone) {
  const toGrid = view === 'grid';
  const visible = works.map((_, i) => i).filter(i => !gridItems[i].hidden);
  const rectOf = (i, grid) => (grid ? gridItems[i] : thumbs[i]).getBoundingClientRect();
  const from = new Map(visible.map(i => [i, rectOf(i, !toGrid)]));

  stripTrack.style.transition = 'none';
  setView(view);
  if (!toGrid) setActiveThumb(visible[0]);
  void stripTrack.offsetHeight;

  const onScreen = r => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  const targets = visible.map(i => [i, rectOf(i, toGrid)]).filter(([i, r]) => onScreen(r) || onScreen(from.get(i)));
  const finals = targets.map(([i]) => (toGrid ? gridItems[i] : thumbs[i]));
  finals.forEach(node => { node.style.visibility = 'hidden'; });

  const layer = el('div', 'morph-layer');
  const box = r => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  const duration = 750;
  const stagger = 18;
  targets.forEach(([i, to], n) => {
    const flyer = el('span');
    flyer.style.backgroundImage = `url("${workImage(works[i], 'mid')}")`;
    layer.append(flyer);
    flyer.animate([box(from.get(i)), box(to)],
      { duration, delay: n * stagger, easing: 'cubic-bezier(.62,0,.23,1)', fill: 'both' });
  });
  document.body.append(layer);

  // Timer rather than animation promises, which can stall in a background tab.
  setTimeout(() => {
    finals.forEach(node => { node.style.visibility = ''; });
    layer.remove();
    stripTrack.style.transition = '';
    onDone();
  }, duration + targets.length * stagger + 60);
}

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

// ---------- Text colour follows the picture behind it ----------
// The picture is drawn "object-fit: cover" into a tiny canvas; each text block's area is
// averaged and gets .ink-dark (black text) when the picture there is light.
const inkCanvas = document.createElement('canvas');
const inkCtx = inkCanvas.getContext('2d', { willReadFrequently: true });
const LIGHT = 0.6;

function coverPixels(source, natW, natH, boxW, boxH) {
  if (!natW || !natH || !boxW || !boxH) return null;
  const cw = 64;
  const ch = Math.max(1, Math.round(cw * boxH / boxW));
  inkCanvas.width = cw;
  inkCanvas.height = ch;
  const scale = Math.max(cw / natW, ch / natH);
  try {
    inkCtx.drawImage(source, (cw - natW * scale) / 2, (ch - natH * scale) / 2, natW * scale, natH * scale);
    return { data: inkCtx.getImageData(0, 0, cw, ch).data, cw, ch, boxW, boxH };
  } catch (e) {
    return null; // e.g. a frame not ready yet
  }
}

// rect: the text block, in the same coordinates as a box starting at (0, 0).
function isLightUnder(px, rect) {
  const x0 = Math.max(0, Math.floor(rect.left / px.boxW * px.cw));
  const x1 = Math.min(px.cw, Math.ceil(rect.right / px.boxW * px.cw));
  const y0 = Math.max(0, Math.floor(rect.top / px.boxH * px.ch));
  const y1 = Math.min(px.ch, Math.ceil(rect.bottom / px.boxH * px.ch));
  let sum = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const k = (y * px.cw + x) * 4;
      sum += (0.2126 * px.data[k] + 0.7152 * px.data[k + 1] + 0.0722 * px.data[k + 2]) / 255;
      n++;
    }
  }
  return n > 0 && sum / n > LIGHT;
}

function relRect(el, box) {
  const r = el.getBoundingClientRect();
  return { left: r.left - box.left, right: r.right - box.left, top: r.top - box.top, bottom: r.bottom - box.top };
}

// Home: sample the film frame (or the photo on show) a few times a second.
const homeInkTargets = [
  [document.querySelector('.topline'), document.querySelector('.brand')],
  [document.querySelector('.navigation'), document.querySelector('.navigation')],
  [aboutPanel, aboutPanel.querySelector('.aside-copy')]
];

function updateHomeInk() {
  if (home.hidden || home.classList.contains('flipping')) return;
  const box = document.querySelector('.hero').getBoundingClientRect();
  let px = null;
  if (home.classList.contains('photo-mode')) {
    const img = photoStage.querySelector('img.shown') || photoStage.querySelector('img');
    if (img && img.complete) px = coverPixels(img, img.naturalWidth, img.naturalHeight, box.width, box.height);
  } else if (heroVideo.readyState >= 2) {
    px = coverPixels(heroVideo, heroVideo.videoWidth, heroVideo.videoHeight, box.width, box.height);
  }
  if (!px) return;
  homeInkTargets.forEach(([target, area]) => target.classList.toggle('ink-dark', isLightUnder(px, relRect(area, box))));
}
setInterval(updateHomeInk, 700);

// Works list: each slide's picture is sampled once it has loaded.
const slidePixels = [];
const worksOverlays = [...document.querySelectorAll('.works-back, .works-filter, .works-view')];
let activeIndex = 0;

works.forEach((work, i) => {
  const img = new Image();
  img.onload = () => {
    const w = slides[i].offsetWidth || innerWidth;
    const h = slides[i].offsetHeight || innerHeight;
    slidePixels[i] = coverPixels(img, img.naturalWidth, img.naturalHeight, w, h);
    const slide = slides[i];
    const sb = slide.getBoundingClientRect();
    const title = relRect(slide.querySelector('.work-slide-title'), sb);
    const sub = relRect(slide.querySelector('.work-slide-sub'), sb);
    const text = { left: Math.min(title.left, sub.left), right: Math.max(title.right, sub.right), top: sub.top, bottom: title.bottom };
    if (slidePixels[i] && sb.width) slide.classList.toggle('ink-dark', isLightUnder(slidePixels[i], text));
    if (i === activeIndex) updateWorksInk(i);
  };
  img.src = workImage(work, 'full');
});

// The fixed labels (Back, filters, List/Grid) follow the slide on screen; on the grid they sit on black.
function updateWorksInk(i) {
  activeIndex = i;
  const px = currentView === 'list' ? slidePixels[i] : null;
  worksOverlays.forEach(el => {
    // The slide on screen starts at the top-left of the viewport.
    el.classList.toggle('ink-dark', !!px && isLightUnder(px, el.getBoundingClientRect()));
  });
}
// Initial page: honour a direct link such as …/tria-prima/#works.
const initialPage = pageFromHash();
history.replaceState({ page: initialPage }, '');
revealPage(initialPage);
document.title = pageTitle(initialPage);
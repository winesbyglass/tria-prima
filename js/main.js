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
  document.addEventListener(type, () => { if (!home.hidden && heroVideo.paused) playHero(); }, { once: true, passive: true });
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && !home.hidden) playHero(); });

// ---------- Page navigation ----------
function revealPage(target) {
  home.hidden = target !== 'home';
  document.body.classList.toggle('on-home', target === 'home');
  pages.forEach(page => {
    const active = page.id === target;
    page.hidden = !active;
    page.classList.toggle('active', active);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (target === 'home') playHero();
  else pauseHero();
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
  const rect = source ? source.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  transition.style.setProperty('--x', `${rect.left + rect.width / 2}px`);
  transition.style.setProperty('--y', `${rect.top + rect.height / 2}px`);
  transition.classList.remove('running');
  void transition.offsetWidth;
  transition.classList.add('running');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(() => {
    revealPage(target);
    document.title = pageTitle(target);
  }, reduceMotion ? 0 : 850);
  window.setTimeout(() => {
    transition.classList.remove('running');
    navigating = false;
    // Back pressed again mid-transition: catch up with where history now is.
    const current = pageFromHash();
    if (current !== target) navigate(current, null, true);
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

// ---------- Project video modal ----------
const gallery = document.getElementById('gallery');
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
  showEmbed(work, episodes.length ? episodes[0].id : work.media.id);
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

works.forEach(work => {
  const button = document.createElement('button');
  button.className = 'project';
  button.type = 'button';
  const visual = document.createElement('span');
  visual.className = 'project-visual';
  visual.style.backgroundImage = `url("${work.thumb}")`;
  const title = document.createElement('span');
  title.className = 'project-title';
  title.textContent = work.title;
  const type = document.createElement('span');
  type.className = 'project-type';
  type.textContent = `${work.type} · ${work.year}`.toUpperCase();
  button.append(visual, title, type);
  button.addEventListener('click', () => openWork(work));
  gallery.append(button);
});

function closeModal() {
  modalFrame.replaceChildren();
  modalEpisodes.replaceChildren();
  filmModal.classList.remove('open');
  filmModal.hidden = true;
}
document.getElementById('modalClose').addEventListener('click', closeModal);
filmModal.addEventListener('click', event => { if (event.target === filmModal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !filmModal.hidden) closeModal(); });

// Initial page: honour a direct link such as …/tria-prima/#works.
const initialPage = pageFromHash();
history.replaceState({ page: initialPage }, '');
revealPage(initialPage);
document.title = pageTitle(initialPage);

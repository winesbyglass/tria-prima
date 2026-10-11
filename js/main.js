'use strict';

const home = document.getElementById('home');
const pages = [...document.querySelectorAll('.page')];
const transition = document.getElementById('transition');
const heroVideo = document.getElementById('heroVideo');
const filmModal = document.getElementById('filmModal');
const modalFrame = document.getElementById('modalFrame');
let heroPlayer = null;
let navigating = false;

// ---------- Hero background film (Vimeo background mode) ----------
function initHeroVideo() {
  const id = heroVideo.dataset.vimeoId;
  if (!id) return;
  const iframe = document.createElement('iframe');
  iframe.src = `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&playsinline=1&dnt=1`;
  iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  iframe.title = 'Featured Tria Prima film';
  iframe.tabIndex = -1;
  heroVideo.appendChild(iframe);

  if (window.Vimeo && window.Vimeo.Player) {
    heroPlayer = new window.Vimeo.Player(iframe);
    const reveal = () => { heroVideo.dataset.loaded = 'true'; };
    heroPlayer.on('play', reveal);
    heroPlayer.on('timeupdate', reveal);
  } else {
    // API script blocked: reveal once the iframe has loaded.
    iframe.addEventListener('load', () => { heroVideo.dataset.loaded = 'true'; });
  }
}

function playHero() { if (heroPlayer) heroPlayer.play().catch(() => {}); }
function pauseHero() { if (heroPlayer) heroPlayer.pause().catch(() => {}); }

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

function navigate(target, source) {
  if (navigating || !['home', 'works', 'process', 'contact'].includes(target)) return;
  if ((target === 'home' && !home.hidden) || (target !== 'home' && !document.getElementById(target).hidden)) return;
  navigating = true;
  const rect = source.getBoundingClientRect();
  transition.style.setProperty('--x', `${rect.left + rect.width / 2}px`);
  transition.style.setProperty('--y', `${rect.top + rect.height / 2}px`);
  transition.classList.remove('running');
  void transition.offsetWidth;
  transition.classList.add('running');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(() => {
    revealPage(target);
    document.title = `TRIA PRIMA — ${target === 'home' ? 'Film & Media' : target[0].toUpperCase() + target.slice(1)}`;
  }, reduceMotion ? 0 : 850);
  window.setTimeout(() => {
    transition.classList.remove('running');
    navigating = false;
  }, reduceMotion ? 25 : 1360);
}

document.querySelectorAll('[data-target]').forEach(button => {
  button.addEventListener('click', () => navigate(button.dataset.target, button));
});
document.querySelectorAll('[data-home]').forEach(button => {
  button.addEventListener('click', () => navigate('home', button));
});

// ---------- Project video modal ----------
document.querySelectorAll('[data-vimeo]').forEach(button => {
  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${button.dataset.vimeo}?autoplay=1&title=0&byline=0&portrait=0&color=000000&dnt=1`;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title = button.querySelector('.project-title').textContent;
    modalFrame.replaceChildren(iframe);
    filmModal.hidden = false;
    filmModal.classList.add('open');
  });
});

function closeModal() {
  modalFrame.replaceChildren();
  filmModal.classList.remove('open');
  filmModal.hidden = true;
}
document.getElementById('modalClose').addEventListener('click', closeModal);
filmModal.addEventListener('click', event => { if (event.target === filmModal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !filmModal.hidden) closeModal(); });

document.body.classList.add('on-home');
initHeroVideo();

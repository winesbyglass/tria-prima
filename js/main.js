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
document.querySelectorAll('[data-video]').forEach(button => {
  button.addEventListener('click', () => {
    const video = document.createElement('video');
    video.src = button.dataset.video;
    video.controls = true;
    video.playsInline = true;
    video.autoplay = true;
    video.title = button.querySelector('.project-title').textContent;
    modalFrame.replaceChildren(video);
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
playHero();

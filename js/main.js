'use strict';

const home = document.getElementById('home');
const pages = [...document.querySelectorAll('.page')];
const transition = document.getElementById('transition');
const heroVideo = document.getElementById('heroVideo');
const filmModal = document.getElementById('filmModal');
const modalFrame = document.getElementById('modalFrame');
let navigating = false;

// Phones: a work may use another cover picture / text colour there (works.js "phone").
if (window.matchMedia('(max-width: 800px)').matches) works.forEach(work => { if (work.phone) Object.assign(work, work.phone); });

// ---------- Site bar on every page except home ----------
// TRIA PRIMA at top left (back to home) and HOME plus one link per .page at top right. Built
// from the page sections themselves, so a page added later gets the same bar and is linked.
// data-nav="none" keeps a page out of the links; data-nav-current names the link it lights.
const navPages = pages.filter(page => page.dataset.nav !== 'none').map(page => page.id);
pages.forEach(page => {
  const lit = page.dataset.navCurrent || page.id;
  const bar = document.createElement('header');
  bar.className = 'site-bar';
  const brand = document.createElement('button');
  brand.type = 'button';
  brand.className = 'site-brand';
  brand.textContent = 'TRIA PRIMA';
  brand.setAttribute('aria-label', 'TRIA PRIMA, home');
  brand.dataset.home = '';
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Site');
  ['home', ...navPages].forEach(id => {
    const link = document.createElement('button');
    link.type = 'button';
    link.textContent = id.toUpperCase();
    if (id === 'home') link.dataset.home = '';
    else link.dataset.target = id;
    link.classList.toggle('current', id === lit);
    if (id === lit) link.setAttribute('aria-current', 'page');
    nav.append(link);
  });
  bar.append(brand, nav, menuButton());
  page.prepend(bar);
});

// ---------- Phones: a three-line menu button on every page opens a full-screen menu ----------
function menuButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'menu-toggle';
  button.setAttribute('aria-label', 'Menu');
  button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML = '<span></span><span></span><span></span>';
  button.addEventListener('click', openMenu);
  return button;
}
document.querySelector('.topline').append(menuButton());

const siteMenu = document.createElement('div');
siteMenu.className = 'site-menu';
siteMenu.hidden = true;
siteMenu.setAttribute('role', 'dialog');
siteMenu.setAttribute('aria-modal', 'true');
siteMenu.setAttribute('aria-label', 'Menu');
const menuClose = document.createElement('button');
menuClose.type = 'button';
menuClose.className = 'site-menu-close';
menuClose.setAttribute('aria-label', 'Close menu');
menuClose.innerHTML = '<span></span><span></span>';
menuClose.addEventListener('click', closeMenu);
const menuList = document.createElement('nav');
menuList.className = 'site-menu-list';
menuList.setAttribute('aria-label', 'Site');
['home', ...navPages].forEach(id => {
  const link = document.createElement('button');
  link.type = 'button';
  link.textContent = id.toUpperCase();
  link.dataset.menu = id;
  if (id === 'home') link.dataset.home = '';
  else link.dataset.target = id;
  link.addEventListener('click', closeMenu);
  menuList.append(link);
});
siteMenu.append(menuClose, menuList);
document.body.append(siteMenu);

function openMenu() {
  // The page on show is the lit one (a project page lights WORKS).
  const page = pages.find(p => !p.hidden);
  const lit = page ? page.dataset.navCurrent || page.id : 'home';
  menuList.querySelectorAll('button').forEach(b => b.classList.toggle('current', b.dataset.menu === lit));
  siteMenu.hidden = false;
  document.documentElement.classList.add('lightbox-open');
  menuClose.focus({ preventScroll: true });
}
function closeMenu() {
  siteMenu.hidden = true;
  document.documentElement.classList.remove('lightbox-open');
}
document.addEventListener('keydown', event => { if (!siteMenu.hidden && event.key === 'Escape') closeMenu(); });
// ---------- Hero background film (muted MP4 autoplay) ----------
function playHero() {
  heroVideo.muted = true;
  heroVideo.play().catch(() => {});
}
function pauseHero() { heroVideo.pause(); }

// Some browsers hold autoplay (iOS Low Power Mode, data saver, in-app browsers) until the
// visitor touches the page: any touch, tap, swipe or key then starts the film. These stay
// on, so a later touch still works if an earlier one didn't get through.
['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'].forEach(type => {
  document.addEventListener(type, () => { if (filmShowing() && heroVideo.paused) playHero(); }, { passive: true, capture: true });
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
  // Leaving a project page stops its film.
  if (target !== 'project') projectBody.replaceChildren();
  updateWorksSnap();
  window.scrollTo({ top: 0, behavior: 'instant' });
  updateToTop();
  // Works always comes back on ALL WORK.
  if (target === 'works' && currentFilter !== 'all') {
    applyFilter('all');
    worksReturnScroll = null;
  }
  // Phones: Works always opens in the List view.
  if (target === 'works' && currentView !== 'list' && window.matchMedia('(max-width: 800px)').matches) {
    setView('list');
    worksReturnScroll = null;
  }
  if (target === 'works') fillRemainingSlides();
  // Process always opens on Production services.
  if (target === 'process') selectTab(0);
  // Contact never opens straight onto a founder's photo; other pages never show one.
  if (target === 'contact') armFounders();
  else if (founderOn >= 0) closeFounder();
  // The home page always opens on Motion (the film), whatever was showing before.
  if (target === 'home') resetToFilm();
  // On the home page only one of film / slideshow runs, depending on the page-turn state.
  if (target === 'home' && !home.classList.contains('photo-mode')) playHero();
  else pauseHero();
  if (target === 'home' && home.classList.contains('photo-mode')) startSlideshow();
  else stopSlideshow();
}

const PAGES = ['home', ...navPages];

// Routes: a page id (home, works, process, contact) or "work/<slug>" for a project page.
const pageOfRoute = route => (route.startsWith('work/') ? 'project' : route);
const workOfRoute = route => works.find(work => `work/${work.slug}` === route);
let currentRoute = null;
let worksReturnScroll = null;   // where to put the Works list back after visiting a project

function routeTitle(route) {
  const work = workOfRoute(route);
  if (work) return `TRIA PRIMA — ${work.title}`;
  return `TRIA PRIMA — ${route === 'home' ? 'Film & Media' : route[0].toUpperCase() + route.slice(1)}`;
}

function routeFromHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (workOfRoute(hash)) return hash;
  return PAGES.includes(hash) ? hash : 'home';
}

function showRoute(route) {
  const page = pageOfRoute(route);
  if (page === 'project') renderProject(workOfRoute(route));
  revealPage(page);
  if (page === 'works' && worksReturnScroll !== null) {
    window.scrollTo({ top: worksReturnScroll, behavior: 'instant' });
    worksReturnScroll = null;
  }
  currentRoute = route;
  document.title = routeTitle(route);
}

// Each page and project gets its own history entry (#works, #work/early-years ...), so the
// browser Back button works. fromHistory: triggered by Back/Forward, so don't push an entry.
function navigate(route, source, fromHistory = false) {
  if (navigating || (!PAGES.includes(route) && !workOfRoute(route)) || route === currentRoute) return;
  navigating = true;
  if (currentRoute === 'works' && pageOfRoute(route) === 'project') worksReturnScroll = window.scrollY;
  if (!fromHistory) history.pushState({ route }, '', route === 'home' ? location.pathname : `#${route}`);
  letterboxWipe(route, () => showRoute(route), () => {
    navigating = false;
    // Back pressed again mid-transition: catch up with where history now is.
    const current = routeFromHash();
    if (current !== route) navigate(current, null, true);
  });
}
// Widescreen letterbox: black bars close from top and bottom, the destination is named in the
// slit, then they open. onCovered runs while the screen is shut.
const transitionTitle = document.getElementById('transitionTitle');
const LB_MS = 1150;

function routeLabel(route) {
  const work = workOfRoute(route);
  if (work) return work.title;
  return route === 'home' ? 'TRIA PRIMA' : route;
}

function letterboxWipe(route, onCovered, onDone) {
  transitionTitle.textContent = routeLabel(route);
  transition.classList.remove('running');
  void transition.offsetWidth;
  transition.classList.add('running');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(onCovered, reduceMotion ? 0 : LB_MS * 0.42);
  window.setTimeout(() => {
    transition.classList.remove('running');
    onDone();
  }, reduceMotion ? 25 : LB_MS + 30);
}
window.addEventListener('popstate', () => {
  if (!filmModal.hidden) closeModal();
  if (!lightbox.hidden) closeLightbox();
  if (founderOn >= 0) closeFounder();
  navigate(routeFromHash(), null, true);
});

document.querySelectorAll('[data-target]').forEach(button => {
  button.addEventListener('click', () => navigate(button.dataset.target, button));
});
document.querySelectorAll('[data-home]').forEach(button => {
  button.addEventListener('click', () => navigate('home', button));
});


// ---------- Work modal (film embed or photograph) ----------
const modalEpisodes = document.getElementById('modalEpisodes');

function embedUrl(media, id, autoplay = true) {
  const auto = autoplay ? 1 : 0;
  // Google Drive's player (the file must be shared with anyone who has the link; no autoplay).
  if (media.type === 'gdrive') return `https://drive.google.com/file/d/${id}/preview`;
  if (media.type === 'vimeo') return `https://player.vimeo.com/video/${id}?autoplay=${auto}&title=0&byline=0&portrait=0&color=000000`;
  return `https://www.youtube.com/embed/${id}?rel=0&autoplay=${auto}${media.start ? `&start=${media.start}` : ''}`;
}

function showEmbed(work, id) {
  const iframe = document.createElement('iframe');
  iframe.src = embedUrl(work.media, id);
  iframe.title = work.title;
  iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  iframe.allowFullscreen = true;
  modalFrame.replaceChildren(iframe);
}

// Clicks on works are ignored mid-transition and just after one, so a quick second click on
// List/Grid or a filter can't fall through to the work that has just appeared underneath.
let workClicksBlockedUntil = 0;
const blockWorkClicks = ms => { workClicksBlockedUntil = Math.max(workClicksBlockedUntil, Date.now() + ms); };

// ---------- Project page (#work/<slug>) ----------
// Fixed title / director / year at the top; a film in a framed player (video projects);
// a row of pictures where one is open and the rest are folded strips; then the write-up,
// credits, festivals and distribution.
const projectHead = document.getElementById('projectHead');
const projectBody = document.getElementById('projectBody');

function openProject(work, source) {
  if (navigating || Date.now() < workClicksBlockedUntil) return;
  navigate(`work/${work.slug}`, source);
}

function projectFrame(work, id) {
  const iframe = document.createElement('iframe');
  iframe.src = embedUrl(work.media, id, false);
  iframe.title = work.title;
  iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
  iframe.allowFullscreen = true;
  return iframe;
}

function renderProject(work) {
  // Title, client (only when there is one and it isn't the title again), year.
  const sameAsTitle = work.client && work.client.trim().toLowerCase() === work.title.trim().toLowerCase();
  projectHead.replaceChildren(...[work.title, sameAsTitle ? '' : work.client, work.year].filter(Boolean).map(text => el('span', '', text)));
  const isPhoto = work.kind === 'photo';
  const parts = [];

  // Pictures first: one open, the rest folded strips. On video projects every still carries
  // the client and role, shown while it is the open one.
  // Photo projects fold just their first five photographs; the previews below show them all.
  const pictures = isPhoto ? work.photos.slice(0, 5) : (work.stills || []);
  if (pictures.length) {
    const gallery = el('section', 'project-gallery');
    gallery.setAttribute('aria-label', isPhoto ? 'Photographs' : 'Stills');
    pictures.forEach((img, k) => {
      const item = el('button', k === 0 ? 'gallery-item open' : 'gallery-item');
      item.type = 'button';
      item.style.backgroundImage = `url("${workImage({ img }, 'full')}")`;
      item.setAttribute('aria-label', `${work.title} ${k + 1} / ${pictures.length}`);
      if (!isPhoto) {
        const caption = el('span', 'gallery-caption');
        // Client only when the project has one.
        if (work.client) {
          const client = el('span', 'gallery-fact');
          client.append(el('small', '', 'Client :'), el('span', '', work.client));
          caption.append(client);
        }
        const role = el('span', 'gallery-fact');
        role.append(el('small', '', 'Role :'), el('span', '', work.role || '[ROLE]'));
        caption.append(role);
        item.append(caption);
      }
      item.addEventListener('click', () => {
        // Clicking the open picture (on phones, any picture) shows it whole, full screen.
        if (item.classList.contains('open') || phoneHome.matches) { openLightbox(pictures, k, work.title); return; }
        gallery.querySelectorAll('.gallery-item').forEach(other => other.classList.toggle('open', other === item));
      });
      gallery.append(item);
    });
    // A long row follows the pointer: left edge = first picture, right edge = last.
    gallery.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const overflow = gallery.scrollWidth - gallery.clientWidth;
      if (overflow <= 0) return;
      const r = gallery.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, ((event.clientX - r.left) / r.width - 0.1) / 0.8));
      gallery.scrollLeft = t * overflow;
    });
    // Phones: the pictures sit side by side at full width; the row is moved by the site itself
    // (not the browser's scrolling), so it follows the finger, turns one picture per swipe in
    // .3s, and a tap always opens the picture, even mid-turn. A counter and a faint SWIPE
    // underneath say so.
    const wrap = el('div', 'gallery-wrap');
    wrap.append(gallery);
    let at = 0;
    let swipeBar = null;
    let count = null;
    const total = String(pictures.length).padStart(2, '0');
    const showAt = () => {
      gallery.style.setProperty('--at', at);
      if (count) count.textContent = `${String(at + 1).padStart(2, '0')} / ${total}`;
    };
    if (pictures.length > 1) {
      count = el('span', 'gallery-count');
      swipeBar = el('div', 'gallery-swipe');
      swipeBar.append(count, el('span', 'gallery-hint', 'Swipe'));
      wrap.append(swipeBar);
    }
    showAt();

    let touch = null;
    let tappedAt = 0;
    gallery.addEventListener('touchstart', event => {
      if (!phoneHome.matches || event.touches.length !== 1) return;
      touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, t: Date.now(), sideways: null };
    }, { passive: true });
    gallery.addEventListener('touchmove', event => {
      if (!touch) return;
      const dx = event.touches[0].clientX - touch.x;
      const dy = event.touches[0].clientY - touch.y;
      if (touch.sideways === null && Math.hypot(dx, dy) > 8) touch.sideways = Math.abs(dx) > Math.abs(dy);
      if (!touch.sideways) return; // up / down: the page scrolls as usual
      event.preventDefault();
      // Follow the finger, with some give past the first and last picture.
      const edge = (at === 0 && dx > 0) || (at === pictures.length - 1 && dx < 0);
      gallery.classList.add('dragging');
      gallery.style.setProperty('--drag', `${edge ? dx / 3 : dx}px`);
    }, { passive: false });
    const endTouch = event => {
      if (!touch) return;
      const t = event.changedTouches[0];
      const dx = t.clientX - touch.x;
      const still = Math.hypot(dx, t.clientY - touch.y) < 10 && Date.now() - touch.t < 500;
      const sideways = touch.sideways;
      touch = null;
      gallery.classList.remove('dragging');
      gallery.style.setProperty('--drag', '0px');
      if (event.type === 'touchend' && still) {
        event.preventDefault(); // no click after it as well
        tappedAt = Date.now();
        openLightbox(pictures, at, work.title);
        return;
      }
      if (sideways && Math.abs(dx) > 40) {
        at = Math.min(pictures.length - 1, Math.max(0, at + (dx < 0 ? 1 : -1)));
        if (swipeBar) swipeBar.classList.add('hint-done');
      }
      showAt();
    };
    gallery.addEventListener('touchend', endTouch);
    gallery.addEventListener('touchcancel', endTouch);
    gallery.addEventListener('click', event => {
      if (Date.now() - tappedAt < 600) event.stopPropagation();
    }, true);
    parts.push(wrap);
  }

  // Then the film, framed with wide margins.
  if (!isPhoto) {
    const film = el('section', 'project-film');
    const frame = el('div', 'project-frame');
    const episodes = work.media.episodes || [];
    frame.append(projectFrame(work, episodes.length ? episodes[0].id : work.media.id));
    // A cover picture over players that have none of their own (Google Drive); clicking it
    // uncovers the player underneath.
    if (work.poster) {
      const poster = el('button', 'project-poster');
      poster.type = 'button';
      poster.setAttribute('aria-label', `Play ${work.title}`);
      poster.style.backgroundImage = `url("${workImage({ img: work.poster }, 'full')}")`;
      poster.append(el('span', 'project-play'));
      poster.addEventListener('click', () => poster.remove());
      frame.append(poster);
    }    film.append(frame);
    if (episodes.length) {
      const picker = el('div', 'project-episodes');
      episodes.forEach((episode, k) => {
        const b = el('button', k === 0 ? 'active' : '', episode.label);
        b.type = 'button';
        b.addEventListener('click', () => {
          frame.replaceChildren(projectFrame(work, episode.id));
          picker.querySelectorAll('button').forEach(other => other.classList.toggle('active', other === b));
        });
        picker.append(b);
      });
      film.append(picker);
    }
    parts.push(film);
  }

  // The write-up laid out across the page, so it reads without much scrolling:
  // about | credits (flowing into columns) | festivals & distribution.
  const info = el('section', 'project-info');
  const about = el('div', 'project-about');
  about.append(el('p', 'project-meta', [work.type, work.medium, work.duration, work.year].filter(Boolean).join(' · ')));
  (work.description || '').split(/\n\s*\n/).forEach(text => about.append(el('p', 'project-desc', text)));
  info.append(about);

  const creditsCol = el('div', 'project-col');
  const credits = el('div', 'project-credits');
  credits.classList.toggle('long', work.credits.length > 8);
  work.credits.forEach(([role, name]) => {
    const row = el('div', 'credit');
    row.append(el('span', 'credit-role', role), el('span', 'credit-name', name));
    credits.append(row);
  });
  creditsCol.append(el('h3', '', 'Credits'), credits);
  info.append(creditsCol);

  const extras = el('div', 'project-col');
  if (work.festivals && work.festivals.length) {
    const list = el('ul', 'project-list');
    work.festivals.forEach(([name, country]) => list.append(el('li', '', `${name} — ${country}`)));
    extras.append(el('h3', '', 'Festivals'), list);
  }
  if (work.partners && work.partners.length) {
    const list = el('ul', 'project-list');
    work.partners.forEach(partner => {
      const li = el('li');
      const a = el('a', '', partner.name);
      a.href = partner.href;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
      list.append(li);
    });
    extras.append(el('h3', '', 'Distribution'), list);
  }
  if (extras.childElementCount) info.append(extras);
  info.classList.toggle('two-col', !extras.childElementCount);
  parts.push(info);

  // Photo projects: every photograph as a small preview; each opens full screen.
  if (isPhoto) {
    const previews = el('section', 'project-previews');
    previews.append(el('h3', '', `All photographs (${work.photos.length})`));
    const grid = el('div', 'preview-grid');
    work.photos.forEach((img, k) => {
      const b = el('button', 'preview-item');
      b.type = 'button';
      b.setAttribute('aria-label', `${work.title} ${k + 1} / ${work.photos.length}, full screen`);
      const pic = el('img');
      pic.src = workImage({ img }, 'full');
      pic.alt = '';
      pic.loading = 'lazy';
      pic.decoding = 'async';
      b.append(pic);
      b.addEventListener('click', () => openLightbox(work.photos, k, work.title));
      grid.append(b);
    });
    previews.append(grid);
    parts.push(previews);
  }

  // Each part is a section of its own: one wheel notch turns from one to the next.
  projectBody.replaceChildren(...parts.map(part => {
    const section = el('div', 'project-section');
    section.append(part);
    return section;
  }));
}

// ---------- Full-screen photo viewer ----------
const lightbox = el('div', 'lightbox');
lightbox.hidden = true;
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
const chevron = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>';
lightbox.innerHTML = `
  <img class="lightbox-img" alt="">
  <button class="lightbox-nav prev" type="button" aria-label="Previous photograph">${chevron}</button>
  <button class="lightbox-nav next" type="button" aria-label="Next photograph">${chevron}</button>
  <button class="lightbox-close" type="button" aria-label="Close">×</button>
  <p class="lightbox-count"></p>`;
document.body.append(lightbox);
const lightboxImg = lightbox.querySelector('.lightbox-img');
const lightboxCount = lightbox.querySelector('.lightbox-count');
let lightboxSet = [];
let lightboxAt = 0;
let lightboxTitle = '';

function showLightbox(n) {
  lightboxAt = (n + lightboxSet.length) % lightboxSet.length;
  lightboxImg.src = workImage({ img: lightboxSet[lightboxAt] }, 'full');
  lightboxImg.alt = `${lightboxTitle} ${lightboxAt + 1} / ${lightboxSet.length}`;
  lightboxCount.textContent = `${String(lightboxAt + 1).padStart(2, '0')} / ${String(lightboxSet.length).padStart(2, '0')}`;
}

function openLightbox(set, n, title) {
  lightboxSet = set;
  lightboxTitle = title;
  lightbox.setAttribute('aria-label', title);
  showLightbox(n);
  lightbox.hidden = false;
  document.documentElement.classList.add('lightbox-open');
  lightbox.querySelector('.lightbox-close').focus({ preventScroll: true });
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.removeAttribute('src');
  document.documentElement.classList.remove('lightbox-open');
}

lightbox.querySelector('.prev').addEventListener('click', () => showLightbox(lightboxAt - 1));
lightbox.querySelector('.next').addEventListener('click', () => showLightbox(lightboxAt + 1));
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
// Phones: no arrows; a left / right swipe changes the photograph.
let lightboxTouch = null;
lightbox.addEventListener('touchstart', event => {
  if (event.touches.length === 1) lightboxTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
lightbox.addEventListener('touchmove', event => {
  if (!lightboxTouch || event.touches.length !== 1) return;
  if (Math.abs(event.touches[0].clientX - lightboxTouch.x) > Math.abs(event.touches[0].clientY - lightboxTouch.y)) event.preventDefault();
}, { passive: false });
lightbox.addEventListener('touchend', event => {
  if (!lightboxTouch) return;
  const dx = event.changedTouches[0].clientX - lightboxTouch.x;
  const dy = event.changedTouches[0].clientY - lightboxTouch.y;
  lightboxTouch = null;
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
  lightboxSwiped = Date.now();
  showLightbox(lightboxAt + (dx < 0 ? 1 : -1));
});
let lightboxSwiped = 0;
lightbox.addEventListener('click', event => {
  // (A swipe that ends on the backdrop is not a tap on it.)
  if (event.target === lightbox && Date.now() - lightboxSwiped > 400) closeLightbox();
});
document.addEventListener('keydown', event => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  else if (event.key === 'ArrowLeft') showLightbox(lightboxAt - 1);
  else if (event.key === 'ArrowRight') showLightbox(lightboxAt + 1);
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
  return work.kind === 'photo' ? `${work.type} · ${work.year} · ${work.photos.length} photos` : `${work.client || work.type} · ${work.year}`;
}

const slides = [];
const thumbs = [];
const SLICES = 8;   // horizontal slices per strip thumbnail (for the curved roll-up)
const gridItems = [];

works.forEach((work, i) => {
  const slide = el('button', 'work-slide');
  slide.type = 'button';
  // A plain drawn arrow (the ↗ character turns into an emoji-style icon on some phones).
  const cta = el('span', 'work-slide-cta', 'VIEW PROJECT');
  cta.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" aria-hidden="true"><path d="M2 8 8 2M3.5 2H8v4.5"/></svg>');
  slide.append(el('span', 'work-slide-sub', workSub(work)), el('span', 'work-slide-title', work.title), cta);
  slide.addEventListener('click', () => openProject(work, slide));
  slide.dataset.index = i;
  slides.push(slide);

  const thumb = el('button', 'strip-thumb');
  thumb.type = 'button';
  // The picture is carried by horizontal slices so the frame can bend round the roll-up axis.
  // Absolute URL: a url() passed through a custom property resolves against the stylesheet.
  thumb.style.setProperty('--img', `url("${new URL(workImage(work, 'thumb'), location.href).href}")`);
  const probe = new Image();
  probe.onload = () => { thumb.dataset.iw = probe.naturalWidth; thumb.dataset.ih = probe.naturalHeight; };
  probe.src = workImage(work, 'thumb');
  for (let k = 0; k < SLICES; k++) {
    const slice = el('span', 'strip-slice');
    slice.style.setProperty('--k', k);
    thumb.append(slice);
  }
  thumb.setAttribute('aria-label', work.title);
  thumb.addEventListener('click', () => slide.scrollIntoView({ behavior: 'smooth' }));
  thumbs.push(thumb);

  const item = el('button', 'grid-item');
  item.type = 'button';
  item.style.backgroundImage = `url("${workImage(work, 'mid')}")`;
  const info = el('span', 'grid-info');
  info.append(el('span', 'grid-info-sub', workSub(work)), el('span', 'grid-info-title', work.title));
  item.append(info);
  item.addEventListener('click', () => openProject(work, item));
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
const stripHoles = el('div', 'strip-holes');
stripTrack.append(stripHoles, ...thumbs);
stripWindow.append(stripTrack);
workStrip.append(stripWindow);
workGrid.append(...gridItems);
document.getElementById('countMotion').textContent = `(${motionWorks.length})`;
document.getElementById('countPhoto').textContent = `(${photoWorks.length})`;

const stripMaxShift = () => Math.max(0, stripTrack.offsetHeight - stripWindow.clientHeight);
const setStripShift = px => { stripTrack.style.transform = `translateY(${-Math.min(stripMaxShift(), Math.max(0, px))}px)`; };
let stripHovered = false;
let stripWork = -1;       // the work the strip last showed as current
let stripParked = false;  // the pointer left the strip: it stays put until the work changes

function setActiveThumb(i) {
  const changed = i !== stripWork;
  stripWork = i;
  thumbs.forEach((thumb, j) => thumb.classList.toggle('active', j === i));
  updateWorksInk(i);
  // While the pointer is browsing the strip it stays where the pointer put it.
  if (stripHovered) return;
  // Parked after the pointer left: stays put until the work changes.
  if (stripParked) {
    if (!changed) return;
    stripParked = false;
  }
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
// Leaving the strip parks it where it is (the thumbnails go back to their normal size);
// it moves again only when the pointer comes back, or when another work comes up.
workStrip.addEventListener('pointerleave', event => {
  if (event.pointerType !== 'mouse') return;
  stripHovered = false;
  workStrip.classList.remove('browsing');
  stripParked = true;
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

document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
  blockWorkClicks(400);
  if (navigating || b.dataset.filter === currentFilter) return;
  navigating = true;
  filterWorks(b.dataset.filter, () => { navigating = false; blockWorkClicks(400); });
}));

// ALL WORK / MOTION / PHOTOGRAPHY, animated like the List <-> Grid morph (same timing, easing
// and stagger). Grid: works that stay glide to their new squares, works that go shrink away,
// works that arrive grow in. List: the work on screen steps back and fades, uncovering the
// first work of the new selection, whose title rises in; the strip's frames fade in one by one.
function filterWorks(filter, onDone) {
  const duration = 750;
  const stagger = 18;
  const easing = 'cubic-bezier(.62,0,.23,1)';
  const layer = el('div', 'morph-layer');
  const box = r => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  const shrink = r => ({ left: r.left + r.width * 0.15, top: r.top + r.height * 0.15, width: r.width * 0.7, height: r.height * 0.7 });
  const onScreen = r => r && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  const shown = () => works.map((_, i) => i).filter(i => !gridItems[i].hidden);
  const hidden = [];
  let count = 0;

  if (currentView === 'grid') {
    const before = new Map(shown().map(i => [i, gridItems[i].getBoundingClientRect()]));
    applyFilter(filter);
    const after = new Map(shown().map(i => [i, gridItems[i].getBoundingClientRect()]));
    new Set([...before.keys(), ...after.keys()]).forEach(i => {
      const from = before.get(i);
      const to = after.get(i);
      if (!onScreen(from) && !onScreen(to)) return;
      const flyer = el('span');
      flyer.style.backgroundImage = `url("${workImage(works[i], 'mid')}")`;
      layer.append(flyer);
      const frames = from && to ? [{ ...box(from), opacity: 1 }, { ...box(to), opacity: 1 }]
        : to ? [{ ...box(shrink(to)), opacity: 0 }, { ...box(to), opacity: 1 }]
        : [{ ...box(from), opacity: 1 }, { ...box(shrink(from)), opacity: 0 }];
      flyer.animate(frames, { duration, delay: count++ * stagger, easing, fill: 'both' });
    });
    after.forEach((_, i) => { gridItems[i].style.visibility = 'hidden'; hidden.push(gridItems[i]); });
  } else {
    // The work on screen, copied (picture and title) so it can step back over the new list.
    const old = slides[activeIndex].cloneNode(true);
    old.style.cssText += ';position:absolute;inset:0;width:100%;height:100%;';
    layer.append(old);
    applyFilter(filter);
    old.animate([{ transform: 'scale(1)', opacity: 1, borderRadius: '0px' }, { transform: 'scale(.86)', opacity: 0, borderRadius: '14px' }],
      { duration, easing, fill: 'both' });
    const first = slides.find(slide => !slide.hidden);
    if (first) {
      first.querySelectorAll('.work-slide-sub, .work-slide-title, .work-slide-cta').forEach((text, k) => {
        text.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
          { duration: duration * 0.7, delay: duration * 0.35 + k * 60, easing, fill: 'backwards' });
      });
    }
    thumbs.filter(thumb => !thumb.hidden).forEach(thumb => {
      thumb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration * 0.6, delay: 150 + count++ * stagger, easing: 'ease', fill: 'backwards' });
    });
  }
  document.body.append(layer);
  // Timer rather than animation promises, which can stall in a background tab.
  setTimeout(() => {
    hidden.forEach(node => { node.style.visibility = ''; });
    layer.remove();
    onDone();
  }, duration + count * stagger + 60);
}
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
  blockWorkClicks(400);
  if (navigating || b.dataset.view === currentView) return;
  navigating = true;
  morphView(b.dataset.view, () => { navigating = false; blockWorkClicks(400); });
}));

// ---------- Film roll-up: frames bend round an invisible axis at each end and vanish ----------
// Moving to the next work runs the film upward, so frames roll away over the top; going back
// runs it downward and they roll away at the bottom. Each thumbnail is made of horizontal
// slices; past the tangent line every slice is laid on a cylinder of radius ROLL_R by its own
// arc length, so the frame curves smoothly over the axis instead of flipping as a whole. A
// slice that has swung behind the axis shows its (hidden) back face, then fades away.
const ROLL_R = 40;        // px, radius of the invisible axis
const ROLL_T = 72;        // px from each edge where the film starts to wrap
const ROLL_GONE = 2.2;    // radians: by here a slice has faded out behind the axis
const rollState = new Map();
const HOLE_PITCH = 14;    // px between sprocket holes
let holeRows = [];

// One row of holes per pitch down the whole track; rebuilt when the track's length changes
// (filters hide frames).
function buildHoles() {
  const n = Math.ceil(stripTrack.offsetHeight / HOLE_PITCH);
  if (n === holeRows.length) return;
  holeRows = Array.from({ length: n }, (_, r) => {
    const row = el('span', 'hole-row');
    row.style.setProperty('--r', r);
    return row;
  });
  stripHoles.replaceChildren(...holeRows);
  rollState.clear();
}

// The holes wind round the axis exactly like the frames' slices.
function curlHoles(trackY, winH) {
  buildHoles();
  holeRows.forEach((row, r) => {
    const y = trackY + r * HOLE_PITCH + HOLE_PITCH / 2;
    const p = rollAt(y, ROLL_T, 1) || rollAt(y, winH - ROLL_T, -1);
    const key = p ? `${p.dy.toFixed(1)},${p.deg.toFixed(0)}` : 'flat';
    if (rollState.get(row) === key) return;
    rollState.set(row, key);
    if (!p) { row.style.transform = ''; row.style.opacity = ''; row.style.visibility = ''; return; }
    row.style.transform = `perspective(300px) translateY(${p.dy.toFixed(1)}px) translateZ(${p.z.toFixed(1)}px) rotateX(${p.deg.toFixed(1)}deg)`;
    const shade = 1 - 0.65 * Math.min(1, p.theta / (Math.PI / 2));
    row.style.opacity = (shade * Math.min(1, Math.max(0, (ROLL_GONE - p.theta) / 0.8))).toFixed(2);
    row.style.visibility = p.theta >= ROLL_GONE ? 'hidden' : '';
  });
}

function rollAt(y, edge, sign) {
  // y: point on the flat film; edge: tangent line; sign: +1 top (film leaves upward), -1 bottom.
  const s = sign * (edge - y);                 // arc length already wrapped
  if (s <= 0) return null;
  const theta = Math.min(ROLL_GONE, s / ROLL_R); // parked once gone, never winds on
  return {
    dy: edge - sign * ROLL_R * Math.sin(theta) - y,
    z: -ROLL_R * (1 - Math.cos(theta)),
    deg: sign * theta * 180 / Math.PI,
    theta
  };
}

// "cover" crop for a thumbnail's slices, so the sliced frame looks exactly like one picture.
function fitSlices(thumb) {
  const w = thumb.offsetWidth;
  const h = thumb.offsetHeight;
  const iw = Number(thumb.dataset.iw);
  const ih = Number(thumb.dataset.ih);
  if (!w || !h || !iw || !ih || thumb.dataset.fit === `${w}x${h}`) return;
  thumb.dataset.fit = `${w}x${h}`;
  const scale = Math.max(w / iw, h / ih);
  const bw = iw * scale;
  const bh = ih * scale;
  thumb.style.setProperty('--bw', `${bw.toFixed(2)}px`);
  thumb.style.setProperty('--bh', `${bh.toFixed(2)}px`);
  thumb.style.setProperty('--bx', `${((w - bw) / 2).toFixed(2)}px`);
  thumb.style.setProperty('--by', `${((h - bh) / 2).toFixed(2)}px`);
  thumb.style.setProperty('--sh', `${(h / SLICES).toFixed(3)}px`);
}

function curlStrip() {
  requestAnimationFrame(curlStrip);
  if (worksPage.hidden || currentView !== 'list') return;
  const winH = stripWindow.clientHeight;
  if (!winH) return;
  // Positions from layout + the track's live (possibly mid-transition) offset, so the roll
  // itself never feeds back into the measurement.
  const trackY = new DOMMatrixReadOnly(getComputedStyle(stripTrack).transform).f;
  curlHoles(trackY, winH);
  thumbs.forEach(thumb => {

    if (thumb.hidden) return;
    const top = trackY + thumb.offsetTop;
    const h = thumb.offsetHeight;
    fitSlices(thumb);
    const flat = top >= ROLL_T && top + h <= winH - ROLL_T;
    if (flat) {
      if (rollState.get(thumb) === 'flat') return;
      rollState.set(thumb, 'flat');
      thumb.classList.remove('rolling');
      thumb.style.visibility = '';
      thumb.querySelectorAll('.strip-slice').forEach(slice => { slice.style.cssText = `--k:${slice.style.getPropertyValue('--k')}`; });
      return;
    }
    const sh = h / SLICES;
    const parts = [];
    let gone = 0;
    for (let k = 0; k < SLICES; k++) {
      const y = top + (k + 0.5) * sh;
      parts.push(rollAt(y, ROLL_T, 1) || rollAt(y, winH - ROLL_T, -1));
      if (parts[k] && parts[k].theta >= ROLL_GONE) gone++;
    }
    const key = parts.map(p => (p ? `${p.dy.toFixed(1)},${p.deg.toFixed(0)}` : '-')).join('|');
    if (rollState.get(thumb) === key) return;
    rollState.set(thumb, key);
    thumb.classList.add('rolling');
    // Fully rolled away: stop it catching hover or clicks.
    thumb.style.visibility = gone === SLICES ? 'hidden' : '';
    thumb.querySelectorAll('.strip-slice').forEach((slice, k) => {
      const p = parts[k];
      if (!p) { slice.style.transform = ''; slice.style.filter = ''; slice.style.opacity = ''; slice.style.visibility = ''; return; }
      slice.style.transform = `translateY(${p.dy.toFixed(1)}px) translateZ(${p.z.toFixed(1)}px) rotateX(${p.deg.toFixed(1)}deg)`;
      slice.style.filter = `brightness(${(1 - 0.65 * Math.min(1, p.theta / (Math.PI / 2))).toFixed(2)})`;
      slice.style.opacity = Math.min(1, Math.max(0, (ROLL_GONE - p.theta) / 0.8)).toFixed(2);
      slice.style.visibility = p.theta >= ROLL_GONE ? 'hidden' : '';
    });
  });
}
requestAnimationFrame(curlStrip);// ---------- List view paging: one gesture = one work ----------
// Wheel, trackpad swipe, keys and touch swipes each turn exactly one full-screen work.
const PAGE_MS = 750;      // ignore further input while a turn is running
const QUIET_MS = 160;     // a new wheel gesture needs this much quiet first (eats trackpad inertia)
let pageLockUntil = 0;
let lastWheelAt = 0;

function listPaging() {
  return !worksPage.hidden && currentView === 'list' && filmModal.hidden && !navigating;
}

function turnWork(step) {
  const visible = slides.filter(s => !s.hidden);
  if (!visible.length) return;
  const tops = visible.map(s => s.getBoundingClientRect().top + window.scrollY);
  // The work currently filling the screen is the one whose top is closest to the scroll position.
  let at = 0;
  tops.forEach((top, k) => { if (Math.abs(top - window.scrollY) < Math.abs(tops[at] - window.scrollY)) at = k; });
  const next = Math.min(visible.length - 1, Math.max(0, at + step));
  pageLockUntil = Date.now() + (window.matchMedia('(max-width: 800px)').matches ? 480 : PAGE_MS);
  if (next !== at) animateScroll(tops[next]);
}

// Our own eased scroll, with snapping paused so the browser's snap can't pull it back.
function animateScroll(to) {
  const from = window.scrollY;
  const start = performance.now();
  // Phones turn faster than the desktop.
  const ms = window.matchMedia('(max-width: 800px)').matches ? 420 : PAGE_MS - 100;
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const root = document.documentElement;
  root.classList.remove('works-snap');
  root.style.scrollBehavior = 'auto';
  const step = now => {
    const t = Math.min(1, (now - start) / ms);
    window.scrollTo(0, from + (to - from) * ease(t));
    if (t < 1) requestAnimationFrame(step);
    else { root.style.scrollBehavior = ''; updateWorksSnap(); }
  };
  requestAnimationFrame(step);
}

window.addEventListener('wheel', event => {
  if (!listPaging() || event.ctrlKey) return;
  event.preventDefault();
  const now = Date.now();
  const fresh = now - lastWheelAt > QUIET_MS;
  lastWheelAt = now;
  if (Math.abs(event.deltaY) < 2 || now < pageLockUntil || !fresh) return;
  turnWork(event.deltaY > 0 ? 1 : -1);
}, { passive: false });

window.addEventListener('keydown', event => {
  if (!listPaging() || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest && event.target.closest('input, textarea, select, [contenteditable]')) return;
  const down = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey);
  const up = ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey);
  if (!down && !up) return;
  event.preventDefault();
  if (Date.now() < pageLockUntil) return;
  turnWork(down ? 1 : -1);
});

let touchStartY = null;
window.addEventListener('touchstart', event => {
  if (listPaging() && event.touches.length === 1) touchStartY = event.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchmove', event => {
  if (listPaging() && touchStartY !== null) event.preventDefault();
}, { passive: false });
window.addEventListener('touchend', event => {
  if (touchStartY === null) return;
  const dy = touchStartY - event.changedTouches[0].clientY;
  touchStartY = null;
  if (!listPaging() || Math.abs(dy) < 40 || Date.now() < pageLockUntil) return;
  turnWork(dy > 0 ? 1 : -1);
});
// ---------- Project page paging: one gesture = one section ----------
// Pictures -> film -> write-up (photo projects: pictures -> write-up -> previews). A section
// taller than the screen scrolls normally until its end; the last one scrolls normally to the
// bottom, and scrolling back up to a section's top turns to the one before. Scrolling up on
// the first screen does nothing. Desktop only.
const projectPage = document.getElementById('project');

function projectPaging() {
  return !projectPage.hidden && !navigating && filmModal.hidden && lightbox.hidden && innerWidth > 800;
}

// Returns true when it turned (or is mid-turn), false to let the page scroll normally.
function turnSection(step, fresh) {
  const sections = [...projectBody.querySelectorAll('.project-section')];
  if (!sections.length) return false;
  const y = window.scrollY;
  const tops = sections.map(s => s.getBoundingClientRect().top + y);
  let at = 0;
  tops.forEach((top, k) => { if (top <= y + 2) at = k; });
  if (step > 0) {
    const bottom = tops[at] + sections[at].offsetHeight;
    if (at === sections.length - 1 || bottom > y + innerHeight + 2) {
      // Just arrived at the section's top: hold it there for one screen; only a fresh
      // gesture (not the tail of the one that turned here) starts scrolling it.
      return y <= tops[at] + 2 && !fresh;
    }
  } else if (at === 0) {
    // The first screen never scrolls on its own: scrolling up there just settles at the top.
    if (y > 2 && fresh && Date.now() >= pageLockUntil) {
      pageLockUntil = Date.now() + PAGE_MS;
      animateScroll(0);
    }
    return true;
  } else if (y > tops[at] + 2) {
    return false;
  }
  if (!fresh || Date.now() < pageLockUntil) return true;
  const next = at + step;
  // Going back to a tall section lands on its last screen, not its top.
  const to = step > 0 ? tops[next] : Math.max(tops[next], tops[at] - innerHeight);
  pageLockUntil = Date.now() + PAGE_MS;
  animateScroll(to);
  return true;
}

window.addEventListener('wheel', event => {
  if (!projectPaging() || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
  const now = Date.now();
  const fresh = now - lastWheelAt > QUIET_MS;
  lastWheelAt = now;
  if (Date.now() < pageLockUntil || turnSection(event.deltaY > 0 ? 1 : -1, fresh)) event.preventDefault();
}, { passive: false });

window.addEventListener('keydown', event => {
  if (!projectPaging() || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target.closest && event.target.closest('input, textarea, select, [contenteditable]')) return;
  // Space on a focused button presses it.
  if (event.key === ' ' && event.target.closest && event.target.closest('button, a')) return;
  const down = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey);
  const up = ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey);
  if (!down && !up) return;
  if (Date.now() < pageLockUntil || turnSection(down ? 1 : -1, true)) event.preventDefault();
});
// List <-> Grid morph: every visible work flies between its strip thumbnail and its grid square,
// swapping the view underneath. Phones have no strip, so there each work flies between its
// full-screen slide and its grid square instead.
function morphView(view, onDone) {
  const listNodes = window.matchMedia('(max-width: 800px)').matches ? slides : thumbs;
  const toGrid = view === 'grid';
  const visible = works.map((_, i) => i).filter(i => !gridItems[i].hidden);
  const rectOf = (i, grid) => (grid ? gridItems[i] : listNodes[i]).getBoundingClientRect();
  const from = new Map(visible.map(i => [i, rectOf(i, !toGrid)]));

  stripTrack.style.transition = 'none';
  setView(view);
  if (!toGrid) setActiveThumb(visible[0]);
  void stripTrack.offsetHeight;

  const onScreen = r => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  const targets = visible.map(i => [i, rectOf(i, toGrid)]).filter(([i, r]) => onScreen(r) || onScreen(from.get(i)));
  const finals = targets.map(([i]) => (toGrid ? gridItems[i] : listNodes[i]));
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
    rollState.clear(); // let the roll-up re-apply its own visibility
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
const phoneHome = window.matchMedia('(max-width: 800px)');
const SLIDE_MS = 3000;
const TURN_MS = 2000;
let slideTimer = null;
let slideOrder = [];
let turning = false;

function nextPhoto() {
  if (!slideOrder.length) slideOrder = allPhotos.map((_, i) => i).sort(() => Math.random() - 0.5);
  const work = allPhotos[slideOrder.pop()];
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

// Resting divider position: the About edge on desktop; on phones (no About, no divider) the
// right edge, so a swipe brings the photographs in from the right.
function restSplit() {
  const h = home.getBoundingClientRect();
  if (phoneHome.matches) return h.width;
  return aboutPanel.getBoundingClientRect().left - h.left;
}
const turnMs = () => (phoneHome.matches ? 600 : TURN_MS);

function animateSplit(from, to, done) {
  const start = performance.now();
  const ms = turnMs();
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = now => {
    const t = Math.min(1, (now - start) / ms);
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
  swipeDots.dataset.at = '1';
  startSlideshow();
  animateSplit(from, 0, () => {
    home.classList.remove('flipping');
    home.classList.add('photo-mode');
    pauseHero();
    splitToggle.setAttribute('aria-label', 'Show film');
    turning = false;
  });
}

function turnToFilm() {
  turning = true;
  playHero();
  home.classList.remove('photo-mode');
  // The arrow keeps pointing right while the divider travels; it turns back once it stops.
  home.classList.add('flipping', 'returning');
  swipeDots.dataset.at = '0';
  animateSplit(0, restSplit(), () => {
    home.classList.remove('flipping', 'returning');
    home.style.removeProperty('--split');
    stopSlideshow();
    splitToggle.setAttribute('aria-label', 'Show photographs');
    turning = false;
  });
}

// Phones: MOTION / PHOTO at the bottom name the two (film / photographs) and light the one on,
// with a faint "SWIPE" that fades once the visitor has swiped (or after a few seconds). A left swipe
// turns to the photographs, a right swipe back to the film; the dots can be tapped too.
const swipeDots = el('div', 'swipe-dots');
swipeDots.dataset.at = '0';
[['Motion', 'film'], ['Photo', 'photographs']].forEach(([label, what], k) => {
  const dot = el('button', 'swipe-dot', label);
  dot.type = 'button';
  dot.setAttribute('aria-label', `Show ${what}`);
  dot.addEventListener('click', () => {
    if (turning) return;
    if (k === 1 && !home.classList.contains('photo-mode')) turnToPhotos();
    if (k === 0 && home.classList.contains('photo-mode')) turnToFilm();
  });
  swipeDots.append(dot);
});
const swipeHint = el('span', 'swipe-hint', 'Swipe');
swipeDots.append(swipeHint);
home.append(swipeDots);
const hideSwipeHint = () => swipeDots.classList.add('hint-done');
setTimeout(hideSwipeHint, 6000);

let swipeStart = null;
home.addEventListener('touchstart', event => {
  if (!phoneHome.matches || event.touches.length !== 1) return;
  swipeStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
// A sideways drag on the home page belongs to the Motion / Photo turn, never to the browser.
home.addEventListener('touchmove', event => {
  if (!swipeStart || event.touches.length !== 1) return;
  const dx = event.touches[0].clientX - swipeStart.x;
  const dy = event.touches[0].clientY - swipeStart.y;
  if (Math.abs(dx) > Math.abs(dy)) event.preventDefault();
}, { passive: false });
home.addEventListener('touchend', event => {
  if (!swipeStart) return;
  const dx = event.changedTouches[0].clientX - swipeStart.x;
  const dy = event.changedTouches[0].clientY - swipeStart.y;
  swipeStart = null;
  if (turning || Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
  hideSwipeHint();
  if (dx < 0 && !home.classList.contains('photo-mode')) turnToPhotos();
  else if (dx > 0 && home.classList.contains('photo-mode')) turnToFilm();
});

// Straight back to the film, no turn (used whenever the home page is opened).
function resetToFilm() {
  if (turning || !home.classList.contains('photo-mode')) return;
  home.classList.remove('photo-mode', 'flipping', 'returning');
  home.style.removeProperty('--split');
  swipeDots.dataset.at = '0';
  splitToggle.setAttribute('aria-label', 'Show photographs');
}

splitToggle.addEventListener('click', () => {
  if (turning) return;
  if (home.classList.contains('photo-mode')) turnToFilm();
  else turnToPhotos();
});

// ---------- Process: two buttons switch the right column ----------
const processTabs = document.querySelector('.process-tabs');
const tabButtons = [...processTabs.querySelectorAll('.process-tab')];
function selectTab(n) {
  tabButtons.forEach((tab, k) => {
    const on = k === n;
    tab.classList.toggle('active', on);
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.hidden = !on;
    panel.classList.toggle('active', on);
  });
  processTabs.dataset.at = n;
}
tabButtons.forEach((tab, k) => {
  tab.addEventListener('click', () => { if (!tab.classList.contains('active')) selectTab(k); });
  tab.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const n = (k + (event.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length;
    selectTab(n);
    tabButtons[n].focus();
  });
});
// ---------- Contact: founder work photos, full screen ----------
// As on accordion.net.au/contact: while the mouse is over a founder's block (headshot + contact
// details) their work photo fades in across the whole screen behind the page (.4s); the rest of
// the page fades away and that founder's details stay exactly where they are, so their links can
// be used. Leaving the block fades everything back. Nothing covers the page, so the menu always
// works. Without a mouse (touch), a tap opens it and a tap anywhere else closes it.
const founderCards = [...document.querySelectorAll('.founder')];
const contactPage = document.getElementById('contact');
const founderBackdrop = el('div', 'founder-backdrop');
founderBackdrop.setAttribute('aria-hidden', 'true');
const founderPhotos = founderCards.map(card => {
  const photo = el('div', 'founder-photo');
  const work = card.dataset.work;
  if (work) photo.style.backgroundImage = `url("${work}")`;
  else {
    photo.classList.add('placeholder');
    photo.dataset.label = 'Work photo';
  }
  founderBackdrop.append(photo);
  return photo;
});
contactPage.prepend(founderBackdrop);

let founderOn = -1;     // founder whose photo is showing (-1: none)
let founderSkip = -1;   // block the page appeared under: it waits for the mouse to leave first
let lastPointer = null; // last mouse position, to know what the page appears under

function showFounder(k) {
  // Phones: no full-screen work photo.
  if (k >= 0 && window.matchMedia('(max-width: 800px)').matches) return;
  founderOn = k;
  contactPage.classList.toggle('founder-on', k >= 0);
  founderCards.forEach((card, n) => card.classList.toggle('on', n === k));
  founderPhotos.forEach((photo, n) => photo.classList.toggle('on', n === k));
}
const closeFounder = () => showFounder(-1);

window.addEventListener('pointermove', event => {
  if (event.pointerType === 'mouse') lastPointer = { x: event.clientX, y: event.clientY };
}, { passive: true });

// The Contact page appearing under a resting mouse is not "entering" a block.
function armFounders() {
  closeFounder();
  const under = lastPointer && document.elementFromPoint(lastPointer.x, lastPointer.y);
  const card = under && under.closest('.founder');
  founderSkip = card ? founderCards.indexOf(card) : -1;
}

founderCards.forEach((card, k) => {
  card.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && founderSkip !== k) showFounder(k);
  });
  card.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    if (founderSkip === k) founderSkip = -1;
    if (founderOn === k) closeFounder();
  });
  // Touch: a tap opens (links inside still work).
  card.addEventListener('pointerup', event => {
    if (event.pointerType === 'mouse' || event.target.closest('a')) return;
    showFounder(k);
  });
});
// Touch: a tap outside the open founder's block closes it.
document.addEventListener('pointerup', event => {
  if (event.pointerType === 'mouse' || founderOn < 0) return;
  if (!founderCards[founderOn].contains(event.target)) closeFounder();
});
document.addEventListener('keydown', event => { if (founderOn >= 0 && event.key === 'Escape') closeFounder(); });
// ---------- Text colour follows the picture behind it ----------
// The picture is drawn "object-fit: cover" into a tiny canvas; each text block's area is
// averaged and gets .ink-dark (black text) when the picture there is light.
// Switched off: all text stays white everywhere, whatever the picture.
const ADAPTIVE_INK = false;
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
  [aboutPanel, aboutPanel.querySelector('.aside-copy')]
];

function updateHomeInk() {
  if (!ADAPTIVE_INK || home.hidden || home.classList.contains('flipping')) return;
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

// Works list: full-size pictures load only as their slide comes near the screen (so the
// thumbnails are not stuck behind 26 big downloads), then get sampled for text colour.
const slidePixels = [];
const slideRequested = [];
const worksOverlays = [...document.querySelectorAll('#works .site-brand, #works .site-nav, .works-filter, .works-view')];
let activeIndex = 0;

function sampleSlideInk(i, img) {
  // ink: 'light' keeps a work's text white whatever its picture.
  if (!ADAPTIVE_INK || works[i].ink === 'light') return;
  const slide = slides[i];
  const sb = slide.getBoundingClientRect();
  if (!sb.width) return;
  slidePixels[i] = coverPixels(img, img.naturalWidth, img.naturalHeight, sb.width, sb.height);
  const title = relRect(slide.querySelector('.work-slide-title'), sb);
  const sub = relRect(slide.querySelector('.work-slide-sub'), sb);
  const text = { left: Math.min(title.left, sub.left), right: Math.max(title.right, sub.right), top: sub.top, bottom: title.bottom };
  if (slidePixels[i]) slide.classList.toggle('ink-dark', isLightUnder(slidePixels[i], text));
  if (i === activeIndex) updateWorksInk(i);
}

// Full-size pictures download two at a time; slides near the screen jump the queue.
const fullQueue = [];
let fullActive = 0;
function pumpFull() {
  while (fullActive < 2 && fullQueue.length) {
    const i = fullQueue.shift();
    fullActive++;
    const img = new Image();
    img.onload = () => { slides[i].style.backgroundImage = `url("${img.src}")`; };
    const done = () => { fullActive--; pumpFull(); };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
    img.src = workImage(works[i], 'full');
  }
}
function queueFull(i, urgent) {
  const at = fullQueue.indexOf(i);
  if (at >= 0) { if (!urgent) return; fullQueue.splice(at, 1); }
  if (urgent) fullQueue.unshift(i); else fullQueue.push(i);
  pumpFull();
}

// A slide shows its 800px picture straight away (small, fast), then swaps in the full size.
function loadSlide(i) {
  if (slideRequested[i]) return;
  slideRequested[i] = true;
  const mid = new Image();
  mid.onload = () => {
    if (!slides[i].style.backgroundImage) slides[i].style.backgroundImage = `url("${mid.src}")`;
    sampleSlideInk(i, mid);
  };
  mid.src = workImage(works[i], 'mid');
  queueFull(i, true);
}

// Slides within two screens load first ...
const slideLoader = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) loadSlide(Number(entry.target.dataset.index)); });
}, { rootMargin: '200% 0px 200% 0px' });
slides.forEach(slide => slideLoader.observe(slide));

// ... and once the Works page has been opened, the rest follow in the background.
let backgroundFillStarted = false;
function fillRemainingSlides() {
  if (backgroundFillStarted) return;
  backgroundFillStarted = true;
  setTimeout(() => works.forEach((_, i) => {
    if (slideRequested[i]) return;
    slideRequested[i] = true;
    const mid = new Image();
    mid.onload = () => {
      if (!slides[i].style.backgroundImage) slides[i].style.backgroundImage = `url("${mid.src}")`;
      sampleSlideInk(i, mid);
    };
    mid.src = workImage(works[i], 'mid');
    queueFull(i, false);
  }), 1500);
}
// The fixed labels (Back, filters, List/Grid) follow the slide on screen; on the grid they sit on black.
function updateWorksInk(i) {
  activeIndex = i;
  if (!ADAPTIVE_INK) return;
  const px = currentView === 'list' ? slidePixels[i] : null;
  worksOverlays.forEach(el => {
    // The slide on screen starts at the top-left of the viewport.
    el.classList.toggle('ink-dark', !!px && isLightUnder(px, el.getBoundingClientRect()));
  });
}
// Initial page: honour a direct link such as …/tria-prima/#works.
const initialRoute = routeFromHash();
history.replaceState({ route: initialRoute }, '');
showRoute(initialRoute);
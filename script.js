// ---------- Storage helpers (never throw) ----------
const store = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
};
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Intro screen (once per session, skippable) ----------
const intro = document.getElementById('intro');
if (store.get('introSeen') || reduceMotion) {
  document.documentElement.classList.add('no-intro');
} else {
  document.body.classList.add('intro-on');
  const endIntro = () => {
    if (intro.classList.contains('out')) return;
    intro.classList.add('out');
    document.body.classList.remove('intro-on');
    store.set('introSeen', '1');
    setTimeout(() => intro.remove(), 700);
  };
  intro.addEventListener('click', endIntro);
  document.addEventListener('keydown', endIntro, { once: true });
  setTimeout(endIntro, 2300);
}

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Mobile menu ----------
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const setMenu = open => {
  navLinks.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
};
burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// ---------- Design-tool selection frame: live size label ----------
const frame = document.getElementById('frame');
const frameSize = document.getElementById('frameSize');
const updateSize = () => {
  frameSize.textContent = `${Math.round(frame.offsetWidth)} × ${Math.round(frame.offsetHeight)}`;
};
updateSize();
window.addEventListener('resize', updateSize);
if (document.fonts) document.fonts.ready.then(updateSize);

// ---------- Resume preview modal ----------
const modal = document.getElementById('resumeModal');
const resumeFrame = document.getElementById('resumeFrame');
let lastFocus = null;
const openResume = e => {
  e.preventDefault();
  lastFocus = document.activeElement;
  if (!resumeFrame.src) resumeFrame.src = resumeFrame.dataset.src; // load PDF on first open
  modal.hidden = false;
  document.body.classList.add('modal-open');
  modal.querySelector('.modal-close').focus();
};
const closeResume = () => {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastFocus) lastFocus.focus();
};
document.querySelectorAll('[data-resume]').forEach(a => a.addEventListener('click', openResume));
modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeResume));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeResume(); });

// ---------- Reveal on scroll ----------
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
    io.observe(el);
  });
} else {
  reveals.forEach(el => el.classList.add('in'));
}

// ---------- Trophy deck ----------
const deck = document.getElementById('deck');
const cards = [...deck.querySelectorAll('.t-card')];
const nowEl = document.getElementById('deckNow');
const bar = document.getElementById('deckBar');
document.getElementById('deckTotal').textContent = String(cards.length).padStart(2, '0');
let current = 0;
const layout = () => {
  cards.forEach((card, i) => {
    const pos = (i - current + cards.length) % cards.length; // 0 = front
    const rot = [0, 6, -5, 9, -8][pos] ?? 0;
    const x = [0, 26, -22, 40, -36][pos] ?? 0;
    const y = pos * 8;
    card.style.zIndex = String(cards.length - pos);
    card.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${1 - pos * 0.04})`;
    card.style.opacity = pos > 3 ? '0' : '1';
    card.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
  });
  nowEl.textContent = String(current + 1).padStart(2, '0');
  bar.style.width = `${((current + 1) / cards.length) * 100}%`;
};
const go = step => { current = (current + step + cards.length) % cards.length; layout(); };
deck.addEventListener('click', () => go(1));
deck.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
});
document.getElementById('deckNext').addEventListener('click', () => go(1));
document.getElementById('deckPrev').addEventListener('click', () => go(-1));
layout();

// ---------- Active nav link ----------
const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
}

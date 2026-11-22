// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky nav shadow
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

// Resume preview modal
const modal = document.getElementById('resumeModal');
const frame = document.getElementById('resumeFrame');
let lastFocus = null;
const openResume = e => {
  e.preventDefault();
  lastFocus = document.activeElement;
  if (!frame.src) frame.src = frame.dataset.src; // load PDF only when first opened
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

// Project screenshots: drop images into assets/projects/ with the file names
// used in index.html. Until then, a styled placeholder is shown.
document.querySelectorAll('.shot img').forEach(img => {
  const markEmpty = () => img.parentElement.classList.add('empty');
  if (img.complete && img.naturalWidth === 0) markEmpty();
  img.addEventListener('error', markEmpty);
});

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

// Count-up stats
const counters = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const start = performance.now();
    const dur = 1400;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => { el.textContent = target; }, dur + 300); // guarantee final value
    counters.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => counters.observe(el));

// Active nav link by section
const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

'use strict';

const root = document.documentElement;
root.classList.add('js');
const header = document.querySelector('.site-header');
const navigation = document.querySelector('#site-navigation');
const menu = document.querySelector('#menu-toggle');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let motionAllowed = true;
let revealObserver;

menu.hidden = false;
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const id = decodeURIComponent(link.getAttribute('href').slice(1));
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  history.pushState(null, '', `#${encodeURIComponent(id)}`);
  target.scrollIntoView({ behavior: motionAllowed ? 'smooth' : 'auto', block: 'start' });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
window.matchMedia('(min-width: 851px)').addEventListener('change', closeMenu);

const revealElements = [...document.querySelectorAll('[data-reveal], .process-steps')];
document.querySelectorAll('[data-stagger], .hero-inner').forEach(group => {
  [...group.children].filter(child => child.hasAttribute('data-reveal')).forEach((child, index) => {
    child.style.setProperty('--reveal-delay', `${Math.min(index * 85, 255)}ms`);
  });
});

function configureMotion() {
  motionAllowed = true;
  root.dataset.motion = motionAllowed ? 'on' : 'off';
  if (motionAllowed && !revealObserver && 'IntersectionObserver' in window) {
    root.classList.add('motion-ready');
    revealElements.forEach(element => element.classList.remove('is-visible'));
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.12, rootMargin: '80px 0px' });
    revealElements.forEach(element => revealObserver.observe(element));
  }
}

if (!('IntersectionObserver' in window)) {
  revealElements.forEach(element => element.classList.add('is-visible'));
}
configureMotion();

const progress = document.querySelector('.reading-progress span');
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...navigation.querySelectorAll('a')];
let scrollScheduled = false;
function updateScroll() {
  const y = Math.max(0, window.scrollY);
  const distance = root.scrollHeight - root.clientHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(y / distance, 1) : 0})`;
  header.classList.toggle('is-scrolled', y > 35);
  let active = 'top';
  for (const section of sections) if (section.getBoundingClientRect().top <= 180) active = section.id;
  for (const link of navLinks) {
    if (link.getAttribute('href') === `#${active}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  scrollScheduled = false;
}
function scheduleScroll() {
  if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); }
}
window.addEventListener('scroll', scheduleScroll, { passive: true });
window.addEventListener('resize', scheduleScroll);
document.querySelectorAll('.service-detail').forEach(detail => detail.addEventListener('toggle', scheduleScroll));
updateScroll();

// A page-wide teal light follows the mouse; its position stays in the browser.
const cursorGlow = document.querySelector('.cursor-glow');
let cursorFrame;
document.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || cursorFrame) return;
  const x = event.clientX;
  const y = event.clientY;
  cursorFrame = requestAnimationFrame(() => {
    cursorGlow.style.setProperty('--cursor-x', `${x}px`);
    cursorGlow.style.setProperty('--cursor-y', `${y}px`);
    cursorGlow.classList.add('is-visible');
    cursorFrame = undefined;
  });
}, { passive: true });
document.addEventListener('pointerleave', () => cursorGlow.classList.remove('is-visible'));

document.querySelector('#copyright-year').textContent = new Date().getFullYear();
const copyButton = document.querySelector('#copy-btn');
copyButton.hidden = false;
copyButton.addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  const email = 'cavdevsoftware@gmail.com';
  try {
    await navigator.clipboard.writeText(email);
    status.textContent = 'Email address copied.';
  } catch {
    status.textContent = 'Copy is unavailable. Select the email address above to copy it, or click it to open your email app.';
  }
});

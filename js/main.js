// UI behaviour: hero entrance, reading progress, experience rail, cursor-lit hero grid,
// badge tilt, active nav link, active "what I do" layer (drives the 3D stack),
// scroll reveals, chart draw-in and the stat count-up.
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.KK = window.KK || { activeLayer: -1 };

  // --- Ambient background glows, moved by scroll position (one rAF per frame at most) ---
  const ambient = document.createElement('div');
  ambient.className = 'ambient';
  ambient.setAttribute('aria-hidden', 'true');
  ambient.innerHTML = '<i></i><i></i>';
  document.body.prepend(ambient);

  // --- Hero entrance (CSS runs it once this class lands; reduced motion shows the end state) ---
  requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));

  // --- Scroll-linked values: page progress (nav bar, ambient glows) and the experience rail ---
  const root = document.documentElement;
  const timeline = document.querySelector('.timeline');
  let ticking = false;
  const setScroll = () => {
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--scroll', max > 0 ? (scrollY / max).toFixed(3) : 0);
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      timeline.style.setProperty('--t', t.toFixed(3));
      timeline.querySelectorAll('.role').forEach((role) => role.classList.toggle('is-lit', role.getBoundingClientRect().top < innerHeight * 0.6));
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(setScroll); } }, { passive: true });
  addEventListener('resize', setScroll, { passive: true });
  setScroll();

  // --- Pointer effects: fine pointers only, and never with reduced motion ---
  if (!reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    // Hero grid lights up around the cursor
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
        hero.style.setProperty('--my', `${e.clientY - r.top}px`);
        hero.classList.add('is-lit');
      });
      hero.addEventListener('pointerleave', () => hero.classList.remove('is-lit'));
    }
    // Partner badges tilt toward the cursor, with a glare that follows it
    document.querySelectorAll('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${(x - 0.5) * 24}deg`);
        el.style.setProperty('--rx', `${(0.5 - y) * 24}deg`);
        el.style.setProperty('--gx', `${x * 100}%`);
        el.style.setProperty('--gy', `${y * 100}%`);
        el.classList.add('is-tilting');
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-tilting');
        ['--rx', '--ry'].forEach((p) => el.style.removeProperty(p));
      });
    });
  }

  // --- Nav height as a CSS variable, so sticky elements sit flush under the (wrapping) nav ---
  const nav = document.querySelector('.nav');
  if (nav) {
    const setNavH = () => document.documentElement.style.setProperty('--nav-h', `${Math.round(nav.getBoundingClientRect().height)}px`);
    setNavH();
    if ('ResizeObserver' in window) new ResizeObserver(setNavH).observe(nav);
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // --- Benchmark numbers (js/listing-benchmark.js), rounded so copy never goes stale ---
  const B = window.LC_BENCH;
  if (B) {
    const val = { count: `${(Math.floor(B.n / 100) * 100).toLocaleString('en-US')}+` };
    Object.entries(B.stats || {}).forEach(([k, v]) => { val[`stat-${k}`] = `${v}%`; });
    document.querySelectorAll('[data-bench]').forEach((el) => {
      if (val[el.dataset.bench]) el.textContent = val[el.dataset.bench];
    });
  }

  // Everything below needs IntersectionObserver; without it, content simply shows unanimated.
  if (!('IntersectionObserver' in window)) return;

  // --- Active nav link (in-page sections only) ---
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if (links.length) {
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const a = byId.get(e.target.id);
          if (!a) return;
          if (e.isIntersecting) {
            links.forEach((l) => l.removeAttribute('aria-current'));
            a.setAttribute('aria-current', 'true');
          } else if (a.getAttribute('aria-current')) {
            a.removeAttribute('aria-current');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    byId.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // --- Layers: one active at a time ---
  const layers = [...document.querySelectorAll('.layer')];
  if (layers.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number(e.target.dataset.layer);
          layers.forEach((l, j) => l.classList.toggle('is-active', i === j));
          window.KK.activeLayer = i;
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    layers.forEach((l) => io.observe(l));
  }

  // --- Reveal on scroll (cards, chart) ---
  const reveals = document.querySelectorAll('.reveal');
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        revealIO.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
  );
  reveals.forEach((el, i) => {
    el.style.transitionDelay = reduceMotion ? '0s' : `${(i % 4) * 70}ms`;
    revealIO.observe(el);
  });
  window.KK.reveal = true; // the inline <head> check un-hides everything if this never runs

  // --- Count-up for [data-count] ---
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (reduceMotion) return;
    el.textContent = '1';
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      (function step(now) {
        const t = Math.min(1, (now - t0) / 1200);
        el.textContent = String(Math.max(1, Math.round(target * (1 - Math.pow(1 - t, 3)))));
        if (t < 1) requestAnimationFrame(step);
      })(t0);
    }).observe(el);
  });
})();

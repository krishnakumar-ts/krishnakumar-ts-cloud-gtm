// Small enhancements only. The page works without this file.
(() => {
  const header = document.querySelector('.top');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Highlight the nav item for the section in view.
  const links = [...document.querySelectorAll('.nav a')];
  const groups = {
    work: ['work', 'cs-storefronts', 'cs-billing', 'cs-competency', 'cs-website', 'cs-enablement', 'cs-demand'],
    explainers: ['explainers'],
    capabilities: ['capabilities'],
    experience: ['experience'],
  };
  const owner = {};
  Object.entries(groups).forEach(([k, ids]) => ids.forEach(id => { owner[id] = k; }));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const key = owner[e.target.id];
        links.forEach(a => a.classList.toggle('on', key && a.getAttribute('href') === '#' + key));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(owner).forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    ['contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.remove('on')); }), { rootMargin: '-45% 0px -50% 0px' }).observe(el);
    });
  }

  // Lightbox for explainers.
  const box = document.querySelector('.lightbox');
  if (box && typeof box.showModal === 'function') {
    const img = box.querySelector('img');
    document.querySelectorAll('.zoom').forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.dataset.full;
        const alt = btn.querySelector('img')?.alt || '';
        img.src = src; img.alt = alt;
        box.showModal();
      });
    });
    box.addEventListener('click', e => { if (e.target === box) box.close(); });
  } else {
    document.querySelectorAll('.zoom').forEach(btn => btn.addEventListener('click', () => window.open(btn.dataset.full, '_blank')));
  }

  // Copy email.
  document.querySelectorAll('.copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Copied'; btn.classList.add('done');
        setTimeout(() => { btn.textContent = 'Copy email'; btn.classList.remove('done'); }, 1800);
      } catch { window.location.href = 'mailto:' + btn.dataset.copy; }
    });
  });

  // Review mode: add ?review to the URL to see where evidence is still missing.
  if (new URLSearchParams(location.search).has('review')) {
    document.querySelectorAll('.gap').forEach(el => { el.hidden = false; });
  }
})();

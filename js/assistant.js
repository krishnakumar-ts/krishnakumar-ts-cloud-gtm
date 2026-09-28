// Hiring guide: two tap-to-answer questions that end in a ready email draft or a call booking.
// No AI, no network.
(function () {
  const CAL_HIRE = 'https://cal.com/krishna-kumar-cloud-gtm/interview-30min';

  const FLOW = {
    start: { say: 'Hiring for Cloud GTM, AWS Marketplace or partner marketing? What kind of role is it?', opts: [
      ['Full-time', 'ft'], ['Fractional or contract', 'fr'], ['Just looking around', 'tour']] },
    ft: { say: 'Where is the role based?', set: { engagement: 'Full-time' }, opts: [['Remote', 'loc:Remote'], ['Hybrid', 'loc:Hybrid'], ['On-site', 'loc:On-site']] },
    fr: { say: 'Where is the role based?', set: { engagement: 'Fractional' }, opts: [['Remote', 'loc:Remote'], ['Hybrid', 'loc:Hybrid'], ['On-site', 'loc:On-site']] },
    send: { rec: { name: 'Email Krishna', term: 'Reply within one business day', why: 'Opens a short draft email with your answers already in it. Add the role and company, then send.', cta: { label: 'Draft the email', enquiry: 'hire' }, alt: { label: 'Book a 30-min call', href: CAL_HIRE } } },
    tour: { say: 'Here\'s where to look:', links: [
      ['What I do at SaaSNova.ai', '#work'], ['Experience', '#experience'], ['Download the résumé', 'assets/Krishna-Kumar-TS-Resume.pdf']] }
  };
  const answers = {};

  const root = document.createElement('div');
  root.className = 'bot';
  root.innerHTML = `
    <button class="bot-open" type="button" aria-expanded="false" aria-controls="bot-panel">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg><span>Hiring? Start here</span>
    </button>
    <section class="bot-panel" id="bot-panel" hidden aria-label="Hiring guide">
      <header class="bot-head">
        <div><strong>Hiring Krishna</strong><span>Two taps to a ready email</span></div>
        <button class="bot-x" type="button" aria-label="Close">×</button>
      </header>
      <div class="bot-log" aria-live="polite"></div>
    </section>`;
  document.body.appendChild(root);
  const panel = root.querySelector('.bot-panel'), log = root.querySelector('.bot-log'), openBtn = root.querySelector('.bot-open');

  const bubble = (who, html) => { const p = document.createElement('div'); p.className = `bot-msg bot-${who}`; if (who === 'me') p.textContent = html; else p.innerHTML = html; log.appendChild(p); log.scrollTop = log.scrollHeight; };
  const clearOpts = () => log.querySelectorAll('.bot-opts').forEach((o) => o.remove());
  const optsRow = (items) => {
    const row = document.createElement('div'); row.className = 'bot-opts';
    items.forEach((el) => row.appendChild(el)); log.appendChild(row); log.scrollTop = log.scrollHeight;
    row.querySelector('button, a')?.focus();
  };
  const btn = (label, fn, cls = '') => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; b.addEventListener('click', fn); return b; };
  const link = (label, href, cls = '') => { const a = document.createElement('a'); a.className = cls; a.textContent = label; a.href = href; if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; } return a; };

  function act(cta) {
    close();
    if (cta.enquiry && window.KKEnquiry) window.KKEnquiry.open(cta.enquiry, { ...answers });
  }

  function step(id) {
    const node = FLOW[id];
    clearOpts();
    if (node.set) Object.assign(answers, node.set);
    if (node.say) bubble('bot', node.say);
    if (node.opts) {
      optsRow(node.opts.map(([label, next]) => btn(label, () => {
        clearOpts(); bubble('me', label);
        if (next.startsWith('loc:')) { answers.location = next.slice(4); next = 'send'; }
        setTimeout(() => step(next), 150);
      })));
    }
    if (node.links) optsRow(node.links.map(([label, href]) => link(label, href, 'bot-link')).concat(btn('Start over', restart, 'bot-ghost')));
    if (node.rec) {
      const r = node.rec;
      bubble('bot', `<div class="bot-rec"><span class="bot-rec-tag">Recommended</span><strong>${r.name}</strong><span class="bot-rec-meta">${r.term}</span><p>${r.why}</p></div>`);
      optsRow([btn(r.cta.label, () => act(r.cta), 'bot-primary'), link(r.alt.label, r.alt.href, 'bot-link'), btn('Start over', restart, 'bot-ghost')]);
    }
  }
  function restart() { log.innerHTML = ''; Object.keys(answers).forEach((k) => delete answers[k]); step('start'); }

  function open() { panel.hidden = false; root.classList.remove('bot-waiting'); openBtn.setAttribute('aria-expanded', 'true'); if (!log.childElementCount) step('start'); else log.querySelector('.bot-opts button, .bot-opts a')?.focus(); }
  function close() { panel.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); }
  openBtn.addEventListener('click', () => (panel.hidden ? open() : close()));
  root.querySelector('.bot-x').addEventListener('click', () => { close(); openBtn.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { close(); openBtn.focus(); } });

  // The launcher appears once the visitor scrolls past the hero, so it never competes
  // with the main call to action.
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    root.classList.add('bot-waiting');
    new IntersectionObserver(([e]) => { if (panel.hidden) root.classList.toggle('bot-waiting', e.isIntersecting); }, { threshold: 0.2 }).observe(hero);
  }
})();

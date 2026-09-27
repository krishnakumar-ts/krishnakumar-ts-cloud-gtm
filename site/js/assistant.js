// Offer guide: two or three tap-to-answer questions that end in one recommendation and
// one action (open that offer's brief, run the audit, or book a call). No AI, no network.
// Offer prices are read from the offer cards on the page, so editing a card updates the guide.
(function () {
  const onWork = !!document.getElementById('check');
  const CAL_WORK = 'https://cal.com/krishna-kumar-cloud-gtm/krishna-work-with-me';
  const CAL_HIRE = 'https://cal.com/krishna-kumar-cloud-gtm/interview-30min';

  const card = (name) => [...document.querySelectorAll('.offer')].find((c) => c.querySelector('h3')?.textContent.trim() === name);
  const price = (name) => card(name)?.querySelector('.price')?.textContent.trim() || '';
  const term = (name) => card(name)?.querySelector('.offer-term')?.textContent.trim() || '';
  // Questions come from the page's own FAQ, so there is one source of truth.
  const faq = () => [...document.querySelectorAll('.faq details')].map((d) => ({
    q: d.querySelector('summary').textContent.trim(), a: d.querySelector('p').textContent.trim()
  }));

  const offer = (name, why, cta) => ({ rec: { name, price: () => price(name), term: () => term(name), why, cta } });
  const WORK = {
    start: { say: 'Two quick questions and I\'ll point you to the right offer. Is your product live on AWS Marketplace?', opts: [
      ['Yes, it\'s live', 'live'], ['Not yet', 'new'], ['I have a question first', 'faq']] },
    live: { say: 'What do you need most?', opts: [
      ['Know where my listing stands', 'audit'], ['Fix the listing so reviewers approve', 'optimize'], ['Turn the listing into pipeline', 'sprint']] },
    new: { say: 'What do you need?', opts: [
      ['Get the listing built and live', 'launch'], ['The listing plus a go-to-market push', 'sprint']] },
    audit: { rec: { name: 'Free Listing Audit', price: () => 'Free', term: () => 'About a minute', why: 'Paste your listing and see your score out of 100, your rank against live listings, and the 3 fixes worth the most points.', cta: { label: 'Run the free audit', go: '#check' } } },
    optimize: offer('Listing Optimize', 'I audit your listing by hand on all 7 dimensions, then rewrite it so security, procurement and technical reviewers find their answers on the page.', { label: 'Start the optimize', enquiry: 'optimize' }),
    launch: offer('Listing Launch', 'I write every field and take the listing through AWS approval. Your engineers handle the SaaS integration; the clock starts once it\'s ready.', { label: 'Plan the launch', enquiry: 'launch' }),
    sprint: offer('Marketplace Launch Sprint', 'The listing plus positioning, a keyword plan, a proof plan, a co-sell kit and launch content, with weekly check-ins.', { label: 'Scope the sprint', enquiry: 'sprint' }),
    faq: { say: 'Pick a question:', faq: true }
  };
  const HIRE = {
    start: { say: 'Hiring for Cloud GTM, AWS Marketplace or partner marketing? What kind of role is it?', opts: [
      ['Full-time', 'ft'], ['Fractional or contract', 'fr'], ['Just looking around', 'tour']] },
    ft: { say: 'Where is the role based?', set: { engagement: 'Full-time' }, opts: [['Remote', 'loc:Remote'], ['Hybrid', 'loc:Hybrid'], ['On-site', 'loc:On-site']] },
    fr: { say: 'Where is the role based?', set: { engagement: 'Fractional' }, opts: [['Remote', 'loc:Remote'], ['Hybrid', 'loc:Hybrid'], ['On-site', 'loc:On-site']] },
    send: { rec: { name: 'Send the role', price: () => '', term: () => 'Reply within one business day', why: 'A one-minute brief: company, role, budget or salary range and start date. Your answers so far are already filled in.', cta: { label: 'Send the role', enquiry: 'hire' }, alt: { label: 'Book a 30-min interview', href: CAL_HIRE } } },
    tour: { say: 'Here\'s where to look:', links: [
      ['What I do at SaaSNova.ai', '#work'], ['Experience', '#experience'], ['Download the résumé', 'assets/Krishna-Kumar-TS-Resume.pdf'], ['Listing audit and offers', 'index.html']] }
  };
  const FLOW = onWork ? WORK : HIRE;
  const answers = {};

  const root = document.createElement('div');
  root.className = 'bot';
  root.innerHTML = `
    <button class="bot-open" type="button" aria-expanded="false" aria-controls="bot-panel">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg><span>${onWork ? 'Which offer fits you?' : 'Hiring? Start here'}</span>
    </button>
    <section class="bot-panel" id="bot-panel" hidden aria-label="${onWork ? 'Offer guide' : 'Hiring guide'}">
      <header class="bot-head">
        <div><strong>${onWork ? 'Find the right offer' : 'Hiring Krishna'}</strong><span>${onWork ? 'Two questions, one recommendation' : 'Three taps to a ready brief'}</span></div>
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
    if (cta.go) { document.querySelector(cta.go)?.scrollIntoView({ behavior: 'smooth' }); document.querySelector('#check-form input')?.focus({ preventScroll: true }); }
    else if (cta.enquiry && window.KKEnquiry) window.KKEnquiry.open(cta.enquiry, { ...answers });
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
    if (node.faq) showFaq();
    if (node.links) optsRow(node.links.map(([label, href]) => link(label, href, 'bot-link')).concat(btn('Start over', restart, 'bot-ghost')));
    if (node.rec) {
      const r = node.rec, meta = [r.price(), r.term()].filter(Boolean).join(' · ');
      bubble('bot', `<div class="bot-rec"><span class="bot-rec-tag">Recommended</span><strong>${r.name}</strong>${meta ? `<span class="bot-rec-meta">${meta}</span>` : ''}<p>${r.why}</p></div>`);
      const alt = r.alt || { label: 'Book a 30-min call', href: CAL_WORK };
      optsRow([btn(r.cta.label, () => act(r.cta), 'bot-primary'), link(alt.label, alt.href, 'bot-link'), btn('Start over', restart, 'bot-ghost')]);
    }
  }
  function showFaq() {
    optsRow(faq().map(({ q, a }) => btn(q, () => {
      clearOpts(); bubble('me', q); bubble('bot', a);
      optsRow([btn('Find my offer', () => { clearOpts(); step('start'); }, 'bot-primary'), btn('Another question', () => { clearOpts(); step('faq'); }, 'bot-ghost')]);
    })));
  }
  function restart() { log.innerHTML = ''; Object.keys(answers).forEach((k) => delete answers[k]); step('start'); }

  function open() { panel.hidden = false; root.classList.remove('bot-waiting'); openBtn.setAttribute('aria-expanded', 'true'); if (!log.childElementCount) step('start'); else log.querySelector('.bot-opts button, .bot-opts a')?.focus(); }
  function close() { panel.hidden = true; openBtn.setAttribute('aria-expanded', 'false'); }
  openBtn.addEventListener('click', () => (panel.hidden ? open() : close()));
  root.querySelector('.bot-x').addEventListener('click', () => { close(); openBtn.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { close(); openBtn.focus(); } });

  // The launcher appears once the visitor scrolls past the hero, so it never competes
  // with the audit form or the main call to action.
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    root.classList.add('bot-waiting');
    new IntersectionObserver(([e]) => { if (panel.hidden) root.classList.toggle('bot-waiting', e.isIntersecting); }, { threshold: 0.2 }).observe(hero);
  }
})();

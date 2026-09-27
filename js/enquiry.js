// Enquiry briefs without a CRM: a short form builds the email, then the visitor sends it
// from Gmail, Outlook, their own mail app, or copies it. Nothing is sent from this page.
// Buttons opt in with data-enquiry="optimize|launch|sprint|hire"; their mailto href stays
// as the no-JavaScript fallback.
(function () {
  const TO = 'krishnas2404@gmail.com';
  const F = {
    name: { label: 'Your name', required: true },
    email: { label: 'Your work email', type: 'email', required: true },
    company: { label: 'Company', required: true },
    url: { label: 'Listing URL', type: 'url', placeholder: 'https://aws.amazon.com/marketplace/pp/prodview-…', required: true },
    site: { label: 'Product website', type: 'url', required: true },
    deal: { label: 'Live deal you want AWS co-sell help on?', choices: ['Yes', 'No'] },
    pricing: { label: 'Pricing page link', type: 'url', placeholder: 'Or a line on how you price today' },
    integration: { label: 'SaaS integration (your engineers)', choices: ['Not started', 'In progress', 'Done'] },
    access: { label: 'How should the listing be set up?', choices: ['Temporary IAM access', 'Hand it to our team'] },
    status: { label: 'Where you are now', choices: ['Not listed yet', 'Listed, no pipeline', 'Listed, some deals'] },
    goal: { label: 'What the sprint must deliver', textarea: true, placeholder: 'For example: first 3 Marketplace deals, co-sell with our AWS rep' },
    budget: { label: 'Budget range', placeholder: 'The range you have for this' },
    start: { label: 'Start date', placeholder: 'For example: next week, 1 November' },
    golive: { label: 'Target go-live date' },
    role: { label: 'Role title', required: true },
    engagement: { label: 'Engagement', choices: ['Full-time', 'Fractional'], required: true },
    location: { label: 'Location', choices: ['Remote', 'Hybrid', 'On-site'] },
    pay: { label: 'Budget or salary range', required: true, placeholder: 'For example: $60–75k, or $2k/month fractional' },
    jd: { label: 'Job description link', type: 'url' }
  };
  const TYPES = {
    optimize: { title: 'Start the Listing Optimize', subject: (v) => `Listing Optimize: ${v.company}`, lead: '$500 · 3 business days. Scope and invoice within one business day.', fields: ['url', 'site', 'company', 'name', 'email', 'pricing', 'deal', 'start'], attach: true },
    launch: { title: 'Plan the Listing Launch', subject: (v) => `Listing Launch: ${v.company}`, lead: '$1,000 · live in about 14 days once your SaaS integration is ready. Plan and invoice within one business day.', fields: ['site', 'company', 'name', 'email', 'pricing', 'integration', 'access', 'golive'], attach: true },
    sprint: { title: 'Scope the Marketplace Launch Sprint', subject: (v) => `Marketplace Launch Sprint: ${v.company}`, lead: 'Custom scope. Deliverables, timeline and a fixed price within one business day.', fields: ['site', 'company', 'name', 'email', 'status', 'goal', 'budget', 'start'], attach: true },
    hire: { title: 'Send me the role', subject: (v) => `Role for Krishna: ${v.role} at ${v.company}`, lead: 'A clear answer within one business day, with interview times if it fits.', fields: ['company', 'role', 'engagement', 'pay', 'location', 'start', 'jd', 'name', 'email'] }
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const dlg = document.createElement('dialog');
  dlg.className = 'enq';
  dlg.setAttribute('aria-labelledby', 'enq-title');
  document.body.appendChild(dlg);

  function field(key) {
    const f = F[key];
    const req = f.required ? ' required' : '';
    const opt = f.required ? '' : ' <span>optional</span>';
    if (f.choices) {
      return `<fieldset class="enq-choices"><legend>${f.label}${opt}</legend>${f.choices.map((c, i) =>
        `<label><input type="radio" name="${key}" value="${esc(c)}"${req && i === 0 ? ' required' : ''}><span>${esc(c)}</span></label>`).join('')}</fieldset>`;
    }
    const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : '';
    const ctl = f.textarea
      ? `<textarea name="${key}" rows="3"${ph}${req}></textarea>`
      : `<input name="${key}" type="${f.type || 'text'}"${ph}${req} autocomplete="${key === 'email' ? 'email' : key === 'name' ? 'name' : 'off'}">`;
    return `<label class="field">${f.label}${opt}${ctl}</label>`;
  }

  // preset: { field: value } to pre-select answers the visitor already gave (used by js/assistant.js)
  function open(type, preset = {}) {
    const t = TYPES[type];
    dlg.innerHTML = `
      <form class="enq-form" method="dialog" novalidate>
        <div class="enq-head">
          <h2 id="enq-title">${t.title}</h2>
          <button type="button" class="enq-x" aria-label="Close">×</button>
        </div>
        <p class="enq-lead">${t.lead}</p>
        <div class="enq-fields">${t.fields.map(field).join('')}</div>
        <p class="check-error" role="alert"></p>
        <button class="btn btn-primary btn-block" type="submit">Write my email</button>
        <p class="tool-note">${t.attach ? 'Next, your email opens with this brief filled in. Attach your one-pager or deck before you send. ' : 'Next, your email opens with this brief filled in. '}Prefer to talk first? <a href="${type === 'hire' ? 'https://cal.com/krishna-kumar-cloud-gtm/interview-30min' : 'https://cal.com/krishna-kumar-cloud-gtm/krishna-work-with-me'}" target="_blank" rel="noopener">Book a 30-min call</a>.</p>
      </form>
      <div class="enq-send" hidden>
        <div class="enq-head">
          <h2>Your email is ready</h2>
          <button type="button" class="enq-x" aria-label="Close">×</button>
        </div>
        <p class="enq-lead">Send it from whichever you use. It goes to <strong>${TO}</strong>.${t.attach ? ' Attach your one-pager or deck.' : ''}</p>
        <div class="enq-apps">
          <a class="btn btn-primary" data-app="gmail" target="_blank" rel="noopener">Open in Gmail</a>
          <a class="btn btn-outline" data-app="outlook" target="_blank" rel="noopener">Open in Outlook</a>
          <a class="btn btn-outline" data-app="mail">My email app</a>
          <button class="btn btn-outline" type="button" data-copy>Copy the email</button>
        </div>
        <pre class="enq-preview"></pre>
        <button type="button" class="link-btn" data-back>Edit the brief</button>
      </div>`;
    const form = dlg.querySelector('form');
    dlg.querySelectorAll('.enq-x').forEach((b) => b.addEventListener('click', () => dlg.close()));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const miss = [...form.querySelectorAll('[required]')].find((el) =>
        el.type === 'radio' ? !form.querySelector(`[name="${el.name}"]:checked`) : !el.value.trim() || !el.checkValidity());
      if (miss) {
        const key = miss.name;
        form.querySelector('.check-error').textContent = `Add ${F[key].label.toLowerCase()}.`;
        miss.focus();
        return;
      }
      const v = Object.fromEntries(t.fields.map((k) => [k, (new FormData(form).get(k) || '').toString().trim()]));
      const subject = t.subject(v);
      const body = t.fields.filter((k) => v[k]).map((k) => `${F[k].label}: ${v[k]}`).join('\n') + '\n';
      const s = encodeURIComponent(subject), b = encodeURIComponent(body);
      const send = dlg.querySelector('.enq-send');
      send.querySelector('[data-app="gmail"]').href = `https://mail.google.com/mail/?view=cm&fs=1&to=${TO}&su=${s}&body=${b}`;
      send.querySelector('[data-app="outlook"]').href = `https://outlook.office.com/mail/deeplink/compose?to=${TO}&subject=${s}&body=${b}`;
      send.querySelector('[data-app="mail"]').href = `mailto:${TO}?subject=${s}&body=${b}`;
      send.querySelector('.enq-preview').textContent = `To: ${TO}\nSubject: ${subject}\n\n${body}`;
      send.querySelector('[data-copy]').onclick = async (ev) => {
        try { await navigator.clipboard.writeText(`To: ${TO}\nSubject: ${subject}\n\n${body}`); ev.target.textContent = 'Copied'; }
        catch (err) { ev.target.textContent = 'Select the text below'; }
      };
      form.hidden = true;
      send.hidden = false;
      send.querySelector('[data-app="gmail"]').focus();
    });
    dlg.querySelector('[data-back]').addEventListener('click', () => { dlg.querySelector('.enq-send').hidden = true; form.hidden = false; });
    Object.entries(preset).forEach(([k, v]) => {
      const radio = form.querySelector(`[name="${k}"][value="${v}"]`);
      if (radio) radio.checked = true;
      else if (form.elements[k]) form.elements[k].value = v;
    });
    dlg.showModal();
    form.querySelector('input, textarea').focus();
  }

  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-enquiry]');
    if (!b || !TYPES[b.dataset.enquiry] || typeof dlg.showModal !== 'function') return;
    e.preventDefault();
    open(b.dataset.enquiry);
  });
  window.KKEnquiry = { open };
})();

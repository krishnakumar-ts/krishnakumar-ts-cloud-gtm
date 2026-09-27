// Enquiries without a CRM. Offer buttons open a short brief that becomes a properly written
// email; hiring opens a ready draft straight away. Either way the visitor sends it from Gmail,
// Outlook or their own mail app, or copies it. Nothing is sent from this page.
// Buttons opt in with data-enquiry="optimize|launch|sprint|hire"; their mailto href stays
// as the no-JavaScript fallback.
(function () {
  const TO = 'krishnas2404@gmail.com';
  const CAL_WORK = 'https://cal.com/krishna-kumar-cloud-gtm/krishna-work-with-me';
  const CAL_HIRE = 'https://cal.com/krishna-kumar-cloud-gtm/interview-30min';
  const F = {
    name: { label: 'Your name', required: true },
    email: { label: 'Your work email', type: 'email', required: true },
    company: { label: 'Company', required: true },
    url: { label: 'Listing URL', type: 'url', placeholder: 'https://aws.amazon.com/marketplace/pp/prodview-…', required: true },
    site: { label: 'Product website', type: 'url', required: true },
    deal: { label: 'Live deal you want AWS co-sell help on?', choices: ['Yes', 'No'] },
    pricing: { label: 'Pricing page link', placeholder: 'Or a line on how you price today' },
    integration: { label: 'SaaS integration (your engineers)', choices: ['Not started', 'In progress', 'Done'] },
    access: { label: 'How should the listing be set up?', choices: ['Temporary IAM access', 'Hand it to our team'] },
    status: { label: 'Where you are now', choices: ['Not listed yet', 'Listed, no pipeline', 'Listed, some deals'] },
    goal: { label: 'What the sprint must deliver', textarea: true, placeholder: 'For example: first 3 Marketplace deals, co-sell with our AWS rep' },
    budget: { label: 'Budget range', placeholder: 'The range you have for this' },
    start: { label: 'Preferred start', placeholder: 'For example: next week, 1 November' },
    golive: { label: 'Target go-live date' }
  };

  // Price and timing come from the offer card, so card edits carry into the dialog.
  const card = (name) => [...document.querySelectorAll('.offer')].find((c) => c.querySelector('h3')?.textContent.trim() === name);
  const meta = (name) => [card(name)?.querySelector('.price')?.textContent.trim(), card(name)?.querySelector('.offer-term')?.textContent.trim()].filter(Boolean).join(' · ');

  const line = (label, value) => (value ? `${label}: ${value}\n` : '');
  const sign = (v) => `Best regards,\n${v.name}\n${v.company} · ${v.email}\n`;
  const TYPES = {
    optimize: {
      offer: 'Listing Optimize', title: 'Start the Listing Optimize', reply: 'Scope and invoice within one business day.',
      fields: ['url', 'site', 'company', 'name', 'email', 'pricing', 'deal', 'start'],
      subject: (v) => `Listing Optimize for ${v.company}`,
      body: (v) => `Hi Krishna,\n\nI'd like to book a Listing Optimize for ${v.company}'s AWS Marketplace listing.\n\n`
        + line('Listing', v.url) + line('Website', v.site) + line('Pricing', v.pricing) + line('Live AWS deal for co-sell help', v.deal) + line('Preferred start', v.start)
        + `\nI've attached our one-pager or deck for context.\n\nCould you send the scope and invoice?\n\n${sign(v)}`
    },
    launch: {
      offer: 'Listing Launch', title: 'Plan the Listing Launch', reply: 'Plan and invoice within one business day.',
      fields: ['site', 'company', 'name', 'email', 'pricing', 'integration', 'access', 'golive'],
      subject: (v) => `Listing Launch for ${v.company}`,
      body: (v) => `Hi Krishna,\n\nWe'd like to launch ${v.company} on AWS Marketplace with your Listing Launch.\n\n`
        + line('Website', v.site) + line('Pricing', v.pricing) + line('SaaS integration', v.integration) + line('Set-up preference', v.access) + line('Target go-live', v.golive)
        + `\nI've attached our one-pager or deck for context.\n\nCould you send the plan and invoice?\n\n${sign(v)}`
    },
    sprint: {
      offer: 'Marketplace Launch Sprint', title: 'Scope the Marketplace Launch Sprint', reply: 'Deliverables, timeline and a fixed price within one business day.',
      fields: ['site', 'company', 'name', 'email', 'status', 'goal', 'budget', 'start'],
      subject: (v) => `Marketplace Launch Sprint for ${v.company}`,
      body: (v) => `Hi Krishna,\n\nWe're interested in the Marketplace Launch Sprint for ${v.company}.\n\n`
        + line('Where we are', v.status) + (v.goal ? `What we need the sprint to deliver:\n${v.goal}\n` : '')
        + '\n' + line('Website', v.site) + line('Budget range', v.budget) + line('Preferred start', v.start)
        + `\nI've attached our one-pager or deck for context.\n\nCould you send the proposed scope, timeline and price?\n\n${sign(v)}`
    }
  };
  // Recruiters get a ready draft, not a form. Brackets are left for them to fill in.
  const hireDraft = (p = {}) => ({
    subject: 'Opportunity: [role title] at [company]',
    body: `Hi Krishna,\n\nI'm [your name], [your title] at [company]. We're hiring for a [role title] `
      + `(${p.engagement ? p.engagement.toLowerCase() : 'full-time or fractional'}, ${p.location ? p.location.toLowerCase() : 'remote, hybrid or on-site'}).\n\n`
      + 'Job description: [link]\nSalary or budget range: [range]\n\nWould you be open to a 30-minute call this week?\n\nBest regards,\n[Your name]\n'
  });
  const selfDraft = (t) => ({
    subject: `${t.offer} for [company]`,
    body: `Hi Krishna,\n\nI'm interested in the ${t.offer} for [company].\n\nListing or website: [link]\n\nCould you tell me the next steps?\n\nBest regards,\n[Your name]\n[Company]\n`
  });

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const dlg = document.createElement('dialog');
  dlg.className = 'enq';
  dlg.setAttribute('aria-labelledby', 'enq-title');
  document.body.appendChild(dlg);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

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

  const sendPanel = (title, lead) => `
    <div class="enq-send" hidden>
      <div class="enq-head"><h2 id="enq-title">${title}</h2><button type="button" class="enq-x" aria-label="Close">×</button></div>
      <p class="enq-lead">${lead}</p>
      <div class="enq-apps">
        <a class="btn btn-primary" data-app="gmail" target="_blank" rel="noopener">Open in Gmail</a>
        <a class="btn btn-outline" data-app="outlook" target="_blank" rel="noopener">Open in Outlook</a>
        <a class="btn btn-outline" data-app="mail">Other email app</a>
        <button class="btn btn-outline" type="button" data-copy>Copy the email</button>
      </div>
      <pre class="enq-preview"></pre>
      <p class="tool-note enq-alt"></p>
    </div>`;

  function fillSend({ subject, body }) {
    const send = dlg.querySelector('.enq-send');
    const s = encodeURIComponent(subject), b = encodeURIComponent(body), all = `To: ${TO}\nSubject: ${subject}\n\n${body}`;
    send.querySelector('[data-app="gmail"]').href = `https://mail.google.com/mail/?view=cm&fs=1&to=${TO}&su=${s}&body=${b}`;
    send.querySelector('[data-app="outlook"]').href = `https://outlook.office.com/mail/deeplink/compose?to=${TO}&subject=${s}&body=${b}`;
    send.querySelector('[data-app="mail"]').href = `mailto:${TO}?subject=${s}&body=${b}`;
    send.querySelector('.enq-preview').textContent = all;
    send.querySelector('[data-copy]').onclick = async (ev) => {
      try { await navigator.clipboard.writeText(all); ev.target.textContent = 'Copied'; }
      catch (err) { ev.target.textContent = 'Select the text below'; }
    };
    dlg.querySelector('form')?.setAttribute('hidden', '');
    send.hidden = false;
    send.querySelector('[data-app="gmail"]').focus();
  }
  const wire = () => dlg.querySelectorAll('.enq-x').forEach((b) => b.addEventListener('click', () => dlg.close()));

  function openHire(preset = {}) {
    dlg.innerHTML = sendPanel('Email Krishna', `A short draft to <strong>${TO}</strong>. Fill in the brackets and send.`);
    dlg.querySelector('.enq-alt').innerHTML = `Rather talk? <a href="${CAL_HIRE}" target="_blank" rel="noopener">Book a 30-min call</a>.`;
    wire();
    dlg.showModal();
    fillSend(hireDraft(preset));
  }

  // preset: { field: value } to pre-select answers the visitor already gave (used by js/assistant.js)
  function open(type, preset = {}) {
    if (type === 'hire') return openHire(preset);
    const t = TYPES[type];
    const m = meta(t.offer);
    dlg.innerHTML = `
      <form class="enq-form" method="dialog" novalidate>
        <div class="enq-head"><h2 id="enq-title">${t.title}</h2><button type="button" class="enq-x" aria-label="Close">×</button></div>
        <p class="enq-lead">${m ? `${esc(m)}. ` : ''}${t.reply}</p>
        <div class="enq-fields">${t.fields.map(field).join('')}</div>
        <p class="check-error" role="alert"></p>
        <button class="btn btn-primary btn-block" type="submit">Draft my email</button>
        <p class="tool-note">Your answers become a short email you send from your own inbox. <button type="button" class="link-btn" data-self>Write it yourself</button> or <a href="${CAL_WORK}" target="_blank" rel="noopener">book a 30-min call</a>.</p>
      </form>
      ${sendPanel('Your email is ready', `To <strong>${TO}</strong>. Attach your one-pager or deck before you send.`)}`;
    dlg.querySelector('.enq-alt').innerHTML = '<button type="button" class="link-btn" data-back>Edit the details</button>';
    wire();
    const form = dlg.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const miss = [...form.querySelectorAll('[required]')].find((el) =>
        el.type === 'radio' ? !form.querySelector(`[name="${el.name}"]:checked`) : !el.value.trim() || !el.checkValidity());
      if (miss) {
        form.querySelector('.check-error').textContent = `Add ${F[miss.name].label.toLowerCase()}.`;
        miss.focus();
        return;
      }
      const v = Object.fromEntries(t.fields.map((k) => [k, (new FormData(form).get(k) || '').toString().trim()]));
      fillSend({ subject: t.subject(v), body: t.body(v) });
    });
    dlg.querySelector('[data-self]').addEventListener('click', () => fillSend(selfDraft(t)));
    dlg.querySelector('[data-back]').addEventListener('click', () => { dlg.querySelector('.enq-send').hidden = true; form.hidden = false; });
    Object.entries(preset).forEach(([k, v]) => {
      const radio = form.querySelector(`[name="${k}"][value="${v}"]`);
      if (radio) radio.checked = true;
      else if (form.elements[k]) form.elements[k].value = v;
    });
    dlg.showModal();
    form.querySelector('input, textarea').focus();
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-enquiry]');
    if (!b || !(b.dataset.enquiry === 'hire' || TYPES[b.dataset.enquiry]) || typeof dlg.showModal !== 'function') return;
    e.preventDefault();
    open(b.dataset.enquiry);
  });
  window.KKEnquiry = { open };
})();

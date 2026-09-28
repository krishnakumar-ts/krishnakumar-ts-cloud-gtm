// Hiring email without a CRM. "Email me" buttons open a ready draft the visitor sends from
// Gmail, Outlook or their own mail app, or copies. Nothing is sent from this page.
// Buttons opt in with data-enquiry="hire"; their mailto href stays as the no-JavaScript fallback.
(function () {
  const TO = 'krishnas2404@gmail.com';
  const CAL_HIRE = 'https://cal.com/krishna-kumar-cloud-gtm/interview-30min';

  // Recruiters get a ready draft, not a form. Brackets are left for them to fill in.
  const hireDraft = (p = {}) => ({
    subject: 'Opportunity: [role title] at [company]',
    body: `Hi Krishna,\n\nI'm [your name], [your title] at [company]. We're hiring for a [role title] `
      + `(${p.engagement ? p.engagement.toLowerCase() : 'full-time or fractional'}, ${p.location ? p.location.toLowerCase() : 'remote, hybrid or on-site'}).\n\n`
      + 'Job description: [link]\nSalary or budget range: [range]\n\nWould you be open to a 30-minute call this week?\n\nBest regards,\n[Your name]\n'
  });

  const dlg = document.createElement('dialog');
  dlg.className = 'enq';
  dlg.setAttribute('aria-labelledby', 'enq-title');
  document.body.appendChild(dlg);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

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
    send.hidden = false;
    send.querySelector('[data-app="gmail"]').focus();
  }

  // preset: { engagement, location } the visitor already chose in js/assistant.js
  function open(type, preset = {}) {
    dlg.innerHTML = sendPanel('Email Krishna', `A short draft to <strong>${TO}</strong>. Fill in the brackets and send.`);
    dlg.querySelector('.enq-alt').innerHTML = `Rather talk? <a href="${CAL_HIRE}" target="_blank" rel="noopener">Book a 30-min call</a>.`;
    dlg.querySelectorAll('.enq-x').forEach((b) => b.addEventListener('click', () => dlg.close()));
    dlg.showModal();
    fillSend(hireDraft(preset));
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-enquiry="hire"]');
    if (!b || typeof dlg.showModal !== 'function') return;
    e.preventDefault();
    open('hire');
  });
  window.KKEnquiry = { open };
})();

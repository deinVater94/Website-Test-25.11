(() => {
  const config = window.JK_MEDIA_CONFIG ?? {};
  const form = document.querySelector('#contact-form');
  const fields = form.querySelector('fieldset');
  const modeButtons = [...document.querySelectorAll('[data-contact-mode]')];
  const bookingFields = document.querySelectorAll('[data-booking-field]');
  const projectFields = document.querySelectorAll('[data-project-field]');
  const modeNote = document.querySelector('#contact-mode-note');
  const deliveryNote = document.querySelector('#contact-delivery-note');
  const dateField = form.elements.preferredDate;
  const messageField = form.elements.message;
  const messageLabel = document.querySelector('[data-message-label]');
  const submitButton = document.querySelector('[data-contact-submit]');
  const status = document.querySelector('[data-contact-status]');
  const draft = document.querySelector('[data-contact-draft]');
  const draftText = document.querySelector('#contact-draft-text');
  const draftEmail = document.querySelector('[data-draft-email]');
  const bookingLink = document.querySelector('[data-booking-link]');
  const email = validEmail(config.contactEmail);
  const endpoint = validWebUrl(config.formEndpoint);
  const bookingUrl = validWebUrl(config.bookingUrl);
  const delivery = endpoint ? 'api' : email ? 'email' : 'demo';
  const submitLabels = {
    api: 'Anfrage senden',
    email: 'E-Mail öffnen',
    demo: 'Entwurf anzeigen',
  };
  let mode;

  function validEmail(value) {
    const emailPattern = /^[^\s@?&#,;<>]+@[^\s@?&#,;<>]+\.[^\s@?&#,;<>]+$/u;
    return typeof value === 'string' && emailPattern.test(value.trim()) ? value.trim() : '';
  }

  function validWebUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value, document.baseURI);
      if (url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin)) {
        return url.href;
      }
    } catch {
      return '';
    }
    return '';
  }

  function exposeLink(selector, href) {
    if (!href) return;
    const link = document.querySelector(selector);
    link.href = href;
    link.hidden = false;
  }

  function berlinDate() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${date.year}-${date.month}-${date.day}`;
  }

  function toggleFields(group, visible) {
    group.forEach((label) => {
      label.hidden = !visible;
      label.control.disabled = !visible;
    });
  }

  function clearDraft() {
    draft.hidden = true;
    draftText.value = '';
    draftEmail.removeAttribute('href');
    draftEmail.hidden = true;
    status.textContent = '';
  }

  function setMode(nextMode) {
    if (mode === nextMode) return;
    mode = nextMode;
    const isBooking = mode === 'termin';
    modeButtons.forEach((button) => button.setAttribute('aria-pressed', button.dataset.contactMode === mode));
    toggleFields(projectFields, !isBooking);
    toggleFields(bookingFields, isBooking);
    bookingLink.hidden = !isBooking || !bookingUrl;
    dateField.min = berlinDate();
    messageField.required = !isBooking;
    messageField.setCustomValidity('');
    messageLabel.textContent = isBooking ? 'Thema des Gesprächs (optional)' : 'Ihre Nachricht';
    if (!isBooking) {
      const requiredMark = document.createElement('span');
      requiredMark.setAttribute('aria-hidden', 'true');
      requiredMark.textContent = ' *';
      messageLabel.append(requiredMark);
    }
    if (!isBooking) {
      modeNote.textContent = 'Beschreiben Sie kurz Ihr Vorhaben und nennen Sie, falls bekannt, den geplanten Zeitraum.';
    } else if (delivery === 'demo') {
      modeNote.textContent = 'Wählen Sie für den Test ein Wunschdatum und bei Bedarf ein Zeitfenster.';
    } else {
      modeNote.textContent = 'Schlagen Sie einen Termin vor. Wir bestätigen den Termin oder melden uns mit einem anderen Vorschlag.';
    }
    clearDraft();
  }

  function asRequest() {
    const request = { type: mode };
    for (const [key, value] of new FormData(form)) {
      if (value.trim()) request[key] = value.trim();
    }
    return request;
  }

  function asDraft(request) {
    const subject = request.type === 'termin' ? 'Erstgespräch mit J&K Media' : 'Projektanfrage an J&K Media';
    const preferredDate = request.preferredDate
      ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeZone: 'UTC' })
        .format(new Date(`${request.preferredDate}T12:00:00Z`))
      : '';
    const details = [
      ['Name', request.name],
      ['Organisation', request.company],
      ['E-Mail', request.email],
      ['Telefon', request.phone],
      ['Bereich', request.service],
      ['Wunschdatum', preferredDate],
      ['Zeitfenster (Berliner Zeit)', request.preferredTime],
    ];
    const lines = details.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`);
    if (request.message) lines.push('', request.message);
    return { subject, body: lines.join('\n') };
  }

  function showDraft(request, feedback) {
    const { subject, body } = asDraft(request);
    draftText.value = `${subject}\n\n${body}`;
    draft.hidden = false;
    status.textContent = feedback;
    if (!email) return '';

    const mailSubject = `mailto:${encodeURI(email)}?subject=${encodeURIComponent(subject)}`;
    const mailWithBody = `${mailSubject}&body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`;
    const canPrefill = mailWithBody.length <= 2000;
    draftEmail.href = canPrefill ? mailWithBody : mailSubject;
    draftEmail.hidden = false;
    return canPrefill ? mailWithBody : '';
  }

  function setBusy(busy) {
    form.setAttribute('aria-busy', busy);
    fields.disabled = busy;
    submitButton.disabled = busy;
    submitButton.textContent = busy ? 'Wird gesendet …' : submitLabels[delivery];
    modeButtons.forEach((button) => { button.disabled = busy; });
  }

  async function sendRequest(request) {
    setBusy(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(request),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        redirect: 'error',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Die Anfrage wurde vom Server abgelehnt.');
      form.reset();
      status.textContent = request.type === 'termin'
        ? 'Wir haben Ihren Terminvorschlag erhalten und melden uns per E-Mail.'
        : 'Wir haben Ihre Anfrage erhalten und melden uns per E-Mail.';
    } catch {
      showDraft(request, 'Der Versand konnte nicht bestätigt werden. Kopieren Sie den Entwurf oder versuchen Sie es erneut.');
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
    }
  }

  const phone = typeof config.phone === 'string' ? config.phone.replace(/[^+\d]/g, '') : '';
  const channels = [
    ['[data-contact-email]', email ? `mailto:${encodeURI(email)}` : ''],
    ['[data-contact-phone]', /^\+?\d+$/.test(phone) ? `tel:${phone}` : ''],
    ['[data-contact-whatsapp]', validWebUrl(config.whatsappUrl)],
  ];
  channels.forEach(([selector, href]) => exposeLink(selector, href));
  document.querySelector('[data-contact-channels]').hidden = !channels.some(([, href]) => href);
  if (bookingUrl) document.querySelector('[data-booking-url]').href = bookingUrl;

  setMode(new URL(location.href).searchParams.get('anliegen') === 'termin' ? 'termin' : 'projekt');
  modeButtons.forEach((button) => button.addEventListener('click', () => {
    setMode(button.dataset.contactMode);
    if (location.protocol === 'file:') return;
    const url = new URL(location.href);
    if (mode === 'termin') url.searchParams.set('anliegen', mode);
    else url.searchParams.delete('anliegen');
    history.replaceState(null, '', url);
  }));

  const deliveryNotes = {
    api: 'Ihre Angaben werden über das Formular übermittelt.',
    email: 'Ihr E-Mail-Programm öffnet den Entwurf zum Versand.',
    demo: 'Verwenden Sie Testdaten. Der Entwurf bleibt in diesem Browserfenster.',
  };
  deliveryNote.textContent = deliveryNotes[delivery];
  setBusy(false);
  document.querySelector('[data-contact-interface]').hidden = false;

  form.addEventListener('input', ({ target }) => target.setCustomValidity?.(''));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    dateField.min = berlinDate();
    const request = asRequest();
    if (!request.name) form.elements.name.setCustomValidity('Bitte geben Sie Ihren Namen an.');
    if (mode === 'projekt' && !request.message) messageField.setCustomValidity('Bitte beschreiben Sie kurz Ihr Projekt.');
    if (!form.reportValidity()) return;

    clearDraft();
    if (delivery === 'api') {
      void sendRequest(request);
    } else if (delivery === 'email') {
      const mailto = showDraft(request, 'Versenden Sie den Entwurf in Ihrem E-Mail-Programm.');
      if (mailto) location.href = mailto;
      else status.textContent = 'Der Entwurf ist zu lang für den E-Mail-Link. Kopieren Sie den Text in Ihre E-Mail.';
    } else {
      showDraft(request, 'Der Testentwurf ist bereit zum Kopieren.');
    }
  });

  document.querySelector('[data-copy-draft]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draftText.value);
      status.textContent = 'Entwurf kopiert.';
    } catch {
      draftText.focus();
      draftText.select();
      status.textContent = 'Der Entwurf ist markiert und kann kopiert werden.';
    }
  });
})();

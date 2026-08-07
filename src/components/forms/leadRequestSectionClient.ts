const REQUEST_HASH = '#request';

function focusRequestNameInput(section: HTMLElement) {
  const nameInput = section.querySelector<HTMLInputElement>('input[name="name"]');
  if (!nameInput) return;

  if (nameInput.value) delete nameInput.dataset.requestAutofocus;
  else nameInput.dataset.requestAutofocus = 'true';

  if (nameInput.dataset.requestAutofocusBound !== 'true') {
    nameInput.dataset.requestAutofocusBound = 'true';
    nameInput.addEventListener('input', () => {
      delete nameInput.dataset.requestAutofocus;
    });
  }
  nameInput.focus({ preventScroll: true });
}

function requestSection() {
  const section = document.querySelector<HTMLElement>('[data-lead-request-section]#request');
  return section ?? undefined;
}

function focusFromHash() {
  if (window.location.hash !== REQUEST_HASH) return;
  const section = requestSection();
  if (!section) return;
  requestAnimationFrame(() => {
    if (window.location.hash === REQUEST_HASH) focusRequestNameInput(section);
  });
}

function bindRequestLinks() {
  document
    .querySelectorAll<HTMLAnchorElement>(
      'a[href="#request"][data-contact-jump], a[href="#request"][data-lead-request-jump]',
    )
    .forEach((link) => {
      if (link.dataset.leadRequestJumpBound === 'true') return;
      link.dataset.leadRequestJumpBound = 'true';
      link.addEventListener('click', (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;

        const section = requestSection();
        if (!section) return;
        event.preventDefault();
        if (window.location.hash !== REQUEST_HASH) window.history.pushState(null, '', REQUEST_HASH);

        const align = () => {
          const top = window.scrollY + section.getBoundingClientRect().top;
          window.scrollTo({ left: window.scrollX, top, behavior: 'instant' });
        };
        align();
        requestAnimationFrame(() => {
          align();
          focusRequestNameInput(section);
        });
      });
    });
}

function initializeLeadRequestSection() {
  bindRequestLinks();
  focusFromHash();
}

initializeLeadRequestSection();
window.addEventListener(
  'load',
  () => {
    if (document.activeElement === document.body) focusFromHash();
  },
  { once: true },
);
window.addEventListener('hashchange', focusFromHash);
document.addEventListener('astro:page-load', initializeLeadRequestSection);

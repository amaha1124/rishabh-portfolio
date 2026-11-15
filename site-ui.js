// Lightweight interactions shared by desktop 3D and mobile reading mode.
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

const copyEmailButton = document.getElementById('copyEmailBtn');
const contactFeedback = document.getElementById('contactFeedback');
const contactEmail = 'arorarishabh607@gmail.com';
function fallbackCopyText(value) {
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  field.style.pointerEvents = 'none';
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0, value.length);
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Clipboard copy command was rejected');
}
copyEmailButton?.addEventListener('click', async () => {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) await navigator.clipboard.writeText(contactEmail);
    else fallbackCopyText(contactEmail);
    copyEmailButton.textContent = 'COPIED ✓';
    if (contactFeedback) contactFeedback.textContent = 'Email address copied to clipboard.';
  } catch (error) {
    try {
      fallbackCopyText(contactEmail);
      copyEmailButton.textContent = 'COPIED ✓';
      if (contactFeedback) contactFeedback.textContent = 'Email address copied to clipboard.';
    } catch (fallbackError) {
      if (contactFeedback) contactFeedback.textContent = `Copy unavailable. Email: ${contactEmail}`;
    }
  }
  copyEmailButton.disabled = true;
  window.setTimeout(() => {
    copyEmailButton.disabled = false;
    copyEmailButton.textContent = 'COPY EMAIL ⧉';
  }, 2200);
});

const soundButton = document.getElementById('soundBtn');
const ambientTrack = document.getElementById('ambientTrack');
if (ambientTrack) ambientTrack.volume = 0.24;
soundButton?.addEventListener('click', async () => {
  if (!ambientTrack) return;
  if (ambientTrack.paused) {
    try {
      await ambientTrack.play();
      soundButton.textContent = 'SOUND ON';
      soundButton.setAttribute('aria-label', 'Pause ambient soundtrack');
      soundButton.setAttribute('aria-pressed', 'true');
    } catch (error) {
      soundButton.textContent = 'AUDIO UNAVAILABLE';
      console.error('Could not play soundtrack:', error);
    }
  } else {
    ambientTrack.pause();
    soundButton.textContent = 'PLAY SOUND';
    soundButton.setAttribute('aria-label', 'Play ambient soundtrack');
    soundButton.setAttribute('aria-pressed', 'false');
  }
});

window.portfolioPauseAmbient = () => {
  if (!ambientTrack || ambientTrack.paused) return;
  ambientTrack.pause();
  if (soundButton) {
    soundButton.textContent = 'PLAY SOUND';
    soundButton.setAttribute('aria-label', 'Play ambient soundtrack');
    soundButton.setAttribute('aria-pressed', 'false');
  }
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden) window.portfolioPauseAmbient?.();
});


// In lightweight mobile mode the 3D module is intentionally not loaded, so
// provide the TOP control with a native scrolling action here.
const returnTopButton = document.getElementById('returnTopBtn');
returnTopButton?.addEventListener('click', () => {
  if (!document.documentElement.classList.contains('mobile-lite')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});


// Lightweight career-orbit interaction: selecting a dwarf planet reveals its milestone.
const careerPlanets = Array.from(document.querySelectorAll('.career-planet'));
const careerCompany = document.getElementById('careerCompany');
const careerRole = document.getElementById('careerRole');
const careerPeriod = document.getElementById('careerPeriod');
const careerSummary = document.getElementById('careerSummary');
careerPlanets.forEach((planet) => {
  planet.addEventListener('click', () => {
    careerPlanets.forEach((item) => {
      const selected = item === planet;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    if (careerCompany) careerCompany.textContent = planet.dataset.company || '';
    if (careerRole) careerRole.textContent = planet.dataset.role || '';
    if (careerPeriod) careerPeriod.textContent = planet.dataset.period || '';
    if (careerSummary) careerSummary.textContent = planet.dataset.summary || '';
  });
});

// v8.12 — shared Recruiter Mode and Technology Constellation dialogs.
// These are DOM/CSS-only interactions and stay available in lightweight mobile mode.
function bindFeatureDialog(dialogId, openerId) {
  const dialog = document.getElementById(dialogId);
  const opener = document.getElementById(openerId);
  if (!dialog || !opener) return null;
  const closeButtons = [...dialog.querySelectorAll('[data-feature-close="true"]')];
  const panel = dialog.querySelector('.feature-dialog-panel');
  let lastFocused = null;

  const focusableSelector = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function focusableItems() {
    return [...dialog.querySelectorAll(focusableSelector)].filter(item => !item.hidden && item.getAttribute('aria-hidden') !== 'true' && item.getClientRects().length > 0);
  }
  function close() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    document.body.classList.remove('feature-dialog-open');
    opener.setAttribute('aria-expanded', 'false');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    else opener.focus();
  }
  function open() {
    // Only one feature overlay should be visible at a time.
    document.querySelectorAll('.feature-dialog:not([hidden])').forEach(other => {
      if (other !== dialog) {
        other.hidden = true;
        const otherOpener = document.querySelector(`[aria-controls="${other.id}"]`);
        otherOpener?.setAttribute('aria-expanded', 'false');
      }
    });
    lastFocused = document.activeElement;
    dialog.hidden = false;
    document.body.classList.add('feature-dialog-open');
    opener.setAttribute('aria-expanded', 'true');
    const initialFocus = dialog.querySelector('[data-dialog-autofocus]') || dialog.querySelector('.feature-close') || panel;
    initialFocus?.focus();
  }

  opener.addEventListener('click', open);
  closeButtons.forEach(button => button.addEventListener('click', close));
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.classList?.contains('feature-dialog-backdrop')) close();
  });

  document.addEventListener('keydown', event => {
    if (dialog.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      event.stopImmediatePropagation();
      return;
    }
    if (event.key === 'Tab') {
      const items = focusableItems();
      if (!items.length) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    event.stopImmediatePropagation();
  }, true);

  // Prevent dialog gestures from being interpreted as camera-flight input.
  ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'pointermove', 'pointerup'].forEach(type => {
    window.addEventListener(type, event => {
      if (!dialog.hidden && (dialog.contains(event.target) || type === 'wheel')) event.stopImmediatePropagation();
    }, { capture: true, passive: type === 'wheel' || type === 'touchstart' || type === 'touchmove' });
  });
  return { open, close, dialog };
}

const recruiterDialog = bindFeatureDialog('recruiterMode', 'openRecruiterMode');
const constellationDialog = bindFeatureDialog('technologyConstellation', 'openTechConstellation');

const recruiterCaseStudyButton = document.getElementById('recruiterCaseStudyBtn');
recruiterCaseStudyButton?.addEventListener('click', () => {
  recruiterDialog?.close();
  document.getElementById('openBonusCaseStudy')?.click();
});

const constellationNodes = [...document.querySelectorAll('.constellation-node')];
const techDetailFields = {
  category: document.getElementById('techDetailCategory'),
  name: document.getElementById('techDetailName'),
  summary: document.getElementById('techDetailSummary'),
  context: document.getElementById('techDetailContext'),
  connections: document.getElementById('techDetailConnections')
};
const constellationCaseStudyButton = document.getElementById('constellationCaseStudyBtn');
const bonusCaseStudyOpener = document.getElementById('openBonusCaseStudy');
const bonusCaseStudyDialog = document.getElementById('bonusCaseStudy');
const bonusCaseStudyCloser = document.getElementById('closeBonusCaseStudy');

function selectConstellationNode(node) {
  if (!node) return;
  constellationNodes.forEach(item => {
    const selected = item === node;
    item.classList.toggle('is-selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  if (techDetailFields.category) techDetailFields.category.textContent = node.dataset.category || 'TECHNOLOGY';
  if (techDetailFields.name) techDetailFields.name.textContent = node.dataset.name || node.textContent.trim();
  if (techDetailFields.summary) techDetailFields.summary.textContent = node.dataset.summary || '';
  if (techDetailFields.context) techDetailFields.context.textContent = node.dataset.context || 'Engineering toolkit';
  if (techDetailFields.connections) techDetailFields.connections.textContent = node.dataset.connections || 'Related backend technologies';
  if (constellationCaseStudyButton) {
    const bonusRelated = /Bonus Promotions/i.test(node.dataset.context || '');
    constellationCaseStudyButton.hidden = !bonusRelated;
  }
}

constellationNodes.forEach(node => node.addEventListener('click', () => selectConstellationNode(node)));
selectConstellationNode(constellationNodes.find(node => node.classList.contains('is-selected')) || constellationNodes[0]);

constellationCaseStudyButton?.addEventListener('click', () => {
  constellationDialog?.close();
  bonusCaseStudyOpener?.click();
});

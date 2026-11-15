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

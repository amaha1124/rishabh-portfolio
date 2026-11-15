/* Tiny first-paint bootstrap. The heavy 3D scene is imported only after HTML paints. */
(() => {
  const fallbackNotice = document.getElementById('bootNotice');
  let fallbackTimer = 0;

  window.portfolioSceneReady = () => {
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    if (fallbackNotice) fallbackNotice.hidden = true;
  };

  window.portfolioBootError = (message) => {
    if (document.body.classList.contains('scene-ready')) return;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    document.documentElement.classList.add('no-webgl');
    document.body.classList.add('no-webgl');
    if (fallbackNotice) {
      fallbackNotice.textContent = message || '3D mode is unavailable. Showing the fast, readable portfolio instead.';
      fallbackNotice.hidden = false;
    }
  };

  // Do not keep the visitor behind a loader. The HTML/CSS hero is visible immediately.
  // If 3D has not initialized after this safety window, switch to the readable layout.
  fallbackTimer = window.setTimeout(() => {
    if (!document.body.classList.contains('scene-ready') && !document.body.classList.contains('no-webgl')) {
      window.portfolioBootError('The 3D scene is taking longer than expected. You can browse the portfolio in this lightweight layout.');
    }
  }, 6500);

  const startAfterFirstPaint = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (document.body.classList.contains('no-webgl')) return;
      import('./main.js').catch(() => {
        window.portfolioBootError('The 3D experience could not start. The full portfolio is available in a lightweight layout.');
      });
    }));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAfterFirstPaint, { once: true });
  } else {
    startAfterFirstPaint();
  }
})();

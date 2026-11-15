/* Fast, resilient bootstrap. Phones start in lightweight mode; 3D is opt-in. */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const fallbackNotice = document.getElementById('bootNotice');
  const enable3DButton = document.getElementById('enable3dBtn');
  const mobileLiteQuery = window.matchMedia('(max-width: 760px), (pointer: coarse) and (max-width: 900px)');
  let fallbackTimer = 0;
  let threeDRequested = false;

  const setLightweightMode = (message = '') => {
    root.classList.add('no-webgl', 'mobile-lite');
    body.classList.add('no-webgl');
    if (fallbackNotice && message) {
      fallbackNotice.textContent = message;
      fallbackNotice.hidden = false;
    }
    if (enable3DButton) {
      enable3DButton.disabled = false;
      enable3DButton.textContent = 'LAUNCH 3D FLIGHT ↗';
    }
  };

  window.portfolioSceneReady = () => {
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    fallbackTimer = 0;
    if (fallbackNotice) fallbackNotice.hidden = true;
    if (enable3DButton) enable3DButton.disabled = false;
  };

  window.portfolioBootError = (message) => {
    if (document.body.classList.contains('scene-ready')) return;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    fallbackTimer = 0;
    setLightweightMode(message || '3D mode is unavailable. The lightweight portfolio is ready to browse.');
  };

  const loadLightweightFeatures = () => Promise.all([
    import('./site-ui.js'),
    import('./case-study.js')
  ]).catch(error => {
    console.error('A lightweight portfolio feature could not initialize:', error);
  });

  const start3D = async () => {
    if (threeDRequested) return;
    threeDRequested = true;
    if (enable3DButton) {
      enable3DButton.disabled = true;
      enable3DButton.textContent = 'STARTING 3D FLIGHT…';
    }
    root.classList.remove('no-webgl', 'mobile-lite');
    body.classList.remove('no-webgl');
    if (fallbackNotice) {
      fallbackNotice.textContent = 'Starting the 3D scene. The readable portfolio remains available if graphics are unsupported.';
      fallbackNotice.hidden = false;
    }
    fallbackTimer = window.setTimeout(() => {
      window.portfolioBootError('3D is taking too long on this device. The lightweight portfolio is available below.');
      threeDRequested = false;
    }, 9000);
    try {
      await import('./main.js');
      if (!document.body.classList.contains('scene-ready')) {
        // app.js calls portfolioSceneReady on its first successful frame.
        // If the module resolves without a frame, return to the lightweight view.
        window.setTimeout(() => {
          if (!document.body.classList.contains('scene-ready')) {
            window.portfolioBootError('3D could not render on this device. The lightweight portfolio is ready.');
            threeDRequested = false;
          }
        }, 1000);
      }
    } catch (error) {
      console.error('3D experience failed to start:', error);
      window.portfolioBootError('3D mode is unavailable on this device. You can continue in the lightweight portfolio.');
      threeDRequested = false;
    }
  };

  enable3DButton?.addEventListener('click', start3D);

  if (mobileLiteQuery.matches) {
    // Do not request the Three.js bundle or initialize WebGL for the first mobile visit.
    setLightweightMode();
    loadLightweightFeatures();
    return;
  }

  window.portfolioSceneReady = () => {
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    fallbackTimer = 0;
    if (fallbackNotice) fallbackNotice.hidden = true;
  };

  fallbackTimer = window.setTimeout(() => {
    if (!document.body.classList.contains('scene-ready')) {
      window.portfolioBootError('The 3D scene is taking longer than expected. The lightweight portfolio is ready to browse.');
    }
  }, 7000);

  const startAfterFirstPaint = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      import('./main.js').catch(error => {
        console.error('3D experience failed to start:', error);
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

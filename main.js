// Shared non-WebGL interactions are small and available in both modes.
import './site-ui.js';
import './case-study.js';

// This module is only requested on desktop or after the visitor explicitly launches 3D on mobile.
if (!document.body.classList.contains('no-webgl')) {
  await import('./app.js');
}

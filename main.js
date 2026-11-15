// Load the lightweight case-study behaviour first. Start the heavy 3D engine separately.
import './case-study.js';

if (!document.body.classList.contains('no-webgl')) {
  import('./app.js').catch(() => {
    window.portfolioBootError?.('The 3D renderer could not start. The lightweight portfolio remains available.');
  });
}

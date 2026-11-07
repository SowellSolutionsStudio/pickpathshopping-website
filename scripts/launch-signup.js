(function () {
  "use strict";
  const form = document.querySelector("[data-pickpath-signup]");
  if (!form) return;
  const site = form.querySelector('[name="siteOrigin"]');
  if (site) site.value = window.location.origin;

  // The form performs a normal navigation POST to Google Apps Script.
  // We do NOT claim success until the receiver confirms the submission.
  // In particular, cross-origin fetch to Apps Script often produces
  // opaque/CORS-limited results, so it is intentionally not used.
  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) return;
    const button = form.querySelector('[type="submit"]');
    if (!button) return;
    button.disabled = true;
    button.textContent = "Taking you to confirmation…";
    window.addEventListener("pageshow", () => {
      button.disabled = false;
      button.innerHTML = 'Notify me at launch <span aria-hidden="true">↗</span>';
    }, { once: true });
  });
})();
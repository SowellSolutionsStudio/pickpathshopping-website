(function () {
  "use strict";
  const copyButton = document.querySelector("[data-contact-copy-email]");
  const status = document.getElementById("contact-copy-feedback");
  if (!copyButton) return;

  const address = "info@pickpathshopping.com";

  copyButton.addEventListener("click", async () => {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
        copied = true;
      } else {
        // Compatibility fallback for browsers without the async Clipboard API.
        const field = document.createElement("textarea");
        field.value = address;
        field.setAttribute("readonly", "");
        field.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
        document.body.appendChild(field);
        field.select();
        copied = document.execCommand("copy");
        field.remove();
      }
    } catch (error) {
      copied = false;
    }
    if (status) status.textContent = copied
      ? "Email address copied!"
      : "Unable to copy automatically. Select the address above to copy it.";
    copyButton.setAttribute("aria-label", copied ? "Email address copied" : "Copy info@pickpathshopping.com to clipboard");
    copyButton.classList.toggle("is-copied", copied);
  });
})();
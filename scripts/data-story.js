(function () {
  "use strict";
  const section = document.getElementById("data-control");
  if (!section) return;

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const elements = Array.from(section.querySelectorAll("[data-data-reveal]"));
  if (!("IntersectionObserver" in window) || motionPreference.matches) return;

  section.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("data-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: "0px 0px -5% 0px" });
  elements.forEach((element) => revealObserver.observe(element));

  motionPreference.addEventListener?.("change", (event) => {
    if (event.matches) {
      section.classList.remove("reveal-ready");
      elements.forEach((element) => element.classList.add("data-visible"));
      revealObserver.disconnect();
    }
  });
})();
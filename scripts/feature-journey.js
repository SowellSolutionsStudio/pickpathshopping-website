(function () {
  "use strict";
  const section = document.getElementById("features");
  if (!section) return;
  const stage = section.querySelector(".journey-stage");
  const progressPath = section.querySelector(".journey-path-progress");
  const revealElements = Array.from(section.querySelectorAll("[data-journey-reveal]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!("IntersectionObserver" in window) || reduceMotion.matches) return;

  document.documentElement.classList.add("journey-ready");
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("journey-visible");
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  revealElements.forEach((element) => observer.observe(element));

  if (!stage || !progressPath || !progressPath.getTotalLength) return;
  const length = progressPath.getTotalLength();
  progressPath.style.strokeDasharray = String(length);
  progressPath.style.strokeDashoffset = String(length);
  let scheduled = false;
  function draw() {
    scheduled = false;
    if (reduceMotion.matches) {
      progressPath.style.strokeDashoffset = "0";
      return;
    }
    const rect = stage.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const denominator = Math.max(1, rect.height + viewportHeight * .25);
    const ratio = Math.max(0, Math.min(1, (viewportHeight * .8 - rect.top) / denominator));
    progressPath.style.strokeDashoffset = String(length * (1 - ratio));
  }
  function scheduleDraw() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(draw);
  }
  window.addEventListener("scroll", scheduleDraw, { passive: true });
  window.addEventListener("resize", scheduleDraw, { passive: true });
  reduceMotion.addEventListener?.("change", scheduleDraw);
  scheduleDraw();
})();
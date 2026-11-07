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

  // Keep the decorative route away from every text column at any viewport width.
  // Copy bounds are converted into SVG coordinates so the mask follows responsive
  // reflow instead of relying on hard-coded screen positions.
  const routeSvg = section.querySelector(".journey-path");
  const cutoutGroup = section.querySelector(".journey-copy-clearance");
  const copyBlocks = Array.from(stage?.querySelectorAll(".journey-words") || []);
  const svgNS = "http://www.w3.org/2000/svg";
  const cutouts = copyBlocks.map(() => {
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("fill", "black");
    cutoutGroup?.appendChild(rect);
    return rect;
  });
  function protectCopy() {
    if (!routeSvg || !cutoutGroup) return;
    const svgBox = routeSvg.getBoundingClientRect();
    if (!svgBox.width || !svgBox.height) return;
    const margin = 24;
    const scaleX = 1200 / svgBox.width;
    const scaleY = 1200 / svgBox.height;
    copyBlocks.forEach((block, index) => {
      const box = block.getBoundingClientRect();
      const rect = cutouts[index];
      rect.setAttribute("x", ((box.left - margin - svgBox.left) * scaleX).toFixed(1));
      rect.setAttribute("y", ((box.top - margin - svgBox.top) * scaleY).toFixed(1));
      rect.setAttribute("width", ((box.width + margin * 2) * scaleX).toFixed(1));
      rect.setAttribute("height", ((box.height + margin * 2) * scaleY).toFixed(1));
      rect.setAttribute("rx", (26 * Math.min(scaleX, scaleY)).toFixed(1));
    });
  }
  protectCopy();
  window.addEventListener("resize", protectCopy, { passive: true });

  if (!stage || !progressPath || !progressPath.getTotalLength) return;
  const length = progressPath.getTotalLength();
  progressPath.style.strokeDasharray = String(length);
  progressPath.style.strokeDashoffset = String(length);
  let scheduled = false;
  function draw() {
    scheduled = false;
    protectCopy();
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
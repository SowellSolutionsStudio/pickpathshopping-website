(function () {
  "use strict";
  const root = document.querySelector(".app-showcase");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll("[data-showcase-slide]"));
  const indicators = Array.from(root.querySelectorAll("[data-showcase-go]"));
  const count = root.querySelector("[data-showcase-count]");
  const name = root.querySelector("[data-showcase-name]");
  const description = root.querySelector("[data-showcase-description]");
  const previous = root.querySelector("[data-showcase-prev]");
  const next = root.querySelector("[data-showcase-next]");
  const labels = [
    ["Your stores", "Every shopping destination, organized in one place."],
    ["Your PickPath", "See your active trip, progress, and item placements."],
    ["Grocery catalog", "Browse and choose groceries by category."],
    ["Your groceries", "Keep track of what you need and what can wait."]
  ];
  let current = 0;
  let ticker = null;
  let isVisible = false;
  let isPaused = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const distance = (i - current + slides.length) % slides.length;
      const position = distance === 0 ? "active" : distance === 1 ? "next" : distance === slides.length - 1 ? "prev" : "hidden";
      slide.dataset.position = position;
      slide.classList.toggle("is-active", position === "active");
      slide.setAttribute("aria-hidden", position === "active" ? "false" : "true");
      slide.inert = position !== "active";
    });
    indicators.forEach((indicator, i) => {
      const active = i === current;
      indicator.classList.toggle("is-active", active);
      indicator.setAttribute("aria-pressed", String(active));
    });
    if (count) count.textContent = String(current + 1).padStart(2,"0") + " / " + String(slides.length).padStart(2,"0");
    if (name) name.textContent = labels[current][0];
    if (description) description.textContent = labels[current][1];
  }

  function stop() { if (ticker !== null) { clearInterval(ticker); ticker = null; } }
  function start() {
    stop();
    if (!isVisible || isPaused || reducedMotion.matches || document.hidden) return;
    ticker = setInterval(() => show(current + 1), 5800);
  }
  function goTo(index) { show(index); start(); }
  previous?.addEventListener("click", () => goTo(current - 1));
  next?.addEventListener("click", () => goTo(current + 1));
  indicators.forEach((indicator,i) => indicator.addEventListener("click", () => goTo(i)));

  root.addEventListener("mouseenter", () => { isPaused = true; stop(); });
  root.addEventListener("mouseleave", () => { isPaused = false; start(); });
  root.addEventListener("focusin", () => { isPaused = true; stop(); });
  root.addEventListener("focusout", (event) => {
    if (root.contains(event.relatedTarget)) return;
    isPaused = false;
    start();
  });
  document.addEventListener("visibilitychange", start);
  reducedMotion.addEventListener?.("change", start);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting || false;
      start();
    }, { threshold: .18 });
    observer.observe(root);
  } else {
    isVisible = true;
  }

  show(0);
  start();
})();
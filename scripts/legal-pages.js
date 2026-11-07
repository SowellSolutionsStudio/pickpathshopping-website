(function () {
  "use strict";
  const sections = Array.from(document.querySelectorAll(".legal-entry"));
  const links = Array.from(document.querySelectorAll(".legal-toc-link"));
  const progress = document.querySelector("[data-legal-progress]");
  if (!sections.length) return;

  // Pure navigation enhancement: anchor links and all policy text work without JS.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((link) => {
          const current = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-current", current);
          if (current) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    }, {rootMargin:"-8% 0px -75% 0px", threshold:0});
    sections.forEach((section) => observer.observe(section));
  }

  if (progress) {
    let busy = false;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100,Math.max(0,window.scrollY / max * 100)) : 100) + "%";
      busy = false;
    }
    function schedule() {
      if (!busy) {
        busy = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", schedule, {passive:true});
    window.addEventListener("resize", schedule, {passive:true});
    schedule();
  }
})();
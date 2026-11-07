(function () {
  "use strict";
  const search = document.getElementById("help-search");
  const questions = Array.from(document.querySelectorAll("[data-help-question]"));
  const filters = Array.from(document.querySelectorAll("[data-help-filter]"));
  const count = document.getElementById("help-results");
  const empty = document.getElementById("help-no-results");
  const reset = document.querySelector("[data-help-reset]");
  if (!search || !questions.length) return;

  let category = "all";

  function update() {
    const query = search.value.toLocaleLowerCase().trim();
    let total = 0;
    for (const item of questions) {
      const inCategory = category === "all" || item.dataset.helpCategory === category;
      const matches = !query || item.textContent.toLocaleLowerCase().includes(query);
      const show = inCategory && matches;
      item.hidden = !show;
      if (!show) item.open = false;
      if (show) total += 1;
    }
    if (count) count.textContent = total === questions.length && category === "all" && !query
      ? "Showing all " + total + " questions"
      : "Showing " + total + " " + (total === 1 ? "answer" : "answers");
    if (empty) empty.hidden = total > 0;
  }
  filters.forEach((button) => {
    button.addEventListener("click", () => {
      category = button.dataset.helpFilter || "all";
      filters.forEach((other) => {
        const active = other === button;
        other.classList.toggle("is-selected", active);
        other.setAttribute("aria-pressed", String(active));
      });
      update();
    });
  });
  search.addEventListener("input", update);
  reset?.addEventListener("click", () => {
    search.value = "";
    const all = filters.find((filter) => filter.dataset.helpFilter === "all");
    if (all) all.click();
    search.focus();
  });
  update();
})();
const BLOG_INDEX = {
  en: [
    { slug: "article-1", category: "SEO", title: "How to Structure an AI-Aware SEO Program" },
    { slug: "article-2", category: "Paid Media", title: "Building Google Ads Funnels That Protect Margin" },
    { slug: "article-3", category: "Automation", title: "Marketing Automation Blueprints for B2B Teams" },
    { slug: "article-4", category: "Strategy", title: "From Traffic to Revenue: Measurement Architecture" }
  ],
  fr: [
    { slug: "article-1", category: "SEO", title: "Structurer un programme SEO adapt\u00e9 \u00e0 l'IA" },
    { slug: "article-2", category: "M\u00e9dias payants", title: "Construire des funnels Google Ads rentables" },
    { slug: "article-3", category: "Automatisation", title: "Plans d'automatisation marketing B2B" },
    { slug: "article-4", category: "Strat\u00e9gie", title: "Du trafic au revenu: architecture de mesure" }
  ],
  es: [
    { slug: "article-1", category: "SEO", title: "C\u00f3mo estructurar un programa SEO orientado a IA" },
    { slug: "article-2", category: "Medios pagados", title: "Embudos de Google Ads que protegen el margen" },
    { slug: "article-3", category: "Automatizaci\u00f3n", title: "Planes de automatizaci\u00f3n para equipos B2B" },
    { slug: "article-4", category: "Estrategia", title: "Del tr\u00e1fico al ingreso: arquitectura de medici\u00f3n" }
  ]
};

window.BLOG_INDEX = BLOG_INDEX;

(() => {
  const searchInput = document.querySelector("[data-blog-search]");
  const chipButtons = [...document.querySelectorAll("[data-blog-chip]")];
  const cards = [...document.querySelectorAll("[data-blog-card]")];
  const emptyState = document.querySelector("[data-blog-empty]");

  if (cards.length === 0) return;

  let activeCategory = "all";
  let query = "";

  const normalize = (value) => String(value || "").toLowerCase().trim();

  const filterCards = () => {
    let visibleCount = 0;

    cards.forEach((card) => {
      const category = normalize(card.getAttribute("data-category"));
      const textBlob = normalize(card.getAttribute("data-search"));

      const categoryMatch = activeCategory === "all" || category === activeCategory;
      const queryMatch = !query || textBlob.includes(query);

      const visible = categoryMatch && queryMatch;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (emptyState) {
      emptyState.hidden = visibleCount > 0;
    }
  };

  chipButtons.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = normalize(chip.getAttribute("data-blog-chip")) || "all";
      chipButtons.forEach((node) => node.classList.remove("is-active"));
      chip.classList.add("is-active");
      filterCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      query = normalize(searchInput.value);
      filterCards();
    });
  }

  filterCards();
})();

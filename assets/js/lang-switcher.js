const ROUTE_MAP = {
  home: {
    en: "/en/index.html",
    fr: "/fr/index.html",
    es: "/es/index.html"
  },
  services: {
    en: "/en/services.html",
    fr: "/fr/services.html",
    es: "/es/services.html"
  },
  consultation: {
    en: "/en/consultation.html",
    fr: "/fr/consultation.html",
    es: "/es/consultation.html"
  },
  blog: {
    en: "/en/blog.html",
    fr: "/fr/blog.html",
    es: "/es/blog.html"
  },
  contact: {
    en: "/en/contact.html",
    fr: "/fr/contact.html",
    es: "/es/contact.html"
  },
  "article-1": {
    en: "/en/blog/article-1.html",
    fr: "/fr/blog/article-1.html",
    es: "/es/blog/article-1.html"
  },
  "article-2": {
    en: "/en/blog/article-2.html",
    fr: "/fr/blog/article-2.html",
    es: "/es/blog/article-2.html"
  },
  "article-3": {
    en: "/en/blog/article-3.html",
    fr: "/fr/blog/article-3.html",
    es: "/es/blog/article-3.html"
  },
  "article-4": {
    en: "/en/blog/article-4.html",
    fr: "/fr/blog/article-4.html",
    es: "/es/blog/article-4.html"
  }
};

const I18N_UI = {
  en: {
    consultationCta: "Request Consultation",
    footerLegal: "Privacy Policy"
  },
  fr: {
    consultationCta: "Demander une consultation",
    footerLegal: "Politique de confidentialit\u00e9"
  },
  es: {
    consultationCta: "Solicitar consultoría",
    footerLegal: "Pol\u00edtica de privacidad"
  }
};

window.ROUTE_MAP = ROUTE_MAP;
window.I18N_UI = I18N_UI;

(() => {
  const body = document.body;
  const route = body.dataset.route;
  const lang = body.dataset.lang;
  if (!route || !lang || !ROUTE_MAP[route]) return;

  const routeMap = ROUTE_MAP[route];

  document.querySelectorAll("[data-lang-link]").forEach((el) => {
    const targetLang = el.getAttribute("data-lang-link");
    if (!targetLang || !routeMap[targetLang]) return;
    el.setAttribute("href", routeMap[targetLang]);

    if (targetLang === lang) {
      el.setAttribute("aria-current", "true");
      el.classList.add("is-current-lang");
    } else {
      el.removeAttribute("aria-current");
      el.classList.remove("is-current-lang");
    }
  });

  document.querySelectorAll("[data-route-link]").forEach((el) => {
    const targetRoute = el.getAttribute("data-route-link");
    if (!targetRoute || !ROUTE_MAP[targetRoute]) return;
    const path = ROUTE_MAP[targetRoute][lang];
    if (path) {
      el.setAttribute("href", path);
    }
  });
})();


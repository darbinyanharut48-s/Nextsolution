(() => {
  const body = document.body;
  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");
  const progress = document.querySelector("[data-progress-indicator]");

  const setYear = () => {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  };

  const closeMenu = () => {
    body.classList.remove("menu-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  };

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    mobilePanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!body.classList.contains("menu-open")) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-mobile-panel]") || target.closest("[data-menu-toggle]")) return;
      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (header) {
      header.classList.toggle("is-scrolled", scrollTop > 12);
    }

    if (progress) {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = height > 0 ? Math.min(1, scrollTop / height) : 0;
      progress.style.width = `${ratio * 100}%`;
    }
  };

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  document.querySelectorAll("[data-stagger]").forEach((parent) => {
    [...parent.children].forEach((child, index) => {
      child.style.setProperty("--index", String(index));
    });
  });

  const revealNodes = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && revealNodes.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px"
      }
    );
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  const metricNodes = [...document.querySelectorAll(".metric-number[data-count]")];
  const runCounter = (node) => {
    const target = Number(node.getAttribute("data-count") || "0");
    const prefix = node.getAttribute("data-prefix") || "";
    const suffix = node.getAttribute("data-suffix") || "";
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progressRatio = Math.min(1, (now - start) / duration);
      const value = Math.round(target * (1 - Math.pow(1 - progressRatio, 3)));
      node.textContent = `${prefix}${value}${suffix}`;
      if (progressRatio < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  if (metricNodes.length > 0) {
    if ("IntersectionObserver" in window) {
      const seen = new WeakSet();
      const metricObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target)) return;
          seen.add(entry.target);
          runCounter(entry.target);
          metricObserver.unobserve(entry.target);
        });
      }, { threshold: 0.5 });

      metricNodes.forEach((node) => metricObserver.observe(node));
    } else {
      metricNodes.forEach((node) => runCounter(node));
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  setYear();
})();

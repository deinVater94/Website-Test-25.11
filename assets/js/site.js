(() => {
  const config = window.JK_MEDIA_CONFIG || {};
  const menuIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>';
  const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  const brand = '<a class="brand" href="index.html" aria-label="J&K Media – Startseite"><span aria-hidden="true">J<span class="brand-sign">&amp;</span>K</span><span class="brand-tail" aria-hidden="true">Media</span></a>';
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");

  if (document.querySelector("base")) {
    const skipLink = document.querySelector(".skip-link");
    const currentUrl = new URL(location.href);
    currentUrl.hash = "inhalt";
    if (skipLink) skipLink.href = currentUrl.href;
  }

  if (header) {
    header.innerHTML = `
      <div class="container header-inner">
        ${brand}
        <nav class="site-nav" id="hauptnavigation" aria-label="Hauptnavigation">
          <a href="leistungen.html">Leistungen</a>
          <a href="studio.html">Studio</a>
          <a href="kontakt.html">Kontakt</a>
          <a class="mobile-booking" href="kontakt.html?anliegen=termin">Erstgespräch</a>
        </nav>
        <a class="button button-primary header-cta" href="kontakt.html?anliegen=termin">Erstgespräch <span class="arrow" aria-hidden="true">↗</span></a>
        <button class="icon-button menu-toggle" type="button" aria-controls="hauptnavigation" aria-expanded="false" aria-label="Menü öffnen">${menuIcon}</button>
      </div>`;

    const currentPage = location.pathname.split("/").pop();
    const navigation = header.querySelector(".site-nav");
    const menuButton = header.querySelector(".menu-toggle");
    for (const link of navigation.querySelectorAll("a")) {
      if (link.getAttribute("href") === currentPage) link.setAttribute("aria-current", "page");
    }

    function setMenu(open) {
      navigation.classList.toggle("is-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      menuButton.innerHTML = open ? closeIcon : menuIcon;
    }

    menuButton.addEventListener("click", () => {
      const open = !navigation.classList.contains("is-open");
      setMenu(open);
      if (open) navigation.querySelector("a").focus({ preventScroll: true });
    });
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("pointerdown", (event) => {
      if (navigation.classList.contains("is-open") && !header.contains(event.target)) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        setMenu(false);
        menuButton.focus();
      }
    });
    window.matchMedia("(max-width: 720px)").addEventListener("change", () => setMenu(false));
  }

  if (footer) {
    footer.innerHTML = `
      <div class="container footer-main">
        <div>
          ${brand}
          <p>Filmproduktion und Fotografie für Politik und Gesellschaft.</p>
        </div>
        <div>
          <h2>Leistungen</h2>
          <ul>
            <li><a href="leistungen.html#film">Filmproduktion</a></li>
            <li><a href="leistungen.html#fotografie">Fotografie</a></li>
            <li><a href="leistungen.html#postproduktion">Postproduktion</a></li>
            <li><a href="leistungen.html#digital">Digitale Formate</a></li>
          </ul>
        </div>
        <div>
          <h2>Kontakt</h2>
          <ul data-footer-channels>
            <li><a href="kontakt.html">Projekt anfragen</a></li>
            <li><a href="kontakt.html?anliegen=termin">Erstgespräch</a></li>
            <li><a href="studio.html#fragen">Häufige Fragen</a></li>
          </ul>
        </div>
      </div>
      <div class="container footer-meta">
        <p>© ${new Date().getFullYear()} J&amp;K Media</p>
        <a href="impressum.html">Impressum</a>
        <a href="datenschutz.html">Datenschutz</a>
      </div>`;

    const channels = footer.querySelector("[data-footer-channels]");
    const email = typeof config.contactEmail === "string" ? config.contactEmail.trim() : "";
    const phone = typeof config.phone === "string" ? config.phone.trim() : "";

    function addLink(label, href) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.textContent = label;
      link.href = href;
      item.appendChild(link);
      channels.appendChild(item);
    }

    function addWebLink(label, target) {
      if (!label || typeof target !== "string" || !target.trim()) return;
      try {
        const url = new URL(target);
        if (url.protocol === "https:") addLink(label, url.href);
      } catch {
        // Omit unconfigured or invalid destinations.
      }
    }

    if (/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)) addLink("E-Mail schreiben", "mailto:" + email);
    if (/^\+?[\d .()-]+$/.test(phone) && /\d/.test(phone)) addLink("Anrufen", "tel:" + phone.replace(/[^\d+]/g, ""));
    addWebLink("WhatsApp", config.whatsappUrl);
    if (Array.isArray(config.socialLinks)) {
      for (const link of config.socialLinks) {
        if (typeof link?.label === "string") addWebLink(link.label.trim(), link.url);
      }
    }
  }

  if ("IntersectionObserver" in window && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove("is-pending");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -24px" });

    for (const element of document.querySelectorAll(".reveal")) {
      if (element.getBoundingClientRect().top <= window.innerHeight) continue;
      element.classList.add("is-pending");
      observer.observe(element);
      element.addEventListener("focusin", () => element.classList.remove("is-pending"), { once: true });
    }
  }
})();

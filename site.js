(function () {
  const headers = document.querySelectorAll(".site-header");
  const mobileNavs = [];

  headers.forEach((header) => {
    const nav = header.querySelector(".nav");
    if (!nav || header.querySelector("[data-mobile-nav]")) return;

    const mobileNav = document.createElement("details");
    mobileNav.className = "mobile-nav";
    mobileNav.setAttribute("data-mobile-nav", "");

    const summary = document.createElement("summary");
    summary.textContent = "Menu";
    summary.setAttribute("aria-label", "Open navigation menu");

    const panel = document.createElement("div");
    panel.className = "mobile-nav-panel";
    panel.setAttribute("aria-label", "Mobile navigation");

    nav.querySelectorAll("a").forEach((link) => {
      const mobileLink = link.cloneNode(true);
      mobileLink.addEventListener("click", () => {
        mobileNav.removeAttribute("open");
      });
      panel.append(mobileLink);
    });

    mobileNav.append(summary, panel);
    nav.insertAdjacentElement("afterend", mobileNav);
    mobileNavs.push(mobileNav);
  });

  document.addEventListener("click", (event) => {
    mobileNavs.forEach((mobileNav) => {
      if (!mobileNav.contains(event.target)) {
        mobileNav.removeAttribute("open");
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    mobileNavs.forEach((mobileNav) => mobileNav.removeAttribute("open"));
  });
})();

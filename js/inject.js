document.addEventListener("DOMContentLoaded", function () {
  const componentPaths = {
    sidebar: "../components/sidebar.html",
    navbar: "../components/navbar.html",
    hero: "../components/hero.html",
    footer: "../components/footer.html",
  };

  async function fetchComponent(componentName) {
    try {
      const response = await fetch(componentPaths[componentName]);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentName}`);
      }
      return await response.text();
    } catch (error) {
      console.error(error);
      return `<div class="p-4 bg-red-100 text-red-700">Error loading ${componentName} component</div>`;
    }
  }

  async function injectComponents() {
    const placeholders = document.querySelectorAll("[data-component]");

    for (const placeholder of placeholders) {
      const componentName = placeholder.getAttribute("data-component");
      if (componentPaths[componentName]) {
        const html = await fetchComponent(componentName);
        placeholder.innerHTML = html;
      }
    }

    setupSidebar();
    setupHero();
  }

  function setupHero() {
    const heroContainer = document.querySelector('[data-component="hero"]');
    if (!heroContainer) return;

    const hideHero = document.body.hasAttribute("data-no-hero");
    if (hideHero) {
      heroContainer.style.display = "none";
    }
  }

  function setupSidebar() {
    const sidebar = document.getElementById("sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarOverlay = document.getElementById("sidebar-overlay");

    if (!sidebar || !sidebarToggle || !sidebarOverlay) return;

    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.remove("-translate-x-full");
      sidebarOverlay.classList.remove("hidden");
      setTimeout(() => sidebarOverlay.classList.add("opacity-0"), 10);
    });

    function closeSidebar() {
      sidebar.classList.add("-translate-x-full");
      sidebarOverlay.classList.add("hidden");
      sidebarOverlay.classList.remove("opacity-0");
    }

    sidebarOverlay.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });
  }

  injectComponents();
});

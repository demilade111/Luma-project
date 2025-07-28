window.addEventListener("components-injected", () => {
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const dropdownMenu = document.getElementById("dropdown-menu");
  const closeMenu = document.getElementById("close-menu");

  if (!hamburgerMenu || !dropdownMenu || !closeMenu) {
    console.warn("Missing mobile menu elements");
    return;
  }

  hamburgerMenu.addEventListener("click", () => {
    dropdownMenu.classList.remove("hidden");
  });

  closeMenu.addEventListener("click", () => {
    dropdownMenu.classList.add("hidden");
  });
});

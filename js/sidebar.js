document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.querySelector("#sidebar-button");
  const drawer = document.getElementById("leftDrawer");
  const closeBtn = document.getElementById("closeDrawerBtn");

  openBtn.addEventListener("click", () => {
    alert("Sidebar button clicked!");
    drawer.classList.toggle("-translate-x-full");
  });

  closeBtn.addEventListener("click", () => {
    drawer.classList.add("-translate-x-full");
  });
});

console.log("Sidebar script loaded");

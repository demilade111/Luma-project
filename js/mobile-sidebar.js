window.addEventListener('DOMContentLoaded', () => {
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const closeMenu = document.getElementById('close-menu');

  if (!hamburgerMenu || !dropdownMenu) {
    console.error('Hamburger menu or dropdown menu not found!');
    return;
  }

  console.log('Elements found, adding event listeners...');
  hamburgerMenu.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
  });

  closeMenu.addEventListener('click', () => {
    dropdownMenu.classList.add('hidden');
  });
});

export function initScrollButtons({
    containerId,
    leftBtnId,
    rightBtnId,
    scrollStep = 300,
    autoScroll = false,
    autoScrollInterval = 2000,
    initialScrollDelay = 500,
    autoScrollPauseOnHover = true,
}) {
    const scrollWrapper = document.getElementById(containerId);
    const scrollLeftBtn = document.getElementById(leftBtnId);
    const scrollRightBtn = document.getElementById(rightBtnId);

    if (!scrollWrapper || !scrollLeftBtn || !scrollRightBtn) return;

    // Manual scroll buttons
    scrollLeftBtn.addEventListener("click", () => {
        scrollWrapper.scrollBy({ left: -scrollStep, behavior: "smooth" });
    });

    scrollRightBtn.addEventListener("click", () => {
        scrollWrapper.scrollBy({ left: scrollStep, behavior: "smooth" });
    });

    // Show/hide logic
    function updateScrollButtons() {
        const maxScrollLeft = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;

        scrollLeftBtn.classList.toggle("hidden", scrollWrapper.scrollLeft <= 0);
        scrollRightBtn.classList.toggle("hidden", scrollWrapper.scrollLeft >= maxScrollLeft - 1);
    }

    scrollWrapper.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    updateScrollButtons();

    // Auto-scroll functionality
    let autoScrollIntervalId;

    function doAutoScroll() {
        const maxScrollLeft = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;
        const atEnd = scrollWrapper.scrollLeft >= maxScrollLeft - 1;

        if (atEnd) {
            scrollWrapper.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            scrollWrapper.scrollBy({ left: scrollStep, behavior: "smooth" });
        }
    }

    function startAutoScroll() {
        autoScrollIntervalId = setInterval(doAutoScroll, autoScrollInterval);
    }

    function stopAutoScroll() {
        if (autoScrollIntervalId) clearInterval(autoScrollIntervalId);
    }

    if (autoScroll) {
        // Delay the first scroll slightly
        setTimeout(() => {
            doAutoScroll(); // Initial scroll right away
            startAutoScroll(); // Then loop
        }, initialScrollDelay);

        if (autoScrollPauseOnHover) {
            scrollWrapper.addEventListener("mouseenter", stopAutoScroll);
            scrollWrapper.addEventListener("mouseleave", startAutoScroll);
        }
    }
}

function updateScrollButtonVisibility() {
    const trendingleftBtn = document.getElementById("scrollLeftTrending");
    const trendingrightBtn = document.getElementById("scrollRightTrending");

    const upcomingleftBtn = document.getElementById("scrollLeftUpcoming");
    const upcomingrightBtn = document.getElementById("scrollRightUpcoming");

    const scrollLeftGames = document.getElementById("scrollLeftGames");
    const scrollRightGames = document.getElementById("scrollRightGames");

    const scrollLeftLearn = document.getElementById("scrollLeftLearn");
    const scrollRightLearn = document.getElementById("scrollRightLearn");


    const isMobile = window.innerWidth < 768;
    if (trendingleftBtn && trendingrightBtn) {
        trendingleftBtn.style.display = isMobile ? "none" : "block";
        trendingrightBtn.style.display = isMobile ? "none" : "block";
    }

    if (upcomingleftBtn && upcomingrightBtn) {
        upcomingleftBtn.style.display = isMobile ? "none" : "block";
        upcomingrightBtn.style.display = isMobile ? "none" : "block";
    }

    if (scrollLeftGames && scrollRightGames) {
        scrollLeftGames.style.display = isMobile ? "none" : "block";
        scrollRightGames.style.display = isMobile ? "none" : "block";
    }

    if (scrollLeftLearn && scrollRightLearn) {
        scrollLeftLearn.style.display = isMobile ? "none" : "block";
        scrollRightLearn.style.display = isMobile ? "none" : "block";
    }
}

window.addEventListener("resize", updateScrollButtonVisibility);
window.addEventListener("DOMContentLoaded", updateScrollButtonVisibility);


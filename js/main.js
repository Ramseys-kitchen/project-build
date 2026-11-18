const bellBtn = document.getElementById("bell-btn");
const bellPopup = document.getElementById("bell-popup");

function closeBell() {
  bellPopup.hidden = true;
  bellBtn.setAttribute("aria-expanded", "false");
  bellBtn.classList.remove("has-popup-open");
}

function openBell() {
  bellPopup.hidden = false;
  bellBtn.setAttribute("aria-expanded", "true");
  bellBtn.classList.add("has-popup-open");

  if (typeof gsap !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.fromTo(bellPopup, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(bellBtn, { rotation: -15 }, { rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
  }
}

if (bellBtn && bellPopup) {
  bellBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    if (bellPopup.hidden) {
      openBell();
    } else {
      closeBell();
    }
  });

  // Close when clicking elsewhere or pressing Escape
  document.addEventListener("click", closeBell);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeBell();
  });
}

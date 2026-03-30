// Fade-in animation on scroll

const elements = document.querySelectorAll(".product-card, .team-card");

elements.forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(40px)";
  el.style.transition = "all 0.6s ease";
});

window.addEventListener("scroll", () => {
  elements.forEach(el => {
    const position = el.getBoundingClientRect().top;
    const screenPosition = window.innerHeight - 100;

    if (position < screenPosition) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }
  });
});

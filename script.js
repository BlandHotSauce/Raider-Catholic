const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");
const scrollButton = document.getElementById("scrollButton");
const connectSection = document.getElementById("connect");
const navLinks = document.querySelectorAll(".site-nav a");
const revealElements = document.querySelectorAll(".reveal");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (siteNav.classList.contains("open")) {
      siteNav.classList.remove("open");
    }
  });
});

if (scrollButton && connectSection) {
  scrollButton.addEventListener("click", () => {
    connectSection.scrollIntoView({
      behavior: "smooth"
    });
  });
}

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
    threshold: 0.12
  }
);

revealElements.forEach((element) => {
  observer.observe(element);
});

window.addEventListener("load", () => {
  const heroElements = document.querySelectorAll(".hero .reveal, .site-header.reveal, .hero.reveal");

  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      element.classList.add("is-visible");
    }
  });

  heroElements.forEach((element) => {
    element.classList.add("is-visible");
  });
});
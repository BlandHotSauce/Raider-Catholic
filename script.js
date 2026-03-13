const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");
const scrollButton = document.getElementById("scrollButton");
const connectSection = document.getElementById("connect");
const navLinks = document.querySelectorAll(".site-nav a");
const revealElements = document.querySelectorAll(".reveal");
const subscribeCalendarButton = document.getElementById("subscribeCalendarButton");

const eventsList = document.getElementById("eventsList");
const calendarStatus = document.getElementById("calendarStatus");

const CALENDAR_API_URL =
  "https://raider-catholic-calendar-proxy.vercel.app/api/calendar?limit=6";

const ICS_HTTPS_URL =
  "https://outlook.office365.com/owa/calendar/3f27e5fcd8c54156a67a04e6c92a556d@msoe.edu/39fd891e541a4016a9fecf8ed36628826223923538709763827/calendar.ics";

const ICS_WEBCAL_URL =
  "webcal://outlook.office365.com/owa/calendar/3f27e5fcd8c54156a67a04e6c92a556d@msoe.edu/39fd891e541a4016a9fecf8ed36628826223923538709763827/calendar.ics";

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

if (subscribeCalendarButton) {
  const isMobileDevice =
    /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches;

  subscribeCalendarButton.href = isMobileDevice ? ICS_HTTPS_URL : ICS_WEBCAL_URL;
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
  const heroElements = document.querySelectorAll(
    ".hero .reveal, .site-header.reveal, .hero.reveal"
  );

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

function formatEventDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatEventTimeRange(start, end) {
  const dateOnly =
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    (!end || (end.getHours() === 0 && end.getMinutes() === 0));

  if (dateOnly) {
    return "All day";
  }

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  if (!end || Number.isNaN(end.getTime())) {
    return timeFormatter.format(start);
  }

  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function buildEventCard(event) {
  const eventCard = document.createElement("article");
  eventCard.className = "event-card reveal is-visible";

  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;

  const descriptionHtml =
    event.description && event.description.trim().length <= 220
      ? `<p class="event-description">${event.description.replace(/\n/g, "<br>")}</p>`
      : "";

  eventCard.innerHTML = `
    <h3>${event.summary}</h3>
    <div class="event-card-meta">
      <div class="event-meta-row">
        <span class="event-meta-icon">📅</span>
        <span>${formatEventDate(start)}</span>
      </div>
      <div class="event-meta-row">
        <span class="event-meta-icon">🕒</span>
        <span>${formatEventTimeRange(start, end)}</span>
      </div>
      <div class="event-meta-row">
        <span class="event-meta-icon">📍</span>
        <span>${event.location ? event.location : "Location to be announced"}</span>
      </div>
    </div>
    ${descriptionHtml}
  `;

  return eventCard;
}

async function loadCalendarEvents() {
  if (!eventsList || !calendarStatus) {
    return;
  }

  try {
    const response = await fetch(CALENDAR_API_URL, {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error("Unable to load calendar data.");
    }

    const data = await response.json();
    const events = Array.isArray(data.events) ? data.events : [];

    eventsList.innerHTML = "";

    if (events.length === 0) {
      calendarStatus.textContent = "There are no upcoming events listed right now.";
      eventsList.innerHTML = `
        <div class="event-card calendar-empty">
          <h3>No upcoming events</h3>
          <p>Check back soon or subscribe to the Raider Catholic calendar for updates.</p>
        </div>
      `;
      return;
    }

    calendarStatus.textContent = "Here are some upcoming Raider Catholic events.";

    events.forEach((event) => {
      eventsList.appendChild(buildEventCard(event));
    });
  } catch (error) {
    calendarStatus.textContent = "We couldn't load the live calendar feed right now.";
    eventsList.innerHTML = `
      <div class="event-card calendar-empty">
        <h3>Calendar temporarily unavailable</h3>
        <p>The live Raider Catholic events feed could not be loaded right now. Please try again later.</p>
      </div>
    `;
  }
}

loadCalendarEvents();
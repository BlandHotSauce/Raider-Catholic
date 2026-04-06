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

const ICS_WEBCAL_URL =
  "webcal://outlook.office365.com/owa/calendar/3f27e5fcd8c54156a67a04e6c92a556d@msoe.edu/39fd891e541a4016a9fecf8ed36628826223923538709763827/calendar.ics";

if (menuToggle && siteNav) {
  const isMenuOpen = () => siteNav.classList.contains("open");
  const setMenuOpen = (isOpen) => {
    siteNav.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(!isMenuOpen());
  });

  document.addEventListener("click", (event) => {
    if (!isMenuOpen() || !(event.target instanceof Node)) {
      return;
    }

    if (siteNav.contains(event.target) || menuToggle.contains(event.target)) {
      return;
    }

    setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen()) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (isMenuOpen()) {
        setMenuOpen(false);
      }
    });
  });
}

if (scrollButton && connectSection) {
  scrollButton.addEventListener("click", () => {
    window.location.hash = connectSection.id;
  });
}

if (subscribeCalendarButton) {
  const isMobileDevice =
    /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches;

  if (isMobileDevice) {
    subscribeCalendarButton.hidden = true;
  } else {
    subscribeCalendarButton.href = ICS_WEBCAL_URL;
  }
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
  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      element.classList.add("is-visible");
    }
  });
});

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function formatEventDate(date) {
  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatEventTimeRange(start, end) {
  if (Number.isNaN(start.getTime())) {
    return "Time to be announced";
  }

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

function createEventMetaRow(icon, text) {
  const row = document.createElement("div");
  row.className = "event-meta-row";

  const iconElement = document.createElement("span");
  iconElement.className = "event-meta-icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = icon;

  const textElement = document.createElement("span");
  textElement.textContent = text;

  row.append(iconElement, textElement);

  return row;
}

function buildEventCard(event) {
  const eventCard = document.createElement("article");
  eventCard.className = "event-card reveal is-visible";

  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : null;
  const titleText = isNonEmptyString(event.summary)
    ? event.summary.trim()
    : "Untitled event";
  const locationText = isNonEmptyString(event.location)
    ? event.location.trim()
    : "Location to be announced";

  const title = document.createElement("h3");
  title.textContent = titleText;

  const meta = document.createElement("div");
  meta.className = "event-card-meta";
  meta.append(
    createEventMetaRow("\u{1F4C5}", formatEventDate(start)),
    createEventMetaRow("\u{1F552}", formatEventTimeRange(start, end)),
    createEventMetaRow("\u{1F4CD}", locationText)
  );

  eventCard.append(title, meta);

  if (isNonEmptyString(event.description) && event.description.trim().length <= 220) {
    const description = document.createElement("p");
    description.className = "event-description";
    description.textContent = event.description.trim();
    eventCard.append(description);
  }

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

// ================================
// MB Wedding Dashboard
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const notesCountElement = document.getElementById("notesCount");
  const guestNotesCountElement = document.getElementById("guestNotesCount");
  const quickNotesList = document.getElementById("quickNotesList");

  const categoryIcons = {
    Venue: "ri-map-pin-fill",
    Shopping: "ri-shopping-bag-fill",
    Budget: "ri-money-rupee-circle-fill",
    Guests: "ri-team-fill",
    Vendor: "ri-handshake-fill",
    Pooja: "ri-sparkling-fill",
    Other: "ri-sticky-note-fill",
  };

  function renderQuickNotes(notes) {
    if (!notes.length) {
      quickNotesList.textContent = "No notes saved yet.";
      return;
    }

    quickNotesList.innerHTML = notes
      .slice(0, 3)
      .map((note) => {
        const category = note.category || "Other";
        const icon = categoryIcons[category] || categoryIcons.Other;
        const availability =
          category === "Venue" && note.venueAvailability
            ? `<span class="quick-note-status ${note.venueAvailability === "Available" ? "is-available" : "is-unavailable"}">
                        ${note.venueAvailability}
                    </span>`
            : "";
        const members =
          category === "Guests" && note.guestCount
            ? `<span class="quick-note-status is-guests">
                        ${note.guestCount} members
                    </span>`
            : "";

        return `
                <div class="note-item">
                    <div class="note-item-heading">
                        <span class="quick-note-category category-${category.toLowerCase()}">
                            <i class="${icon}"></i>
                            ${category}
                        </span>
                        ${availability || members}
                    </div>
                    <h6>${note.title}</h6>
                    <p>${note.description}</p>
                </div>
                `;
      })
      .join("");
  }

  async function loadDashboardNotes() {
    try {
      const response = await API.get("/notes");
      const notes = response.data || [];
      const guestCount = notes
        .filter((note) => note.category === "Guests")
        .reduce((total, note) => total + (Number(note.guestCount) || 0), 0);

      notesCountElement.textContent = notes.length;
      guestNotesCountElement.textContent = guestCount;
      renderQuickNotes(notes);
    } catch (error) {
      console.error(error);
      quickNotesList.textContent = "Unable to load latest notes.";
    }
  }

  loadDashboardNotes();
  setInterval(loadDashboardNotes, 30000);

  window.addEventListener("storage", (event) => {
    if (event.key === "notes-updated") {
      loadDashboardNotes();
    }
  });

  // ==============================
  // Countdown
  // ==============================

  const countdownElement = document.getElementById("daysLeft");

  function updateCountdown() {
    if (!countdownElement) return;

    const weddingDate = new Date("2026-12-11T00:00:00").getTime();

    const now = new Date().getTime();

    const distance = weddingDate - now;

    if (distance <= 0) {
      countdownElement.textContent = "0";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));

    countdownElement.textContent = days;
  }

  updateCountdown();

  setInterval(updateCountdown, 60000);

  // ==============================
  // Dark Mode
  // ==============================

  const darkButton = document.getElementById("darkMode");

  if (localStorage.getItem("dashboard-theme") === "dark") {
    document.body.classList.add("dark");
  }

  if (darkButton) {
    darkButton.addEventListener("click", () => {
      document.body.classList.toggle("dark");

      localStorage.setItem(
        "dashboard-theme",
        document.body.classList.contains("dark") ? "dark" : "light",
      );
    });
  }

  // ==============================
  // Animated Stat Cards
  // ==============================

  document.querySelectorAll(".stat-card").forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";

    setTimeout(() => {
      card.style.transition = "0.6s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 120);
  });

  // ==============================
  // Dashboard Card Hover Effect
  // ==============================

  document.querySelectorAll(".dashboard-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-8px)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // ==============================
  // Gallery Preview
  // ==============================

  document.querySelectorAll(".gallery-preview img").forEach((img) => {
    img.addEventListener("click", () => {
      window.open(img.src, "_blank");
    });
  });

  // ==============================
  // Active Sidebar Link
  // ==============================

  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".sidebar a").forEach((link) => {
    const href = link.getAttribute("href");

    if (href === currentPage) {
      link.parentElement.classList.add("active");
    } else {
      link.parentElement.classList.remove("active");
    }
  });
});

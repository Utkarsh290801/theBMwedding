// ======================================
// MB Wedding Notes
// ======================================

// -----------------------------
// DOM Elements
// -----------------------------

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const venueAvailabilityInput = document.getElementById("venueAvailability");
const venueAvailabilityGroup = document.getElementById("venueAvailabilityGroup");
const guestCountInput = document.getElementById("guestCount");
const guestCountGroup = document.getElementById("guestCountGroup");
const guestEventGroup = document.getElementById("guestEventGroup");
const guestEventOptions = document.getElementById("guestEventOptions");
const descriptionInput = document.getElementById("description");

const saveButton = document.getElementById("saveNote");

const notesContainer = document.getElementById("notesContainer");

const searchInput = document.getElementById("search");

const filterCategory = document.getElementById("filterCategory");
const filterStatus = document.getElementById("filterStatus");
const filterGuestEvent = document.getElementById("filterGuestEvent");

const shortlistsInput = document.getElementById("shortlisted");
const shortlistGroup = document.getElementById("shortlistGroup");

const totalNotes = document.getElementById("totalNotes");
const venueCount = document.getElementById("venueCount");
const shoppingCount = document.getElementById("shoppingCount");
const budgetCount = document.getElementById("budgetCount");

const openNoteModal = document.getElementById("openNoteModal");

// -----------------------------
// Bootstrap Modal
// -----------------------------

const noteModal = new bootstrap.Modal(
    document.getElementById("noteModal")
);

// -----------------------------
// App State
// -----------------------------

let notes = [];

let editingId = null;

// ======================================
// Category Badge Colors
// ======================================
function getCategoryIcon(category){

    switch(category){

        case "Venue":
            return "📍";

        case "Shopping":
            return "🛍️";

        case "Budget":
            return "💰";

        case "Guests":
            return "👥";

        case "Vendor":
            return "🤝";

        case "Pooja":
            return "🪔";

        default:
            return "📝";

    }

}
function getBadgeClass(category) {

    switch (category.toLowerCase()) {

        case "venue":
            return "badge-venue";

        case "shopping":
            return "badge-shopping";

        case "budget":
            return "badge-budget";

        case "guests":
            return "badge-guests";

        case "vendor":
            return "badge-vendor";

        case "pooja":
            return "badge-pooja";

        default:
            return "badge-other";

    }

}

// ======================================
// Format Date
// ======================================

function formatNoteDate(date) {

    return new Date(date).toLocaleString("en-IN", {

        dateStyle: "medium",

        timeStyle: "short"

    });

}

function updateVenueAvailabilityVisibility() {

    const isVenue = categoryInput.value === "Venue";
    const isGuest = categoryInput.value === "Guests";

    venueAvailabilityGroup.hidden = !isVenue;
    shortlistGroup.hidden = !isVenue;
    guestCountGroup.hidden = !isGuest;
    guestEventGroup.hidden = !isGuest;

}

function getGuestEventValues(note = null) {
    if (note) {
        const values = Array.isArray(note.eventTypes)
            ? note.eventTypes
            : (Array.isArray(note.eventType) ? note.eventType : (note.eventType ? [note.eventType] : []));
        return values.filter(Boolean);
    }

    if (!guestEventOptions) return [];

    return Array.from(guestEventOptions.querySelectorAll("input[type='checkbox']:checked"))
        .map((checkbox) => checkbox.value)
        .filter(Boolean);
}

function setGuestEventValues(values = []) {
    if (!guestEventOptions) return;

    const selectedValues = new Set(values.filter(Boolean));

    guestEventOptions.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        checkbox.checked = selectedValues.has(checkbox.value);
    });
}

// ======================================
// Update Statistics
// ======================================

function updateStats() {

    totalNotes.textContent = notes.length;

    venueCount.textContent = notes.filter(
        n => n.category === "Venue"
    ).length;

    shoppingCount.textContent = notes.filter(
        n => n.category === "Shopping"
    ).length;

    budgetCount.textContent = notes.filter(
        n => n.category === "Budget"
    ).length;

}

// ======================================
// Load Notes
// ======================================

async function loadNotes() {

    try {

        const response = await API.get("/notes");

        notes = response.data || [];

        updateStats();

        renderNotes();

    }

    catch (error) {

        console.error(error);

        showToast("Failed to load notes", "error");

    }

}

// ======================================
// Open New Note Modal
// ======================================

openNoteModal.addEventListener("click", () => {

    openNewNote();

});
// ======================================
// Render Notes
// ======================================

function renderNotes(search = searchInput.value) {

    notesContainer.innerHTML = "";

    const selectedCategory = filterCategory.value;
        const selectedGuestEvent = filterGuestEvent.value;
    const filtered = notes.filter(note => {

        const matchesSearch =

            note.title.toLowerCase().includes(search.toLowerCase()) ||

            note.description.toLowerCase().includes(search.toLowerCase()) ||

            note.category.toLowerCase().includes(search.toLowerCase()) ||

            (note.venueAvailability || "").toLowerCase().includes(search.toLowerCase()) ||

            String(note.guestCount || "").includes(search);


        const matchesCategory =

            selectedCategory === "" ||

            note.category === selectedCategory;

        const noteGuestEvents = getGuestEventValues(note);

        const matchesGuestEvent =
            selectedCategory !== "Guests" ||
            selectedGuestEvent === "" ||
            noteGuestEvents.includes(selectedGuestEvent);

        const selectedStatus = filterStatus.value;

        const matchesStatus =
            selectedStatus === "" ||
            (selectedStatus === "Shortlisted" ? note.shortlisted === true :
                note.category === "Venue" && note.venueAvailability === selectedStatus);

        return matchesSearch && matchesCategory && matchesGuestEvent && matchesStatus;

    });

    // -------------------------
    // Empty State
    // -------------------------

    if (filtered.length === 0) {

        notesContainer.innerHTML = `

            <div class="empty-notes">

                <i class="ri-sticky-note-line"></i>

                <h3>No Wedding Notes Yet</h3>

                <p>

                    Start saving venues, shopping lists,

                    vendors and wedding memories.

                </p>

                <button
                    class="btn btn-primary mt-3"
                    onclick="openNewNote()">

                    <i class="ri-add-line"></i>

                    Create First Note

                </button>

            </div>

        `;

        return;

    }

    // -------------------------
    // Cards
    // -------------------------

    filtered.forEach(note => {

        const badge = getBadgeClass(note.category);
        const guestEvents = getGuestEventValues(note);

        const card = document.createElement("div");

        card.className = "note-card";

       card.innerHTML = `

<div class="note-top">

    <span class="note-category ${badge}">
        ${getCategoryIcon(note.category)} ${note.category}
    </span>

    ${note.category === "Venue" && note.venueAvailability ? `
        <span class="venue-status ${note.venueAvailability === "Available" ? "is-available" : "is-unavailable"}">
            <i class="ri-${note.venueAvailability === "Available" ? "checkbox-circle" : "close-circle"}-fill"></i>
            ${note.venueAvailability}
        </span>
    ` : ""}

    ${note.category === "Venue" && note.shortlisted ? `
        <span class="venue-shortlisted">
            <i class="ri-star-fill"></i>
            Shortlisted
        </span>
    ` : ""}

    ${note.category === "Guests" && note.guestCount ? `
        <span class="guest-count-badge">
            <i class="ri-group-fill"></i>
            ${note.guestCount} members
        </span>
    ` : ""}

    ${note.category === "Guests" && guestEvents.length ? `
        <div class="guest-event-row">
            ${guestEvents.map(event => `
                <span class="guest-count-badge">
                    <i class="ri-calendar-event-fill"></i>
                    ${event}
                </span>
            `).join("")}
        </div>
    ` : ""}

</div>

<h3 class="note-title">
    ${note.title}
</h3>

<div class="note-divider"></div>

<p class="note-text">
    ${note.description}
</p>

<div class="note-footer">

    <div class="note-date">

        <i class="ri-time-line"></i>

        ${formatNoteDate(note.createdAt)}

    </div>

    <div class="note-actions">

        <button
            class="edit-btn"
            onclick="editNote('${note._id}')">

            <i class="ri-pencil-line"></i>

            Edit

        </button>

        <button
            class="delete-btn"
            onclick="deleteNote('${note._id}')">

            <i class="ri-delete-bin-line"></i>

            Delete

        </button>

    </div>

</div>

`;

        notesContainer.appendChild(card);

    });

}

searchInput.addEventListener("input", () => {

    renderNotes(searchInput.value);

});

filterCategory.addEventListener("change", () => {

    renderNotes();

});

filterStatus.addEventListener("change", () => {

    renderNotes();

});

filterGuestEvent.addEventListener("change", () => {

    renderNotes();

});

categoryInput.addEventListener("change", updateVenueAvailabilityVisibility);

// ======================================
// Save / Update Note
// ======================================

saveButton.addEventListener("click", async () => {

    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const venueAvailability = category === "Venue"
        ? venueAvailabilityInput.value
        : undefined;
    const shortlisted = category === "Venue"
        ? shortlistsInput.checked
        : false;
    const guestCount = category === "Guests"
        ? Number(guestCountInput.value)
        : undefined;
    const guestEvents = category === "Guests"
        ? getGuestEventValues()
        : [];
    const description = descriptionInput.value.trim();

    if (!title || !description) {

        showToast("Please enter title and description", "error");

        return;

    }

    if (category === "Guests" && (!Number.isInteger(guestCount) || guestCount < 1)) {

        showToast("Enter a valid number of family members", "error");

        return;

    }

    if (category === "Guests" && guestEvents.length === 0) {

        showToast("Please select at least one event for this guest note", "error");

        return;

    }

    const noteData = {

        title,
        category,
        description,
        venueAvailability,
        shortlisted,
        guestCount,
        eventTypes: guestEvents

    };

    try {

        if (editingId) {

            await API.put(`/notes/${editingId}`, noteData);

            showToast("Note updated successfully");

        } else {

            await API.post("/notes", noteData);

            showToast("Note added successfully");

        }

        editingId = null;

        clearForm();

        noteModal.hide();
        localStorage.setItem("notes-updated", Date.now().toString());

        await loadNotes();

    }

    catch (error) {

        console.error(error);

        showToast("Something went wrong", "error");

    }

});

// ======================================
// Edit Note
// ======================================

function editNote(id) {

    const note = notes.find(n => n._id === id);

    if (!note) return;

    editingId = id;

    titleInput.value = note.title;
    categoryInput.value = note.category;
    venueAvailabilityInput.value = note.venueAvailability || "Available";
    shortlistsInput.checked = note.shortlisted === true;
    guestCountInput.value = note.guestCount || 1;
    setGuestEventValues(getGuestEventValues(note));
    descriptionInput.value = note.description;
    updateVenueAvailabilityVisibility();

    saveButton.innerHTML = `

        <i class="ri-edit-fill"></i>

        Update Note

    `;

    noteModal.show();

}

// ======================================
// Open New Note
// ======================================

function openNewNote() {

    editingId = null;

    clearForm();

    saveButton.innerHTML = `

        <i class="ri-save-fill"></i>

        Save Note

    `;

    noteModal.show();

}

// ======================================
// Clear Form
// ======================================

function clearForm() {

    titleInput.value = "";

    descriptionInput.value = "";

    categoryInput.selectedIndex = 0;
    venueAvailabilityInput.value = "Available";
    shortlistsInput.checked = false;
    guestCountInput.value = 1;
    setGuestEventValues([]);
    updateVenueAvailabilityVisibility();

}

// ======================================
// Delete Note
// ======================================

async function deleteNote(id) {

    const confirmed = confirm(

        "Are you sure you want to delete this note?"

    );

    if (!confirmed) return;

    try {

        await API.delete(`/notes/${id}`);

        showToast("Note deleted successfully");
        localStorage.setItem("notes-updated", Date.now().toString());

        await loadNotes();

    }

    catch (error) {

        console.error(error);

        showToast("Failed to delete note", "error");

    }

}

// ======================================
// Reset Modal on Close
// ======================================

document
    .getElementById("noteModal")
    .addEventListener("hidden.bs.modal", () => {

        editingId = null;

        clearForm();

        saveButton.innerHTML = `

            <i class="ri-save-fill"></i>

            Save Note

        `;

});

// ======================================
// Initialize
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    loadNotes();

});
// ========================================
// Common Utilities
// ========================================

// Format Date
function formatDate(date = new Date()) {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",

    timeStyle: "short",
  });
}

// Toast Notification

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `toast-message ${type}`;

  toast.innerHTML = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}

// Dark Mode

function toggleDarkMode() {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",

    document.body.classList.contains("dark") ? "dark" : "light",
  );
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
});

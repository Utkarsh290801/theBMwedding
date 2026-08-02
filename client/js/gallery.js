// =========================================
// BM Wedding - Inspiration Studio
// =========================================

// ------------------------------
// DOM Elements
// ------------------------------

const foldersContainer = document.getElementById("foldersContainer");
const galleryContainer = document.getElementById("galleryContainer");

const searchInput = document.getElementById("searchImages");
const filterFolder = document.getElementById("filterFolder");

const totalFolders = document.getElementById("totalFolders");
const totalImages = document.getElementById("totalImages");
const totalShortlisted = document.getElementById("totalShortlisted");
const storageUsed = document.getElementById("storageUsed");

const folderName = document.getElementById("folderName");
const saveFolder = document.getElementById("saveFolder");

const folderSelect = document.getElementById("folderSelect");
const imageInput = document.getElementById("imageInput");
const uploadImages = document.getElementById("uploadImages");

const previewImage = document.getElementById("previewImage");
const previewTitle = document.getElementById("previewTitle");

const emptyFolders = document.getElementById("emptyFolders");
const emptyGallery = document.getElementById("emptyGallery");

const folderModal = new bootstrap.Modal(document.getElementById("folderModal"));

const uploadModal = new bootstrap.Modal(document.getElementById("uploadModal"));

const previewModal = new bootstrap.Modal(
  document.getElementById("previewModal"),
);

// ------------------------------
// App State
// ------------------------------

let folders = [];

let images = [];

let currentFolder = null;

let currentPreview = 0;

let currentView = "gallery";
// =========================================
// Load Data
// =========================================

async function loadFolders() {
  try {
    const response = await API.get("/gallery/folders");

    folders = response.data || [];

    renderFolders();

    updateStatistics();

    populateFolderDropdown();
  } catch (error) {
    console.error(error);

    showToast("Unable to load folders", "error");
  }
}

async function loadImages(folderId = "") {
  try {
    let url = "/gallery/images";

    if (folderId) {
      url += `?folder=${folderId}`;
    }

    const response = await API.get(url);

    images = response.data || [];

    renderGallery();

    updateStatistics();

    renderFolders();
  } catch (error) {
    console.error(error);

    showToast("Unable to load images", "error");
  }
}

function getFilteredImages() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return images;
  return images.filter(image => {
    const name = (image.fileName || "").toLowerCase();
    const folder = getFolderName(image.folderId).toLowerCase();
    return name.includes(query) || folder.includes(query);
  });
}

function renderGallery(filteredImages) {
  const displayImages = Array.isArray(filteredImages) ? filteredImages : getFilteredImages();
  galleryContainer.innerHTML = "";

  if (displayImages.length === 0) {
    emptyGallery.classList.remove("d-none");
    return;
  }

  emptyGallery.classList.add("d-none");

  displayImages.forEach((image, index) => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.innerHTML = `

            <img

                src="${image.imageUrl}"

                alt="">

            <div class="image-overlay">

                <div class="image-title">

                    ${image.fileName}

                </div>

                <div class="image-folder">

                    ${getFolderName(image.folderId)}

                </div>

                <div class="image-actions">

                    <button

                        class="preview-btn"

                        onclick="previewImageModal(${index})">

                        <i class="ri-eye-line"></i>

                    </button>

                    <button

                        class="shortlist-btn"

                        onclick="toggleShortlist('${image._id}', event)">

                        <i class="ri-star-${image.shortlisted ? "fill" : "line"}"></i>

                    </button>

                    <button

                        class="delete-btn"

                        onclick="deleteImage('${image._id}', event)">

                        <i class="ri-delete-bin-line"></i>

                    </button>

                </div>

            </div>

        `;
    galleryContainer.appendChild(card);
  });
}
// =========================================
// Statistics
// =========================================

function updateStatistics() {
  totalFolders.textContent = folders.length;

  totalImages.textContent = images.length;

  totalShortlisted.textContent = images.filter((i) => i.shortlisted).length;

  const size = images.reduce((a, b) => {
    return a + (b.size || 0);
  }, 0);

  storageUsed.textContent = (size / 1024 / 1024).toFixed(2) + " MB";
}
// =========================================
// Folder Dropdown
// =========================================

function populateFolderDropdown() {
  folderSelect.innerHTML = "";

  filterFolder.innerHTML = `
        <option value="">All Folders</option>
    `;

  folders.forEach((folder) => {
    folderSelect.innerHTML += `

            <option value="${folder._id}">

                ${folder.name}

            </option>

        `;

    filterFolder.innerHTML += `

            <option value="${folder._id}">

                ${folder.name}

            </option>

        `;
  });

  filterFolder.value = currentFolder || "";
  folderSelect.value = currentFolder || "";
}
// =========================================
// Create Folder
// =========================================

saveFolder.addEventListener("click", async () => {
  const name = folderName.value.trim();

  if (!name) {
    showToast("Please enter folder name", "error");

    return;
  }

  try {
    await API.post("/gallery/folders", {
      name,
    });

    folderName.value = "";

    folderModal.hide();

    showToast("Folder created successfully");

    await loadFolders();
  } catch (error) {
    console.error(error);

    showToast("Unable to create folder", "error");
  }
});
// =========================================
// Open Folder Modal
// =========================================

document

  .getElementById("newFolderBtn")

  .addEventListener("click", () => {
    folderModal.show();
  });

document

  .getElementById("createFirstFolder")

  .addEventListener("click", () => {
    folderModal.show();
  });

// =========================================
// Render Folder Cards
// =========================================

function renderFolders() {
  foldersContainer.innerHTML = "";

  if (folders.length === 0) {
    emptyFolders.classList.remove("d-none");

    return;
  }

  emptyFolders.classList.add("d-none");

  folders.forEach((folder) => {
    const imageCount = images.filter(
      (img) => img.folderId === folder._id,
    ).length;

    const shortlisted = images.filter(
      (img) => img.folderId === folder._id && img.shortlisted,
    ).length;

    const cover = folder.coverImage
      ? `<img src="${folder.coverImage}" alt="">`
      : `<i class="ri-folder-fill"></i>`;

    const card = document.createElement("div");

    card.className = "folder-card";

    card.innerHTML = `

            <div class="folder-cover">

                ${cover}

            </div>

            <div class="folder-body">

                <h3 class="folder-title">

                    ${folder.name}

                </h3>

                <div class="folder-info">

                    <span>

                        ${imageCount} Photos

                    </span>

                    <span>

                        ⭐ ${shortlisted}

                    </span>

                </div>

                <div class="folder-footer">

                  <button

                    type="button"

                    class="btn btn-sm btn-outline-primary open-folder-btn"

                    data-id="${folder._id}">

                    Open →

                  </button>

                  <button

                    class="btn btn-sm btn-outline-danger delete-folder-btn"

                    data-id="${folder._id}">

                    <i class="ri-delete-bin-line"></i>

                  </button>

                </div>

            </div>

        `;

    card.addEventListener("click", () => {
      openFolder(folder._id);
    });

    const openBtn = card.querySelector('.open-folder-btn');
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openFolder(openBtn.dataset.id);
      });
    }

    // Attach proper delete handler that stops propagation
    const delBtn = card.querySelector('.delete-folder-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteFolder(delBtn.dataset.id);
      });
    }

    foldersContainer.appendChild(card);
  });
}
// =========================================
// Open Folder
// =========================================

async function openFolder(id) {
  currentFolder = id;

  filterFolder.value = id;

  showGalleryView();

  await loadImages(id);
}

// =========================================
// Delete Folder
// =========================================

async function deleteFolder(id) {
  const confirmDelete = confirm(
    "Delete this folder?\n\nAll images inside it will also be removed.",
  );

  if (!confirmDelete) return;

  try {
    await API.delete(`/gallery/folders/${id}`);

    showToast("Folder deleted");

    await loadFolders();

    await loadImages();
  } catch (error) {
    console.error(error);

    showToast("Unable to delete folder", "error");
  }
}

// =========================================
// Filter Folder
// =========================================

filterFolder.addEventListener("change", async () => {
  const id = filterFolder.value;

  currentFolder = id || null;

  await loadImages(id);
});
// =========================================
// Initialize
// =========================================

document.addEventListener("DOMContentLoaded", async () => {
  await loadFolders();

  await loadImages();
});

// =========================================
// Upload Images
// =========================================

document.getElementById("uploadBtn").addEventListener("click", () => {
  if (folders.length === 0) {
    showToast("Create a folder first", "error");

    return;
  }

  uploadModal.show();
});

document.getElementById("uploadFirstImage").addEventListener("click", () => {
  uploadModal.show();
});

uploadImages.addEventListener("click", async () => {
  const folder = folderSelect.value;

  const files = imageInput.files;

  if (!folder) {
    showToast("Select a folder", "error");

    return;
  }

  if (files.length === 0) {
    showToast("Choose images", "error");

    return;
  }

  try {
    const formData = new FormData();

    formData.append("folderId", folder);

    for (const file of files) {
      formData.append("images", file);
    }

    await fetch(
      `${API.baseURL}/gallery/upload`,

      {
        method: "POST",

        body: formData,
      },
    );

    imageInput.value = "";

    uploadModal.hide();

    showToast("Images uploaded");

    await loadImages(currentFolder);

    await loadFolders();
  } catch (error) {
    console.error(error);

    showToast("Upload failed", "error");
  }
});

// =========================================
// Folder Name
// =========================================

function getFolderName(id) {
  const folder = folders.find((f) => f._id === id);

  return folder ? folder.name : "";
}
// =========================================
// Preview
// =========================================

function previewImageModal(index) {
  currentPreview = index;

  previewImage.src = images[index].imageUrl;

  previewTitle.textContent = images[index].fileName;

  previewModal.show();
}

// =========================================
// Delete Image
// =========================================

async function deleteImage(id, event) {
  if (event) event.stopPropagation();

  const ok = confirm("Delete image?");

  if (!ok) return;

  try {
    await API.delete(`/gallery/image/${id}`);

    showToast("Image deleted");

    await loadImages(currentFolder);

    await loadFolders();
  } catch (error) {
    console.error(error);

    showToast("Delete failed", "error");
  }
}

// =========================================
// Shortlist
// =========================================

async function toggleShortlist(id, event) {
  if (event) event.stopPropagation();

  try {
    await API.put(`/gallery/image/${id}/shortlist`);

    await loadImages(currentFolder);

    await loadFolders();
  } catch (error) {
    console.error(error);
  }
}

// =========================================
// Search
// =========================================

searchInput.addEventListener("input", () => {
  if (currentView === "gallery") {
    renderGallery();
  }
});

// =========================================
// View Toggle: Folders / Gallery / Shortlisted
// =========================================

const showFoldersBtn = document.getElementById("showFolders");
const showGalleryBtn = document.getElementById("showGallery");
const showShortlistedBtn = document.getElementById("showShortlisted");
const folderSection = document.querySelector(".folder-section");
const gallerySection = document.querySelector(".gallery-section");

function setActiveToolbarButton(btn) {
  document.querySelectorAll(".toolbar-right .btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function showFoldersView() {
  folderSection.classList.remove("d-none");
  gallerySection.classList.add("d-none");
  setActiveToolbarButton(showFoldersBtn);
}

function showGalleryView() {
  currentView = "gallery";
  folderSection.classList.add("d-none");
  gallerySection.classList.remove("d-none");
  setActiveToolbarButton(showGalleryBtn);
  renderGallery();
}

function showShortlistedView() {
  currentView = "shortlist";
  folderSection.classList.add("d-none");
  gallerySection.classList.remove("d-none");
  setActiveToolbarButton(showShortlistedBtn);
  renderGallery(images.filter(i => i.shortlisted));
}

if (showFoldersBtn) showFoldersBtn.addEventListener("click", showFoldersView);
if (showGalleryBtn) showGalleryBtn.addEventListener("click", showGalleryView);
if (showShortlistedBtn) showShortlistedBtn.addEventListener("click", showShortlistedView);

// Default to gallery view on load
document.addEventListener("DOMContentLoaded", showGalleryView);

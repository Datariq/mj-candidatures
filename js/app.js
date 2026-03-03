import {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  uploadDocument,
  getDocumentUrl,
  listDocuments,
  STATUSES,
} from "./storage.js";
import { generateLetter } from "../templates/letter-template.js";
import { generateCV } from "../templates/cv-template.js";
import { generatePDF, generatePDFBlob } from "./pdf-generator.js";
import {
  generateEmailText,
  generateMailtoLink,
  copyToClipboard,
} from "./email-generator.js";
import { signIn, signOut, getUser, onAuthStateChange } from "./auth.js";

// ── State ──
let currentView = "list";
let currentEditId = null;
let applications = [];
let currentFilter = "all";
let currentUser = null;

// ── DOM refs ──
const loginScreen = document.getElementById("login-screen");
const appShell = document.getElementById("app-shell");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const btnLogout = document.getElementById("btn-logout");

const views = {
  list: document.getElementById("view-list"),
  form: document.getElementById("view-form"),
  preview: document.getElementById("view-preview"),
  cv: document.getElementById("view-cv"),
};
const navItems = document.querySelectorAll(".nav-item");
const appList = document.getElementById("app-list");
const form = document.getElementById("candidature-form");
const previewFrame = document.getElementById("preview-iframe");
const cvFrame = document.getElementById("cv-iframe");
const modal = document.getElementById("detail-modal");
const toast = document.getElementById("toast");

// ── Auth ──
function showLogin() {
  loginScreen.style.display = "flex";
  appShell.style.display = "none";
  loginError.textContent = "";
}

function showApp() {
  loginScreen.style.display = "none";
  appShell.style.display = "block";
  navigate("list");
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const action = e.submitter?.dataset?.action || "login";
  loginError.textContent = "";

  try {
    await signIn(email, password);
  } catch (err) {
    loginError.style.color = "#ef4444";
    loginError.textContent = err.message || "Erreur de connexion";
  }
});

btnLogout?.addEventListener("click", async () => {
  await signOut();
});

onAuthStateChange((user) => {
  currentUser = user;
  if (user) {
    showApp();
  } else {
    showLogin();
  }
});

// Check initial session
(async () => {
  const user = await getUser();
  currentUser = user;
  if (user) {
    showApp();
  } else {
    showLogin();
  }
})();

// ── Navigation ──
function navigate(view) {
  Object.values(views).forEach((v) => v.classList.remove("active"));
  views[view].classList.add("active");
  navItems.forEach((n) => n.classList.remove("active"));
  document.querySelector(`[data-view="${view}"]`)?.classList.add("active");
  currentView = view;

  if (view === "list") refreshList();
  if (view === "cv") renderCV();
  if (view === "preview" && currentEditId) renderPreview();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const view = item.dataset.view;
    if (view === "form") {
      currentEditId = null;
      form.reset();
      setTodayDate();
    }
    navigate(view);
  });
});

// ── Today's date ──
function setTodayDate() {
  const today = new Date();
  const formatted = today.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateInput = document.getElementById("field-date");
  if (dateInput && !dateInput.value) dateInput.value = formatted;
}

// ── Candidatures list ──
async function refreshList() {
  applications = await getAllApplications();
  renderList();
}

function renderList() {
  const filtered =
    currentFilter === "all"
      ? applications
      : applications.filter((a) => a.status === currentFilter);

  if (filtered.length === 0) {
    appList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
        </svg>
        <h3>Aucune candidature</h3>
        <p>${currentFilter === "all" ? "Commencez par créer votre première candidature" : "Aucune candidature avec ce statut"}</p>
        <button class="btn btn-accent" onclick="document.querySelector('[data-view=form]').click()">
          Nouvelle candidature
        </button>
      </div>`;
    return;
  }

  appList.innerHTML = filtered
    .map((app) => {
      const status =
        STATUSES.find((s) => s.value === app.status) || STATUSES[0];
      const date =
        app.date || new Date(app.createdAt).toLocaleDateString("fr-FR");
      return `
      <div class="app-card" data-id="${app.id}" style="border-left-color: ${status.color}" onclick="window.appShowDetail(${app.id})">
        <div class="app-info">
          <div class="app-company">${escapeHtml(app.company)}</div>
          <div class="app-job">${escapeHtml(app.jobTitle)}</div>
          <div class="app-date">${escapeHtml(date)}</div>
        </div>
        <div class="app-actions">
          <span class="status-badge" style="background:${status.color}">${status.label}</span>
        </div>
      </div>`;
    })
    .join("");
}

// ── Filter chips ──
document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    currentFilter = chip.dataset.filter;
    renderList();
  });
});

// ── Detail modal ──
window.appShowDetail = async function (id) {
  const app = await getApplicationById(id);
  if (!app) return;

  const status = STATUSES.find((s) => s.value === app.status) || STATUSES[0];
  const detailBody = document.getElementById("detail-body");

  const statusOptions = STATUSES.map(
    (s) =>
      `<option value="${s.value}" ${s.value === app.status ? "selected" : ""} style="background:${s.color};color:#fff">${s.label}</option>`,
  ).join("");

  // Fetch documents for this application
  let docsHtml = "";
  try {
    const docs = await listDocuments(app.id);
    if (docs.length > 0) {
      docsHtml = `
        <div class="detail-row" style="flex-direction:column;gap:8px">
          <span class="detail-label">Documents</span>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${docs.map((d) => `<button class="btn btn-outline btn-sm" onclick="window.appDownloadDoc('${d.path}', '${escapeHtml(d.name)}')">${escapeHtml(d.name)}</button>`).join("")}
          </div>
        </div>`;
    }
  } catch {
    // Ignore storage errors
  }

  detailBody.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Entreprise</span>
      <span class="detail-value">${escapeHtml(app.company)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Poste</span>
      <span class="detail-value">${escapeHtml(app.jobTitle)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Date</span>
      <span class="detail-value">${escapeHtml(app.date || "—")}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Recruteur</span>
      <span class="detail-value">${escapeHtml(app.recruiter || "—")}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Référence</span>
      <span class="detail-value">${escapeHtml(app.reference || "—")}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Statut</span>
      <span class="detail-value">
        <select class="status-select" style="background:${status.color}" onchange="window.appUpdateStatus(${app.id}, this.value, this)">
          ${statusOptions}
        </select>
      </span>
    </div>
    ${docsHtml}
    <div style="margin-top:16px" class="btn-group">
      <button class="btn btn-primary btn-sm" onclick="window.appEditApplication(${app.id})">Modifier</button>
      <button class="btn btn-outline btn-sm" onclick="window.appPreviewApplication(${app.id})">Aperçu</button>
      <button class="btn btn-danger btn-sm" onclick="window.appDeleteApplication(${app.id})">Supprimer</button>
    </div>
  `;

  modal.classList.add("active");
};

window.appDownloadDoc = async function (path, filename) {
  try {
    const url = await getDocumentUrl(path);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.click();
  } catch {
    showToast("Erreur lors du téléchargement");
  }
};

window.appUpdateStatus = async function (id, newStatus, selectEl) {
  await updateApplication(id, { status: newStatus });
  const status = STATUSES.find((s) => s.value === newStatus);
  if (status && selectEl) selectEl.style.background = status.color;
  showToast("Statut mis à jour");
  refreshList();
};

window.appEditApplication = async function (id) {
  const app = await getApplicationById(id);
  if (!app) return;
  modal.classList.remove("active");
  currentEditId = id;
  fillForm(app);
  navigate("form");
};

window.appPreviewApplication = async function (id) {
  modal.classList.remove("active");
  currentEditId = id;
  navigate("preview");
};

window.appDeleteApplication = async function (id) {
  if (!confirm("Supprimer cette candidature ?")) return;
  await deleteApplication(id);
  modal.classList.remove("active");
  showToast("Candidature supprimée");
  refreshList();
};

// Close modal
document.querySelector(".modal-close")?.addEventListener("click", () => {
  modal.classList.remove("active");
});
modal?.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("active");
});

// ── Form ──
function fillForm(app) {
  document.getElementById("field-company").value = app.company || "";
  document.getElementById("field-address").value = app.address || "";
  document.getElementById("field-city").value = app.city || "";
  document.getElementById("field-postalCode").value = app.postalCode || "";
  document.getElementById("field-recruiter").value = app.recruiter || "";
  document.getElementById("field-jobTitle").value = app.jobTitle || "";
  document.getElementById("field-reference").value = app.reference || "";
  document.getElementById("field-motivationParagraph").value =
    app.motivationParagraph || "";
  document.getElementById("field-skillsParagraph").value =
    app.skillsParagraph || "";
  document.getElementById("field-date").value = app.date || "";
}

function getFormData() {
  return {
    company: document.getElementById("field-company").value.trim(),
    address: document.getElementById("field-address").value.trim(),
    city: document.getElementById("field-city").value.trim(),
    postalCode: document.getElementById("field-postalCode").value.trim(),
    recruiter: document.getElementById("field-recruiter").value.trim(),
    jobTitle: document.getElementById("field-jobTitle").value.trim(),
    reference: document.getElementById("field-reference").value.trim(),
    motivationParagraph: document
      .getElementById("field-motivationParagraph")
      .value.trim(),
    skillsParagraph: document
      .getElementById("field-skillsParagraph")
      .value.trim(),
    date: document.getElementById("field-date").value.trim(),
  };
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = getFormData();

  if (!data.company || !data.jobTitle) {
    showToast("Entreprise et poste sont requis");
    return;
  }

  if (currentEditId) {
    await updateApplication(currentEditId, data);
    showToast("Candidature mise à jour");
  } else {
    currentEditId = await createApplication(data);
    showToast("Candidature créée");
  }

  navigate("preview");
});

// Save draft button
document
  .getElementById("btn-save-draft")
  ?.addEventListener("click", async () => {
    const data = getFormData();
    if (!data.company && !data.jobTitle) {
      showToast("Remplissez au moins l'entreprise ou le poste");
      return;
    }
    data.status = "brouillon";
    if (currentEditId) {
      await updateApplication(currentEditId, data);
    } else {
      currentEditId = await createApplication(data);
    }
    showToast("Brouillon sauvegardé");
  });

// ── Preview ──
async function renderPreview() {
  if (!currentEditId) return;
  const app = await getApplicationById(currentEditId);
  if (!app) return;

  const letterHtml = generateLetter(app);
  previewFrame.srcdoc = letterHtml;
}

// PDF buttons — generate + upload to Supabase
document
  .getElementById("btn-pdf-letter")
  ?.addEventListener("click", async () => {
    if (!currentEditId) return;
    const app = await getApplicationById(currentEditId);
    if (!app) return;

    const filename = `Lettre_Motivation_Marie_Julien_${app.company.replace(/\s+/g, "_")}.pdf`;
    showToast("Génération du PDF...");

    const html = generateLetter(app);
    // Download locally
    await generatePDF(html, filename);

    // Upload to Supabase Storage
    try {
      const blob = await generatePDFBlob(html, filename);
      await uploadDocument(blob, currentEditId, filename);
      showToast("PDF lettre téléchargé et sauvegardé");
    } catch {
      showToast("PDF téléchargé (erreur sauvegarde cloud)");
    }
  });

document.getElementById("btn-pdf-cv")?.addEventListener("click", async () => {
  const filename = "CV_Marie_Julien.pdf";
  showToast("Génération du PDF...");

  const html = generateCV();
  await generatePDF(html, filename);

  // Upload CV to Supabase if we have a current application
  if (currentEditId) {
    try {
      const blob = await generatePDFBlob(html, filename);
      await uploadDocument(blob, currentEditId, filename);
      showToast("PDF CV téléchargé et sauvegardé");
    } catch {
      showToast("PDF téléchargé (erreur sauvegarde cloud)");
    }
  } else {
    showToast("PDF CV téléchargé");
  }
});

// Email buttons
document
  .getElementById("btn-copy-email")
  ?.addEventListener("click", async () => {
    if (!currentEditId) return;
    const app = await getApplicationById(currentEditId);
    if (!app) return;
    const emailText = generateEmailText(app);
    await copyToClipboard(emailText);
    showToast("Email copié dans le presse-papier");
  });

document.getElementById("btn-mailto")?.addEventListener("click", async () => {
  if (!currentEditId) return;
  const app = await getApplicationById(currentEditId);
  if (!app) return;
  const link = generateMailtoLink(app);
  window.open(link, "_blank");
});

// Mark as sent
document
  .getElementById("btn-mark-sent")
  ?.addEventListener("click", async () => {
    if (!currentEditId) return;
    await updateApplication(currentEditId, { status: "envoyée" });
    showToast("Candidature marquée comme envoyée");
  });

// ── CV view ──
function renderCV() {
  const html = generateCV();
  cvFrame.srcdoc = html;
}

// ── Toast ──
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ── Helpers ──
function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ── PWA install prompt ──
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById("btn-install");
  if (installBtn) {
    installBtn.style.display = "inline-flex";
    installBtn.addEventListener("click", async () => {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = "none";
    });
  }
});

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

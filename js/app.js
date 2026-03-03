import {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  uploadDocument,
  getDocumentUrl,
  listDocuments,
  getProfile,
  saveProfile,
  DEFAULT_PROFILE,
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
let profile = null;
let editingProfile = false;

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

async function showApp() {
  loginScreen.style.display = "none";
  appShell.style.display = "block";
  profile = (await getProfile()) || { ...DEFAULT_PROFILE };
  navigate("list");
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
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
  if (user) showApp();
  else showLogin();
});

(async () => {
  const user = await getUser();
  currentUser = user;
  if (user) showApp();
  else showLogin();
})();

// ── Navigation ──
function navigate(view) {
  editingProfile = false;
  Object.values(views).forEach((v) => v.classList.remove("active"));
  views[view].classList.add("active");
  navItems.forEach((n) => n.classList.remove("active"));
  document.querySelector(`[data-view="${view}"]`)?.classList.add("active");
  currentView = view;
  if (view === "list") refreshList();
  if (view === "cv") renderCVView();
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
      resetAiStatus();
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
        <p>${currentFilter === "all" ? "Commencez par cr\u00e9er votre premi\u00e8re candidature" : "Aucune candidature avec ce statut"}</p>
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
    // ignore
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
      <span class="detail-value">${escapeHtml(app.date || "\u2014")}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Recruteur</span>
      <span class="detail-value">${escapeHtml(app.recruiter || "\u2014")}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">R\u00e9f\u00e9rence</span>
      <span class="detail-value">${escapeHtml(app.reference || "\u2014")}</span>
    </div>
    ${
      app.jobUrl
        ? `<div class="detail-row">
      <span class="detail-label">Offre</span>
      <span class="detail-value"><a href="${escapeHtml(app.jobUrl)}" target="_blank" rel="noopener" style="color:var(--navy);text-decoration:underline">Voir l'offre</a></span>
    </div>`
        : ""
    }
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
      <button class="btn btn-outline btn-sm" onclick="window.appPreviewApplication(${app.id})">Aper\u00e7u</button>
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
    showToast("Erreur lors du t\u00e9l\u00e9chargement");
  }
};

window.appUpdateStatus = async function (id, newStatus, selectEl) {
  await updateApplication(id, { status: newStatus });
  const status = STATUSES.find((s) => s.value === newStatus);
  if (status && selectEl) selectEl.style.background = status.color;
  showToast("Statut mis \u00e0 jour");
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
  showToast("Candidature supprim\u00e9e");
  refreshList();
};

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
  document.getElementById("field-jobUrl").value = app.jobUrl || "";
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
    jobUrl: document.getElementById("field-jobUrl").value.trim(),
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
    showToast("Candidature mise \u00e0 jour");
  } else {
    currentEditId = await createApplication(data);
    showToast("Candidature cr\u00e9\u00e9e");
  }
  navigate("preview");
});

document
  .getElementById("btn-save-draft")
  ?.addEventListener("click", async () => {
    const data = getFormData();
    if (!data.company && !data.jobTitle) {
      showToast("Remplissez au moins l\u2019entreprise ou le poste");
      return;
    }
    data.status = "brouillon";
    if (currentEditId) {
      await updateApplication(currentEditId, data);
    } else {
      currentEditId = await createApplication(data);
    }
    showToast("Brouillon sauvegard\u00e9");
  });

// ── AI Job Analysis ──
const aiStatus = document.getElementById("ai-status");
const btnAnalyze = document.getElementById("btn-analyze-job");

function resetAiStatus() {
  if (aiStatus) {
    aiStatus.style.display = "none";
    aiStatus.className = "ai-status";
    aiStatus.innerHTML = "";
  }
}

function showAiStatus(type, message) {
  if (!aiStatus) return;
  aiStatus.style.display = "block";
  aiStatus.className = `ai-status ${type}`;
  if (type === "loading") {
    aiStatus.innerHTML = `<span class="ai-spinner"></span>${escapeHtml(message)}`;
  } else {
    aiStatus.textContent = message;
  }
}

function showPasteFallback() {
  if (!aiStatus) return;
  aiStatus.style.display = "block";
  aiStatus.className = "ai-status error";
  aiStatus.innerHTML = `
    <div>Ce site bloque l'acc\u00e8s automatique. Copiez-collez le contenu de l'annonce ci-dessous :</div>
    <textarea id="ai-paste-text" class="ai-paste-textarea" rows="6" placeholder="Collez ici le texte de l'offre d'emploi..."></textarea>
    <button type="button" id="btn-analyze-paste" class="btn btn-primary btn-sm" style="margin-top:8px">Analyser le texte coll\u00e9</button>
  `;
  document
    .getElementById("btn-analyze-paste")
    ?.addEventListener("click", analyzePastedText);
}

function fillFormFromAI(data) {
  const fields = [
    "company",
    "address",
    "postalCode",
    "city",
    "jobTitle",
    "reference",
    "recruiter",
    "skillsParagraph",
    "motivationParagraph",
  ];
  for (const key of fields) {
    if (data[key]) {
      const el = document.getElementById(`field-${key}`);
      if (el) el.value = data[key];
    }
  }
}

async function analyzeJobUrl() {
  const urlInput = document.getElementById("field-jobUrl");
  const url = urlInput?.value.trim();

  if (!url) {
    showAiStatus("error", "Veuillez entrer une URL");
    return;
  }

  try {
    new URL(url);
  } catch {
    showAiStatus("error", "URL invalide");
    return;
  }

  showAiStatus("loading", "Analyse de l'offre en cours...");
  btnAnalyze.disabled = true;

  try {
    const profilePayload = profile
      ? {
          fullName: profile.fullName,
          jobTitle: profile.jobTitle,
          accroche: profile.accroche,
          letterExperience: profile.letterExperience,
          skills: profile.skills,
          qualities: profile.qualities,
          tools: profile.tools,
        }
      : null;

    const res = await fetch("/api/analyze-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, profile: profilePayload }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.fetchFailed) {
        showPasteFallback();
      } else {
        showAiStatus("error", data.error || "Erreur lors de l'analyse");
      }
      return;
    }

    fillFormFromAI(data);
    showAiStatus("success", "Formulaire rempli automatiquement !");
  } catch (err) {
    showAiStatus("error", "Erreur de connexion au service d'analyse");
  } finally {
    btnAnalyze.disabled = false;
  }
}

async function analyzePastedText() {
  const textarea = document.getElementById("ai-paste-text");
  const text = textarea?.value.trim();

  if (!text || text.length < 30) {
    showAiStatus(
      "error",
      "Collez le texte complet de l'annonce (au moins quelques lignes)",
    );
    return;
  }

  showAiStatus("loading", "Analyse du texte en cours...");

  try {
    const profilePayload = profile
      ? {
          fullName: profile.fullName,
          jobTitle: profile.jobTitle,
          accroche: profile.accroche,
          letterExperience: profile.letterExperience,
          skills: profile.skills,
          qualities: profile.qualities,
          tools: profile.tools,
        }
      : null;

    const res = await fetch("/api/analyze-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, profile: profilePayload }),
    });

    const data = await res.json();

    if (!res.ok) {
      showAiStatus("error", data.error || "Erreur lors de l'analyse");
      return;
    }

    fillFormFromAI(data);
    showAiStatus("success", "Formulaire rempli automatiquement !");
  } catch (err) {
    showAiStatus("error", "Erreur de connexion au service d'analyse");
  }
}

btnAnalyze?.addEventListener("click", analyzeJobUrl);

// ── Preview ──
async function renderPreview() {
  if (!currentEditId) return;
  const app = await getApplicationById(currentEditId);
  if (!app) return;
  const letterHtml = generateLetter(app, profile);
  previewFrame.srcdoc = letterHtml;
}

// ── PDF helpers ──
function sanitizeFilename(str) {
  return str.replace(/[^a-zA-Z0-9\u00C0-\u017F_-]/g, "_").replace(/_+/g, "_");
}

function pdfName(type, app) {
  const name = sanitizeFilename(profile.fullName);
  if (type === "cv") return `CV_${name}.pdf`;
  const co = sanitizeFilename(app.company);
  return `LM_${name}_${co}.pdf`;
}

// PDF buttons
document
  .getElementById("btn-pdf-letter")
  ?.addEventListener("click", async () => {
    if (!currentEditId) return;
    const app = await getApplicationById(currentEditId);
    if (!app) return;
    const filename = pdfName("letter", app);
    showToast("G\u00e9n\u00e9ration du PDF...");
    const html = generateLetter(app, profile);
    await generatePDF(html, filename);
    try {
      const blob = await generatePDFBlob(html, filename);
      await uploadDocument(blob, currentEditId, filename);
      showToast("PDF lettre t\u00e9l\u00e9charg\u00e9 et sauvegard\u00e9");
    } catch {
      showToast("PDF t\u00e9l\u00e9charg\u00e9 (erreur sauvegarde cloud)");
    }
  });

document.getElementById("btn-pdf-cv")?.addEventListener("click", async () => {
  const filename = pdfName("cv");
  showToast("G\u00e9n\u00e9ration du PDF...");
  const html = generateCV(profile);
  await generatePDF(html, filename);
  if (currentEditId) {
    try {
      const blob = await generatePDFBlob(html, filename);
      await uploadDocument(blob, currentEditId, filename);
      showToast("PDF CV t\u00e9l\u00e9charg\u00e9 et sauvegard\u00e9");
    } catch {
      showToast("PDF t\u00e9l\u00e9charg\u00e9 (erreur sauvegarde cloud)");
    }
  } else {
    showToast("PDF CV t\u00e9l\u00e9charg\u00e9");
  }
});

// Email buttons
document
  .getElementById("btn-copy-email")
  ?.addEventListener("click", async () => {
    if (!currentEditId) return;
    const app = await getApplicationById(currentEditId);
    if (!app) return;
    const emailText = generateEmailText(app, profile);
    await copyToClipboard(emailText);
    showToast("Email copi\u00e9 dans le presse-papier");
  });

document.getElementById("btn-mailto")?.addEventListener("click", async () => {
  if (!currentEditId) return;
  const app = await getApplicationById(currentEditId);
  if (!app) return;
  const link = generateMailtoLink(app, profile);
  window.open(link, "_blank");
});

document
  .getElementById("btn-mark-sent")
  ?.addEventListener("click", async () => {
    if (!currentEditId) return;
    await updateApplication(currentEditId, { status: "envoy\u00e9e" });
    showToast("Candidature marqu\u00e9e comme envoy\u00e9e");
  });

// ── CV view ──
function renderCVView() {
  const container = document.getElementById("cv-content");
  if (editingProfile) {
    renderProfileEditor(container);
  } else {
    container.innerHTML = `
      <div class="cv-frame">
        <iframe id="cv-iframe-inner" title="CV"></iframe>
      </div>
      <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
        <button id="btn-pdf-cv-inner" class="btn btn-accent btn-sm" style="flex:1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3"/>
          </svg>
          T\u00e9l\u00e9charger le CV en PDF
        </button>
        <button id="btn-edit-profile" class="btn btn-outline btn-sm" style="flex:1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Modifier mon profil
        </button>
      </div>
    `;
    const innerFrame = document.getElementById("cv-iframe-inner");
    innerFrame.srcdoc = generateCV(profile);
    document
      .getElementById("btn-pdf-cv-inner")
      .addEventListener("click", () => {
        document.getElementById("btn-pdf-cv")?.click();
      });
    document
      .getElementById("btn-edit-profile")
      .addEventListener("click", () => {
        editingProfile = true;
        renderCVView();
      });
  }
}

// ── Profile Editor ──
function renderProfileEditor(container) {
  const p = profile;
  container.innerHTML = `
    <div class="card profile-editor">
      <div class="form-section"><h3>Modifier mon profil</h3></div>

      <details open>
        <summary>Informations personnelles</summary>
        <div class="profile-section-body">
          <div class="form-group"><label>Nom complet</label><input id="p-fullName" value="${esc(p.fullName)}"></div>
          <div class="form-group"><label>Initiales</label><input id="p-initials" value="${esc(p.initials)}"></div>
          <div class="form-group"><label>Titre professionnel</label><input id="p-jobTitle" value="${esc(p.jobTitle)}"></div>
          <div class="form-group"><label>Email</label><input id="p-email" value="${esc(p.email)}"></div>
          <div class="form-group"><label>T\u00e9l\u00e9phone</label><input id="p-phone" value="${esc(p.phone)}"></div>
          <div class="form-group"><label>Localisation</label><input id="p-location" value="${esc(p.location)}"></div>
        </div>
      </details>

      <details>
        <summary>Lettre de motivation (textes par d\u00e9faut)</summary>
        <div class="profile-section-body">
          <div class="form-group">
            <label>Paragraphe d\u2019introduction <small style="color:var(--text-light)">\u2014 {poste} et {entreprise} seront remplac\u00e9s automatiquement</small></label>
            <textarea id="p-letterIntro" rows="4">${esc(p.letterIntro)}</textarea>
          </div>
          <div class="form-group">
            <label>Paragraphe exp\u00e9rience actuelle</label>
            <textarea id="p-letterExperience" rows="4">${esc(p.letterExperience)}</textarea>
          </div>
          <div class="form-group">
            <label>Corps de l\u2019email de candidature</label>
            <textarea id="p-emailBody" rows="3">${esc(p.emailBody || "")}</textarea>
          </div>
        </div>
      </details>

      <details>
        <summary>CV \u2014 Accroche</summary>
        <div class="profile-section-body">
          <div class="form-group"><label>Accroche / r\u00e9sum\u00e9</label><textarea id="p-accroche" rows="3">${esc(p.accroche)}</textarea></div>
        </div>
      </details>

      <details>
        <summary>CV \u2014 Comp\u00e9tences</summary>
        <div class="profile-section-body">
          <div id="p-skills-container">
            ${(p.skills || []).map((g, i) => skillGroupCard(g, i)).join("")}
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="btn-add-skill-group" style="margin-top:8px">+ Groupe</button>
        </div>
      </details>

      <details>
        <summary>CV \u2014 Qualit\u00e9s, Outils, Langues, Infos</summary>
        <div class="profile-section-body">
          <div class="form-group"><label>Qualit\u00e9s <small>(une par ligne)</small></label><textarea id="p-qualities" rows="4">${esc((p.qualities || []).join("\n"))}</textarea></div>
          <div class="form-group"><label>Logiciels & outils <small>(un par ligne)</small></label><textarea id="p-tools" rows="4">${esc((p.tools || []).join("\n"))}</textarea></div>
          <div class="form-group"><label>Langues <small>(format : Nom | Niveau, une par ligne)</small></label><textarea id="p-languages" rows="2">${esc((p.languages || []).map((l) => l.name + " | " + l.level).join("\n"))}</textarea></div>
          <div class="form-group"><label>Infos compl\u00e9mentaires <small>(une par ligne)</small></label><textarea id="p-extraInfo" rows="2">${esc((p.extraInfo || []).join("\n"))}</textarea></div>
          <div class="form-group"><label>Centres d\u2019int\u00e9r\u00eat <small>(un par ligne)</small></label><textarea id="p-interests" rows="2">${esc((p.interests || []).join("\n"))}</textarea></div>
        </div>
      </details>

      <details>
        <summary>CV \u2014 Exp\u00e9riences professionnelles</summary>
        <div class="profile-section-body">
          <div id="p-exp-container">
            ${(p.experiences || []).map((exp, i) => expCard(exp, i)).join("")}
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="btn-add-exp" style="margin-top:8px">+ Exp\u00e9rience</button>
        </div>
      </details>

      <details>
        <summary>CV \u2014 Formation</summary>
        <div class="profile-section-body">
          <div id="p-edu-container">
            ${(p.education || []).map((edu, i) => eduCard(edu, i)).join("")}
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="btn-add-edu" style="margin-top:8px">+ Formation</button>
        </div>
      </details>

      <div class="btn-group" style="margin-top:20px">
        <button type="button" id="btn-save-profile" class="btn btn-accent" style="flex:1">Sauvegarder</button>
        <button type="button" id="btn-cancel-profile" class="btn btn-outline">Retour au CV</button>
      </div>
    </div>
  `;

  // Event listeners
  document
    .getElementById("btn-save-profile")
    .addEventListener("click", handleSaveProfile);
  document
    .getElementById("btn-cancel-profile")
    .addEventListener("click", () => {
      editingProfile = false;
      renderCVView();
    });
  document.getElementById("btn-add-exp").addEventListener("click", () => {
    const c = document.getElementById("p-exp-container");
    c.insertAdjacentHTML(
      "beforeend",
      expCard(
        { company: "", dates: "", role: "", location: "", tasks: [] },
        c.children.length,
      ),
    );
  });
  document.getElementById("btn-add-edu").addEventListener("click", () => {
    const c = document.getElementById("p-edu-container");
    c.insertAdjacentHTML(
      "beforeend",
      eduCard({ diploma: "", school: "", year: "" }, c.children.length),
    );
  });
  document
    .getElementById("btn-add-skill-group")
    .addEventListener("click", () => {
      const c = document.getElementById("p-skills-container");
      c.insertAdjacentHTML(
        "beforeend",
        skillGroupCard({ group: "", items: [] }, c.children.length),
      );
    });

  container.addEventListener("click", (e) => {
    if (e.target.closest(".btn-remove-card")) {
      e.target.closest(".profile-card").remove();
    }
  });
}

function skillGroupCard(g, i) {
  return `<div class="profile-card">
    <button type="button" class="btn-remove-card">&times;</button>
    <div class="form-group"><label>Nom du groupe</label><input class="sg-group" value="${esc(g.group)}"></div>
    <div class="form-group"><label>Comp\u00e9tences <small>(une par ligne)</small></label><textarea class="sg-items" rows="4">${esc(g.items.join("\n"))}</textarea></div>
  </div>`;
}

function expCard(exp, i) {
  return `<div class="profile-card">
    <button type="button" class="btn-remove-card">&times;</button>
    <div class="form-row"><div class="form-group"><label>Entreprise</label><input class="exp-company" value="${esc(exp.company)}"></div>
    <div class="form-group"><label>Dates</label><input class="exp-dates" value="${esc(exp.dates)}"></div></div>
    <div class="form-group"><label>R\u00f4le / poste</label><input class="exp-role" value="${esc(exp.role)}"></div>
    <div class="form-group"><label>Lieu | Contrat</label><input class="exp-location" value="${esc(exp.location)}"></div>
    <div class="form-group"><label>T\u00e2ches <small>(une par ligne, format \u00ab Titre : description \u00bb pour mettre le titre en gras)</small></label><textarea class="exp-tasks" rows="4">${esc(exp.tasks.join("\n"))}</textarea></div>
  </div>`;
}

function eduCard(edu, i) {
  return `<div class="profile-card">
    <button type="button" class="btn-remove-card">&times;</button>
    <div class="form-row">
      <div class="form-group"><label>Dipl\u00f4me</label><input class="edu-diploma" value="${esc(edu.diploma)}"></div>
      <div class="form-group"><label>Ann\u00e9e</label><input class="edu-year" value="${esc(edu.year)}"></div>
    </div>
    <div class="form-group"><label>\u00c9tablissement</label><input class="edu-school" value="${esc(edu.school)}"></div>
  </div>`;
}

function lines(str) {
  return str
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function handleSaveProfile() {
  const newProfile = {
    fullName: document.getElementById("p-fullName").value.trim(),
    initials: document.getElementById("p-initials").value.trim(),
    jobTitle: document.getElementById("p-jobTitle").value.trim(),
    email: document.getElementById("p-email").value.trim(),
    phone: document.getElementById("p-phone").value.trim(),
    location: document.getElementById("p-location").value.trim(),
    letterIntro: document.getElementById("p-letterIntro").value.trim(),
    letterExperience: document
      .getElementById("p-letterExperience")
      .value.trim(),
    emailBody: document.getElementById("p-emailBody").value.trim(),
    accroche: document.getElementById("p-accroche").value.trim(),
    skills: Array.from(
      document.querySelectorAll("#p-skills-container .profile-card"),
    )
      .map((card) => ({
        group: card.querySelector(".sg-group").value.trim(),
        items: lines(card.querySelector(".sg-items").value),
      }))
      .filter((s) => s.group),
    qualities: lines(document.getElementById("p-qualities").value),
    tools: lines(document.getElementById("p-tools").value),
    languages: lines(document.getElementById("p-languages").value).map((l) => {
      const [name, level] = l.split("|").map((s) => s.trim());
      return { name: name || l, level: level || "" };
    }),
    extraInfo: lines(document.getElementById("p-extraInfo").value),
    interests: lines(document.getElementById("p-interests").value),
    experiences: Array.from(
      document.querySelectorAll("#p-exp-container .profile-card"),
    )
      .map((card) => ({
        company: card.querySelector(".exp-company").value.trim(),
        dates: card.querySelector(".exp-dates").value.trim(),
        role: card.querySelector(".exp-role").value.trim(),
        location: card.querySelector(".exp-location").value.trim(),
        tasks: lines(card.querySelector(".exp-tasks").value),
      }))
      .filter((e) => e.company),
    education: Array.from(
      document.querySelectorAll("#p-edu-container .profile-card"),
    )
      .map((card) => ({
        diploma: card.querySelector(".edu-diploma").value.trim(),
        school: card.querySelector(".edu-school").value.trim(),
        year: card.querySelector(".edu-year").value.trim(),
      }))
      .filter((e) => e.diploma),
  };

  try {
    await saveProfile(newProfile);
    profile = { ...DEFAULT_PROFILE, ...newProfile };
    editingProfile = false;
    renderCVView();
    showToast("Profil sauvegard\u00e9");
  } catch (err) {
    showToast("Erreur : " + err.message);
  }
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

function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── PWA ──
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

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

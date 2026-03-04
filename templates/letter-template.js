export function generateLetter(data, profile) {
  const p = profile;
  const {
    company,
    address,
    city,
    postalCode,
    recruiter,
    jobTitle,
    reference,
    motivationParagraph,
    skillsParagraph,
    date,
  } = data;

  const displayDate =
    date ||
    new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const displayRecruiter = recruiter || "Madame, Monsieur";
  const displayReference = reference ? ` \u2014 R\u00e9f. ${reference}` : "";

  const introText = (p.letterIntro || "")
    .replace(/\{poste\}/g, jobTitle)
    .replace(/\{entreprise\}/g, company);

  const experienceText = p.letterExperience || "";

  function esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lettre de Motivation \u2014 ${esc(p.fullName)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
    <style>
      *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
      :root {
        --navy: #1a2744; --navy-light: #2a3f6a; --accent: #c8a45a;
        --accent-light: #f5edda; --text: #2c2c2c; --text-light: #5a5a5a;
        --bg: #ffffff; --border: #e2e2e2;
      }
      html { font-size: 14.5px; }
      body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        color: var(--text); background: #fff; line-height: 1.55;
        -webkit-font-smoothing: antialiased;
      }
      .page {
        max-width: 850px; margin: 0 auto; background: var(--bg);
        height: 1180px; display: flex; flex-direction: column;
        overflow: hidden;
      }
      .letter-header {
        background: var(--navy); color: #e8e8e8;
        padding: 32px 44px; display: flex;
        justify-content: space-between; align-items: flex-start; gap: 24px;
      }
      .sender-info { display: flex; flex-direction: column; gap: 4px; }
      .sender-name {
        font-family: "Playfair Display", serif; font-size: 1.5rem;
        font-weight: 700; color: #fff; letter-spacing: 0.5px; line-height: 1.2;
      }
      .sender-title {
        font-size: 0.78rem; font-weight: 500; color: var(--accent);
        text-transform: uppercase; letter-spacing: 2px; margin-top: 2px;
      }
      .sender-contact {
        list-style: none; display: flex; flex-direction: column;
        gap: 4px; margin-top: 8px; font-size: 0.74rem; color: #c8d0dc;
      }
      .sender-contact li { display: flex; align-items: center; gap: 8px; }
      .sender-contact .icon {
        color: var(--accent); font-size: 0.78rem; width: 16px;
        text-align: center; flex-shrink: 0;
      }
      .header-accent {
        width: 64px; height: 64px; border-radius: 50%;
        border: 3px solid var(--accent); display: flex;
        align-items: center; justify-content: center;
        font-family: "Playfair Display", serif; font-size: 1.5rem;
        font-weight: 700; color: var(--accent); letter-spacing: 2px;
        flex-shrink: 0;
      }
      .accent-bar {
        height: 4px;
        background: linear-gradient(90deg, var(--accent), var(--accent-light));
      }
      .letter-body {
        padding: 30px 44px 32px; flex: 1;
        display: flex; flex-direction: column; gap: 0;
      }
      .meta-block {
        display: flex; justify-content: space-between;
        align-items: flex-start; margin-bottom: 26px;
      }
      .recipient { font-size: 0.82rem; line-height: 1.55; color: var(--text); }
      .recipient strong { color: var(--navy); font-weight: 600; }
      .date-location {
        font-size: 0.78rem; color: var(--text-light);
        text-align: right; white-space: nowrap;
      }
      .object-line {
        font-size: 0.82rem; font-weight: 600; color: var(--navy);
        margin-bottom: 22px; padding: 9px 14px;
        background: var(--accent-light); border-left: 4px solid var(--accent);
        border-radius: 0 4px 4px 0;
      }
      .object-line span {
        font-weight: 700; text-transform: uppercase;
        letter-spacing: 1px; font-size: 0.66rem;
        color: var(--accent); margin-right: 8px;
      }
      .salutation { font-size: 0.84rem; margin-bottom: 14px; color: var(--text); }
      .letter-paragraph {
        font-size: 0.82rem; line-height: 1.55; color: var(--text);
        margin-bottom: 12px; text-align: left;
      }
      .letter-paragraph strong { color: var(--navy); font-weight: 600; }
      .closing {
        margin-top: 8px; font-size: 0.82rem;
        line-height: 1.6; color: var(--text);
      }
      .signature-block {
        margin-top: 22px; display: flex; flex-direction: column;
        align-items: flex-end; gap: 3px;
      }
      .signature-name {
        font-family: "Playfair Display", serif; font-size: 1.1rem;
        font-weight: 700; color: var(--navy);
      }
      .letter-footer {
        background: var(--navy); padding: 12px 44px;
        display: flex; justify-content: center; gap: 28px;
        font-size: 0.66rem; color: #8a95a8; letter-spacing: 0.3px;
      }
      .letter-footer .icon { color: var(--accent); margin-right: 6px; }
      @page { size: A4; margin: 0; }
      @media print {
        body { background: none; margin: 0; }
        .page { margin: 0; box-shadow: none; height: auto; width: 100%; }
        .letter-header, .letter-footer {
          print-color-adjust: exact; -webkit-print-color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="letter-header">
        <div class="sender-info">
          <div class="sender-name">${esc(p.fullName)}</div>
          <div class="sender-title">${esc(p.jobTitle)}</div>
          <ul class="sender-contact">
            <li><span class="icon">&#9993;</span> ${esc(p.email)}</li>
            <li><span class="icon">&#9742;</span> ${esc(p.phone)}</li>
            <li><span class="icon">&#9873;</span> ${esc(p.location)}</li>
          </ul>
        </div>
        <div class="header-accent">${esc(p.initials)}</div>
      </header>

      <div class="accent-bar"></div>

      <div class="letter-body">
        <div class="meta-block">
          <div class="recipient">
            <strong>${esc(displayRecruiter)}</strong><br />
            ${esc(company)}<br />
            ${esc(address)}<br />
            ${esc(postalCode)} ${esc(city)}
          </div>
          <div class="date-location">${esc(p.location.split(",")[0] || p.location)}, le ${esc(displayDate)}</div>
        </div>

        <div class="object-line">
          <span>Objet :</span> Candidature au poste de ${esc(jobTitle)}${esc(displayReference)}
        </div>

        <p class="salutation">${esc(displayRecruiter)},</p>

        <p class="letter-paragraph">${esc(introText)}</p>

        <p class="letter-paragraph">${esc(experienceText)}</p>

        ${skillsParagraph ? `<p class="letter-paragraph">${esc(skillsParagraph)}</p>` : ""}

        ${motivationParagraph ? `<p class="letter-paragraph">${esc(motivationParagraph)}</p>` : ""}

        <p class="closing">
          Dans l\u2019attente de votre retour, je vous prie d\u2019agr\u00e9er, ${esc(displayRecruiter)},
          l\u2019expression de mes salutations distingu\u00e9es.
        </p>

        <div class="signature-block">
          <div class="signature-name">${esc(p.fullName)}</div>
        </div>
      </div>

      <footer class="letter-footer">
        <span><span class="icon">&#9993;</span>${esc(p.email)}</span>
        <span><span class="icon">&#9742;</span>${esc(p.phone)}</span>
        <span><span class="icon">&#9873;</span>${esc(p.location)}</span>
      </footer>
    </div>
  </body>
</html>`;
}

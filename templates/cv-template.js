export function generateCV(profile) {
  const p = profile;

  function esc(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatTask(task) {
    const idx = task.indexOf(" : ");
    if (idx > 0) {
      return `<strong>${esc(task.slice(0, idx))}</strong> : ${esc(task.slice(idx + 3))}`;
    }
    return esc(task);
  }

  const skillsHtml = (p.skills || [])
    .map(
      (g) => `
      <div class="skill-group">
        <h3>${esc(g.group)}</h3>
        <ul class="skill-list">
          ${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}
        </ul>
      </div>`,
    )
    .join("");

  const qualitiesHtml = (p.qualities || [])
    .map((q) => `<li>${esc(q)}</li>`)
    .join("");

  const toolsHtml = (p.tools || [])
    .map((t) => `<span>${esc(t)}</span>`)
    .join("");

  const languagesHtml = (p.languages || [])
    .map(
      (l) =>
        `<div class="lang-item"><strong>${esc(l.name)}</strong> \u2014 ${esc(l.level)}</div>`,
    )
    .join("");

  const extraInfoHtml = (p.extraInfo || [])
    .map((i) => `<div class="info-item"><strong>${esc(i)}</strong></div>`)
    .join("");

  const interestsHtml = (p.interests || [])
    .map((i) => `<span>${esc(i)}</span>`)
    .join("");

  const experiencesHtml = (p.experiences || [])
    .map(
      (exp) => `
      <div class="experience">
        <div class="exp-header">
          <span class="company">${esc(exp.company)}</span>
          <span class="dates">${esc(exp.dates)}</span>
        </div>
        <div class="role">${esc(exp.role)}</div>
        <div class="location">${esc(exp.location)}</div>
        <ul class="tasks">
          ${exp.tasks.map((t) => `<li>${formatTask(t)}</li>`).join("")}
        </ul>
      </div>`,
    )
    .join("");

  const educationHtml = (p.education || [])
    .map(
      (edu) => `
      <div class="formation-item">
        <div>
          <div class="diploma">${esc(edu.diploma)}</div>
          <div class="school">${esc(edu.school)}</div>
        </div>
        <span class="year">${esc(edu.year)}</span>
      </div>`,
    )
    .join("");

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CV \u2014 ${esc(p.fullName)} | ${esc(p.jobTitle)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
    <style>
      *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
      :root {
        --navy: #1a2744; --navy-light: #2a3f6a; --accent: #c8a45a;
        --accent-light: #f5edda; --text: #2c2c2c; --text-light: #5a5a5a;
        --bg: #ffffff; --border: #e2e2e2; --section-gap: 22px;
      }
      html { font-size: 14.5px; }
      body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        color: var(--text); background: #fff; line-height: 1.5;
        -webkit-font-smoothing: antialiased;
      }
      .page {
        max-width: 850px; margin: 0 auto; background: var(--bg);
        display: grid; grid-template-columns: 250px 1fr;
        height: 1180px; overflow: hidden;
      }
      .sidebar {
        background: var(--navy); color: #e8e8e8;
        padding: 32px 20px 24px; display: flex;
        flex-direction: column; gap: var(--section-gap);
      }
      .sidebar .initials {
        width: 80px; height: 80px; border-radius: 50%;
        border: 3px solid var(--accent); display: flex;
        align-items: center; justify-content: center;
        margin: 0 auto 4px; font-family: "Playfair Display", serif;
        font-size: 1.8rem; font-weight: 700; color: var(--accent);
        letter-spacing: 2px;
      }
      .sidebar h2 {
        font-size: 0.68rem; text-transform: uppercase;
        letter-spacing: 2.5px; color: var(--accent);
        margin-bottom: 10px; padding-bottom: 5px;
        border-bottom: 1px solid rgba(200,164,90,0.3); font-weight: 600;
      }
      .sidebar .contact-list {
        list-style: none; display: flex; flex-direction: column;
        gap: 8px; font-size: 0.78rem; line-height: 1.4;
      }
      .sidebar .contact-list li {
        display: flex; align-items: flex-start; gap: 8px;
      }
      .sidebar .contact-list .icon {
        flex-shrink: 0; width: 16px; text-align: center;
        color: var(--accent); font-size: 0.82rem; margin-top: 1px;
      }
      .sidebar .skill-group { margin-bottom: 2px; }
      .sidebar .skill-group h3 {
        font-size: 0.68rem; text-transform: uppercase;
        letter-spacing: 1.2px; color: #bcc5d6;
        margin-bottom: 6px; font-weight: 500;
      }
      .sidebar .skill-list {
        list-style: none; display: flex; flex-direction: column; gap: 4px;
      }
      .sidebar .skill-list li {
        font-size: 0.76rem; padding-left: 12px;
        position: relative; line-height: 1.4;
      }
      .sidebar .skill-list li::before {
        content: ""; position: absolute; left: 0; top: 6px;
        width: 4px; height: 4px; background: var(--accent);
        border-radius: 50%;
      }
      .sidebar .tools-grid { display: flex; flex-wrap: wrap; gap: 4px; }
      .sidebar .tools-grid span {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.12);
        padding: 2px 8px; border-radius: 3px;
        font-size: 0.68rem; letter-spacing: 0.3px; color: #cdd5e0;
      }
      .sidebar .lang-item, .sidebar .info-item {
        font-size: 0.78rem; margin-bottom: 3px;
      }
      .sidebar .lang-item strong, .sidebar .info-item strong {
        color: #fff; font-weight: 500;
      }
      .sidebar .interests { display: flex; flex-wrap: wrap; gap: 5px; }
      .sidebar .interests span {
        background: rgba(200,164,90,0.15);
        border: 1px solid rgba(200,164,90,0.25);
        color: var(--accent); padding: 2px 9px; border-radius: 20px;
        font-size: 0.68rem; font-weight: 500; letter-spacing: 0.3px;
      }
      .main {
        padding: 32px 30px 24px; display: flex;
        flex-direction: column; gap: var(--section-gap);
      }
      .header h1 {
        font-family: "Playfair Display", serif; font-size: 1.7rem;
        font-weight: 700; color: var(--navy);
        letter-spacing: 0.5px; line-height: 1.15;
      }
      .header .title {
        font-size: 0.88rem; font-weight: 500; color: var(--accent);
        text-transform: uppercase; letter-spacing: 2px; margin-top: 3px;
      }
      .header .accroche {
        margin-top: 10px; font-size: 0.78rem; color: var(--text-light);
        line-height: 1.55; border-left: 3px solid var(--accent);
        padding-left: 12px;
      }
      .main .section-title {
        font-size: 0.68rem; text-transform: uppercase;
        letter-spacing: 2.5px; color: var(--navy); font-weight: 700;
        padding-bottom: 6px; border-bottom: 2px solid var(--navy);
        margin-bottom: 14px;
      }
      .experience { margin-bottom: 16px; }
      .experience:last-child { margin-bottom: 0; }
      .experience .exp-header {
        display: flex; justify-content: space-between;
        align-items: baseline; flex-wrap: wrap; gap: 4px; margin-bottom: 1px;
      }
      .experience .company {
        font-size: 0.85rem; font-weight: 700; color: var(--navy);
      }
      .experience .dates {
        font-size: 0.7rem; color: var(--text-light);
        font-weight: 500; white-space: nowrap;
      }
      .experience .role {
        font-size: 0.78rem; font-weight: 500;
        color: var(--accent); margin-bottom: 1px;
      }
      .experience .location {
        font-size: 0.7rem; color: var(--text-light); margin-bottom: 5px;
      }
      .experience .tasks {
        list-style: none; display: flex; flex-direction: column; gap: 3px;
      }
      .experience .tasks li {
        font-size: 0.74rem; line-height: 1.45;
        padding-left: 12px; position: relative; color: var(--text);
      }
      .experience .tasks li::before {
        content: ""; position: absolute; left: 0; top: 6px;
        width: 4px; height: 4px; border: 1.5px solid var(--accent);
        border-radius: 50%;
      }
      .experience .tasks li strong { color: var(--navy); font-weight: 600; }
      .formation-item {
        margin-bottom: 8px; display: flex; justify-content: space-between;
        align-items: baseline; flex-wrap: wrap; gap: 4px;
      }
      .formation-item .diploma {
        font-size: 0.8rem; font-weight: 600; color: var(--navy);
      }
      .formation-item .school {
        font-size: 0.75rem; color: var(--text-light);
      }
      .formation-item .year {
        font-size: 0.74rem; font-weight: 600; color: var(--accent);
        white-space: nowrap;
      }
      @page { size: A4; margin: 0; }
      @media print {
        body { background: none; margin: 0; }
        .page { margin: 0; box-shadow: none; height: auto; width: 100%; }
        .sidebar { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <aside class="sidebar">
        <div style="text-align:center">
          <div class="initials">${esc(p.initials)}</div>
        </div>
        <section>
          <h2>Contact</h2>
          <ul class="contact-list">
            <li><span class="icon">&#9993;</span> ${esc(p.email)}</li>
            <li><span class="icon">&#9742;</span> ${esc(p.phone)}</li>
            <li><span class="icon">&#9873;</span> ${esc(p.location)}</li>
          </ul>
        </section>
        <section>
          <h2>Comp\u00e9tences cl\u00e9s</h2>
          ${skillsHtml}
        </section>
        <section>
          <h2>Qualit\u00e9s</h2>
          <ul class="skill-list">${qualitiesHtml}</ul>
        </section>
        <section>
          <h2>Logiciels &amp; outils</h2>
          <div class="tools-grid">${toolsHtml}</div>
        </section>
        <section>
          <h2>Langues</h2>
          ${languagesHtml}
        </section>
        <section>
          <h2>Informations</h2>
          ${extraInfoHtml}
        </section>
        <section>
          <h2>Centres d'int\u00e9r\u00eat</h2>
          <div class="interests">${interestsHtml}</div>
        </section>
      </aside>
      <main class="main">
        <header class="header">
          <h1>${esc(p.fullName)}</h1>
          <div class="title">${esc(p.jobTitle)}</div>
          <p class="accroche">${esc(p.accroche)}</p>
        </header>
        <section>
          <h2 class="section-title">Parcours professionnel</h2>
          ${experiencesHtml}
        </section>
        <section>
          <h2 class="section-title">Formation</h2>
          ${educationHtml}
        </section>
      </main>
    </div>
  </body>
</html>`;
}

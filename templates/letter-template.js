export function generateLetter({
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
}) {
  const displayDate =
    date ||
    new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const displayRecruiter = recruiter || "Madame, Monsieur";
  const displayReference = reference ? ` — Réf. ${reference}` : "";

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lettre de Motivation — Marie Julien</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      :root {
        --navy: #1a2744;
        --navy-light: #2a3f6a;
        --accent: #c8a45a;
        --accent-light: #f5edda;
        --text: #2c2c2c;
        --text-light: #5a5a5a;
        --bg: #ffffff;
        --border: #e2e2e2;
      }

      html {
        font-size: 15px;
      }

      body {
        font-family:
          "Inter",
          -apple-system,
          BlinkMacSystemFont,
          sans-serif;
        color: var(--text);
        background: #ffffff;
        line-height: 1.55;
        -webkit-font-smoothing: antialiased;
      }

      .page {
        max-width: 850px;
        margin: 0 auto;
        background: var(--bg);
        min-height: 1180px;
        display: flex;
        flex-direction: column;
      }

      .letter-header {
        background: var(--navy);
        color: #e8e8e8;
        padding: 36px 48px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
      }

      .sender-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .sender-name {
        font-family: "Playfair Display", serif;
        font-size: 1.6rem;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.5px;
        line-height: 1.2;
      }

      .sender-title {
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-top: 2px;
      }

      .sender-contact {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 10px;
        font-size: 0.78rem;
        color: #c8d0dc;
      }

      .sender-contact li {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .sender-contact .icon {
        color: var(--accent);
        font-size: 0.82rem;
        width: 16px;
        text-align: center;
        flex-shrink: 0;
      }

      .header-accent {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        border: 3px solid var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "Playfair Display", serif;
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--accent);
        letter-spacing: 2px;
        flex-shrink: 0;
      }

      .accent-bar {
        height: 4px;
        background: linear-gradient(90deg, var(--accent), var(--accent-light));
      }

      .letter-body {
        padding: 36px 48px 40px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .meta-block {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
      }

      .recipient {
        font-size: 0.85rem;
        line-height: 1.55;
        color: var(--text);
      }

      .recipient strong {
        color: var(--navy);
        font-weight: 600;
      }

      .date-location {
        font-size: 0.82rem;
        color: var(--text-light);
        text-align: right;
        white-space: nowrap;
      }

      .object-line {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--navy);
        margin-bottom: 28px;
        padding: 10px 16px;
        background: var(--accent-light);
        border-left: 4px solid var(--accent);
        border-radius: 0 4px 4px 0;
      }

      .object-line span {
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.7rem;
        color: var(--accent);
        margin-right: 8px;
      }

      .salutation {
        font-size: 0.88rem;
        margin-bottom: 18px;
        color: var(--text);
      }

      .letter-paragraph {
        font-size: 0.85rem;
        line-height: 1.58;
        color: var(--text);
        margin-bottom: 16px;
        text-align: left;
      }

      .letter-paragraph strong {
        color: var(--navy);
        font-weight: 600;
      }

      .closing {
        margin-top: 12px;
        font-size: 0.85rem;
        line-height: 1.65;
        color: var(--text);
      }

      .signature-block {
        margin-top: 28px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }

      .signature-name {
        font-family: "Playfair Display", serif;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--navy);
      }

      .signature-title {
        font-size: 0.75rem;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 1.5px;
        font-weight: 500;
      }

      .letter-footer {
        background: var(--navy);
        padding: 14px 48px;
        display: flex;
        justify-content: center;
        gap: 32px;
        font-size: 0.7rem;
        color: #8a95a8;
        letter-spacing: 0.3px;
      }

      .letter-footer .icon {
        color: var(--accent);
        margin-right: 6px;
      }

      @page {
        size: A4;
        margin: 0;
      }

      @media print {
        body {
          background: none;
          margin: 0;
        }
        .page {
          margin: 0;
          box-shadow: none;
          min-height: auto;
          width: 100%;
        }
        .letter-header,
        .letter-footer {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="letter-header">
        <div class="sender-info">
          <div class="sender-name">Marie Julien</div>
          <div class="sender-title">Coordinatrice de Projets</div>
          <ul class="sender-contact">
            <li><span class="icon">&#9993;</span> julien.marie2@gmail.com</li>
            <li><span class="icon">&#9742;</span> +33 6 18 87 74 48</li>
            <li><span class="icon">&#9873;</span> Helstroff, France</li>
          </ul>
        </div>
        <div class="header-accent">MJ</div>
      </header>

      <div class="accent-bar"></div>

      <div class="letter-body">
        <div class="meta-block">
          <div class="recipient">
            <strong>${escapeHtml(displayRecruiter)}</strong><br />
            ${escapeHtml(company)}<br />
            ${escapeHtml(address)}<br />
            ${escapeHtml(postalCode)} ${escapeHtml(city)}
          </div>
          <div class="date-location">Helstroff, le ${escapeHtml(displayDate)}</div>
        </div>

        <div class="object-line">
          <span>Objet :</span> Candidature au poste de ${escapeHtml(jobTitle)}${escapeHtml(displayReference)}
        </div>

        <p class="salutation">Madame, Monsieur,</p>

        <p class="letter-paragraph">
          Votre offre pour le poste de <strong>${escapeHtml(jobTitle)}</strong> a
          imm\u00e9diatement retenu mon attention. Forte de plus de 10 ans
          d'exp\u00e9rience en coordination de projets, gestion administrative et
          pilotage op\u00e9rationnel, je suis convaincue que mon profil correspond
          aux exigences de ce poste et aux ambitions de
          <strong>${escapeHtml(company)}</strong>.
        </p>

        <p class="letter-paragraph">
          Actuellement Coordinatrice de Projets Travaux &amp; Chantiers chez
          <strong>BGL BNP Paribas</strong>, je pilote au quotidien des projets
          complexes et pluridisciplinaires dans le cadre du projet
          seKoia/CBKIII. Je coordonne des \u00e9quipes multi-acteurs (bureaux
          d'\u00e9tudes, architectes, fournisseurs), je g\u00e8re les dossiers de la
          commande \u00e0 la r\u00e9ception, et j'assure le suivi administratif et
          financier via des outils tels que SAP, SharePoint et Axeobim. Cette
          exp\u00e9rience m'a permis de d\u00e9velopper une
          <strong>rigueur organisationnelle</strong> et une
          <strong>capacit\u00e9 d'adaptation</strong> que je souhaite mettre au
          service de votre structure.
        </p>

        <p class="letter-paragraph">
          ${escapeHtml(skillsParagraph)}
        </p>

        <p class="letter-paragraph">
          ${escapeHtml(motivationParagraph)}
        </p>

        <p class="closing">
          Dans l'attente de votre retour, je vous prie d'agr\u00e9er, Madame,
          Monsieur, l'expression de mes salutations distingu\u00e9es.
        </p>

        <div class="signature-block">
          <div class="signature-name">Marie Julien</div>
          <div class="signature-title">Coordinatrice de Projets</div>
        </div>
      </div>

      <footer class="letter-footer">
        <span><span class="icon">&#9993;</span>julien.marie2@gmail.com</span>
        <span><span class="icon">&#9742;</span>+33 6 18 87 74 48</span>
        <span><span class="icon">&#9873;</span>Helstroff, France</span>
      </footer>
    </div>
  </body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

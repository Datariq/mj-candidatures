export function generateCV() {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CV — Marie Julien | Coordinatrice de Projets</title>
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
        --section-gap: 28px;
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
        display: grid;
        grid-template-columns: 260px 1fr;
        min-height: 1180px;
      }

      /* ── SIDEBAR ── */
      .sidebar {
        background: var(--navy);
        color: #e8e8e8;
        padding: 40px 24px 32px;
        display: flex;
        flex-direction: column;
        gap: var(--section-gap);
      }

      .sidebar .initials {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        border: 3px solid var(--accent);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 4px;
        font-family: "Playfair Display", serif;
        font-size: 2rem;
        font-weight: 700;
        color: var(--accent);
        letter-spacing: 2px;
      }

      .sidebar h2 {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 2.5px;
        color: var(--accent);
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid rgba(200, 164, 90, 0.3);
        font-weight: 600;
      }

      .sidebar .contact-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-size: 0.82rem;
        line-height: 1.45;
      }

      .sidebar .contact-list li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .sidebar .contact-list .icon {
        flex-shrink: 0;
        width: 16px;
        text-align: center;
        color: var(--accent);
        font-size: 0.85rem;
        margin-top: 1px;
      }

      .sidebar .skill-group {
        margin-bottom: 2px;
      }

      .sidebar .skill-group h3 {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: #bcc5d6;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .sidebar .skill-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .sidebar .skill-list li {
        font-size: 0.8rem;
        padding-left: 12px;
        position: relative;
        line-height: 1.45;
      }

      .sidebar .skill-list li::before {
        content: "";
        position: absolute;
        left: 0;
        top: 7px;
        width: 4px;
        height: 4px;
        background: var(--accent);
        border-radius: 50%;
      }

      .sidebar .tools-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .sidebar .tools-grid span {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 3px 9px;
        border-radius: 3px;
        font-size: 0.72rem;
        letter-spacing: 0.3px;
        color: #cdd5e0;
      }

      .sidebar .lang-item,
      .sidebar .info-item {
        font-size: 0.82rem;
        margin-bottom: 4px;
      }

      .sidebar .lang-item strong,
      .sidebar .info-item strong {
        color: #fff;
        font-weight: 500;
      }

      .sidebar .interests {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .sidebar .interests span {
        background: rgba(200, 164, 90, 0.15);
        border: 1px solid rgba(200, 164, 90, 0.25);
        color: var(--accent);
        padding: 3px 10px;
        border-radius: 20px;
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.3px;
      }

      /* ── MAIN ── */
      .main {
        padding: 40px 36px 32px;
        display: flex;
        flex-direction: column;
        gap: var(--section-gap);
      }

      .header h1 {
        font-family: "Playfair Display", serif;
        font-size: 1.85rem;
        font-weight: 700;
        color: var(--navy);
        letter-spacing: 0.5px;
        line-height: 1.15;
      }

      .header .title {
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-top: 4px;
      }

      .header .accroche {
        margin-top: 14px;
        font-size: 0.85rem;
        color: var(--text-light);
        line-height: 1.65;
        border-left: 3px solid var(--accent);
        padding-left: 14px;
      }

      .main .section-title {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 2.5px;
        color: var(--navy);
        font-weight: 700;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--navy);
        margin-bottom: 18px;
      }

      .experience {
        margin-bottom: 22px;
      }
      .experience:last-child {
        margin-bottom: 0;
      }

      .experience .exp-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 2px;
      }

      .experience .company {
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--navy);
      }

      .experience .dates {
        font-size: 0.75rem;
        color: var(--text-light);
        font-weight: 500;
        white-space: nowrap;
      }

      .experience .role {
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--accent);
        margin-bottom: 1px;
      }

      .experience .location {
        font-size: 0.75rem;
        color: var(--text-light);
        margin-bottom: 8px;
      }

      .experience .tasks {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .experience .tasks li {
        font-size: 0.8rem;
        line-height: 1.55;
        padding-left: 14px;
        position: relative;
        color: var(--text);
      }

      .experience .tasks li::before {
        content: "";
        position: absolute;
        left: 0;
        top: 7px;
        width: 5px;
        height: 5px;
        border: 1.5px solid var(--accent);
        border-radius: 50%;
      }

      .experience .tasks li strong {
        color: var(--navy);
        font-weight: 600;
      }

      .formation-item {
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 4px;
      }

      .formation-item .diploma {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--navy);
      }

      .formation-item .school {
        font-size: 0.8rem;
        color: var(--text-light);
      }

      .formation-item .year {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--accent);
        white-space: nowrap;
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
        .sidebar {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <aside class="sidebar">
        <div style="text-align: center">
          <div class="initials">MJ</div>
        </div>

        <section>
          <h2>Contact</h2>
          <ul class="contact-list">
            <li><span class="icon">&#9993;</span> julien.marie2@gmail.com</li>
            <li><span class="icon">&#9742;</span> +33 6 18 87 74 48</li>
            <li><span class="icon">&#9873;</span> France / Helstroff</li>
          </ul>
        </section>

        <section>
          <h2>Comp\u00e9tences cl\u00e9s</h2>
          <div class="skill-group">
            <h3>Pilotage</h3>
            <ul class="skill-list">
              <li>Coordination et pilotage de projets</li>
              <li>Suivi de chantiers (commande &rarr; r\u00e9ception)</li>
              <li>Gestion administrative et documentaire</li>
              <li>Gestion financi\u00e8re et conformit\u00e9</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>Qualit\u00e9s</h2>
          <ul class="skill-list">
            <li>Rigueur et organisation</li>
            <li>Communication et relationnel</li>
            <li>R\u00e9activit\u00e9 et adaptabilit\u00e9</li>
            <li>Esprit d'\u00e9quipe et leadership</li>
          </ul>
        </section>

        <section>
          <h2>Logiciels &amp; outils</h2>
          <div class="tools-grid">
            <span>MS Project</span>
            <span>SAP</span>
            <span>Excel</span>
            <span>Word</span>
            <span>PowerPoint</span>
            <span>SharePoint</span>
            <span>Teams</span>
            <span>Outlook</span>
            <span>Axeobim</span>
            <span>Planon</span>
          </div>
        </section>

        <section>
          <h2>Langues</h2>
          <div class="lang-item">
            <strong>Fran\u00e7ais</strong> — Langue maternelle
          </div>
        </section>

        <section>
          <h2>Informations</h2>
          <div class="info-item"><strong>Permis B</strong></div>
        </section>

        <section>
          <h2>Centres d'int\u00e9r\u00eat</h2>
          <div class="interests">
            <span>\u00c9quitation</span>
            <span>Randonn\u00e9e</span>
            <span>Voyages</span>
          </div>
        </section>
      </aside>

      <main class="main">
        <header class="header">
          <h1>Marie Julien</h1>
          <div class="title">Coordinatrice de Projets</div>
          <p class="accroche">
            Forte de plus de 10 ans d'exp\u00e9rience en gestion administrative,
            coordination multi-acteurs et pilotage op\u00e9rationnel, je mets ma
            rigueur et mon sens de l'organisation au service de chaque projet.
            Comp\u00e9tente en gestion administrative, financi\u00e8re et documentaire, je
            m'adapte rapidement \u00e0 des environnements exigeants et
            pluridisciplinaires.
          </p>
        </header>

        <section>
          <h2 class="section-title">Parcours professionnel</h2>

          <div class="experience">
            <div class="exp-header">
              <span class="company">BGL BNP Paribas</span>
              <span class="dates">05/2023 — Aujourd'hui</span>
            </div>
            <div class="role">
              Coordinatrice de Projets Travaux &amp; Chantiers — Projet seKoia /
              CBKIII
            </div>
            <div class="location">Luxembourg | CDI</div>
            <ul class="tasks">
              <li>
                <strong>Coordination &amp; pilotage</strong> : suivi
                op\u00e9rationnel des chantiers, coordination interne et
                multi-acteurs (bureaux d'\u00e9tudes, architectes, fournisseurs),
                animation des r\u00e9unions projets, gestion et r\u00e9solution des
                litiges
              </li>
              <li>
                <strong>Suivi de chantiers</strong> : pilotage des dossiers de
                la commande \u00e0 la r\u00e9ception, appels d'offres, comptes rendus,
                relation client tout au long du projet
              </li>
              <li>
                <strong>Gestion administrative</strong> : instruction et suivi
                des dossiers administratifs, gestion documentaire
                multi-plateforme (SharePoint, Axeobim), autorisations de travail
              </li>
              <li>
                <strong>Gestion financi\u00e8re</strong> : contr\u00f4le et conformit\u00e9 des
                factures, encodage SAP, mise en paiement, pr\u00e9paration et
                pr\u00e9sentation des achats en comit\u00e9
              </li>
            </ul>
          </div>

          <div class="experience">
            <div class="exp-header">
              <span class="company">Rollinger (CFM Van Marcke)</span>
              <span class="dates">09/2022 — 04/2023</span>
            </div>
            <div class="role">
              Gestionnaire de Commandes &amp; Approvisionnement
            </div>
            <div class="location">Luxembourg | CDD</div>
            <ul class="tasks">
              <li>
                <strong>Approvisionnement</strong> : d\u00e9finition et passation des
                commandes selon l'\u00e9tat des stocks et les besoins chantier
              </li>
              <li>
                <strong>Suivi op\u00e9rationnel</strong> : avancement, r\u00e9ception,
                gestion des anomalies et substitution de produits
              </li>
              <li>
                <strong>Litiges &amp; SAV</strong> : gestion des litiges
                fournisseurs, r\u00e9solution dans les d\u00e9lais impartis
              </li>
            </ul>
          </div>

          <div class="experience">
            <div class="exp-header">
              <span class="company">CFM Van Marcke</span>
              <span class="dates">04/2022 — 09/2022</span>
            </div>
            <div class="role">
              Assistante Administrative — D\u00e9partement Product Data
            </div>
            <div class="location">Luxembourg | Int\u00e9rim</div>
            <ul class="tasks">
              <li>
                <strong>Gestion de donn\u00e9es SAP</strong> : encodage et mise \u00e0
                jour des articles (marges, prix, r\u00e9f\u00e9rencement)
              </li>
              <li>
                <strong>Suivi des commandes</strong> : gestion des blocages
                offres et commandes, fiabilisation des donn\u00e9es produits
              </li>
            </ul>
          </div>

          <div class="experience">
            <div class="exp-header">
              <span class="company">ANAH — Agence Nationale de l'Habitat</span>
              <span class="dates">06/2021 — 12/2021</span>
            </div>
            <div class="role">Assistante Administrative</div>
            <div class="location">Metz, France | Int\u00e9rim</div>
            <ul class="tasks">
              <li>
                <strong>Instruction de dossiers</strong> : instruction des
                dossiers pour les demandes de subventions
              </li>
              <li>
                <strong>Suivi administratif</strong> : relation avec les
                b\u00e9n\u00e9ficiaires, collecte et contr\u00f4le des pi\u00e8ces
              </li>
            </ul>
          </div>

          <div class="experience">
            <div class="exp-header">
              <span class="company">Sthenagor</span>
              <span class="dates">02/2015 — 06/2021</span>
            </div>
            <div class="role">Assistante Administrative et Marketing</div>
            <div class="location">Metz, France | CDI</div>
            <ul class="tasks">
              <li>
                <strong>Gestion administrative</strong> : suivi des dossiers,
                reporting, liaison inter-services
              </li>
              <li>
                <strong>Gestion de projets marketing</strong> : planification,
                suivi des actions, coordination prestataires
              </li>
              <li>
                <strong>Suivi commercial</strong> : relation
                clients/fournisseurs, facturation
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 class="section-title">Formation</h2>
          <div class="formation-item">
            <div>
              <div class="diploma">Certification Comptabilit\u00e9</div>
              <div class="school">CCI Metz</div>
            </div>
            <span class="year">2016</span>
          </div>
          <div class="formation-item">
            <div>
              <div class="diploma">Licence en Droit</div>
              <div class="school">Universit\u00e9 de Lorraine, Metz</div>
            </div>
            <span class="year">2014</span>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>`;
}

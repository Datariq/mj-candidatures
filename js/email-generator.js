export function generateEmailText({ jobTitle, company, recruiter }) {
  const greeting = recruiter ? `${recruiter}` : "Madame, Monsieur";

  return `Objet : Candidature — ${jobTitle} — Marie Julien

${greeting},

Veuillez trouver ci-joint ma candidature pour le poste de ${jobTitle} au sein de ${company}.

Mon CV ainsi que ma lettre de motivation détaillent mon parcours de plus de 10 ans en coordination de projets, gestion administrative et pilotage opérationnel, notamment chez BGL BNP Paribas où je gère actuellement des projets complexes et pluridisciplinaires.

Je serais ravie d'échanger avec vous afin de vous présenter plus en détail ma candidature.

Cordialement,
Marie Julien
+33 6 18 87 74 48
julien.marie2@gmail.com`;
}

export function generateMailtoLink({ jobTitle, company, recruiter }) {
  const subject = encodeURIComponent(
    `Candidature — ${jobTitle} — Marie Julien`,
  );
  const greeting = recruiter ? recruiter : "Madame, Monsieur";
  const body = encodeURIComponent(`${greeting},

Veuillez trouver ci-joint ma candidature pour le poste de ${jobTitle} au sein de ${company}.

Mon CV ainsi que ma lettre de motivation détaillent mon parcours de plus de 10 ans en coordination de projets, gestion administrative et pilotage opérationnel, notamment chez BGL BNP Paribas où je gère actuellement des projets complexes et pluridisciplinaires.

Je serais ravie d'échanger avec vous afin de vous présenter plus en détail ma candidature.

Cordialement,
Marie Julien
+33 6 18 87 74 48
julien.marie2@gmail.com`);

  return `mailto:?subject=${subject}&body=${body}`;
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;left:-9999px;";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
}

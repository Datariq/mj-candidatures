export function generateEmailText({ jobTitle, company, recruiter }, profile) {
  const p = profile;
  const greeting = recruiter ? `${recruiter}` : "Madame, Monsieur";
  const body = p.emailBody || "";

  return `Objet : Candidature \u2014 ${jobTitle} \u2014 ${p.fullName}

${greeting},

Veuillez trouver ci-joint ma candidature pour le poste de ${jobTitle} au sein de ${company}.

${body}

Je serais ravie d\u2019\u00e9changer avec vous afin de vous pr\u00e9senter plus en d\u00e9tail ma candidature.

Cordialement,
${p.fullName}
${p.phone}
${p.email}`;
}

export function generateMailtoLink({ jobTitle, company, recruiter }, profile) {
  const p = profile;
  const subject = encodeURIComponent(
    `Candidature \u2014 ${jobTitle} \u2014 ${p.fullName}`,
  );
  const greeting = recruiter ? recruiter : "Madame, Monsieur";
  const body = p.emailBody || "";

  const bodyText = encodeURIComponent(`${greeting},

Veuillez trouver ci-joint ma candidature pour le poste de ${jobTitle} au sein de ${company}.

${body}

Je serais ravie d\u2019\u00e9changer avec vous afin de vous pr\u00e9senter plus en d\u00e9tail ma candidature.

Cordialement,
${p.fullName}
${p.phone}
${p.email}`);

  return `mailto:?subject=${subject}&body=${bodyText}`;
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
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

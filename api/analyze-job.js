module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { url, profile } = req.body || {};

  // Validate URL
  if (!url || typeof url !== "string") {
    return res.status(422).json({ error: "URL manquante ou invalide" });
  }

  let parsed;
  try {
    parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
  } catch {
    return res.status(422).json({ error: "URL invalide" });
  }

  // Fetch the job page
  let html;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(parsed.href, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (err) {
    return res.status(422).json({
      error:
        "Impossible d'acceder a cette page : " + (err.message || "timeout"),
    });
  }

  // Strip HTML to plain text
  let text = html;
  // Remove script, style, nav, footer, header tags and their content
  text = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, " ");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, " ");
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  if (text.length < 50) {
    return res.status(422).json({
      error: "Le contenu de la page est trop court pour etre analyse",
    });
  }

  // Truncate to 12000 chars
  text = text.slice(0, 12000);

  // Build profile context for OpenAI
  const profileContext = profile
    ? `
Profil de la candidate :
- Nom : ${profile.fullName || ""}
- Titre : ${profile.jobTitle || ""}
- Accroche : ${profile.accroche || ""}
- Experience actuelle : ${profile.letterExperience || ""}
- Competences : ${(profile.skills || []).map((s) => s.items?.join(", ")).join(" ; ")}
- Qualites : ${(profile.qualities || []).join(", ")}
- Outils : ${(profile.tools || []).join(", ")}
`
    : "";

  // Call OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Cle API OpenAI non configuree" });
  }

  try {
    const openaiRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `Tu es un assistant specialise dans l'analyse d'offres d'emploi.
A partir du texte d'une offre d'emploi, tu dois extraire les informations suivantes au format JSON :
{
  "company": "nom de l'entreprise",
  "address": "adresse postale (sans code postal ni ville)",
  "postalCode": "code postal",
  "city": "ville",
  "jobTitle": "intitule du poste",
  "reference": "reference de l'offre si disponible",
  "recruiter": "nom du recruteur si mentionne",
  "skillsParagraph": "un paragraphe personnalise de 3-4 phrases qui met en valeur les competences de la candidate en lien avec les exigences du poste",
  "motivationParagraph": "un paragraphe personnalise de 2-3 phrases qui exprime la motivation de la candidate pour ce poste et cette entreprise specifiquement"
}

Regles :
- Reponds UNIQUEMENT en JSON valide
- Si une information n'est pas trouvee, mets une chaine vide ""
- Les paragraphes skillsParagraph et motivationParagraph doivent etre rediges a la premiere personne du feminin
- Ils doivent etre specifiques a l'offre analysee et au profil fourni, pas generiques
- Utilise un ton professionnel et naturel
- Les paragraphes doivent mentionner le nom de l'entreprise et des elements concrets de l'offre
${profileContext}`,
            },
            {
              role: "user",
              content: `Voici le texte de l'offre d'emploi a analyser :\n\n${text}`,
            },
          ],
        }),
      },
    );

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error("OpenAI error:", openaiRes.status, errBody);
      return res.status(502).json({ error: "Erreur du service d'analyse IA" });
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: "Reponse vide du service IA" });
    }

    const result = JSON.parse(content);
    return res.status(200).json(result);
  } catch (err) {
    console.error("OpenAI call failed:", err);
    return res.status(502).json({ error: "Erreur lors de l'analyse IA" });
  }
};

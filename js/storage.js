import { supabase } from "./supabase-config.js";

// ── camelCase ↔ snake_case mapping ──

function toSnakeCase(data) {
  const map = {
    postalCode: "postal_code",
    jobTitle: "job_title",
    jobUrl: "job_url",
    motivationParagraph: "motivation_paragraph",
    skillsParagraph: "skills_paragraph",
    createdAt: "created_at",
  };
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    result[map[key] || key] = value;
  }
  return result;
}

function toCamelCase(row) {
  const map = {
    postal_code: "postalCode",
    job_title: "jobTitle",
    job_url: "jobUrl",
    motivation_paragraph: "motivationParagraph",
    skills_paragraph: "skillsParagraph",
    created_at: "createdAt",
    user_id: "userId",
  };
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    result[map[key] || key] = value;
  }
  return result;
}

// ── CRUD Applications ──

export async function createApplication(data) {
  const row = toSnakeCase(data);
  delete row.id;
  row.status = row.status || "brouillon";
  const { data: inserted, error } = await supabase
    .from("applications")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return inserted.id;
}

export async function getAllApplications() {
  const { data, error } = await supabase
    .from("applications")
    .select()
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(toCamelCase);
}

export async function getApplicationById(id) {
  const { data, error } = await supabase
    .from("applications")
    .select()
    .eq("id", id)
    .single();
  if (error) throw error;
  return toCamelCase(data);
}

export async function updateApplication(id, data) {
  const row = toSnakeCase(data);
  delete row.id;
  delete row.user_id;
  delete row.created_at;
  const { error } = await supabase
    .from("applications")
    .update(row)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteApplication(id) {
  const { data: user } = await supabase.auth.getUser();
  if (user?.user) {
    const folder = `${user.user.id}/${id}`;
    const { data: files } = await supabase.storage
      .from("documents")
      .list(folder);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${folder}/${f.name}`);
      await supabase.storage.from("documents").remove(paths);
    }
  }
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw error;
}

// ── Storage (PDF documents) ──

export async function uploadDocument(blob, applicationId, filename) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error("Not authenticated");
  const path = `${user.user.id}/${applicationId}/${filename}`;
  const { error } = await supabase.storage
    .from("documents")
    .upload(path, blob, { upsert: true, contentType: "application/pdf" });
  if (error) throw error;
  return path;
}

export async function getDocumentUrl(path) {
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function listDocuments(applicationId) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];
  const folder = `${user.user.id}/${applicationId}`;
  const { data, error } = await supabase.storage.from("documents").list(folder);
  if (error) throw error;
  return (data || []).map((f) => ({
    name: f.name,
    path: `${folder}/${f.name}`,
  }));
}

// ── Profile ──

export const DEFAULT_PROFILE = {
  fullName: "Marie Julien",
  initials: "MJ",
  jobTitle: "Coordinatrice de Projets",
  email: "julien.marie2@gmail.com",
  phone: "+33 6 18 87 74 48",
  location: "Helstroff, France",
  letterIntro:
    "Votre offre pour le poste de {poste} a imm\u00e9diatement retenu mon attention. Forte de plus de 10 ans d\u2019exp\u00e9rience en coordination de projets, gestion administrative et pilotage op\u00e9rationnel, je suis convaincue que mon profil correspond aux exigences de ce poste et aux ambitions de {entreprise}.",
  letterExperience:
    "Actuellement Coordinatrice de Projets Travaux & Chantiers chez BGL BNP Paribas, je pilote au quotidien des projets complexes et pluridisciplinaires dans le cadre du projet seKoia/CBKIII. Je coordonne des \u00e9quipes multi-acteurs (bureaux d\u2019\u00e9tudes, architectes, fournisseurs), je g\u00e8re les dossiers de la commande \u00e0 la r\u00e9ception, et j\u2019assure le suivi administratif et financier via des outils tels que SAP, SharePoint et Axeobim. Cette exp\u00e9rience m\u2019a permis de d\u00e9velopper une rigueur organisationnelle et une capacit\u00e9 d\u2019adaptation que je souhaite mettre au service de votre structure.",
  emailBody:
    "Mon CV ainsi que ma lettre de motivation d\u00e9taillent mon parcours de plus de 10 ans en coordination de projets, gestion administrative et pilotage op\u00e9rationnel, notamment chez BGL BNP Paribas o\u00f9 je g\u00e8re actuellement des projets complexes et pluridisciplinaires.",
  accroche:
    "Forte de plus de 10 ans d\u2019exp\u00e9rience en gestion administrative, coordination multi-acteurs et pilotage op\u00e9rationnel, je mets ma rigueur et mon sens de l\u2019organisation au service de chaque projet. Comp\u00e9tente en gestion administrative, financi\u00e8re et documentaire, je m\u2019adapte rapidement \u00e0 des environnements exigeants et pluridisciplinaires.",
  skills: [
    {
      group: "Pilotage",
      items: [
        "Coordination et pilotage de projets",
        "Suivi de chantiers (commande \u2192 r\u00e9ception)",
        "Gestion administrative et documentaire",
        "Gestion financi\u00e8re et conformit\u00e9",
      ],
    },
  ],
  qualities: [
    "Rigueur et organisation",
    "Communication et relationnel",
    "R\u00e9activit\u00e9 et adaptabilit\u00e9",
    "Esprit d\u2019\u00e9quipe et leadership",
  ],
  tools: [
    "MS Project",
    "SAP",
    "Excel",
    "Word",
    "PowerPoint",
    "SharePoint",
    "Teams",
    "Outlook",
    "Axeobim",
    "Planon",
  ],
  languages: [{ name: "Fran\u00e7ais", level: "Langue maternelle" }],
  extraInfo: ["Permis B"],
  interests: ["\u00c9quitation", "Randonn\u00e9e", "Voyages"],
  experiences: [
    {
      company: "BGL BNP Paribas",
      dates: "05/2023 \u2014 Aujourd\u2019hui",
      role: "Coordinatrice de Projets Travaux & Chantiers \u2014 Projet seKoia / CBKIII",
      location: "Luxembourg | CDI",
      tasks: [
        "Coordination & pilotage : suivi op\u00e9rationnel des chantiers, coordination interne et multi-acteurs (bureaux d\u2019\u00e9tudes, architectes, fournisseurs), animation des r\u00e9unions projets, gestion et r\u00e9solution des litiges",
        "Suivi de chantiers : pilotage des dossiers de la commande \u00e0 la r\u00e9ception, appels d\u2019offres, comptes rendus, relation client tout au long du projet",
        "Gestion administrative : instruction et suivi des dossiers administratifs, gestion documentaire multi-plateforme (SharePoint, Axeobim), autorisations de travail",
        "Gestion financi\u00e8re : contr\u00f4le et conformit\u00e9 des factures, encodage SAP, mise en paiement, pr\u00e9paration et pr\u00e9sentation des achats en comit\u00e9",
      ],
    },
    {
      company: "Rollinger (CFM Van Marcke)",
      dates: "09/2022 \u2014 04/2023",
      role: "Gestionnaire de Commandes & Approvisionnement",
      location: "Luxembourg | CDD",
      tasks: [
        "Approvisionnement : d\u00e9finition et passation des commandes selon l\u2019\u00e9tat des stocks et les besoins chantier",
        "Suivi op\u00e9rationnel : avancement, r\u00e9ception, gestion des anomalies et substitution de produits",
        "Litiges & SAV : gestion des litiges fournisseurs, r\u00e9solution dans les d\u00e9lais impartis",
      ],
    },
    {
      company: "CFM Van Marcke",
      dates: "04/2022 \u2014 09/2022",
      role: "Assistante Administrative \u2014 D\u00e9partement Product Data",
      location: "Luxembourg | Int\u00e9rim",
      tasks: [
        "Gestion de donn\u00e9es SAP : encodage et mise \u00e0 jour des articles (marges, prix, r\u00e9f\u00e9rencement)",
        "Suivi des commandes : gestion des blocages offres et commandes, fiabilisation des donn\u00e9es produits",
      ],
    },
    {
      company: "ANAH \u2014 Agence Nationale de l\u2019Habitat",
      dates: "06/2021 \u2014 12/2021",
      role: "Assistante Administrative",
      location: "Metz, France | Int\u00e9rim",
      tasks: [
        "Instruction de dossiers : instruction des dossiers pour les demandes de subventions",
        "Suivi administratif : relation avec les b\u00e9n\u00e9ficiaires, collecte et contr\u00f4le des pi\u00e8ces",
      ],
    },
    {
      company: "Sthenagor",
      dates: "02/2015 \u2014 06/2021",
      role: "Assistante Administrative et Marketing",
      location: "Metz, France | CDI",
      tasks: [
        "Gestion administrative : suivi des dossiers, reporting, liaison inter-services",
        "Gestion de projets marketing : planification, suivi des actions, coordination prestataires",
        "Suivi commercial : relation clients/fournisseurs, facturation",
      ],
    },
  ],
  education: [
    {
      diploma: "Certification Comptabilit\u00e9",
      school: "CCI Metz",
      year: "2016",
    },
    {
      diploma: "Licence en Droit",
      school: "Universit\u00e9 de Lorraine, Metz",
      year: "2014",
    },
  ],
};

export async function getProfile() {
  const { data, error } = await supabase
    .from("profiles")
    .select("data")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...DEFAULT_PROFILE, ...data.data };
}

export async function saveProfile(profileData) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({ data: profileData, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("profiles")
      .insert({ data: profileData });
    if (error) throw error;
  }
}

// ── Statuses ──

export const STATUSES = [
  { value: "brouillon", label: "Brouillon", color: "#8a95a8" },
  { value: "envoy\u00e9e", label: "Envoy\u00e9e", color: "#3b82f6" },
  { value: "relanc\u00e9e", label: "Relanc\u00e9e", color: "#f59e0b" },
  { value: "entretien", label: "Entretien", color: "#8b5cf6" },
  { value: "refus\u00e9e", label: "Refus\u00e9e", color: "#ef4444" },
  { value: "accept\u00e9e", label: "Accept\u00e9e", color: "#22c55e" },
];

// src/types/index.ts

// Énumérations basées sur l'utilisation dans le script seed.ts et les besoins généraux de l'application.

export enum Role {
  ADMINISTRATEUR = "ADMINISTRATEUR",
  ENSEIGNANT = "ENSEIGNANT",
  APPRENANT = "APPRENANT", // Changé de ELEVE
  PARENT = "PARENT",       // Changé de PARENT_TUTEUR
}

export enum NiveauScolaire {
  SIXIEME = "SIXIEME",         // 7ème
  CINQUIEME = "CINQUIEME",     // 8ème
  QUATRIEME = "QUATRIEME",     // 9ème
  TROISIEME = "TROISIEME",
  SECONDE = "SECONDE",
  PREMIERE = "PREMIERE",
  TERMINALE = "TERMINALE",
  AUTRE = "AUTRE",
}

export enum TypeSalle {
  SALLE_CLASSE = "SALLE_CLASSE",
  LABORATOIRE = "LABORATOIRE", // Générique, peut être spécialisé si besoin
  LABORATOIRE_PHYSIQUE = "LABORATOIRE_PHYSIQUE",
  LABORATOIRE_CHIMIE = "LABORATOIRE_CHIMIE",
  LABORATOIRE_BIOLOGIE = "LABORATOIRE_BIOLOGIE",
  SALLE_INFORMATIQUE = "SALLE_INFORMATIQUE",
  GYMNASE = "GYMNASE",
  SALLE_SPECIALISEE = "SALLE_SPECIALISEE", // Pour arts, musique, etc.
  AMPHITHEATRE = "AMPHITHEATRE",
  BIBLIOTHEQUE = "BIBLIOTHEQUE",
  SALLE_MULTIMEDIA = "SALLE_MULTIMEDIA",
  ATELIER = "ATELIER",
  SALLE_DE_REUNION = "SALLE_DE_REUNION",
  BUREAU = "BUREAU",
}

export enum OptionEquipementSalle {
  VIDEO_PROJECTEUR = "VIDEO_PROJECTEUR",
  TABLEAU_BLANC = "TABLEAU_BLANC",
  TABLEAU_INTERACTIF = "TABLEAU_INTERACTIF",
  ORDINATEURS = "ORDINATEURS", // Remplacé ORDINATEURS_ET_LOGICIELS
  PROJECTEUR = "PROJECTEUR", // Si différent de VIDEO_PROJECTEUR
  IMPRIMANTE = "IMPRIMANTE",
  CONNEXION_INTERNET_HAUT_DEBIT = "CONNEXION_INTERNET_HAUT_DEBIT",
  PAILLASSES_LABORATOIRE = "PAILLASSES_LABORATOIRE",
  MATERIEL_LABO = "MATERIEL_LABO", // Matériel de laboratoire général
  HOTTE_ASPIRANTE = "HOTTE_ASPIRANTE",
  MATERIEL_DE_PROJECTION_AUDIOVISUEL = "MATERIEL_DE_PROJECTION_AUDIOVISUEL",
  MICROSCOPES = "MICROSCOPES",
  EQUIPEMENT_DE_CHIMIE = "EQUIPEMENT_DE_CHIMIE",
  EQUIPEMENT_DE_PHYSIQUE = "EQUIPEMENT_DE_PHYSIQUE",
  LOGICIELS_SPECIFIQUES = "LOGICIELS_SPECIFIQUES",
  EQUIPEMENT_SPORT = "EQUIPEMENT_SPORT", // Remplacé EQUIPEMENT_SPORTIF
  INSTRUMENTS_MUSIQUE = "INSTRUMENTS_MUSIQUE",
  POSTES_DE_TRAVAIL_INDIVIDUELS = "POSTES_DE_TRAVAIL_INDIVIDUELS",
}

export enum JourSemaine {
  LUNDI = "LUNDI",
  MARDI = "MARDI",
  MERCREDI = "MERCREDI",
  JEUDI = "JEUDI",
  VENDREDI = "VENDREDI",
  SAMEDI = "SAMEDI",
  DIMANCHE = "DIMANCHE",
}

export enum LienParente {
  PERE = "Père",
  MERE = "Mère",
  TUTEUR = "Tuteur",
  AUTRE = "Autre",
}

export enum DureeMatiere {
  UNE_HEURE = "UNE_HEURE",
  DEUX_HEURES = "DEUX_HEURES",
  // Potentiellement d'autres durées
}

export enum CategorieMatiere {
  MATHEMATIQUES = "MATHEMATIQUES",
  PHYSIQUE = "PHYSIQUE",
  CHIMIE = "CHIMIE",
  BIOLOGIE = "BIOLOGIE",
  LANGUE_ARABE = "LANGUE_ARABE",
  LANGUE_FRANCAISE = "LANGUE_FRANCAISE",
  LANGUE_ANGLAISE = "LANGUE_ANGLAISE",
  SCIENCES = "SCIENCES", // Pourrait être "Sciences de la Vie et de la Terre"
  HISTOIRE = "HISTOIRE",
  GEOGRAPHIE = "GEOGRAPHIE",
  HISTOIRE_GEOGRAPHIE = "HISTOIRE_GEOGRAPHIE", // Si combiné
  EDUCATION_CIVIQUE = "EDUCATION_CIVIQUE",
  EDUCATION_ISLAMIQUE = "EDUCATION_ISLAMIQUE",
  PHILOSOPHIE = "PHILOSOPHIE",
  ECONOMIE = "ECONOMIE",
  INFORMATIQUE = "INFORMATIQUE",
  SPORT = "SPORT", // ou EPS
  ARTS_PLASTIQUES = "ARTS_PLASTIQUES",
  MUSIQUE = "MUSIQUE",
  TECHNOLOGIE = "TECHNOLOGIE",
  AUTRE = "AUTRE",
}


export interface Utilisateur {
  id: string;
  nomUtilisateur: string;
  email: string;
  motDePasse: string; // En texte clair pour les mocks
  nom: string;
  prenom: string;
  role: Role;
  estActif: boolean; // Ajouté pour correspondre au seed, important
  creeLe: Date;
  misAJourLe: Date;
}

export interface Etablissement {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string; // Le seed utilisait emailContact, on standardise à email
}

export interface AnneeScolaire {
  id: string;
  annee: string; // Ex: "2023-2024"
  etablissementId: string;
  estCourante: boolean;
  dateDebut: Date;
  dateFin: Date;
}

export interface Periode {
  id: string;
  nom: string; // Ex: "Trimestre 1"
  anneeScolaireId: string;
  dateDebut: Date;
  dateFin: Date;
}

export interface ExigenceMatiere {
  heuresParSemaine: number;
  necessiteLabo: boolean;
  dureeMin: number; // en heures
  dureeMax: number; // en heures
  // typeSalleRequise?: TypeSalle; // Pourrait être utile plus tard
  // equipementsRequis?: OptionEquipementSalle[]; // Pourrait être utile plus tard
}

export interface Matiere {
  id: string;
  nom: string;
  code: string;
  duree: DureeMatiere;
  priorite: number;
  categorie: CategorieMatiere;
  etablissementId: string;
  requis: ExigenceMatiere;
  couleur?: string; // Ajouté depuis le seed
}

export interface Salle {
  id: string;
  nom: string;
  type: TypeSalle;
  capacite: number;
  equipements: OptionEquipementSalle[]; // Array de strings ou d'enums
  etablissementId: string;
}

export interface Enseignant {
  id: string;
  utilisateurId: string;
  etablissementId: string;
  jourPedagogique: JourSemaine;
  heuresMaxParJour: number;
  specialitePrincipale: string; // Le seed utilisait 'specialite'
  dateEmbauche: Date;
}

export interface MatiereEnseigneeParEnseignant {
  // id: string; // Souvent, les tables de jointure n'ont pas leur propre ID si la paire est unique
  enseignantId: string;
  matiereId: string;
  niveauxEnseignes: NiveauScolaire[]; // Le seed utilisait un simple 'niveau: number'
}

export interface Classe {
  id: string;
  nom: string;
  niveau: NiveauScolaire; // Le seed utilisait 'niveau: number'
  etablissementId: string;
  anneeScolaireId: string; // Important pour lier à une année spécifique
  capacite: number;
  professeurPrincipalId?: string; // Optionnel
}

export interface Apprenant { // Anciennement Eleve
  id: string;
  utilisateurId: string;
  classeId: string;
  parentId?: string; // Optionnel, pour lier à un Parent
  dateInscription: Date;
}

export interface Parent { // Anciennement ParentTuteur
  id: string;
  utilisateurId: string;
  lienParente: LienParente;
}


// Structure globale des données simulées
export interface MockData {
  utilisateurs: Utilisateur[];
  etablissements: Etablissement[];
  anneesScolaires: AnneeScolaire[];
  periodes: Periode[];
  matieres: Matiere[];
  salles: Salle[];
  enseignants: Enseignant[];
  matieresEnseignees: MatiereEnseigneeParEnseignant[];
  classes: Classe[];
  apprenants: Apprenant[];
  parents: Parent[];
}

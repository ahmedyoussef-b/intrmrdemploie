// src/lib/mock-data.ts
import { faker } from '@faker-js/faker/locale/fr';
import type {
  Utilisateur,
  Etablissement,
  AnneeScolaire,
  Periode,
  Matiere,
  ExigenceMatiere,
  Salle,
  Enseignant,
  MatiereEnseigneeParEnseignant,
  Classe,
  Apprenant,
  Parent,
  MockData,
} from '@/types';
import {
  Role,
  NiveauScolaire,
  TypeSalle,
  OptionEquipementSalle,
  JourSemaine,
  LienParente,
  DureeMatiere,
  CategorieMatiere,
} from '@/types';

function generateMockData(): MockData {
  const utilisateurs: Utilisateur[] = [];
  const etablissements: Etablissement[] = [];
  const anneesScolaires: AnneeScolaire[] = [];
  const periodes: Periode[] = [];
  const matieres: Matiere[] = [];
  const salles: Salle[] = [];
  const enseignants: Enseignant[] = [];
  const matieresEnseignees: MatiereEnseigneeParEnseignant[] = [];
  const classes: Classe[] = [];
  const apprenants: Apprenant[] = [];
  const parents: Parent[] = [];

  // --- Créer l'établissement ---
  const etablissement: Etablissement = {
    id: faker.string.uuid(),
    nom: "Collège Excellence (Mock)",
    adresse: "123 Avenue de l'Éducation, Ville Simulée",
    telephone: "0123456789",
    email: "contact@college-excellence-mock.edu",
  };
  etablissements.push(etablissement);

  // --- Créer l'année scolaire courante ---
  const anneeScolaire: AnneeScolaire = {
    id: faker.string.uuid(),
    annee: "2023-2024",
    etablissementId: etablissement.id,
    estCourante: true,
    dateDebut: new Date('2023-09-01'),
    dateFin: new Date('2024-06-30'),
  };
  anneesScolaires.push(anneeScolaire);

  // --- Créer 3 périodes (trimestres) ---
  const periodeData = [
    { nom: "Trimestre 1", dateDebut: new Date('2023-09-01'), dateFin: new Date('2023-12-20') },
    { nom: "Trimestre 2", dateDebut: new Date('2024-01-08'), dateFin: new Date('2024-03-30') },
    { nom: "Trimestre 3", dateDebut: new Date('2024-04-08'), dateFin: new Date('2024-06-30') },
  ];
  periodeData.forEach(p => {
    const periode: Periode = {
      id: faker.string.uuid(),
      nom: p.nom,
      anneeScolaireId: anneeScolaire.id,
      dateDebut: p.dateDebut,
      dateFin: p.dateFin,
    };
    periodes.push(periode);
  });

  // --- Créer les matières avec leurs exigences ---
  const matieresData: Omit<Matiere, 'id' | 'etablissementId'>[] = [
    { nom: "Mathématiques", code: "MATH", duree: DureeMatiere.UNE_HEURE, priorite: 1, categorie: CategorieMatiere.MATHEMATIQUES, requis: { heuresParSemaine: 4, necessiteLabo: false, dureeMin: 1, dureeMax: 2 } },
    { nom: "Physique", code: "PHYS", duree: DureeMatiere.UNE_HEURE, priorite: 2, categorie: CategorieMatiere.PHYSIQUE, requis: { heuresParSemaine: 3, necessiteLabo: true, dureeMin: 1, dureeMax: 2 } },
    { nom: "Langue Arabe", code: "ARAB", duree: DureeMatiere.UNE_HEURE, priorite: 1, categorie: CategorieMatiere.LANGUE_ARABE, requis: { heuresParSemaine: 4, necessiteLabo: false, dureeMin: 1, dureeMax: 2 } },
    { nom: "Langue Française", code: "FRAN", duree: DureeMatiere.UNE_HEURE, priorite: 2, categorie: CategorieMatiere.LANGUE_FRANCAISE, requis: { heuresParSemaine: 3, necessiteLabo: false, dureeMin: 1, dureeMax: 2 } },
    { nom: "Langue Anglaise", code: "ANGL", duree: DureeMatiere.UNE_HEURE, priorite: 2, categorie: CategorieMatiere.LANGUE_ANGLAISE, requis: { heuresParSemaine: 3, necessiteLabo: false, dureeMin: 1, dureeMax: 2 } },
    { nom: "Sciences", code: "SCIE", duree: DureeMatiere.UNE_HEURE, priorite: 2, categorie: CategorieMatiere.SCIENCES, requis: { heuresParSemaine: 2, necessiteLabo: true, dureeMin: 1, dureeMax: 2 } },
    { nom: "Histoire-Géographie", code: "HIST", duree: DureeMatiere.UNE_HEURE, priorite: 3, categorie: CategorieMatiere.HISTOIRE, requis: { heuresParSemaine: 2, necessiteLabo: false, dureeMin: 1, dureeMax: 2 } },
    { nom: "Éducation Islamique", code: "ISLA", duree: DureeMatiere.UNE_HEURE, priorite: 3, categorie: CategorieMatiere.EDUCATION_ISLAMIQUE, requis: { heuresParSemaine: 2, necessiteLabo: false, dureeMin: 1, dureeMax: 2 } },
    { nom: "Informatique", code: "INFO", duree: DureeMatiere.UNE_HEURE, priorite: 3, categorie: CategorieMatiere.INFORMATIQUE, requis: { heuresParSemaine: 1, necessiteLabo: true, dureeMin: 1, dureeMax: 2 } },
    { nom: "Sport", code: "SPOR", duree: DureeMatiere.UNE_HEURE, priorite: 3, categorie: CategorieMatiere.SPORT, requis: { heuresParSemaine: 2, necessiteLabo: false, dureeMin: 1, dureeMax: 2 } },
  ];

  matieresData.forEach(m => {
    const matiere: Matiere = {
      id: faker.string.uuid(),
      etablissementId: etablissement.id,
      ...m,
      couleur: faker.vehicle.color(), // Ajout d'une couleur aléatoire
    };
    matieres.push(matiere);
  });

  // --- Créer 20 salles ---
  Array.from({ length: 20 }).forEach((_, i) => {
    const typesSalle: TypeSalle[] = [
      TypeSalle.SALLE_CLASSE,
      TypeSalle.LABORATOIRE,
      TypeSalle.SALLE_INFORMATIQUE,
      TypeSalle.GYMNASE,
      TypeSalle.SALLE_SPECIALISEE,
    ];
    const type = typesSalle[i % typesSalle.length];
    let capacite = 30;
    let equipementsSalle: OptionEquipementSalle[] = [];

    if (type === TypeSalle.LABORATOIRE) {
      capacite = 20;
      equipementsSalle = [OptionEquipementSalle.MATERIEL_LABO, OptionEquipementSalle.PAILLASSES_LABORATOIRE];
    } else if (type === TypeSalle.SALLE_INFORMATIQUE) {
      equipementsSalle = [OptionEquipementSalle.ORDINATEURS, OptionEquipementSalle.PROJECTEUR];
    } else if (type === TypeSalle.GYMNASE) {
      capacite = 50;
      equipementsSalle = [OptionEquipementSalle.EQUIPEMENT_SPORT];
    } else if (type === TypeSalle.SALLE_CLASSE) {
      equipementsSalle = [OptionEquipementSalle.TABLEAU_BLANC, OptionEquipementSalle.VIDEO_PROJECTEUR];
    }

    const salle: Salle = {
      id: faker.string.uuid(),
      nom: `Salle ${i + 1}`,
      type,
      capacite,
      equipements: equipementsSalle,
      etablissementId: etablissement.id,
    };
    salles.push(salle);
  });

  // --- Créer les enseignants ---
  // Mapping des niveaux numériques du seed (7, 8, 9) aux enums NiveauScolaire
  const niveauxScolairesSeed: NiveauScolaire[] = [NiveauScolaire.SIXIEME, NiveauScolaire.CINQUIEME, NiveauScolaire.QUATRIEME];

  for (const matiere of matieres) {
    for (const niveau of niveauxScolairesSeed) {
      for (let i = 0; i < 3; i++) { // 3 enseignants par matière par niveau
        const nom = faker.person.lastName();
        const prenom = faker.person.firstName();
        const email = `${prenom.toLowerCase()}.${nom.toLowerCase()}@college-excellence-mock.edu`;

        const utilisateur: Utilisateur = {
          id: faker.string.uuid(),
          nomUtilisateur: `${prenom}.${nom}`,
          email,
          motDePasse: "Password123!", // Plain text for mock
          nom,
          prenom,
          role: Role.ENSEIGNANT,
          estActif: true,
          creeLe: new Date(),
          misAJourLe: new Date(),
        };
        utilisateurs.push(utilisateur);

        const enseignant: Enseignant = {
          id: faker.string.uuid(),
          utilisateurId: utilisateur.id,
          etablissementId: etablissement.id,
          jourPedagogique: JourSemaine.MERCREDI,
          heuresMaxParJour: 6,
          specialitePrincipale: matiere.nom,
          dateEmbauche: faker.date.past({years: 5}),
        };
        enseignants.push(enseignant);

        const matiereEnseignee: MatiereEnseigneeParEnseignant = {
          enseignantId: enseignant.id,
          matiereId: matiere.id,
          niveauxEnseignes: [niveau], // Le niveau spécifique pour cette instance
        };
        matieresEnseignees.push(matiereEnseignee);
      }
    }
  }

  // --- Créer les classes ---
  const lettresClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  for (const niveau of niveauxScolairesSeed) {
    for (let i = 0; i < 10; i++) { // 10 classes par niveau
      const classe: Classe = {
        id: faker.string.uuid(),
        nom: `${niveau} ${lettresClasses[i]}`,
        niveau,
        etablissementId: etablissement.id,
        anneeScolaireId: anneeScolaire.id,
        capacite: 30,
        professeurPrincipalId: undefined, // Sera défini ci-dessous
      };
      classes.push(classe);
    }
  }

  // Assigner des professeurs principaux aux classes
  for (const classe of classes) {
    const enseignantsPotentiels = enseignants.filter(ens => {
      const enseignement = matieresEnseignees.find(me => me.enseignantId === ens.id);
      return enseignement && enseignement.niveauxEnseignes.includes(classe.niveau);
    });

    if (enseignantsPotentiels.length > 0) {
      classe.professeurPrincipalId = faker.helpers.arrayElement(enseignantsPotentiels).id;
    }
  }

  // --- Créer les élèves (20 par classe) ---
  for (const classe of classes) {
    for (let i = 0; i < 20; i++) {
      const nom = faker.person.lastName();
      const prenom = faker.person.firstName();
      const email = `${prenom.toLowerCase()}.${nom.toLowerCase()}@eleve.college-excellence-mock.edu`;

      const utilisateur: Utilisateur = {
        id: faker.string.uuid(),
        nomUtilisateur: `${prenom}.${nom}`,
        email,
        motDePasse: "Password123!", // Plain text for mock
        nom,
        prenom,
        role: Role.APPRENANT, // Align on APPRENANT
        estActif: true,
        creeLe: new Date(),
        misAJourLe: new Date(),
      };
      utilisateurs.push(utilisateur);

      const apprenant: Apprenant = {
        id: faker.string.uuid(),
        utilisateurId: utilisateur.id,
        classeId: classe.id,
        dateInscription: new Date(),
        parentId: undefined, // Sera potentiellement lié ci-dessous
      };
      apprenants.push(apprenant);
    }
  }

  // --- Créer quelques parents et lier aux élèves ---
  for (let i = 0; i < 100; i++) {
    const nom = faker.person.lastName();
    const prenom = faker.person.firstName();
    const email = `${prenom.toLowerCase()}.${nom.toLowerCase()}@parent.college-excellence-mock.edu`;

    const utilisateur: Utilisateur = {
      id: faker.string.uuid(),
      nomUtilisateur: `${prenom}.${nom}`,
      email,
      motDePasse: "Password123!", // Plain text for mock
      nom,
      prenom,
      role: Role.PARENT,
      estActif: true,
      creeLe: new Date(),
      misAJourLe: new Date(),
    };
    utilisateurs.push(utilisateur);

    const parent: Parent = {
      id: faker.string.uuid(),
      utilisateurId: utilisateur.id,
      lienParente: faker.helpers.arrayElement([LienParente.PERE, LienParente.MERE, LienParente.TUTEUR]),
    };
    parents.push(parent);

    // Assigner 1 à 3 élèves au hasard à ce parent (qui n'ont pas encore de parent)
    const apprenantsSansParent = apprenants.filter(a => !a.parentId);
    if (apprenantsSansParent.length > 0) {
        const nbEnfants = faker.number.int({ min: 1, max: Math.min(3, apprenantsSansParent.length) });
        const enfantsSelectionnes = faker.helpers.arrayElements(apprenantsSansParent, nbEnfants);
        for (const enfant of enfantsSelectionnes) {
            enfant.parentId = parent.id;
        }
    }
  }


  return {
    utilisateurs,
    etablissements,
    anneesScolaires,
    periodes,
    matieres,
    salles,
    enseignants,
    matieresEnseignees,
    classes,
    apprenants,
    parents,
  };
}

export const mockData: MockData = generateMockData();

// Exemples d'accès aux données :
// console.log("Premier établissement:", mockData.etablissements[0]);
// console.log("Première matière:", mockData.matieres[0]);
// console.log("Premier enseignant:", mockData.enseignants[0]);
// console.log("Première classe:", mockData.classes[0]);
// console.log("Premier apprenant:", mockData.apprenants[0]);
// console.log("Premier parent:", mockData.parents[0]);

    
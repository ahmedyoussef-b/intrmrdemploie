
"use server";

import { z } from "zod";
import { mockData } from "@/lib/mock-data";
import type { Enseignant, Utilisateur } from "@/types";
import { Role, JourSemaine } from "@/types";
import { faker } from '@faker-js/faker/locale/fr';

const TeacherFormSchema = z.object({
  id: z.string().optional(), // For teacher ID if editing
  // User fields
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  email: z.string().email("Veuillez entrer une adresse e-mail valide."),
  // Teacher specific fields
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  jourPedagogique: z.nativeEnum(JourSemaine, { errorMap: () => ({ message: "Veuillez sélectionner un jour."}) }),
  heuresMaxParJour: z.coerce.number().min(1).max(10),
  specialitePrincipale: z.string().min(2, "La spécialité doit contenir au moins 2 caractères."),
  dateEmbauche: z.date({ required_error: "La date d'embauche est requise."}),
});

export interface TeacherActionResponse {
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
  data?: Enseignant; // Returns the teacher, not the user
}

export async function handleAddTeacher(
  prevState: TeacherActionResponse | undefined,
  formData: FormData
): Promise<TeacherActionResponse> {
  const validatedFields = TeacherFormSchema.safeParse({
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    email: formData.get("email"),
    etablissementId: formData.get("etablissementId"),
    jourPedagogique: formData.get("jourPedagogique"),
    heuresMaxParJour: formData.get("heuresMaxParJour"),
    specialitePrincipale: formData.get("specialitePrincipale"),
    dateEmbauche: formData.get("dateEmbauche") ? new Date(formData.get("dateEmbauche") as string) : undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }

  const { nom, prenom, email, ...teacherData } = validatedFields.data;

  // Create Utilisateur
  const newUserId = faker.string.uuid();
  const newUser: Utilisateur = {
    id: newUserId,
    nomUtilisateur: `${prenom.toLowerCase()}.${nom.toLowerCase()}`.replace(/\s+/g, ''),
    email,
    motDePasse: faker.internet.password(), // Mock password
    nom,
    prenom,
    role: Role.ENSEIGNANT,
    estActif: true,
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  // Create Enseignant
  const newTeacher: Enseignant = {
    id: faker.string.uuid(),
    utilisateurId: newUserId,
    ...teacherData,
  };

  try {
    mockData.utilisateurs.push(newUser);
    mockData.enseignants.push(newTeacher);
    return {
      success: true,
      message: "Enseignant ajouté avec succès.",
      data: newTeacher,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'enseignant (mock):", error);
    return {
      success: false,
      message: "Échec de l'ajout de l'enseignant.",
    };
  }
}

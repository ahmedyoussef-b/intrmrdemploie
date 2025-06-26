
"use server";

import { z } from "zod";
import { mockData } from "@/lib/mock-data";
import type { Apprenant, Utilisateur } from "@/types";
import { Role } from "@/types";
import { faker } from '@faker-js/faker/locale/fr';

const StudentFormSchema = z.object({
  id: z.string().optional(), // For student ID if editing
  // User fields
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères."),
  email: z.string().email("Veuillez entrer une adresse e-mail valide."),
  // Student specific fields
  classeId: z.string().min(1, "Veuillez sélectionner une classe."),
  parentId: z.string().optional(),
  dateInscription: z.date({ required_error: "La date d'inscription est requise." }),
});

export interface StudentActionResponse {
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
  data?: Apprenant;
}

export async function handleAddStudent(
  prevState: StudentActionResponse | undefined,
  formData: FormData
): Promise<StudentActionResponse> {
  const validatedFields = StudentFormSchema.safeParse({
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    email: formData.get("email"),
    classeId: formData.get("classeId"),
    parentId: formData.get("parentId") || undefined,
    dateInscription: formData.get("dateInscription") ? new Date(formData.get("dateInscription") as string) : undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }

  const { nom, prenom, email, ...studentData } = validatedFields.data;

  // Create Utilisateur
  const newUserId = faker.string.uuid();
  const newUser: Utilisateur = {
    id: newUserId,
    nomUtilisateur: `${prenom.toLowerCase()}.${nom.toLowerCase()}`.replace(/\s+/g, ''),
    email,
    motDePasse: faker.internet.password(), // Mock password
    nom,
    prenom,
    role: Role.APPRENANT,
    estActif: true,
    creeLe: new Date(),
    misAJourLe: new Date(),
  };

  // Create Apprenant
  const newStudent: Apprenant = {
    id: faker.string.uuid(),
    utilisateurId: newUserId,
    ...studentData,
    parentId: studentData.parentId || undefined,
  };

  try {
    mockData.utilisateurs.push(newUser);
    mockData.apprenants.push(newStudent);
    return {
      success: true,
      message: "Élève ajouté avec succès.",
      data: newStudent,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'élève (mock):", error);
    return {
      success: false,
      message: "Échec de l'ajout de l'élève.",
    };
  }
}

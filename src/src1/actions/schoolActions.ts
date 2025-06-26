
"use server";

import { z } from "zod";
import { mockData } from "@/lib/mock-data";
import type { Etablissement } from "@/types";
import { faker } from '@faker-js/faker/locale/fr';

const SchoolFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  adresse: z.string().min(5, "L'adresse doit contenir au moins 5 caractères."),
  telephone: z.string().regex(/^\+?[0-9\s-()]*$/, "Format de téléphone invalide.").min(8, "Le téléphone doit avoir au moins 8 chiffres."),
  email: z.string().email("Veuillez entrer une adresse e-mail valide."),
});

export interface SchoolActionResponse {
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
  data?: Etablissement;
}

export async function handleAddSchool(
  prevState: SchoolActionResponse | undefined,
  formData: FormData
): Promise<SchoolActionResponse> {
  const validatedFields = SchoolFormSchema.safeParse({
    nom: formData.get("nom"),
    adresse: formData.get("adresse"),
    telephone: formData.get("telephone"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }

  const newSchool: Etablissement = {
    id: faker.string.uuid(), // Générer un ID unique pour le mock
    ...validatedFields.data,
  };

  try {
    // Modification directe du tableau mockData
    mockData.etablissements.push(newSchool);
    return {
      success: true,
      message: "Établissement ajouté avec succès.",
      data: newSchool,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'établissement (mock):", error);
    return {
      success: false,
      message: "Échec de l'ajout de l'établissement.",
    };
  }
}

export async function handleEditSchool(
  prevState: SchoolActionResponse | undefined,
  formData: FormData
): Promise<SchoolActionResponse> {
  const schoolId = formData.get("id");
  if (!schoolId || typeof schoolId !== 'string') {
    return { success: false, message: "ID d'établissement manquant ou invalide." };
  }

  const validatedFields = SchoolFormSchema.safeParse({
    id: schoolId,
    nom: formData.get("nom"),
    adresse: formData.get("adresse"),
    telephone: formData.get("telephone"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }

  const schoolIndex = mockData.etablissements.findIndex(s => s.id === schoolId);
  if (schoolIndex === -1) {
    return { success: false, message: "Établissement non trouvé." };
  }

  const updatedSchool: Etablissement = {
    ...mockData.etablissements[schoolIndex],
    ...validatedFields.data,
  };

  try {
    mockData.etablissements[schoolIndex] = updatedSchool;
    return {
      success: true,
      message: "Établissement modifié avec succès.",
      data: updatedSchool,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de l'établissement (mock):", error);
    return {
      success: false,
      message: "Échec de la modification de l'établissement.",
    };
  }
}

export async function handleDeleteSchool(schoolId: string): Promise<SchoolActionResponse> {
  const schoolIndex = mockData.etablissements.findIndex(s => s.id === schoolId);
  if (schoolIndex === -1) {
    return { success: false, message: "Établissement non trouvé." };
  }

  try {
    mockData.etablissements.splice(schoolIndex, 1);
    return {
      success: true,
      message: "Établissement supprimé avec succès.",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'établissement (mock):", error);
    return {
      success: false,
      message: "Échec de la suppression de l'établissement.",
    };
  }
}

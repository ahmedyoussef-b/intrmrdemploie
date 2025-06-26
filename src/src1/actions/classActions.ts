
"use server";

import { z } from "zod";
import { mockData } from "@/lib/mock-data";
import type { Classe } from "@/types";
import { NiveauScolaire } from "@/types";
import { faker } from '@faker-js/faker/locale/fr';

const ClassFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  niveau: z.nativeEnum(NiveauScolaire, { errorMap: () => ({ message: "Veuillez sélectionner un niveau."}) }),
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  anneeScolaireId: z.string().min(1, "Veuillez sélectionner une année scolaire."),
  capacite: z.coerce.number().min(1, "La capacité doit être d'au moins 1.").max(100, "La capacité ne peut excéder 100."),
  professeurPrincipalId: z.string().optional(),
});

export interface ClassActionResponse {
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
  data?: Classe;
}

export async function handleAddClass(
  prevState: ClassActionResponse | undefined,
  formData: FormData
): Promise<ClassActionResponse> {
  const validatedFields = ClassFormSchema.safeParse({
    nom: formData.get("nom"),
    niveau: formData.get("niveau"),
    etablissementId: formData.get("etablissementId"),
    anneeScolaireId: formData.get("anneeScolaireId"),
    capacite: formData.get("capacite"),
    professeurPrincipalId: formData.get("professeurPrincipalId") || undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }

  const newClass: Classe = {
    id: faker.string.uuid(),
    ...validatedFields.data,
    professeurPrincipalId: validatedFields.data.professeurPrincipalId || undefined,
  };

  try {
    mockData.classes.push(newClass);
    return {
      success: true,
      message: "Classe ajoutée avec succès.",
      data: newClass,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la classe (mock):", error);
    return {
      success: false,
      message: "Échec de l'ajout de la classe.",
    };
  }
}

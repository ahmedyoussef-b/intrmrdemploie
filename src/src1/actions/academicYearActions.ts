
"use server";

import { z } from "zod";
import { mockData } from "@/lib/mock-data";
import type { AnneeScolaire } from "@/types";
import { faker } from '@faker-js/faker/locale/fr';

const AcademicYearFormSchema = z.object({
  id: z.string().optional(),
  annee: z.string().regex(/^\d{4}-\d{4}$/, "Le format de l'année doit être AAAA-AAAA (ex: 2023-2024)."),
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  dateDebut: z.date({ required_error: "La date de début est requise."}),
  dateFin: z.date({ required_error: "La date de fin est requise."}),
  estCourante: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
}).refine(data => data.dateFin > data.dateDebut, {
  message: "La date de fin doit être postérieure à la date de début.",
  path: ["dateFin"],
});

export interface AcademicYearActionResponse {
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
  data?: AnneeScolaire;
}

export async function handleAddAcademicYear(
  prevState: AcademicYearActionResponse | undefined,
  formData: FormData
): Promise<AcademicYearActionResponse> {
  const validatedFields = AcademicYearFormSchema.safeParse({
    annee: formData.get("annee"),
    etablissementId: formData.get("etablissementId"),
    dateDebut: formData.get("dateDebut") ? new Date(formData.get("dateDebut") as string) : undefined,
    dateFin: formData.get("dateFin") ? new Date(formData.get("dateFin") as string) : undefined,
    estCourante: formData.get("estCourante") || 'false',
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }

  const newAcademicYear: AnneeScolaire = {
    id: faker.string.uuid(),
    ...validatedFields.data,
    estCourante: validatedFields.data.estCourante || false, // default to false if not provided
  };

  try {
    mockData.anneesScolaires.push(newAcademicYear);
    return {
      success: true,
      message: "Année académique ajoutée avec succès.",
      data: newAcademicYear,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'année académique (mock):", error);
    return {
      success: false,
      message: "Échec de l'ajout de l'année académique.",
    };
  }
}

// Placeholder for edit and delete actions
// export async function handleEditAcademicYear(...)
// export async function handleDeleteAcademicYear(...)

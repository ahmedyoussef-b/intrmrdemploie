
"use server";

import { z } from "zod";
import { mockData } from "@/lib/mock-data";
import type { Periode } from "@/types";
import { faker } from '@faker-js/faker/locale/fr';

const TermFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  anneeScolaireId: z.string().min(1, "Veuillez sélectionner une année scolaire."),
  dateDebut: z.date({ required_error: "La date de début est requise."}),
  dateFin: z.date({ required_error: "La date de fin est requise."}),
}).refine(data => data.dateFin > data.dateDebut, {
  message: "La date de fin doit être postérieure à la date de début.",
  path: ["dateFin"],
});


export interface TermActionResponse {
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
  data?: Periode;
}

export async function handleAddTerm(
  prevState: TermActionResponse | undefined,
  formData: FormData
): Promise<TermActionResponse> {
  const validatedFields = TermFormSchema.safeParse({
    nom: formData.get("nom"),
    anneeScolaireId: formData.get("anneeScolaireId"),
    dateDebut: formData.get("dateDebut") ? new Date(formData.get("dateDebut") as string) : undefined,
    dateFin: formData.get("dateFin") ? new Date(formData.get("dateFin") as string) : undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }
  
  // Manual validation that was in the schema
  const anneeScolaire = mockData.anneesScolaires.find(a => a.id === validatedFields.data.anneeScolaireId);
  if (anneeScolaire) {
    if (validatedFields.data.dateDebut < new Date(anneeScolaire.dateDebut) || validatedFields.data.dateFin > new Date(anneeScolaire.dateFin)) {
       return {
          success: false,
          message: "Les dates de la période doivent être comprises dans les dates de l'année scolaire sélectionnée.",
          errors: [{ path: ["dateDebut"], message: "Date invalide." }, { path: ["dateFin"], message: "Date invalide." }],
        };
    }
  }


  const newTerm: Periode = {
    id: faker.string.uuid(),
    ...validatedFields.data,
  };

  try {
    mockData.periodes.push(newTerm);
    return {
      success: true,
      message: "Période ajoutée avec succès.",
      data: newTerm,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la période (mock):", error);
    return {
      success: false,
      message: "Échec de l'ajout de la période.",
    };
  }
}


"use server";

import { z } from "zod";
import { mockData } from "@/lib/mock-data";
import type { Matiere, ExigenceMatiere } from "@/types";
import { DureeMatiere, CategorieMatiere } from "@/types";
import { faker } from '@faker-js/faker/locale/fr';

const SubjectFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  code: z.string().min(2, "Le code doit contenir au moins 2 caractères.").max(10, "Le code ne peut pas dépasser 10 caractères."),
  duree: z.nativeEnum(DureeMatiere),
  priorite: z.coerce.number().min(1).max(5),
  categorie: z.nativeEnum(CategorieMatiere),
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  couleur: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Format de couleur invalide (ex: #RRGGBB).").optional(),
  requis: z.object({
    heuresParSemaine: z.coerce.number().min(1),
    necessiteLabo: z.enum(['true', 'false']).transform(val => val === 'true'), // Convertir string en boolean
    dureeMin: z.coerce.number().min(1).max(4),
    dureeMax: z.coerce.number().min(1).max(4),
  }),
}).refine(data => data.requis.dureeMax >= data.requis.dureeMin, {
  message: "La durée maximale doit être supérieure ou égale à la durée minimale.",
  path: ["requis", "dureeMax"], 
});


export interface SubjectActionResponse {
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
  data?: Matiere;
}

export async function handleAddSubject(
  prevState: SubjectActionResponse | undefined,
  formData: FormData
): Promise<SubjectActionResponse> {

  const validatedFields = SubjectFormSchema.safeParse({
    nom: formData.get("nom"),
    code: formData.get("code"),
    duree: formData.get("duree"),
    priorite: formData.get("priorite"),
    categorie: formData.get("categorie"),
    etablissementId: formData.get("etablissementId"),
    couleur: formData.get("couleur") || undefined, // undefined si vide
    requis: {
      heuresParSemaine: formData.get("requis.heuresParSemaine"),
      necessiteLabo: formData.get("requis.necessiteLabo"),
      dureeMin: formData.get("requis.dureeMin"),
      dureeMax: formData.get("requis.dureeMax"),
    },
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }
  
  const { requis, ...subjectData } = validatedFields.data;

  const newSubject: Matiere = {
    id: faker.string.uuid(),
    ...subjectData,
    priorite: Number(subjectData.priorite), // Assurer que priorite est un nombre
    requis: {
        ...requis,
        heuresParSemaine: Number(requis.heuresParSemaine),
        dureeMin: Number(requis.dureeMin),
        dureeMax: Number(requis.dureeMax),
    }
  };

  try {
    mockData.matieres.push(newSubject);
    return {
      success: true,
      message: "Matière ajoutée avec succès.",
      data: newSubject,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la matière (mock):", error);
    return {
      success: false,
      message: "Échec de l'ajout de la matière.",
    };
  }
}

export async function handleEditSubject(
  prevState: SubjectActionResponse | undefined,
  formData: FormData
): Promise<SubjectActionResponse> {
  const subjectId = formData.get("id");
  if (!subjectId || typeof subjectId !== 'string') {
    return { success: false, message: "ID de matière manquant ou invalide." };
  }

  const validatedFields = SubjectFormSchema.safeParse({
    id: subjectId,
    nom: formData.get("nom"),
    code: formData.get("code"),
    duree: formData.get("duree"),
    priorite: formData.get("priorite"),
    categorie: formData.get("categorie"),
    etablissementId: formData.get("etablissementId"),
    couleur: formData.get("couleur") || undefined,
    requis: {
      heuresParSemaine: formData.get("requis.heuresParSemaine"),
      necessiteLabo: formData.get("requis.necessiteLabo"),
      dureeMin: formData.get("requis.dureeMin"),
      dureeMax: formData.get("requis.dureeMax"),
    },
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide pour la modification.",
      errors: validatedFields.error.issues,
    };
  }

  const subjectIndex = mockData.matieres.findIndex(m => m.id === subjectId);
  if (subjectIndex === -1) {
    return { success: false, message: "Matière non trouvée." };
  }

  const { requis, ...subjectData } = validatedFields.data;

  const updatedSubject: Matiere = {
    ...mockData.matieres[subjectIndex], // Conserve les champs non modifiés
    ...subjectData,
    priorite: Number(subjectData.priorite),
    requis: {
        ...mockData.matieres[subjectIndex].requis, // Conserve les champs requis non modifiés
        ...requis,
        heuresParSemaine: Number(requis.heuresParSemaine),
        dureeMin: Number(requis.dureeMin),
        dureeMax: Number(requis.dureeMax),
    }
  };
  
  try {
    mockData.matieres[subjectIndex] = updatedSubject;
    return {
      success: true,
      message: "Matière modifiée avec succès.",
      data: updatedSubject,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de la matière (mock):", error);
    return {
      success: false,
      message: "Échec de la modification de la matière.",
    };
  }
}

// Action pour supprimer une matière (placeholder)
export async function handleDeleteSubject(subjectId: string): Promise<SubjectActionResponse> {
  const subjectIndex = mockData.matieres.findIndex(m => m.id === subjectId);
  if (subjectIndex === -1) {
    return { success: false, message: "Matière non trouvée." };
  }

  try {
    mockData.matieres.splice(subjectIndex, 1);
    return {
      success: true,
      message: "Matière supprimée avec succès.",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de la matière (mock):", error);
    return {
      success: false,
      message: "Échec de la suppression de la matière.",
    };
  }
}

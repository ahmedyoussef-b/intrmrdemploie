
"use server";

import { z } from "zod";
import { mockData } from "@/lib/mock-data";
import type { Salle } from "@/types";
import { TypeSalle, OptionEquipementSalle } from "@/types";
import { faker } from '@faker-js/faker/locale/fr';

const RoomFormSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  type: z.nativeEnum(TypeSalle, { errorMap: () => ({ message: "Veuillez sélectionner un type de salle."}) }),
  capacite: z.coerce.number().min(1, "La capacité doit être d'au moins 1.").max(500, "La capacité ne peut excéder 500."),
  etablissementId: z.string().min(1, "Veuillez sélectionner un établissement."),
  equipements: z.array(z.nativeEnum(OptionEquipementSalle)).optional(),
});

export interface RoomActionResponse {
  success: boolean;
  message?: string;
  errors?: z.ZodIssue[];
  data?: Salle;
}

export async function handleAddRoom(
  prevState: RoomActionResponse | undefined,
  formData: FormData
): Promise<RoomActionResponse> {

  const equipements = formData.getAll("equipements") as OptionEquipementSalle[];

  const validatedFields = RoomFormSchema.safeParse({
    nom: formData.get("nom"),
    type: formData.get("type"),
    capacite: formData.get("capacite"),
    etablissementId: formData.get("etablissementId"),
    equipements: equipements.length > 0 ? equipements : undefined, // pass undefined if empty, or zod will fail for empty array if not optional()
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }

  const newRoom: Salle = {
    id: faker.string.uuid(),
    ...validatedFields.data,
    equipements: validatedFields.data.equipements || [], // Ensure it's an array
  };

  try {
    mockData.salles.push(newRoom);
    return {
      success: true,
      message: "Salle ajoutée avec succès.",
      data: newRoom,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la salle (mock):", error);
    return {
      success: false,
      message: "Échec de l'ajout de la salle.",
    };
  }
}


"use server";

import { generateTimetable, type GenerateTimetableInput, type GenerateTimetableOutput } from "@/ai/flows/generate-timetable";
import { z } from "zod";

const GenerateTimetableFormSchema = z.object({
  schoolId: z.coerce.number().min(1, "L'ID de l'établissement est requis."),
  termId: z.coerce.number().min(1, "L'ID de la période est requis."),
});

export interface ActionResponse {
  success: boolean;
  message?: string;
  data?: GenerateTimetableOutput;
  errors?: z.ZodIssue[];
}

export async function handleGenerateTimetable(
  prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const schoolId = formData.get("schoolId");
  const termId = formData.get("termId");

  const validatedFields = GenerateTimetableFormSchema.safeParse({
    schoolId: schoolId,
    termId: termId,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Entrée invalide.",
      errors: validatedFields.error.issues,
    };
  }

  const input: GenerateTimetableInput = {
    schoolId: validatedFields.data.schoolId,
    termId: validatedFields.data.termId,
  };

  try {
    const result = await generateTimetable(input);
    return {
      success: true,
      message: "La génération de l'emploi du temps a démarré avec succès.", // Ou "terminée" si c'est synchrone
      data: result,
    };
  } catch (error) {
    console.error("Erreur lors de la génération de l'emploi du temps:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite.";
    return {
      success: false,
      message: `Échec de la génération de l'emploi du temps : ${errorMessage}`,
    };
  }
}

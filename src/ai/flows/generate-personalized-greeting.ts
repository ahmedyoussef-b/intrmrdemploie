
'use server';
/**
 * @fileOverview Ce fichier définit un flux Genkit pour générer un message d'accueil personnalisé en fonction de l'heure de la journée.
 *
 * Le flux ne prend aucune entrée et renvoie une chaîne de caractères de message d'accueil personnalisé.
 * generatePersonalizedGreeting - Une fonction qui appelle le generatePersonalizedGreetingFlow et renvoie le message d'accueil.
 * GeneratePersonalizedGreetingOutput - Le type de sortie du flux, qui est une chaîne de caractères.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedGreetingOutputSchema = z.string().describe("Un message d'accueil personnalisé en fonction de l'heure de la journée.");
export type GeneratePersonalizedGreetingOutput = z.infer<typeof GeneratePersonalizedGreetingOutputSchema>;

export async function generatePersonalizedGreeting(): Promise<GeneratePersonalizedGreetingOutput> {
  return generatePersonalizedGreetingFlow({});
}

const greetingPrompt = ai.definePrompt({
  name: 'generatePersonalizedGreetingPrompt',
  input: {schema: z.object({})}, 
  prompt: `Vous êtes un assistant amical. Générez un message d'accueil personnalisé en français en fonction de l'heure actuelle de la journée.\n\nConsidérez ces exemples:\n- Si c'est le matin, suggérez un message comme "Bonjour !" ou "Passez une excellente journée !"\n- Si c'est l'après-midi, suggérez un message comme "Bon après-midi !" ou "J'espère que vous passez une journée productive !"\n- Si c'est le soir, suggérez un message comme "Bonsoir !" ou "Profitez de votre soirée !"\n- Si c'est la nuit, suggérez un message comme "Bonne nuit !" ou "Faites de beaux rêves !"\n\nSortie:`,
  // Removing output schema to get raw text and prevent parsing errors on empty/null responses.
});

const generatePersonalizedGreetingFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedGreetingFlow',
    inputSchema: z.object({}),
    outputSchema: GeneratePersonalizedGreetingOutputSchema, // The flow itself still must return a string
  },
  async (flowInput) => {
    const defaultGreeting = "Bonjour ! Nous vous souhaitons une excellente journée.";
    try {
      console.log("[generatePersonalizedGreetingFlow] Calling greetingPrompt...");
      const response = await greetingPrompt(flowInput);
      const greetingText = response.text; // Access raw text from the response

      console.log(`[generatePersonalizedGreetingFlow] Raw text from prompt: "${greetingText}"`);

      if (greetingText && greetingText.trim() !== '') {
        console.log("[generatePersonalizedGreetingFlow] Valid personalized greeting obtained:", greetingText);
        return greetingText.trim();
      } else {
        console.warn(`[generatePersonalizedGreetingFlow] Prompt output was empty or invalid. Using default greeting.`);
        return defaultGreeting;
      }
    } catch (error: any) {
      let errorMessage = "Unknown error during prompt execution.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        try {
          errorMessage = JSON.stringify(error);
        } catch (e) {
          // If stringify fails, use the generic message
        }
      }
      console.error(`[generatePersonalizedGreetingFlow] Error: ${errorMessage}. Using default greeting.`);
      if (error && error.stack) {
          console.error("Stack trace:", error.stack);
      }
      return defaultGreeting;
    }
  }
);

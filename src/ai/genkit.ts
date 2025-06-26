
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let ai: any;

try {
  // Attempt to initialize Genkit with the Google AI plugin.
  // This can throw an error if the GEMINI_API_KEY environment variable is not set.
  ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
  });
  console.log('🤖 Genkit AI initialized successfully.');
} catch (e) {
  // If initialization fails, log a warning and create a mock AI object.
  // This prevents the entire server from crashing on startup if the API key is missing.
  console.warn(
    '⚠️ Genkit AI initialization failed. AI features will be disabled. Check your GEMINI_API_KEY in the .env file.'
  );

  // The mock object provides dummy implementations of the functions used in the app,
  // preventing "is not a function" errors.
  ai = {
    defineFlow:
      () =>
      async (...args: any[]) => {
        console.warn('AI feature called, but AI is not initialized.');
        return 'AI non disponible';
      },
    definePrompt:
      () =>
      async (...args: any[]) => {
        console.warn('AI feature called, but AI is not initialized.');
        return {
          text: () => 'AI non disponible',
          output: () => 'AI non disponible',
        };
      },
    generate: async () => {
       console.warn('AI feature called, but AI is not initialized.');
       return {
          text: () => 'AI non disponible',
          output: () => 'AI non disponible',
        };
    }
  };
}

export {ai};

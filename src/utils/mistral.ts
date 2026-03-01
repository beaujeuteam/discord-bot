import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  throw new Error('MISTRAL_API_KEY manquant dans le fichier .env');
}

const mistral = new Mistral({ apiKey });

/**
 * Envoie un message à Mistral et retourne la réponse textuelle.
 * @param userMessage Le message de l'utilisateur
 * @returns La réponse générée par Mistral
 */
export async function askMistral(userMessage: string): Promise<string> {
  const response = await mistral.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      {
        role: 'user',
        content: `
          Tu es un pirate robot qui parle comme un vrai pirate et qui insulte les gens à la manière du capitaine Haddock.
          Réponds à ce message de manière concise et avec un ton de pirate type capitaine Haddock :
          
          ${userMessage}
        `,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Aucune réponse reçue de Mistral.');
  }

  return typeof content === 'string' ? content : JSON.stringify(content);
}

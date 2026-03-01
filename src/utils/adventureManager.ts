import { Mistral } from '@mistralai/mistralai';

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
  throw new Error('MISTRAL_API_KEY manquant dans le fichier .env');
}

const mistral = new Mistral({ apiKey });

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Stockage en mémoire : threadId -> historique de la conversation
const adventureSessions = new Map<string, ChatMessage[]>();

const SYSTEM_PROMPT = `Tu es le Maître du Jeu d'un livre dont vous êtes le héros. Tu incarnes un narrateur immersif, mystérieux et expressif.

Règles impératives :
1. Tu racontes une aventure interactive en français, dans un style littéraire et atmosphérique mais concis.
2. Chaque réponse doit :
   - Décrire en 1 paragraphe ce qui se passe suite au choix du joueur
   - Présenter une situation avec plusieurs possibilités d'action
   - Terminer TOUJOURS par la question : "Que faites-vous ?" suivie de 2 à 4 options numérotées clairement
3. Tu adaptes la difficulté et le danger de l'histoire selon les choix du joueur.
4. Si le joueur fait un choix très imprudent, des conséquences peuvent survenir (blessures, mort...).
5. Si le personnage meurt, tu annonces la mort de façon dramatique et proposes de recommencer.
6. L'aventure doit avoir une cohérence narrative : retiens les éléments importants pour la suite.
7. Tu NE joues JAMAIS le rôle du joueur. Tu décris uniquement le monde et les événements.
8. Ne fait pas des phrases trops grandes. Evite les superlatif mais créé une atmosphère prenante.`;

// 8. Utilise un vocabulaire riche, des descriptions sensorielles, et créé une atmosphère prenante.

/**
 * Démarre une nouvelle session d'aventure pour un thread.
 * @param threadId  Identifiant du thread Discord
 * @param theme     Thème/description optionnel fourni par le joueur
 * Retourne le premier message du Maître du Jeu.
 */
export async function startAdventure(threadId: string, theme?: string | null): Promise<string> {
  const themeClause = theme
    ? `Le thème choisi par le joueur est : "${theme}". Construis l'univers et la situation de départ autour de ce thème.`
    : "Choisis librement un univers et une situation de départ originaux.";

  const history: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content:
        `Lance une nouvelle aventure. ${themeClause} Présente le cadre de l'histoire (univers, lieu, situation de départ) de façon accrocheuse, puis donne-moi mes premières options.`,
    },
  ];

  const response = await callMistral(history);
  history.push({ role: 'assistant', content: response });
  adventureSessions.set(threadId, history);
  return response;
}

/**
 * Continue une aventure existante avec le choix du joueur.
 * Retourne la réponse du Maître du Jeu.
 */
export async function continueAdventure(threadId: string, playerMessage: string): Promise<string> {
  const history = adventureSessions.get(threadId);
  if (!history) {
    throw new Error('Aucune aventure active pour ce thread.');
  }

  history.push({ role: 'user', content: playerMessage });
  const response = await callMistral(history);
  history.push({ role: 'assistant', content: response });
  return response;
}

/**
 * Vérifie si un thread possède une aventure active.
 */
export function hasActiveAdventure(threadId: string): boolean {
  return adventureSessions.has(threadId);
}

/**
 * Supprime la session d'aventure d'un thread.
 */
export function endAdventure(threadId: string): void {
  adventureSessions.delete(threadId);
}

/**
 * Appelle l'API Mistral avec l'historique complet de la conversation.
 */
async function callMistral(history: ChatMessage[]): Promise<string> {
  const response = await mistral.chat.complete({
    model: 'mistral-large-latest',
    messages: history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Aucune réponse reçue de Mistral.');
  }

  return typeof content === 'string' ? content : JSON.stringify(content);
}

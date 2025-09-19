import { openai } from "@/lib/ai-providers";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    // Vérifier que la clé OpenAI est configurée
    if (!process.env.OPENAI_API_KEY) {
      return new Response("OpenAI API key not configured", { status: 500 });
    }

    // Prompt système optimisé pour la génération de code
    const systemPrompt = `Tu es un expert développeur web qui génère du code HTML, CSS et JavaScript moderne et fonctionnel.

RÈGLES IMPORTANTES :
1. Génère UNIQUEMENT du code HTML complet avec <!DOCTYPE html>, <html>, <head> et <body>
2. Utilise Tailwind CSS pour le styling (classes comme bg-blue-500, text-white, etc.)
3. Le code doit être responsive et moderne
4. Inclus du JavaScript vanilla pour l'interactivité si nécessaire
5. Le code doit être immédiatement fonctionnel
6. Utilise des couleurs et designs attractifs
7. Assure-toi que le code est propre et bien structuré

RÉPONDS UNIQUEMENT AVEC LE CODE HTML, sans explications ni commentaires supplémentaires.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        console.log("Code generation completed:", completion.substring(0, 100) + "...");
      },
    });

    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Error in AI generation API:", error);
    
    // Retourner une réponse d'erreur plus informative
    if (error instanceof Error) {
      return new Response(`Erreur: ${error.message}`, { status: 500 });
    }
    
    return new Response("Erreur lors de la génération de code", { status: 500 });
  }
}

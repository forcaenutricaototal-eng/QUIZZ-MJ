import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MALE_NAMES = [
  'joao', 'jose', 'antonio', 'francisco', 'carlos', 'paulo', 'pedro', 'lucas',
  'luiz', 'marcos', 'luis', 'gabriel', 'rafael', 'daniel', 'marcelo', 'bruno',
  'eduardo', 'felipe', 'rodrigo', 'fernando', 'andre', 'thiago', 'diego', 'marcio',
  'ricardo', 'alexandre', 'sergio', 'sandro', 'adriano', 'leandro'
];

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { history, name } = request.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return response.status(400).json({ error: 'Missing history in request body' });
    }
     if (!process.env.API_KEY) {
        return response.status(500).json({ error: "A chave da API do Google não foi configurada." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const userName = name ? name.trim().split(' ')[0] : 'Você';
    const normalizedFirstName = userName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isMaleName = MALE_NAMES.includes(normalizedFirstName);
    let systemInstruction = '';

     if (isMaleName) {
        systemInstruction = `Você é Dr. Kenji, um especialista em metabolismo masculino. Continue a conversa com ${userName} de forma direta, confiante e motivadora. Responda às perguntas dele sobre o Protocolo Monjaro Japonês. Mantenha as respostas curtas, claras e focadas em resultados. Use emojis como 🎯, 🚀, ✅.`;
    } else {
        systemInstruction = `Você é Simone, especialista em emagrecimento feminino. Continue a conversa com ${userName} de forma empática, acolhedora e confiante. Responda às dúvidas dela sobre o Protocolo Monjaro Japonês. Mantenha as respostas curtas, mas completas e encorajadoras. Use emojis como 🍵, ✨, ✅.`;
    }

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];
    
    // Convert message history to Gemini format
    const geminiHistory = history.slice(0, -1).map((msg: { role: string; content: string; }) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const lastMessage = history[history.length - 1];

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
          safetySettings,
        },
        history: geminiHistory
    });

    const result = await chat.sendMessage({ message: lastMessage.content });
    
    return response.status(200).json({ text: result.text });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return response.status(500).json({ error: error.message || 'An unknown error occurred.' });
  }
}
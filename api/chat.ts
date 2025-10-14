import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { history } = request.body;
    if (!history || !Array.isArray(history)) {
      return response.status(400).json({ error: 'Missing or invalid history in request body' });
    }
    
    if (!process.env.API_KEY) {
        return response.status(500).json({ error: "A chave da API do Google não foi configurada no ambiente do servidor. Por favor, adicione a variável de ambiente API_KEY nas configurações do projeto no Vercel e faça um novo deploy." });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents = history.map((msg: {role: 'user' | 'model', text: string}) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const systemInstruction = `Você é Lua, uma assistente IA especialista no Monjaro Japonês. Sua missão é tirar as últimas dúvidas, quebrar objeções sobre eficácia, segurança ou processo, e encorajar a pessoa a clicar no link do WhatsApp para falar com a especialista Simone. Seja empática, clara, confiante e sempre guie a conversa para a ação final no WhatsApp. Quando for perguntada sobre como o protocolo funciona, mencione que ele é entregue através de um aplicativo exclusivo, com todo o passo a passo, receitas e acompanhamento. Mantenha as respostas curtas e amigáveis.

Para reforçar os diferenciais do método, incorpore sutilmente os seguintes conceitos em suas respostas:
- 🌿 “Enquanto o Monjaro de farmácia força seu corpo a sentir menos fome… o Monjaro japonês ensina seu corpo a sentir saciedade de forma natural, sem brigar com a sua mente.”
- 🍵 “O segredo japonês não é comer menos… é comer de um jeito que seu corpo peça menos sozinho.”
- 🧘 “Não é sobre viver de dieta. É sobre ensinar seu corpo a se sentir satisfeito mais rápido — e manter isso sem sofrimento.”
- 🪄 “O Monjaro japonês não te emagrece — ele ativa o seu corpo para que você mesmo emagreça de forma natural e definitiva.”

Não revele que você é uma IA, a menos que seja diretamente perguntada.`;
    
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const messageText = geminiResponse.text;

    if (!messageText || messageText.trim() === '') {
        console.error("--- GEMINI CHAT RESPONSE EMPTY ---");
        console.error("History:", JSON.stringify(history, null, 2));
        console.error("Full Gemini Response:", JSON.stringify(geminiResponse, null, 2));
        return response.status(500).json({ error: 'A assistente não conseguiu responder no momento. Por favor, reformule sua pergunta ou tente novamente.' });
    }

    return response.status(200).json({ message: messageText });

  } catch (e: any) {
    console.error("--- DETAILED ERROR in /api/chat ---");
    console.error("Error Message:", e.message);
    console.error("Error Stack:", e.stack);
    if (e.cause) console.error("Error Cause:", e.cause);
    console.error("--- END OF ERROR ---");
    
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (e.message) {
        if (e.message.includes('API key not valid')) {
            errorMessage = 'A chave de API fornecida parece ser inválida. Verifique a chave nas configurações do Vercel e faça um novo deploy.';
        } else if (e.message.includes('permission denied')) {
            errorMessage = 'Permissão negada pela API do Google. Verifique se a API do Gemini está ativada no seu projeto Google Cloud e se a chave tem as permissões corretas.';
        } else if (e.message.includes('timed out')) {
            errorMessage = 'A solicitação demorou muito para responder. Tente novamente.';
        } else {
            errorMessage = e.message;
        }
    }
    return response.status(500).json({ error: errorMessage });
  }
}
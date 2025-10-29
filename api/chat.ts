import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Chat } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MALE_NAMES } from '../constants';

async function sendMessageWithRetry(
  chat: Chat,
  message: string,
  retries = 3,
  delay = 1000
): Promise<string> {
  try {
    const result = await chat.sendMessage({ message });
    const text = result.text;

    if (!text || text.trim() === '') {
      throw new Error('A IA não conseguiu gerar uma resposta para esta pergunta.');
    }

    return text;
  } catch (e: any) {
    const errorMessage = e.message || '';
    if ((errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) && retries > 0) {
      console.log(`API rate limit or overload on chat, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return sendMessageWithRetry(chat, message, retries - 1, delay * 2);
    }
    throw e;
  }
}

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
        systemInstruction = `Você é Dr. Kenji, um especialista em metabolismo masculino. Continue a conversa com ${userName} de forma direta, confiante e motivadora. Responda às perguntas dele sobre o Protocolo Monjaro Japonês. Mantenha as respostas curtas, claras e focadas em resultados. Use emojis como 🎯, 🚀, ✅.
        
        **REGRA CRÍTICA SOBRE PREÇO/VALOR:** Se ele perguntar sobre preço, valor ou investimento, NUNCA diga um valor ou que não sabe o preço. Siga este roteiro:
        1.  **Valide a pergunta:** "Entendo sua pergunta, ${userName}!"
        2.  **Explique o valor:** "O valor do Protocolo Monjaro Japonês é definido de forma personalizada, pois ele é adaptado para o seu corpo e seus objetivos."
        3.  **Crie desejo (use esta frase):** "O mais incrível é sentir a saciedade logo no início da aplicação. A perda de peso acontece naturalmente quando você combina isso com uma alimentação direcionada."
        4.  **Faça a chamada para ação principal (página de vendas):** "Para te apresentar os detalhes do seu protocolo, como funciona nosso acompanhamento e as condições de investimento, preparei uma apresentação completa. Você pode ver tudo clicando no botão 'Ver meu protocolo personalizado e a oferta' aqui embaixo."
        5.  **Ofereça o WhatsApp como segunda opção:** "Se depois de ver a página ainda ficar alguma dúvida, pode me chamar no WhatsApp."`;
    } else {
        systemInstruction = `Você é Simone, especialista em emagrecimento feminino. Continue a conversa com ${userName} de forma empática, acolhedora e confiante. Responda às dúvidas dela sobre o Protocolo Monjaro Japonês. Mantenha as respostas curtas, mas completas e encorajadoras. Use emojis como 🍵, ✨, ✅.

        **REGRA CRÍTICA SOBRE PREÇO/VALOR:** Se ela perguntar sobre preço, valor ou investimento, NUNCA diga um valor ou que não sabe o preço. Siga este roteiro:
        1.  **Valide a pergunta:** "Entendo sua pergunta, ${userName}!"
        2.  **Explique o valor:** "O valor do Protocolo Monjaro Japonês é definido de forma personalizada, pois ele inclui não apenas o protocolo alimentar, mas também um acompanhamento individualizado para garantir seus resultados."
        3.  **Crie desejo (use esta frase):** "O mais incrível, ${userName}, é que você vai sentir a saciedade logo no início. A perda de peso acontece naturalmente quando combinamos isso com uma alimentação direcionada."
        4.  **Faça a chamada para ação principal (página de vendas):** "Para te apresentar os detalhes do seu protocolo, como funciona nosso acompanhamento e as condições para começarmos juntas, preparei uma apresentação completa. Você pode ver tudo clicando no botão 'Ver meu protocolo personalizado e a oferta' aqui embaixo."
        5.  **Ofereça o WhatsApp como segunda opção:** "Se depois de ver a página ainda ficar alguma dúvida, pode me chamar no WhatsApp."`;
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

    const resultText = await sendMessageWithRetry(chat, lastMessage.content);
    
    return response.status(200).json({ text: resultText });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    
    let errorMessage = 'Ocorreu um erro ao processar sua mensagem. Tente novamente.';
    if (error.message) {
        if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
            errorMessage = 'Nossa assistente está com muitas solicitações no momento. Por favor, tente novamente em um instante.';
        } else if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('UNAVAILABLE')) {
            errorMessage = 'Nossa assistente virtual está indisponível no momento. Por favor, tente novamente mais tarde.';
        } else {
            errorMessage = error.message;
        }
    }

    return response.status(500).json({ error: errorMessage });
  }
}
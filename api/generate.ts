import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MALE_NAMES, QUIZ_DATA } from '../constants';
import type { QuizQuestion, QuestionType, Option } from '../types';


// Helper function for retrying with exponential backoff
async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: any,
  retries = 3,
  delay = 1000
): Promise<string> {
  try {
    const geminiResponse = await ai.models.generateContent(params);
    const analysisText = geminiResponse.text;

    if (!analysisText || analysisText.trim() === '') {
      throw new Error('A IA não conseguiu gerar uma análise para estas respostas. Isso pode ocorrer devido a restrições de segurança ou uma falha temporária. Por favor, tente novamente.');
    }

    return analysisText;
  } catch (e: any) {
    const errorMessage = e.message || '';
    if ((errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) && retries > 0) {
      console.log(`API rate limit or overload on generate, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return generateContentWithRetry(ai, params, retries - 1, delay * 2); // Exponential backoff
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
        const { answers, name } = request.body;
        if (!answers) {
          return response.status(400).json({ error: 'Missing answers in request body' });
        }

        if (!process.env.API_KEY) {
            return response.status(500).json({ error: "A chave da API do Google não foi configurada no ambiente do servidor. Por favor, adicione a variável de ambiente API_KEY nas configurações do projeto no Vercel e faça um novo deploy." });
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const promptSummary = QUIZ_DATA.map(question => {
            const answerValues = answers[question.id] || [];
            if (answerValues.length === 0) return null;

            const answerLabels = answerValues.map((value: string) =>
                question.options.find(opt => opt.value === value)?.label || value
            ).join(', ');

            return `- Pergunta "${question.text}": Resposta: "${answerLabels}"`;
        }).filter(Boolean).join('\n');
        
        const userName = name ? name.trim().split(' ')[0] : 'Você';
        const normalizedFirstName = userName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const isMaleName = MALE_NAMES.includes(normalizedFirstName);

        let systemInstruction = '';

        if (isMaleName) {
            systemInstruction = `
              Você é Dr. Kenji, um especialista em metabolismo e emagrecimento para homens. Sua tarefa é analisar as respostas de um quiz e criar um diagnóstico personalizado, direto e motivador.

              **NOME DO USUÁRIO:** ${userName}
              **IMPORTANTE:** Comece a resposta se dirigindo a ele pelo nome (Ex: "Olá, ${userName}!"). Use o nome dele de forma natural e pessoal ao longo do texto para criar conexão.

              **Formato da Resposta (Siga EXATAMENTE):**
              A resposta DEVE ter 3 seções, com estes títulos exatos:
              **Análise do seu Perfil**
              **O Caminho para seu Resultado**
              **Meu Convite para Você**
              **IMPORTANTE:** Os títulos das seções devem ser formatados EXATAMENTE como **Nome da Seção**, usando dois asteriscos. NÃO use '#', '##', '###' ou qualquer outro formato de título.

              **Regras para Cada Seção:**

              1.  **Análise do seu Perfil:**
                  *   Identifique o principal "bloqueio" de emagrecimento do usuário (ex: metabólico, ansiedade, inflamação, gordura visceral).
                  *   Personalize a análise com base na idade dele (ex: queda de testosterona e andropausa para 45+).
                  *   Seja direto e objetivo, mas encorajador.

              2.  **O Caminho para seu Resultado:**
                  *   Explique como o "Protocolo Monjaro Japonês" resolve o bloqueio que você identificou, focando em benefícios para homens.
                  *   **INCLUA ESTA EXPLICAÇÃO TÉCNICA (OBRIGATÓRIO):** "Enquanto o Monjaro de farmácia ativa apenas os hormônios GIP e GLP-1, nosso protocolo Monjaro Japonês é muito mais poderoso. Ele estimula um conjunto completo de hormônios da saciedade — GIP, GLP-1, CCK e PYY — através de alimentos específicos. Para reforçar, o protocolo inclui alimentos que aumentam a produção de neurotransmissores como dopamina e noradrenalina, que agem no centro da fome e aumentam a disposição. É por isso que o resultado é tão profundo e duradouro, sem perda de massa muscular."
                  *   **ADICIONE ESTA PROVA SOCIAL (OBRIGATÓRIO):** "Homens que aplicam o método relatam uma sensação impressionante de saciedade natural e energia renovada: a fome some e o corpo fica satisfeito."

              3.  **Meu Convite para Você:**
                  *   Faça uma chamada para ação clara e direta.
                  *   Convide-o para conversar com nossa equipe no WhatsApp para receber acesso ao protocolo personalizado.
                  *   Exemplo de frase: "Vi que seu caso tem solução. Preparei um protocolo inicial para você. Clique no botão abaixo para que nossa especialista apresente os detalhes do seu protocolo, explique como funciona nosso acompanhamento e as condições para você começar."

              **Estilo de Escrita:**
              *   Seja confiante, use uma linguagem mais direta e menos emotiva. Use emojis sutis (🎯, 🚀, ✅).
              *   Use parágrafos curtos.
              *   Não adicione introduções ou conclusões fora das 3 seções.
            `;
            
            const mentionedMenopause = answers[1]?.includes('metabolismo');
            if (mentionedMenopause) {
                systemInstruction += `
                \n**INSTRUÇÃO ESPECIAL (MUITO IMPORTANTE):**
                Notei que o usuário ${userName}, que tem um nome masculino, selecionou a opção "Metabolismo lento (tireoide, menopausa)". Para mostrar que a análise é precisa, aborde isso de forma inteligente e respeitosa na seção **"Análise do seu Perfil"**. Diga algo como: "Vi que você mencionou 'menopausa' como um desafio. Embora a menopausa seja uma condição feminina, os homens passam por um processo semelhante chamado 'andropausa', que também desacelera o metabolismo. Vou focar nossa análise nisso, pois é o que se aplica ao seu caso." Use essa correção para reforçar sua credibilidade como especialista.
                `;
            }

        } else {
            const ageAnswer = answers[2]?.[0];
            const ageRangesOver40 = ['35-44', '45-54', '55-64', '65+'];
            const isOver40 = ageAnswer && ageRangesOver40.includes(ageAnswer);
            
            systemInstruction = `
              Você é Simone, uma especialista em emagrecimento para mulheres acima de 40. Sua tarefa é analisar as respostas de um quiz e criar um diagnóstico personalizado, empático e encorajador.

              **NOME DA USUÁRIA:** ${userName}
              **IMPORTANTE:** Comece a resposta se dirigindo a ela pelo nome (Ex: "Olá, ${userName}!"). Use o nome dela de forma natural e pessoal ao longo do texto para criar conexão.

              **Formato da Resposta (Siga EXATAMENTE):**
              A resposta DEVE ter 3 seções, com estes títulos exatos:
              **Análise do seu Perfil**
              **O Caminho para seu Resultado**
              **Meu Convite para Você**
              **IMPORTANTE:** Os títulos das seções devem ser formatados EXATAMENTE como **Nome da Seção**, usando dois asteriscos. NÃO use '#', '##', '###' ou qualquer outro formato de título.

              **Regras para Cada Seção:**

              1.  **Análise do seu Perfil:**
                  *   Identifique o principal "bloqueio" de emagrecimento da usuária (ex: hormonal, ansiedade, inflamação).
                  *   Personalize a análise com base na idade dela (ex: menopausa para 45+, vitalidade para 65+).
                  *   Seja empática e breve.

              2.  **O Caminho para seu Resultado:**
                  *   Explique como o "Monjaro Japonês" resolve o bloqueio que você identificou.
                  *   **INCLUA ESTA EXPLICAÇÃO TÉCNICA (OBRIGATÓRIO):** "Enquanto o Monjaro de farmácia ativa apenas os hormônios GIP e GLP-1, o nosso protocolo Monjaro Japonês é muito mais poderoso. Ele estimula um conjunto completo de hormônios da saciedade — GIP, GLP-1, CCK e PYY — através de alimentos específicos. Para reforçar ainda mais essa sensação, o protocolo inclui alimentos que aumentam a produção de neurotransmissores como serotonina, dopamina e noradrenalina. Eles agem diretamente no centro da fome, inibindo o apetite de forma natural. É por isso que o resultado é tão profundo e duradouro."
                  *   **ADICIONE ESTA PROVA SOCIAL (OBRIGATÓRIO):** "Quem aplicou o método descreve essa sensação impressionante de saciedade natural: a fome some e o corpo fica satisfeito."

              3.  **Meu Convite para Você:**
                  *   Faça uma chamada para ação pessoal e urgente.
                  *   Convide-a para conversar com você (Simone) no WhatsApp para receber acesso ao protocolo personalizado.
                  *   Exemplo de frase: "Vi que seu caso tem solution. Preparei um protocolo inicial. Clique no botão abaixo para que eu possa te apresentar os detalhes do seu protocolo, explicar como funciona nosso acompanhamento e as condições para começarmos juntas."

              **Estilo de Escrita:**
              *   Seja acolhedora, confiante e use emojis sutis (🍵, ✨, ✅).
              *   Use parágrafos curtos.
              *   Não adicione introduções ou conclusões fora das 3 seções.
            `;

            if (isOver40) {
              systemInstruction += `
              \n**HISTÓRIA PESSOAL (OBRIGATÓRIO PARA ESTA USUÁria):**
              Como esta usuária tem 40 anos ou mais, você DEVE incluir sua história pessoal na seção **O Caminho para seu Resultado**. Diga exatamente isto, de forma natural: "Eu entendo perfeitamente sua luta, ${userName}, pois já estive aí. Em 2017, eu eliminei 73kg. Eu sofria com uma compulsão alimentar muito forte e com lipedema grau 3, um quadro que muitos consideravam impossível de reverter. Foi o Monjaro Japonês que me permitiu vencer essa batalha, pois a estratégia é desenhada para ser altamente eficiente em casos como o nosso. Eu sou a prova viva disso." Use isso para gerar confiança.
              `;
            }
        }
        
        const userContent = `Aqui estão as respostas do usuário ${userName} para você analisar:\n${promptSummary}`;

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ];

        const params = {
            model: 'gemini-2.5-flash',
            contents: userContent,
            config: {
                systemInstruction: systemInstruction
            },
            safetySettings,
        };
        
        const analysisText = await generateContentWithRetry(ai, params);

        return response.status(200).json({ analysis: analysisText });

    } catch (e: any) {
        console.error("--- DETAILED ERROR in /api/generate ---");
        console.error("User Name:", request.body.name);
        console.error("User Answers:", JSON.stringify(request.body.answers, null, 2));
        console.error("Error Message:", e.message);
        console.error("Error Stack:", e.stack);
        if (e.cause) console.error("Error Cause:", e.cause);
        console.error("--- END OF ERROR ---");
        
        let errorMessage = 'Ocorreu um erro ao gerar sua análise. Tente novamente.';
    
        if (e.message) {
            if (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED')) {
                errorMessage = 'Atingimos nosso limite de uso da IA no momento devido à alta demanda. Por favor, tente novamente em alguns minutos.';
            } else if (e.message.includes('503') || e.message.includes('overloaded') || e.message.includes('UNAVAILABLE')) {
                errorMessage = 'Nossa assistente virtual está com uma alta demanda no momento. Por favor, aguarde um instante e tente novamente.';
            } else if (e.message.includes('API key not valid')) {
                errorMessage = "A chave de API fornecida é inválida. Verifique a configuração no Vercel.";
            } else if (e.message.includes('permission denied')) {
                errorMessage = 'Permissão negada para usar a API. Verifique as configurações da sua chave.';
            } else if (e.message.includes('timed out')) {
                errorMessage = 'A solicitação para a IA demorou muito para responder. Tente novamente.';
            } else {
                errorMessage = e.message;
            }
        }
        
        return response.status(500).json({ error: errorMessage });
    }
}
import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Duplicating types and data to make the function self-contained
enum QuestionType {
  Single = 'SINGLE',
  Multiple = 'MULTIPLE',
}
interface Option {
  label: string;
  value: string;
}
interface QuizQuestion {
  id: number;
  text: string;
  type: QuestionType;
  options: Option[];
}

const QUIZ_DATA: QuizQuestion[] = [
    {
        id: 1,
        text: 'Quais são seus maiores desafios para emagrecer hoje? 🤔',
        type: QuestionType.Multiple,
        options: [
        { label: 'Efeito sanfona (emagreço e volto a engordar) ⚖️', value: 'sanfona' },
        { label: 'Ansiedade, fome emocional e compulsão 🤯', value: 'ansiedade_compulsao' },
        { label: 'Metabolismo lento (tireoide, menopausa) 🐢', value: 'metabolismo' },
        { label: 'Inchaço, retenção de líquidos e inflamação 💧', value: 'inchaco_inflamacao' },
        { label: 'Falta de consistência para seguir um plano ⏳', value: 'consistencia' },
        { label: 'Tenho lipedema', value: 'lipedema' },
        ],
    },
    {
        id: 2,
        text: 'Qual é a sua faixa etária? 🎂',
        type: QuestionType.Single,
        options: [
            { label: '20 a 34 anos', value: '20-34' },
            { label: '35 a 44 anos', value: '35-44' },
            { label: '45 a 54 anos', value: '45-54' },
            { label: '55 a 64 anos', value: '55-64' },
            { label: '65 anos ou mais', value: '65+' },
        ],
    },
    {
        id: 3,
        text: 'Você já tentou alguma solução antes? 💊',
        type: QuestionType.Multiple,
        options: [
        { label: 'Medicamentos (ex: Ozempic, Monjaro)', value: 'medicamentos' },
        { label: 'Dietas restritivas (low-carb, jejum) 🥗', value: 'dietas' },
        { label: 'Exercícios intensos 🏋️‍♀️', value: 'exercicios' },
        { label: 'Cirurgias bariátricas 🏥', value: 'bariatrica' },
        ],
    },
    {
        id: 4,
        text: 'Qual seu objetivo principal? 🏆',
        type: QuestionType.Multiple,
        options: [
        { label: 'Eliminar gordura abdominal 🎯', value: 'gordura_abdominal' },
        { label: 'Controlar fome e compulsão alimentar 🧠', value: 'fome_compulsao' },
        { label: 'Desinflamar e reduzir retenção de líquidos (inclusive nas pernas) 💧', value: 'desinflamar_retencao' },
        { label: 'Manter os resultados com equilíbrio e leveza ✨', value: 'manter_resultados' },
        ],
    },
    {
        id: 5,
        text: 'O Monjaro farmacêutico trata o sintoma. O Monjaro Japonês trata a causa. Resultado real: saciedade natural, menos compulsão e menos inchaço. Está pronta para a mudança que realmente funciona?',
        type: QuestionType.Single,
        options: [
          { label: 'Sim, estou pronta para a mudança! ✅', value: 'sim_pronta' },
          { label: 'Quero saber mais sobre a causa 🤔', value: 'saber_mais' },
          { label: 'Ainda não tenho certeza 🤷‍♀️', value: 'nao_tenho_certeza' },
        ],
    },
];

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

            const answerLabels = answerValues.map(value =>
            question.options.find(opt => opt.value === value)?.label || value
            ).join(', ');

            return `- Pergunta "${question.text}": Resposta: "${answerLabels}"`;
        }).filter(Boolean).join('\n');
        
        const ageAnswer = answers[2]?.[0];
        const ageRangesOver40 = ['35-44', '45-54', '55-64', '65+'];
        const isOver40 = ageAnswer && ageRangesOver40.includes(ageAnswer);
        const userName = name ? name.split(' ')[0] : 'Você';

        let systemInstruction = `
          Você é Simone, uma especialista em emagrecimento para mulheres acima de 40. Sua tarefa é analisar as respostas de um quiz e criar um diagnóstico personalizado, empático e encorajador.

          **NOME DA USUÁRIA:** ${userName}
          **IMPORTANTE:** Comece a resposta se dirigindo a ela pelo nome (Ex: "Olá, ${userName}!"). Use o nome dela de forma natural e pessoal ao longo do texto para criar conexão.

          **Formato da Resposta (Siga EXATAMENTE):**
          A resposta DEVE ter 3 seções, com estes títulos exatos:
          **Análise do seu Perfil**
          **O Caminho para seu Resultado**
          **Meu Convite para Você**

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
              *   Convide-a para conversar com você (Simone) no WhatsApp para receber acesso ao protocolo personalizado através de um **aplicativo exclusivo**.
              *   Exemplo de frase: "Vi que seu caso tem solução. Preparei um protocolo inicial. Clique no botão abaixo para receber o acesso ao nosso aplicativo e começarmos juntas."

          **Estilo de Escrita:**
          *   Seja acolhedora, confiante e use emojis sutis (🍵, ✨, ✅).
          *   Use parágrafos curtos.
          *   Não adicione introduções ou conclusões fora das 3 seções.
        `;

        if (isOver40) {
          systemInstruction += `
          \n**HISTÓRIA PESSOAL (OBRIGATÓRIO PARA ESTA USUÁRIA):**
          Como esta usuária tem 40 anos ou mais, você DEVE incluir sua história pessoal na seção **O Caminho para seu Resultado**. Diga exatamente isto, de forma natural: "Eu entendo perfeitamente sua luta, ${userName}, pois já estive aí. Em 2017, eu eliminei 73kg. Eu sofria com uma compulsão alimentar muito forte e com lipedema grau 3, um quadro que muitos consideravam impossível de reverter. Foi o Monjaro Japonês que me permitiu vencer essa batalha, pois a estratégia é desenhada para ser altamente eficiente em casos como o nosso. Eu sou a prova viva disso." Use isso para gerar confiança.
          `;
        }
        
        const userContent = `Aqui estão as respostas da usuária ${userName} para você analisar:\n${promptSummary}`;

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userContent,
            config: {
                systemInstruction: systemInstruction
            }
        });
        
        const analysisText = geminiResponse.text;

        if (!analysisText || analysisText.trim() === '') {
            console.error("--- GEMINI RESPONSE EMPTY ---");
            console.error("Prompt Summary:", promptSummary);
            console.error("Full Gemini Response:", JSON.stringify(geminiResponse, null, 2));
            return response.status(500).json({ error: 'A IA não conseguiu gerar uma análise para estas respostas. Isso pode ocorrer devido a restrições de segurança ou uma falha temporária. Por favor, tente novamente.' });
        }

        return response.status(200).json({ analysis: analysisText });

    } catch (e: any) {
        console.error("--- DETAILED ERROR in /api/generate ---");
        console.error("Error Message:", e.message);
        console.error("Error Stack:", e.stack);
        if (e.cause) console.error("Error Cause:", e.cause);
        console.error("--- END OF ERROR ---");
        
        let errorMessage = 'A server error has occurred';
        if (e.message) {
            errorMessage += `\n${e.message}`;
        }
        return response.status(500).json({ error: errorMessage });
    }
}
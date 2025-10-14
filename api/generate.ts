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
        { label: 'Sinto que já tentei de tudo e nada funciona 😩', value: 'frustracao' },
        { label: 'Tenho lipedema', value: 'lipedema' },
        { label: 'Nenhuma das opções acima ✅', value: 'nenhuma' },
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
        { label: 'Protocolos naturais / caseiros 🌿', value: 'naturais' },
        { label: 'Cirurgias bariátricas 🏥', value: 'bariatrica' },
        { label: 'Nunca segui nada consistentemente 🤷‍♀️', value: 'inconsistente' },
        ],
    },
    {
        id: 4,
        text: 'Qual seu objetivo principal? 🏆',
        type: QuestionType.Multiple,
        options: [
        { label: 'Emagrecer com saúde e consistência ❤️', value: 'saude' },
        { label: 'Controlar fome e compulsão 🍽️', value: 'fome_compulsao' },
        { label: 'Desinflamar e reduzir retenção ✨', value: 'desinflamar' },
        { label: 'Manter o resultado com equilíbrio ⚖️', value: 'manter' },
        ],
    },
    {
        id: 5,
        text: 'O Monjaro de farmácia sacia, mas não regula. O Monjaro Japonês te dá o controle e a saciedade de forma natural. Você aceita conhecer esse caminho? 🍵',
        type: QuestionType.Single,
        options: [
        { label: 'Sim, quero ter o controle da minha saciedade! ✅', value: 'sim_controle' },
        { label: 'Quero entender melhor como funciona 🤔', value: 'entender_melhor' },
        { label: 'Ainda estou em dúvida 🤷‍♀️', value: 'duvida' },
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
        const { answers } = request.body;
        if (!answers) {
          return response.status(400).json({ error: 'Missing answers in request body' });
        }

        if (!process.env.API_KEY) {
            return response.status(500).json({ error: "A chave da API do Google não foi configurada no ambiente do servidor." });
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

        let personalStoryInstruction = '';
        if (isOver40) {
          personalStoryInstruction = `
          **Instrução Adicional CRÍTICA**: Por a usuária ter 40 anos ou mais, é fundamental que você, Simone, se conecte com ela em um nível pessoal. Na seção **O Caminho para seu Resultado**, integre de forma natural a sua própria história de sucesso. Mencione o seguinte: "Eu entendo perfeitamente sua luta, pois já estive aí. Em 2017, eu eliminei 73kg. Eu sofria com uma compulsão alimentar muito forte e com lipedema grau 3, um quadro que muitos consideravam impossível de reverter. Foi o Monjaro Japonês que me permitiu vencer essa batalha, pois a estratégia é desenhada para ser altamente eficiente em casos como o nosso. Eu sou a prova viva disso." Use essa história para gerar confiança e mostrar que a solução é real e testada.
          `;
        }

        const prompt = \`
          Você é Simone, uma especialista em emagrecimento feminino para mulheres acima de 40 anos. Sua missão é analisar as respostas de um quiz e fornecer um diagnóstico personalizado, empático e encorajador. O objetivo é mostrar que você entende o problema da usuária e que o 'Monjaro Japonês' é a solução ideal para o caso específico dela.

          A análise deve ser dividida em 3 partes claras, usando EXATAMENTE os seguintes títulos em negrito:
          **Análise do seu Perfil**
          **O Caminho para seu Resultado**
          **Meu Convite para Você**

          Aqui estão as respostas da usuária:
          \${promptSummary}

          Com base nessas respostas:
          1.  **Análise do seu Perfil**: Identifique o principal 'bloqueio' do emagrecimento (ex: 'metabolismo hormonal', 'compulsão por ansiedade', 'inflamação crônica'). Leve em consideração a FAIXA ETÁRIA para personalizar a linguagem (ex: se tiver 45-54 anos, pode mencionar menopausa; se tiver 65+, foque em vitalidade). Use as palavras da usuária para criar conexão e mostre que você entende a frustração dela. Seja breve e direto ao ponto.
          2.  **O Caminho para seu Resultado**: Explique de forma simples e direta como o Monjaro Japonês atua EXATAMENTE no bloqueio identificado.
              **Instrução OBRIGATÓRIA sobre Hormônios e Neurotransmissores:** Sempre que mencionar a regulação da saciedade, você DEVE explicar a diferença técnica chave: "Enquanto o Monjaro de farmácia ativa apenas os hormônios GIP e GLP-1, o nosso protocolo Monjaro Japonês é muito mais poderoso. Ele estimula um conjunto completo de hormônios da saciedade — GIP, GLP-1, CCK e PYY — através de alimentos específicos. Para reforçar ainda mais essa sensação, o protocolo inclui alimentos que aumentam a produção de neurotransmissores como serotonina, dopamina e noradrenalina. Eles agem diretamente no centro da fome, inibindo o apetite de forma natural. É por isso que o resultado é tão profundo e duradouro."
              **Instrução OBRIGATÓRIA sobre Relatos:** Para dar prova social, sempre adicione o seguinte relato: "Quem aplicou o método descreve essa sensação impressionante de saciedade natural: a fome some e o corpo fica satisfeito."
              Relacione isso com a idade da usuária. Por exemplo, se ela está na faixa dos 45-54 anos, explique como essa regulação hormonal completa é crucial para combater os desequilíbrios da perimenopausa.
          3.  **Meu Convite para Você**: Faça uma chamada para ação PESSOAL e URGENTE. Diga que, com base nas respostas, você vê uma oportunidade clara de resultado. Convide a usuária para conversar com você (Simone) no WhatsApp para receber o acesso ao protocolo personalizado, que será entregue através do nosso **aplicativo exclusivo**. Ex: "Vi que seu caso tem solução. Preparei um protocolo inicial baseado no que você me contou. Clique no botão abaixo para receber o acesso ao nosso aplicativo e começarmos juntas a sua transformação."
          
          \${personalStoryInstruction}

          Seja acolhedora, confiante e use emojis de forma sutil para criar conexão (🍵, ✨, ✅). Mantenha os parágrafos curtos e de fácil leitura. Não adicione nenhuma introdução ou conclusão fora das 3 seções solicitadas.
        \`;

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.status(200).json({ analysis: geminiResponse.text });

    } catch (e: any) {
        console.error("Error in /api/generate:", e);
        return response.status(500).json({ error: e.message || 'An unknown error occurred.' });
    }
}

import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { QUIZ_DATA } from '../constants';

const WhatsAppIconSVG = () => (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      className="h-8 w-8 inline-block mr-3"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.846 6.069l-1.29 4.723 4.793-1.261z"></path>
    </svg>
  );

interface FinalScreenProps {
  answers: Record<number, string[]>;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ answers }) => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateAnalysis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const promptSummary = QUIZ_DATA.map(question => {
          const answerValues = answers[question.id] || [];
          if (answerValues.length === 0) return null;

          const answerLabels = answerValues.map(value =>
            question.options.find(opt => opt.value === value)?.label || value
          ).join(', ');

          return `- Pergunta "${question.text}": Resposta: "${answerLabels}"`;
        }).filter(Boolean).join('\n');
        
        const ageAnswer = answers[2]?.[0]; // Question ID for age is 2
        const ageRangesOver40 = ['35-44', '45-54', '55-64', '65+'];
        const isOver40 = ageAnswer && ageRangesOver40.includes(ageAnswer);

        let personalStoryInstruction = '';
        if (isOver40) {
          personalStoryInstruction = `
          **Instrução Adicional CRÍTICA**: Por a usuária ter 40 anos ou mais, é fundamental que você, Simone, se conecte com ela em um nível pessoal. Na seção **O Caminho para seu Resultado**, integre de forma natural a sua própria história de sucesso. Mencione o seguinte: "Eu entendo perfeitamente sua luta, pois já estive aí. Em 2017, eu eliminei 73kg. Eu sofria com uma compulsão alimentar muito forte e com lipedema grau 3, um quadro que muitos consideravam impossível de reverter. Foi o Monjaro Japonês que me permitiu vencer essa batalha, pois a estratégia é desenhada para ser altamente eficiente em casos como o nosso. Eu sou a prova viva disso." Use essa história para gerar confiança e mostrar que a solução é real e testada.
          `;
        }

        const prompt = `
          Você é Simone, uma especialista em emagrecimento feminino para mulheres acima de 40 anos. Sua missão é analisar as respostas de um quiz e fornecer um diagnóstico personalizado, empático e encorajador. O objetivo é mostrar que você entende o problema da usuária e que o 'Monjaro Japonês' é a solução ideal para o caso específico dela.

          A análise deve ser dividida em 3 partes claras, usando EXATAMENTE os seguintes títulos em negrito:
          **Análise do seu Perfil**
          **O Caminho para seu Resultado**
          **Meu Convite para Você**

          Aqui estão as respostas da usuária:
          ${promptSummary}

          Com base nessas respostas:
          1.  **Análise do seu Perfil**: Identifique o principal 'bloqueio' do emagrecimento (ex: 'metabolismo hormonal', 'compulsão por ansiedade', 'inflamação crônica'). Leve em consideração a FAIXA ETÁRIA para personalizar a linguagem (ex: se tiver 45-54 anos, pode mencionar menopausa; se tiver 65+, foque em vitalidade). Use as palavras da usuária para criar conexão e mostre que você entende a frustração dela. Seja breve e direto ao ponto.
          2.  **O Caminho para seu Resultado**: Explique de forma simples e direta como o Monjaro Japonês atua EXATAMENTE no bloqueio identificado.
              **Instrução OBRIGATÓRIA sobre Hormônios e Neurotransmissores:** Sempre que mencionar a regulação da saciedade, você DEVE explicar a diferença técnica chave: "Enquanto o Monjaro de farmácia ativa apenas os hormônios GIP e GLP-1, o nosso protocolo Monjaro Japonês é muito mais poderoso. Ele estimula um conjunto completo de hormônios da saciedade — GIP, GLP-1, CCK e PYY — através de alimentos específicos. Para reforçar ainda mais essa sensação, o protocolo inclui alimentos que aumentam a produção de neurotransmissores como serotonina, dopamina e noradrenalina. Eles agem diretamente no centro da fome, inibindo o apetite de forma natural. É por isso que o resultado é tão profundo e duradouro."
              **Instrução OBRIGATÓRIA sobre Relatos:** Para dar prova social, sempre adicione o seguinte relato: "Quem aplicou o método descreve essa sensação impressionante de saciedade natural: a fome some e o corpo fica satisfeito."
              Relacione isso com a idade da usuária. Por exemplo, se ela está na faixa dos 45-54 anos, explique como essa regulação hormonal completa é crucial para combater os desequilíbrios da perimenopausa.
          3.  **Meu Convite para Você**: Faça uma chamada para ação PESSOAL e URGENTE. Diga que, com base nas respostas, você vê uma oportunidade clara de resultado. Convide a usuária para conversar com você (Simone) no WhatsApp para receber o acesso ao protocolo personalizado, que será entregue através do nosso **aplicativo exclusivo**. Ex: "Vi que seu caso tem solução. Preparei um protocolo inicial baseado no que você me contou. Clique no botão abaixo para receber o acesso ao nosso aplicativo e começarmos juntas a sua transformação."
          
          ${personalStoryInstruction}

          Seja acolhedora, confiante e use emojis de forma sutil para criar conexão (🍵, ✨, ✅). Mantenha os parágrafos curtos e de fácil leitura. Não adicione nenhuma introdução ou conclusão fora das 3 seções solicitadas.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setAnalysis(response.text);

      } catch (e) {
        console.error(e);
        setError('Ocorreu um erro ao gerar sua análise. Por favor, tente recarregar a página.');
      } finally {
        setIsLoading(false);
      }
    };

    if (Object.keys(answers).length > 0) {
        generateAnalysis();
    } else {
        setIsLoading(false);
        setAnalysis('Por favor, responda o quiz para receber sua análise personalizada.');
    }
  }, [answers]);

  const renderAnalysis = () => {
    if (!analysis) return null;
    return analysis
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('**')) {
          const headingText = paragraph.replace(/\*\*/g, '');
          return <h3 key={index} className="text-xl md:text-2xl font-bold text-emerald-800 mt-6 mb-3">{headingText}</h3>;
        }
        if (paragraph.trim() === '') {
            return null;
        }
        return <p key={index} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>;
      })
      .filter(Boolean);
  };


  if (isLoading) {
    return (
      <div className="text-center p-6 md:p-10 animate-fade-in w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-4">Analisando suas respostas...</h2>
        <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500"></div>
        </div>
        <p className="text-lg text-gray-600 mt-4">Estamos preparando um diagnóstico personalizado para você. Só um instante! 🍵</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 md:p-10 animate-fade-in w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-4">Ops! Algo deu errado.</h2>
        <p className="text-lg text-gray-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="text-center p-6 md:p-10 animate-fade-in w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-2">Seu resultado está pronto! 🎉</h2>
        <div className="my-6 text-left bg-emerald-50 rounded-xl shadow-inner p-6">
            {renderAnalysis()}
        </div>
      
      <a
        href="https://wa.me/5513996005779"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold text-xl md:text-2xl py-4 px-6 md:px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 animate-pulse"
      >
        <WhatsAppIconSVG />
        Falar com a Simone no WhatsApp ✅
      </a>
    </div>
  );
};

export default FinalScreen;
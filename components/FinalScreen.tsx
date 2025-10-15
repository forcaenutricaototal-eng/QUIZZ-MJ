import React, { useState, useEffect } from 'react';

const WhatsAppIconSVG = () => (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      className="h-6 w-6 inline-block mr-2"
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
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers }),
        });

        const responseBody = await response.text();

        if (!response.ok) {
          let errorMessage = responseBody;
          try {
            const errorJson = JSON.parse(responseBody);
            errorMessage = errorJson.error || responseBody;
          } catch (e) {
            // Not a JSON response, use the raw text.
          }
          throw new Error(errorMessage);
        }
        
        try {
          const data = JSON.parse(responseBody);
          if (data.analysis) {
            setAnalysis(data.analysis);
          } else {
             throw new Error("Resposta do servidor não contém a análise esperada.");
          }
        } catch (e: any) {
          console.error('Falha ao analisar a resposta JSON:', responseBody);
          throw new Error(`A resposta do servidor não está no formato esperado. Detalhe: ${e.message}`);
        }
      } catch (e: any) {
        console.error('Erro ao gerar análise:', e);
        setError(
          `Ocorreu um erro ao gerar sua análise. Por favor, tente recarregar a página. (Detalhe: ${
            e.message || 'Erro desconhecido'
          })`,
        );
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
          return <h3 key={index} className="text-lg md:text-xl font-bold text-emerald-800 mt-6 mb-3">{headingText}</h3>;
        }
        if (paragraph.trim() === '') {
            return null;
        }
        return <p key={index} className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">{paragraph}</p>;
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
        className="mt-4 inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold text-lg md:text-xl py-3 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 animate-pulse"
      >
        <WhatsAppIconSVG />
        Falar com a Simone no WhatsApp ✅
      </a>
    </div>
  );
};

export default FinalScreen;
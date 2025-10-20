import React, { useState, useEffect } from 'react';

interface FinalScreenProps {
  answers: Record<number, string[]>;
  name: string;
}

const WhatsAppIconSVG = () => (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      className="h-6 w-6 inline-block mr-2"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.846 6.069l-1.29 4.723 4.793-1.261z"></path>
    </svg>
);

const FinalScreen: React.FC<FinalScreenProps> = ({ answers, name }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
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
          body: JSON.stringify({ answers, name }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Falha ao gerar la análisis.');
        }
        setAnalysis(data.analysis);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    generateAnalysis();
  }, [answers, name]);

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(p => p.trim() !== '');
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <h3 key={index} className="text-xl font-bold text-emerald-800 mt-6 mb-3">
            {part.slice(2, -2)}
          </h3>
        );
      } else {
        return part.split('\n').map((paragraph, pIndex) =>
          paragraph.trim() ? <p key={`${index}-${pIndex}`} className="text-gray-700 leading-relaxed mb-3">{paragraph}</p> : null
        );
      }
    });
  };

  if (isLoading) {
    return (
      <div className="text-center p-10 animate-fade-in w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl text-gray-800">
        <div className="flex justify-center items-center mb-4">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-emerald-800">Analisando suas respostas...</h2>
        <p className="text-gray-600 mt-2">Estamos preparando uma análise personalizada para você. Só um instante! 🍵</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 animate-fade-in w-full max-w-lg mx-auto bg-red-50 border-l-4 border-red-500 rounded-lg shadow-xl text-red-800">
        <h2 className="text-2xl font-bold">Ocorreu um Erro</h2>
        <p className="text-red-700 mt-2">Não foi possível carregar sua análise.</p>
        <p className="text-sm bg-red-100 p-3 mt-4 rounded-md text-left"><strong>Detalhe:</strong> {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl text-gray-800">
      <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-4 text-center">
        ✨ {name ? `${name}, sua` : 'Sua'} Análise Personalizada está Pronta!
      </h2>
      
      {analysis && (
        <div className="my-6 text-left px-2 border-b pb-6 border-gray-200">
          {renderFormattedText(analysis)}
        </div>
      )}

      <div className="mt-8 text-center p-6 bg-emerald-50 rounded-xl border-2 border-emerald-200">
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-4">
            Comece sua Transformação Agora!
        </h2>
        <p className="text-gray-700 leading-relaxed mb-6 max-w-xl mx-auto">
          O próximo passo é simples. Para receber seu protocolo e tirar todas as suas dúvidas, clique no botão abaixo e fale com nossa especialista no WhatsApp.
        </p>

        <div className="mt-8">
          <a
            href="https://wa.me/5513996005779"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 text-center"
          >
            <WhatsAppIconSVG />
            Falar com Especialista no WhatsApp
          </a>
          <p className="text-gray-500 text-sm mt-4">Clique para tirar suas dúvidas e começar!</p>
        </div>
      </div>
    </div>
  );
};

export default FinalScreen;

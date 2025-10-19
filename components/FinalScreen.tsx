import React, { useState, useEffect } from 'react';

interface FinalScreenProps {
  answers: Record<number, string[]>;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ answers }) => {
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
          body: JSON.stringify({ answers }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Falha ao gerar a análise.');
        }
        setAnalysis(data.analysis);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    generateAnalysis();
  }, [answers]);

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
        <p className="text-gray-600 mt-2">Estamos preparando um diagnóstico personalizado para você. Só um instante! 🍵</p>
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
        ✨ Seu Diagnóstico Personalizado está Pronto!
      </h2>
      
      {analysis && (
        <div className="my-6 text-left px-2 border-b pb-6 border-gray-200">
          {renderFormattedText(analysis)}
        </div>
      )}

      <div className="mt-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-4">
              Comece sua Transformação Agora!
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Você tem duas opções incríveis para dar o próximo passo. Escolha a que melhor se adapta ao seu momento:
          </p>

          <div className="my-8 p-6 bg-emerald-50 rounded-xl border-2 border-emerald-500 shadow-lg relative">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-full">MAIS POPULAR</span>
            <h3 className="text-xl font-bold text-emerald-900 mb-4">Acesso Imediato ao Protocolo</h3>
            <p className="text-gray-600 mb-4">Ideal para quem quer começar agora, de forma independente.</p>
            <ul className="space-y-3 text-left text-gray-700 mb-6">
              <li className="flex items-start">
                <span className="mr-3 text-lg">✅</span>
                <span><strong>Protocolo Detox 10 Japonês</strong> (10 dias para destravar seus hormônios de saciedade)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-lg">📘</span>
                <span>+ <strong>Livro com 20 receitas fitness exclusivas</strong></span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-lg">🚀</span>
                <span><strong>Acesso imediato</strong> por apenas <strong>R$47</strong>!</span>
              </li>
            </ul>
            <a
              href="https://pay.kiwify.com.br/iDBgO2e"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold text-lg md:text-xl py-4 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
              👉 Quero garantir meu Detox por R$47
            </a>
          </div>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-sm text-gray-500">OU</span>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Acompanhamento Premium</h3>
              <p className="text-gray-600 mb-4">
                Prefere um acompanhamento próximo, com grupo de suporte no WhatsApp e acesso ao aplicativo completo?
              </p>
              <a
                href="https://wa.me/5513996005779"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center text-green-600 font-bold hover:text-green-700 hover:underline"
              >
                💬 Clique aqui para falar com a especialista no WhatsApp
              </a>
          </div>
      </div>
    </div>
  );
};

export default FinalScreen;

import React, { useState, useEffect, useCallback } from 'react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { SALES_PAGE_URL } from '../constants';

interface FinalScreenProps {
  name: string;
  answers: Record<number, string[]>;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ name, answers }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, answers }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        // Usa a mensagem de erro da API, se disponível, ou uma mensagem padrão.
        throw new Error(responseBody.error || 'Nossa assistente virtual está com uma alta demanda no momento. Por favor, aguarde um instante e tente novamente.');
      }

      setAnalysis(responseBody.analysis);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Falha ao conectar com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [name, answers]);

  useEffect(() => {
    generateAnalysis();
  }, [generateAnalysis]);

  const handleRetry = () => {
    generateAnalysis();
  };

  const whatsappUrl = "https://wa.me/5513920005779?text=" + encodeURIComponent(`Olá, meu nome é ${name} e acabei de receber minha análise pelo quiz! Tenho interesse no protocolo.`);

  const formatContent = (text: string) => {
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/\n/g, '<br />');
    return { __html: formattedText };
  };

  if (loading) {
    return (
      <div className="text-center p-6 sm:p-10 animate-fade-in w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500 mx-auto"></div>
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 mt-6">Analisando suas respostas...</h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">Estamos preparando um diagnóstico personalizado para você. Por favor, aguarde um instante.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 sm:p-10 animate-fade-in w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl">
        <div className="text-5xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-red-600">Ocorreu um Erro</h2>
        <div className="text-gray-600 mt-4 mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm">{error}</p>
        </div>
        <div className="flex flex-col sm:flex-row-reverse items-center justify-center gap-3">
            <button
                onClick={handleRetry}
                className="font-bold py-3 px-6 rounded-lg text-base transition-colors shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
            >
                Tentar Novamente
            </button>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center gap-3 font-bold py-3 px-6 rounded-lg text-base transition-colors shadow-lg bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
            >
              <WhatsAppIcon />
              Falar com Suporte
            </a>
        </div>
      </div>
    );
  }
  
  if (analysis) {
     return (
        <div className="p-4 sm:p-6 w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl animate-fade-in flex flex-col">
            <div className="text-left space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
                <div dangerouslySetInnerHTML={formatContent(analysis)} />
            </div>

            <div className="text-center mt-8 pt-6 border-t border-gray-200 animate-fade-in flex flex-col items-center gap-4">
                <a
                    href={SALES_PAGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105"
                >
                    Ver meu protocolo personalizado e a oferta
                </a>
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-semibold py-2 px-5 rounded-lg text-sm transition-colors w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white shadow-md"
                >
                    <WhatsAppIcon />
                    Ou, tire suas dúvidas no WhatsApp
                </a>
            </div>
        </div>
     );
  }

  return null;
};

export default FinalScreen;
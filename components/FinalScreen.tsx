import React, { useState, useEffect } from 'react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface FinalScreenProps {
  name: string;
  answers: Record<number, string[]>;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ name, answers }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateAnalysis = async () => {
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
          throw new Error(responseBody.error || 'Ocorreu um erro desconhecido ao gerar a análise.');
        }

        setAnalysis(responseBody.analysis);
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'Falha ao conectar com o servidor. Verifique sua conexão e tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    generateAnalysis();
  }, [name, answers]);

  const formatAnalysis = (text: string) => {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\n/g, '<br />');
    return { __html: formattedText };
  };

  const whatsappUrl = "https://wa.me/5513920005779?text=" + encodeURIComponent(`Olá, meu nome é ${name} e acabei de receber minha análise pelo quiz! Tenho interesse no protocolo.`);

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
        <p className="text-gray-600 mt-4 mb-6 bg-red-50 p-3 rounded-lg border border-red-200 text-sm">{error}</p>
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center justify-center gap-3 font-bold py-3 px-6 rounded-lg text-base transition-colors shadow-lg bg-green-500 hover:bg-green-600 text-white"
        >
          <WhatsAppIcon />
          Falar com Suporte
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 text-center mb-4">
            Análise Pronta, {name}! 🎉
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[50vh] overflow-y-auto text-gray-700 space-y-4 text-left">
           {analysis && <div dangerouslySetInnerHTML={formatAnalysis(analysis)} />}
        </div>
        <div className="text-center mt-6">
            <p className="text-gray-600 mb-4 text-lg">Gostou da análise? Dê o próximo passo na sua jornada!</p>
             <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white transform hover:scale-105"
            >
                <WhatsAppIcon />
                Falar com Especialista
            </a>
        </div>
    </div>
  );
};

export default FinalScreen;

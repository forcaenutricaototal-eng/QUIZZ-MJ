import React, { useState, useEffect, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';

interface FinalScreenProps {
  answers: Record<number, string[]>;
  name: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ answers, name }) => {
  const [isAnalysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isChatLoading]);

  useEffect(() => {
    const generateAnalysis = async () => {
      setAnalysisLoading(true);
      setAnalysisError(null);
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
          throw new Error(data.error || 'Falha ao gerar a análise.');
        }
        
        const analysisText = data.analysis;
        const assistantIntro = `Oi, ${name}! 😊 Tudo bem? Aqui é a Luna, da equipe da Simone. 💕\n\nSua análise completa está acima. Se você tiver alguma dúvida sobre o Monjaro Japonês, é só me perguntar aqui.`;

        setMessages([
          { role: 'model', text: analysisText },
          { role: 'model', text: assistantIntro },
        ]);

      } catch (e: any) {
        setAnalysisError(e.message);
      } finally {
        setAnalysisLoading(false);
      }
    };
    generateAnalysis();
  }, [answers, name]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setChatLoading(true);
    setChatError(null);

    try {
      const historyForApi = newMessages.slice(-10);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: historyForApi }),
      });

      const responseBody = await response.text();

      if (!response.ok) {
        let errorMessage = responseBody;
        try {
          const errorJson = JSON.parse(responseBody);
          errorMessage = errorJson.error || responseBody;
        } catch (e) { /* Not JSON */ }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseBody);
      if (data.message) {
          const modelMessage: Message = { role: 'model', text: data.message };
          setMessages((prev) => [...prev, modelMessage]);
      } else {
          throw new Error("Resposta da assistente não contém a mensagem esperada.");
      }
    } catch (e: any) {
      console.error(e);
      setChatError(`Ocorreu um erro ao conectar com a assistente. (Detalhe: ${e.message})`);
      setMessages((prev) => prev.slice(0, -1));
      setInput(currentInput);
    } finally {
      setChatLoading(false);
    }
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(p => p.trim() !== '');
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <h3 key={index} className="text-lg font-bold text-gray-800 mt-4 mb-2">
            {part.slice(2, -2)}
          </h3>
        );
      } else {
        return part.split('\n').map((paragraph, pIndex) =>
          paragraph.trim() ? <p key={`${index}-${pIndex}`} className="leading-relaxed mb-2 text-sm">{paragraph}</p> : null
        );
      }
    });
  };

  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline font-semibold break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (isAnalysisLoading) {
    return (
      <div className="text-center p-10 animate-fade-in w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl text-gray-800">
        <div className="flex justify-center items-center mb-4">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-emerald-500" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-emerald-800">Analisando suas respostas...</h2>
        <p className="text-gray-600 mt-2">Estamos preparando uma análise personalizada para você. Só um instante! 🍵</p>
      </div>
    );
  }

  if (analysisError) {
    return (
      <div className="text-center p-10 animate-fade-in w-full max-w-lg mx-auto bg-red-50 border-l-4 border-red-500 rounded-lg shadow-xl text-red-800">
        <h2 className="text-2xl font-bold">Ocorreu um Erro</h2>
        <p className="text-red-700 mt-2">Não foi possível carregar sua análise.</p>
        <p className="text-sm bg-red-100 p-3 mt-4 rounded-md text-left"><strong>Detalhe:</strong> {analysisError}</p>
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
     <div className="flex flex-col w-full max-w-3xl h-[85vh] max-h-[800px] bg-white rounded-2xl shadow-xl animate-fade-in border border-gray-200">
        <div className="p-4 border-b border-gray-200 text-center flex-shrink-0">
            <h2 className="text-xl font-bold text-emerald-700">Fale com a Luna, sua assistente IA ✨</h2>
            <p className="text-sm text-gray-500">Sua análise está pronta! Tire suas dúvidas.</p>
        </div>
        
      <div ref={chatContainerRef} className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xl">
                    🌙
                </div>
            )}
            <div
              className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                ? 'bg-emerald-500 text-white rounded-br-lg' 
                : 'bg-gray-100 text-gray-800 rounded-bl-lg'
              }`}
            >
              {index === 0 && msg.role === 'model' 
                ? <div className="max-w-none">{renderFormattedText(msg.text)}</div> 
                : <p className="whitespace-pre-wrap">{renderMessageWithLinks(msg.text)}</p>}
            </div>
          </div>
        ))}
        {isChatLoading && (
            <div className="flex items-end gap-2.5 justify-start">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xl">
                    🌙
                </div>
                <div className="max-w-xs px-4 py-3 rounded-2xl bg-gray-100 text-gray-800">
                    <div className="flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
        {chatError && <p className="text-red-500 text-center text-sm py-2">{chatError}</p>}
      </div>
      
      <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida aqui..."
            disabled={isChatLoading}
            className="flex-1 bg-gray-100 text-gray-800 border border-gray-300 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Digite sua mensagem"
          />
          <button
            type="submit"
            disabled={isChatLoading || !input.trim()}
            className="bg-emerald-500 text-white p-3 rounded-full hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensagem"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinalScreen;
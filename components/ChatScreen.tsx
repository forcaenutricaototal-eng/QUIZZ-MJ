import React, { useState, useEffect, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      { role: 'model', text: 'Seu resultado está pronto! 🎉 Eu sou a Thais, sua assistente. Estou aqui para tirar qualquer dúvida que você tenha antes de falar com a nossa especialista. O que você gostaria de saber?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: newMessages }),
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
        if (data.message) {
            const modelMessage: Message = { role: 'model', text: data.message };
            setMessages((prev) => [...prev, modelMessage]);
        } else {
            throw new Error("Resposta da assistente não contém a mensagem esperada.");
        }
      } catch (e: any) {
        console.error('Falha ao analisar a resposta JSON do chat:', responseBody);
        throw new Error(`A resposta da assistente não está no formato esperado. Detalhe: ${e.message}`);
      }
    } catch (e: any) {
      console.error(e);
      setError(`Ocorreu um erro ao conectar com a assistente. (Detalhe: ${e.message})`);
      setMessages((prev) => prev.slice(0, -1)); // Remove user message on error
      setInput(currentInput); // Restore input
    } finally {
      setIsLoading(false);
    }
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
            className="text-emerald-400 hover:underline font-semibold break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col w-full max-w-2xl h-[80vh] bg-gray-900 rounded-2xl shadow-xl animate-fade-in border border-gray-700">
        <div className="p-4 border-b border-gray-700 text-center">
            <h2 className="text-xl font-bold text-emerald-400">Fale com a Thais, sua assistente IA 🤖</h2>
            <p className="text-sm text-gray-400">Tire suas dúvidas!</p>
        </div>
        
      <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{renderMessageWithLinks(msg.text)}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-700 text-gray-200">
                    <p>Thais está digitando...</p>
                </div>
            </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida aqui..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 text-gray-200 border border-gray-600 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-emerald-500 text-white p-3 rounded-full hover:bg-emerald-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensagem"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
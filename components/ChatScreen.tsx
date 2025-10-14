import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { SendIcon } from './icons/SendIcon';

const WhatsAppIconSVG = () => (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      className="h-6 w-6 inline-block mr-2"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.846 6.069l-1.29 4.723 4.793-1.261z"></path>
    </svg>
);

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (!process.env.API_KEY) {
          throw new Error("A chave da API do Google não foi configurada.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `Você é Lua, uma assistente IA especialista no Monjaro Japonês. Sua missão é tirar as últimas dúvidas, quebrar objeções sobre eficácia, segurança ou processo, e encorajar a pessoa a clicar no link do WhatsApp para falar com a especialista Simone. Seja empática, clara, confiante e sempre guie a conversa para a ação final no WhatsApp. Quando for perguntada sobre como o protocolo funciona, mencione que ele é entregue através de um aplicativo exclusivo, com todo o passo a passo, receitas e acompanhamento. Mantenha as respostas curtas e amigáveis.

Para reforçar os diferenciais do método, incorpore sutilmente os seguintes conceitos em suas respostas:
- 🌿 “Enquanto o Monjaro de farmácia força seu corpo a sentir menos fome… o Monjaro japonês ensina seu corpo a sentir saciedade de forma natural, sem brigar com a sua mente.”
- 🍵 “O segredo japonês não é comer menos… é comer de um jeito que seu corpo peça menos sozinho.”
- 🧘 “Não é sobre viver de dieta. É sobre ensinar seu corpo a se sentir satisfeito mais rápido — e manter isso sem sofrimento.”
- 🪄 “O Monjaro japonês não te emagrece — ele ativa o seu corpo para que você mesmo emagreça de forma natural e definitiva.”

Não revele que você é uma IA, a menos que seja diretamente perguntada.`,
        },
      });

      setMessages([
        { role: 'model', text: 'Seu resultado está pronto! 🎉 Eu sou a Lua, sua assistente. Estou aqui para tirar qualquer dúvida que você tenha antes de falar com a nossa especialista. O que você gostaria de saber?' },
      ]);
    } catch (e: any) {
      console.error(e);
      setError(`Não foi possível iniciar a assistente. (Detalhe: ${e.message})`);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response: GenerateContentResponse = await chatRef.current.sendMessage({ message: currentInput });
      const modelMessage: Message = { role: 'model', text: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e: any) {
      console.error(e);
      setError(`Ocorreu um erro ao conectar com a assistente. (Detalhe: ${e.message})`);
      // Revert state on error
      setMessages(prev => prev.slice(0, -1));
      setInput(currentInput);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl h-[80vh] bg-gray-900 rounded-2xl shadow-xl animate-fade-in border border-gray-700">
        <div className="p-4 border-b border-gray-700 text-center">
            <h2 className="text-xl font-bold text-emerald-400">Fale com a Lua, sua assistente IA 🤖</h2>
            <p className="text-sm text-gray-400">Tire suas dúvidas antes de ir para o WhatsApp!</p>
        </div>
        
      <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-700 text-gray-200">
                    <p>Lua está digitando...</p>
                </div>
            </div>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <a
            href="https://wa.me/5513996005779"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-3 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
            <WhatsAppIconSVG />
            Falar com Simone no WhatsApp
        </a>
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
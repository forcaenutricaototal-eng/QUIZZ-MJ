import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { SendIcon } from './icons/SendIcon';
import { SALES_PAGE_URL } from '../constants';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatScreenProps {
  name: string;
  initialAnalysis: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ name, initialAnalysis }) => {
  const [history, setHistory] = useState<Message[]>([
    { role: 'model', parts: [{ text: initialAnalysis }] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, loading]);

  const formatContent = (text: string) => {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\n/g, '<br />');
    return { __html: formattedText };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input.trim() }] };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setError(null);

    try {
      if (!process.env.API_KEY) {
        throw new Error("A chave da API do Google não foi configurada.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: newHistory.slice(0, -1), // Send all but the last message
      });
      
      const result = await chat.sendMessage({ message: currentInput });
      const response = result;
      
      const modelMessage: Message = { role: 'model', parts: [{ text: response.text }] };
      setHistory(prev => [...prev, modelMessage]);

    } catch (e: any) {
      setError(e.message);
      const errorMessage: Message = { role: 'model', parts: [{ text: `Desculpe, ocorreu um erro: ${e.message}` }] };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const whatsappUrl = "https://wa.me/5513920005779?text=" + encodeURIComponent(`Olá, meu nome é ${name} e acabei de receber minha análise pelo quiz! Tenho interesse no protocolo.`);

  const userHasAskedQuestion = history.some(msg => msg.role === 'user');

  return (
    <div className="p-2 sm:p-4 w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl animate-fade-in flex flex-col h-[85vh] sm:h-[90vh]">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 p-2 sm:p-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-md lg:max-w-lg p-3 rounded-2xl text-left shadow-sm ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="text-sm sm:text-base break-words" dangerouslySetInnerHTML={formatContent(msg.parts[0].text)} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-sm p-3 rounded-2xl bg-gray-100 text-gray-500 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t border-gray-200 p-2 sm:p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tire sua dúvida aqui..."
            className="flex-1 bg-gray-100 border border-gray-300 rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-emerald-500 text-white rounded-full p-3 transition-colors hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Enviar mensagem"
          >
            <SendIcon />
          </button>
        </form>
         <div className="text-center mt-4 animate-fade-in flex flex-col items-center gap-3">
            <a
                href={SALES_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-bold py-3 px-6 rounded-lg text-base transition-all duration-300 shadow-lg w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105"
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
    </div>
  );
};

export default ChatScreen;
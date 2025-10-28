import React from 'react';

const ChatScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl h-[80vh] bg-gray-900 rounded-2xl shadow-xl animate-fade-in border border-gray-700 p-6 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Chat Desativado</h2>
      <p className="text-gray-400">
        A funcionalidade de conversa com a assistente foi temporariamente desativada para evitar custos com a API.
      </p>
    </div>
  );
};

export default ChatScreen;
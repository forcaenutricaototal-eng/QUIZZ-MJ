import React, { useState } from 'react';

interface NameStepProps {
  onSubmit: (name: string) => void;
}

const NameStep: React.FC<NameStepProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 w-full max-w-md mx-auto animate-fade-in text-center">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
        Antes de começarmos...
      </h2>
      <p className="text-gray-700 mb-5 text-sm sm:text-base">
        Para personalizar sua análise, qual é o seu primeiro nome?
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite seu nome aqui"
          className="w-full max-w-sm bg-gray-50 text-gray-800 border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg"
          required
          autoFocus
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="font-bold py-3 px-8 rounded-lg text-base sm:text-lg transition-colors shadow-md w-full max-w-sm bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Começar o Quiz
        </button>
      </form>
    </div>
  );
};

export default NameStep;
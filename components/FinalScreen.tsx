import React from 'react';

// The answers prop is no longer used for generation, but the prop is kept
// to avoid having to modify the App.tsx component, keeping changes minimal.
interface FinalScreenProps {
  answers: Record<number, string[]>;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ answers }) => {

  return (
    <div className="text-center p-6 md:p-10 animate-fade-in w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl text-gray-800">
      <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-4">
        ✨ Você está a um passo da sua transformação!
      </h2>
      
      <div className="my-6 text-left space-y-3 px-2">
        <p className="text-gray-700 leading-relaxed">
          Você acabou de dar o primeiro passo… agora só falta um clique para <strong>ativar os hormônios de saciedade</strong> e transformar sua relação com a comida 🍵
        </p>
        <p className="text-gray-600 text-sm">
          Esse é o mesmo protocolo que tem ajudado centenas de mulheres acima de 40 anos a emagrecer de forma natural e duradoura.
        </p>
      </div>

      <div className="my-8 p-6 bg-emerald-50 rounded-xl border border-emerald-200 shadow-inner">
        <h3 className="text-xl font-bold text-emerald-900 mb-4">Com R$47, você recebe:</h3>
        <ul className="space-y-3 text-left text-gray-700">
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
            <span><strong>Acesso imediato</strong> para começar hoje mesmo!</span>
          </li>
        </ul>
      </div>
      
      <a
        href="https://pay.kiwify.com.br/iDBgO2e"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold text-lg md:text-xl py-4 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 animate-pulse"
      >
        👉 Quero garantir meu Detox 10 agora
      </a>

      <div className="mt-8 text-center border-t pt-6 border-gray-200">
          <p className="text-gray-600 mb-3">
            Ou, se você preferir acompanhamento mais próximo com grupo de suporte no WhatsApp e acesso ao aplicativo completo:
          </p>
          <a
            href="https://wa.me/5513996005779"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center text-green-600 font-bold hover:text-green-700 hover:underline"
          >
            💬 Clique aqui para falar no WhatsApp
          </a>
      </div>
    </div>
  );
};

export default FinalScreen;

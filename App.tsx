import React, { useState } from 'react';
import { QUIZ_DATA } from './constants';
import QuizStep from './components/QuizStep';
import FinalScreen from './components/FinalScreen';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});

  const totalSteps = QUIZ_DATA.length;
  const isQuizFinished = currentStep >= totalSteps;
  const currentQuestion = QUIZ_DATA[currentStep];

  const handleNext = (selectedAnswers: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswers,
    }));
    setCurrentStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const progressPercentage = isQuizFinished ? 100 : (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-3xl mx-auto mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-400">
          🍵 Descubra por que o Monjaro Japonês funciona para você!
        </h1>
        <p className="text-md md:text-lg text-gray-300 mt-2">
          Em poucos minutos você vai identificar o bloqueio que trava seu emagrecimento 🎯 — e ver como agir de forma natural e definitiva.
        </p>
      </header>
      
      <main className="w-full flex-grow flex flex-col items-center justify-center">
        {!isQuizFinished && (
          <div className="w-full max-w-3xl mx-auto mb-4">
            <div className="bg-gray-800 rounded-full h-2.5">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-gray-400 mt-1">Pergunta {currentStep + 1} de {totalSteps}</p>
          </div>
        )}

        {isQuizFinished ? (
          <FinalScreen answers={answers} />
        ) : (
          <QuizStep
            key={currentQuestion.id}
            question={currentQuestion}
            onNext={handleNext}
            onBack={handleBack}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === totalSteps - 1}
            initialSelection={answers[currentQuestion.id] || []}
          />
        )}
      </main>

      <footer className="w-full text-center p-4 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Quiz Monjaro Japonês. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
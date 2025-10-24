import React, { useState } from 'react';
import { QUIZ_DATA } from './constants';
import QuizStep from './components/QuizStep';
import FinalScreen from './components/FinalScreen';
import NameStep from './components/NameStep';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [userName, setUserName] = useState<string>('');
  const [quizStarted, setQuizStarted] = useState(false);

  const totalSteps = QUIZ_DATA.length;
  const isQuizFinished = currentStep >= totalSteps;
  const currentQuestion = QUIZ_DATA[currentStep];

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setQuizStarted(true);
  };

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
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center justify-center p-2 sm:p-4">
      <header className="w-full max-w-3xl mx-auto mb-3 text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-700">
          🍵 Descubra por que o Monjaro Japonês funciona para você!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Em poucos minutos você vai identificar o bloqueio que trava seu emagrecimento 🎯 — e ver como agir de forma natural e definitiva.
        </p>
      </header>
      
      <main className="w-full flex-grow flex flex-col items-center justify-center">
        {!quizStarted ? (
          <NameStep onSubmit={handleNameSubmit} />
        ) : (
          <>
            {!isQuizFinished && (
              <div className="w-full max-w-3xl mx-auto mb-3">
                <div className="bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-right text-xs sm:text-sm text-gray-500 mt-1">Pergunta {currentStep + 1} de {totalSteps}</p>
              </div>
            )}

            {isQuizFinished ? (
              <FinalScreen answers={answers} name={userName} />
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
          </>
        )}
      </main>

      <footer className="w-full text-center p-2 sm:p-4 text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Quiz Monjaro Japonês. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
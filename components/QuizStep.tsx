import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuestionType, Option } from '../types';
import BeforeAfterCard from './BeforeAfterCard';

interface QuizStepProps {
  question: QuizQuestion;
  onNext: (answers: string[]) => void;
  onBack: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  initialSelection: string[];
}

const QuizStep: React.FC<QuizStepProps> = ({ question, onNext, onBack, isLastStep, isFirstStep, initialSelection }) => {
  const [selected, setSelected] = useState<string[]>(initialSelection);
  const [conditionalMessage, setConditionalMessage] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    // Reset state when question changes
    setSelected(initialSelection);
    setConditionalMessage(null);
    setShowTransition(false);
  }, [question.id, initialSelection]);
  
  const handleSelection = (value: string) => {
    let newSelected: string[];

    if (question.type === QuestionType.Single) {
      newSelected = [value];
    } else {
      if (selected.includes(value)) {
        newSelected = selected.filter((item) => item !== value);
      } else {
        newSelected = [...selected, value];
      }
    }
    
    setSelected(newSelected);

    const message = question.conditionalMessages?.[value];
    if (question.type === QuestionType.Single) {
        setConditionalMessage(message || null);
    }

    if (question.transitionMessage) {
      setShowTransition(newSelected.length > 0);
    }
  };
  
  const handleNextClick = () => {
    onNext(selected);
  };
  
  const renderOption = (option: Option) => {
    const isSelected = selected.includes(option.value);
    
    return (
        <div
            key={option.value}
            onClick={() => handleSelection(option.value)}
            className={`flex items-center p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                isSelected 
                ? 'bg-green-50 border-green-500' 
                : 'bg-white hover:bg-gray-50 border-gray-300'
            }`}
        >
            {option.image && (
                <div className="w-16 h-16 flex-shrink-0 mr-4 rounded-md overflow-hidden bg-black">
                    <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                </div>
            )}
            <span className={`flex-1 text-base md:text-lg font-semibold ${isSelected ? 'text-green-900' : 'text-gray-800'}`}>{option.label}</span>
            <div className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center ml-4 ${
                isSelected ? 'bg-green-500 border-green-500' : 'border-gray-400 bg-white'
            }`}>
                {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="p-0 md:p-6 w-full max-w-3xl mx-auto animate-fade-in">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 md:p-8 shadow-lg">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white">{question.text}</h2>
                {question.type === QuestionType.Multiple && (
                <p className="text-gray-400 text-md mt-2">
                    (Selecione uma ou mais opções)
                </p>
                )}
            </div>
            
            <div className="space-y-4 mb-8">
                {question.options.map(renderOption)}
            </div>
        </div>

      {conditionalMessage && !showTransition && (
        <div className="my-6 p-4 bg-gray-800 border-l-4 border-blue-500 text-gray-200 rounded-lg shadow-md animate-fade-in">
          <p>{conditionalMessage}</p>
        </div>
      )}

      {showTransition && question.transitionMessage && (
        <div className="my-6 p-4 bg-gray-800 border-l-4 border-green-500 text-gray-200 rounded-lg shadow-md animate-fade-in">
          <p className="font-semibold">{question.transitionMessage}</p>
        </div>
      )}

      {question.socialProof && !showTransition && (
        <BeforeAfterCard proof={question.socialProof} />
      )}

      <div className="text-center mt-8 flex flex-col sm:flex-row-reverse items-center justify-center gap-4">
        <button
          onClick={handleNextClick}
          disabled={selected.length === 0}
          className="font-bold py-3 px-8 rounded-lg text-base md:text-lg transition-all duration-300 shadow-lg w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {isLastStep ? 'Ver resultado' : 'Avançar'}
        </button>
        {!isFirstStep && (
            <button
                onClick={onBack}
                className="font-bold py-3 px-8 rounded-lg text-base md:text-lg transition-colors w-full sm:w-auto bg-transparent text-gray-300 border border-gray-600 hover:bg-gray-800"
            >
                Voltar
            </button>
        )}
      </div>
    </div>
  );
};

export default QuizStep;
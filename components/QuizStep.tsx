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
    setConditionalMessage(null);
    setShowTransition(false);
  }, [question.id]);
  
  const handleSelection = (value: string) => {
    let newSelected: string[];
    const exclusiveOptions = ['nenhum', 'nenhuma'];

    if (question.type === QuestionType.Single) {
      newSelected = [value];
    } else {
      if (exclusiveOptions.includes(value)) {
        newSelected = selected.includes(value) ? [] : [value];
      } else {
        let currentSelection = selected.filter(item => !exclusiveOptions.includes(item));
        if (currentSelection.includes(value)) {
          newSelected = currentSelection.filter((item) => item !== value);
        } else {
          newSelected = [...currentSelection, value];
        }
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
    const commonClasses = "p-4 rounded-full text-center w-full transition-all duration-200 shadow-md cursor-pointer";
    const selectedClasses = "bg-red-500 text-white font-bold";
    const unselectedClasses = "bg-yellow-400 text-black font-bold hover:bg-red-500 hover:text-white";

    return (
        <div key={option.value} onClick={() => handleSelection(option.value)}
             className={`${commonClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
          {option.label}
        </div>
    );
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-3xl mx-auto animate-fade-in">
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

      {conditionalMessage && !showTransition && (
        <div className="my-6 p-4 bg-white border-l-4 border-blue-500 text-gray-800 rounded-lg shadow-md animate-fade-in">
          <p>{conditionalMessage}</p>
        </div>
      )}

      {showTransition && question.transitionMessage && (
        <div className="my-6 p-4 bg-white border-l-4 border-emerald-500 text-gray-800 rounded-lg shadow-md animate-fade-in">
          <p className="font-semibold">{question.transitionMessage}</p>
        </div>
      )}

      {question.socialProof && !showTransition && (
        <BeforeAfterCard proof={question.socialProof} />
      )}

      <div className="text-center mt-10 flex flex-col sm:flex-row-reverse items-center justify-center gap-4">
        <button
          onClick={handleNextClick}
          disabled={selected.length === 0}
          className={`font-bold py-3 px-12 rounded-lg text-lg transition-colors shadow-md w-full sm:w-auto ${
            showTransition
              ? 'bg-slate-400 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-slate-400 disabled:cursor-not-allowed'
          }`}
        >
          {isLastStep ? 'Ver resultado' : 'Continuar'}
        </button>
        {!isFirstStep && !showTransition && (
            <button
                onClick={onBack}
                className="bg-white text-black font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
                Voltar
            </button>
        )}
      </div>
    </div>
  );
};

export default QuizStep;
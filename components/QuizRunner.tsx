import React, { useState } from 'react';
import { Question } from '../types';

interface QuizRunnerProps {
  questions: Question[];
  onFinish: (score: number) => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({ questions, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Small delay to allow user to see the button click effect before switching
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnswered(false);
        setSelectedOption(null);
      }, 150);
    } else {
      onFinish(score + (selectedOption === currentQuestion.correctIndex ? 0 : 0));
    }
  };

  const getOptionClass = (index: number) => {
    const base = "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 font-medium relative overflow-hidden ";
    
    if (!isAnswered) {
      return base + "border-slate-200 hover:border-primary hover:bg-indigo-50 text-slate-700 hover:shadow-md transform hover:-translate-y-0.5";
    }

    if (index === currentQuestion.correctIndex) {
      return base + "border-green-500 bg-green-50 text-green-800 shadow-md animate-pop ring-2 ring-green-200 ring-offset-1";
    }

    if (index === selectedOption && index !== currentQuestion.correctIndex) {
      return base + "border-red-500 bg-red-50 text-red-800 animate-shake opacity-80";
    }

    return base + "border-slate-200 opacity-40 blur-[0.5px] scale-98";
  };

  // SVG Icons
  const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-600 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );

  const CrossIcon = () => (
    <svg className="w-5 h-5 text-red-600 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-200 rounded-full mb-6 overflow-hidden shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(5, progress)}%` }} // Minimum width for visibility
        ></div>
      </div>

      <div className="mb-2 flex justify-between items-center text-sm font-semibold text-slate-500">
         <span className="bg-slate-100 px-3 py-1 rounded-full">Pregunta {currentIndex + 1} / {questions.length}</span>
         <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">Puntos: {score}</span>
      </div>

      {/* Main Question Card - Key forces re-render animation */}
      <div key={currentIndex} className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 animate-slide-up border border-slate-100/50">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 leading-relaxed">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              disabled={isAnswered}
              className={getOptionClass(idx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 text-sm font-bold border transition-colors duration-300 ${
                    isAnswered 
                      ? (idx === currentQuestion.correctIndex ? 'border-green-500 bg-green-100 text-green-700' : (idx === selectedOption ? 'border-red-500 bg-red-100 text-red-700' : 'border-slate-300'))
                      : 'border-slate-300 text-slate-500 bg-slate-50'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>
                
                {/* Visual Indicators */}
                {isAnswered && idx === currentQuestion.correctIndex && <CheckIcon />}
                {isAnswered && idx === selectedOption && idx !== currentQuestion.correctIndex && <CrossIcon />}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback Section - Height Animation */}
        <div className={`grid transition-all duration-500 ease-out ${isAnswered ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
          <div className="overflow-hidden">
             <div className={`p-5 rounded-xl border-l-4 shadow-sm ${selectedOption === currentQuestion.correctIndex ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <h4 className={`flex items-center gap-2 font-bold text-lg ${selectedOption === currentQuestion.correctIndex ? 'text-green-700' : 'text-red-700'} mb-2`}>
                   {selectedOption === currentQuestion.correctIndex ? (
                     <><span>¡Correcto!</span> <span className="text-2xl">🎉</span></>
                   ) : (
                     <><span>Incorrecto</span> <span className="text-2xl">🤔</span></>
                   )}
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
             </div>
          </div>
        </div>
      </div>

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full py-4 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 animate-fade-in"
        >
          {currentIndex === questions.length - 1 ? 'Ver Resultados Finales' : 'Siguiente Pregunta'}
        </button>
      )}
    </div>
  );
};
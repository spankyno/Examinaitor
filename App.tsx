import React, { useState, useEffect } from 'react';
import { QuizConfig, Question, HistoryItem, QuizResult } from './types';
import { generateQuizQuestions } from './services/geminiService';
import { ConfigForm } from './components/ConfigForm';
import { QuizRunner } from './components/QuizRunner';
import { HistoryList } from './components/HistoryList';
import { saveHistory, getHistory, hasConsented, giveConsent } from './utils/cookieUtils';

type ViewState = 'home' | 'quiz' | 'result';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cookieConsent, setCookieConsent] = useState(true); // Default true to avoid flash, check in effect
  
  // Quiz State
  const [currentConfig, setCurrentConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    // Load history
    setHistory(getHistory());
    // Check consent
    setCookieConsent(hasConsented());
  }, []);

  const handleStartQuiz = async (config: QuizConfig) => {
    setLoading(true);
    try {
      const generatedQuestions = await generateQuizQuestions(config);
      setQuestions(generatedQuestions);
      setCurrentConfig(config);
      setView('quiz');
    } catch (error) {
      alert("Error generando el examen. Por favor revisa tu API Key o inténtalo de nuevo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizFinish = (score: number) => {
    if (!currentConfig) return;

    const result: QuizResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      topic: currentConfig.topic,
      score: score,
      totalQuestions: currentConfig.numQuestions,
      difficulty: currentConfig.difficulty
    };

    saveHistory(result);
    setHistory(getHistory());
    setLastResult(result);
    setView('result');
  };

  const handleAcceptCookies = () => {
    giveConsent();
    setCookieConsent(true);
  };

  const resetApp = () => {
    setView('home');
    setQuestions([]);
    setCurrentConfig(null);
    setLastResult(null);
  };

  const getScoreColorGradient = (score: number, total: number) => {
    const p = score / total;
    if (p < 0.4) return 'bg-gradient-to-br from-red-500 to-rose-600';
    if (p < 0.6) return 'bg-gradient-to-br from-orange-400 to-amber-500';
    if (p < 0.8) return 'bg-gradient-to-br from-green-400 to-emerald-600';
    return 'bg-gradient-to-br from-blue-500 to-indigo-600';
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={resetApp}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30 transform group-hover:scale-110 transition-transform duration-300">
              E
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Examinaitor</h1>
          </div>
          {view !== 'home' && (
            <button onClick={resetApp} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 px-3 py-1.5 rounded-lg">
              Salir
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 overflow-hidden">
        <div className="max-w-5xl mx-auto w-full">
          
          {/* HOME VIEW */}
          {view === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Left Col: Config Form */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
                  <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">Crear Nuevo Examen</h2>
                  <p className="text-slate-500 mb-6">Define los parámetros o sube un documento PDF para empezar.</p>
                  <ConfigForm onStart={handleStartQuiz} isLoading={loading} />
                </div>
              </div>

              {/* Right Col: History */}
              <div className="lg:col-span-5">
                 <div className="bg-slate-100/50 rounded-2xl p-6 border border-slate-200/60 sticky top-24 backdrop-blur-sm">
                   <HistoryList history={history} />
                 </div>
              </div>
            </div>
          )}

          {/* QUIZ VIEW */}
          {view === 'quiz' && (
            <div className="animate-fade-in">
              <QuizRunner questions={questions} onFinish={handleQuizFinish} />
            </div>
          )}

          {/* RESULT VIEW */}
          {view === 'result' && lastResult && (
             <div className="max-w-lg mx-auto text-center mt-10 animate-slide-up">
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                   <div className={`${getScoreColorGradient(lastResult.score, lastResult.totalQuestions)} p-12 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 animate-pulse"></div>
                      <h2 className="text-3xl font-bold mb-2 relative z-10">Examen Completado</h2>
                      <p className="opacity-90 relative z-10">{lastResult.topic}</p>
                      
                      <div className="mt-8 relative inline-flex items-center justify-center animate-pop">
                        <span className="text-8xl font-extrabold tracking-tighter drop-shadow-md">
                          {lastResult.score}
                        </span>
                        <span className="text-3xl opacity-75 font-medium ml-2 relative top-2">/{lastResult.totalQuestions}</span>
                      </div>
                   </div>
                   
                   <div className="p-8">
                     <p className="text-slate-600 mb-8 text-lg font-medium">
                       {lastResult.score / lastResult.totalQuestions >= 0.5 
                         ? "¡Buen trabajo! Has superado la prueba." 
                         : "Sigue practicando para mejorar tu puntuación."}
                     </p>
                     
                     <button 
                       onClick={resetApp}
                       className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                     >
                       Volver al Inicio
                     </button>
                   </div>
                </div>
             </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Examinaitor - By Aitor Sánchez Gutiérrez</p>
      </footer>

      {/* Cookie Consent Banner */}
      {!cookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur text-white p-4 shadow-2xl z-50 transform transition-transform duration-500 animate-slide-up">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-center sm:text-left">
              Utilizamos cookies para almacenar tu historial de resultados. Al continuar, aceptas su uso.
            </p>
            <div className="flex gap-3">
               <button 
                 onClick={handleAcceptCookies}
                 className="px-6 py-2 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-slate-100 hover:scale-105 transition-all"
               >
                 Aceptar
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
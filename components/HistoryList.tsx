import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
}

const getScoreColorClass = (score: number, total: number): string => {
  const percentage = score / total;
  if (percentage < 0.4) return 'from-red-500 to-red-600'; // 0-4
  if (percentage < 0.6) return 'from-orange-400 to-yellow-500'; // 4-6
  if (percentage < 0.8) return 'from-green-400 to-emerald-500'; // 6-8
  return 'from-blue-500 to-indigo-600'; // 8-10
};

export const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 italic">
        No hay tests anteriores. ¡Crea el primero!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Últimos Resultados</h3>
      {history.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex items-center justify-between transition-transform hover:scale-[1.01]">
          <div>
            <p className="font-medium text-slate-800">{item.topic}</p>
            <p className="text-xs text-slate-500">
              {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              <span className="mx-1">•</span> 
              {item.difficulty}
            </p>
          </div>
          <div className={`bg-gradient-to-r ${getScoreColorClass(item.score, item.totalQuestions)} text-white font-bold py-1 px-3 rounded-full text-sm shadow-md`}>
            {item.score}/{item.totalQuestions}
          </div>
        </div>
      ))}
    </div>
  );
};
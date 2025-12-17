import React, { useState, useCallback } from 'react';
import { QuizConfig, Difficulty, QuizMode } from '../types';

interface ConfigFormProps {
  onStart: (config: QuizConfig) => void;
  isLoading: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onStart, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState<number | ''>(10);
  const [numOptions, setNumOptions] = useState<number | ''>(3);
  const [mode, setMode] = useState<QuizMode>(QuizMode.MULTIPLE_CHOICE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        // Auto-fill topic if empty
        if (!topic) setTopic(droppedFile.name.replace('.pdf', ''));
      } else {
        alert("Por favor sube solo archivos PDF.");
      }
    }
  }, [topic]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!topic) setTopic(e.target.files[0].name.replace('.pdf', ''));
    }
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: React.Dispatch<React.SetStateAction<number | ''>>
  ) => {
    const value = e.target.value;
    if (value === '') {
      setter('');
    } else {
      const parsed = parseInt(value);
      if (!isNaN(parsed)) {
        setter(parsed);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let fileBase64: string | undefined = undefined;

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise<void>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          // remove data:application/pdf;base64, prefix
          fileBase64 = result.split(',')[1];
          resolve();
        };
      });
    }

    onStart({
      topic: topic || "Conocimiento General",
      fileBase64,
      fileMimeType: file?.type,
      numQuestions: Number(numQuestions) || 10,
      numOptions: Number(numOptions) || 3,
      mode,
      difficulty
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Topic Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tema del Examen</label>
        <input 
          type="text" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ej: Segunda Guerra Mundial"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Drag & Drop Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? 'border-primary bg-indigo-50' : 'border-slate-300 hover:border-primary/50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <svg className={`w-12 h-12 mb-3 ${file ? 'text-green-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm font-medium text-slate-600">
            {file ? `Archivo seleccionado: ${file.name}` : 'Arrastra un PDF aquí o haz clic para subir'}
          </span>
          <span className="text-xs text-slate-400 mt-1">Opcional. Se usará como base para las preguntas.</span>
        </label>
        {file && (
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); setFile(null); }}
            className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
          >
            Quitar archivo
          </button>
        )}
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nº Preguntas</label>
          <input 
            type="number" 
            min={1} 
            max={20} 
            value={numQuestions}
            onChange={(e) => handleNumberChange(e, setNumQuestions)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Dificultad</label>
           <select 
             value={difficulty} 
             onChange={(e) => setDifficulty(e.target.value as Difficulty)}
             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:outline-none bg-white"
           >
             {Object.values(Difficulty).map((d) => (
               <option key={d} value={d}>{d}</option>
             ))}
           </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Modo de Juego</label>
           <select 
             value={mode} 
             onChange={(e) => setMode(e.target.value as QuizMode)}
             className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:outline-none bg-white"
           >
             {Object.values(QuizMode).map((m) => (
               <option key={m} value={m}>{m}</option>
             ))}
           </select>
        </div>

        {mode === QuizMode.MULTIPLE_CHOICE && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nº Respuestas</label>
            <input 
              type="number" 
              min={2} 
              max={5} 
              value={numOptions}
              onChange={(e) => handleNumberChange(e, setNumOptions)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:outline-none"
            />
          </div>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isLoading || (!topic && !file)}
        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:-translate-y-1 active:scale-95
          ${isLoading || (!topic && !file) 
            ? 'bg-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-primary to-indigo-600 hover:shadow-indigo-500/30'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando examen...
          </span>
        ) : (
          "COMENZAR EXAMEN"
        )}
      </button>

    </form>
  );
};
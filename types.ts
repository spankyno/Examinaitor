export enum Difficulty {
  EASY = 'Fácil',
  MEDIUM = 'Medio',
  HARD = 'Difícil'
}

export enum QuizMode {
  MULTIPLE_CHOICE = 'Libre',
  TRUE_FALSE = 'Verdadero/Falso'
}

export interface QuizConfig {
  topic: string;
  fileBase64?: string;
  fileMimeType?: string;
  numQuestions: number;
  numOptions: number; // Ignored if True/False
  mode: QuizMode;
  difficulty: Difficulty;
}

export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  date: string; // ISO string
  topic: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
}

export interface HistoryItem extends QuizResult {}
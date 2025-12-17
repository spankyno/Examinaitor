import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizConfig, Question, QuizMode } from "../types";

// Initialize the client. 
// Note: In a real Vercel deployment, ensure API_KEY is set in Environment Variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The text of the question or statement.",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The list of possible answers. If True/False mode, must be ['Verdadero', 'Falso'].",
    },
    correctIndex: {
      type: Type.INTEGER,
      description: "The index of the correct option in the options array (0-based).",
    },
    explanation: {
      type: Type.STRING,
      description: "A short explanation of why the answer is correct.",
    },
  },
  required: ["question", "options", "correctIndex", "explanation"],
};

export const generateQuizQuestions = async (config: QuizConfig): Promise<Question[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY not found in environment variables.");
  }

  const isTrueFalse = config.mode === QuizMode.TRUE_FALSE;
  
  let promptText = `Genera un examen tipo test de dificultad ${config.difficulty}.
  Tema: "${config.topic}".
  Cantidad de preguntas: ${config.numQuestions}.
  `;

  if (isTrueFalse) {
    promptText += `
    Modo: Verdadero/Falso.
    Las preguntas deben ser afirmaciones.
    El array de "options" SIEMPRE debe ser exactamente ["Verdadero", "Falso"].
    `;
  } else {
    promptText += `
    Modo: Selección múltiple.
    Número de opciones por pregunta: ${config.numOptions}.
    `;
  }

  if (config.fileBase64) {
    promptText += `
    Usa el documento PDF adjunto como la ÚNICA fuente de información para generar las preguntas.
    `;
  } else {
    promptText += `
    Usa tu conocimiento general sobre el tema para generar las preguntas.
    `;
  }

  const parts: any[] = [];
  
  if (config.fileBase64) {
    parts.push({
      inlineData: {
        mimeType: config.fileMimeType || 'application/pdf',
        data: config.fileBase64
      }
    });
  }
  
  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: questionSchema,
        },
        temperature: 0.7, // Balanced creativity
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return parsed as Question[];
    } else {
      throw new Error("No response text generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
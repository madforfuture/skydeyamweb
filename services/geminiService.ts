import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysisResult, OptimizationMode, JobRole, DailyContent } from "../types";

export const analyzeResume = async (
  resumeText: string, 
  jobDescription: string, 
  mode: OptimizationMode,
  identity?: string
): Promise<ResumeAnalysisResult> => {
  const apiKey = process.env.API_KEY;
  const interviewer = identity === 'Sky' ? 'Ghost' : 'Sky';

  if (!apiKey) {
    throw new Error("API Key missing");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = `
      You are an expert Resume Optimizer and Mock Interview Assistant.
      Current Mode: ${mode}
    `;

    if (mode === OptimizationMode.INTERVIEW) {
      systemInstruction += `
        STRICT RULES FOR INTERVIEW OPTIMIZATION:
        1. NO FAKE EXPERIENCE. Do not change facts or dates.
        2. SIMPLICITY: Every point must be easy to explain verbally in 2-3 minutes. Avoid jargon-heavy fluff.
        3. PROFESSIONAL SUMMARY: Rewrite as a "Tell me about yourself" conversational answer (approx 150 words).
        4. EXPERIENCE BULLETS: Use the STAR method (Situation, Task, Action, Result) exclusively.
        5. PROJECTS: Rewrite in PARR format: 
           - Problem Faced
           - Action Taken
           - Reason for this approach
           - Result (with metrics)
           Add an "Interview Hook" (a curiosity-inducing question the interviewer might ask).
        6. PROBLEM-SOLVING HIGHLIGHTS: Generate a new section focusing on Debugging, Decision-making, and Ownership.
        7. ACHIEVEMENTS: Format as "Action + Impact + Discussion Hook".
        8. INTERVIEWER NOTES: Generate specific notes for "${interviewer}" who is interviewing "${identity}".
           Include 5 targeted questions, 2 deep-dives, and 1 behavioral question.
      `;
    }

    const prompt = `
      JOB DESCRIPTION: ${jobDescription}
      CANDIDATE RESUME: ${resumeText}
      
      ${mode === OptimizationMode.INTERVIEW ? `Candidate Name: ${identity}, Interviewer Name: ${interviewer}` : ''}
      
      Return a JSON object matching the requested schema. End the response text with "This resume is optimized for confident interviews."
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        atsAnalysis: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalIssues: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "missingKeywords", "matchedKeywords", "criticalIssues"]
        },
        summary: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            original: { type: Type.STRING },
            optimized: { type: Type.STRING },
            feedback: { type: Type.STRING }
          },
          required: ["title", "optimized"]
        },
        skills: {
          type: Type.OBJECT,
          properties: { title: { type: Type.STRING }, optimized: { type: Type.STRING } }
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              original: { type: Type.STRING },
              optimized: { type: Type.STRING },
              feedback: { type: Type.STRING },
              hook: { type: Type.STRING },
              star: {
                type: Type.OBJECT,
                properties: {
                  s: { type: Type.STRING },
                  t: { type: Type.STRING },
                  a: { type: Type.STRING },
                  r: { type: Type.STRING }
                }
              }
            }
          }
        },
        education: { type: Type.OBJECT, properties: { optimized: { type: Type.STRING } } },
        problemSolving: { type: Type.ARRAY, items: { type: Type.STRING } },
        interviewerNotes: {
          type: Type.OBJECT,
          properties: {
            interviewerName: { type: Type.STRING },
            targetedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            deepDiveQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            behavioralQuestion: { type: Type.STRING }
          }
        },
        prepTips: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["atsAnalysis", "summary", "experience"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const data = JSON.parse(response.text || "{}");
    if (mode === OptimizationMode.INTERVIEW) {
      data.candidateName = identity;
    }
    return data as ResumeAnalysisResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateDailyContent = async (role: JobRole): Promise<DailyContent> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate daily vocabulary and 2 MCQs for role: ${role}. Include a quote.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            jobRole: { type: Type.STRING },
            quote: { type: Type.STRING },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  example: { type: Type.STRING },
                  memoryTrick: { type: Type.STRING }
                }
              }
            },
            mcqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}") as DailyContent;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
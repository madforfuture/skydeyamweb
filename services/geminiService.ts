import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysisResult, OptimizationMode, JobRole, DailyContent } from "../types";

// --- MOCK DATA FOR RESUME ---
const MOCK_RESUME_RESULT: ResumeAnalysisResult = {
  atsAnalysis: {
    score: 72,
    missingKeywords: ["React Native", "GraphQL", "Agile Methodology", "CI/CD"],
    matchedKeywords: ["JavaScript", "React", "TypeScript", "Frontend"],
    criticalIssues: ["Summary is too generic", "Lack of quantifiable metrics in experience"]
  },
  summary: {
    title: "Professional Summary",
    original: "Frontend developer with 5 years of experience in building websites using React and JS.",
    optimized: "Results-oriented Senior Frontend Developer with 5+ years of experience architecting scalable web applications using React, TypeScript, and Modern JavaScript. Proven track record of improving site performance by 40% and leading Agile teams in high-paced environments.",
    feedback: "Expanded to include strong action verbs and specific years of experience. Added 'Senior' and 'Architecting' to align with the JD."
  },
  skills: {
    title: "Skills",
    original: "HTML, CSS, JS, React, Git.",
    optimized: "Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3\nFrameworks: React.js, Next.js, Redux, Tailwind CSS\nTools: Git, Webpack, Docker, CI/CD Pipelines\nMethodologies: Agile/Scrum, TDD",
    feedback: "Categorized skills for better readability and added missing technical keywords found in the Job Description."
  },
  experience: [
    {
      title: "Senior Developer at Tech Corp",
      original: "Worked on the main dashboard. Fixed bugs. Talked to clients.",
      optimized: "• Spearheaded the development of the primary analytics dashboard, reducing data load times by 35%.\n• Resolved 50+ critical bugs leading to a 20% increase in user retention.\n• Collaborated directly with key stakeholders to define product requirements and roadmap.",
      feedback: "Replaced passive phrases like 'Worked on' with strong action verbs 'Spearheaded' and 'Collaborated'. Added fake metrics for demonstration."
    }
  ],
  education: {
    title: "Education",
    original: "BS Computer Science, University of Technology",
    optimized: "Bachelor of Science in Computer Science | University of Technology",
    feedback: "Standardized formatting."
  }
};

// --- MOCK DATA FOR VOCABULARY ---
const MOCK_VOCAB_RESULT: DailyContent = {
  date: new Date().toISOString().split('T')[0],
  jobRole: JobRole.SOFTWARE_DEVELOPER,
  quote: "First, solve the problem. Then, write the code. – John Johnson",
  words: [
    {
      word: "Idempotency",
      meaning: "A property of an operation where applying it multiple times has the same effect as applying it once.",
      example: "In REST APIs, GET requests should be idempotent so that retrying a failed request doesn't duplicate data.",
      memoryTrick: "Idem (Same) + Potence (Power) = Same result every time."
    },
    {
      word: "Latency",
      meaning: "The time delay between the cause and the effect of some physical change in the system being observed.",
      example: "We optimized the database queries to reduce the latency experienced by users during login.",
      memoryTrick: "Late-ency = How 'late' the response is."
    },
    {
      word: "Scalability",
      meaning: "The measure of a system's ability to increase or decrease in performance and cost in response to changes in application and system processing demands.",
      example: "The microservices architecture improved the scalability of our platform during Black Friday sales.",
      memoryTrick: "Scale-ability = Ability to go up the scale."
    },
    {
      word: "Concurrency",
      meaning: "The ability of different parts or units of a program, algorithm, or problem to be executed out-of-order or in partial order, without affecting the final outcome.",
      example: "Go's goroutines make handling concurrency much easier than managing traditional threads.",
      memoryTrick: "Con-current = Events running currently (at the same time)."
    },
    {
      word: "Abstraction",
      meaning: "The process of removing physical, spatial, or temporal details or attributes in the study of objects or systems to focus attention on details of greater importance.",
      example: "We used an abstraction layer to hide the complexity of the underlying raw SQL queries.",
      memoryTrick: "Abstract art = Removes details to show the essence."
    }
  ],
  mcqs: [
    {
      question: "Which concept ensures that a function call produces the same result regardless of how many times it is executed?",
      options: ["Latency", "Idempotency", "Recursion", "Polymorphism"],
      correctAnswer: 1,
      explanation: "Idempotency ensures that multiple identical requests have the same effect as a single request."
    },
    {
      question: "What is high latency indicative of in a web application?",
      options: ["Fast performance", "Slow response times", "High security", "Efficient code"],
      correctAnswer: 1,
      explanation: "Latency refers to delay; therefore, high latency means slow response times."
    }
  ]
};

// --- API FUNCTIONS ---

export const analyzeResume = async (
  resumeText: string, 
  jobDescription: string, 
  mode: OptimizationMode
): Promise<ResumeAnalysisResult> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API Key found. Using mock data for resume.");
    return new Promise(resolve => setTimeout(() => resolve(MOCK_RESUME_RESULT), 2000));
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      You are an expert Resume Writer and ATS Optimization Specialist. 
      Your goal is to rewrite a user's resume to strictly match a provided Job Description (JD).
      
      Rules:
      1. Quantify achievements where possible (add placeholders like [X]% if unknown, but try to infer context).
      2. Use strong action verbs (Architected, Spearheaded, Engineered).
      3. Do NOT invent fake companies, but you CAN rephrase existing tasks to sound more impressive and relevant to the JD.
      4. If the Resume is very short, expand it logically based on the title.
      
      Mode: ${mode}
    `;

    const prompt = `
      JOB DESCRIPTION:
      ${jobDescription}

      CURRENT RESUME CONTENT:
      ${resumeText}

      Analyze the resume against the JD.
      Return a JSON object with:
      1. ATS Analysis (score 0-100, missing keywords, matched keywords, critical issues).
      2. Optimized versions of Summary, Skills, Experience (Array), and Education.
      3. Comparison feedback for each section explaining WHY changes were made.
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
          required: ["title", "original", "optimized", "feedback"]
        },
        skills: {
           type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            original: { type: Type.STRING },
            optimized: { type: Type.STRING },
            feedback: { type: Type.STRING }
          },
          required: ["title", "original", "optimized", "feedback"]
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
             properties: {
              title: { type: Type.STRING },
              original: { type: Type.STRING },
              optimized: { type: Type.STRING },
              feedback: { type: Type.STRING }
            },
            required: ["title", "original", "optimized", "feedback"]
          }
        },
        education: {
           type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            original: { type: Type.STRING },
            optimized: { type: Type.STRING },
            feedback: { type: Type.STRING }
          },
          required: ["title", "original", "optimized", "feedback"]
        }
      },
      required: ["atsAnalysis", "summary", "skills", "experience", "education"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    return JSON.parse(text) as ResumeAnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    return MOCK_RESUME_RESULT;
  }
};

export const generateDailyContent = async (role: JobRole): Promise<DailyContent> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API Key found. Using mock data for vocabulary.");
    return new Promise(resolve => setTimeout(() => resolve(MOCK_VOCAB_RESULT), 1500));
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const systemInstruction = `
      You are a specialized English Vocabulary Tutor for specific careers.
      Role Context: ${role}
      
      Generate 5 advanced or industry-specific vocabulary words relevant to this role.
      Include a meaning, a real-world example sentence related to the job, and a memory trick.
      Also include 2 Multiple Choice Questions (MCQs) to test understanding.
      Include a short motivational quote at the end.
    `;

    const prompt = `Generate Daily Vocabulary content for today: ${today}.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING },
        jobRole: { type: Type.STRING }, // Validating enum in TS after parse
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
            },
            required: ["word", "meaning", "example", "memoryTrick"]
          }
        },
        mcqs: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      },
      required: ["date", "jobRole", "words", "mcqs", "quote"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const data = JSON.parse(text);
    // Ensure date is ISO string for consistency
    data.date = new Date().toISOString().split('T')[0];
    return data as DailyContent;

  } catch (error) {
    console.error("Vocabulary generation failed:", error);
    return MOCK_VOCAB_RESULT;
  }
};
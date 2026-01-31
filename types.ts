export enum OptimizationMode {
  IMPROVE = "Improve Existing",
  CREATE_NEW = "Create New from JD",
  ATS_FOCUS = "ATS Optimization",
  INTERVIEW = "Interview Focused"
}

export interface SectionComparison {
  title: string;
  original: string;
  optimized: string;
  feedback: string;
  hook?: string; // Interview hook for interviewer
}

export interface AtsAnalysis {
  score: number;
  missingKeywords: string[];
  matchedKeywords: string[];
  criticalIssues: string[];
}

export interface InterviewerNotes {
  interviewerName: string;
  targetedQuestions: string[];
  deepDiveQuestions: string[];
  behavioralQuestion: string;
}

export interface ResumeAnalysisResult {
  atsAnalysis: AtsAnalysis;
  summary: SectionComparison;
  skills: SectionComparison;
  experience: (SectionComparison & { 
    star?: { s: string; t: string; a: string; r: string } 
  })[];
  education: SectionComparison;
  // Specialized fields for Interview Mode
  problemSolving?: string[];
  interviewerNotes?: InterviewerNotes;
  prepTips?: string[];
  candidateName?: string;
}

export interface UserInput {
  jobDescription: string;
  resumeContent: string;
  mode: OptimizationMode;
}

export enum JobRole {
  SOFTWARE_DEVELOPER = "Software Developer",
  PRODUCT_MANAGER = "Product Manager",
  DATA_SCIENTIST = "Data Scientist",
  DESIGNER = "Designer",
  MARKETER = "Marketer",
  UPSC_GOVT = "UPSC / Govt Exams"
}

export interface VocabularyWord {
  word: string;
  meaning: string;
  example: string;
  memoryTrick: string;
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface DailyContent {
  date: string;
  jobRole: JobRole;
  words: VocabularyWord[];
  mcqs?: MCQ[];
  quote: string;
}
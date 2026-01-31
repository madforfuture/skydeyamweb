import { DailyContent, JobRole } from "../types";

const KEY_JOB_ROLE = "sg_job_role";
const KEY_HISTORY = "sg_history";

export const getStoredJobRole = (): JobRole => {
  const stored = localStorage.getItem(KEY_JOB_ROLE);
  return (stored as JobRole) || JobRole.SOFTWARE_DEVELOPER;
};

export const setStoredJobRole = (role: JobRole) => {
  localStorage.setItem(KEY_JOB_ROLE, role);
};

export const getHistory = (): DailyContent[] => {
  const stored = localStorage.getItem(KEY_HISTORY);
  return stored ? JSON.parse(stored) : [];
};

export const saveToHistory = (content: DailyContent) => {
  const history = getHistory();
  // Check if entry for this date/role already exists to avoid dupes
  const exists = history.findIndex(h => h.date === content.date && h.jobRole === content.jobRole);
  
  if (exists >= 0) {
    history[exists] = content;
  } else {
    history.push(content);
  }
  
  // Keep only last 30 entries to save space
  if (history.length > 30) history.shift();
  
  localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
};

export const getContentForDate = (date: string, role: JobRole): DailyContent | undefined => {
  const history = getHistory();
  return history.find(h => h.date === date && h.jobRole === role);
};
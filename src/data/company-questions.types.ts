// Types for company-questions.json

export interface CompanyFrequency {
  name: string;
  frequency: number;
}

export interface Question {
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  link: string;
  topics: string[];
  acceptanceRate: number;
  companies: CompanyFrequency[];
  maxFrequency: number;
}

export interface CompanySummary {
  name: string;
  questionCount: number;
}

export interface CompanyQuestionsData {
  totalQuestions: number;
  totalCompanies: number;
  questions: Question[];
  companySummary: CompanySummary[];
}

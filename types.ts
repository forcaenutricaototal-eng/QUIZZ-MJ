export enum QuestionType {
  Single = 'SINGLE',
  Multiple = 'MULTIPLE',
}

export interface Option {
  label: string;
  value: string;
  image?: string;
}

export interface SocialProof {
  beforeImage?: string;
  afterImage?: string;
  name: string;
  result: string;
  description: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  subtitle?: string;
  type: QuestionType;
  options: Option[];
  transitionMessage?: string;
  conditionalMessages?: { [key: string]: string };
  socialProof?: SocialProof;
}
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  RESEARCH = 'RESEARCH',
  DOCUMENT_WRITER = 'DOCUMENT_WRITER',
  FIELD_TRIP = 'FIELD_TRIP',
  TECHNICAL_REPORT = 'TECHNICAL_REPORT',
  LAB_REPORT = 'LAB_REPORT',
  CAREER = 'CAREER',
  DATA_CRUNCHER = 'DATA_CRUNCHER',
  COMMUNITY = 'COMMUNITY',
  INBOX = 'INBOX',
  NOTIFICATIONS = 'NOTIFICATIONS',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE'
}

export interface ProjectTitle {
  title: string;
  description: string;
  requirements: string[];
}

export interface SlideDeck {
  title: string;
  slides: {
    header: string;
    content: string[];
    visualCue?: string;
  }[];
}

export interface CVData {
  fullName: string;
  email: string;
  phone: string;
  education: string;
  experience: string;
  skills: string;
}

export interface AnalysisResult {
  summary: string;
  keyTrends: string[];
  recommendation: string;
}

export interface FieldTable {
  id: string;
  name: string;
  headers: string[];
  rows: string[][];
  collapsed: boolean;
}

export interface YouTubeVideo {
  title: string;
  url: string;
  description: string;
}

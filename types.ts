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
  PROFILE = 'PROFILE',
  ASSIGNMENT = 'ASSIGNMENT',
  COMPRESSOR = 'COMPRESSOR'
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

export interface Citation {
  id: string;
  type: 'WEBSITE' | 'BOOK' | 'JOURNAL';
  title: string;
  author: string;
  year: string;
  url?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  status: 'ONLINE' | 'EDITING' | 'IDLE';
  email?: string; // Added for identification
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  email: string;
  university: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  university: string;
  status: 'Online' | 'Offline' | 'Researching';
  bio: string;
  papers?: {
    title: string;
    abstract: string;
    citations: number;
    year: string;
  }[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  members?: Member[];
}

export interface Message {
  id: string;
  sender: string;
  subject?: string;
  content: string;
  timestamp: string;
  read: boolean;
  reactions: Record<string, number>;
  media?: string; // base64 or url
  isVoice?: boolean;
  replyTo?: {
    id: string;
    sender: string;
    content: string;
  };
}

export interface NotificationItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'SYSTEM' | 'RESEARCH' | 'SOCIAL';
}

export interface AppendixItem {
  id: string;
  image: string; // Base64
  caption: string;
}

export enum UserRole {
  MOTHER = 'MOTHER',
  FATHER = 'FATHER'
}

export type Language = 'en' | 'id';

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: string;
  note?: string;
  aiAdvice?: string;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  senderRole: UserRole | 'AI';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface PartnerMessage {
  id: string;
  type: 'hug' | 'love' | 'flower' | 'cheer' | 'custom' | 'period';
  text?: string;
  sender: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  likes: number;
  tags: string[];
}

export interface LocationData {
  lat: number;
  lng: number;
  lastUpdated?: string;
}

export interface CheckupEntry {
  id: string;
  doctorName: string;
  hospital: string;
  date: string; // ISO string
  notes?: string;
}

export interface ChildInfo {
  id: string;
  name: string;
  nickname: string;
  status: 'expecting' | 'born';
  date: string;
}

export interface SharedData {
  language: Language;
  pairingCode: string;
  userName: string;
  partnerName?: string;
  childName?: string;
  childNickname?: string;
  pregnancyStartDate: string;
  expectedDueDate: string;
  birthDate?: string;
  isPostPregnant: boolean;
  currentMood: string;
  moodHistory: MoodEntry[];
  tasks: TaskItem[];
  chatMessages: ChatMessage[];
  aiConsultHistory: ChatMessage[];
  moodAnalysis?: string;
  isPeriodNotified: boolean;
  periodAnnouncedAt?: string;
  isMotherLocationSharing: boolean;
  isFatherLocationSharing: boolean;
  motherLocation?: LocationData;
  fatherLocation?: LocationData;
  kickCountHistory: { date: string; count: number }[];
  photoJourney: { id: string; url: string; caption: string; date: string; phase: string }[];
  partnerMessages: PartnerMessage[];
  communityPosts: CommunityPost[];
  pregnancyAgeWeeks?: number;
  pregnancyAgeDays?: number;
  checkups: CheckupEntry[];
  children?: ChildInfo[];
}

export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  benefits: string;
  imageUrl?: string;
}

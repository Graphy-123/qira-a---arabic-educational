
export enum ArabicVoice {
  KORE = 'Kore',
  PUCK = 'Puck',
  CHARON = 'Charon',
  FENRIR = 'Fenrir',
  ZEPHYR = 'Zephyr'
}

export interface AudioSnippet {
  id: string;
  text: string;
  voice: ArabicVoice;
  timestamp: number;
  audioData: string; // Base64
}

export interface Lesson {
  title: string;
  content: string;
  category: 'Alphabet' | 'Phrases' | 'Grammar';
}

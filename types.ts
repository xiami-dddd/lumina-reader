export enum AppMode {
  STANDARD = 'STANDARD',
  NOVEL = 'NOVEL',
  PAPER = 'PAPER'
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: Theme;
  brightness: number;
}

export interface HighlightCategoryConfig {
  enabled: boolean;
  color: string; // Hex code
}

export interface HighlightConfig {
  nouns: HighlightCategoryConfig;
  verbs: HighlightCategoryConfig;
  adjectives: HighlightCategoryConfig;
}

export interface AnalysisResult {
  summary?: string;
  keywords?: string[];
  annotatedHtml?: string; // For final display
  // Raw data for dynamic generation
  nouns?: string[];
  verbs?: string[];
  adjectives?: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  content: string;
  coverColor: string;
  height: string; // Tailwind height class or pixel value
}
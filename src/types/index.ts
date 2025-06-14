import type { SuggestStylesOutput as AISuggestion } from '@/ai/flows/suggest-styles';

export interface Note {
  id: string;
  title: string;
  content: string; 
  tags: string[];
  category?: string;
  createdAt: string; 
  updatedAt: string; 
}

export type StylingOption = 'fontFamily' | 'fontSize' | 'fontWeight' | 'color';

export interface StyleValue {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
}

export interface AiStyleSuggestion extends AISuggestion {
  id: string;
}

// For simplicity, we're not implementing full rich text style application.
// This would involve a more complex data structure for content.

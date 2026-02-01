import React from 'react';
import { create } from 'zustand';
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
export interface ArticleData {
  headline: string;
  author: string;
  content: string;
  tone: string;
  style: string;
  audience: string;
}
interface ArticleStore {
  articleData: ArticleData;
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateArticle: (data: Partial<ArticleData>) => void;
  resetArticle: () => void;
}
export const useArticleStore = create<ArticleStore>((set) => ({
  articleData: {
    headline: '',
    author: '',
    content: '',
    tone: 'objective',
    style: 'professional',
    audience: 'general'
  },
  messages: [],
  addMessage: (message) =>
  set((state) => ({
    messages: [...state.messages, message]
  })),
  updateArticle: (data) =>
  set((state) => ({
    articleData: {
      ...state.articleData,
      ...data
    }
  })),
  resetArticle: () =>
  set({
    articleData: {
      headline: '',
      author: '',
      content: '',
      tone: 'objective',
      style: 'professional',
      audience: 'general'
    },
    messages: []
  })
}));
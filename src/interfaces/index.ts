export enum SubtitleLang {
  en = 'en',
  es = 'es',
  off = 'off',
}

export enum ReactionType {
  love = '❤️',
  inlove = '😍',
  hahaha = '😂',
  sad = '😢',
  pleading = '🥺',
  angry = '😠',
  cry = '😭',
  surprise = '😮',
  thinking = '🤔',
}

export interface User {
  id: string;
  user: string;
}

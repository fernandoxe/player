export enum SubtitleLang {
  en = 'en',
  es = 'es',
  off = 'off',
}

export enum ReactionType {
  love = '❤️',
  hahaha = '😂',
  sad = '😢',
  pleading = '🥺',
  angry = '😠',
  cry = '😭',
  thinking = '🤔',
}

export interface User {
  id: string;
  user: string;
}


export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  ERROR = 'error'
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

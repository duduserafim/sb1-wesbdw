export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  timestamp: number;
  fromMe: boolean;
  fileName?: string;
  fileUrl?: string;
  caption?: string;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  profilePicture?: string;
}

export interface FileUpload {
  file: File;
  progress: number;
  uploading: boolean;
  error?: string;
}
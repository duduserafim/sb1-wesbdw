export interface ScheduledMessage {
  id: string;
  instanceName: string;
  chatId: string;
  chatName: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
  fileUrl?: string;
  fileName?: string;
  caption?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface CreateScheduleData {
  instanceName: string;
  chatId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  scheduledTime: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  fileUrl?: string;
  fileName?: string;
  caption?: string;
}
import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Message } from '../types/chat';
import { FileUpload } from '../types/chat';
import { Paperclip, Send, X } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  selectedChatName: string;
  onSendMessage: (content: string) => void;
  onSendFile: (file: File) => void;
  fileUpload: FileUpload | null;
  onCancelUpload: () => void;
}

function ChatMessages({
  messages,
  selectedChatName,
  onSendMessage,
  onSendFile,
  fileUpload,
  onCancelUpload,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b">
        <h2 className="text-lg font-semibold text-gray-900">{selectedChatName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.fromMe
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              {message.type === 'text' ? (
                <p>{message.content}</p>
              ) : (
                <div className="space-y-2">
                  {message.type === 'image' && (
                    <img
                      src={message.fileUrl}
                      alt={message.fileName}
                      className="rounded-lg max-w-full"
                    />
                  )}
                  {message.type === 'document' && (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>{message.fileName}</span>
                    </a>
                  )}
                  {message.caption && <p>{message.caption}</p>}
                </div>
              )}
              <div
                className={`text-xs mt-1 ${
                  message.fromMe ? 'text-green-100' : 'text-gray-500'
                }`}
              >
                {format(message.timestamp, 'HH:mm')}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Progress */}
      {fileUpload && (
        <div className="px-4 py-2 bg-white border-t">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium">{fileUpload.file.name}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${fileUpload.progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={onCancelUpload}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {fileUpload.error && (
            <p className="text-sm text-red-500 mt-1">{fileUpload.error}</p>
          )}
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatMessages;
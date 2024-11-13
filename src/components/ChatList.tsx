import React from 'react';
import { format } from 'date-fns';
import { Chat } from '../types/chat';
import { Users, User } from 'lucide-react';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chat: Chat) => void;
}

function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  return (
    <div className="h-full bg-white border-r">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div className="overflow-y-auto h-[calc(100%-73px)]">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
              selectedChatId === chat.id ? 'bg-green-50' : ''
            }`}
          >
            <div className="relative">
              {chat.profilePicture ? (
                <img
                  src={chat.profilePicture}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {chat.isGroup ? (
                    <Users className="w-6 h-6 text-gray-500" />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              )}
              {chat.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unreadCount}
                </span>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{chat.name}</h3>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {format(chat.lastMessage.timestamp, 'HH:mm')}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatList;
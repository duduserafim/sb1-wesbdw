import React, { useState, useEffect } from 'react';
import { evolutionApi } from '../services/api';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import { Chat, Message, FileUpload } from '../types/chat';
import { toast } from 'react-toastify';
import ChatList from '../components/ChatList';
import ChatMessages from '../components/ChatMessages';
import LoadingSpinner from '../components/LoadingSpinner';

function ChatPage() {
  const [loading, setLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [instances, setInstances] = useState<string[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [fileUpload, setFileUpload] = useState<FileUpload | null>(null);

  useEffect(() => {
    fetchInstances();
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (selectedInstance) {
      connectSocket(selectedInstance);
      fetchChats();
    }
  }, [selectedInstance]);

  useEffect(() => {
    socket.on('message', handleNewMessage);
    socket.on('chat.update', handleChatUpdate);

    return () => {
      socket.off('message');
      socket.off('chat.update');
    };
  }, []);

  const fetchInstances = async () => {
    try {
      const response = await evolutionApi.getInstances();
      const connectedInstances = response.data
        .filter((instance: any) => instance.status === 'connected')
        .map((instance: any) => instance.instanceName);
      setInstances(connectedInstances);
      if (connectedInstances.length > 0) {
        setSelectedInstance(connectedInstances[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch instances');
    }
  };

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await evolutionApi.getChats(selectedInstance);
      setChats(response.data);
    } catch (error) {
      toast.error('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await evolutionApi.getChatMessages(selectedInstance, chatId);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChat) return;

    try {
      await evolutionApi.sendMessage(selectedInstance, selectedChat.id, {
        type: 'text',
        content,
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSendFile = async (file: File) => {
    if (!selectedChat) return;

    setFileUpload({
      file,
      progress: 0,
      uploading: true,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await evolutionApi.uploadFile(selectedInstance, selectedChat.id, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 0)
          );
          setFileUpload((prev) =>
            prev ? { ...prev, progress } : null
          );
        },
      });

      setFileUpload(null);
    } catch (error) {
      setFileUpload((prev) =>
        prev ? { ...prev, error: 'Failed to upload file' } : null
      );
    }
  };

  const handleNewMessage = (message: Message) => {
    if (selectedChat?.id === message.to || selectedChat?.id === message.from) {
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleChatUpdate = (updatedChat: Chat) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat))
    );
  };

  return (
    <div className="h-[calc(100vh-2rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
        <select
          value={selectedInstance}
          onChange={(e) => setSelectedInstance(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          {instances.map((instance) => (
            <option key={instance} value={instance}>
              {instance}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-12 gap-6 h-full">
          <div className="col-span-4 h-full">
            <ChatList
              chats={chats}
              selectedChatId={selectedChat?.id || null}
              onSelectChat={handleSelectChat}
            />
          </div>
          <div className="col-span-8 h-full">
            {selectedChat ? (
              <ChatMessages
                messages={messages}
                selectedChatName={selectedChat.name}
                onSendMessage={handleSendMessage}
                onSendFile={handleSendFile}
                fileUpload={fileUpload}
                onCancelUpload={() => setFileUpload(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Select a chat to start messaging</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
import React, { useState, useEffect } from 'react';
import { evolutionApi } from '../services/api';
import { ScheduledMessage, CreateScheduleData } from '../types/schedule';
import { Chat } from '../types/chat';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  MessageSquare,
  RepeatIcon,
  FileIcon,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO } from 'date-fns';

function Schedule() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ScheduledMessage[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [instances, setInstances] = useState<string[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [newSchedule, setNewSchedule] = useState<CreateScheduleData>({
    instanceName: '',
    chatId: '',
    content: '',
    type: 'text',
    scheduledTime: '',
    repeat: 'none',
  });

  useEffect(() => {
    fetchInstances();
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (selectedInstance) {
      fetchChats();
    }
  }, [selectedInstance]);

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
    try {
      const response = await evolutionApi.getChats(selectedInstance);
      setChats(response.data);
    } catch (error) {
      toast.error('Failed to fetch chats');
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await evolutionApi.getSchedules();
      setSchedules(response.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await evolutionApi.createSchedule(newSchedule);
      toast.success('Schedule created successfully');
      setShowCreateModal(false);
      setNewSchedule({
        instanceName: selectedInstance,
        chatId: '',
        content: '',
        type: 'text',
        scheduledTime: '',
        repeat: 'none',
      });
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await evolutionApi.deleteSchedule(id);
      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scheduled Messages</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Schedule
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MessageSquare className="w-6 h-6 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold">{schedule.chatName}</h3>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                    schedule.status
                  )}`}
                >
                  {schedule.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(parseISO(schedule.scheduledTime), 'PPP')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(schedule.scheduledTime), 'p')}
                    </p>
                  </div>
                </div>

                {schedule.repeat !== 'none' && (
                  <div className="flex items-center">
                    <RepeatIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <p className="text-sm text-gray-600 capitalize">
                      Repeats {schedule.repeat}
                    </p>
                  </div>
                )}

                <div className="border-t pt-3">
                  {schedule.type === 'text' ? (
                    <p className="text-gray-600">{schedule.content}</p>
                  ) : (
                    <div className="flex items-center">
                      <FileIcon className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {schedule.fileName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="flex items-center px-3 py-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Schedule</h2>
            <form onSubmit={handleCreateSchedule}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instance
                  </label>
                  <select
                    value={selectedInstance}
                    onChange={(e) => {
                      setSelectedInstance(e.target.value);
                      setNewSchedule({
                        ...newSchedule,
                        instanceName: e.target.value,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Instance</option>
                    {instances.map((instance) => (
                      <option key={instance} value={instance}>
                        {instance}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chat
                  </label>
                  <select
                    value={newSchedule.chatId}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, chatId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Chat</option>
                    {chats.map((chat) => (
                      <option key={chat.id} value={chat.id}>
                        {chat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Type
                  </label>
                  <select
                    value={newSchedule.type}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                {newSchedule.type === 'text' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={newSchedule.content}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          content: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File URL
                    </label>
                    <input
                      type="url"
                      value={newSchedule.fileUrl || ''}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          fileUrl: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newSchedule.scheduledTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        scheduledTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat
                  </label>
                  <select
                    value={newSchedule.repeat}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        repeat: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="none">No Repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;
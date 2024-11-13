import React, { useState, useEffect } from 'react';
import { evolutionApi } from '../services/api';
import { Group, CreateGroupData, GroupParticipant } from '../types/group';
import { toast } from 'react-toastify';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Link, 
  LogOut,
  UserPlus,
  UserMinus,
  Crown,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState('');
  const [instances, setInstances] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupData, setNewGroupData] = useState<CreateGroupData>({
    name: '',
    participants: [],
  });

  useEffect(() => {
    fetchInstances();
  }, []);

  useEffect(() => {
    if (selectedInstance) {
      fetchGroups();
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

  const fetchGroups = async () => {
    if (!selectedInstance) return;
    setLoading(true);
    try {
      const response = await evolutionApi.getGroups(selectedInstance);
      setGroups(response.data);
    } catch (error) {
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await evolutionApi.createGroup(
        selectedInstance,
        newGroupData.name,
        newGroupData.participants
      );
      toast.success('Group created successfully');
      setShowCreateModal(false);
      setNewGroupData({ name: '', participants: [] });
      fetchGroups();
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      await evolutionApi.leaveGroup(selectedInstance, groupId);
      toast.success('Left group successfully');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to leave group');
    }
  };

  const handleParticipantAction = async (
    action: 'add' | 'remove' | 'promote' | 'demote',
    groupId: string,
    participants: string[]
  ) => {
    try {
      switch (action) {
        case 'add':
          await evolutionApi.addParticipants(selectedInstance, groupId, participants);
          break;
        case 'remove':
          await evolutionApi.removeParticipants(selectedInstance, groupId, participants);
          break;
        case 'promote':
          await evolutionApi.promoteParticipants(selectedInstance, groupId, participants);
          break;
        case 'demote':
          await evolutionApi.demoteParticipants(selectedInstance, groupId, participants);
          break;
      }
      toast.success('Action completed successfully');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to perform action');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Groups</h1>
        <div className="flex items-center space-x-4">
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={!selectedInstance}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Group
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Users className="w-6 h-6 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {group.memberCount} members
                </span>
              </div>

              {group.description && (
                <p className="text-gray-600 mb-4">{group.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowParticipantsModal(true);
                  }}
                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Manage
                </button>
                <button
                  onClick={() => handleLeaveGroup(group.id)}
                  className="flex items-center px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Leave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupData.name}
                  onChange={(e) =>
                    setNewGroupData({ ...newGroupData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participants (comma-separated numbers)
                </label>
                <textarea
                  value={newGroupData.participants.join(', ')}
                  onChange={(e) =>
                    setNewGroupData({
                      ...newGroupData,
                      participants: e.target.value.split(',').map((p) => p.trim()),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
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

      {/* Participants Modal */}
      {showParticipantsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Manage Participants - {selectedGroup.name}
            </h2>
            <div className="space-y-4">
              {selectedGroup.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="font-medium">{participant.name || participant.id}</span>
                    {participant.admin && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {!participant.superAdmin && (
                      <>
                        {participant.admin ? (
                          <button
                            onClick={() =>
                              handleParticipantAction('demote', selectedGroup.id, [
                                participant.id,
                              ])
                            }
                            className="p-1 text-yellow-600 hover:text-yellow-700"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleParticipantAction('promote', selectedGroup.id, [
                                participant.id,
                              ])
                            }
                            className="p-1 text-gray-600 hover:text-gray-700"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleParticipantAction('remove', selectedGroup.id, [
                              participant.id,
                            ])
                          }
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;
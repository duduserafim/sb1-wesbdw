import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

export const evolutionApi = {
  // Instance methods
  async createInstance(instanceName: string) {
    return api.post('/instance/create', { instanceName });
  },

  async deleteInstance(instanceName: string) {
    return api.delete(`/instance/delete/${instanceName}`);
  },

  async getInstances() {
    return api.get('/instances');
  },

  async connectInstance(instanceName: string) {
    return api.get(`/instance/connect/${instanceName}`);
  },

  async getInstanceQR(instanceName: string) {
    return api.get(`/instance/qr/${instanceName}`);
  },

  async logoutInstance(instanceName: string) {
    return api.post(`/instance/logout/${instanceName}`);
  },

  async getInstanceInfo(instanceName: string) {
    return api.get(`/instance/info/${instanceName}`);
  },

  // Group methods
  async getGroups(instanceName: string) {
    return api.get(`/group/fetch/${instanceName}`);
  },

  async createGroup(instanceName: string, name: string, participants: string[]) {
    return api.post(`/group/create/${instanceName}`, { name, participants });
  },

  async updateGroupName(instanceName: string, groupId: string, name: string) {
    return api.put(`/group/update-name/${instanceName}`, { groupId, name });
  },

  async updateGroupDescription(instanceName: string, groupId: string, description: string) {
    return api.put(`/group/update-description/${instanceName}`, { groupId, description });
  },

  async addParticipants(instanceName: string, groupId: string, participants: string[]) {
    return api.post(`/group/add-participants/${instanceName}`, { groupId, participants });
  },

  async removeParticipants(instanceName: string, groupId: string, participants: string[]) {
    return api.post(`/group/remove-participants/${instanceName}`, { groupId, participants });
  },

  async promoteParticipants(instanceName: string, groupId: string, participants: string[]) {
    return api.post(`/group/promote/${instanceName}`, { groupId, participants });
  },

  async demoteParticipants(instanceName: string, groupId: string, participants: string[]) {
    return api.post(`/group/demote/${instanceName}`, { groupId, participants });
  },

  async getGroupInviteLink(instanceName: string, groupId: string) {
    return api.get(`/group/invite-link/${instanceName}/${groupId}`);
  },

  async revokeGroupInviteLink(instanceName: string, groupId: string) {
    return api.post(`/group/revoke-invite-link/${instanceName}/${groupId}`);
  },

  async leaveGroup(instanceName: string, groupId: string) {
    return api.post(`/group/leave/${instanceName}/${groupId}`);
  },

  // Chat methods
  async getChats(instanceName: string) {
    return api.get(`/chat/fetch/${instanceName}`);
  },

  async getChatMessages(instanceName: string, chatId: string) {
    return api.get(`/chat/messages/${instanceName}/${chatId}`);
  },

  async sendMessage(instanceName: string, chatId: string, message: any) {
    return api.post(`/chat/send/${instanceName}/${chatId}`, message);
  },

  async uploadFile(instanceName: string, chatId: string, formData: FormData, config: any) {
    return api.post(`/chat/upload/${instanceName}/${chatId}`, formData, config);
  },

  // Schedule methods
  async getSchedules() {
    return api.get('/schedule');
  },

  async createSchedule(data: any) {
    return api.post('/schedule', data);
  },

  async updateSchedule(id: string, data: any) {
    return api.put(`/schedule/${id}`, data);
  },

  async deleteSchedule(id: string) {
    return api.delete(`/schedule/${id}`);
  }
};

export default api;
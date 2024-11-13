import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const api = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.EVOLUTION_API_KEY,
  },
});

export const evolutionApi = {
  async createInstance(instanceName) {
    return api.post('/instance/create', { instanceName });
  },

  async deleteInstance(instanceName) {
    return api.delete(`/instance/delete/${instanceName}`);
  },

  async connectInstance(instanceName) {
    return api.get(`/instance/connect/${instanceName}`);
  },

  async logoutInstance(instanceName) {
    return api.post(`/instance/logout/${instanceName}`);
  },

  async getInstanceQR(instanceName) {
    return api.get(`/instance/qr/${instanceName}`);
  },

  async getInstanceInfo(instanceName) {
    return api.get(`/instance/info/${instanceName}`);
  },

  async fetchGroups(instanceName) {
    return api.get(`/group/fetch/${instanceName}`);
  },

  async createGroup(instanceName, name, participants) {
    return api.post(`/group/create/${instanceName}`, { name, participants });
  },

  async sendMessage(instanceName, chatId, message) {
    return api.post(`/message/send/${instanceName}/${chatId}`, message);
  },

  async sendFile(instanceName, chatId, file, caption) {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);

    return api.post(`/message/send-file/${instanceName}/${chatId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
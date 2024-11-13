export interface Instance {
  instanceName: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrcode?: string;
}

export interface InstanceInfo {
  instance: {
    instanceName: string;
    owner: string;
    profileName?: string;
    profilePictureUrl?: string;
    status: string;
  };
  connected: boolean;
  qrcode?: string;
}
export interface GroupParticipant {
  id: string;
  admin: boolean;
  superAdmin: boolean;
  name?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  participants: GroupParticipant[];
  inviteLink?: string;
  creation: string;
  owner: string;
  memberCount: number;
}

export interface CreateGroupData {
  name: string;
  participants: string[];
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
}

export interface ParticipantAction {
  groupId: string;
  participants: string[];
}
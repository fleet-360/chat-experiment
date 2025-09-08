export type ChatGroupType = "emojy" | "noEmojy";

export interface ExperimentSettings {
  usersInGroup: number;
  totalDuration: number;
}

export interface ChatMessagePlanItem {
  groupType: ChatGroupType;
  message: string;
  timeInChat: number;
}

export interface ChatTimerPlanItem {
  time: number;
}

export interface Experiment {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  groups: string[]; // group ids
  settings: ExperimentSettings;
  ChatMessagesplan: ChatMessagePlanItem[];
  ChatTimersplan: ChatTimerPlanItem[];
}

export interface GroupMessage {
  senderId: string; // reference to user id
  senderName: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface Group {
  id: string;
  groupType: ChatGroupType;
  users: string[]; // user ids
  name: string;
  messages: GroupMessage[];
  createdAt: Date;
  experimentId:string
}

export interface UserProfile {
  id: string;
  displayName: string;
  prolificPId: string;
  age: number;
  gender: string;
  language: string;
}

export type SurveyAnswersPayload = {
  userId: string;
  createdAt: Date;
  answers: Record<string, unknown>;
};

// src/types.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'task_created' | 'task_completed';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: { username: string } | null;
}

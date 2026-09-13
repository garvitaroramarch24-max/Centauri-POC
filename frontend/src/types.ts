// src/types.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: { username: string } | null;
}

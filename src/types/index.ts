
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  status: TaskStatus;
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

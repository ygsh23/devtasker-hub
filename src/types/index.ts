
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

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface Notification {
  id: string;
  task_id: string;
  recipient_email: string;
  sent_at: Date;
  status: 'pending' | 'sent' | 'failed';
  message?: string;
}

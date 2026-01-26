
export enum DopamineLevel {
  LOW = 'Low',
  BALANCED = 'Balanced',
  HIGH = 'High'
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  category: 'Work' | 'Project' | 'Private';
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'in-progress' | 'done';
  remind?: boolean;
  date: string; // ISO format YYYY-MM-DD
  createdAt?: number;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

export interface HabitDataPoint {
  date: string;
  completion: number;
}

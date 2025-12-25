
export enum DopamineLevel {
  LOW = 'Low',
  BALANCED = 'Balanced',
  HIGH = 'High'
}

export interface Task {
  id: string;
  title: string;
  category: 'Work' | 'Project' | 'Personal';
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'in-progress' | 'done';
  remind?: boolean;
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

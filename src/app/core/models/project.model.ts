import { Task } from './task.model';

export interface Project {
  id: number;
  title: string;
  description: string;
  tasks?: Task[]; // Uma lista de tarefas associadas
}
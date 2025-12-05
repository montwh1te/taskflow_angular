import { Task } from './task.model';

export interface Project {
  id?: string;
  userId: string;           // ID do usuário proprietário
  title: string;
  description: string;
  progress?: number;        // Progresso do projeto (0-100), calculado pelas tarefas
  createdAt?: Date;         // Data de criação
  updatedAt?: Date;         // Data da última atualização
  tasks?: Task[];           // Uma lista de tarefas associadas
}
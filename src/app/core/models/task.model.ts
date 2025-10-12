export type TaskStatus = 'A Fazer' | 'Em Andamento' | 'Concluído';

export interface Task {
  id: number;
  projectId: number; // Chave estrangeira para o projeto
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: Date;
}
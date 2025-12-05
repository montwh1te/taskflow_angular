import { Timestamp } from '@angular/fire/firestore';

export type TaskStatus = 'A Fazer' | 'Em Andamento' | 'Concluído';

export interface Task {
  id?: string;
  userId: string;           // ID do usuário proprietário
  projectId: string;        // Chave estrangeira para o projeto
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: Date | Timestamp;
  attachments?: TaskAttachment[];  // Lista de anexos
  createdAt?: Date | Timestamp;    // Data de criação
  updatedAt?: Date | Timestamp;    // Data da última atualização
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date | Timestamp;
}
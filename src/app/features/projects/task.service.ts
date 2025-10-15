import { Injectable } from '@angular/core';
import { MockApiService } from '../../core/services/mock-api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private api: MockApiService) {}

  getTasksByProjectId(projectId: number) {
    return this.api.getTasksByProjectId(projectId);
  }
  getTaskById(id: number) {
    // Busca uma tarefa pelo id
    return this.api.getTasksByProjectId(0).pipe(
      map((tasks: any[]) => tasks.find(t => t.id === id))
    );
  }

  createTask(task: { projectId: number; title: string; description: string; status: string; dueDate: Date }) {
    return this.api.createTask(task);
  }

  updateTask(id: number, changes: { title?: string; description?: string; status?: string; dueDate?: Date }) {
    return this.api.updateTask(id, changes);
  }

  deleteTask(id: number) {
    return this.api.deleteTask(id);
  }
}
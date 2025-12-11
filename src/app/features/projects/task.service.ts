import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../../core/models/task.model';
import { FirebaseTaskService } from './firebase-task.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firebaseTaskService = inject(FirebaseTaskService);

  getTasksByProjectId(projectId: string): Observable<Task[]> {
    console.log('📋 TaskService.getTasksByProjectId()', projectId);
    return this.firebaseTaskService.getTasksByProject(projectId);
  }

  getTaskById(id: string): Observable<Task | null> {
    console.log('📋 TaskService.getTaskById()', id);
    return this.firebaseTaskService.getTaskById(id);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    console.log('📋 TaskService.createTask()');
    return this.firebaseTaskService.createTask(task);
  }

  updateTask(id: string, updates: Partial<Task>): Observable<void> {
    console.log('📋 TaskService.updateTask()', id);
    return this.firebaseTaskService.updateTask(id, updates);
  }

  deleteTask(id: string): Observable<void> {
    console.log('📋 TaskService.deleteTask()', id);
    return this.firebaseTaskService.deleteTask(id);
  }

  addAttachment(taskId: string, attachment: any): Observable<void> {
    console.log('📋 TaskService.addAttachment()', taskId);
    return this.firebaseTaskService.addAttachment(taskId, attachment);
  }
}

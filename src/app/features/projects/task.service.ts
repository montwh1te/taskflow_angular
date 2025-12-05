import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc,
  addDoc, updateDoc, deleteDoc, query, where,
  Timestamp, docData
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { AuthAdapterService } from '../auth/auth-adapter.service';
import { MockApiService } from '../../core/services/mock-api.service';
import { Observable, map, of } from 'rxjs';
import { Task, TaskStatus } from '../../core/models/task.model';

/**
 * Função auxiliar para converter dados do Firestore
 */
function fromFirestore(docData: any): Task {
  const data = docData;
  return {
    ...data,
    dueDate: (data.dueDate as Timestamp).toDate(),
    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : undefined,
    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined
  } as Task;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);
  private authAdapter = inject(AuthAdapterService);
  private mockApi = inject(MockApiService);
  private tasksCollection = collection(this.firestore, 'tasks');

  /**
   * Verificar se deve usar mock ou firebase
   */
  private useMock(): boolean {
    return this.authAdapter.getAuthMode() === 'mock';
  }

  /**
   * Retorna todas as tarefas de um projeto específico
   */
  getTasksByProjectId(projectId: string): Observable<Task[]> {
    console.log('📋 TaskService.getTasksByProjectId() - useMock:', this.useMock());
    
    if (this.useMock()) {
      return this.mockApi.getTasksByProjectId(projectId);
    }

    const tasksQuery = query(this.tasksCollection, where('projectId', '==', projectId));
    return collectionData(tasksQuery, { idField: 'id' }).pipe(
      map(tasks => tasks.map(task => fromFirestore(task)))
    );
  }

  /**
   * Retorna uma tarefa específica
   */
  getTaskById(id: string): Observable<Task> {
    console.log('🔍 TaskService.getTaskById() - useMock:', this.useMock());
    
    if (this.useMock()) {
      return this.mockApi.getTaskById(id) as Observable<Task>;
    }

    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return docData(taskDoc, { idField: 'id' }).pipe(
      map(task => fromFirestore(task))
    );
  }

  /**
   * Cria uma nova tarefa
   */
  async createTask(taskData: {
    projectId: string;
    title: string;
    description: string;
    status: TaskStatus;
    dueDate: Date;
  }): Promise<any> {
    console.log('➕ TaskService.createTask() - useMock:', this.useMock());
    
    if (this.useMock()) {
      const result = await this.mockApi.createTask(taskData).toPromise();
      console.log('✅ Mock createTask resultado:', result);
      return result;
    }

    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    const newTask = {
      ...taskData,
      userId,
      dueDate: Timestamp.fromDate(taskData.dueDate),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    return addDoc(this.tasksCollection, newTask);
  }

  /**
   * Atualiza uma tarefa
   */
  async updateTask(id: string, changes: Partial<Task>): Promise<void> {
    console.log('✏️  TaskService.updateTask() - useMock:', this.useMock());
    
    if (this.useMock()) {
      // Converter para tipo compatível com MockApiService
      const mockChanges: any = {
        title: changes.title,
        description: changes.description,
        status: changes.status,
        dueDate: changes.dueDate instanceof Date ? changes.dueDate : undefined
      };
      const result = await this.mockApi.updateTask(id, mockChanges).toPromise();
      console.log('✅ Mock updateTask resultado:', result);
      return;
    }

    const taskDoc = doc(this.firestore, `tasks/${id}`);

    const updatedChanges: any = {
      ...changes,
      updatedAt: Timestamp.now()
    };

    // Converte a data se ela estiver sendo alterada
    if (changes.dueDate && changes.dueDate instanceof Date) {
      updatedChanges.dueDate = Timestamp.fromDate(changes.dueDate as Date);
    }

    return updateDoc(taskDoc, updatedChanges);
  }

  /**
   * Deleta uma tarefa
   */
  async deleteTask(id: string): Promise<void> {
    console.log('🗑️  TaskService.deleteTask() - useMock:', this.useMock());
    
    if (this.useMock()) {
      const result = await this.mockApi.deleteTask(id).toPromise();
      console.log('✅ Mock deleteTask resultado:', result);
      return;
    }

    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return deleteDoc(taskDoc);
  }
}
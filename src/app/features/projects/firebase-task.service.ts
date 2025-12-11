import { Injectable, inject } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { switchMap, map, catchError, finalize } from 'rxjs/operators';
import { Task } from '../../core/models/task.model';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  collectionData,
  docData
} from '@angular/fire/firestore';
import { FirebaseAuthService } from '../auth/firebase-auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseTaskService {
  private firestore: Firestore = inject(Firestore);
  private authService: FirebaseAuthService = inject(FirebaseAuthService);
  private tasksCollection = collection(this.firestore, 'tasks');

  /**
   * Cria uma nova tarefa
   */
  createTask(task: Partial<Task>): Observable<Task> {
    console.log('➕🔥 FirebaseTaskService.createTask()');

    return this.authService.userId$.pipe(
      switchMap((userId: any) => {
        if (!userId) {
          console.error('❌ Usuário não autenticado');
          return throwError(() => new Error('Usuário não autenticado'));
        }

        const newTask = {
          ...task,
          userId: userId as string,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: []
        };

        return from(addDoc(this.tasksCollection, newTask)).pipe(
          map(docRef => ({
            id: docRef.id,
            ...(newTask as any),
            createdAt: new Date(newTask.createdAt),
            updatedAt: new Date(newTask.updatedAt)
          } as Task)),
          catchError(error => {
            console.error('❌ Erro ao criar tarefa:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Busca todas as tarefas de um projeto
   */
  getTasksByProject(projectId: string): Observable<Task[]> {
    console.log('📋🔥 FirebaseTaskService.getTasksByProject()', projectId);

    return this.authService.userId$.pipe(
      switchMap((userId: any) => {
        if (!userId) {
          console.error('❌ Usuário não autenticado');
          return of([]);
        }

        const tasksQuery = query(
          this.tasksCollection,
          where('projectId', '==', projectId),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        return collectionData(tasksQuery, { idField: 'id' }).pipe(
          map((tasks: any[]) => 
            tasks.map(task => ({
              ...task,
              createdAt: typeof task.createdAt === 'string' ? new Date(task.createdAt) : task.createdAt,
              updatedAt: typeof task.updatedAt === 'string' ? new Date(task.updatedAt) : task.updatedAt,
              dueDate: task.dueDate ? (typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate) : null
            }))
          ),
          catchError(error => {
            console.error('❌ Erro ao buscar tarefas:', error);
            return of([]);
          })
        );
      })
    );
  }

  /**
   * Busca uma tarefa específica
   */
  getTaskById(id: string): Observable<Task | null> {
    console.log('🔍🔥 FirebaseTaskService.getTaskById()', id);

    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return docData(taskDoc, { idField: 'id' }).pipe(
      map((task: any) => {
        if (!task) return null;
        return {
          ...task,
          createdAt: typeof task.createdAt === 'string' ? new Date(task.createdAt) : task.createdAt,
          updatedAt: typeof task.updatedAt === 'string' ? new Date(task.updatedAt) : task.updatedAt,
          dueDate: task.dueDate ? (typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate) : null
        };
      }),
      catchError(error => {
        console.error('❌ Erro ao buscar tarefa:', error);
        return of(null);
      })
    );
  }

  /**
   * Atualiza uma tarefa
   */
  updateTask(id: string, updates: Partial<Task>): Observable<void> {
    console.log('✏️🔥 FirebaseTaskService.updateTask()', id);

    return this.authService.userId$.pipe(
      switchMap((userId: any) => {
        if (!userId) {
          console.error('❌ Usuário não autenticado');
          return throwError(() => new Error('Usuário não autenticado'));
        }

        const taskDoc = doc(this.firestore, `tasks/${id}`);
        const updatedChanges = {
          ...updates,
          updatedAt: new Date().toISOString()
        };

        return from(updateDoc(taskDoc, updatedChanges as any)).pipe(
          catchError(error => {
            console.error('❌ Erro ao atualizar tarefa:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Deleta uma tarefa
   */
  deleteTask(id: string): Observable<void> {
    console.log('🗑️🔥 FirebaseTaskService.deleteTask()', id);

    return this.authService.userId$.pipe(
      switchMap((userId: any) => {
        if (!userId) {
          console.error('❌ Usuário não autenticado');
          return throwError(() => new Error('Usuário não autenticado'));
        }

        const taskDoc = doc(this.firestore, `tasks/${id}`);
        return from(deleteDoc(taskDoc)).pipe(
          catchError(error => {
            console.error('❌ Erro ao deletar tarefa:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Adiciona um anexo à tarefa
   */
  addAttachment(taskId: string, attachment: any): Observable<void> {
    console.log('📎🔥 FirebaseTaskService.addAttachment()', taskId);

    return this.authService.userId$.pipe(
      switchMap((userId: any) => {
        if (!userId) {
          console.error('❌ Usuário não autenticado');
          return throwError(() => new Error('Usuário não autenticado'));
        }

        const taskDoc = doc(this.firestore, `tasks/${taskId}`);
        return from(updateDoc(taskDoc, {
          attachments: attachment
        } as any)).pipe(
          catchError(error => {
            console.error('❌ Erro ao adicionar anexo:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
}

// src/app/features/projects/task.service.ts

import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc,
  addDoc, updateDoc, deleteDoc, query, where,
  Timestamp, docData
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importe o 'map' do RxJS
import { Task, TaskStatus } from '../../core/models/task.model';

// Função auxiliar para converter dados do Firestore
function fromFirestore(docData: any): Task {
  const data = docData;
  return {
    ...data,
    dueDate: (data.dueDate as Timestamp).toDate() // Converte Timestamp para Date
  } as Task;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore: Firestore = inject(Firestore);
  private tasksCollection = collection(this.firestore, 'tasks');

  getTasksByProjectId(projectId: string): Observable<Task[]> {
    const tasksQuery = query(this.tasksCollection, where('projectId', '==', projectId));
    return collectionData(tasksQuery, { idField: 'id' }).pipe(
      map(tasks => tasks.map(task => fromFirestore(task))) // Converte cada item
    );
  }

  getTaskById(id: string): Observable<Task> {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return docData(taskDoc, { idField: 'id' }).pipe(
      map(task => fromFirestore(task)) // Converte o item
    );
  }

  createTask(taskData: { projectId: string; title: string; description: string; status: TaskStatus; dueDate: Date }): Promise<any> {
    const newTask = {
      ...taskData,
      dueDate: Timestamp.fromDate(taskData.dueDate) // Converte Date para Timestamp
    };
    return addDoc(this.tasksCollection, newTask);
  }

  updateTask(id: string, changes: Partial<Task>): Promise<void> {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    
    // Converte a data se ela estiver sendo alterada
    if (changes.dueDate && changes.dueDate instanceof Date) {
      const newChanges = {
        ...changes,
        dueDate: Timestamp.fromDate(changes.dueDate as Date)
      };
      return updateDoc(taskDoc, newChanges);
    }
    
    return updateDoc(taskDoc, changes);
  }

  deleteTask(id: string): Promise<void> {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return deleteDoc(taskDoc);
  }
}
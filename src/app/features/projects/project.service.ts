// src/app/features/projects/project.service.ts

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc, writeBatch, query, where, getDocs, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Project } from '../../core/models/project.model';

@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  // Injeta o Firestore
  private firestore: Firestore = inject(Firestore);
  
  // Referência da coleção de projetos
  private projectsCollection = collection(this.firestore, 'projects');

  getAllProjects(): Observable<Project[]> {
    // Retorna um Observable que atualiza em tempo real
    return collectionData(this.projectsCollection, { idField: 'id' }) as Observable<Project[]>;
  }

  getProjectById(id: string): Observable<Project> {
    const projectDoc = doc(this.firestore, `projects/${id}`);
    return docData(projectDoc, { idField: 'id' }) as Observable<Project>;
  }

  createProject(project: { title: string; description: string }): Promise<any> {
    return addDoc(this.projectsCollection, project);
  }

  updateProject(id: string, changes: Partial<Project>): Promise<void> {
    const projectDoc = doc(this.firestore, `projects/${id}`);
    return updateDoc(projectDoc, changes);
  }

  async deleteProject(id: string): Promise<void> {
    // Para deletar um projeto, precisamos também deletar suas tarefas
    
    // 1. Encontra todas as tarefas desse projeto
    const tasksCollection = collection(this.firestore, 'tasks');
    const tasksQuery = query(tasksCollection, where('projectId', '==', id));
    const tasksSnapshot = await getDocs(tasksQuery);

    // 2. Prepara um "batch" (lote) para deletar todas as tarefas de uma vez
    const batch = writeBatch(this.firestore);
    tasksSnapshot.forEach((taskDoc: QueryDocumentSnapshot)  => {
      batch.delete(doc(this.firestore, 'tasks', taskDoc.id));
    });
    
    // 3. Adiciona a exclusão do próprio projeto ao batch
    const projectDoc = doc(this.firestore, `projects/${id}`);
    batch.delete(projectDoc);

    // 4. Executa todas as exclusões em uma única transação
    return batch.commit();
  }
}
import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, docData, addDoc, updateDoc,
  deleteDoc, writeBatch, query, where, getDocs, QueryDocumentSnapshot,
  Timestamp
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { AuthAdapterService } from '../auth/auth-adapter.service';
import { MockApiService } from '../../core/services/mock-api.service';
import { Observable, switchMap, of } from 'rxjs';
import { Project } from '../../core/models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private firestore: Firestore = inject(Firestore);
  private authService = inject(AuthService);
  private authAdapter = inject(AuthAdapterService);
  private mockApi = inject(MockApiService);
  private projectsCollection = collection(this.firestore, 'projects');

  /**
   * Verificar se deve usar mock ou firebase
   */
  private useMock(): boolean {
    return this.authAdapter.getAuthMode() === 'mock';
  }

  /**
   * Retorna todos os projetos do usuário logado
   */
  getAllProjects(): Observable<Project[]> {
    console.log('📂 ProjectService.getAllProjects() - useMock:', this.useMock());
    
    if (this.useMock()) {
      return this.mockApi.getProjects();
    }

    return this.authService.userId$.pipe(
      switchMap((userId): Observable<Project[]> => {
        if (!userId) {
          return of([]);
        }
        const projectsQuery = query(this.projectsCollection, where('userId', '==', userId));
        return collectionData(projectsQuery, { idField: 'id' }) as Observable<Project[]>;
      })
    );
  }

  /**
   * Retorna um projeto específico
   */
  getProjectById(id: string): Observable<Project> {
    console.log('🔍 ProjectService.getProjectById() - useMock:', this.useMock(), 'id:', id);
    
    if (this.useMock()) {
      return this.mockApi.getProjectById(id) as Observable<Project>;
    }

    const projectDoc = doc(this.firestore, `projects/${id}`);
    return docData(projectDoc, { idField: 'id' }) as Observable<Project>;
  }

  /**
   * Cria um novo projeto
   */
  async createProject(project: { title: string; description: string }): Promise<any> {
    console.log('➕ ProjectService.createProject() - useMock:', this.useMock());
    
    if (this.useMock()) {
      const result = await this.mockApi.createProject(project).toPromise();
      console.log('✅ Mock createProject resultado:', result);
      return result;
    }

    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    const newProject = {
      ...project,
      userId,
      progress: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    return addDoc(this.projectsCollection, newProject);
  }

  /**
   * Atualiza um projeto
   */
  async updateProject(id: string, changes: Partial<Project>): Promise<void> {
    console.log('✏️  ProjectService.updateProject() - useMock:', this.useMock());
    
    if (this.useMock()) {
      const result = await this.mockApi.updateProject(id, changes).toPromise();
      console.log('✅ Mock updateProject resultado:', result);
      return;
    }

    const projectDoc = doc(this.firestore, `projects/${id}`);
    const updatedChanges = {
      ...changes,
      updatedAt: Timestamp.now()
    };
    return updateDoc(projectDoc, updatedChanges);
  }

  /**
   * Deleta um projeto e todas as suas tarefas
   */
  async deleteProject(id: string): Promise<void> {
    console.log('🗑️  ProjectService.deleteProject() - useMock:', this.useMock());
    
    if (this.useMock()) {
      const result = await this.mockApi.deleteProject(id).toPromise();
      console.log('✅ Mock deleteProject resultado:', result);
      return;
    }

    const tasksCollection = collection(this.firestore, 'tasks');
    const tasksQuery = query(tasksCollection, where('projectId', '==', id));
    const tasksSnapshot = await getDocs(tasksQuery);

    const batch = writeBatch(this.firestore);
    tasksSnapshot.forEach((taskDoc: QueryDocumentSnapshot) => {
      batch.delete(doc(this.firestore, 'tasks', taskDoc.id));
    });

    const projectDoc = doc(this.firestore, `projects/${id}`);
    batch.delete(projectDoc);

    return batch.commit();
  }
}
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc, getDoc, collectionData, docData } from '@angular/fire/firestore';
import { FirebaseAuthService } from '../auth/firebase-auth.service';
import { Observable, from, of, throwError } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Project } from '../../core/models/project.model';

@Injectable({ providedIn: 'root' })
export class FirebaseProjectService {
  private firestore: Firestore = inject(Firestore);
  private authService: FirebaseAuthService = inject(FirebaseAuthService);

  createProject(project: Partial<Project>): Observable<Project> {
    console.log('📂🔥 FirebaseProjectService.createProject():', project.title);
    
    return this.authService.userId$.pipe(
      switchMap((userId: any) => {
        if (!userId) {
          return throwError(() => new Error('Usuário não autenticado'));
        }
        
        const projectData = {
          title: project.title || '',
          description: project.description || '',
          userId: userId as string,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const projectsRef = collection(this.firestore, 'projects');
        return from(addDoc(projectsRef, projectData)).pipe(
          tap(docRef => {
            console.log('✅ Projeto criado no Firestore:', docRef.id);
          }),
          map(docRef => ({
            id: docRef.id,
            ...projectData
          } as any as Project)),
          catchError(error => {
            console.error('❌ Erro ao criar projeto:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  getAllProjects(): Observable<Project[]> {
    console.log('📂🔥 FirebaseProjectService.getAllProjects()');
    
    return this.authService.userId$.pipe(
      switchMap((userId: any) => {
        if (!userId) {
          console.log('⚠️  Usuário não autenticado, retornando lista vazia');
          return of([]);
        }
        
        const projectsRef = collection(this.firestore, 'projects');
        const q = query(projectsRef, where('userId', '==', userId));
        
        return from(getDocs(q)).pipe(
          tap(() => {
            console.log('✅ Projetos carregados do Firestore');
          }),
          map(snapshot => {
            const projects: Project[] = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              projects.push({
                id: doc.id,
                title: data['title'],
                description: data['description'],
                userId: data['userId'],
                createdAt: data['createdAt'] instanceof Date ? data['createdAt'] : new Date(data['createdAt']),
                updatedAt: data['updatedAt'] instanceof Date ? data['updatedAt'] : new Date(data['updatedAt'])
              } as any as Project);
            });
            console.log('📋 Total de projetos:', projects.length);
            return projects;
          }),
          catchError(error => {
            console.error('❌ Erro ao carregar projetos:', error);
            return of([]);
          })
        );
      })
    );
  }

  getProjectById(id: string): Observable<Project | null> {
    console.log('📂🔥 FirebaseProjectService.getProjectById():', id);
    
    const projectRef = doc(this.firestore, 'projects', id);
    return from(getDoc(projectRef)).pipe(
      tap(() => {
        console.log('✅ Projeto carregado do Firestore:', id);
      }),
      map(docSnap => {
        if (!docSnap.exists()) {
          console.warn('⚠️  Projeto não encontrado:', id);
          return null;
        }
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data['title'],
          description: data['description'],
          userId: data['userId'],
          createdAt: data['createdAt'] instanceof Date ? data['createdAt'] : new Date(data['createdAt']),
          updatedAt: data['updatedAt'] instanceof Date ? data['updatedAt'] : new Date(data['updatedAt'])
        } as any as Project;
      }),
      catchError(error => {
        console.error('❌ Erro ao carregar projeto:', error);
        return of(null);
      })
    );
  }

  updateProject(id: string, updates: Partial<Project>): Observable<void> {
    console.log('📂🔥 FirebaseProjectService.updateProject():', id);
    
    const projectRef = doc(this.firestore, 'projects', id);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return from(updateDoc(projectRef, updateData)).pipe(
      tap(() => {
        console.log('✅ Projeto atualizado no Firestore:', id);
      }),
      catchError(error => {
        console.error('❌ Erro ao atualizar projeto:', error);
        return throwError(() => error);
      })
    );
  }

  deleteProject(id: string): Observable<void> {
    console.log('📂🔥 FirebaseProjectService.deleteProject():', id);
    
    const projectRef = doc(this.firestore, 'projects', id);
    return from(deleteDoc(projectRef)).pipe(
      tap(() => {
        console.log('✅ Projeto deletado do Firestore:', id);
      }),
      catchError(error => {
        console.error('❌ Erro ao deletar projeto:', error);
        return throwError(() => error);
      })
    );
  }
}

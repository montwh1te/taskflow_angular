import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../../core/models/project.model';
import { FirebaseProjectService } from './firebase-project.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private firebaseProjectService = inject(FirebaseProjectService);

  getAllProjects(): Observable<Project[]> {
    console.log('📂 ProjectService.getAllProjects()');
    return this.firebaseProjectService.getAllProjects();
  }

  getProjectById(id: string): Observable<Project | null> {
    console.log('📂 ProjectService.getProjectById()', id);
    return this.firebaseProjectService.getProjectById(id);
  }

  createProject(project: Partial<Project>): Observable<Project> {
    console.log('📂 ProjectService.createProject()');
    return this.firebaseProjectService.createProject(project);
  }

  updateProject(id: string, updates: Partial<Project>): Observable<void> {
    console.log('📂 ProjectService.updateProject()', id);
    return this.firebaseProjectService.updateProject(id, updates);
  }

  deleteProject(id: string): Observable<void> {
    console.log('📂 ProjectService.deleteProject()', id);
    return this.firebaseProjectService.deleteProject(id);
  }
}

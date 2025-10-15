import { Injectable } from '@angular/core';
import { MockApiService } from '../../core/services/mock-api.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private api: MockApiService) {}

  getAllProjects() {
    return this.api.getProjects();
  }
  getProjectById(id: number) {
    return this.api.getProjectById(id);
  }

  createProject(project: { title: string; description: string }) {
    return this.api.createProject(project);
  }

  updateProject(id: number, changes: { title?: string; description?: string }) {
    return this.api.updateProject(id, changes);
  }

  deleteProject(id: number) {
    return this.api.deleteProject(id);
  }
}
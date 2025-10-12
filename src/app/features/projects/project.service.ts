import { Injectable } from '@angular/core';
import { MockApiService } from '../../core/services/mock-api.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private api: MockApiService) {}

  getAllProjects() {
    return this.api.getProjects();
  }
  // Implementar getById, create, update, delete aqui...
}
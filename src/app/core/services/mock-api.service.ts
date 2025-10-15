import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

// Simula um banco de dados
const MOCK_PROJECTS = [
  { id: 1, title: 'Desenvolvimento do App Mobile', description: 'Criar o aplicativo para iOS e Android.' },
  { id: 2, title: 'Trabalho de Conclusão de Curso', description: 'Escrever a monografia sobre IA.' },
];

const MOCK_TASKS = [
  { id: 101, projectId: 1, title: 'Configurar ambiente de dev', description: 'Instalar todas as dependências.', status: 'Concluído', dueDate: new Date('2025-10-15') },
  { id: 102, projectId: 1, title: 'Criar tela de login', description: 'Desenvolver o componente de autenticação.', status: 'Em Andamento', dueDate: new Date('2025-10-20') },
  { id: 103, projectId: 2, title: 'Pesquisa bibliográfica', description: 'Encontrar artigos relevantes.', status: 'A Fazer', dueDate: new Date('2025-10-18') },
];

@Injectable({
  providedIn: 'root'
})
export class MockApiService {

  constructor() { }

  login(email: string, password: string): Observable<{ token: string } | null> {
    if (email === 'user@taskflow.com' && password === '123456') {
      const fakeJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      return of({ token: fakeJwtToken }).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  getProjects() {
    return of(MOCK_PROJECTS).pipe(delay(300));
  }

  getTasksByProjectId(projectId: number) {
    const tasks = MOCK_TASKS.filter(t => t.projectId === projectId);
    return of(tasks).pipe(delay(300));
  }

  getProjectById(id: number) {
    const project = MOCK_PROJECTS.find(p => p.id === id);
    return of(project).pipe(delay(300));
  }

  createProject(project: { title: string; description: string }) {
    const newId = MOCK_PROJECTS.length ? Math.max(...MOCK_PROJECTS.map(p => p.id)) + 1 : 1;
    const newProject = { id: newId, ...project };
    MOCK_PROJECTS.push(newProject);
    return of(newProject).pipe(delay(300));
  }

  updateProject(id: number, changes: { title?: string; description?: string }): Observable<any> {
    const project = MOCK_PROJECTS.find(p => p.id === id);
    if (project) {
      Object.assign(project, changes);
      return of(project).pipe(delay(300));
    }
    return of(null).pipe(delay(300));
  }

  deleteProject(id: number) {
    const idx = MOCK_PROJECTS.findIndex(p => p.id === id);
    if (idx > -1) {
      MOCK_PROJECTS.splice(idx, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
}

  createTask(task: { projectId: number; title: string; description: string; status: string; dueDate: Date }) {
    const newId = MOCK_TASKS.length ? Math.max(...MOCK_TASKS.map(t => t.id)) + 1 : 101;
    const newTask = { id: newId, ...task };
    MOCK_TASKS.push(newTask);
    return of(newTask).pipe(delay(300));
}

  updateTask(id: number, changes: { title?: string; description?: string; status?: string; dueDate?: Date }): Observable<any> {
    const task = MOCK_TASKS.find(t => t.id === id);
    if (task) {
      Object.assign(task, changes);
      return of(task).pipe(delay(300));
    }
    return of(null).pipe(delay(300));
  }

  deleteTask(id: number) {
    const idx = MOCK_TASKS.findIndex(t => t.id === id);
    if (idx > -1) {
      MOCK_TASKS.splice(idx, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
}
}
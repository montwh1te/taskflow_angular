import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { Task, TaskStatus } from '../models/task.model';

// Os dados originais agora servem como um "estado inicial" caso o localStorage esteja vazio.
const DEFAULT_PROJECTS: Project[] = [
  { id: '1', title: 'Desenvolvimento do App Mobile', description: 'Criar o aplicativo para iOS e Android.', userId: 'user1' },
  { id: '2', title: 'Trabalho de Conclusão de Curso', description: 'Escrever a monografia sobre IA.', userId: 'user1' },
];

const DEFAULT_TASKS: Task[] = [
  { id: '101', projectId: '1', title: 'Configurar ambiente de dev', description: 'Instalar todas as dependências.', status: 'Concluído', dueDate: new Date('2025-10-18'), userId: 'user1' },
  { id: '102', projectId: '1', title: 'Criar tela de login', description: 'Desenvolver o componente de autenticação.', status: 'Em Andamento', dueDate: new Date('2025-10-17'), userId: 'user1' },
  { id: '103', projectId: '2', title: 'Pesquisa bibliográfica', description: 'Encontrar artigos relevantes.', status: 'A Fazer', dueDate: new Date('2025-10-16'), userId: 'user1' },
];


@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  // As arrays agora são propriedades da classe, guardando o estado atual.
  private projects: Project[] = [];
  private tasks: Task[] = [];

  constructor() {
    this.loadDataFromLocalStorage();
  }

  // --- MÉTODOS DE PERSISTÊNCIA ---

  private loadDataFromLocalStorage(): void {
    const projectsData = localStorage.getItem('mock_projects');
    this.projects = projectsData ? JSON.parse(projectsData) : [...DEFAULT_PROJECTS];

    const tasksData = localStorage.getItem('mock_tasks');
    if (tasksData) {
      // Importante: O JSON não salva objetos Date, então precisamos convertê-los de volta.
      this.tasks = JSON.parse(tasksData).map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate)
      }));
    } else {
      this.tasks = [...DEFAULT_TASKS];
    }

    this.saveDataToLocalStorage(); // Garante que os defaults sejam salvos na primeira vez
  }

  private saveDataToLocalStorage(): void {
    localStorage.setItem('mock_projects', JSON.stringify(this.projects));
    localStorage.setItem('mock_tasks', JSON.stringify(this.tasks));
  }

  // --- MÉTODOS DA API (ADAPTADOS) ---

  login(email: string, password: string): Observable<{ token: string } | null> {
    if (email === 'user@taskflow.com' && password === '123456') {
      const fakeJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      return of({ token: fakeJwtToken }).pipe(delay(500));
    }
    return of(null).pipe(delay(500));
  }

  // --- MÉTODOS DE PROJETO ---

  getProjects() {
    return of([...this.projects]).pipe(delay(300));
  }

  getProjectById(id: string) {
    const project = this.projects.find(p => p.id === id);
    return of(project ? {...project} : undefined).pipe(delay(300));
  }

  createProject(project: { title: string; description: string }) {
    const newId = this.projects.length ? (Math.max(...this.projects.map(p => parseInt(p.id || '0', 10))) + 1).toString() : '1';
    const newProject: Project = { id: newId, ...project, userId: 'user1' };
    this.projects.push(newProject);
    this.saveDataToLocalStorage(); // Salva a mudança
    return of(newProject).pipe(delay(300));
  }

  updateProject(id: string, changes: { title?: string; description?: string }): Observable<Project | null> {
    const projectIndex = this.projects.findIndex(p => p.id === id);
    if (projectIndex > -1) {
      this.projects[projectIndex] = { ...this.projects[projectIndex], ...changes };
      this.saveDataToLocalStorage(); // Salva a mudança
      return of(this.projects[projectIndex]).pipe(delay(300));
    }
    return of(null).pipe(delay(300));
  }

  deleteProject(id: string) {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx > -1) {
      this.projects.splice(idx, 1);
      // Também removemos as tarefas associadas a este projeto
      this.tasks = this.tasks.filter(t => t.projectId !== id);
      this.saveDataToLocalStorage(); // Salva a mudança
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  // --- MÉTODOS DE TAREFA ---

  getAllTasks(): Observable<Task[]> {
    return of([...this.tasks]).pipe(delay(300));
  }

  getTasksByProjectId(projectId: string) {
    const tasks = this.tasks.filter(t => t.projectId === projectId);
    return of([...tasks]).pipe(delay(300));
  }

  getTaskById(id: string) {
    const task = this.tasks.find(t => t.id === id);
    return of(task ? {...task} : undefined).pipe(delay(300));
  }

  createTask(task: { projectId: string; title: string; description: string; status: string; dueDate: Date }) {
    const newId = this.tasks.length ? (Math.max(...this.tasks.map(t => parseInt(t.id || '100', 10))) + 1).toString() : '101';
    const newTask: Task = {
      id: newId,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      dueDate: new Date(task.dueDate),
      userId: 'user1'
    };
    this.tasks.push(newTask);
    this.saveDataToLocalStorage(); // Salva a mudança
    return of(newTask).pipe(delay(300));
  }

  updateTask(id: string, changes: { title?: string; description?: string; status?: string; dueDate?: Date }): Observable<Task | null> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      const current = this.tasks[taskIndex];
      this.tasks[taskIndex] = {
        ...current,
        ...changes,
        status: changes.status !== undefined ? changes.status as TaskStatus : current.status,
        dueDate: changes.dueDate !== undefined ? new Date(changes.dueDate) : current.dueDate
      };
      this.saveDataToLocalStorage(); // Salva a mudança
      return of(this.tasks[taskIndex]).pipe(delay(300));
    }
    return of(null).pipe(delay(300));
  }

  deleteTask(id: string) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx > -1) {
      this.tasks.splice(idx, 1);
      this.saveDataToLocalStorage(); // Salva a mudança
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}
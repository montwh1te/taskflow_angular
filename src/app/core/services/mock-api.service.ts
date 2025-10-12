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

  // ADICIONADO O TIPO DE RETORNO AQUI
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

  // Adicione aqui métodos para criar, editar e deletar projetos/tarefas...
}
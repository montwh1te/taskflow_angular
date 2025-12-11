import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, map, finalize } from 'rxjs/operators';
import { Project } from '../../../core/models/project.model';
import { Task, TaskAttachment } from '../../../core/models/task.model';
import { ProjectService } from '../project.service';
import { TaskService } from '../task.service';
import { MatDialog } from '@angular/material/dialog';
import { ProjectFormDialogComponent, ProjectFormData } from '../project-form-dialog/project-form-dialog';
import { TaskFormDialogComponent, TaskFormData } from '../task-form-dialog/task-form-dialog';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe, CommonModule } from '@angular/common';
import { TaskFilterPipe } from '../../../shared/pipes/task-filter-pipe';
import { TaskSearchPipe } from '../../../shared/pipes/task-search.pipe';
import { TimestampToDatePipe } from '../../../shared/pipes/timestamp-to-date.pipe';
import { AttachmentViewerComponent } from '../attachment-viewer/attachment-viewer';
import { Router } from '@angular/router';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.scss'],
  imports: [ MaterialImportsModule, DatePipe, TaskFilterPipe, TaskSearchPipe, TimestampToDatePipe, CommonModule, AttachmentViewerComponent ]
})
export class ProjectDetailComponent implements OnInit { // Renomeie a classe
  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private router: Router
  ) {}
  selectedStatus: import('../../../core/models/task.model').TaskStatus | 'Todos' = 'Todos';
  searchText: string = '';
  project$!: Observable<Project | null>;
  tasks$!: Observable<Task[]>;

  ngOnInit(): void {
    const projectId$ = this.route.params.pipe(
      map((params: any) => params['id'])
    );

    this.project$ = projectId$.pipe(
      switchMap((id: string) => this.projectService.getProjectById(id))
    );

    this.tasks$ = projectId$.pipe(
      switchMap((id: string) => this.taskService.getTasksByProjectId(id)),
      map((tasks: any[]) => tasks.map(t => ({ ...t, status: t.status as import('../../../core/models/task.model').TaskStatus })))
    );
  }

  openProjectDialog(project?: Project) {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '400px',
      data: project ? { ...project } : { title: '', description: '' }
    });
    dialogRef.afterClosed().subscribe((result: ProjectFormData) => {
      if (result) {
        if (project && project.id) {
          this.projectService.updateProject(project.id, result).subscribe({
            next: () => this.refreshProject(project.id),
            error: (error: any) => console.error('Erro ao atualizar projeto:', error)
          });
        } else {
          this.projectService.createProject(result).subscribe({
            next: () => this.refreshProjects(),
            error: (error: any) => console.error('Erro ao criar projeto:', error)
          });
        }
      }
    });
  }

  openTaskDialog(task?: Task, projectId?: string) {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '400px',
      data: task ? { ...task } : { title: '', description: '', status: 'A Fazer', dueDate: '', projectId }
    });
    dialogRef.afterClosed().subscribe((result: TaskFormData) => {
      if (result) {
        if (task && task.id) {
          console.log('✏️ Atualizando tarefa:', task.id, 'Anexos:', result.attachments?.length || 0);
          this.taskService.updateTask(task.id, result as any).subscribe({
            next: () => this.refreshTasks(task.projectId),
            error: (error: any) => console.error('❌ Erro ao atualizar tarefa:', error)
          });
        } else if (projectId) {
          console.log('➕ Criando nova tarefa. Anexos para upload:', result.attachments?.length || 0);
          this.taskService.createTask({ ...result, projectId, status: result.status as any } as any).subscribe({
            next: (newTask: Task) => {
              console.log('✅ Tarefa criada com ID:', newTask.id);
              // Se houver anexos, salvar no Firestore
              if (result.attachments && result.attachments.length > 0 && newTask.id) {
                console.log('💾 Salvando', result.attachments.length, 'anexo(s) para tarefa:', newTask.id);
                result.attachments.forEach((att, idx) => {
                  console.log(`  ${idx + 1}. ${att.fileName} - URL: ${att.fileUrl.substring(0, 60)}...`);
                });
                this.taskService.addAttachment(newTask.id, result.attachments).subscribe({
                  next: () => {
                    console.log('✅ Anexos salvos no Firestore com sucesso');
                    this.refreshTasks(projectId);
                  },
                  error: (error: any) => {
                    console.error('❌ Erro ao salvar anexos:', error);
                    this.refreshTasks(projectId);
                  }
                });
              } else {
                console.log('ℹ️ Nenhum anexo para salvar');
                this.refreshTasks(projectId);
              }
            },
            error: (error: any) => console.error('❌ Erro ao criar tarefa:', error)
          });
        }
      }
    });
  }

  deleteProject(id: string | undefined) {
    if (id) {
      this.projectService.deleteProject(id).subscribe({
        next: () => this.router.navigate(['/projects']),
        error: (error: any) => console.error('Erro ao deletar projeto:', error)
      });
    }
  }

  goToProjects() {
    this.router.navigate(['/projects']);
  }

  deleteTask(id: string | undefined, projectId: string) {
    if (id) {
      this.taskService.deleteTask(id).subscribe({
        next: () => this.refreshTasks(projectId),
        error: (error: any) => console.error('Erro ao deletar tarefa:', error)
      });
    }
  }

  deleteAttachment(task: Task, attachment: TaskAttachment) {
    if (task.id) {
      console.log('🗑️ Removendo anexo:', attachment.fileName, 'da tarefa:', task.id);
      // Remove o anexo da lista
      const updatedAttachments = (task.attachments || []).filter(a => a.id !== attachment.id);
      // Atualiza a tarefa no Firestore
      this.taskService.addAttachment(task.id, updatedAttachments).subscribe({
        next: () => {
          console.log('✅ Anexo removido com sucesso');
          this.refreshTasks(task.projectId);
        },
        error: (error: any) => {
          console.error('❌ Erro ao remover anexo:', error);
        }
      });
    }
  }

  refreshProject(id: string | undefined) {
    if (id) {
      this.project$ = this.projectService.getProjectById(id);
    }
  }

  refreshProjects() {
    // Não faz sentido recarregar todos os projetos aqui, pois estamos no detalhe
    // Pode redirecionar ou atualizar a lista em outro componente
  }

  refreshTasks(projectId: string) {
    this.tasks$ = this.taskService.getTasksByProjectId(projectId).pipe(
      map((tasks: any[]) => tasks.map(t => ({ ...t, status: t.status as import('../../../core/models/task.model').TaskStatus })))
    );
  }
}
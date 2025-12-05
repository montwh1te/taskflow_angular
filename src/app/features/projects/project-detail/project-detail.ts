import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Project } from '../../../core/models/project.model';
import { Task } from '../../../core/models/task.model';
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
import { Router } from '@angular/router';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.scss'],
  imports: [ MaterialImportsModule, DatePipe, TaskFilterPipe, TaskSearchPipe, TimestampToDatePipe, CommonModule ]
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
  project$!: Observable<Project | undefined>;
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
          this.projectService.updateProject(project.id, result).then(() => this.refreshProject(project.id));
        } else {
          this.projectService.createProject(result).then(() => this.refreshProjects());
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
          this.taskService.updateTask(task.id, result as any).then(() => this.refreshTasks(task.projectId));
        } else if (projectId) {
          this.taskService.createTask({ ...result, projectId, status: result.status as any } as any).then(() => this.refreshTasks(projectId));
        }
      }
    });
  }

  deleteProject(id: string | undefined) {
    if (id) {
      this.projectService.deleteProject(id).then(() => {
        this.router.navigate(['/projects']);
      });
    }
  }

  goToProjects() {
    this.router.navigate(['/projects']);
  }

  deleteTask(id: string | undefined, projectId: string) {
    if (id) {
      this.taskService.deleteTask(id).then(() => this.refreshTasks(projectId));
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
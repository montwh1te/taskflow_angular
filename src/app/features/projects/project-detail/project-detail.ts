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
import { DatePipe } from '@angular/common';
import { TaskFilterPipe } from '../../../shared/pipes/task-filter-pipe';
import { TaskSearchPipe } from '../../../shared/pipes/task-search.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.scss'],
  imports: [ MaterialImportsModule, DatePipe, TaskFilterPipe, TaskSearchPipe ]
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
      map((params: any) => parseInt(params['id'], 10))
    );

    this.project$ = projectId$.pipe(
      switchMap((id: number) => this.projectService.getProjectById(id))
    );

    this.tasks$ = projectId$.pipe(
      switchMap((id: number) => this.taskService.getTasksByProjectId(id)),
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
        if (project) {
          this.projectService.updateProject(project.id, result).subscribe(() => this.refreshProject(project.id));
        } else {
          this.projectService.createProject(result).subscribe(() => this.refreshProjects());
        }
      }
    });
  }

  openTaskDialog(task?: Task, projectId?: number) {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '400px',
      data: task ? { ...task } : { title: '', description: '', status: 'A Fazer', dueDate: '', projectId }
    });
    dialogRef.afterClosed().subscribe((result: TaskFormData) => {
      if (result) {
        if (task) {
          this.taskService.updateTask(task.id, result).subscribe(() => this.refreshTasks(task.projectId));
        } else if (projectId) {
          this.taskService.createTask({ ...result, projectId }).subscribe(() => this.refreshTasks(projectId));
        }
      }
    });
  }

  deleteProject(id: number) {
    this.projectService.deleteProject(id).subscribe(() => {
      this.router.navigate(['/projects']);
    });
  }

  goToProjects() {
    this.router.navigate(['/projects']);
  }

  deleteTask(id: number, projectId: number) {
    this.taskService.deleteTask(id).subscribe(() => this.refreshTasks(projectId));
  }

  refreshProject(id: number) {
    this.project$ = this.projectService.getProjectById(id);
  }

  refreshProjects() {
    // Não faz sentido recarregar todos os projetos aqui, pois estamos no detalhe
    // Pode redirecionar ou atualizar a lista em outro componente
  }

  refreshTasks(projectId: number) {
    this.tasks$ = this.taskService.getTasksByProjectId(projectId).pipe(
      map((tasks: any[]) => tasks.map(t => ({ ...t, status: t.status as import('../../../core/models/task.model').TaskStatus })))
    );
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Project } from '../../../core/models/project.model';
import { ProjectService } from '../project.service';
import { MaterialImportsModule } from '../../../material-imports.module';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProjectFormDialogComponent, ProjectFormData } from '../project-form-dialog/project-form-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-project-list',
  standalone: true,
  templateUrl: './project-list.html',
  styleUrls: ['./project-list.scss'],
  imports: [CommonModule, MaterialImportsModule, RouterModule, MatProgressSpinnerModule, MatProgressBarModule]
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  private dialog = inject(MatDialog);

  projects$!: Observable<Project[]>;
  isLoading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);
  isDeleting$ = new BehaviorSubject<string | null>(null);

  ngOnInit(): void {
    this.loadProjects();
  }

  /**
   * Carrega todos os projetos
   */
  loadProjects() {
    this.isLoading$.next(true);
    this.error$.next(null);
    this.projects$ = this.projectService.getAllProjects();
  }

  /**
   * Abre diálogo para criar novo projeto
   */
  openCreateDialog() {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '500px',
      data: { title: '', description: '' }
    });

    dialogRef.afterClosed().subscribe((result: ProjectFormData) => {
      if (result) {
        this.isLoading$.next(true);
        this.projectService.createProject(result)
          .pipe(finalize(() => this.isLoading$.next(false)))
          .subscribe({
            next: () => {
              this.loadProjects();
            },
            error: (error: any) => {
              this.error$.next('Erro ao criar projeto. Tente novamente.');
              console.error('Erro ao criar projeto:', error);
            }
          });
      }
    });
  }

  /**
   * Abre diálogo para editar projeto
   */
  openEditDialog(project: Project) {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '500px',
      data: { ...project }
    });

    dialogRef.afterClosed().subscribe((result: ProjectFormData) => {
      if (result) {
        this.isLoading$.next(true);
        this.projectService.updateProject(project.id!, result)
          .pipe(finalize(() => this.isLoading$.next(false)))
          .subscribe({
            next: () => {
              this.loadProjects();
            },
            error: (error: any) => {
              this.error$.next('Erro ao atualizar projeto. Tente novamente.');
              console.error('Erro ao atualizar projeto:', error);
            }
          });
      }
    });
  }

  /**
   * Abre diálogo de confirmação e deleta projeto
   */
  openDeleteDialog(project: Project) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { projectTitle: project.title }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteProject(project);
      }
    });
  }

  /**
   * Deleta um projeto
   */
  private deleteProject(project: Project) {
    this.isDeleting$.next(project.id!);
    this.projectService.deleteProject(project.id!)
      .pipe(finalize(() => this.isDeleting$.next(null)))
      .subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error: any) => {
          this.error$.next('Erro ao deletar projeto. Tente novamente.');
          console.error('Erro ao deletar projeto:', error);
        }
      });
  }

  /**
   * Retira mensagem de erro
   */
  clearError() {
    this.error$.next(null);
  }
}

// Componente auxiliar para diálogo de confirmação
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MaterialImportsModule],
  template: `
    <h2 mat-dialog-title>Confirmar Exclusão</h2>
    <mat-dialog-content>
      <p>Tem certeza que deseja excluir o projeto "<strong>{{ data.projectTitle }}</strong>"?</p>
      <p style="color: #d32f2f; font-weight: 500;">Esta ação não pode ser desfeita e todas as tarefas serão removidas.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Deletar</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectTitle: string }
  ) {}

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
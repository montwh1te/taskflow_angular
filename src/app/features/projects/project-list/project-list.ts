import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../../../core/models/project.model';
import { ProjectService } from '../project.service';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProjectFormDialogComponent, ProjectFormData } from '../project-form-dialog/project-form-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-project-list',
  standalone: true,
  templateUrl: './project-list.html',
  styleUrls: ['./project-list.scss'],
  imports: [ MaterialImportsModule, DatePipe, RouterModule, MatProgressSpinnerModule ]
})
export class ProjectListComponent implements OnInit {
  openCreateDialog() {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '400px',
      data: { title: '', description: '' }
    });
    dialogRef.afterClosed().subscribe((result: ProjectFormData) => {
      if (result) {
        this.projectService.createProject(result).subscribe(() => this.refreshProjects());
      }
    });
  }
  projects$!: Observable<Project[]>;

  constructor(private projectService: ProjectService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.refreshProjects();
  }

  openEditDialog(project: Project) {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '400px',
      data: { ...project }
    });
    dialogRef.afterClosed().subscribe((result: ProjectFormData) => {
      if (result) {
        this.projectService.updateProject(project.id, result).subscribe(() => this.refreshProjects());
      }
    });
  }

  openDeleteDialog(project: Project) {
    const confirmed = window.confirm(`Deseja realmente excluir o projeto "${project.title}"?`);
    if (confirmed) {
      this.projectService.deleteProject(project.id).subscribe(() => this.refreshProjects());
    }
  }

  refreshProjects() {
    this.projects$ = this.projectService.getAllProjects();
  }
}
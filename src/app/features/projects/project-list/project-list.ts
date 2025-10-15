import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../../../core/models/project.model';
import { ProjectService } from '../project.service';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.html',
  styleUrls: ['./project-list.scss'],
  imports: [ MaterialImportsModule, DatePipe, RouterModule ]
})
export class ProjectListComponent implements OnInit {
  projects$!: Observable<Project[]>;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projects$ = this.projectService.getAllProjects();
  }
}
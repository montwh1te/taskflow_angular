import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../projects/project.service';
import { MockApiService } from '../../../core/services/mock-api.service'; // Usando direto para simplificar
import { forkJoin } from 'rxjs';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [ MaterialImportsModule, DatePipe, NgxChartsModule ]
})
export class DashboardComponent implements OnInit {
  totalProjects = 0;
  taskStatusData: { name: TaskStatus; value: number }[] = [];
  upcomingTasks: Task[] = [];

  constructor(private apiService: MockApiService) {} // Injetando o mock service

  ngOnInit(): void {
    forkJoin({
      projects: this.apiService.getProjects(),
      tasks: this.apiService.getAllTasks()
    }).subscribe(({ projects, tasks }) => {
      this.totalProjects = projects.length;

      // Gráfico de tarefas por status
      const statusCount = tasks.reduce((acc, task) => {
        const status = task.status as TaskStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<TaskStatus, number>);
      this.taskStatusData = Object.keys(statusCount).map(key => ({
        name: key as TaskStatus,
        value: statusCount[key as TaskStatus]
      }));

      // Tarefas com vencimento próximo (3 dias)
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      this.upcomingTasks = tasks
        .map(task => ({
          ...task,
          status: task.status as TaskStatus,
          dueDate: new Date(task.dueDate)
        }))
        .filter(task => task.dueDate > today && task.dueDate <= threeDaysFromNow);
    });
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { ProjectService } from '../../projects/project.service';
import { TaskService } from '../../projects/task.service';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe, CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TimestampToDatePipe } from '../../../shared/pipes/timestamp-to-date.pipe';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [ MaterialImportsModule, DatePipe, NgxChartsModule, CommonModule, TimestampToDatePipe ]
})
export class DashboardComponent implements OnInit {
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);

  totalProjects = 0;
  taskStatusData: { name: TaskStatus; value: number }[] = [];
  upcomingTasks: Task[] = [];

  ngOnInit(): void {
    // Buscar projetos do Firebase
    this.projectService.getAllProjects().pipe(
      switchMap(projects => {
        this.totalProjects = projects.length;
        
        // Se não há projetos, retornar array vazio de tarefas
        if (projects.length === 0) {
          return combineLatest([]);
        }

        // Buscar tarefas de cada projeto
        const taskObservables = projects.map(project =>
          this.taskService.getTasksByProjectId(project.id!)
        );

        return combineLatest(taskObservables);
      }),
      map(projectTasks => {
        // Achatar o array de arrays
        return projectTasks.flat();
      })
    ).subscribe(
      allTasks => {
        console.log('📊 Dashboard - Tarefas carregadas do Firebase:', allTasks.length);

        // Gráfico de tarefas por status
        const statusCount = allTasks.reduce((acc, task) => {
          const status = task.status || 'A Fazer' as TaskStatus;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        this.taskStatusData = Object.keys(statusCount).map(key => ({
          name: key as TaskStatus,
          value: statusCount[key]
        }));

        // Tarefas com vencimento próximo (3 dias)
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        this.upcomingTasks = allTasks
          .filter(task => {
            if (!task.dueDate) return false;
            let dueDate: Date | null = null;
            
            if (task.dueDate instanceof Date) {
              dueDate = task.dueDate;
            } else if (typeof task.dueDate === 'string') {
              dueDate = new Date(task.dueDate);
            } else if (task.dueDate && typeof task.dueDate === 'object' && 'toDate' in task.dueDate) {
              // Firestore Timestamp
              dueDate = task.dueDate.toDate();
            }
            
            if (!dueDate) return false;
            return dueDate > today && dueDate <= threeDaysFromNow;
          })
          .sort((a, b) => {
            let dateA: Date | null = null;
            let dateB: Date | null = null;
            
            // Extract Date A
            if (a.dueDate instanceof Date) {
              dateA = a.dueDate;
            } else if (typeof a.dueDate === 'string') {
              dateA = new Date(a.dueDate);
            } else if (a.dueDate && typeof a.dueDate === 'object' && 'toDate' in a.dueDate) {
              dateA = a.dueDate.toDate();
            }
            
            // Extract Date B
            if (b.dueDate instanceof Date) {
              dateB = b.dueDate;
            } else if (typeof b.dueDate === 'string') {
              dateB = new Date(b.dueDate);
            } else if (b.dueDate && typeof b.dueDate === 'object' && 'toDate' in b.dueDate) {
              dateB = b.dueDate.toDate();
            }
            
            if (!dateA || !dateB) return 0;
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5); // Mostrar apenas os 5 próximos
      },
      error => {
        console.error('❌ Erro ao carregar dashboard:', error);
      }
    );
  }
}

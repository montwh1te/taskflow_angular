import { Pipe, PipeTransform } from '@angular/core';
import { Task, TaskStatus } from '../../core/models/task.model';

@Pipe({
  name: 'taskFilter'
})
export class TaskFilterPipe implements PipeTransform {
  transform(tasks: Task[] | null, status: TaskStatus | 'Todos'): Task[] {
    if (!tasks || status === 'Todos') {
      return tasks || [];
    }
    return tasks.filter(task => task.status === status);
  }
}

// Uso no HTML
// <mat-form-field>
//   <mat-label>Filtrar por Status</mat-label>
//   <mat-select [(ngModel)]="selectedStatus">
//     <mat-option value="Todos">Todos</mat-option>
//     <mat-option value="A Fazer">A Fazer</mat-option>
//     <mat-option value="Em Andamento">Em Andamento</mat-option>
//     <mat-option value="Concluído">Concluído</mat-option>
//   </mat-select>
// </mat-form-field>

// <div *ngFor="let task of tasks | taskFilter:selectedStatus">
//   </div>
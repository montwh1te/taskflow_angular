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
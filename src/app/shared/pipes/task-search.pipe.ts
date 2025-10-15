import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '../../core/models/task.model';

@Pipe({
  name: 'taskSearch'
})
export class TaskSearchPipe implements PipeTransform {
  transform(tasks: Task[] | null, searchText: string): Task[] {
    if (!tasks || !searchText) {
      return tasks || [];
    }
    const lower = searchText.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(lower) ||
      task.description.toLowerCase().includes(lower)
    );
  }
}
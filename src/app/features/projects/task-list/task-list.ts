import { Component } from '@angular/core';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-list',
  imports: [ MaterialImportsModule, DatePipe ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss'
})
export class TaskList {

}

import { Component } from '@angular/core';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-form',
  imports: [ MaterialImportsModule, DatePipe ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss'
})
export class TaskForm {

}

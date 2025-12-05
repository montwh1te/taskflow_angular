import { Component } from '@angular/core';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-form',
  imports: [ MaterialImportsModule ],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss'
})
export class ProjectForm {

}

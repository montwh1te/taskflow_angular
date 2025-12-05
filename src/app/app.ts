import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MaterialImportsModule } from './material-imports.module';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MaterialImportsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('taskflow-app');
}

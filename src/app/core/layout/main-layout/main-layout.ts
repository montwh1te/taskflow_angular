import { Component } from '@angular/core';
import { Header } from '../header/header'
import { RouterModule } from '@angular/router';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [ Header, RouterModule, MaterialImportsModule, DatePipe ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayoutComponent {}

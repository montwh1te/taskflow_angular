import { Component } from '@angular/core';
import { Header } from '../header/header'
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [ Header, RouterModule ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {

}

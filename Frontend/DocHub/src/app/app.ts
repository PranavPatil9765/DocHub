import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports:[RouterModule]
})
export class App {

}

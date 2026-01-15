import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { ToastComponent } from "./components/toast/toast";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterModule, ToastComponent]
})
export class App {

}

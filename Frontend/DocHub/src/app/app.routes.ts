import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { authGuard } from './auth/guards/auth-guard';
import { Dochub } from './pages/dochub/dochub';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
  path: 'social-login',
  loadComponent: () =>
    import('./auth/social-login/social-login')
      .then(m => m.SocialLoginComponent)
  },

  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dochub', component: Dochub, canActivate: [authGuard] }
];

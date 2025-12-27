import { authGuard } from './auth/guards/auth-guard';
import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent),
      },
      {
        path: 'social-login',
        loadComponent: () => import('./auth/social-login/social-login').then((m) => m.SocialLoginComponent),
      },
    ],
  },
  {
    path: '',
    component: MainLayout,
    // canActivate:[authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'dochub', loadComponent: () => import('./pages/dochub/dochub').then(m => m.Dochub) },
      { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics').then(m => m.Analytics) },
    ]
  },
  { path: '**', redirectTo: 'login' },


];

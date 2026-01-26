import { Collections } from './pages/collections/collections';
import { authGuard } from './auth/guards/auth-guard';
import { Routes } from '@angular/router';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
   { path: '', redirectTo: 'login', pathMatch: 'full' },
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
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
      },
      {
        path: 'verify-otp',
        loadComponent: () => import('./pages/verify-otp/verify-otp').then((m) => m.VerifyOtpComponent),
      },

    ],
  },
  {
    path: '',
    component: MainLayout,
    canActivate:[authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'dochub', loadComponent: () => import('./pages/dochub/dochub').then(m => m.Dochub) },
      { path: 'analytics', loadComponent: () => import('./pages/analytics/analytics').then(m => m.Analytics) },
      { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About) },
      { path: 'collections', children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/collections/collections')
            .then(m => m.Collections),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/collection-details/collection-details')
            .then(m => m.CollectionDetailsComponent),
      },
      {
        path: 'default/:name',
        loadComponent: () =>
          import('./pages/collection-details/collection-details')
            .then(m => m.CollectionDetailsComponent),
      },
    ], },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile) },
      { path: 'file-uploads', loadComponent: () => import('./pages/file-uploads/file-uploads').then(m => m.FileUploadsPage) },

    ]
  },
  { path: '**', redirectTo: '/login' }


];

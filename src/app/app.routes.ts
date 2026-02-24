import { Routes } from '@angular/router';
import { LoginPage } from './pages/login-page/login-page';
import { CounterPage } from './pages/counter-page/counter-page';
import { AdminLogsPage } from './pages/admin-logs/admin-logs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = (route: any, state: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

const guardGuard = (route: any, state: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getUserRole();
  if (role === 'GUARD') {
    return true;
  }

  router.navigate(['/logs']);
  return false;
};

const adminGuard = (route: any, state: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getUserRole();
  if (role === 'ADMIN') {
    return true;
  }

  router.navigate(['/counter']);
  return false;
};

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'counter',
    component: CounterPage,
    canActivate: [guardGuard]
  },
  {
    path: 'logs',
    component: AdminLogsPage,
    canActivate: [adminGuard]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

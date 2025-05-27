import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)},

  { path: 'catalog', loadComponent: () => import('./pages/catalog-page/catalog-page.component')
    .then(
        (m) => m.CatalogPageComponent
      ),
    canActivate: [authGuard], 
  },

  { path: 'favorites', loadComponent: () => import('./pages/favorites-page/favorites-page.component')
    .then(
        (m) => m.FavoritesPageComponent
      ),
    canActivate: [authGuard],
  },

  { path: 'details/:id', loadComponent: () => import('./pages/detail-page/detail-page.component')
    .then(
        (m) => m.DetailPageComponent
      ),
    canActivate: [authGuard],
  },
  
  { path: '**', redirectTo: '/login' }

];

import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'recoverypass',
    loadChildren: () => import('./recoverypass/recoverypass.module').then(m => m.RecoverypassPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard] // Acceso general para usuarios autenticados
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1] } // Solo accesible para admin
  },
  {
    path: 'product',
    loadChildren: () => import('./product/product.module').then(m => m.ProductPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1,2,3] } // Solo accesible para admin, garzon y cocinero
  },
  {
    path: 'order',
    loadChildren: () => import('./order/order.module').then(m => m.OrderPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1,2] } // Solo accesible para cocineros
  },
  {
    path: 'add-user',
    loadChildren: () => import('./add-user/add-user.module').then(m => m.AddUserPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1] } // Solo accesible para admin
  },
  {
    path: 'add-product',
    loadChildren: () => import('./add-product/add-product.module').then(m => m.AddProductPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1] } // Solo accesible para admin
  },
  {
    path: 'edit-user',
    loadChildren: () => import('./edit-user/edit-user.module').then(m => m.EditUserPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1] } // Solo accesible para admin
  },
  {
    path: 'edit-product',
    loadChildren: () => import('./edit-product/edit-product.module').then(m => m.EditProductPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1] } // Solo accesible para admin
  },
  {
    path: 'board',
    loadChildren: () => import('./board/board.module').then(m => m.BoardPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1,2,3] } // Solo accesible para garzon y admin
  },
  {
    path: 'view-user',
    loadChildren: () => import('./view-user/view-user.module').then(m => m.ViewUserPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1] } // Solo accesible para garzon
  },
  {
    path: 'view-product',
    loadChildren: () => import('./view-product/view-product.module').then(m => m.ViewProductPageModule),
    canActivate: [AuthGuard],
    data: { expectedRoles: [1,2,3] } // Solo accesible para admin y garzon
  },
  {
    path: 'access-denied',
    loadChildren: () => import('./pages/access-denied/access-denied.module').then(m => m.AccessDeniedPageModule)
  },  {
    path: 'add-board',
    loadChildren: () => import('./add-board/add-board.module').then( m => m.AddBoardPageModule)
  },
  {
    path: 'edit-board',
    loadChildren: () => import('./edit-board/edit-board.module').then( m => m.EditBoardPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

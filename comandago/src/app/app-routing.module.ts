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
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'recoverypass',
    loadChildren: () => import('./recoverypass/recoverypass.module').then( m => m.RecoverypassPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then( m => m.UserPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'product',
    loadChildren: () => import('./product/product.module').then( m => m.ProductPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'order',
    loadChildren: () => import('./order/order.module').then( m => m.OrderPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-user',
    loadChildren: () => import('./add-user/add-user.module').then( m => m.AddUserPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'add-product',
    loadChildren: () => import('./add-product/add-product.module').then( m => m.AddProductPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-user',
    loadChildren: () => import('./edit-user/edit-user.module').then( m => m.EditUserPageModule)
  },  {
    path: 'edit-product',
    loadChildren: () => import('./edit-product/edit-product.module').then( m => m.EditProductPageModule)
  },




];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

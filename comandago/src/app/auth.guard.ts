import { map } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RolesService } from './services/roles.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private rolesService: RolesService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userRole = this.rolesService.getUserRole(); // Obtener el rol del usuario
    const expectedRoles = route.data['expectedRoles']; // Obtener los roles permitidos
    
    // Verificar si el rol del usuario está incluido en los roles permitidos
    if (expectedRoles && expectedRoles.includes(userRole)) {
      return true; // Acceso permitido
    }else if(!expectedRoles){
      return true;
    }
  
    // Redirigir al usuario a una página de acceso denegado
    this.router.navigate(['/access-denied']);
    return false; // Acceso denegado
  }
  
}

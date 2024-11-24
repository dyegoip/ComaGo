import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { RolesService } from '../services/roles.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private rolesService: RolesService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];

    if (!this.rolesService.hasRole(expectedRole)) {
      this.router.navigate(['/access-denied']); // Redirige a una página de acceso denegado
      return false;
    }

    return true;
  }
}

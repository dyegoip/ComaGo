import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private userRole: number;

  constructor() {
    // Obtener el rol del usuario desde sessionStorage al inicializar el servicio
    const role = sessionStorage.getItem('userRole');
    this.userRole = role ? parseInt(role, 10) : 0; // Convertir a número o asignar 0 como predeterminado
  }

  // Método para establecer el rol del usuario (llamar al iniciar sesión)
  setUserRole(role: number): void {
    this.userRole = role;
    sessionStorage.setItem('userRole', role.toString()); // Guardar en sessionStorage
  }

  // Método para obtener el rol del usuario
  getUserRole(): number {
    return this.userRole;
  }
}

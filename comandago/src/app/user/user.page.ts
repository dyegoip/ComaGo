import { ApiService } from './../services/api.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SQliteService } from '../services/sqlite.service';

export interface User {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  rol: number;
  showOptions?: boolean;
  password: string;
}


@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})

export class UserPage implements OnInit {
  allUsers : User[] = [];
  filteredUsers: User[] = [];
  findUsers: User[] | null = [];
  searchQuery: string = '';
  find: boolean = false;
  
  constructor(private router: Router, 
              private apiService: ApiService,
              private sqliteService: SQliteService,
              private alertController: AlertController) { }

  ngOnInit() {
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      // Iniciar la base de datos
      await this.sqliteService.initDB();
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }

  onInputChange(event: any) {
    this.searchQuery = event.target.value; // Actualizar la variable con el valor del input
  }

  searchUser() {
    this.apiService.getUsers().subscribe(
      (data: User[]) => {
        this.allUsers = data.map(user => ({
          ...user,
          showOptions: false // Inicializar showOptions en false
        }));
        this.allUsers = data;
        this.filteredUsers = data;  // Al principio, no hay filtro, así que mostramos todos los usuarios
      
        if (this.searchQuery.trim() === '') {
          this.filteredUsers = this.allUsers;  // Si el input está vacío, mostramos todos los usuarios
          return;
        }
    
        // Filtrar los usuarios basándose en el nombre completo o username
        this.filteredUsers = this.allUsers.filter(user =>
          user.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.userName.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    
        // Controlar si se encontraron usuarios
        this.find = this.filteredUsers.length > 0;

      },
      (error) => {
        console.error('Error al traer los usuarios:', error);
        this.allUsers = [];
        this.filteredUsers = [];
      }
    );
  }

  async getUserLikebyName(){
    this.findUsers = await this.sqliteService.getUserLikeByName(this.searchQuery);

    console.log(this.findUsers);

    if(this.findUsers != null)
    {
      this.filteredUsers = this.findUsers;
      this.find = this.filteredUsers.length > 0;
    }
  }

  toggleOptions(userSelect: User) {
    this.filteredUsers.forEach(user => {
      user.showOptions = user === userSelect ? !user.showOptions : false;
    });
  }

  onEditUser(user: User) {
    const navigationExtras: NavigationExtras = {
      state: {
        userEdit: user
      },
    }
    console.log('Editar usuario:', user.fullName);

    this.router.navigate(['/edit-user'], navigationExtras).then(() => {
      window.location.reload();
    });
  }

  async onDeleteUser(user: User) {
    // Lógica para eliminar usuario
    console.log('Eliminar usuario:', user.fullName);
    // Crear y mostrar el alert
    const alert = await this.alertController.create({
      header: 'Eliminar Usuario',
      message: '¿Está seguro que desea eliminar el usuario ' + user.fullName + '?',
      buttons: [
        {
          text: 'Cancelar', // Agrega un botón para cancelar la acción
          role: 'cancel',
          handler: () => {
            console.log('Canceló la eliminación del usuario.');
          }
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: async () => {
            await this.deleteUserApi(user);
          }
        }
      ],
    });
  
    await alert.present();
  }
  
  async deleteUserApi(userDelete: User) {
    try {
      const response = await this.apiService.deleteUser(userDelete.id.toString()).toPromise(); // Asumiendo que tienes un método deleteUser en tu ApiService
      console.log('Usuario eliminado exitosamente', response);
      const alert = await this.alertController.create({
        header: 'Eliminar Usuario',
        message: 'Usuario ' + userDelete.fullName + ' eliminado éxitosamente',
        buttons: [
          {
            text: 'Cerrar', // Agrega un botón para cancelar la acción
            role: 'confirm',
            handler: () => {
              this.searchUser();
              console.log('');
            }
          }
        ],
      });
    
      await alert.present();
    } catch (error) {
      console.error('Error al eliminar el usuario', error);
      // Aquí puedes mostrar un mensaje de error al usuario si es necesario
    }
  }
  

  onViewDetails(user: User) {
    // Lógica para ver detalles del usuario
    console.log('Ver detalles de usuario:', user.fullName);
  }

  // Navegar a la página para agregar un nuevo usuario
  ToAddUser() {
    this.router.navigate(['/add-user']);
  }

}

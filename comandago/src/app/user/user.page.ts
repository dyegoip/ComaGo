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
      //await this.sqliteService.initDB();
      await this.sqliteService.updateUserTable();
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }

  onInputChange(event: any) {
    this.searchQuery = event.target.value; // Actualizar la variable con el valor del input
  }

  async getUserLikebyName() {
    try {
      const isConect = await this.apiService.checkApiConnection().toPromise();
  
      if (isConect) {
        this.apiService.getUsers().subscribe(
          (data: User[]) => {
            this.allUsers = data.map(user => ({
              ...user,
              showOptions: false 
            }));
            this.filteredUsers = this.allUsers;
            
            if (this.searchQuery.trim() === '') {
              this.filteredUsers = this.allUsers;
            } else {
              this.filteredUsers = this.allUsers.filter(user =>
                user.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                user.userName.toLowerCase().includes(this.searchQuery.toLowerCase())
              );
            }
            this.find = this.filteredUsers.length > 0;
          },
          (error) => {
            console.error('Error al traer los usuarios desde la API:', error);
            this.allUsers = [];
            this.filteredUsers = [];
          }
        );
      } else {
        const localUsers = await this.sqliteService.getUserLikeByName(this.searchQuery);
  
        if (localUsers) {
          this.filteredUsers = localUsers;
          this.find = localUsers.length > 0;
        } else {
          this.filteredUsers = [];
          this.find = false;
        }
      }
    } catch (error) {
      console.error('Error verificando la conexión o trayendo los datos:', error);
      this.allUsers = [];
      this.filteredUsers = [];
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
      const userNameDel = userDelete.userName.toString();
      const isConect = await this.apiService.checkApiConnection().toPromise(); // Convertir el observable a promesa
  
      if (!isConect) {
        // Eliminar localmente usando SQLite
        await this.sqliteService.delUser(userNameDel);
        console.log('Usuario eliminado localmente');
      } else {
        // Eliminar usuario de la API
        const response = await this.apiService.deleteUser(userDelete.id.toString()).toPromise();
        console.log('Usuario eliminado exitosamente', response);
  
        // Mostrar alerta de confirmación
        const alert = await this.alertController.create({
          header: 'Eliminar Usuario',
          message: `Usuario ${userDelete.fullName} eliminado éxitosamente`,
          buttons: [
            {
              text: 'Cerrar',
              role: 'confirm',
              handler: () => {
                this.getUserLikebyName(); // Actualizar la lista de usuarios
              }
            }
          ]
        });
  
        await alert.present();
      }
    } catch (error) {
      console.error('Error al eliminar el usuario', error);
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

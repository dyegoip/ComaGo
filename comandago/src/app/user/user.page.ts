import { ApiService } from './../services/api.service';
import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SQliteService } from '../services/sqlite.service';

export interface User {
  id: string;
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
  allUsersSync : User[] = [];
  filteredUsers: User[] = [];
  findUsers: User[] | null = [];
  searchQuery: string = '';
  find: boolean = false;
  apiConnect: boolean = false;
  logMessages: string[] = [];
  userApi: any = null;
  
  constructor(private router: Router, 
              private apiService: ApiService,
              private sqliteService: SQliteService,
              private alertController: AlertController,
              private changeDetector: ChangeDetectorRef) { }

  async ngOnInit() {
    this.apiConnect = this.apiService.getConnectionStatus();
  }

  addLog(message: string) {
    this.logMessages.push(message);
    this.changeDetector.detectChanges()
  }

  onInputChange(event: any) {
    this.searchQuery = event.target.value; // Actualizar la variable con el valor del input
  }

  async getUserLikebyName() {
    try {
  
      if (this.apiConnect) {
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

      this.apiService.getUserByUserName(userDelete.userName).subscribe(
        async (data: any) => {
          if (data.length > 0) {
            this.userApi = data[0];
            const userId = this.userApi.id;
          } else {
            const alert = await this.alertController.create({
              header: 'Usuario no Existe',
              message: 'El usuario a eliminar no existe',
              buttons: ['Aceptar'],
            });
            await alert.present();
          }
        },
        async (error) => {
          const errorMessage = error.message;
          console.error('Error al conectar con la API: ', error); // Registra el error completo en la consola para depuración

          const alert = await this.alertController.create({
            header: 'Error de conexión',
            message: errorMessage, // Usar mensaje específico si está disponible
            buttons: ['Aceptar'],
          });
          await alert.present();
        }
      );

      // Eliminar usuario de la API
      const response = await this.apiService.deleteUser(this.userApi.id).toPromise();
      console.log('Usuario eliminado exitosamente', response); 

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

  async syncUsersWithApi() {
    try {
      const users = await this.sqliteService.getAllUsers();
      
      if (users && users.length > 0) {
        for (const user of users) {
          try {
            // Intentar insertar el usuario en la API
            const response = await this.apiService.addUser(user).toPromise();
            if (response) {
              this.addLog(`Usuario ${user.userName} - ${user.id} insertado en la API exitosamente`);

              // Eliminar el usuario de SQLite después de confirmación de inserción en la API
              await this.sqliteService.delUser(user.userName);
              this.addLog(`Usuario ${user.userName} - ${user.id} eliminado de SQLite exitosamente`);
            }
          } catch (error) {
            this.addLog(`Error al insertar el usuario ${user.userName} - ${user.id} en la API: ` + error);
          }
        }
      } else {
        this.addLog('No se encontraron usuarios en la base de datos SQLite para sincronizar.');
      }
    } catch (error) {
      this.addLog('Error durante la sincronización de usuarios: ' + error);
    }
  }

  onDeleteLogs(){
    this.logMessages = [];
  }
}

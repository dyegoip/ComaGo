import { ApiService } from './../services/api.service';
import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SQliteService } from '../services/sqlite.service';
import { empty } from 'rxjs';

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
  userApi: any = null;
  searchQuery: string = '';
  find: boolean = true;
  apiConnect: boolean = false;
  logMessages: string[] = [];
  msgScreen: string = 'empty';
  
  constructor(private router: Router, 
              private apiService: ApiService,
              private sqliteService: SQliteService,
              private alertController: AlertController,
              private changeDetector: ChangeDetectorRef) {}

  async ngOnInit() {
    this.apiService.checkApiConnection().subscribe(status => {
      this.apiConnect = status; // Actualiza el estado de conexión
      console.log('Estado de conexión a la API:', this.apiConnect);
    });
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
      console.log(this.apiConnect)
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

            if(this.filteredUsers.length === 0 && !this.find){
              this.msgScreen = `No se encontraron usuario con la búsqueda ${this.searchQuery}`;
            }
          },
          (error) => {
            console.error('Error al traer los usuarios desde la API:', error);
            this.find = false;
            this.msgScreen = 'Error al traer los usuarios desde la API:' + error;
            this.allUsers = [];
            this.filteredUsers = [];
          }
        );
      } else {
        this.msgScreen = 'No hay conexión con el servidor';
        this.find = false;
      }
    } catch (error) {
      console.error('Error verificando la conexión o trayendo los datos:', error);
      this.msgScreen = 'Error verificando la conexión o trayendo los datos' + error;
      this.find = false;
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
  
            try {
              const response = await this.apiService.deleteUser(userId).toPromise();
              console.log('Usuario eliminado exitosamente', response);
              
              const alert = await this.alertController.create({
                header: 'Usuario Eliminado',
                message: `El usuario ${userNameDel} ha sido eliminado exitosamente.`,
                buttons: ['Aceptar'],
              });
              await alert.present();

              this.getUserLikebyName();
  
            } catch (deleteError) {
              console.error('Error al eliminar el usuario:', deleteError);
              const alert = await this.alertController.create({
                header: 'Error al eliminar',
                message: `Ocurrió un error al intentar eliminar el usuario ${userNameDel}.`,
                buttons: ['Aceptar'],
              });
              await alert.present();
            }
  
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
          console.error('Error al conectar con la API:', error);
  
          const alert = await this.alertController.create({
            header: 'Error de conexión',
            message: error.message || 'Ocurrió un error al conectar con la API',
            buttons: ['Aceptar'],
          });
          await alert.present();
        }
      );
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  }
  

  onViewDetails(user: User) {
    const navigationExtras: NavigationExtras = {
      state: {
        userEdit: user
      },
    }
    console.log('Ver usuario:', user.fullName);

    this.router.navigate(['/view-user'], navigationExtras).then(() => {
      window.location.reload();
    });
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

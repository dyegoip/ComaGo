import { AppComponent } from './../app.component';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { User } from '../user/user.page';
import { SQliteService } from '../services/sqlite.service';
import { Observable, } from 'rxjs';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.page.html',
  styleUrls: ['./add-user.page.scss'],
})
export class AddUserPage implements OnInit {

  userForm!: FormGroup;
  users: User[] = [];
  nextId: string = "0";
  apiConnect: boolean = true;
  ok: boolean = false;
  idRandom: number = 0;

  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService, 
              private alertController: AlertController,
              private sqliteService: SQliteService,
              private router: Router,
              private appComponent: AppComponent) { }

  ngOnInit() {
    this.getUsersFromApi();
    this.idRandom = this.appComponent.getRandomID();
    console.log("add-user random : " + this.idRandom);
    
    this.userForm = this.formBuilder.group({
      id: ['',],
      userName: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    //Verificacion de la conexión de la api
    this.apiService.checkApiConnection().subscribe(status => {
      this.apiConnect = status;
      console.log('Estado de conexión a la API:', this.apiConnect);
    });
  }

  ionViewWillEnter() {
    this.userForm.reset();
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
  
  navigateToUser() {
    this.router.navigate(['/user']);
  }

  getUsersFromApi() {
    this.apiService.getUsers().subscribe(
      (data: User[]) => {
        this.users = data;
      },
      (error) => {
        console.error('Error al traer los usuarios:', error);
        this.users = [];
      }
    );
  }

  async onSaveUser() {
    let msgError = '';
    
    if (this.userForm.valid) {
      this.userForm.patchValue({
        id: this.idRandom
      });
      const newUser = this.userForm.value;
      let createUser: number | null = null;

      createUser = await this.sqliteService.addUser(newUser);
      
      if (typeof(createUser) === 'number') {
        this.ok = true;
        console.log('Usuario guardado en SQLite');
        
        if (this.apiConnect) {
          await this.apiService.addUser(newUser).subscribe(async response => { 
            console.log('Usuario creado en la API exitosamente.');
            
            await this.sqliteService.delUser(newUser.userName);
            console.log('Usuario eliminado de SQLite después de sincronización.');
  
            const alert = await this.alertController.create({
              header: 'Usuario Creado',
              message: 'El Usuario ' + newUser.fullName + ' ha sido sincronizado con la API con éxito.',
              buttons: [
                {
                  text: 'Aceptar',
                  handler: () => {
                    this.router.navigate(['/add-user']).then(() => {
                      window.location.reload();
                    });
                  }
                }
              ],
            });
            await alert.present();
          }, async error => {
            msgError = error;
            this.ok = false;
            console.error('Error al crear el usuario en la API. ', msgError);
  
            const alert = await this.alertController.create({
              header: 'Error de Sincronización',
              message: 'El Usuario no se pudo sincronizar con la API. Intentar más tarde.',
              buttons: [
                {
                  text: 'Aceptar',
                  handler: () => {}
                }
              ],
            });
            await alert.present();
          });
        } else {
          console.log('No hay conexión a la API, usuario guardado solo en SQLite.');
  
          const alert = await this.alertController.create({
            header: 'Usuario Creado',
            message: 'El Usuario ' + newUser.fullName + ' ha sido creado y guardado en la base de datos local (SQLite).',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  this.router.navigate(['/add-user']).then(() => {
                    window.location.reload();
                  });
                }
              }
            ],
          });
          await alert.present();
        }
      } else {
        // Si hay un error al guardar en SQLite
        this.ok = false;
        console.error('Error al crear el usuario en SQLite. ', msgError);
  
        // Mostrar un alert de error
        const alert = await this.alertController.create({
          header: 'Error de Usuario',
          message: 'Error al guardar el usuario en la base de datos local.',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {}
            }
          ],
        });
        await alert.present();
      }
    }
  }  
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { User } from '../user/user.page';
import { SQliteService } from '../services/sqlite.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.page.html',
  styleUrls: ['./add-user.page.scss'],
})
export class AddUserPage implements OnInit {

  userForm!: FormGroup;
  users: User[] = [];
  nextId: string = "0";
  apiConnect: boolean = false;
  ok: boolean = false;

  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService, 
              private alertController: AlertController,
              private sqliteService: SQliteService,
              private router: Router ) { }

  ngOnInit() {
    this.getUsersFromApi();

    this.apiConnect = this.apiService.getConnectionStatus();
    
    this.userForm = this.formBuilder.group({
      id: ['',[]],
      userName: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
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

  // Función que se llama cuando el formulario se envía
  async onSaveUser() {
    if (this.userForm.valid) {
      const newUser = this.userForm.value;
        const createUser = this.sqliteService.addUser(newUser);
        if(typeof(createUser) == 'number'){
          const alert = await this.alertController.create({
            header: 'Usuario Creado',
            message: 'El Usuario ' + newUser.fullName + ' ha sido creado con éxito.',
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
        }else{
          console.error('Error al añadir el usuario', createUser);
          const alert = await this.alertController.create({
            header: 'Error de Usuario',
            message: 'Error al añadir el usuario ' +  newUser.fullName,
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                }
              }
            ],
          });
        }
      }
  }

  async onSaveUser2() {
    let msgError =  '';
    
    if (this.userForm.valid) {
      const newUser = this.userForm.value;

      if(this.apiConnect){
        await this.apiService.addUser(newUser).subscribe(async response => {
          
          this.ok = true;
  
        }, async error => {

          msgError = error;
          this.ok = false;
          console.error('Error al crear el usuario en la api. ', msgError);
        });
      }else{
        const createUser = await this.sqliteService.addUser(newUser);
        if(typeof(createUser) == 'number'){

          this.ok = true;

        }else{

          this.ok = false;
          console.error('Error al crear el usuario en el sqlite. ', msgError);
        }

      }

      if(this.ok){
        // Crear y mostrar el alert
        console.log('Usuario creado exitosamente');
        const alert = await this.alertController.create({
          header: 'Usuario Editado',
          message: 'El Usuario ' + newUser.fullName + ' ha sido creado con éxito.',
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

      }else{
        console.error('Error al añadir el usuario', msgError);
          const alert = await this.alertController.create({
            header: 'Error de Usuario',
            message: 'Error al añadir el usuario ' +  msgError,
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                }
              }
            ],
          });
      }
    }
  }
}

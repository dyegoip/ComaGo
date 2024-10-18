import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { User } from '../user/user.page';
import { SQliteService } from '../services/sqlite.service';


@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.page.html',
  styleUrls: ['./add-user.page.scss'],
})
export class AddUserPage implements OnInit {

  userForm!: FormGroup;
  users: User[] = [];
  nextId: string = "0";

  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService, 
              private alertController: AlertController,
              private sqliteService: SQliteService,
              private router: Router ) { }

  ngOnInit() {
    this.initializeDatabase();

    this.getUsersFromApi();
    
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
        this.generateNextId();
      },
      (error) => {
        console.error('Error al traer los usuarios:', error);
        this.users = [];
      }
    );
  }

  generateNextId() {
    if (this.users.length > 0) {
      const lastUser = this.users.reduce((prev, current) => (prev.id > current.id) ? prev : current);
      this.nextId = ((+lastUser.id) + 1).toString();
    }
  }

  // Función que se llama cuando el formulario se envía
  async onSaveUser() {
    if (this.userForm.valid) {
      const newUser = this.userForm.value;
      newUser.id = this.nextId;

      await this.sqliteService.addUser(newUser);

      this.apiService.addUser(newUser).subscribe(async response => {
        console.log('Usuario añadido exitosamente', response);

        // Crear y mostrar el alert
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

      }, async error => {
        console.error('Error al añadir el usuario', error);
        const alert = await this.alertController.create({
          header: 'Error de Usuario',
          message: 'Error al añadir el usuario ' +  error,
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
              }
            }
          ],
        });
      });
    }
  }

}

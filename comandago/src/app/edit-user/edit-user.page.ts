import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SQliteService } from '../services/sqlite.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
})
export class EditUserPage implements OnInit {

  userForm!: FormGroup;
  apiConnect: boolean = false;
  okApi: boolean = false;
  
  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService,
              private sqliteService: SQliteService,
              private alertController: AlertController,
              private router: Router) { }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      id: ['', []],
      userName: ['', [Validators.required]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['',[Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state && navigation.extras.state['userEdit'] != null) {
      const userEdit = navigation.extras.state['userEdit'];
      
      this.userForm.patchValue({
        id: userEdit.id,
        userName: userEdit.userName,
        fullName: userEdit.fullName,
        email: userEdit.email,
        password: userEdit.password
      });
    } else {
      console.log('No hay usuario');
    }

    this.apiConnect = this.apiService.getConnectionStatus();
  }

  async onEditUser() {
    let msgError =  '';
    
    if (this.userForm.valid) {
      const newUser = this.userForm.value;

      if(this.apiConnect){
        this.apiService.editUserByUsername(newUser).subscribe(async response => {
          
          this.okApi = true;
  
        }, async error => {

          msgError = error;
          this.okApi = false;

        });
      }else{
        const createUser = this.sqliteService.addUser(newUser);
        if(typeof(createUser) == 'number'){
          const alert = await this.alertController.create({
            header: 'Usuario Editado',
            message: 'El Usuario ' + newUser.fullName + ' ha sido editado.',
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
          console.error('Error al editar el usuario', createUser);
          const alert = await this.alertController.create({
            header: 'Error de Usuario',
            message: 'Error al editar el usuario ' +  newUser.fullName,
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

      if(this.okApi){
        // Crear y mostrar el alert
        console.log('Usuario Editado exitosamente');
        const alert = await this.alertController.create({
          header: 'Usuario Editado',
          message: 'El Usuario ' + newUser.fullName + ' ha sido editado con éxito.',
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

  navigateToUser() {
    this.router.navigate(['/user']);
  }

}

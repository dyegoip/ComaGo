import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SQliteService } from '../services/sqlite.service';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.page.html',
  styleUrls: ['./view-user.page.scss'],
})
export class ViewUserPage implements OnInit {

  userForm!: FormGroup;
  apiConnect: boolean = false;
  
  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService,
              private sqliteService: SQliteService,
              private alertController: AlertController,
              private router: Router) { }

  ngOnInit() {
    this.userForm = this.formBuilder.group({
      id: ['', []],
      userName: [{ value: '', disabled: true }, [Validators.required]],
      fullName: [{ value: '', disabled: true }, [Validators.required]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      rol: [{ value: '', disabled: true }, [Validators.required]],
      password: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(6)]],
    });
  
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state && navigation.extras.state['userEdit'] != null) {
      const userEdit = navigation.extras.state['userEdit'];

      console.log(userEdit.id);
      
      this.userForm.patchValue({
        id: userEdit.id,
        userName: userEdit.userName,
        fullName: userEdit.fullName,
        email: userEdit.email,
        rol: userEdit.rol.toString(),
        password: userEdit.password
      });
    } else {
      console.log('No hay usuario');
    }

    this.apiService.checkApiConnection().subscribe(status => {
      this.apiConnect = status; // Actualiza el estado de conexión
      console.log('Estado de conexión a la API:', this.apiConnect);
    });
  }

  async onEditUser() {
    let msgError = '';
  
    if (this.userForm.valid) {
      const editUser = this.userForm.value;
  
      if (this.apiConnect) {
        try {
          const response = await this.apiService.editUser(editUser).toPromise();
  
          // Mostrar alerta de éxito
          const alert = await this.alertController.create({
            header: 'Usuario Editado',
            message: 'El Usuario ' + editUser.fullName + ' ha sido editado con éxito.',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  this.router.navigate(['/user']).then(() => {
                    window.location.reload();
                  });
                }
              }
            ],
          });
          await alert.present();
  
        } catch (error) {
          const err = error as { message?: string };
          msgError = err.message || 'Ocurrió un error al editar el usuario.';
  
          // Mostrar alerta de error
          console.error('Error al editar el usuario', msgError);
          const alert = await this.alertController.create({
            header: 'Error de Usuario',
            message: 'Error al editar el usuario ' + editUser.fullName + ': ' + msgError,
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
  

  navigateToUser() {
    this.router.navigate(['/user']);
  }

}

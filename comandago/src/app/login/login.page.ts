import { ChangeDetectionStrategy, signal, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavigationExtras, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';
import * as $ from 'jquery';
import { ApiService } from '../services/api.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class LoginPage implements OnInit {
  
  userApi: any = null;
  hide = signal(true);

  @ViewChild('userInput', { static: true }) user!: ElementRef;
  @ViewChild('passInput', { static: true }) pass!: ElementRef;

  constructor(public fb: FormBuilder, public router: Router, 
              public alertController: AlertController, private menu: MenuController,
              private apiService: ApiService) {

  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.loginJqueryValidate();
  }

  ionViewWillEnter() {
    this.menu.enable(false);
  }
  
  ionViewWillLeave() {
    this.menu.enable(true);
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  async loginUser() {
      const userValue = this.user.nativeElement.value;
      const passValue = this.pass.nativeElement.value;

      // if(!userValue?.trim() || !passValue?.trim()){
      //   const alert = await this.alertController.create({
      //     header: 'Datos incompletos',
      //     message: 'Debe de llenar todos los campos.',
      //     buttons: ['Aceptar'],
      //   });
  
      //   await alert.present();
      //   return;
      // }

      // if (userValue == 'diego' && passValue == '1234') {
      //   console.log(`Login Exitoso - ${userValue} ${passValue}`);
      // } else {
      //     const alert = await this.alertController.create({
      //       header: 'Credenciales inválidas',
      //       message: 'Nombre de usuario y/o contraseña incorrectos.',
      //       buttons: ['Aceptar'],
      //     });
    
      //     await alert.present();
      //     return;
      // }
  }

  goToHome(){
    this.router.navigate(['/home']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  loginJqueryValidate(): void {
    $(document).ready(() => {
      // Mostrar/ocultar la contraseña
      $('#togglePassword').click(() => {
        const passInput = $('#pass');
        const passType = passInput.attr('type') === 'password' ? 'text' : 'password';
        passInput.attr('type', passType);
        $('#toggleIcon').text(passType === 'password' ? 'visibility_off' : 'visibility');
      });
  
      // Validar formulario al hacer clic en "Iniciar Sesión"
      $('#loginButton').click(async () => {

        const userValue = $('#user').val()?.toString();
        const passValue = $('#pass').val();

        let userApi;
        let passApi;
        let userStorage = null;
        let passStorage = null;
        const storedUser = sessionStorage.getItem('user');

        if (storedUser) {
          const userObject = JSON.parse(storedUser);
          userStorage = userObject.userName;
          passStorage = userObject.password;
        }
  
        // Validar si los campos están vacíos
        if (!userValue || !passValue) {
          const alert = await this.alertController.create({
            header: 'Datos incompletos',
            message: 'Debe de llenar todos los campos.',
            buttons: ['Aceptar'],
          });
          await alert.present();
          return;
        }

        this.apiService.getUserByUserName(userValue).subscribe(
          async (data: any) => {
            if (data.length > 0) {
              this.userApi = data[0];
              const userId = this.userApi.id;
              const userApi = this.userApi.userName;
              const passApi = this.userApi.password;
        
              console.log('Nombre de usuario: ' + userApi + ' - ' + userValue);
              console.log('Contraseña: ' + passApi + ' - ' + passValue);
        
              // Verifica las credenciales aquí
              if (userValue == userApi && passValue == passApi) {
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('userId', userId);
                const alert = await this.alertController.create({
                  header: 'Login Exitoso',
                  message: 'Bienvenido/a ' + this.userApi.fullName,
                  buttons: [
                    {
                      text: 'Aceptar',
                      handler: () => {
                        const navigationExtras: NavigationExtras = {
                          state: {
                            userId: userId
                          }
                        };
                        this.router.navigate(['/home'], navigationExtras).then(() => {
                          window.location.reload();
                        });
                      }
                    }
                  ],
                });
                await alert.present();
              } else {
                const alert = await this.alertController.create({
                  header: 'Credenciales Inválidas',
                  message: 'Nombre de usuario y/o contraseña incorrectos.',
                  buttons: ['Aceptar'],
                });
                await alert.present();
              }
            } else {
              const alert = await this.alertController.create({
                header: 'Credenciales Inválidas',
                message: 'Nombre de usuario y/o contraseña incorrectos.',
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
      });
    });
  }
}

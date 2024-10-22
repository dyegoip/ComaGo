import { SQliteService } from './../services/sqlite.service';
import { User } from './../user/user.page';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  providers: [SQliteService, ApiService]
})
export class HomePage implements OnInit {

  isAuthenticated: boolean = false;
  userId!: string;
  userApi: any = {};
  userAuth!: User;
  newUser!: User;
  public image: string = "";

  constructor(private router: Router, private apiService: ApiService, private menu: MenuController, private sqliteService: SQliteService, ) {}

  ngOnInit() {

    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state && navigation.extras.state['userId'] != null) {
      this.userId = navigation.extras.state['userId'];
    } else {
      this.userId = sessionStorage.getItem('userId') || '';
    }
    
    if (this.userId === null) {
      console.log('No se encontraron datos de navegación ni en el sessionStorage.');
    }

    this.isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    console.log(this.userId);
    this.apiService.getUserById(this.userId.toString()).subscribe(
      async (data: any) => {
        if (data) {
          this.userApi = data;          
        }
        console.log('Usuario obtenido:', this.userApi);
      },
      (error) => {
        console.error('Error al obtener el usuario:', error);
      }
    );
  }

  ionViewWillEnter() {
    this.menu.enable(true);
  }

  ionViewWillLeave() {
    this.menu.enable(false);
  }

  logout() {
    sessionStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    this.image = `data:image/jpeg;base64,${image.base64String}`; 
  }

  
}

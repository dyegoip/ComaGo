import { SQliteService } from './../services/sqlite.service';
import { User } from './../user/user.page';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  providers: [SQliteService, ApiService]
})
export class HomePage implements OnInit {
  isAuthenticated = false;
  userId = '';
  userApi: any = {};
  image = '';
  random = 0;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private menu: MenuController,
    private sqliteService: SQliteService
  ) {}

  ngOnInit() {
    this.loadUser();
    this.isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  }

  private loadUser() {
    this.userId = sessionStorage.getItem('userId') || '';
    if (!this.userId) {
      console.warn('No se encontró un ID de usuario.');
      return;
    }

    this.apiService.getUserById(this.userId).subscribe(
      (data) => {
        this.userApi = data;
      },
      (error) => console.error('Error al obtener el usuario:', error)
    );
  }

  ionViewWillEnter() {
    this.menu.enable(true);
  }

  ionViewWillLeave() {
    this.menu.enable(false);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    this.image = image.webPath || '';
  }

  generateRandomID() {
    this.random = Math.floor(100000 + Math.random() * 900000);
  }
}

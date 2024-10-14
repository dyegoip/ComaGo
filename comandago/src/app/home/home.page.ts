import { SQLiteService } from './../services/sqlite.service';
import { User } from './../user/user.page';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule
  ],
})
export class HomePage implements OnInit {

  isAuthenticated: boolean = false;
  userId!: string;
  userApi: any = {};
  userAuth!: User;
  public image: string = "";

  constructor(private router: Router, private apiService: ApiService, private menu: MenuController, public db: SQLiteService) {}

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
      resultType: CameraResultType.Base64,  // Puedes usar 'Uri' si prefieres una URL de archivo.
      source: CameraSource.Camera           // Para elegir entre cámara o galería.
    });

    this.image = `data:image/jpeg;base64,${image.base64String}`;  // Puedes mostrar esta imagen en el HTML
  }

  async createUserTest(){
    const newUser = {
      id: '1',
      userName: 'testuser',
      fullName: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    };
    
    this.db.createUser(newUser);
  }
}

import { ApiService } from './services/api.service';
import { Component, OnInit, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
import { SQliteService } from './services/sqlite.service';
import { SplashScreen } from '@capacitor/splash-screen';

//json-server --watch src/assets/dbjson/db.json --host 0.0.0.0 --port 3000 

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  public appPages = [{ title: 'Inbox', url: '/folder/inbox', icon: 'mail' },];
  public labels = [];

  constructor(public menu: MenuController, 
              private router: Router, 
              private navCtrl: NavController, 
              private sqliteService: SQliteService,
              private apiService: ApiService) 
              {
                this.checkAuthentication();
              }

  async ngOnInit() {
    await this.initializeDatabase();
    await this.checkApiConnection();
    if (!this.isAuthenticated) {
      this.navCtrl.navigateRoot('/login');
    }
  }

  async showSplash(){
    await SplashScreen.show({
      autoHide: true,
      showDuration: 3000
    });
  }
  async initializeDatabase() {
    try {
      await this.sqliteService.initDB(); // Inicializar la base de datos
      console.log('Base de datos inicializada correctamente');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }

  async checkApiConnection() {
    await this.apiService.checkApiConnection(); // Actualiza el estado de conexión
  }

  isAuthenticated: boolean = false;

  checkAuthentication() {
    const authStatus = sessionStorage.getItem('isAuthenticated');
    this.isAuthenticated = authStatus === 'true';
  }

  getRandomID(): number {
    const idRamdon: number = Math.floor(100000 + (Math.random() * 90000));
    return idRamdon;
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToOrder() {
    this.router.navigate(['/order']);
  }

  navigateToProduct() {
    this.router.navigate(['/product']);
  }

  logout() {
    this.menu.close();
    sessionStorage.setItem('isAuthenticated', 'false');
    this.isAuthenticated = false;
    console.log('Sesión cerrada');
  
    this.navCtrl.navigateRoot('/login');
  }
  
}

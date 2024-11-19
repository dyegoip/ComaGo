import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CapacitorSQLite } from '@capacitor-community/sqlite';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { SQliteService } from './services/sqlite.service';

@NgModule({
  declarations: [AppComponent],
  imports: [AppRoutingModule, BrowserModule, IonicModule.forRoot({rippleEffect: false, mode: 'md'}), RouterModule, HttpClientModule, CommonModule, FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideAnimationsAsync(), SQLite,  SQliteService],
  bootstrap: [AppComponent],
})
export class AppModule {}

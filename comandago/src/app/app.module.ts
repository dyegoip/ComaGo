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
import { SQLite, SQLiteOriginal } from '@awesome-cordova-plugins/sqlite';

@NgModule({
  declarations: [AppComponent],
  imports: [AppRoutingModule, BrowserModule, IonicModule.forRoot(), RouterModule, HttpClientModule, CommonModule, FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideAnimationsAsync(), SQLiteOriginal ],
  bootstrap: [AppComponent],
})
export class AppModule {}

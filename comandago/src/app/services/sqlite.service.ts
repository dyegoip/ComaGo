import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root',
})
export class SQLiteService {
  public db: SQLiteDBConnection;

  constructor() {
    this.db = new SQLiteDBConnection('mydb.db', false, CapacitorSQLite);
    this.createTable(); // Llamamos a crear la tabla al inicializar el servicio
  }

  // Método para abrir la base de datos
  async openDatabase() {
    await this.db.open();
  }

  // Método para crear la tabla de usuarios
  async createTable() {
    await this.openDatabase();
    await this.db.execute(`
        CREATE TABLE IF NOT EXISTS user (
          id TEXT PRIMARY KEY,
          userName TEXT NOT NULL,
          fullName TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )
      `);
  }

  // Método para ejecutar consultas
  async executeQuery(query: string, params: any) {
    return await this.db.execute(query, params);
  }
}
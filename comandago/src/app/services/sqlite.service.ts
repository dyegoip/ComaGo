import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import {SQLite} from '@awesome-cordova-plugins/sqlite';

@Injectable({
  providedIn: 'root',
})
export class SQLiteService {
  public db: SQLiteDBConnection | null = null;

  constructor() {
    this.openDatabase(); // Abre la base de datos al inicializar el servicio
  }

  // Método para abrir la base de datos
  async openDatabase(): Promise<void> {
    try {
      // Crea la conexión correctamente con await
      await CapacitorSQLite.createConnection({
        database: 'mydb',
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
      });
  
      // Verifica si la conexión fue exitosa antes de abrirla
      if (this.db) {
        await this.db.open(); // Solo llamamos a open si this.db no es null
        console.log('Base de datos abierta correctamente');
      } else {
        console.error('No se pudo obtener una conexión válida');
      }
    } catch (error) {
      console.error('Error al abrir la base de datos:', error);
    }
  }

  // Método para crear la tabla de usuarios
  async createTableUser() {  
    console.log(this.db); 
    if (this.db) { // Asegúrate de que db no es null antes de ejecutar consultas
      try {
        await this.db.query(`
          CREATE TABLE IF NOT EXISTS user (
            id TEXT PRIMARY KEY,
            userName TEXT NOT NULL,
            fullName TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          )
        `);
        console.log('Tabla user creada exitosamente');
      } catch (error) {
        console.error('Error al crear la tabla user:', error);
      }
    } else {
      console.error('No se pudo abrir la base de datos.');
    }
  }

  // Método para insertar un usuario
  async createUser(newUser: any) {

    await this.createTableUser();

    if (this.db) { // Verifica que db no es null
      try {
        await this.db.query(
          'INSERT INTO user (id, userName, fullName, email, password) VALUES (?, ?, ?, ?, ?)',
          [newUser.id, newUser.userName, newUser.fullName, newUser.email, newUser.password]
        );
        console.log('Usuario creado exitosamente');
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('UNIQUE constraint failed')) {
            console.error('El correo ya está en uso');
          } else {
            console.error('Error al crear usuario:', error.message);
          }
        } else {
          console.error('Error inesperado:', error);
        }
      }
    }
  }
}

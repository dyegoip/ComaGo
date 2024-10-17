
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { User } from '../user/user.page';

@Injectable({
  providedIn: 'root'
})
export class SQliteService {
  private dbInstance: SQLiteObject | null = null;

  constructor(private sqlite: SQLite) {}
//====================================================CREACION DE TABLAS====================================================
  async initDB() {
    try {
      this.dbInstance = await this.sqlite.create({
        name: 'comanda.db',
        location: 'default'
      });

      // Habilitar claves foráneas
      await this.dbInstance.executeSql('PRAGMA foreign_keys = ON;', []);

      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS USER (
          IDUSER TEXT PRIMARY KEY,
          USERNAME TEXT,
          FULLNAME TEXT,
          EMAIL TEXT,
          PASSWORD TEXT,
          ROL INTEGER
        )
      `, []);

      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS PRODUCTS (
          IDPRODUCT INTEGER PRIMARY KEY,
          PRODUCTNAME TEXT,
          PRICE INTEGER,
          STOCK INTEGER,
          ACTIVE INT,
          TYPEPRODUCT TEXT
        )
      `, []);

    } catch (error) {
      console.error('Error creating database', error);
    }
  }
  //====================================================FIN DE CERACION DE TABLAS====================================================



  //====================================================INICIO DE ADMINISTRACION====================================================

  async addUser(user: User): Promise<number> {
    //const salt = await bcrypt.genSalt(10);
    //user.password = await bcrypt.hash(user.password, salt);
    
    if (this.dbInstance) {
      const sql = `INSERT INTO USER (IDUSER, USERNAME, FULLNAME, EMAIL, PASSWORD, ROL) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [user.id, user.userName, user.fullName, user.email, user.password, user.rol];
      const res = await this.dbInstance.executeSql(sql, values);
      return res.insertId;  // Retorna el id del administrador recién creado
    } else {
      throw new Error('Database is not initialized');
    }
  }
  async getUserbyuserName(username: string): Promise<User | null> {
    if (this.dbInstance) {
      const res = await this.dbInstance.executeSql(`SELECT * FROM USER WHERE USERNAME = ?`, [username]);
      if (res.rows.length > 0) {
        const user = res.rows.item(0);
        return {
          id: user.ID,
          userName: user.USERNAME,
          fullName: user.FULLNAME,
          email: user.EMAIL,
          password: user.PASSWORD,
          rol: user.ROL
        };
      } else {
        return null;  // No se encontró un administrador con ese correo
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }
}
//====================================================FIN DE ADMINISTRACION====================================================
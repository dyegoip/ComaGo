import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { User } from '../user/user.page';
import { Product } from '../product/product.page';

@Injectable({
  providedIn: 'root'
})
export class SQliteService {
  private dbInstance: SQLiteObject | null = null;

  constructor(private sqlite: SQLite) {}

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
          USERNAME TEXT UNIQUE,
          FULLNAME TEXT,
          EMAIL TEXT UNIQUE,
          PASSWORD TEXT,
          ROL INTEGER
        )
      `, []);

      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS PRODUCTS (
          IDPRODUCT INTEGER PRIMARY KEY,
          PRODUCTNAME TEXT UNIQUE,
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

  async updateUserTable() {
    try {
      this.dbInstance = await this.sqlite.create({
        name: 'comanda.db',
        location: 'default'
      });
      // Renombrar la tabla original
      await this.dbInstance.executeSql(`ALTER TABLE USER RENAME TO USER_OLD;`, []);

      // Crear la nueva tabla con restricciones UNIQUE
      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS USER (
          IDUSER TEXT PRIMARY KEY,
          USERNAME TEXT UNIQUE,
          FULLNAME TEXT,
          EMAIL TEXT UNIQUE,
          PASSWORD TEXT,
          ROL INTEGER
        );
      `, []);

      // Copiar los datos de la tabla antigua a la nueva
      await this.dbInstance.executeSql(`
        INSERT INTO USER (IDUSER, USERNAME, FULLNAME, EMAIL, PASSWORD, ROL)
        SELECT IDUSER, USERNAME, FULLNAME, EMAIL, PASSWORD, ROL
        FROM USER_OLD;
      `, []);

      // Eliminar la tabla antigua (opcional)
      await this.dbInstance.executeSql(`DROP TABLE USER_OLD;`, []);

      console.log('Tabla USER actualizada exitosamente.');
    } catch (error) {
      console.error('Error al actualizar la tabla USER:', error);
    }
  }
  

  async addUser(user: User): Promise<number> {
    //const salt = await bcrypt.genSalt(10);
    //user.password = await bcrypt.hash(user.password, salt);
    
    if (this.dbInstance) {
      const sql = `INSERT INTO USER (IDUSER, USERNAME, FULLNAME, EMAIL, PASSWORD, ROL) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [user.id, user.userName, user.fullName, user.email, user.password, user.rol];
      const res = await this.dbInstance.executeSql(sql, values);
      return res.insertId;
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async delUser(userName: string): Promise<number> {
    if (this.dbInstance) {
      const sql = `DELETE FROM USER WHERE USERNAME = ?`;
      const values = [userName];
      const res = await this.dbInstance.executeSql(sql, values);
      
      return res.rowsAffected;
    } else {
      throw new Error('Database is not initialized');
    }
  }
  

  async getUserByuserName(username: string): Promise<User | null> {
    if (this.dbInstance) {
      const sql = `SELECT * FROM USER WHERE USERNAME = ?`;
      const values = [username];
      const res = await this.dbInstance.executeSql(sql, values);
      if (res.rows.length > 0) {
        const user = res.rows.item(0);
        return {
          id: user.IDUSER,
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

  async getUserLikeByName(fullname: string): Promise<User[]| null> {
    if (this.dbInstance) {
      const likeFullname = `%${fullname}%`;  // Añadir comodines para la búsqueda
      const sql = `SELECT * FROM USER WHERE FULLNAME LIKE ?`;  // Usar cláusula LIKE
      const values = [likeFullname];  // Valores a pasar para la consulta
      
      try {
        const res = await this.dbInstance.executeSql(sql, values);  // Ejecutar la consulta con valores
        
        if (res && res.rows && res.rows.length > 0){
          const users : User[] = [];
          for (let i = 0; i < res.rows.length; i++) {
            const user = res.rows.item(i)
            users.push({
              id: user.IDUSER,
              userName: user.USERNAME,
              fullName: user.FULLNAME,
              email: user.EMAIL,
              password: user.PASSWORD,
              rol: user.ROL
            });
          }
          return users;  // Devolver los usuarios encontrados
        } else {
          return null;  // No se encontraron coincidencias
        }
      } catch (error) {
        console.error('Error al ejecutar la consulta:', error);
        return null;
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }
  
}
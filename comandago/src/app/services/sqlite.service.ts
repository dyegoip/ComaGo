import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { User } from '../user/user.page';
import { Product } from '../product/product.page';
import { DetailOrder, Order } from '../order/order.page';
import { Board } from '../board/board.page';

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
        );
      `, []);

      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS PRODUCTS (
          IDPRODUCT TEXT PRIMARY KEY,
          PRODUCTNAME TEXT UNIQUE,
          PRODUCTCODE TEXT UNIQUE,
          PRICE INT,
          STOCK INT,
          ACTIVE INT,
          TYPEPRODUCT TEXT
        )
      `, []);

      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS "ORDER" (
          IDORDER TEXT PRIMARY KEY,
          ORDERNUM INT UNIQUE,
          BOARDNUM INT,
          USERNAME TEXT,
          ORDERDATE DATE,
          TOTALPRICE INT,
          STATUS INT
        )
      `, []);

      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS ORDERDETAIL (
          IDDETAIL TEXT,
          PRODUCTCODE TEXT,
          ORDERNUM INT,
          QUANTITY INT,
          PRICE INT,
          FOREIGN KEY (ORDERNUM) REFERENCES "ORDER"(ORDERNUM)
        )
      `, []);

      await this.dbInstance.executeSql(`
        CREATE TABLE IF NOT EXISTS BOARD (
          IDBOARD TEXT PRIMARY KEY,
          BOARDNUM INT,
          CAPACITY INT,
          STATUS INT
        )
      `, []);

    } catch (error) {
      console.error('Error creating database', JSON.stringify(error));
    }
  }


  async addUser(user: User): Promise<number> {
    //const salt = await bcrypt.genSalt(10);
    //user.password = await bcrypt.hash(user.password, salt);
    
    if (this.dbInstance) {
      const sql = `INSERT INTO USER (IDUSER, USERNAME, FULLNAME, EMAIL, PASSWORD, ROL) VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [user.id, user.userName, user.fullName, user.email, user.password, user.rol];
      const res = await this.dbInstance.executeSql(sql, values);
      console.log(JSON.stringify(res));
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
        return null;
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async getUserLikeByName(fullname: string): Promise<User[]| null> {
    if (this.dbInstance) {
      const likeFullname = `%${fullname}%`;
      const sql = `SELECT * FROM USER WHERE FULLNAME LIKE ?`;
      const values = [likeFullname];
      
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
          return users;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error al consultar usuarios ', JSON.stringify(error));
        return null;
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async getAllUsers(): Promise<User[]| null> {
    if (this.dbInstance) {
      const likeFullname = `%%`;
      const sql = `SELECT * FROM USER WHERE FULLNAME LIKE ?`;
      const values = [likeFullname];
      
      try {
        const res = await this.dbInstance.executeSql(sql, values);
        
        if (res && res.rows && res.rows.length > 0){
          const users : User[] = [];
          for (let i = 0; i < res.rows.length; i++) {
            const user = res.rows.item(i);
            console.log(user.IDUSER);
            users.push({
              id: user.IDUSER,
              userName: user.USERNAME,
              fullName: user.FULLNAME,
              email: user.EMAIL,
              password: user.PASSWORD,
              rol: user.ROL
            });
          }
          return users;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error al consultar todos los usuarios ', JSON.stringify(error));
        return null;
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }
  
  
  // Function Order//

  async addOrder(order: Order): Promise<number> {
    if (this.dbInstance) {
      const sql = `INSERT INTO \`ORDER\` (IDORDER, ORDERNUM, BOARDNUM, USERNAME, ORDERDATE, TOTALPRICE, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const values = [order.id, order.orderNum, order.boardNum, order.userName, order.orderDate, order.totalPrice, order.status];
      const res = await this.dbInstance.executeSql(sql, values);
      return res.insertId;
    } else {
      throw new Error('Database is not initialized');
    }
  }
  

  async delOrder(orderNum: number): Promise<number> {
    if (this.dbInstance) {
      const sql = `DELETE FROM \`ORDER\` WHERE ORDERNUM = ?`;
      const values = [orderNum];
      const res = await this.dbInstance.executeSql(sql, values);
      
      return res.rowsAffected;
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async getOrderByorderNumber(orderNum: number): Promise<Order | null> {
    if (this.dbInstance) {
      const sql = `SELECT * FROM \`ORDER\` WHERE USERNAME = ?`;
      const values = [orderNum];
      const res = await this.dbInstance.executeSql(sql, values);
      if (res.rows.length > 0) {
        const order = res.rows.item(0);
        return {
          id: order.id,
          orderNum: order.orderNum,
          boardNum: order.boardNum,
          userName: order.userName,
          orderDate: order.orderDate,
          totalPrice: order.totalPrice,
          status: order.status

        };
      } else {
        return null;  // No se encontró un administrador con ese correo
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async addOrderDetail(orderdetail: DetailOrder): Promise<number> {

    if (this.dbInstance) {
      const sql = `INSERT INTO ORDERDETAIL (IDDETAIL, PRODUCTCODE, ORDERNUM, QUANTITY, PRICE) VALUES (?, ?, ?, ?, ?)`;
      const values = [orderdetail.idDetail, orderdetail.productCode, orderdetail.orderNum, orderdetail.quantity, orderdetail.price];
      const res = await this.dbInstance.executeSql(sql, values);
      return res.insertId;
    } else {
      throw new Error('Database is not initialized');
    }
  }

  //Funciones Mesa//

  async addBoard(board: Board): Promise<number> {
    if (this.dbInstance) {
      const sql = `INSERT INTO BOARD (BOARDID, NUMBOARD, CAPACITY, STATUS) VALUES (?, ?, ?, ?)`;
      const values = [board.id, board.boardnum, board.capacity, board.status];
      const res = await this.dbInstance.executeSql(sql, values);
      return res.insertId;
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async delBoard(boardId: number): Promise<number> {
    if (this.dbInstance) {
      const sql = `DELETE FROM BOARD WHERE BOARDID = ?`;
      const values = [boardId];
      const res = await this.dbInstance.executeSql(sql, values);
      
      return res.rowsAffected;
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async getBoardByboardNumber(boardnum: number): Promise<Board | null> {
    if (this.dbInstance) {
      const sql = `SELECT * FROM BOARD WHERE NUMBERBOARD = ?`;
      const values = [boardnum];
      const res = await this.dbInstance.executeSql(sql, values);
      if (res.rows.length > 0) {
        const board = res.rows.item(0);
        return {
          id: board.id,
          boardnum: board.boardnum,
          capacity: board.capacity,
          status: board.status
        };

      } else {
        return null;  // No se encontró un administrador con ese correo
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }

}
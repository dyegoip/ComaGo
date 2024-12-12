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
        CREATE TABLE IF NOT EXISTS CONFIG (
          IDPARAM TEXT PRIMARY KEY,
          VALUE TEXT UNIQUE
        );
      `, []);

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

  async addParam(idParam: string, value: string): Promise<number> {
    if (this.dbInstance) {
      const sql = `DELETE FROM CONFIG WHERE IDPARAM = ?`;
      const values = [idParam];
      const res = await this.dbInstance.executeSql(sql, values);

      const sql2 = `INSERT OR REPLACE INTO CONFIG (IDPARAM, VALUE) VALUES (?, ?)`;
      const values2 = [idParam];
      const res2 = await this.dbInstance.executeSql(sql2, values2);
      console.log('Resultado de la inserción o reemplazo:', JSON.stringify(res2));
      return res2.insertId;
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async getParam(idParam: string): Promise<string | null> {
    if (this.dbInstance) {
      const sql = `SELECT VALUE FROM CONFIG WHERE IDPARAM = ?`;
      const values = [idParam];
  
      try {
        const res = await this.dbInstance.executeSql(sql, values);
        if (res && res.rows && res.rows.length > 0) {
          const paramValue = res.rows.item(0).VALUE;
          return paramValue; // Regresa el valor almacenado de la IP
        } else {
          return null; // Si no se encuentra el parámetro
        }
      } catch (error) {
        console.error('Error al obtener el parámetro', error);
        return null;
      }
    } else {
      throw new Error('Database is not initialized');
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

  //Funciones Productos
  async addProduct(product: any): Promise<number> {
    if (this.dbInstance) {
      const sql = `
        INSERT INTO PRODUCTS (IDPRODUCT, PRODUCTNAME, PRODUCTCODE, PRICE, STOCK, ACTIVE, TYPEPRODUCT)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        product.id,
        product.productName,
        product.productCode,
        product.price,
        product.stock,
        product.active ? 1 : 0,
        product.typeProduct
      ];
      const res = await this.dbInstance.executeSql(sql, values);
      console.log('Producto guardado:', JSON.stringify(res));
      return res.insertId;
    } else {
      throw new Error('Database is not initialized');
    }
  }
  
  async delProduct(productCode: string): Promise<number> {
    if (this.dbInstance) {
      const sql = `DELETE FROM PRODUCTS WHERE PRODUCTCODE = ?`;
      const values = [productCode];
      const res = await this.dbInstance.executeSql(sql, values);
      console.log('Productos eliminados:', res.rowsAffected);
      return res.rowsAffected;
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
      const sql = `SELECT * FROM \`ORDER\` WHERE ORDERNUM = ?`;
      const values = [orderNum];
      const res = await this.dbInstance.executeSql(sql, values);
      if (res.rows.length > 0) {
        const order = res.rows.item(0);
        return {
          id: order.IDORDER,
          orderNum: order.ORDERNUM,
          boardNum: order.BOARDNUM,
          userName: order.USERNAME,
          orderDate: order.ORDERDATE,
          totalPrice: order.TOTALPRICE,
          status: order.STATUS

        };
      } else {
        return null;
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async addOrderDetail(orderdetail: DetailOrder): Promise<number> {

    if (this.dbInstance) {
      const sql = `INSERT INTO ORDERDETAIL (IDDETAIL, PRODUCTCODE, ORDERNUM, QUANTITY, PRICE) VALUES (?, ?, ?, ?, ?)`;
      const values = [orderdetail.id, orderdetail.productCode, orderdetail.orderNum, orderdetail.quantity, orderdetail.price];
      const res = await this.dbInstance.executeSql(sql, values);
      return res.insertId;
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async getOrderDetailsByOrderNum(orderNum: number): Promise<DetailOrder[] | null > {
  if (this.dbInstance) {
    const sql = `SELECT * FROM ORDERDETAIL WHERE ORDERNUM = ?`;
    const value = [orderNum]

    try {
      const res = await this.dbInstance.executeSql(sql, value);
      if (res && res.rows && res.rows.length > 0){
        const details: DetailOrder[] = []; 
        for (let i = 0; i < res.rows.length; i++) {
          const detail = res.rows.item(i);
          details.push({
            id: detail.IDDETAIL,
            productCode: detail.PRODUCTCODE,
            orderNum: detail.ORDERNUM,
            quantity: detail.QUANTITY,
            price: detail.PRICE,
          });
        }
        return details;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al consultar orderdetail ', JSON.stringify(error));
      return null;
    }
  } else {
    throw new Error('Database is not initialized');
  }
  }

  async getOrderDetailsByGroupId(groupId: string): Promise<DetailOrder[] | null> {
    if (this.dbInstance) {
      // Consulta para seleccionar los detalles cuyo IDDETAIL empieza con groupId
      const sql = `SELECT * FROM ORDERDETAIL WHERE IDDETAIL LIKE ?`;
      const value = [`${groupId}%`]; // Usar el prefijo con el wildcard %
  
      try {
        const res = await this.dbInstance.executeSql(sql, value);
        if (res && res.rows && res.rows.length > 0) {
          const details: DetailOrder[] = [];
          for (let i = 0; i < res.rows.length; i++) {
            const detail = res.rows.item(i);
            details.push({
              id: detail.IDDETAIL,
              productCode: detail.PRODUCTCODE,
              orderNum: detail.ORDERNUM,
              quantity: detail.QUANTITY,
              price: detail.PRICE,
            });
          }
          return details;
        } else {
          return null; // No hay registros para el groupId
        }
      } catch (error) {
        console.error('Error al consultar ORDERDETAIL por groupId:', JSON.stringify(error));
        return null;
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async delOrderDetailId(detailId: string): Promise<boolean> {
    if (this.dbInstance) {
      const sql = `DELETE FROM ORDERDETAIL WHERE IDDETAIL = ?`;
      const values = [detailId];
  
      try {
        const res = await this.dbInstance.executeSql(sql, values);
  
        // Verificar si se eliminó alguna fila
        if (res && res.rowsAffected > 0) {
          console.log(`Detalle de orden con ID ${detailId} eliminado con éxito.`);
          return true;
        } else {
          console.log(`No se encontró ningún detalle de orden con ID ${detailId} para eliminar.`);
          return false;
        }
      } catch (error) {
        console.error('Error al eliminar detalle de orden: ', JSON.stringify(error));
        return false;
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }
  
  async delOrderDetail(orderNum: number): Promise<number> {
    if (this.dbInstance) {
      const sql = `DELETE FROM ORDERDETAIL WHERE ORDERNUM = ?`;
      const values = [orderNum];
      const res = await this.dbInstance.executeSql(sql, values);
      
      return res.rowsAffected;
    } else {
      throw new Error('Database is not initialized');
    }
  }

  //Funciones Mesa//

  async addBoard(board: any): Promise<number> {
    if (this.dbInstance) {
      const sql = `
        INSERT INTO BOARD (IDBOARD, BOARDNUM, CAPACITY, STATUS)
        VALUES (?, ?, ?, ?)
      `;
      const values = [
        board.id,
        board.boardNum,
        board.capacity,
        board.status
      ];
      const res = await this.dbInstance.executeSql(sql, values);
      console.log('Mesa guardada:', JSON.stringify(res));
      return res.insertId;
    } else {
      throw new Error('Database is not initialized');
    }
  }
  
  async delBoard(boardNum: number): Promise<number> {
    if (this.dbInstance) {
      const sql = `DELETE FROM BOARD WHERE BOARDNUM = ?`;
      const values = [boardNum];
      const res = await this.dbInstance.executeSql(sql, values);
      console.log('Mesas eliminadas:', res.rowsAffected);
      return res.rowsAffected;
    } else {
      throw new Error('Database is not initialized');
    }
  }

  async getAllBoards(): Promise<Board[] | null> {
    if (this.dbInstance) {
      const sql = `SELECT * FROM BOARD`;
      
      try {
        const res = await this.dbInstance.executeSql(sql, []);
        
        if (res && res.rows && res.rows.length > 0) {
          const boards: Board[] = [];
          
          for (let i = 0; i < res.rows.length; i++) {
            const board = res.rows.item(i);
            console.log(`Board ID: ${board.ID}`);
            boards.push({
              id: board.ID,
              boardNum: board.BOARDNUM,
              capacity: board.CAPACITY,
              status: board.STATUS
            });
          }
          return boards;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error al consultar todas las mesas: ', JSON.stringify(error));
        return null;
      }
    } else {
      throw new Error('Database is not initialized');
    }
  }
  

}
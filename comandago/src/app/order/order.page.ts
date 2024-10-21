import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Product } from '../product/product.page';
import { AlertController } from '@ionic/angular';
import { SQliteService } from '../services/sqlite.service';
import { Router } from '@angular/router';

export interface Order {
  id: number;
  orderNum: number;
  userName: string;
  orderDate: string;
  totalPrice: number;
  status: string;
}

export interface detailOrder {
  idDetail: number;
  productCode: number;
  orderNum: number;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  allProducts : Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery: string = '';
  find: boolean = false;
  newOrder: Order = {
    id : 0,
    orderNum : 0,
    userName : '',
    orderDate : '',
    totalPrice : 0,
    status : '',
  };

  constructor(private apiService: ApiService,
              private sqliteService: SQliteService,
              private alertController: AlertController,
              private router: Router
  ) { }

  ngOnInit() {
    this.getProductInit();
  }

  getProductInit() {
    this.apiService.getProducts().subscribe(
      (data: Product[]) => {
        this.allProducts = data.map(product => ({
          ...product,
          showOptions: false // Inicializar showOptions en false
        }));
        this.allProducts = data;
        this.filteredProducts = data;  // Al principio, no hay filtro, así que mostramos todos los productos
        // Controlar si se encontraron productos
        this.find = this.filteredProducts.length > 0;

      },
      (error) => {
        console.error('Error al traer los productos:', error);
        this.allProducts = [];
        this.filteredProducts = [];
      }
    );
  }

  generateOrderNum(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  async onSaveOrder() {
    const newOrderNum = this.generateOrderNum();
    this.newOrder.orderNum = newOrderNum
    const createOrder = this.sqliteService.addOrder(this.newOrder);
      if(typeof(createOrder) == 'number'){
        const alert = await this.alertController.create({
          header: 'Orden Creada',
          message: 'La orden' + this.newOrder.orderNum + ' ha sido creado con éxito.',
          buttons: [
            {
              text: 'Aceptar'
            }
          ],
        });

        await alert.present();
      }else{
        console.error('Error al añadir la orden', this.newOrder.orderNum);
        const alert = await this.alertController.create({
          header: 'Error de Orden',
          message: 'Error al añadir la Orden' + this.newOrder.orderNum,
          buttons: [
            {
              text: 'Aceptar'             
            }
          ],
        });
      }
    
  }

  async onAddOrderDetail() {
    const newOrderNum = this.generateOrderNum();
    this.newOrder.orderNum = newOrderNum
    const createOrder = this.sqliteService.addOrder(this.newOrder);
      if(typeof(createOrder) == 'number'){
        const alert = await this.alertController.create({
          header: 'Orden Creada',
          message: 'La orden' + this.newOrder.orderNum + ' ha sido creado con éxito.',
          buttons: [
            {
              text: 'Aceptar'
            }
          ],
        });

        await alert.present();
      }else{
        console.error('Error al añadir la orden', this.newOrder.orderNum);
        const alert = await this.alertController.create({
          header: 'Error de Orden',
          message: 'Error al añadir la Orden' + this.newOrder.orderNum,
          buttons: [
            {
              text: 'Aceptar'             
            }
          ],
        });
      }
    
  }
}

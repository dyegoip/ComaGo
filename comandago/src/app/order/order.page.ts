import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Product } from '../product/product.page';
import { AlertController } from '@ionic/angular';
import { SQliteService } from '../services/sqlite.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Board } from '../board/board.page';

export interface Order {
  id: string;
  orderNum: number;
  boardNum: number;
  userName: string;
  orderDate: string;
  totalPrice: number;
  status: string;
}

export interface DetailOrder {
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
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  allBoards: Board[] = [];
  searchQuery: string = '';
  find: boolean = false;
  orderForm!: FormGroup;
  loggedInUser: string = sessionStorage.getItem('userId') || "sinUser";

  constructor(
    private apiService: ApiService,
    private sqliteService: SQliteService,
    private alertController: AlertController,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.getProductInit();
    this.getBoards();

    this.orderForm = this.formBuilder.group({
      id: ['', []],
      orderNum: [{ value: this.generateOrderNum(), disabled: true }, [Validators.required]],
      boardNum: ['', [Validators.required]],
      userName: [this.loggedInUser, [Validators.required]],
      orderDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
      totalPrice: ['', [Validators.required, Validators.min(1)]],
      status: ['', [Validators.required]]
    });
  }

  getBoards() {
    this.apiService.getBoard().subscribe(
      (data: Board[]) => {
        this.allBoards = data;
      },
      (error) => {
        console.error('Error al traer las mesas:', error);
      }
    );
  }

  getProductInit() {
    this.apiService.getProducts().subscribe(
      (data: Product[]) => {
        this.allProducts = data.map(product => ({
          ...product,
          showOptions: false
        }));
        this.filteredProducts = this.allProducts;
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
    if (this.orderForm.valid) {
      const orderData: Order = {
        ...this.orderForm.getRawValue(),
        orderNum: this.generateOrderNum(),
        userName: this.loggedInUser
      };

      const createOrderResult = await this.sqliteService.addOrder(orderData);
      if (typeof createOrderResult === 'number') {
        const successAlert = await this.alertController.create({
          header: 'Orden Creada',
          message: `La orden ${orderData.orderNum} ha sido creada con éxito.`,
          buttons: ['Aceptar']
        });
        await successAlert.present();
        this.router.navigate(['/orders']); // Redirecciona después de guardar el pedido
      } else {
        const errorAlert = await this.alertController.create({
          header: 'Error de Orden',
          message: `Error al añadir la Orden ${orderData.orderNum}`,
          buttons: ['Aceptar']
        });
        await errorAlert.present();
      }
    } else {
      const invalidAlert = await this.alertController.create({
        header: 'Formulario Incompleto',
        message: 'Por favor completa todos los campos obligatorios.',
        buttons: ['Aceptar']
      });
      await invalidAlert.present();
    }
  }
}

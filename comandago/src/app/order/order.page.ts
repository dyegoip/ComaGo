import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Product } from '../product/product.page';
import { AlertController } from '@ionic/angular';
import { SQliteService } from '../services/sqlite.service';
import { NavigationExtras, Router } from '@angular/router';
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
  orderCreate: number = 0;

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

    const idOrder = this.generateOrderNum();

    const today = this.formatDate(new Date());

    this.orderForm = this.formBuilder.group({
      id: [{ value: idOrder, disabled: true }, [Validators.required]],
      orderNum: [{ value: idOrder, disabled: true }, [Validators.required]],
      boardNum: ['', [Validators.required]],
      userName: [this.loggedInUser, [Validators.required]],
      orderDate: [today, [Validators.required]],
      totalPrice: [{value: 0}, [Validators.required, Validators.min(1)]],
      status: ['', [Validators.required]]
    });
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses comienzan desde 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
      
      const newOrder = this.orderForm.value;

      const createOrderResult = await this.sqliteService.addOrder(newOrder);
      if (typeof createOrderResult === 'number') {
        const successAlert = await this.alertController.create({
          header: 'Orden Creada',
          message: `La orden ${newOrder.orderNum} ha sido creada con éxito.`,
          buttons: ['Aceptar']
        });
        await successAlert.present();
        this.router.navigate(['/orders']); // Redirecciona después de guardar el pedido
      } else {
        const errorAlert = await this.alertController.create({
          header: 'Error de Orden',
          message: `Error al añadir la Orden ${newOrder.orderNum}`,
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

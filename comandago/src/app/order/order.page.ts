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
  idDetail: string;
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
  detailOrderForm!: FormGroup;
  loggedInUser: string = sessionStorage.getItem('userName') || "sinUser";
  showFormOrder: boolean = true;
  createdOrderId: number = 0;
  indexConjunto: number = 1;

  platos: Product[] = [];
  guarniciones: Product[] = [];
  postres: Product[] = [];
  bebestibles: Product[] = [];
  ensaladas: Product[] = [];

  displayedOrders: any[] = [];

  addedOrders: { 
    plato?: string; 
    guarnicion?: string; 
    ensalada?: string; 
    bebestible?: string; 
    postre?: string; 
  }[] = [];

  constructor(
    private apiService: ApiService,
    private sqliteService: SQliteService,
    private alertController: AlertController,
    private router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.getBoards();

    let idOrder = this.generateOrderNum().toString();
    let today = this.formatDate(new Date());

    this.orderForm = this.formBuilder.group({
      id: [{ value: idOrder, disabled: true }, [Validators.required]],
      orderNum: [{ value: idOrder, disabled: true }, [Validators.required]],
      boardNum: ['', [Validators.required]],
      userName: [this.loggedInUser, [Validators.required]],
      orderDate: [today, [Validators.required]],
      totalPrice: [{ value: 0, disabled: true }, [Validators.required]],
      status: [{ value: 'Pendiente', disabled: true }, [Validators.required]],
    });

    this.detailOrderForm = this.formBuilder.group({
      plato: [''],
      guarnicion: [''],
      ensalada: [''],
      bebestible: [''],
      postre: [''],
    });

    // Cargar productos al iniciar
    this.loadProducts();
  }

  async loadProducts() {
    this.apiService.getProducts().subscribe(
      (data: Product[]) => {
        this.allProducts = data.map((product) => ({
          ...product,
          showOptions: false,
        }));

        this.allProducts = this.allProducts.filter((p) => p.active === true);

        this.platos = this.allProducts.filter((p) => p.type === 'Plato');
        this.guarniciones = this.allProducts.filter((p) => p.type === 'Guarnicion');        
        this.ensaladas = this.allProducts.filter((p) => p.type === 'Ensalada');
        this.bebestibles = this.allProducts.filter((p) => p.type === 'Bebestible');
        this.postres = this.allProducts.filter((p) => p.type === 'Postre');
      },
      (error) => {
        console.error('Error al traer los productos:', error);
        this.allProducts = [];
        this.filteredProducts = [];
      }
    );
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

  generateOrderNum(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  generateRamdonId(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  // Función para guardar la orden
  async onSaveOrder() {
    if (this.orderForm.valid) {
      const newOrder = this.orderForm.getRawValue();

      console.log("id: " + newOrder.id);
      console.log("price: " + newOrder.totalPrice);
      console.log("usuario: " + newOrder.status);
      // Guardar la orden
      const createOrderResult = await this.sqliteService.addOrder(newOrder);

      if (typeof createOrderResult === 'number') {

        this.createdOrderId = newOrder.orderNum;
        this.showFormOrder = false;

        const successAlert = await this.alertController.create({
          header: 'Orden Creada',
          message: `La orden ${newOrder.orderNum} ha sido creada con éxito.`,
          buttons: ['Aceptar'],
        });
        await successAlert.present();
      } else {
        const errorAlert = await this.alertController.create({
          header: 'Error de Orden',
          message: `Error al añadir la Orden ${newOrder.orderNum}`,
          buttons: ['Aceptar'],
        });
        await errorAlert.present();
      }
    } else {
      const invalidAlert = await this.alertController.create({
        header: 'Formulario Incompleto',
        message: 'Por favor completa todos los campos obligatorios.',
        buttons: ['Aceptar'],
      });
      await invalidAlert.present();
    }
  }

  // Función que se ejecuta al presionar el botón "Añadir"
  async addProductsToOrder(orderNum: number) {
    const selectedProducts = this.detailOrderForm.value;
    const detailsToAdd = [];

    const group: { [key: string]: string } = {};
    let index = 1;

    for (const productType in selectedProducts) {
      const selectedProduct = selectedProducts[productType];
      if (selectedProduct) {
        detailsToAdd.push({
          idDetail: orderNum.toString() + 
          "-" + this.indexConjunto.toString().padStart(2, '0') + 
          "-" + index.toString().padStart(2, '0'),
          productCode: selectedProduct.productCode,
          orderNum: orderNum,
          quantity: 1,
          price: selectedProduct.price,
        });
        index++;
        group[productType] = selectedProduct.productName;
      }
    }
    for (let detail of detailsToAdd) {
      await this.sqliteService.addOrderDetail(detail);      
    }

    this.displayedOrders.push(group);

    this.indexConjunto++;

    const successAlert = await this.alertController.create({
      header: 'Detalles añadidos',
      message: `Los productos han sido añadidos a la orden ${orderNum}.`,
      buttons: ['Aceptar'],
    });
    await successAlert.present();

    this.detailOrderForm.reset();
  }

  async confirmOrder(orderNum: number) {
    try {
      // Obtener la orden y sus detalles de SQLite
      const order = await this.sqliteService.getOrderByorderNumber(orderNum);
      const orderDetails = await this.sqliteService.getOrderDetailsByOrderNum(orderNum);
  
      if (!order) {
        console.error('La orden no existe en SQLite.');
        return;
      }
  
      if (!orderDetails || orderDetails.length === 0) {
        console.error('No hay detalles asociados a esta orden.');
        return;
      }

      order.status = "Preparacion";
  
      // Crear la orden en la API
      await this.apiService.addOrder(order).subscribe(
        async (response) => {
          console.log('Orden creada exitosamente en la API.');
  
          // Crear cada detalle de la orden en la API
          const promises = orderDetails.map((detail) =>
            this.apiService.addOrderDetail(detail).toPromise()
          );
  
          try {
            // Esperar a que todos los detalles sean creados
            await Promise.all(promises);
            console.log('Todos los detalles de la orden creados exitosamente en la API.');
  
            // Eliminar la orden y los detalles de SQLite después de sincronización
            await this.sqliteService.delOrder(orderNum);
            console.log('Orden eliminada de SQLite después de sincronización.');
  
            await this.sqliteService.delOrderDetail(orderNum);
            console.log('Detalles de la orden eliminados de SQLite después de sincronización.');
  
            // Mostrar alerta de éxito
            const alert = await this.alertController.create({
              header: 'Pedido confirmado',
              message: `La Orden #${orderNum} ha sido confirmada.`,
              buttons: [
                {
                  text: 'Aceptar',
                  handler: () => {
                    this.router.navigate(['/orders']).then(() => {
                      window.location.reload();
                    });
                  },
                },
              ],
            });
            await alert.present();
          } catch (detailsError) {
            console.error('Error al sincronizar los detalles de la orden:', detailsError);
  
            const alert = await this.alertController.create({
              header: 'Error de Sincronización',
              message: `La Orden #${orderNum} fue creada, pero hubo un problema al sincronizar los detalles. Por favor, inténtelo más tarde.`,
              buttons: [
                {
                  text: 'Aceptar',
                  handler: () => {},
                },
              ],
            });
            await alert.present();
          }
        },
        async (orderError) => {
          console.error('Error al sincronizar la orden en la API:', orderError);
  
          const alert = await this.alertController.create({
            header: 'Error de Sincronización',
            message: 'La Orden no se pudo sincronizar con la API. Por favor, inténtelo más tarde.',
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {},
              },
            ],
          });
          await alert.present();
        }
      );
    } catch (error) {
      console.error('Error al procesar la sincronización:', error);
  
      const alert = await this.alertController.create({
        header: 'Error de Sincronización',
        message: 'Ocurrió un error inesperado. Por favor, inténtelo más tarde.',
        buttons: [
          {
            text: 'Aceptar',
            handler: () => {},
          },
        ],
      });
      await alert.present();
    }
  }
}
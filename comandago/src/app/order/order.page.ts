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
  id: string;
  productCode: string;
  orderNum: number;
  quantity: number;
  price: number;
}

interface ProductTotals {
  [productCode: string]: { 
    productCode: string; 
    totalQuantity: number;
  };
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
  selectBoard?: Board = {
    id: '',
    boardNum: 0,
    capacity: 0,
    status: 0
  };
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
      id: [idOrder, [Validators.required]],
      orderNum: [idOrder, [Validators.required]],
      boardNum: ['', [Validators.required]],
      userName: [this.loggedInUser, [Validators.required]],
      orderDate: [today, [Validators.required]],
      totalPrice: [0, [Validators.required]],
      status: ['Pendiente', [Validators.required]],
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

        this.allProducts = this.allProducts.filter((p) => p.active === true && p.stock > 0);

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
    this.apiService.getBoards().subscribe(
      (data: Board[]) => {
        this.allBoards = data.filter((b) => b.status == 1);
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

      const boardNum = newOrder.boardNum;
      this.selectBoard = this.allBoards.find(board => board.boardNum == boardNum);

      if (this.selectBoard) {
        // Actualiza el estado de la mesa
        this.selectBoard.status = 2;
        
        try {
          // Espera la respuesta de la API
          const response = await this.apiService.updateBoardStatus(this.selectBoard.id, this.selectBoard.status).toPromise();
          
          // Si la respuesta es exitosa, puedes manejar el resultado
          if (response) {
            console.log('Estado de la mesa actualizado con éxito', JSON.stringify(response, null, 2));
          } else {
            console.log('La respuesta de la API fue vacía o inesperada');
          }
        } catch (error) {
          // Si ocurre un error en la solicitud PUT
          console.error('Error al actualizar el estado de la mesa:', error);
        }
      } else {
        console.log('Mesa no encontrada');
      }

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

    const group: { id: string; [key: string]: string } = { id: '' }; // Incluir id en el grupo
    let index = 1;

    // Generar ID único del conjunto
    const groupId = `${orderNum.toString()}-${this.indexConjunto.toString().padStart(2, '0')}`;
    group.id = groupId;

    for (const productType in selectedProducts) {
      const selectedProduct = selectedProducts[productType];
      if (selectedProduct) {
        detailsToAdd.push({
          id: orderNum.toString() + 
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

  async removeGroup(groupId: string) {
    try {
      // Obtener y eliminar todos los detalles asociados al grupo en SQLite
      const details = await this.sqliteService.getOrderDetailsByGroupId(groupId);

      if (details) {
        for (const detail of details) {
          const success = await this.sqliteService.delOrderDetailId(detail.id);
          if (success) {
            console.log(`Detalle de orden con ID ${detail.id} eliminado correctamente.`);
          } else {
            console.log(`No se pudo eliminar el detalle de orden con ID ${detail.id}.`);
          }
        }
      } else {
        console.log('No se encontraron detalles para el groupId especificado.');
      }
  
      // Eliminar el grupo de la vista
      this.displayedOrders = this.displayedOrders.filter(group => group.id !== groupId);
  
      // Mostrar alerta de éxito
      const successAlert = await this.alertController.create({
        header: 'Grupo eliminado',
        message: `El conjunto de productos ${groupId} ha sido eliminado.`,
        buttons: ['Aceptar'],
      });
      await successAlert.present();
    } catch (error) {
      console.error('Error al eliminar el grupo:', error);
      const errorAlert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un problema al eliminar el grupo. Por favor, inténtelo de nuevo.',
        buttons: ['Aceptar'],
      });
      await errorAlert.present();
    }
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

      orderDetails.map((detail) =>
        order.totalPrice = order.totalPrice + detail.price
      );
      order.status = "Confirmada";

      try {
        await this.handleOrderStockUpdate(orderNum);
        console.log('Stock actualizado correctamente.');
      } catch (stockError) {
        console.error('Error al actualizar el stock:', stockError);
  
        const alert = await this.alertController.create({
          header: 'Error al actualizar el stock',
          message: 'No se pudo actualizar el stock. Por favor, inténtelo más tarde.',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {},
            },
          ],
        });
        await alert.present();
        return; // Salir si falla la actualización del stock
      }
  
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
            await this.sqliteService.delOrderDetail(orderNum);
            console.log('Detalles de la orden eliminados de SQLite después de sincronización.');

            await this.sqliteService.delOrder(orderNum);
            console.log('Orden eliminada de SQLite después de sincronización.');
  
            this.orderForm.reset();
            this.detailOrderForm.reset();
            this.addedOrders = [];
            this.displayedOrders = [];
  
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

  async handleOrderStockUpdate(orderNum: number): Promise<void> {
    try {
      // 1. Obtener los detalles del pedido desde SQLite
      const orderDetails = await this.sqliteService.getOrderDetailsByOrderNum(orderNum);
      
      if (!orderDetails || orderDetails.length === 0) {
        console.warn('No se encontraron detalles para el pedido.');
        return;
      }
  
      // 2. Agrupar productos por su ID y sumar las cantidades pedidas
      const productTotals = orderDetails.reduce((acc: Record<string, { productCode: string; totalQuantity: number }>, detail) => {
        const { productCode, quantity } = detail;
  
        if (!acc[productCode]) {
          acc[productCode] = { productCode, totalQuantity: 0 };
        }
  
        acc[productCode].totalQuantity += quantity;
        return acc;
      }, {});
  
      // Convertir el objeto de acumulación en un array para iterar sobre él
      const aggregatedProducts = Object.values(productTotals);
  
      console.log('Productos agregados:', aggregatedProducts);
  
      // 3. Actualizar el stock en la API
      const updatePromises = aggregatedProducts.map(async (product) => {
        const { productCode, totalQuantity } = product;
  
        try {
          // Obtener el producto actual desde la API         
          const currentProducts: any = await this.apiService.getProductByProductCode(productCode).toPromise();
          const currentProduct = currentProducts[0];
          console.log("Product ID:", currentProducts?.id);

          const newStock = currentProduct.stock - totalQuantity;
  
          if (newStock < 0) {
            console.warn(`El stock del producto ${productCode} no es suficiente. Stock actual: ${newStock}, solicitado: ${totalQuantity}`);
            return;
          }
  
          // Llamada a la API para actualizar el stock
          const response = await this.apiService.updateProductStock(currentProduct.id, newStock).toPromise();
  
          if (response) {
            console.log(`Stock del producto ${productCode} actualizado con éxito. Nuevo stock: ${newStock}`);
          } else {
            console.error(`Error al actualizar el stock del producto ${productCode}:`, response);
          }
        } catch (error) {
          console.error(`Error al procesar el producto ${productCode}:`, error);
        }
      });
  
      // Esperar a que todas las actualizaciones de stock se completen
      await Promise.all(updatePromises);
  
      console.log('Actualización de stock completada.');
    } catch (error) {
      console.error('Error al manejar el stock del pedido:', error);
    }
  }  
}
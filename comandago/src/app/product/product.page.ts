import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from './../services/api.service';
import { AlertController } from '@ionic/angular';
import { SQliteService } from '../services/sqlite.service';

export interface Product {
  id: string;
  productName: string;
  productCode: string;
  price: number;
  stock: number;
  active: boolean;
  type: string;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {

  allProducts : Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery: string = '';
  find: boolean = true;
  apiConnect: boolean = false;
  logMessages: string[] = [];
  msgScreen: string = 'empty';

  constructor(private router: Router, 
              private apiService: ApiService,
              private sqliteService: SQliteService,
              private alertController: AlertController,
              private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.getProductInit();
  }

  addLog(message: string) {
    this.logMessages.push(message);
    this.changeDetector.detectChanges()
  }

  ToAddProduct() {
    this.router.navigate(['/add-product']);
  }

  onInputChange(event: any) {
    this.searchQuery = event.target.value; // Actualizar la variable con el valor del input
  }

  searchProduct() {
    this.apiService.getProducts().subscribe(
      (data: Product[]) => {
        this.allProducts = data.map(product => ({
          ...product,
        }));
        this.allProducts = data;
        this.filteredProducts = data;  // Al principio, no hay filtro, así que mostramos todos los productos
      
        if (this.searchQuery.trim() === '') {
          this.filteredProducts = this.allProducts;  // Si el input está vacío, mostramos todos los productos
          return;
        }
    
        // Filtrar los productos basándose en el nombre completo o producto
        this.filteredProducts = this.allProducts.filter(product =>
          product.productName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          product.productName.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    
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

  onEditProduct(product: Product) {
    const navigationExtras: NavigationExtras = {
      state: {
        productEdit: product
      },
    }
    console.log('Editar Producto:', product);

    this.router.navigate(['/edit-product'], navigationExtras).then(() => {
      window.location.reload();
    });
  }

  onViewProductDetails(product: Product) {
    const navigationExtras: NavigationExtras = {
      state: {
        productEdit: product
      },
    }
    console.log('Ver usuario:', product.productName);

    this.router.navigate(['/view-product'], navigationExtras).then(() => {
      window.location.reload();
    });
  }

  async onDeleteProduct(product: Product) {
    // Lógica para eliminar usuario
    console.log('Eliminar producto:', product.productName);
    // Crear y mostrar el alert
    const alert = await this.alertController.create({
      header: 'Eliminar Producto',
      message: '¿Está seguro que desea eliminar el producto ' + product.productName + '?',
      buttons: [
        {
          text: 'Cancelar', // Agrega un botón para cancelar la acción
          role: 'cancel',
          handler: () => {
            console.log('Canceló la eliminación del producto.');
          }
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: async () => {
            await this.deleteProductApi(product);
          }
        }
      ],
    });
  
    await alert.present();
  }

  async deleteProductApi(productDelete: Product) {
    try {
      const response = await this.apiService.deleteProduct(productDelete.id.toString()).toPromise();
      console.log('Usuario eliminado exitosamente', response);
      const alert = await this.alertController.create({
        header: 'Eliminar Usuario',
        message: 'Usuario ' + productDelete.productName + ' eliminado éxitosamente',
        buttons: [
          {
            text: 'Cerrar',
            role: 'confirm',
            handler: () => {
              this.searchProduct();
              console.log('');
            }
          }
        ]
      });
      await alert.present(); // Muestra la alerta
    } catch (error) {
      console.error('Error eliminando el usuario:', error);
    }
  }

  async syncUsersWithApi() {
    try {
      const users = await this.sqliteService.getAllUsers();
      
      if (users && users.length > 0) {
        for (const user of users) {
          try {
            // Intentar insertar el usuario en la API
            const response = await this.apiService.addUser(user).toPromise();
            if (response) {
              this.addLog(`Usuario ${user.userName} - ${user.id} insertado en la API exitosamente`);

              // Eliminar el usuario de SQLite después de confirmación de inserción en la API
              await this.sqliteService.delUser(user.userName);
              this.addLog(`Usuario ${user.userName} - ${user.id} eliminado de SQLite exitosamente`);
            }
          } catch (error) {
            this.addLog(`Error al insertar el usuario ${user.userName} - ${user.id} en la API: ` + error);
          }
        }
      } else {
        this.addLog('No se encontraron usuarios en la base de datos SQLite para sincronizar.');
      }
    } catch (error) {
      this.addLog('Error durante la sincronización de usuarios: ' + error);
    }
  }



}
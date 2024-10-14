import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from './../services/api.service';
import { AlertController } from '@ionic/angular';

export interface Product {
  id: number;
  productName: string;
  price: number;
  stock: number;
  active: boolean;
  type: string;
  showOptions?: boolean;
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
  find: boolean = false;

  constructor(private router: Router, 
              private apiService: ApiService, 
              private alertController: AlertController) { }

  ngOnInit() {
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
          showOptions: false // Inicializar showOptions en false
        }));
        this.allProducts = data;
        this.filteredProducts = data;  // Al principio, no hay filtro, así que mostramos todos los usuarios
      
        if (this.searchQuery.trim() === '') {
          this.filteredProducts = this.allProducts;  // Si el input está vacío, mostramos todos los usuarios
          return;
        }
    
        // Filtrar los usuarios basándose en el nombre completo o producto
        this.filteredProducts = this.allProducts.filter(product =>
          product.productName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          product.productName.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    
        // Controlar si se encontraron usuarios
        this.find = this.filteredProducts.length > 0;

      },
      (error) => {
        console.error('Error al traer los usuarios:', error);
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
    console.log('Editar Producto:', product.productName);

    this.router.navigate(['/edit-product'], navigationExtras).then(() => {
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
            await this.onDeleteProduct(product);
          }
        }
      ],
    });
  
    await alert.present();
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { Product } from '../product/product.page';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
})
export class AddProductPage implements OnInit {

  productForm!: FormGroup;
  products: Product[] = [];
  nextId: string = "0";

  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService, 
              private alertController: AlertController,
              private router: Router ) { }

  ngOnInit() {
    this.getProductsFromApi();
    this.productForm = this.formBuilder.group({
      id: ['', []],
      productName: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.pattern("^[0-9]*$")]], // Valida solo números para el precio
      stock: ['', [Validators.required, Validators.min(0)]],
      type: ['', [Validators.required]],
    });
  }

  generateNextId() {
    if (this.products.length > 0) {
      const lastProducts = this.products.reduce((prev, current) => (prev.id > current.id) ? prev : current);
      this.nextId = ((+lastProducts.id) + 1).toString();
    }
  }

  getProductsFromApi() {
    this.apiService.getProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
        this.generateNextId();
      },
      (error) => {
        console.error('Error al traer los usuarios:', error);
        this.products = [];
      }
    );
  }

  async onSaveProduct() {
    if (this.productForm.valid) {
      const newProduct = this.productForm.value;
      newProduct.id = this.nextId;

      this.apiService.addProduct(newProduct).subscribe(async response => {
        console.log('Producto añadido exitosamente', response);

        // Crear y mostrar el alert
        const alert = await this.alertController.create({
          header: 'Producto Creado',
          message: 'El Producto ' + newProduct.productName + ' ha sido creado con éxito.',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                this.router.navigate(['/add-product']).then(() => {
                  window.location.reload();
                });
              }
            }
          ],
        });

        await alert.present();

      }, async error => {
        console.error('Error al añadir el producto', error);
        const alert = await this.alertController.create({
          header: 'Error de Producto',
          message: 'Error al añadir el product ' +  error,
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
              }
            }
          ],
        });
      });
    }
  }

}


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { Product } from '../product/product.page';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
})
export class AddProductPage implements OnInit {

  productForm!: FormGroup;
  products: Product[] = [];
  idRandom: number = 0;

  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService, 
              private alertController: AlertController,
              private router: Router,
              private appComponent: AppComponent) { }

  ngOnInit() {
    this.getProductsFromApi();
    this.idRandom = this.appComponent.getRandomID();
    console.log("add-user random : " + this.idRandom);

    this.productForm = this.formBuilder.group({
      id: ['', []],
      productName: ['', [Validators.required]],
      productCode: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      active: ['', []],
      type: ['', [Validators.required]],
    });
  }

  getProductsFromApi() {
    this.apiService.getProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
      },
      (error) => {
        console.error('Error al traer los usuarios:', error);
        this.products = [];
      }
    );
  }

  async onSaveProduct() {
    if (this.productForm.valid) {
      this.productForm.patchValue({
        id: this.idRandom.toString()
      });
      const newProduct = this.productForm.value;
      newProduct.active = "false";

      this.apiService.addProduct(newProduct).subscribe(async response => {
        console.log('Producto añadido exitosamente', response);

        const alert = await this.alertController.create({
          header: 'Producto Creado',
          message: 'El Producto ' + newProduct.productName + ' ha sido creado con éxito.',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                this.router.navigate(['/add-product']);
              }
            }
          ],
        });

        await alert.present();

      }, async error => {
        console.error('Error al añadir el producto', error);
        const alert = await this.alertController.create({
          header: 'Error de Producto',
          message: 'Error al añadir el producto ' + error,
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

  navigateToProduct() {
    this.router.navigate(['/product']);
  }

}

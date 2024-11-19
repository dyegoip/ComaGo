import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { Product } from '../product/product.page';
import { AppComponent } from '../app.component';
import { SQliteService } from '../services/sqlite.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
})
export class AddProductPage implements OnInit {

  productForm!: FormGroup;
  products: Product[] = [];
  apiConnect: boolean = true;
  ok: boolean = false;
  idRandom: number = 0;

  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService,
              private sqliteService: SQliteService,
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
    let msgError = '';
  
    if (this.productForm.valid) {
      this.productForm.patchValue({
        id: this.idRandom.toString(),
        active: "false" // Valor predeterminado para nuevos productos
      });
  
      const newProduct = this.productForm.value;
      let createProduct: number | null = null;
  
      // Guardar producto en SQLite
      createProduct = await this.sqliteService.addProduct(newProduct);
  
      if (typeof(createProduct) === 'number') {
        console.log('Producto guardado en SQLite');
        if (this.apiConnect) {
          // Sincronizar con la API
          await this.apiService.addProduct(newProduct).subscribe(async response => {
            console.log('Producto sincronizado con la API exitosamente.');
  
            // Eliminar producto de SQLite después de sincronización
            await this.sqliteService.delProduct(newProduct.productName);
            console.log('Producto eliminado de SQLite después de sincronización.');
  
            const alert = await this.alertController.create({
              header: 'Producto Creado',
              message: 'El Producto ' + newProduct.productName + ' ha sido sincronizado con la API con éxito.',
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
            msgError = error;
            console.error('Error al sincronizar el producto con la API. ', msgError);
  
            const alert = await this.alertController.create({
              header: 'Error de Sincronización',
              message: 'El Producto no se pudo sincronizar con la API. Intentar más tarde.',
              buttons: [
                {
                  text: 'Aceptar',
                  handler: () => {}
                }
              ],
            });
            await alert.present();
          });
        } else {
          console.log('No hay conexión a la API, producto guardado solo en SQLite.');
  
          const alert = await this.alertController.create({
            header: 'Producto Creado',
            message: 'El Producto ' + newProduct.productName + ' ha sido creado y guardado en la base de datos local (SQLite).',
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
        }
      } else {
        // Si hay un error al guardar en SQLite
        console.error('Error al guardar el producto en SQLite. ', msgError);
  
        const alert = await this.alertController.create({
          header: 'Error de Producto',
          message: 'Error al guardar el producto en la base de datos local.',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {}
            }
          ],
        });
        await alert.present();
      }
    }
  }
  

  navigateToProduct() {
    this.router.navigate(['/product']);
  }

}

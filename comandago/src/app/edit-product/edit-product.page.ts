import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.page.html',
  styleUrls: ['./edit-product.page.scss'],
})
export class EditProductPage implements OnInit {

  productForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService, 
              private alertController: AlertController,
              private router: Router) { }

  ngOnInit() {
    this.productForm = this.formBuilder.group({
      id: ['', []],
      productName: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      stock: ['', [Validators.required, Validators.min(0)]],
      active: ['',[]],
      type: ['', [Validators.required]],
    });
  

  const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state && navigation.extras.state['productEdit'] != null) {
      const productEdit = navigation.extras.state['productEdit'];
      console.log(productEdit);
      this.productForm.patchValue({
        id: productEdit.id,
        productName: productEdit.productName,
        price: productEdit.price,
        stock: productEdit.stock,
        active: "false",
        type: productEdit.type
      });
    } else {
      console.log('No hay producto');
    }
  }

  async onEditProduct() {
    if (this.productForm.valid) {
      const newProduct = this.productForm.value;

      this.apiService.editProduct(newProduct).subscribe(async response => {
        console.log('Producto añadido exitosamente', response);

        // Crear y mostrar el alert
        const alert = await this.alertController.create({
          header: 'Producto Editado',
          message: 'El Producto' + newProduct.productName + ' ha sido editado con éxito.',
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
          message: 'Error al añadir el producto' +  error,
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

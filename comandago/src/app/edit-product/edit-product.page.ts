import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      productCode: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      active: [false, []],
      type: ['', [Validators.required]],
    });
  
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state && navigation.extras.state['productEdit'] != null) {
      const productEdit = navigation.extras.state['productEdit'];
      console.log(productEdit);
      this.productForm.patchValue({
        id: productEdit.id,
        productName: productEdit.productName,
        productCode: productEdit.productCode,
        price: productEdit.price,
        stock: productEdit.stock,
        active: productEdit.active, 
        type: productEdit.type
      });
    } else {
      console.log('No hay producto');
    }
  }

  async onEditProduct() {
    if (this.productForm.valid) {
      const editProduct = this.productForm.value;

      this.apiService.editProduct(editProduct).subscribe(async response => {
        console.log('Producto editado exitosamente', response);

        const alert = await this.alertController.create({
          header: 'Producto Editado',
          message: `El producto ${editProduct.productName} ha sido editado con éxito.`,
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                this.router.navigate(['/product']).then(() => {
                  window.location.reload();
                });
              }
            }
          ],
        });

        await alert.present();

      }, async error => {
        console.error('Error al editar el producto', error);
        const alert = await this.alertController.create({
          header: 'Error de Producto',
          message: 'Error al editar el producto: ' + error,
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
              }
            }
          ],
        });
        await alert.present();        
      });
    }
  }

  navigateToProduct() {
    this.router.navigate(['/product']);
  }
}

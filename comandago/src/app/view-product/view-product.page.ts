import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.page.html',
  styleUrls: ['./view-product.page.scss'],
})
export class ViewProductPage implements OnInit {

  productForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, 
              private apiService: ApiService, 
              private alertController: AlertController,
              private router: Router) { }

  ngOnInit() {
    this.productForm = this.formBuilder.group({
      id: [{ value: '', disabled: true }, []],
      productName: [{ value: '', disabled: true }, [Validators.required]],
      price: [{ value: '', disabled: true },[Validators.required, Validators.pattern("^[0-9]*$")]],
      stock: [{ value: '', disabled: true }, [Validators.required, Validators.min(0)]],
      active: [{ value: '', disabled: true },[]],
      type: [{ value: '', disabled: true }, [Validators.required]],
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

  navigateToProduct() {
    this.router.navigate(['/product']);
  }

}

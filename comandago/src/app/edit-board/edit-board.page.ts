import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-board',
  templateUrl: './edit-board.page.html',
  styleUrls: ['./edit-board.page.scss'],
})
export class EditBoardPage implements OnInit {

  boardForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.boardForm = this.formBuilder.group({
      id: ['', []],
      boardNum: ['', [Validators.required, Validators.min(1)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      status: ['', [Validators.required]]
    });

    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state && navigation.extras.state['boardEdit'] != null) {
      const boardEdit = navigation.extras.state['boardEdit'];
      console.log('Datos de la mesa para editar:', boardEdit);
      this.boardForm.patchValue({
        id: boardEdit.id,
        boardNum: boardEdit.boardNum,
        capacity: boardEdit.capacity,
        status: boardEdit.status
      });
    } else {
      console.log('No hay datos de la mesa para editar.');
    }
  }

  async onEditBoard() {
    if (this.boardForm.valid) {
      const editBoard = this.boardForm.value;

      this.apiService.updateBoardStatus(editBoard.id, editBoard.status).subscribe(
        async response => {
          console.log('Mesa editada exitosamente:', response);

          const alert = await this.alertController.create({
            header: 'Mesa Editada',
            message: `La mesa número ${editBoard.boardNum} ha sido editada con éxito.`,
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  this.router.navigate(['/board']).then(() => {
                    window.location.reload();
                  });
                }
              }
            ],
          });

          await alert.present();
        },
        async error => {
          console.error('Error al editar la mesa:', error);
          const alert = await this.alertController.create({
            header: 'Error',
            message: `No se pudo editar la mesa. Error: ${error.message || error}`,
            buttons: ['Aceptar']
          });
          await alert.present();
        }
      );
    }
  }

  navigateToBoard() {
    this.router.navigate(['/board']);
  }
}

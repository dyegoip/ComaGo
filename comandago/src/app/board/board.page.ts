import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from './../services/api.service';
import { AlertController } from '@ionic/angular';
import { SQliteService } from '../services/sqlite.service';

export interface Board {
  id: string;
  boardNum: number;
  capacity: number;
  status: number;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  allBoards: Board[] = [];
  filteredBoards: Board[] = [];
  searchQuery: string = '';
  find: boolean = true;
  logMessages: string[] = [];

  constructor(private router: Router, 
              private apiService: ApiService,
              private sqliteService: SQliteService,
              private alertController: AlertController,
              private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.getBoardsInit();
  }

  addLog(message: string) {
    this.logMessages.push(message);
    this.changeDetector.detectChanges();
  }

  toAddBoard() {
    this.router.navigate(['/add-board']);
  }

  onInputChange(event: any) {
    this.searchQuery = event.target.value;
  }

  searchBoard() {
    if (this.searchQuery.trim() === '') {
      this.filteredBoards = this.allBoards;
      return;
    }

    this.filteredBoards = this.allBoards.filter(board =>
      board.boardNum.toString().includes(this.searchQuery.toLowerCase()) ||
      board.status.toString().includes(this.searchQuery.toLowerCase())
    );

    this.find = this.filteredBoards.length > 0;
  }

  getBoardsInit() {
    this.apiService.getBoards().subscribe(
      (data: Board[]) => {
        this.allBoards = data.map(board => ({
          ...board,
        }));
        this.filteredBoards = this.allBoards;
        this.find = this.filteredBoards.length > 0;
      },
      (error) => {
        console.error('Error al traer las mesas:', error);
        this.allBoards = [];
        this.filteredBoards = [];
      }
    );
  }

  onEditBoard(board: Board) {
    const navigationExtras: NavigationExtras = {
      state: {
        boardEdit: board
      },
    };
    console.log('Editar Mesa:', board);
    this.router.navigate(['/edit-board'], navigationExtras).then(() => {
      window.location.reload();
    });
  }

  onViewBoardDetails(board: Board) {
    const navigationExtras: NavigationExtras = {
      state: {
        boardView: board
      },
    };
    console.log('Ver Mesa:', board.boardNum);
    this.router.navigate(['/view-board'], navigationExtras).then(() => {
      window.location.reload();
    });
  }

  async onDeleteBoard(board: Board) {
    console.log('Eliminar mesa:', board.boardNum);
    const alert = await this.alertController.create({
      header: 'Eliminar Mesa',
      message: '¿Está seguro que desea eliminar la mesa ' + board.boardNum + '?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Canceló la eliminación de la mesa.');
          }
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: async () => {
            await this.deleteBoardApi(board);
          }
        }
      ],
    });

    await alert.present();
  }

  async deleteBoardApi(boardDelete: Board) {
    try {
      const response = await this.apiService.deleteBoard(boardDelete.id).toPromise();
      console.log('Mesa eliminada exitosamente', response);
      const alert = await this.alertController.create({
        header: 'Eliminar Mesa',
        message: 'Mesa ' + boardDelete.boardNum + ' eliminada exitosamente',
        buttons: [
          {
            text: 'Cerrar',
            role: 'confirm',
            handler: () => {
              this.searchBoard();
            }
          }
        ]
      });
      await alert.present();
    } catch (error) {
      console.error('Error eliminando la mesa:', error);
    }
  }

  // async syncBoardsWithApi() {
  //   try {
  //     const boards = await this.sqliteService.getAllBoards();
  //     if (boards && boards.length > 0) {
  //       for (const board of boards) {
  //         try {
  //           const response = await this.apiService.addBoard(board).toPromise();
  //           if (response) {
  //             this.addLog(`Mesa ${board.boardNum} - ${board.id} insertada en la API exitosamente`);
  //             await this.sqliteService.delBoard(board.boardNum);
  //             this.addLog(`Mesa ${board.boardNum} - ${board.id} eliminada de SQLite exitosamente`);
  //           }
  //         } catch (error) {
  //           this.addLog(`Error al insertar la mesa ${board.boardNum} - ${board.id} en la API: ` + error);
  //         }
  //       }
  //     } else {
  //       this.addLog('No se encontraron mesas en la base de datos SQLite para sincronizar.');
  //     }
  //   } catch (error) {
  //     this.addLog('Error durante la sincronización de mesas: ' + error);
  //   }
  // }
}

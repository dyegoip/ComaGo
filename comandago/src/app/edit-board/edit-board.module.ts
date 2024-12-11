import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditBoardPageRoutingModule } from './edit-board-routing.module';

import { EditBoardPage } from './edit-board.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditBoardPageRoutingModule
  ],
  declarations: [EditBoardPage]
})
export class EditBoardPageModule {}

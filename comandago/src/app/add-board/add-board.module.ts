import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddBoardPageRoutingModule } from './add-board-routing.module';

import { AddBoardPage } from './add-board.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddBoardPageRoutingModule
  ],
  declarations: [AddBoardPage]
})
export class AddBoardPageModule {}

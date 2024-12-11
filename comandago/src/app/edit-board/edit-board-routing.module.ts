import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditBoardPage } from './edit-board.page';

const routes: Routes = [
  {
    path: '',
    component: EditBoardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditBoardPageRoutingModule {}

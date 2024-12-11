import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddBoardPage } from './add-board.page';

const routes: Routes = [
  {
    path: '',
    component: AddBoardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddBoardPageRoutingModule {}

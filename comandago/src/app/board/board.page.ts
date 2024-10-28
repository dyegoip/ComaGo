import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ApiService } from './../services/api.service';
import { AlertController } from '@ionic/angular';

export interface Board {
  id: string;
  numberBoard: number;
  capacity: number;
  status: number;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.page.html',
  styleUrls: ['./board.page.scss'],
})
export class BoardPage implements OnInit {

  constructor(private router: Router, 
              private apiService: ApiService, 
              private alertController: AlertController) { }

  ngOnInit() {
  }

}

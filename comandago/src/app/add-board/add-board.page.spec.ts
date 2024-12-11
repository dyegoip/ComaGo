import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddBoardPage } from './add-board.page';

describe('AddBoardPage', () => {
  let component: AddBoardPage;
  let fixture: ComponentFixture<AddBoardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBoardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

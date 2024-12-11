import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditBoardPage } from './edit-board.page';

describe('EditBoardPage', () => {
  let component: EditBoardPage;
  let fixture: ComponentFixture<EditBoardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBoardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

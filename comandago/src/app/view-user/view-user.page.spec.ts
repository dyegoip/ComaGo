import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewUserPage } from './view-user.page';

describe('ViewUserPage', () => {
  let component: ViewUserPage;
  let fixture: ComponentFixture<ViewUserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

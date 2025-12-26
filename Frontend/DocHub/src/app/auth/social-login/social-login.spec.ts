import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialLogin } from './social-login';

describe('SocialLogin', () => {
  let component: SocialLogin;
  let fixture: ComponentFixture<SocialLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

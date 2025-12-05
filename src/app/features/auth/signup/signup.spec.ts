import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signup']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable submit button when form is invalid', () => {
    expect(component.signupForm.invalid).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    expect(component.signupForm.valid).toBe(true);
  });

  it('should show password mismatch error', () => {
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password456'
    });
    expect(component.signupForm.hasError('passwordMismatch')).toBe(true);
  });

  it('should call authService.signup on form submit', () => {
    authService.signup.and.returnValue(of({}));
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    component.onSubmit();
    expect(authService.signup).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should handle signup error', () => {
    authService.signup.and.returnValue(throwError(() => ({ code: 'auth/email-already-in-use' })));
    component.signupForm.setValue({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
    component.onSubmit();
    expect(component.error).toBe('Este email já está registrado.');
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword).toBe(false);
  });

  it('should navigate to login', () => {
    component.navigateToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

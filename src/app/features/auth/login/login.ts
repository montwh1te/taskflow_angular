import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs/operators';
import { MaterialImportsModule } from '../../../material-imports.module';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [ MaterialImportsModule, DatePipe, ReactiveFormsModule ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['user@taskflow.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password)
      .pipe(finalize(() => this.loading = false))
      .subscribe(response => {
        if (!response) {
          this.error = 'Credenciais inválidas. Tente novamente.';
        }
      });
  }
}
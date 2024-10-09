import { Component, inject } from '@angular/core';
import { AuthService } from '../../shared/data-access/auth.service';
import { Router, RouterModule } from '@angular/router';
import { LoginFormComponent } from './ui/login-form.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginService } from './data-access/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, LoginFormComponent, MatProgressSpinnerModule],
  template: `
    <div class="container gradient-bg">
      <app-login-form
        [loginStatus]="loginService.status()"
        (login)="loginService.login$.next($event)"
      />
      <a routerLink="/auth/register">Create account</a>
    </div>
  `,
  styles: [
    `
      a {
        margin: 2rem;
        color: var(--accent-darker-color);
      }
    `,
  ],
  providers: [LoginService],
})
export default class LoginComponent {
  public loginService = inject(LoginService);
  public authService = inject(AuthService);
  private router = inject(Router);
}

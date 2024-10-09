import { Component, effect, inject } from '@angular/core';
import { RegisterService } from './data-access/register.service';
import { RegisterFormComponent } from './ui/register-form.component';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/data-access/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RegisterFormComponent],
  template: `
    <div class="container gradient-bg">
      <app-register-form
        [status]="registerService.status()"
        (register)="registerService.createUser$.next($event)"
      />
    </div>
  `,
  styles: ``,
  providers: [RegisterService],
})
export default class RegisterComponent {
  public registerService = inject(RegisterService);
  public authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.user()) {
        this.router.navigate(['home']);
      }
    });
  }
}

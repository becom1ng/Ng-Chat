import { Component, inject } from '@angular/core';
import { RegisterService } from './data-access/register.service';
import { RegisterFormComponent } from './ui/register-form.component';

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
export class RegisterComponent {
  public registerService = inject(RegisterService);
}

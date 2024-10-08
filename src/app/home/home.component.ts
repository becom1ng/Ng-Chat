import { Component, effect, inject, signal } from '@angular/core';
import { MessageService } from '../shared/data-access/message.service';
import { MessageListComponent } from './ui/message-list.component';
import { MessageInputComponent } from './ui/message.input.component';
import { AuthService } from '../shared/data-access/auth.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MessageListComponent,
    MessageInputComponent,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  template: `
    <div class="container">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="authService.logout()">
          <mat-icon>logout</mat-icon>
        </button>
        <span class="spacer"></span>
        <button mat-icon-button (click)="darkMode.set(!darkMode())">
          @if(darkMode()) {
          <mat-icon>light_mode</mat-icon>
          } @else {
          <mat-icon>dark_mode</mat-icon>
          }
        </button>
      </mat-toolbar>

      <app-message-list
        [messages]="messageService.messages()"
        [activeUser]="authService.user()"
      />
      <app-message-input (send)="messageService.add$.next($event)" />
    </div>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }

      mat-toolbar {
        box-shadow: 0px -7px 11px 0px var(--md-sys-color-primary-container);
        position: sticky;
        top: 0;
      }

      app-message-list {
        height: 100%;
        width: 100%;
      }

      app-message-input {
        position: fixed;
        bottom: 0;
      }
    `,
  ],
})
export default class HomeComponent {
  messageService = inject(MessageService);
  public authService = inject(AuthService);
  private router = inject(Router);

  darkMode = signal(false);

  constructor() {
    effect(() => {
      if (!this.authService.user()) {
        this.router.navigate(['auth', 'login']);
      }
    });

    effect(() => {
      document.documentElement.classList.toggle('dark', this.darkMode());
    });
  }
}

import { Component, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule],
  template: `
    <input
      type="text"
      [formControl]="messageControl"
      name="messageControl"
      placeholder="type a message..."
      (keyup.enter)="send.emit(messageControl.value); messageControl.reset()"
    />
    <button
      mat-button
      (click)="send.emit(messageControl.value); messageControl.reset()"
    >
      <mat-icon>send</mat-icon>
    </button>
  `,
  styles: [
    `
      :host {
        width: 100%;
        position: relative;
      }

      input {
        width: 100%;
        background: var(--white);
        border: none;
        font-size: 1.2em;
        padding: 2rem 1rem;
      }

      button {
        height: 100% !important;
        position: absolute;
        right: 0;
        bottom: 0;

        mat-icon {
          margin-right: 0;
        }
      }
    `,
  ],
})
export class MessageInputComponent {
  send = output<string>();
  messageControl = new FormControl();
}

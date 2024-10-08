import { Component, inject } from '@angular/core';
import { MessageService } from '../shared/data-access/message.service';
import { MessageListComponent } from './ui/message-list.component';
import { MessageInputComponent } from './ui/message.input.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MessageListComponent, MessageInputComponent],
  template: `
    <div class="container">
      <app-message-list [messages]="messageService.messages()" />
      <app-message-input (send)="messageService.add$.next($event)" />
    </div>
  `,
  styles: ``,
})
export default class HomeComponent {
  messageService = inject(MessageService);
}

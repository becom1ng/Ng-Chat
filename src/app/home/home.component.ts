import { Component, inject } from '@angular/core';
import { MessageService } from '../shared/data-access/message.service';
import { MessageListComponent } from './ui/message-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MessageListComponent],
  template: `
    <div class="container">
      <app-message-list [messages]="messageService.messages()" />
    </div>
  `,
  styles: ``,
})
export default class HomeComponent {
  messageService = inject(MessageService);
}

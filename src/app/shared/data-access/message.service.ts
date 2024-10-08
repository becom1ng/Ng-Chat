import { computed, inject, Injectable, signal } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { map } from 'rxjs/operators';
import { connect } from 'ngxtension/connect';
import { collectionData } from 'rxfire/firestore';

import { Message } from '../interfaces/message';
import { FIRESTORE } from '../../app.config';

interface MessageState {
  messages: Message[];
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(FIRESTORE);

  // state
  private state = signal<MessageState>({
    messages: [],
    error: null,
  });

  // selectors
  messages = computed(() => this.state().messages);
  error = computed(() => this.state().error);

  // sources
  messages$ = this.getMessages();

  constructor() {
    // reducers
    const nextState$ = merge(
      this.messages$.pipe(map((messages) => ({ messages })))
    );

    connect(this.state).with(nextState$);
  }

  private getMessages() {
    const messageCollection = query(
      collection(this.firestore, 'messages'),
      orderBy('created', 'desc'),
      limit(50)
    );

    return collectionData(messageCollection, { idField: 'id' }).pipe(
      map((messages) => [...messages].reverse())
    ) as Observable<Message[]>;
  }
}

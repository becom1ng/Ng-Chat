import { computed, inject, Injectable, signal } from '@angular/core';
import { defer, merge, Observable, of, Subject } from 'rxjs';
import { collection, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { catchError, exhaustMap, ignoreElements, map } from 'rxjs/operators';
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
  add$ = new Subject<Message['content']>();

  constructor() {
    // reducers
    const nextState$ = merge(
      this.messages$.pipe(map((messages) => ({ messages }))),
      this.add$.pipe(
        // add message to database
        exhaustMap((message) => this.addMessage(message)),
        // ignore stream emissions from above as we don't care
        ignoreElements(),
        // catch errors (prevent sream breaking) and emit as observable, which will then update state
        catchError((error) => of({ error }))
      )
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

  private addMessage(message: string) {
    const newMessage: Message = {
      // TODO: Use actual user data once register/login implemented
      author: 'me@test.com',
      content: message,
      created: Date.now().toString(),
    };

    const messageCollection = collection(this.firestore, 'messages');
    return defer(() => addDoc(messageCollection, newMessage));
  }
}

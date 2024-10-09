import { computed, inject, Injectable, signal } from '@angular/core';
import { defer, merge, Observable, of, Subject } from 'rxjs';
import { collection, query, orderBy, limit, addDoc } from 'firebase/firestore';
import {
  catchError,
  delay,
  exhaustMap,
  filter,
  ignoreElements,
  map,
  retry,
} from 'rxjs/operators';
import { connect } from 'ngxtension/connect';
import { collectionData } from 'rxfire/firestore';
import { toObservable } from '@angular/core/rxjs-interop';

import { Message } from '../interfaces/message';
import { FIRESTORE } from '../../app.config';
import { AuthService } from './auth.service';

interface MessageState {
  messages: Message[];
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private firestore = inject(FIRESTORE);
  private authService = inject(AuthService);
  private authUser$ = toObservable(this.authService.user);

  // state
  private state = signal<MessageState>({
    messages: [],
    error: null,
  });

  // selectors
  messages = computed(() => this.state().messages);
  error = computed(() => this.state().error);

  // sources
  messages$ = this.getMessages().pipe(
    // restart stream when user reauthenticates
    retry({
      delay: () => this.authUser$.pipe(filter((user) => !!user)),
    })
  );
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
    const newMessage = {
      author: this.authService.user()?.email,
      content: message,
      created: Date.now().toString(),
    };

    const messagesCollection = collection(this.firestore, 'messages');
    return defer(() => addDoc(messagesCollection, newMessage));
  }
}

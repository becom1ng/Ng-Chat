import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, map, merge, Subject, switchMap } from 'rxjs';
import { connect } from 'ngxtension/connect';
import { AuthService } from '../../../shared/data-access/auth.service';
import { Credentials } from '../../../shared/interfaces/credentials';

export type RegisterStatus = 'pending' | 'creating' | 'success' | 'error';

interface RegisterState {
  status: RegisterStatus;
}

@Injectable()
export class RegisterService {
  private authService = inject(AuthService);

  // state
  private state = signal<RegisterState>({
    status: 'pending',
  });

  // selectors
  status = computed(() => this.state().status);

  // sources
  createUser$ = new Subject<Credentials>();
  error$ = new Subject<any>();

  userCreated$ = this.createUser$.pipe(
    switchMap((credentials) =>
      this.authService.createAccount(credentials).pipe(
        catchError((err) => {
          this.error$.next(err);
          return EMPTY;
        })
      )
    )
  );

  constructor() {
    // reducers
    const nextState$ = merge(
      this.createUser$.pipe(map(() => ({ status: 'creating' as const }))),
      this.userCreated$.pipe(map(() => ({ status: 'success' as const }))),
      this.error$.pipe(map(() => ({ status: 'error' as const })))
    );

    connect(this.state).with(nextState$);
  }
}

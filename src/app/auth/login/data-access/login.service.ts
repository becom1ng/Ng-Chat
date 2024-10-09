import { Injectable, computed, inject, signal } from '@angular/core';
import { EMPTY, Subject, merge, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { connect } from 'ngxtension/connect';
import { AuthService } from '../../../shared/data-access/auth.service';
import { Credentials } from '../../../shared/interfaces/credentials';

export type LoginStatus = 'pending' | 'authenticating' | 'success' | 'error';

interface LoginState {
  status: LoginStatus;
}

@Injectable()
export class LoginService {
  private authService = inject(AuthService);

  // state
  private state = signal<LoginState>({
    status: 'pending',
  });

  // selectors
  status = computed(() => this.state().status);

  // sources
  login$ = new Subject<Credentials>();
  error$ = new Subject<any>();

  userAuthenticated$ = this.login$.pipe(
    switchMap((credentials) =>
      this.authService.login(credentials).pipe(
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
      this.login$.pipe(map(() => ({ status: 'authenticating' as const }))),
      this.userAuthenticated$.pipe(map(() => ({ status: 'success' as const }))),
      this.error$.pipe(map(() => ({ status: 'error' as const })))
    );

    connect(this.state).with(nextState$);
  }
}

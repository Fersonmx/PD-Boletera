import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SetupService } from '../services/setup.service';
import { map, catchError, of } from 'rxjs';

export const setupGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const setupService = inject(SetupService);

    return setupService.checkStatus().pipe(
        map(status => {
            // If setup is required, allow access to /setup
            if (status.setupRequired) {
                return true;
            }
            // If setup is NOT required, redirect to home
            return router.createUrlTree(['/']);
        }),
        catchError(() => {
            // On error assuming setup might be broken or already done?
            // Let's assume on error we go to home to avoid infinite loop
            return of(router.createUrlTree(['/']));
        })
    );
};

export const alreadyConfiguredGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const setupService = inject(SetupService);

    return setupService.checkStatus().pipe(
        map(status => {
            // If setup is required, REDIRECT to /setup
            if (status.setupRequired) {
                return router.createUrlTree(['/setup']);
            }
            // If setup is NOT required, allow access
            return true;
        }),
        catchError((err) => {
            console.error("Error in alreadyConfiguredGuard", err);
            return of(true); // Allow access if check fails to avoid lockout during dev? Or block?
        })
    );
};

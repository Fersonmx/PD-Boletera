import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated) {
        return true;
    }

    // Redirect to login page with return url
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated && authService.isAdmin) {
        return true;
    }

    // If authenticated but not admin, go to home
    if (authService.isAuthenticated) {
        return router.createUrlTree(['/']);
    }

    return router.createUrlTree(['/auth/login']);
};

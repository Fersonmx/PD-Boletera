import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './features/public/layouts/public-layout.component';
import { HomeComponent } from './features/public/pages/home/home.component';
import { LoginComponent } from './features/public/pages/login/login.component';
import { RegisterComponent } from './features/public/pages/register/register.component';
import { adminGuard, authGuard } from './core/guards/auth.guard';
import { setupGuard, alreadyConfiguredGuard } from './core/guards/setup.guard';

export const routes: Routes = [
    // Setup Route
    {
        path: 'setup',
        loadComponent: () => import('./features/setup/pages/setup-wizard/setup-wizard.component').then(m => m.SetupWizardComponent),
        canActivate: [setupGuard]
    },

    // Public Routes
    {
        path: '',
        component: PublicLayoutComponent,
        canActivate: [alreadyConfiguredGuard],
        children: [
            { path: '', component: HomeComponent },
            {
                path: 'events',
                loadComponent: () => import('./features/public/pages/events/events.component').then(m => m.EventsComponent)
            },
            {
                path: 'events/:id',
                loadComponent: () => import('./features/public/pages/event-detail/event-detail.component').then(m => m.EventDetailComponent)
            },
            { path: 'auth/login', component: LoginComponent },
            { path: 'auth/register', component: RegisterComponent },
            {
                path: 'forgot-password',
                loadComponent: () => import('./features/public/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
            },
            {
                path: 'reset-password',
                loadComponent: () => import('./features/public/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
            },
            {
                path: 'checkout',
                loadComponent: () => import('./features/public/pages/checkout/checkout.component').then(m => m.CheckoutComponent)
            },
            {
                path: 'order-confirmation/:id',
                loadComponent: () => import('./features/public/pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/public/pages/profile/profile.component').then(m => m.ProfileComponent),
                canActivate: [authGuard]
            },
            {
                path: 'tickets/:id',
                loadComponent: () => import('./features/public/pages/ticket-view/ticket-view.component').then(m => m.TicketViewComponent),
                canActivate: [authGuard]
            },
            {
                path: 'tickets/:id',
                loadComponent: () => import('./features/public/pages/ticket-view/ticket-view.component').then(m => m.TicketViewComponent),
                canActivate: [authGuard]
            },
            {
                path: 'page/:slug',
                loadComponent: () => import('./features/public/pages/generic-page/generic-page.component').then(m => m.GenericPageViewComponent)
            },
        ]
    },

    // Admin Routes
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/layouts/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [adminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'events',
                loadComponent: () => import('./features/admin/pages/events-list/events-list.component').then(m => m.EventsListComponent)
            },
            {
                path: 'events/new',
                loadComponent: () => import('./features/admin/pages/event-form/event-form.component').then(m => m.EventFormComponent)
            },
            {
                path: 'events/edit/:id',
                loadComponent: () => import('./features/admin/pages/event-form/event-form.component').then(m => m.EventFormComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./features/admin/pages/orders-list/orders-list.component').then(m => m.OrdersListComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/admin/pages/users-list/users-list.component').then(m => m.UsersListComponent)
            },
            {
                path: 'users/new',
                loadComponent: () => import('./features/admin/pages/user-form/user-form.component').then(m => m.UserFormComponent)
            },
            {
                path: 'users/edit/:id',
                loadComponent: () => import('./features/admin/pages/user-form/user-form.component').then(m => m.UserFormComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./features/admin/pages/settings/settings.component').then(m => m.SettingsComponent)
            },
            {
                path: 'settings/logs',
                loadComponent: () => import('./features/admin/pages/email-logs/email-logs.component').then(m => m.EmailLogsComponent)
            },
            {
                path: 'settings/templates',
                loadComponent: () => import('./features/admin/pages/email-templates/email-templates.component').then(m => m.EmailTemplatesComponent)
            },
            {
                path: 'promos',
                loadComponent: () => import('./features/admin/pages/promo-codes/promo-codes.component').then(m => m.PromoCodesComponent)
            },
            {
                path: 'slider',
                loadComponent: () => import('./features/admin/pages/slider-manager/slider-manager.component').then(m => m.SliderManagerComponent)
            },
            {
                path: 'pages',
                loadComponent: () => import('./features/admin/pages/page-editor/page-editor.component').then(m => m.PageEditorComponent)
            },
            {
                path: 'venues',
                loadComponent: () => import('./features/admin/pages/venues-list/venues-list.component').then(m => m.VenuesListComponent)
            },
            {
                path: 'venues/new',
                loadComponent: () => import('./features/admin/pages/venue-form/venue-form.component').then(m => m.VenueFormComponent)
            },
            {
                path: 'venues/edit/:id',
                loadComponent: () => import('./features/admin/pages/venue-form/venue-form.component').then(m => m.VenueFormComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/admin/pages/admin-profile/admin-profile.component').then(m => m.AdminProfileComponent)
            },
        ]
    },

    // Catch all -> Redirect to Home
    { path: '**', redirectTo: '' }
];

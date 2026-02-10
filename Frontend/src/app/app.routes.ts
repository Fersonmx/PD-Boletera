import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './features/public/layouts/public-layout.component';
import { HomeComponent } from './features/public/pages/home/home.component';
import { LoginComponent } from './features/public/pages/login/login.component';
import { RegisterComponent } from './features/public/pages/register/register.component';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // Public Routes
    {
        path: '',
        component: PublicLayoutComponent,
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
                path: 'settings',
                loadComponent: () => import('./features/admin/pages/settings/settings.component').then(m => m.SettingsComponent)
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
        ]
    },

    // Catch all -> Redirect to Home
    { path: '**', redirectTo: '' }
];

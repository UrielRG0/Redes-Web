import { Routes } from '@angular/router';
import { LogIn } from './components/log-in/log-in';

export const routes: Routes = [
    { path: 'login', component: LogIn },
    { path: '**', component:LogIn}
];

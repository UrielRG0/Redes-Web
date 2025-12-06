import { Routes } from '@angular/router';
import { LogIn } from './components/log-in/log-in';
import { Feed } from './components/feed/feed';

export const routes: Routes = [
    { path: 'login', component: LogIn },
    { path:'home',component:Feed},
    { path: '**', component:LogIn}
];

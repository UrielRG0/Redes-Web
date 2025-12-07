import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';    
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  
  mostrarNavbar: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      
      // Usamos urlAfterRedirects para mayor precisión
      const urlActual = event.urlAfterRedirects || event.url;

      // --- CORRECCIÓN CLAVE ---
      // Definimos las rutas donde SI queremos ver la barra
      const rutasConNavbar = ['/home', '/perfil'];

      // Verificamos: ¿La URL actual incluye alguna de las rutas permitidas?
      // Esto devuelve true solo si estamos en home o perfil.
      // Si estamos en '/' o en '/login', devolverá false.
      const debeMostrar = rutasConNavbar.some(ruta => urlActual.includes(ruta));

      this.mostrarNavbar = debeMostrar;
    });
  }
}
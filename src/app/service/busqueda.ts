import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Busqueda {
  private terminoFuente = new BehaviorSubject<string>('');
  
  // Esta es la variable que escuchará el Feed
  terminoBusqueda$ = this.terminoFuente.asObservable();

  constructor() { }

  // Método que llamará el Navbar para actualizar el texto
  enviarBusqueda(termino: string) {
    this.terminoFuente.next(termino);
  }
}

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';   
import { RouterOutlet } from '@angular/router';
import { Usuario } from './service/usuario';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',standalone: true, 
  imports: [CommonModule, FormsModule,RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  
}

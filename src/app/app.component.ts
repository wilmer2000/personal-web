import { Component } from '@angular/core';
import { Hero } from './components/hero/hero.component';

@Component({
  selector: 'app-root',
  imports: [Hero],
  templateUrl: './app.component.html',
  styles: [],
})
export class App {}

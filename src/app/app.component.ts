import { Component } from '@angular/core';
import { Hero } from './components/hero/hero.component';
import { Info } from './components/info/info.component';
import { Aurora } from './components/aurora/aurora.component';

@Component({
  selector: 'app-root',
  imports: [Hero, Info, Aurora],
  templateUrl: './app.component.html',
  styles: [],
})
export class App {}

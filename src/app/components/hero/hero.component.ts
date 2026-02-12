import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Aurora } from '../aurora/aurora.component';

@Component({
  selector: 'app-hero',
  imports: [Aurora],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {}

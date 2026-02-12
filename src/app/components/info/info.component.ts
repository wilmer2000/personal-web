import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-info',
  imports: [],
  templateUrl: './info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Info {}

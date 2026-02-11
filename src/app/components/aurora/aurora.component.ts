import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-aurora',
  imports: [],
  template: ` <canvas #glCanvas></canvas> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Aurora {}

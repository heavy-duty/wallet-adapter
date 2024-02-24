import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent, RouterModule],
  selector: 'hd-root',
  template: `<hd-nx-welcome></hd-nx-welcome> <router-outlet></router-outlet>`,
  styles: ``,
})
export class AppComponent {
  title = 'headless-example';
}

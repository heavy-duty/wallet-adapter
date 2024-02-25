import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { HdWalletModalService } from './modal.service';
import { ButtonColor } from './types';

@Component({
  selector: 'hd-wallet-modal-button',
  template: `
    <button
      [color]="hdColor()"
      [disabled]="hdDisabled()"
      (click)="onOpen()"
      mat-raised-button
    >
      <ng-content></ng-content>

      @if (!children) {
        <ng-container>Select Wallet</ng-container>
      }
    </button>
  `,
  styles: [
    `
      button {
        display: inline-block;
      }

      .button-content {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButton],
})
export class HdWalletModalButtonComponent {
  private readonly _walletModalService = inject(HdWalletModalService);

  @ContentChild('children') children: ElementRef | null = null;

  readonly hdColor = input<ButtonColor>('primary');
  readonly hdDisabled = input(false);

  onOpen() {
    this._walletModalService.open();
  }
}

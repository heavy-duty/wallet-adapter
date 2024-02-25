import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import {
  HdSelectWalletDirective,
  HdWalletListItemComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { WalletName } from '@solana/wallet-adapter-base';

@Component({
  selector: 'hd-wallet-modal',
  template: `
    <header>
      <button
        (click)="onClose()"
        mat-icon-button
        aria-label="Close wallet adapter selection"
      >
        <mat-icon>close</mat-icon>
      </button>
      <h2>{{ hdSelectWalletDirective.message() }}</h2>
    </header>

    @if (hdSelectWalletDirective.installedWallets().length > 0) {
      <mat-selection-list
        [multiple]="false"
        (selectionChange)="onSelectionChange($event.options[0].value)"
      >
        @for (
          wallet of hdSelectWalletDirective.installedWallets();
          track wallet.adapter.name
        ) {
          <mat-list-option [value]="wallet.adapter.name">
            <hd-wallet-list-item [hdWallet]="wallet"></hd-wallet-list-item>
          </mat-list-option>
        }
        <mat-expansion-panel
          #expansionPanel="matExpansionPanel"
          class="mat-elevation-z0"
          disabled
        >
          <ng-template matExpansionPanelContent>
            @for (
              wallet of hdSelectWalletDirective.otherWallets();
              track wallet.adapter.name
            ) {
              <mat-list-option [value]="wallet.adapter.name">
                <hd-wallet-list-item [hdWallet]="wallet"></hd-wallet-list-item>
              </mat-list-option>
            }
          </ng-template>
        </mat-expansion-panel>
      </mat-selection-list>

      @if (hdSelectWalletDirective.otherWallets().length > 0) {
        <button
          class="toggle-expand"
          (click)="expansionPanel.toggle()"
          mat-button
        >
          <span>
            {{ expansionPanel.expanded ? 'Less options' : 'More options' }}
          </span>
          <mat-icon [ngClass]="{ expanded: expansionPanel.expanded }">
            expand_more
          </mat-icon>
        </button>
      }
    } @else {
      <button
        class="getting-started"
        (click)="
          onGettingStarted(
            hdSelectWalletDirective.getStartedWallet().adapter.name
          )
        "
        color="primary"
        mat-flat-button
      >
        Get started
      </button>

      <mat-expansion-panel
        #expansionPanel="matExpansionPanel"
        class="mat-elevation-z0"
        disabled
      >
        <ng-template matExpansionPanelContent>
          <mat-selection-list
            [multiple]="false"
            (selectionChange)="onSelectionChange($event.options[0].value)"
          >
            @for (
              wallet of hdSelectWalletDirective.otherWallets();
              track wallet.adapter.name
            ) {
              <mat-list-option [value]="wallet.adapter.name">
                <hd-wallet-list-item [hdWallet]="wallet"></hd-wallet-list-item>
              </mat-list-option>
            }
          </mat-selection-list>
        </ng-template>
      </mat-expansion-panel>

      @if (hdSelectWalletDirective.otherWallets().length > 0) {
        <button
          class="toggle-expand"
          (click)="expansionPanel.toggle()"
          mat-button
        >
          <span>
            {{
              expansionPanel.expanded
                ? 'Hide options'
                : 'Already have a wallet? View options'
            }}
          </span>
          <mat-icon [ngClass]="{ expanded: expansionPanel.expanded }">
            expand_more
          </mat-icon>
        </button>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .mat-dialog-title {
        margin: 0;
      }

      header {
        margin-bottom: 2.5rem;
      }

      header h2 {
        font-size: 1.5rem;
        text-align: center;
        padding: 0 3rem;
        font-weight: bold;
      }

      header button {
        display: block;
        margin-left: auto;
        margin-right: 1rem;
        margin-top: 1rem;
      }

      .getting-started {
        display: block;
        margin: 2rem auto;
      }

      .toggle-expand {
        display: flex;
        justify-content: space-between;
        margin: 1rem 1rem 1rem auto;
        align-items: center;
      }

      .toggle-expand span {
        margin: 0;
      }

      .toggle-expand mat-icon {
        transition: 500ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .toggle-expand mat-icon.expanded {
        transform: rotate(180deg);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgClass,
    MatIconButton,
    MatIcon,
    MatSelectionList,
    MatListOption,
    MatExpansionPanel,
    HdWalletListItemComponent,
  ],
  hostDirectives: [HdSelectWalletDirective],
})
export class HdWalletModalComponent {
  private readonly _dialogRef = inject(MatDialogRef);

  readonly hdSelectWalletDirective = inject(HdSelectWalletDirective);

  onSelectionChange(walletName: WalletName): void {
    this.hdSelectWalletDirective.run(walletName);
    this._dialogRef.close();
  }

  onGettingStarted(walletName: WalletName): void {
    this.hdSelectWalletDirective.run(walletName);
    this._dialogRef.close();
  }

  onClose(): void {
    this._dialogRef.close();
  }
}

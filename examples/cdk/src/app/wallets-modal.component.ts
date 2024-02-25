import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { injectWallets } from '@heavy-duty/wallet-adapter';
import { HdWalletIconComponent } from '@heavy-duty/wallet-adapter-cdk';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';

@Component({
  selector: 'hd-wallets-modal',
  template: `
    <div class="w-[450px] mx-auto border-2 border-black bg-white">
      <header class="p-16 relative">
        <h2 class="text-2xl text-center">
          {{ message() }}
        </h2>
        <button
          class="absolute top-2 right-2 hover:bg-zinc-200 p-2 border-2 border-black flex justify-center items-center"
          (click)="onClose()"
        >
          <span class="material-icons-outlined"> close </span>
        </button>
      </header>

      @if (installedWallets().length > 0) {
        <ul>
          @for (wallet of installedWallets(); track wallet.adapter.name) {
            <li>
              <button
                (click)="onSelectWallet(wallet.adapter.name)"
                class="flex items-center gap-4 px-8 py-4 w-full hover:bg-zinc-200"
              >
                <hd-wallet-icon [hdWallet]="wallet"></hd-wallet-icon>
                <span>{{ wallet.adapter.name }}</span>
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HdWalletIconComponent],
})
export class WalletsModalComponent {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _wallets = injectWallets();

  readonly installedWallets = computed(() =>
    this._wallets().filter(
      (wallet) => wallet.readyState === WalletReadyState.Installed
    )
  );
  readonly message = computed(() => {
    if (this.installedWallets().length > 0) {
      return 'Connect a wallet on Solana to continue';
    } else {
      return `You'll need a wallet on Solana to continue`;
    }
  });

  onSelectWallet(walletName: WalletName): void {
    this._dialogRef.close(walletName);
  }

  onClose(): void {
    this._dialogRef.close();
  }
}

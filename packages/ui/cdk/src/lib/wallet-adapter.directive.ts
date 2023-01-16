import {
  ChangeDetectorRef,
  Directive,
  inject,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Wallet, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
import { tap } from 'rxjs';

export class HdWalletAdapterContext {
  public $implicit!: unknown;
  public wallet!: Wallet | null;
  public connected!: boolean;
  public connecting!: boolean;
  public disconnecting!: boolean;
  public publicKey!: PublicKey | null;
  public wallets!: Wallet[];
}

interface Changes {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  wallet: Wallet | null;
  publicKey: PublicKey | null;
  wallets: Wallet[];
}

@Directive({
  selector: '[hdWalletAdapter]',
  standalone: true,
})
export class HdWalletAdapterDirective extends ComponentStore<object> {
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _templateRef = inject(TemplateRef<HdWalletAdapterContext>);
  private readonly _walletStore = inject(WalletStore);
  private readonly _changeDetectionRef = inject(ChangeDetectorRef);
  private _context: HdWalletAdapterContext = new HdWalletAdapterContext();
  private readonly _changes$ = this.select(
    this._walletStore.connected$,
    this._walletStore.connecting$,
    this._walletStore.disconnecting$,
    this._walletStore.wallet$,
    this._walletStore.publicKey$,
    this._walletStore.wallets$,
    (connected, connecting, disconnecting, wallet, publicKey, wallets) => ({
      connected,
      connecting,
      disconnecting,
      wallet,
      publicKey,
      wallets,
    })
  );

  constructor() {
    super({});
    this._viewContainerRef.createEmbeddedView(this._templateRef, this._context);
    this._handleChanges(this._changes$);
  }

  private readonly _handleChanges = this.effect<Changes>(
    tap(
      ({
        connected,
        connecting,
        disconnecting,
        wallet,
        publicKey,
        wallets,
      }) => {
        this._context.connected = connected;
        this._context.connecting = connecting;
        this._context.disconnecting = disconnecting;
        this._context.wallet = wallet;
        this._context.publicKey = publicKey;
        this._context.wallets = wallets;
        this._changeDetectionRef.markForCheck();
      }
    )
  );

  static ngTemplateContextGuard(
    _: HdWalletAdapterDirective,
    ctx: unknown
  ): ctx is HdWalletAdapterContext {
    return true;
  }
}

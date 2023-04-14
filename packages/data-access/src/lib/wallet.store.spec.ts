import { AnchorProvider } from '@coral-xyz/anchor';
import {
  Connection,
  Keypair,
  Message,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  PhantomWalletAdapter,
  PhantomWalletName,
} from './phantom-wallet-adapter.mock';
import { WalletStore } from './wallet.store';

describe('WalletStore', () => {
  const adapter = new PhantomWalletAdapter();
  const connection = new Connection('http://localhost:8899');

  it('should sign message', (done) => {
    const walletStore = new WalletStore({
      adapters: [adapter],
      autoConnect: false,
      localStorageKey: '',
    });

    walletStore.selectWallet(PhantomWalletName);
    walletStore.connect().subscribe();

    const message = new Uint8Array([]);
    const spy = jest.spyOn(adapter, 'signMessage');
    const signMessage$ = walletStore.signMessage(message);

    expect(signMessage$).toBeDefined();

    if (signMessage$ !== undefined) {
      signMessage$.subscribe(() => {
        expect(spy).toHaveBeenCalledWith(message);
        done();
      });
    } else {
      done();
    }
  });

  it('should sign legacy transaction', (done) => {
    const walletStore = new WalletStore({
      adapters: [adapter],
      autoConnect: false,
      localStorageKey: '',
    });

    walletStore.selectWallet(PhantomWalletName);
    walletStore.connect().subscribe();

    if (adapter.publicKey === null) {
      return;
    }

    const transaction = new Transaction({
      blockhash: '21312',
      lastValidBlockHeight: 1,
      feePayer: Keypair.generate().publicKey,
    }).add(
      new TransactionInstruction({
        keys: [
          {
            isSigner: false,
            isWritable: false,
            pubkey: adapter.publicKey,
          },
        ],
        programId: SystemProgram.programId,
        data: Buffer.from(new Uint8Array([])),
      })
    );

    const spy = jest.spyOn(adapter, 'signTransaction');
    const signTransaction$ = walletStore.signTransaction(transaction);

    expect(signTransaction$).toBeDefined();

    if (signTransaction$ !== undefined) {
      signTransaction$.subscribe(() => {
        expect(spy).toHaveBeenCalledWith(transaction);
        done();
      });
    } else {
      done();
    }
  });

  it('should sign versioned transaction', (done) => {
    const walletStore = new WalletStore({
      adapters: [adapter],
      autoConnect: false,
      localStorageKey: '',
    });

    walletStore.selectWallet(PhantomWalletName);
    walletStore.connect().subscribe();

    const transaction = new VersionedTransaction(
      new Message({
        accountKeys: [],
        header: {
          numReadonlySignedAccounts: 0,
          numReadonlyUnsignedAccounts: 0,
          numRequiredSignatures: 0,
        },
        instructions: [],
        recentBlockhash: '',
      })
    );
    const spy = jest.spyOn(adapter, 'signTransaction');
    const signTransaction$ = walletStore.signTransaction(transaction);

    expect(signTransaction$).toBeDefined();

    if (signTransaction$ !== undefined) {
      signTransaction$.subscribe(() => {
        expect(spy).toHaveBeenCalledWith(transaction);
        done();
      });
    } else {
      done();
    }
  });

  it('should sign legacy transactions', (done) => {
    const walletStore = new WalletStore({
      adapters: [adapter],
      autoConnect: false,
      localStorageKey: '',
    });

    walletStore.selectWallet(PhantomWalletName);
    walletStore.connect().subscribe();

    if (adapter.publicKey === null) {
      return;
    }

    const transaction = new Transaction({
      blockhash: '21312',
      lastValidBlockHeight: 1,
      feePayer: Keypair.generate().publicKey,
    }).add(
      new TransactionInstruction({
        keys: [
          {
            isSigner: false,
            isWritable: false,
            pubkey: adapter.publicKey,
          },
        ],
        programId: SystemProgram.programId,
        data: Buffer.from(new Uint8Array([])),
      })
    );

    const spy = jest.spyOn(adapter, 'signAllTransactions');
    const signAllTransactions$ = walletStore.signAllTransactions([transaction]);

    expect(signAllTransactions$).toBeDefined();

    if (signAllTransactions$ !== undefined) {
      signAllTransactions$.subscribe(() => {
        expect(spy).toHaveBeenCalledWith([transaction]);
        done();
      });
    } else {
      done();
    }
  });

  it('should sign versioned transactions', (done) => {
    const walletStore = new WalletStore({
      adapters: [adapter],
      autoConnect: false,
      localStorageKey: '',
    });

    walletStore.selectWallet(PhantomWalletName);
    walletStore.connect().subscribe();

    const transaction = new VersionedTransaction(
      new Message({
        accountKeys: [],
        header: {
          numReadonlySignedAccounts: 0,
          numReadonlyUnsignedAccounts: 0,
          numRequiredSignatures: 0,
        },
        instructions: [],
        recentBlockhash: '',
      })
    );
    const spy = jest.spyOn(adapter, 'signAllTransactions');
    const signAllTransactions$ = walletStore.signAllTransactions([transaction]);

    expect(signAllTransactions$).toBeDefined();

    if (signAllTransactions$ !== undefined) {
      signAllTransactions$.subscribe(() => {
        expect(spy).toHaveBeenCalledWith([transaction]);
        done();
      });
    } else {
      done();
    }
  });

  it('should send legacy transaction', (done) => {
    const walletStore = new WalletStore({
      adapters: [adapter],
      autoConnect: false,
      localStorageKey: '',
    });

    walletStore.selectWallet(PhantomWalletName);
    walletStore.connect().subscribe();

    const transaction = new Transaction();
    const spy = jest.spyOn(adapter, 'sendTransaction');

    walletStore.sendTransaction(transaction, connection).subscribe(() => {
      expect(spy).toHaveBeenCalledWith(transaction, connection, undefined);
      done();
    });
  });

  it('should send versioned transaction', (done) => {
    const walletStore = new WalletStore({
      adapters: [adapter],
      autoConnect: false,
      localStorageKey: '',
    });

    walletStore.selectWallet(PhantomWalletName);
    walletStore.connect().subscribe();

    const transaction = new VersionedTransaction(
      new Message({
        accountKeys: [],
        header: {
          numReadonlySignedAccounts: 0,
          numReadonlyUnsignedAccounts: 0,
          numRequiredSignatures: 0,
        },
        instructions: [],
        recentBlockhash: '',
      })
    );
    const spy = jest.spyOn(adapter, 'sendTransaction');
    walletStore.sendTransaction(transaction, connection).subscribe(() => {
      expect(spy).toHaveBeenCalledWith(transaction, connection, undefined);
      done();
    });
  });

  it('should create anchor provider from anchor wallet', (done) => {
    const walletStore = new WalletStore({
      adapters: [adapter],
      autoConnect: false,
      localStorageKey: '',
    });

    walletStore.selectWallet(PhantomWalletName);
    walletStore.connect().subscribe();

    walletStore.anchorWallet$.subscribe((anchorWallet) => {
      expect(anchorWallet).toBeDefined();

      if (anchorWallet !== undefined) {
        const provider = new AnchorProvider(
          connection,
          anchorWallet,
          AnchorProvider.defaultOptions()
        );

        expect(provider).toBeDefined();
      }

      done();
    });
  });
});

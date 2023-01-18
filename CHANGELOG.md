# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Note:** Version 0 of Semantic Versioning is handled differently from version 1 and above.
The minor version will be incremented upon a breaking change and the patch version will be incremented for features.

## [Unreleased]

### Features

- data-access: add `adapters` to `WalletConfig`.
- data-access: create `provideWalletAdapter` for standalone.
- docs: add README to the repository.
- raw-example: create a raw example app and added instructions on how to get there in the README.
- cdk: use `inject` instead of the `constructor` for DI.
- cdk: add `HdConnectWalletDirective` to give HTML elements the ability to connect the selected wallet.
- cdk: add `HdDisconnectWalletDirective` to give HTML elements the ability to disconnect the selected wallet.
- cdk: add `HdSelectWalletDirective` to give HTML elements the ability to select a wallet.
- cdk: add `HdSelectAndConnectWalletDirective` to give HTML elements the ability to select a wallet and connect to it.
- material: add `HdWalletModalTriggerDirective` to give HTML elements the ability to open the material select wallet modal.
- cdk-example: create a cdk example app and added instructions on how to get there in the README.
- material-example: create a material example app and added instructions on how to get there in the README.

### Breaking changes

- cdk: remove `HdWalletConnectButtonDirective`.
- cdk: remove `HdWalletDisconnectButtonDirective`.
- cdk: remove `HdWalletModalButtonDirective`.
- material: remove `HdWalletModalTriggerDirective`.
- cdk: remove `selectWallet` from `HdWalletAdapterDirective`
- cdk: add `hd` prefix to all elements.

## [0.5.1] - 2023-01-15

### Fixes

- core: Bump missing dependencies.

### Breaking Changes

- core: Give support to Angular 15.

## [0.4.0]

### Breaking Changes

- core: Give support to Angular 14.

## [0.3.2]

### Breaking Changes

- core: Give support to Angular 13.

## [0.2.2]

### Breaking Changes

- core: Give support to Angular 12.

## [0.1.1] - 2021-01-31

Initial release.

### Includes

- data-access: Library to support handling wallets in Angular applications.
- cdk: UI library that gives headless widgets for creating custom UIs with wallet integration.
- material: Angular Material library with common widgets for wallet integration.

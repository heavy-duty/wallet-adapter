import { Buffer } from 'buffer';
// import 'zone.js'; // Included with Angular CLI.

(window as any).global = window;
(window as any).global.Buffer = Buffer;
(window as any).process = {
  version: '',
  node: false,
  env: false,
};

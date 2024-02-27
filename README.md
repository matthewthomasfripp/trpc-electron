# trpc-electron

> [!NOTE]
> This is a fork of [jsonnull/electron-trpc](https://github.com/jsonnull/electron-trpc) for TRPC v11.x.x since that version introduces many breaking changes.

<p>
  <a href="https://www.npmjs.com/package/trpc-electron">
    <img alt="NPM" src="https://img.shields.io/npm/v/trpc-electron"/>
  </a>
  <a href="https://codecov.io/gh/mat-sz/trpc-electron"> 
  <img src="https://codecov.io/gh/mat-sz/trpc-electron/branch/main/graph/badge.svg?token=DU33O0D9LZ"/> 
  </a>
  <span>
    <img alt="MIT" src="https://img.shields.io/npm/l/trpc-electron"/>
  </span>
</p>

<p></p>

**Build IPC for Electron with tRPC**

- Expose APIs from Electron's main process to one or more render processes.
- Build fully type-safe IPC.
- Secure alternative to opening servers on localhost.
- Full support for queries, mutations, and subscriptions.

## Installation

```sh
# Using pnpm
pnpm add trpc-electron

# Using yarn
yarn add trpc-electron

# Using npm
npm install --save trpc-electron
```

## Basic Setup

1. Add your tRPC router to the Electron main process using `createIPCHandler`:

   ```ts
   import { app } from 'electron';
   import { createIPCHandler } from 'trpc-electron/main';
   import { router } from './api';

   app.on('ready', () => {
     const win = new BrowserWindow({
       webPreferences: {
         // Replace this path with the path to your preload file (see next step)
         preload: 'path/to/preload.js',
       },
     });

     createIPCHandler({ router, windows: [win] });
   });
   ```

2. Expose the IPC to the render process from the [preload file](https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts):

   ```ts
   import { exposeElectronTRPC } from 'trpc-electron/main';

   process.once('loaded', async () => {
     exposeElectronTRPC();
   });
   ```

   > Note: `trpc-electron` depends on `contextIsolation` being enabled, which is the default.

3. When creating the client in the render process, use the `ipcLink` (instead of the HTTP or batch HTTP links):

   ```ts
   import { createTRPCClient } from '@trpc/client';
   import { ipcLink } from 'trpc-electron/renderer';

   export const client = createTRPCClient({
     links: [ipcLink()],
   });
   ```

4. Now you can use the client in your render process as you normally would (e.g. using `@trpc/react`).

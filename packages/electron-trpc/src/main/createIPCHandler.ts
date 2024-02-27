import type { AnyTRPCRouter, inferRouterContext } from '@trpc/server';
import { Unsubscribable } from '@trpc/server/observable';
import { ipcMain } from 'electron';
import type { BrowserWindow, IpcMainEvent } from 'electron';

import { ELECTRON_TRPC_CHANNEL } from '../constants';
import { ETRPCRequest } from '../types';
import { handleIPCMessage } from './handleIPCMessage';
import { CreateContextOptions } from './types';

type MaybePromise<TType> = Promise<TType> | TType;

const getInternalId = (event: IpcMainEvent, request: ETRPCRequest) => {
  const messageId =
    request.method === 'request' ? request.operation.id : request.id;
  return `${event.sender.id}-${event.senderFrame.routingId}:${messageId}`;
};

class IPCHandler<TRouter extends AnyTRPCRouter> {
  #windows: BrowserWindow[] = [];
  #subscriptions: Map<string, Unsubscribable> = new Map();

  constructor({
    createContext,
    router,
    windows = [],
  }: {
    createContext?: (
      opts: CreateContextOptions
    ) => MaybePromise<inferRouterContext<TRouter>>;
    router: TRouter;
    windows?: BrowserWindow[];
  }) {
    windows.forEach(win => this.attachWindow(win));

    ipcMain.on(
      ELECTRON_TRPC_CHANNEL,
      (event: IpcMainEvent, request: ETRPCRequest) => {
        handleIPCMessage({
          router,
          createContext,
          internalId: getInternalId(event, request),
          event,
          message: request,
          subscriptions: this.#subscriptions,
        });
      }
    );
  }

  attachWindow(win: BrowserWindow) {
    if (this.#windows.includes(win)) {
      return;
    }

    this.#windows.push(win);
    this.#attachSubscriptionCleanupHandler(win);
  }

  detachWindow(win: BrowserWindow) {
    this.#windows = this.#windows.filter(w => w !== win);

    for (const [key, sub] of this.#subscriptions.entries()) {
      if (key.startsWith(`${win.webContents.id}-`)) {
        sub.unsubscribe();
        this.#subscriptions.delete(key);
      }
    }
  }

  #attachSubscriptionCleanupHandler(win: BrowserWindow) {
    win.webContents.on('destroyed', () => {
      this.detachWindow(win);
    });
  }
}

export const createIPCHandler = <TRouter extends AnyTRPCRouter>({
  createContext,
  router,
  windows = [],
}: {
  createContext?: (
    opts: CreateContextOptions
  ) => Promise<inferRouterContext<TRouter>>;
  router: TRouter;
  windows?: Electron.BrowserWindow[];
}) => {
  return new IPCHandler({ createContext, router, windows });
};

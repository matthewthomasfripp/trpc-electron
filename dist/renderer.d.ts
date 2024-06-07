// Generated by dts-bundle-generator v8.1.2

import { TRPCLink } from '@trpc/client';
import { TransformerOptions } from '@trpc/client/unstable-internals';
import { AnyTRPCRouter, inferTRPCClientTypes } from '@trpc/server';

export declare const ELECTRON_TRPC_CHANNEL = "trpc-electron";
export type IPCLinkOptions<TRouter extends AnyTRPCRouter> = TransformerOptions<inferTRPCClientTypes<TRouter>>;
export declare function ipcLink<TRouter extends AnyTRPCRouter>(opts?: IPCLinkOptions<TRouter>): TRPCLink<TRouter>;

export {};
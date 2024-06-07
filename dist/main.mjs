var D = (r, e, n) => {
  if (!e.has(r))
    throw TypeError("Cannot " + n);
};
var c = (r, e, n) => (D(r, e, "read from private field"), n ? n.call(r) : e.get(r)), R = (r, e, n) => {
  if (e.has(r))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(r) : e.set(r, n);
}, b = (r, e, n, t) => (D(r, e, "write to private field"), t ? t.call(r, n) : e.set(r, n), n);
var O = (r, e, n) => (D(r, e, "access private method"), n);
import { ipcMain as Y, contextBridge as $, ipcRenderer as A } from "electron";
const p = "trpc-electron";
function Q(r) {
  return !!r && !Array.isArray(r) && typeof r == "object";
}
class V extends Error {
}
function j(r) {
  if (r instanceof Error)
    return r;
  const e = typeof r;
  if (!(e === "undefined" || e === "function" || r === null)) {
    if (e !== "object")
      return new Error(String(r));
    if (Q(r)) {
      const n = new V();
      for (const t in r)
        n[t] = r[t];
      return n;
    }
  }
}
function y(r) {
  if (r instanceof N || r instanceof Error && r.name === "TRPCError")
    return r;
  const e = new N({
    code: "INTERNAL_SERVER_ERROR",
    cause: r
  });
  return r instanceof Error && r.stack && (e.stack = r.stack), e;
}
class N extends Error {
  constructor(e) {
    const n = j(e.cause), t = e.message ?? (n == null ? void 0 : n.message) ?? e.code;
    super(t, {
      cause: n
    }), this.code = e.code, this.name = "TRPCError", this.cause || (this.cause = n);
  }
}
const v = {
  /**
  * Invalid JSON was received by the server.
  * An error occurred on the server while parsing the JSON text.
  */
  PARSE_ERROR: -32700,
  /**
  * The JSON sent is not a valid Request object.
  */
  BAD_REQUEST: -32600,
  // Internal JSON-RPC error
  INTERNAL_SERVER_ERROR: -32603,
  NOT_IMPLEMENTED: -32603,
  // Implementation specific errors
  UNAUTHORIZED: -32001,
  FORBIDDEN: -32003,
  NOT_FOUND: -32004,
  METHOD_NOT_SUPPORTED: -32005,
  TIMEOUT: -32008,
  CONFLICT: -32009,
  PRECONDITION_FAILED: -32012,
  UNSUPPORTED_MEDIA_TYPE: -32015,
  PAYLOAD_TOO_LARGE: -32013,
  UNPROCESSABLE_CONTENT: -32022,
  TOO_MANY_REQUESTS: -32029,
  CLIENT_CLOSED_REQUEST: -32099
}, z = {
  PARSE_ERROR: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  METHOD_NOT_SUPPORTED: 405,
  TIMEOUT: 408,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501
};
function K(r) {
  return z[r] ?? 500;
}
function x(r) {
  return K(r.code);
}
function U(r) {
  const { path: e, error: n, config: t } = r, { code: o } = r.error, s = {
    message: n.message,
    code: v[o],
    data: {
      code: o,
      httpStatus: x(n)
    }
  };
  return t.isDev && typeof r.error.stack == "string" && (s.data.stack = r.error.stack), typeof e == "string" && (s.data.path = e), t.errorFormatter({
    ...r,
    shape: s
  });
}
function w(r, e) {
  return "error" in e ? {
    ...e,
    error: r.transformer.output.serialize(e.error)
  } : "data" in e.result ? {
    ...e,
    result: {
      ...e.result,
      data: r.transformer.output.serialize(e.result.data)
    }
  } : e;
}
function G(r, e) {
  return Array.isArray(e) ? e.map((n) => w(r, n)) : w(r, e);
}
function J(r) {
  return typeof r == "function";
}
function Z(r) {
  const { type: e, path: n } = r, t = r.procedures[n];
  if (!t || !J(t) || t._def.type !== e && !r.allowMethodOverride)
    throw new N({
      code: "NOT_FOUND",
      message: `No "${e}"-procedure on path "${n}"`
    });
  return t(r);
}
var L, M, m, F, k, H;
typeof window > "u" || "Deno" in window || // eslint-disable-next-line @typescript-eslint/dot-notation
((M = (L = globalThis.process) == null ? void 0 : L.env) == null ? void 0 : M.NODE_ENV) === "test" || (F = (m = globalThis.process) == null ? void 0 : m.env) != null && F.JEST_WORKER_ID || (H = (k = globalThis.process) == null ? void 0 : k.env) != null && H.VITEST_WORKER_ID;
function X(r) {
  return typeof r == "object" && r !== null && "subscribe" in r;
}
async function q({
  router: r,
  createContext: e,
  internalId: n,
  message: t,
  event: o,
  subscriptions: s
}) {
  if (t.method === "subscription.stop") {
    const i = s.get(n);
    if (!i)
      return;
    i.unsubscribe(), s.delete(n);
    return;
  }
  const { type: T, input: g, path: _, id: d } = t.operation, h = g ? r._def._config.transformer.input.deserialize(g) : void 0, C = await (e == null ? void 0 : e({ event: o })) ?? {}, u = (i) => {
    o.sender.isDestroyed() || o.reply(
      p,
      G(r._def._config, i)
    );
  };
  try {
    const i = await Z({
      ctx: C,
      path: _,
      procedures: r._def.procedures,
      getRawInput: async () => h,
      type: T
    });
    if (T !== "subscription") {
      u({
        id: d,
        result: {
          type: "data",
          data: i
        }
      });
      return;
    } else if (!X(i))
      throw new N({
        message: `Subscription ${_} did not return an observable`,
        code: "INTERNAL_SERVER_ERROR"
      });
    const I = i.subscribe({
      next(P) {
        u({
          id: d,
          result: {
            type: "data",
            data: P
          }
        });
      },
      error(P) {
        const W = y(P);
        u({
          id: d,
          error: U({
            config: r._def._config,
            error: W,
            type: T,
            path: _,
            input: h,
            ctx: C
          })
        });
      },
      complete() {
        u({
          id: d,
          result: {
            type: "stopped"
          }
        });
      }
    });
    s.set(n, I);
  } catch (i) {
    const I = y(i);
    return u({
      id: d,
      error: U({
        config: r._def._config,
        error: I,
        type: T,
        path: _,
        input: h,
        ctx: C
      })
    });
  }
}
const rr = (r, e) => {
  const n = e.method === "request" ? e.operation.id : e.id;
  return `${r.sender.id}-${r.senderFrame.routingId}:${n}`;
};
var E, a, f, S, l, B;
class er {
  constructor({
    createContext: e,
    router: n,
    windows: t = []
  }) {
    R(this, f);
    R(this, l);
    R(this, E, []);
    R(this, a, /* @__PURE__ */ new Map());
    t.forEach((o) => this.attachWindow(o)), Y.on(
      p,
      (o, s) => {
        q({
          router: n,
          createContext: e,
          internalId: rr(o, s),
          event: o,
          message: s,
          subscriptions: c(this, a)
        });
      }
    );
  }
  attachWindow(e) {
    c(this, E).includes(e) || (c(this, E).push(e), O(this, l, B).call(this, e));
  }
  detachWindow(e) {
    b(this, E, c(this, E).filter((n) => n !== e)), O(this, f, S).call(this, { webContentsId: e.webContents.id });
  }
}
E = new WeakMap(), a = new WeakMap(), f = new WeakSet(), S = function({
  webContentsId: e,
  frameRoutingId: n
}) {
  for (const [t, o] of c(this, a).entries())
    t.startsWith(`${e}-${n ?? ""}`) && (o.unsubscribe(), c(this, a).delete(t));
}, l = new WeakSet(), B = function(e) {
  e.webContents.on("did-start-navigation", ({ frame: n }) => {
    O(this, f, S).call(this, {
      webContentsId: e.webContents.id,
      frameRoutingId: n.routingId
    });
  }), e.webContents.on("destroyed", () => {
    this.detachWindow(e);
  });
};
const or = ({
  createContext: r,
  router: e,
  windows: n = []
}) => new er({ createContext: r, router: e, windows: n }), sr = () => {
  const r = {
    sendMessage: (e) => A.send(p, e),
    onMessage: (e) => A.on(p, (n, t) => e(t))
  };
  $.exposeInMainWorld("electronTRPC", r);
};
export {
  p as ELECTRON_TRPC_CHANNEL,
  or as createIPCHandler,
  sr as exposeElectronTRPC
};

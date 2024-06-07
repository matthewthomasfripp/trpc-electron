var g = (r, t, e) => {
  if (!t.has(r))
    throw TypeError("Cannot " + e);
};
var o = (r, t, e) => (g(r, t, "read from private field"), e ? e.call(r) : t.get(r)), h = (r, t, e) => {
  if (t.has(r))
    throw TypeError("Cannot add the same private member more than once");
  t instanceof WeakSet ? t.add(r) : t.set(r, e);
};
var R = (r, t, e) => (g(r, t, "access private method"), e);
const S = "trpc-electron";
function b(r) {
  const t = {
    subscribe(e) {
      let n = null, i = !1, u = !1, s = !1;
      function c() {
        if (n === null) {
          s = !0;
          return;
        }
        u || (u = !0, typeof n == "function" ? n() : n && n.unsubscribe());
      }
      return n = r({
        next(f) {
          var m;
          i || (m = e.next) == null || m.call(e, f);
        },
        error(f) {
          var m;
          i || (i = !0, (m = e.error) == null || m.call(e, f), c());
        },
        complete() {
          var f;
          i || (i = !0, (f = e.complete) == null || f.call(e), c());
        }
      }), s && c(), {
        unsubscribe: c
      };
    },
    pipe(...e) {
      return e.reduce(z, t);
    }
  };
  return t;
}
function z(r, t) {
  return t(r);
}
function E(r) {
  return !!r && !Array.isArray(r) && typeof r == "object";
}
class O extends Error {
}
function q(r) {
  if (r instanceof Error)
    return r;
  const t = typeof r;
  if (!(t === "undefined" || t === "function" || r === null)) {
    if (t !== "object")
      return new Error(String(r));
    if (E(r)) {
      const e = new O();
      for (const n in r)
        e[n] = r[n];
      return e;
    }
  }
}
var w, T, C, p, k, P;
typeof window > "u" || "Deno" in window || // eslint-disable-next-line @typescript-eslint/dot-notation
((T = (w = globalThis.process) == null ? void 0 : w.env) == null ? void 0 : T.NODE_ENV) === "test" || (p = (C = globalThis.process) == null ? void 0 : C.env) != null && p.JEST_WORKER_ID || (P = (k = globalThis.process) == null ? void 0 : k.env) != null && P.VITEST_WORKER_ID;
function D(r) {
  return r instanceof l || /**
  * @deprecated
  * Delete in next major
  */
  r instanceof Error && r.name === "TRPCClientError";
}
function I(r) {
  return E(r) && E(r.error) && typeof r.error.code == "number" && typeof r.error.message == "string";
}
class l extends Error {
  static from(t, e = {}) {
    const n = t;
    return D(n) ? (e.meta && (n.meta = {
      ...n.meta,
      ...e.meta
    }), n) : I(n) ? new l(n.error.message, {
      ...e,
      result: n
    }) : n instanceof Error ? new l(n.message, {
      ...e,
      cause: q(n)
    }) : new l("Unknown error", {
      ...e,
      cause: n
    });
  }
  constructor(t, e) {
    var i, u;
    const n = e == null ? void 0 : e.cause;
    super(t, {
      cause: n
    }), this.meta = e == null ? void 0 : e.meta, this.cause = n, this.shape = (i = e == null ? void 0 : e.result) == null ? void 0 : i.error, this.data = (u = e == null ? void 0 : e.result) == null ? void 0 : u.error.data, this.name = "TRPCClientError", Object.setPrototypeOf(this, l.prototype);
  }
}
function N(r) {
  const t = r;
  return t ? "input" in t ? t : {
    input: t,
    output: t
  } : {
    input: {
      serialize: (e) => e,
      deserialize: (e) => e
    },
    output: {
      serialize: (e) => e,
      deserialize: (e) => e
    }
  };
}
function M(r, t) {
  if ("error" in r) {
    const n = t.deserialize(
      r.error
    );
    return {
      ok: !1,
      error: {
        ...r,
        error: n
      }
    };
  }
  return { ok: !0, result: {
    ...r.result,
    ...(!r.result.type || r.result.type === "data") && {
      type: "data",
      data: t.deserialize(r.result.data)
    }
  } };
}
const _ = () => {
  const r = globalThis.electronTRPC;
  if (!r)
    throw new Error(
      "Could not find `electronTRPC` global. Check that `exposeElectronTRPC` has been called in your preload file."
    );
  return r;
};
var a, d, y, x;
class A {
  constructor() {
    h(this, y);
    h(this, a, /* @__PURE__ */ new Map());
    h(this, d, _());
    o(this, d).onMessage((t) => {
      R(this, y, x).call(this, t);
    });
  }
  request(t, e) {
    const { type: n, id: i } = t;
    return o(this, a).set(i, {
      type: n,
      callbacks: e,
      op: t
    }), o(this, d).sendMessage({ method: "request", operation: t }), () => {
      var s;
      const u = (s = o(this, a).get(i)) == null ? void 0 : s.callbacks;
      o(this, a).delete(i), u == null || u.complete(), n === "subscription" && o(this, d).sendMessage({
        id: i,
        method: "subscription.stop"
      });
    };
  }
}
a = new WeakMap(), d = new WeakMap(), y = new WeakSet(), x = function(t) {
  const e = t.id && o(this, a).get(t.id);
  e && (e.callbacks.next(t), "result" in t && t.result.type === "stopped" && e.callbacks.complete());
};
function U(r) {
  return () => {
    const t = new A(), e = N(r == null ? void 0 : r.transformer);
    return ({ op: n }) => b((i) => {
      n.input = e.input.serialize(n.input);
      const u = t.request(n, {
        error(s) {
          i.error(s), u();
        },
        complete() {
          i.complete();
        },
        next(s) {
          const c = M(s, e.output);
          if (!c.ok) {
            i.error(l.from(c.error));
            return;
          }
          i.next({ result: c.result }), n.type !== "subscription" && (u(), i.complete());
        }
      });
      return () => {
        u();
      };
    });
  };
}
export {
  S as ELECTRON_TRPC_CHANNEL,
  U as ipcLink
};

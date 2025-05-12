const w = "0.21.0";
let U = !1, R, W, V, I, G, J, K, Q, z;
function Ee(r, e = { auto: !1 }) {
  if (U)
    throw new Error(`you must \`import 'groq-sdk/shims/${r.kind}'\` before importing anything else from groq-sdk`);
  if (R)
    throw new Error(`can't \`import 'groq-sdk/shims/${r.kind}'\` after \`import 'groq-sdk/shims/${R}'\``);
  U = e.auto, R = r.kind, W = r.fetch, V = r.FormData, I = r.File, G = r.ReadableStream, J = r.getMultipartRequestOptions, K = r.getDefaultAgent, Q = r.fileFromPath, z = r.isFsReadStream;
}
class Ae {
  constructor(e) {
    this.body = e;
  }
  get [Symbol.toStringTag]() {
    return "MultipartBody";
  }
}
function ke({ manuallyImported: r } = {}) {
  const e = r ? "You may need to use polyfills" : "Add one of these imports before your first `import … from 'groq-sdk'`:\n- `import 'groq-sdk/shims/node'` (if you're running on Node)\n- `import 'groq-sdk/shims/web'` (otherwise)\n";
  let t, n, s, o;
  try {
    t = fetch, n = Request, s = Response, o = Headers;
  } catch (i) {
    throw new Error(`this environment is missing the following Web Fetch API type: ${i.message}. ${e}`);
  }
  return {
    kind: "web",
    fetch: t,
    Request: n,
    Response: s,
    Headers: o,
    FormData: (
      // @ts-ignore
      typeof FormData < "u" ? FormData : class {
        // @ts-ignore
        constructor() {
          throw new Error(`file uploads aren't supported in this environment yet as 'FormData' is undefined. ${e}`);
        }
      }
    ),
    Blob: typeof Blob < "u" ? Blob : class {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'Blob' is undefined. ${e}`);
      }
    },
    File: (
      // @ts-ignore
      typeof File < "u" ? File : class {
        // @ts-ignore
        constructor() {
          throw new Error(`file uploads aren't supported in this environment yet as 'File' is undefined. ${e}`);
        }
      }
    ),
    ReadableStream: (
      // @ts-ignore
      typeof ReadableStream < "u" ? ReadableStream : class {
        // @ts-ignore
        constructor() {
          throw new Error(`streaming isn't supported in this environment yet as 'ReadableStream' is undefined. ${e}`);
        }
      }
    ),
    getMultipartRequestOptions: async (i, a) => ({
      ...a,
      body: new Ae(i)
    }),
    getDefaultAgent: (i) => {
    },
    fileFromPath: () => {
      throw new Error("The `fileFromPath` function is only supported in Node. See the README for more details: https://www.github.com/groq/groq-typescript#file-uploads");
    },
    isFsReadStream: (i) => !1
  };
}
const Y = () => {
  R || Ee(ke(), { auto: !0 });
};
Y();
class p extends Error {
}
class l extends p {
  constructor(e, t, n, s) {
    super(`${l.makeMessage(e, t, n)}`), this.status = e, this.headers = s, this.error = t;
  }
  static makeMessage(e, t, n) {
    const s = t?.message ? typeof t.message == "string" ? t.message : JSON.stringify(t.message) : t ? JSON.stringify(t) : n;
    return e && s ? `${e} ${s}` : e ? `${e} status code (no body)` : s || "(no status code or body)";
  }
  static generate(e, t, n, s) {
    if (!e || !s)
      return new k({ message: n, cause: O(t) });
    const o = t;
    return e === 400 ? new ee(e, o, n, s) : e === 401 ? new te(e, o, n, s) : e === 403 ? new re(e, o, n, s) : e === 404 ? new ne(e, o, n, s) : e === 409 ? new se(e, o, n, s) : e === 422 ? new oe(e, o, n, s) : e === 429 ? new ie(e, o, n, s) : e >= 500 ? new ae(e, o, n, s) : new l(e, o, n, s);
  }
}
class B extends l {
  constructor({ message: e } = {}) {
    super(void 0, void 0, e || "Request was aborted.", void 0);
  }
}
class k extends l {
  constructor({ message: e, cause: t }) {
    super(void 0, void 0, e || "Connection error.", void 0), t && (this.cause = t);
  }
}
class Z extends k {
  constructor({ message: e } = {}) {
    super({ message: e ?? "Request timed out." });
  }
}
class ee extends l {
}
class te extends l {
}
class re extends l {
}
class ne extends l {
}
class se extends l {
}
class oe extends l {
}
class ie extends l {
}
class ae extends l {
}
class g {
  constructor(e, t) {
    this.iterator = e, this.controller = t;
  }
  static fromSSEResponse(e, t) {
    let n = !1;
    const s = new Pe();
    async function* o() {
      if (!e.body)
        throw t.abort(), new p("Attempted to iterate over a response with no body");
      const a = new m(), u = T(e.body);
      for await (const c of u)
        for (const d of a.decode(c)) {
          const h = s.decode(d);
          h && (yield h);
        }
      for (const c of a.flush()) {
        const d = s.decode(c);
        d && (yield d);
      }
    }
    async function* i() {
      if (n)
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      n = !0;
      let a = !1;
      try {
        for await (const u of o())
          if (!a) {
            if (u.data.startsWith("[DONE]")) {
              a = !0;
              continue;
            }
            if (u.event === null || u.event === "error") {
              let c;
              try {
                c = JSON.parse(u.data);
              } catch (d) {
                throw console.error("Could not parse message into JSON:", u.data), console.error("From chunk:", u.raw), d;
              }
              if (c && c.error)
                throw new l(c.error.status_code, c.error, c.error.message, void 0);
              yield c;
            }
          }
        a = !0;
      } catch (u) {
        if (u instanceof Error && u.name === "AbortError")
          return;
        throw u;
      } finally {
        a || t.abort();
      }
    }
    return new g(i, t);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(e, t) {
    let n = !1;
    async function* s() {
      const i = new m(), a = T(e);
      for await (const u of a)
        for (const c of i.decode(u))
          yield c;
      for (const u of i.flush())
        yield u;
    }
    async function* o() {
      if (n)
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      n = !0;
      let i = !1;
      try {
        for await (const a of s())
          i || a && (yield JSON.parse(a));
        i = !0;
      } catch (a) {
        if (a instanceof Error && a.name === "AbortError")
          return;
        throw a;
      } finally {
        i || t.abort();
      }
    }
    return new g(o, t);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const e = [], t = [], n = this.iterator(), s = (o) => ({
      next: () => {
        if (o.length === 0) {
          const i = n.next();
          e.push(i), t.push(i);
        }
        return o.shift();
      }
    });
    return [
      new g(() => s(e), this.controller),
      new g(() => s(t), this.controller)
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const e = this;
    let t;
    const n = new TextEncoder();
    return new G({
      async start() {
        t = e[Symbol.asyncIterator]();
      },
      async pull(s) {
        try {
          const { value: o, done: i } = await t.next();
          if (i)
            return s.close();
          const a = n.encode(JSON.stringify(o) + `
`);
          s.enqueue(a);
        } catch (o) {
          s.error(o);
        }
      },
      async cancel() {
        await t.return?.();
      }
    });
  }
}
class Pe {
  constructor() {
    this.event = null, this.data = [], this.chunks = [];
  }
  decode(e) {
    if (e.endsWith("\r") && (e = e.substring(0, e.length - 1)), !e) {
      if (!this.event && !this.data.length)
        return null;
      const o = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      return this.event = null, this.data = [], this.chunks = [], o;
    }
    if (this.chunks.push(e), e.startsWith(":"))
      return null;
    let [t, n, s] = qe(e, ":");
    return s.startsWith(" ") && (s = s.substring(1)), t === "event" ? this.event = s : t === "data" && this.data.push(s), null;
  }
}
class m {
  constructor() {
    this.buffer = [], this.trailingCR = !1;
  }
  decode(e) {
    let t = this.decodeText(e);
    if (this.trailingCR && (t = "\r" + t, this.trailingCR = !1), t.endsWith("\r") && (this.trailingCR = !0, t = t.slice(0, -1)), !t)
      return [];
    const n = m.NEWLINE_CHARS.has(t[t.length - 1] || "");
    let s = t.split(m.NEWLINE_REGEXP);
    return s.length === 1 && !n ? (this.buffer.push(s[0]), []) : (this.buffer.length > 0 && (s = [this.buffer.join("") + s[0], ...s.slice(1)], this.buffer = []), n || (this.buffer = [s.pop() || ""]), s);
  }
  decodeText(e) {
    if (e == null)
      return "";
    if (typeof e == "string")
      return e;
    if (typeof Buffer < "u") {
      if (e instanceof Buffer)
        return e.toString();
      if (e instanceof Uint8Array)
        return Buffer.from(e).toString();
      throw new p(`Unexpected: received non-Uint8Array (${e.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
    }
    if (typeof TextDecoder < "u") {
      if (e instanceof Uint8Array || e instanceof ArrayBuffer)
        return this.textDecoder ?? (this.textDecoder = new TextDecoder("utf8")), this.textDecoder.decode(e);
      throw new p(`Unexpected: received non-Uint8Array/ArrayBuffer (${e.constructor.name}) in a web platform. Please report this error.`);
    }
    throw new p("Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.");
  }
  flush() {
    if (!this.buffer.length && !this.trailingCR)
      return [];
    const e = [this.buffer.join("")];
    return this.buffer = [], this.trailingCR = !1, e;
  }
}
m.NEWLINE_CHARS = /* @__PURE__ */ new Set([`
`, "\r", "\v", "\f", "", "", "", "", "\u2028", "\u2029"]);
m.NEWLINE_REGEXP = /\r\n|[\n\r\x0b\x0c\x1c\x1d\x1e\x85\u2028\u2029]/g;
function qe(r, e) {
  const t = r.indexOf(e);
  return t !== -1 ? [r.substring(0, t), e, r.substring(t + e.length)] : [r, "", ""];
}
function T(r) {
  if (r[Symbol.asyncIterator])
    return r;
  const e = r.getReader();
  return {
    async next() {
      try {
        const t = await e.read();
        return t?.done && e.releaseLock(), t;
      } catch (t) {
        throw e.releaseLock(), t;
      }
    },
    async return() {
      const t = e.cancel();
      return e.releaseLock(), await t, { done: !0, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
const ue = (r) => r != null && typeof r == "object" && typeof r.url == "string" && typeof r.blob == "function", ce = (r) => r != null && typeof r == "object" && typeof r.name == "string" && typeof r.lastModified == "number" && P(r), P = (r) => r != null && typeof r == "object" && typeof r.size == "number" && typeof r.type == "string" && typeof r.text == "function" && typeof r.slice == "function" && typeof r.arrayBuffer == "function", _e = (r) => ce(r) || ue(r) || z(r);
async function fe(r, e, t) {
  if (r = await r, ce(r))
    return r;
  if (ue(r)) {
    const s = await r.blob();
    e || (e = new URL(r.url).pathname.split(/[\\/]/).pop() ?? "unknown_file");
    const o = P(s) ? [await s.arrayBuffer()] : [s];
    return new I(o, e, t);
  }
  const n = await $e(r);
  if (e || (e = Ie(r) ?? "unknown_file"), !t?.type) {
    const s = n[0]?.type;
    typeof s == "string" && (t = { ...t, type: s });
  }
  return new I(n, e, t);
}
async function $e(r) {
  let e = [];
  if (typeof r == "string" || ArrayBuffer.isView(r) || // includes Uint8Array, Buffer, etc.
  r instanceof ArrayBuffer)
    e.push(r);
  else if (P(r))
    e.push(await r.arrayBuffer());
  else if (Be(r))
    for await (const t of r)
      e.push(t);
  else
    throw new Error(`Unexpected data type: ${typeof r}; constructor: ${r?.constructor?.name}; props: ${Ce(r)}`);
  return e;
}
function Ce(r) {
  return `[${Object.getOwnPropertyNames(r).map((t) => `"${t}"`).join(", ")}]`;
}
function Ie(r) {
  return $(r.name) || $(r.filename) || // For fs.ReadStream
  $(r.path)?.split(/[\\/]/).pop();
}
const $ = (r) => {
  if (typeof r == "string")
    return r;
  if (typeof Buffer < "u" && r instanceof Buffer)
    return String(r);
}, Be = (r) => r != null && typeof r == "object" && typeof r[Symbol.asyncIterator] == "function", j = (r) => r && typeof r == "object" && r.body && r[Symbol.toStringTag] === "MultipartBody", F = async (r) => {
  const e = await De(r.body);
  return J(e, r);
}, De = async (r) => {
  const e = new V();
  return await Promise.all(Object.entries(r || {}).map(([t, n]) => D(e, t, n))), e;
}, D = async (r, e, t) => {
  if (t !== void 0) {
    if (t == null)
      throw new TypeError(`Received null for "${e}"; to pass null in FormData, you must use the string 'null'`);
    if (typeof t == "string" || typeof t == "number" || typeof t == "boolean")
      r.append(e, String(t));
    else if (_e(t)) {
      const n = await fe(t);
      r.append(e, n);
    } else if (Array.isArray(t))
      await Promise.all(t.map((n) => D(r, e + "[]", n)));
    else if (typeof t == "object")
      await Promise.all(Object.entries(t).map(([n, s]) => D(r, `${e}[${n}]`, s)));
    else
      throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${t} instead`);
  }
};
Y();
async function le(r) {
  const { response: e } = r;
  if (r.options.stream)
    return b("response", e.status, e.url, e.headers, e.body), r.options.__streamClass ? r.options.__streamClass.fromSSEResponse(e, r.controller) : g.fromSSEResponse(e, r.controller);
  if (e.status === 204)
    return null;
  if (r.options.__binaryResponse)
    return e;
  const n = e.headers.get("content-type")?.split(";")[0]?.trim();
  if (n?.includes("application/json") || n?.endsWith("+json")) {
    const i = await e.json();
    return b("response", e.status, e.url, e.headers, i), i;
  }
  const o = await e.text();
  return b("response", e.status, e.url, e.headers, o), o;
}
class q extends Promise {
  constructor(e, t = le) {
    super((n) => {
      n(null);
    }), this.responsePromise = e, this.parseResponse = t;
  }
  _thenUnwrap(e) {
    return new q(this.responsePromise, async (t) => e(await this.parseResponse(t), t));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'groq-sdk'`:
   * - `import 'groq-sdk/shims/node'` (if you're running on Node)
   * - `import 'groq-sdk/shims/web'` (otherwise)
   */
  asResponse() {
    return this.responsePromise.then((e) => e.response);
  }
  /**
   * Gets the parsed response data and the raw `Response` instance.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'groq-sdk'`:
   * - `import 'groq-sdk/shims/node'` (if you're running on Node)
   * - `import 'groq-sdk/shims/web'` (otherwise)
   */
  async withResponse() {
    const [e, t] = await Promise.all([this.parse(), this.asResponse()]);
    return { data: e, response: t };
  }
  parse() {
    return this.parsedPromise || (this.parsedPromise = this.responsePromise.then(this.parseResponse)), this.parsedPromise;
  }
  then(e, t) {
    return this.parse().then(e, t);
  }
  catch(e) {
    return this.parse().catch(e);
  }
  finally(e) {
    return this.parse().finally(e);
  }
}
class Oe {
  constructor({
    baseURL: e,
    maxRetries: t = 2,
    timeout: n = 6e4,
    // 1 minute
    httpAgent: s,
    fetch: o
  }) {
    this.baseURL = e, this.maxRetries = C("maxRetries", t), this.timeout = C("timeout", n), this.httpAgent = s, this.fetch = o ?? W;
  }
  authHeaders(e) {
    return {};
  }
  /**
   * Override this to add your own default headers, for example:
   *
   *  {
   *    ...super.defaultHeaders(),
   *    Authorization: 'Bearer 123',
   *  }
   */
  defaultHeaders(e) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": this.getUserAgent(),
      ...je(),
      ...this.authHeaders(e)
    };
  }
  /**
   * Override this to add your own headers validation:
   */
  validateHeaders(e, t) {
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${Ve()}`;
  }
  get(e, t) {
    return this.methodRequest("get", e, t);
  }
  post(e, t) {
    return this.methodRequest("post", e, t);
  }
  patch(e, t) {
    return this.methodRequest("patch", e, t);
  }
  put(e, t) {
    return this.methodRequest("put", e, t);
  }
  delete(e, t) {
    return this.methodRequest("delete", e, t);
  }
  methodRequest(e, t, n) {
    return this.request(Promise.resolve(n).then(async (s) => {
      const o = s && P(s?.body) ? new DataView(await s.body.arrayBuffer()) : s?.body instanceof DataView ? s.body : s?.body instanceof ArrayBuffer ? new DataView(s.body) : s && ArrayBuffer.isView(s?.body) ? new DataView(s.body.buffer) : s?.body;
      return { method: e, path: t, ...s, body: o };
    }));
  }
  getAPIList(e, t, n) {
    return this.requestAPIList(t, { method: "get", path: e, ...n });
  }
  calculateContentLength(e) {
    if (typeof e == "string") {
      if (typeof Buffer < "u")
        return Buffer.byteLength(e, "utf8").toString();
      if (typeof TextEncoder < "u")
        return new TextEncoder().encode(e).length.toString();
    } else if (ArrayBuffer.isView(e))
      return e.byteLength.toString();
    return null;
  }
  buildRequest(e, { retryCount: t = 0 } = {}) {
    const n = { ...e }, { method: s, path: o, query: i, headers: a = {} } = n, u = ArrayBuffer.isView(n.body) || n.__binaryRequest && typeof n.body == "string" ? n.body : j(n.body) ? n.body.body : n.body ? JSON.stringify(n.body, null, 2) : null, c = this.calculateContentLength(u), d = this.buildURL(o, i);
    "timeout" in n && C("timeout", n.timeout), n.timeout = n.timeout ?? this.timeout;
    const h = n.httpAgent ?? this.httpAgent ?? K(d), x = n.timeout + 1e3;
    typeof h?.options?.timeout == "number" && x > (h.options.timeout ?? 0) && (h.options.timeout = x), this.idempotencyHeader && s !== "get" && (e.idempotencyKey || (e.idempotencyKey = this.defaultIdempotencyKey()), a[this.idempotencyHeader] = e.idempotencyKey);
    const E = this.buildHeaders({ options: n, headers: a, contentLength: c, retryCount: t });
    return { req: {
      method: s,
      ...u && { body: u },
      headers: E,
      ...h && { agent: h },
      // @ts-ignore node-fetch uses a custom AbortSignal type that is
      // not compatible with standard web types
      signal: n.signal ?? null
    }, url: d, timeout: n.timeout };
  }
  buildHeaders({ options: e, headers: t, contentLength: n, retryCount: s }) {
    const o = {};
    n && (o["content-length"] = n);
    const i = this.defaultHeaders(e);
    return X(o, i), X(o, t), j(e.body) && R !== "node" && delete o["content-type"], A(i, "x-stainless-retry-count") === void 0 && A(t, "x-stainless-retry-count") === void 0 && (o["x-stainless-retry-count"] = String(s)), A(i, "x-stainless-timeout") === void 0 && A(t, "x-stainless-timeout") === void 0 && e.timeout && (o["x-stainless-timeout"] = String(Math.trunc(e.timeout / 1e3))), this.validateHeaders(o, t), o;
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(e) {
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(e, { url: t, options: n }) {
  }
  parseHeaders(e) {
    return e ? Symbol.iterator in e ? Object.fromEntries(Array.from(e).map((t) => [...t])) : { ...e } : {};
  }
  makeStatusError(e, t, n, s) {
    return l.generate(e, t, n, s);
  }
  request(e, t = null) {
    return new q(this.makeRequest(e, t));
  }
  async makeRequest(e, t) {
    const n = await e, s = n.maxRetries ?? this.maxRetries;
    t == null && (t = s), await this.prepareOptions(n);
    const { req: o, url: i, timeout: a } = this.buildRequest(n, { retryCount: s - t });
    if (await this.prepareRequest(o, { url: i, options: n }), b("request", i, n, o.headers), n.signal?.aborted)
      throw new B();
    const u = new AbortController(), c = await this.fetchWithTimeout(i, o, a, u).catch(O);
    if (c instanceof Error) {
      if (n.signal?.aborted)
        throw new B();
      if (t)
        return this.retryRequest(n, t);
      throw c.name === "AbortError" ? new Z() : new k({ cause: c });
    }
    const d = Le(c.headers);
    if (!c.ok) {
      if (t && this.shouldRetry(c)) {
        const _ = `retrying, ${t} attempts remaining`;
        return b(`response (error; ${_})`, c.status, i, d), this.retryRequest(n, t, d);
      }
      const h = await c.text().catch((_) => O(_).message), x = Ne(h), E = x ? void 0 : h;
      throw b(`response (error; ${t ? "(error; no more retries left)" : "(error; not retryable)"})`, c.status, i, d, E), this.makeStatusError(c.status, x, E, d);
    }
    return { response: c, options: n, controller: u };
  }
  requestAPIList(e, t) {
    const n = this.makeRequest(t, null);
    return new Fe(this, n, e);
  }
  buildURL(e, t) {
    const n = Me(e) ? new URL(e) : new URL(this.baseURL + (this.baseURL.endsWith("/") && e.startsWith("/") ? e.slice(1) : e)), s = this.defaultQuery();
    return Xe(s) || (t = { ...s, ...t }), typeof t == "object" && t && !Array.isArray(t) && (n.search = this.stringifyQuery(t)), n.toString();
  }
  stringifyQuery(e) {
    return Object.entries(e).filter(([t, n]) => typeof n < "u").map(([t, n]) => {
      if (typeof n == "string" || typeof n == "number" || typeof n == "boolean")
        return `${encodeURIComponent(t)}=${encodeURIComponent(n)}`;
      if (n === null)
        return `${encodeURIComponent(t)}=`;
      throw new p(`Cannot stringify type ${typeof n}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join("&");
  }
  async fetchWithTimeout(e, t, n, s) {
    const { signal: o, ...i } = t || {};
    o && o.addEventListener("abort", () => s.abort());
    const a = setTimeout(() => s.abort(), n), u = {
      signal: s.signal,
      ...i
    };
    return u.method && (u.method = u.method.toUpperCase()), // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
    this.fetch.call(void 0, e, u).finally(() => {
      clearTimeout(a);
    });
  }
  shouldRetry(e) {
    const t = e.headers.get("x-should-retry");
    return t === "true" ? !0 : t === "false" ? !1 : e.status === 408 || e.status === 409 || e.status === 429 || e.status >= 500;
  }
  async retryRequest(e, t, n) {
    let s;
    const o = n?.["retry-after-ms"];
    if (o) {
      const a = parseFloat(o);
      Number.isNaN(a) || (s = a);
    }
    const i = n?.["retry-after"];
    if (i && !s) {
      const a = parseFloat(i);
      Number.isNaN(a) ? s = Date.parse(i) - Date.now() : s = a * 1e3;
    }
    if (!(s && 0 <= s && s < 60 * 1e3)) {
      const a = e.maxRetries ?? this.maxRetries;
      s = this.calculateDefaultRetryTimeoutMillis(t, a);
    }
    return await ve(s), this.makeRequest(e, t - 1);
  }
  calculateDefaultRetryTimeoutMillis(e, t) {
    const o = t - e, i = Math.min(0.5 * Math.pow(2, o), 8), a = 1 - Math.random() * 0.25;
    return i * a * 1e3;
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${w}`;
  }
}
class Fe extends q {
  constructor(e, t, n) {
    super(t, async (s) => new n(e, s.response, await le(s), s.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const e = await this;
    for await (const t of e)
      yield t;
  }
}
const Le = (r) => new Proxy(Object.fromEntries(
  // @ts-ignore
  r.entries()
), {
  get(e, t) {
    const n = t.toString();
    return e[n.toLowerCase()] || e[n];
  }
}), Ue = () => {
  if (typeof Deno < "u" && Deno.build != null)
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": w,
      "X-Stainless-OS": H(Deno.build.os),
      "X-Stainless-Arch": N(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version == "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  if (typeof EdgeRuntime < "u")
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": w,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": process.version
    };
  if (Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]")
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": w,
      "X-Stainless-OS": H(process.platform),
      "X-Stainless-Arch": N(process.arch),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": process.version
    };
  const r = Te();
  return r ? {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": w,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": `browser:${r.browser}`,
    "X-Stainless-Runtime-Version": r.version
  } : {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": w,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function Te() {
  if (typeof navigator > "u" || !navigator)
    return null;
  const r = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key: e, pattern: t } of r) {
    const n = t.exec(navigator.userAgent);
    if (n) {
      const s = n[1] || 0, o = n[2] || 0, i = n[3] || 0;
      return { browser: e, version: `${s}.${o}.${i}` };
    }
  }
  return null;
}
const N = (r) => r === "x32" ? "x32" : r === "x86_64" || r === "x64" ? "x64" : r === "arm" ? "arm" : r === "aarch64" || r === "arm64" ? "arm64" : r ? `other:${r}` : "unknown", H = (r) => (r = r.toLowerCase(), r.includes("ios") ? "iOS" : r === "android" ? "Android" : r === "darwin" ? "MacOS" : r === "win32" ? "Windows" : r === "freebsd" ? "FreeBSD" : r === "openbsd" ? "OpenBSD" : r === "linux" ? "Linux" : r ? `Other:${r}` : "Unknown");
let M;
const je = () => M ?? (M = Ue()), Ne = (r) => {
  try {
    return JSON.parse(r);
  } catch {
    return;
  }
}, He = /^[a-z][a-z0-9+.-]*:/i, Me = (r) => He.test(r), ve = (r) => new Promise((e) => setTimeout(e, r)), C = (r, e) => {
  if (typeof e != "number" || !Number.isInteger(e))
    throw new p(`${r} must be an integer`);
  if (e < 0)
    throw new p(`${r} must be a positive integer`);
  return e;
}, O = (r) => {
  if (r instanceof Error)
    return r;
  if (typeof r == "object" && r !== null)
    try {
      return new Error(JSON.stringify(r));
    } catch {
    }
  return new Error(r);
}, v = (r) => {
  if (typeof process < "u")
    return process.env?.[r]?.trim() ?? void 0;
  if (typeof Deno < "u")
    return Deno.env?.get?.(r)?.trim();
};
function Xe(r) {
  if (!r)
    return !0;
  for (const e in r)
    return !1;
  return !0;
}
function We(r, e) {
  return Object.prototype.hasOwnProperty.call(r, e);
}
function X(r, e) {
  for (const t in e) {
    if (!We(e, t))
      continue;
    const n = t.toLowerCase();
    if (!n)
      continue;
    const s = e[t];
    s === null ? delete r[n] : s !== void 0 && (r[n] = s);
  }
}
function b(r, ...e) {
  typeof process < "u" && process?.env?.DEBUG === "true" && console.log(`Groq:DEBUG:${r}`, ...e);
}
const Ve = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (r) => {
  const e = Math.random() * 16 | 0;
  return (r === "x" ? e : e & 3 | 8).toString(16);
}), Ge = () => (
  // @ts-ignore
  typeof window < "u" && // @ts-ignore
  typeof window.document < "u" && // @ts-ignore
  typeof navigator < "u"
), Je = (r) => typeof r?.get == "function", A = (r, e) => {
  const t = e.toLowerCase();
  if (Je(r)) {
    const n = e[0]?.toUpperCase() + e.substring(1).replace(/([^\w])(\w)/g, (s, o, i) => o + i.toUpperCase());
    for (const s of [e, t, e.toUpperCase(), n]) {
      const o = r.get(s);
      if (o)
        return o;
    }
  }
  for (const [n, s] of Object.entries(r))
    if (n.toLowerCase() === t)
      return Array.isArray(s) ? (s.length <= 1 || console.warn(`Received ${s.length} entries for the ${e} header, using the first entry.`), s[0]) : s;
};
class y {
  constructor(e) {
    this._client = e;
  }
}
class de extends y {
  /**
   * Generates audio from the input text.
   */
  create(e, t) {
    return this._client.post("/openai/v1/audio/speech", {
      body: e,
      ...t,
      headers: { Accept: "audio/wav", ...t?.headers },
      __binaryResponse: !0
    });
  }
}
class he extends y {
  /**
   * Transcribes audio into the input language.
   */
  create(e, t) {
    return this._client.post("/openai/v1/audio/transcriptions", F({ body: e, ...t }));
  }
}
class pe extends y {
  /**
   * Translates audio into English.
   */
  create(e, t) {
    return this._client.post("/openai/v1/audio/translations", F({ body: e, ...t }));
  }
}
class S extends y {
  constructor() {
    super(...arguments), this.speech = new de(this._client), this.transcriptions = new he(this._client), this.translations = new pe(this._client);
  }
}
S.Speech = de;
S.Transcriptions = he;
S.Translations = pe;
class ye extends y {
  /**
   * Creates and executes a batch from an uploaded file of requests.
   * [Learn more](/docs/batch).
   */
  create(e, t) {
    return this._client.post("/openai/v1/batches", { body: e, ...t });
  }
  /**
   * Retrieves a batch.
   */
  retrieve(e, t) {
    return this._client.get(`/openai/v1/batches/${e}`, t);
  }
  /**
   * List your organization's batches.
   */
  list(e) {
    return this._client.get("/openai/v1/batches", e);
  }
  /**
   * Cancels a batch.
   */
  cancel(e, t) {
    return this._client.post(`/openai/v1/batches/${e}/cancel`, t);
  }
}
let me = class extends y {
  create(e, t) {
    return this._client.post("/openai/v1/chat/completions", {
      body: e,
      ...t,
      stream: e.stream ?? !1
    });
  }
};
class L extends y {
  constructor() {
    super(...arguments), this.completions = new me(this._client);
  }
}
L.Completions = me;
class we extends y {
}
class ge extends y {
  /**
   * Creates an embedding vector representing the input text.
   */
  create(e, t) {
    return this._client.post("/openai/v1/embeddings", { body: e, ...t });
  }
}
class be extends y {
  /**
   * Upload a file that can be used across various endpoints.
   *
   * The Batch API only supports `.jsonl` files up to 100 MB in size. The input also
   * has a specific required [format](/docs/batch).
   *
   * Please contact us if you need to increase these storage limits.
   */
  create(e, t) {
    return this._client.post("/openai/v1/files", F({ body: e, ...t }));
  }
  /**
   * Returns a list of files.
   */
  list(e) {
    return this._client.get("/openai/v1/files", e);
  }
  /**
   * Delete a file.
   */
  delete(e, t) {
    return this._client.delete(`/openai/v1/files/${e}`, t);
  }
  /**
   * Returns the contents of the specified file.
   */
  content(e, t) {
    return this._client.get(`/openai/v1/files/${e}/content`, {
      ...t,
      headers: { Accept: "application/octet-stream", ...t?.headers },
      __binaryResponse: !0
    });
  }
  /**
   * Returns information about a file.
   */
  info(e, t) {
    return this._client.get(`/openai/v1/files/${e}`, t);
  }
}
class xe extends y {
  /**
   * Get a specific model
   */
  retrieve(e, t) {
    return this._client.get(`/openai/v1/models/${e}`, t);
  }
  /**
   * get all available models
   */
  list(e) {
    return this._client.get("/openai/v1/models", e);
  }
  /**
   * Delete a model
   */
  delete(e, t) {
    return this._client.delete(`/openai/v1/models/${e}`, t);
  }
}
var Re;
class f extends Oe {
  /**
   * API Client for interfacing with the Groq API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['GROQ_API_KEY'] ?? undefined]
   * @param {string} [opts.baseURL=process.env['GROQ_BASE_URL'] ?? https://api.groq.com] - Override the default base URL for the API.
   * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({ baseURL: e = v("GROQ_BASE_URL"), apiKey: t = v("GROQ_API_KEY"), ...n } = {}) {
    if (t === void 0)
      throw new p("The GROQ_API_KEY environment variable is missing or empty; either provide it, or instantiate the Groq client with an apiKey option, like new Groq({ apiKey: 'My API Key' }).");
    const s = {
      apiKey: t,
      ...n,
      baseURL: e || "https://api.groq.com"
    };
    if (!s.dangerouslyAllowBrowser && Ge())
      throw new p(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Groq({ apiKey, dangerouslyAllowBrowser: true })`);
    super({
      baseURL: s.baseURL,
      timeout: s.timeout ?? 6e4,
      httpAgent: s.httpAgent,
      maxRetries: s.maxRetries,
      fetch: s.fetch
    }), this.completions = new we(this), this.chat = new L(this), this.embeddings = new ge(this), this.audio = new S(this), this.models = new xe(this), this.batches = new ye(this), this.files = new be(this), this._options = s, this.apiKey = t;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  defaultHeaders(e) {
    return {
      ...super.defaultHeaders(e),
      ...this._options.defaultHeaders
    };
  }
  authHeaders(e) {
    return { Authorization: `Bearer ${this.apiKey}` };
  }
}
Re = f;
f.Groq = Re;
f.DEFAULT_TIMEOUT = 6e4;
f.GroqError = p;
f.APIError = l;
f.APIConnectionError = k;
f.APIConnectionTimeoutError = Z;
f.APIUserAbortError = B;
f.NotFoundError = ne;
f.ConflictError = se;
f.RateLimitError = ie;
f.BadRequestError = ee;
f.AuthenticationError = te;
f.InternalServerError = ae;
f.PermissionDeniedError = re;
f.UnprocessableEntityError = oe;
f.toFile = fe;
f.fileFromPath = Q;
f.Completions = we;
f.Chat = L;
f.Embeddings = ge;
f.Audio = S;
f.Models = xe;
f.Batches = ye;
f.Files = be;
const Ke = new f({ apiKey: "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" });
async function rt(r) {
  return (await Ke.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a language learning helper that briefly answers the question on the language of the promt"
      },
      {
        role: "user",
        content: r
      }
    ],
    model: "llama-3.3-70b-versatile"
  })).choices[0]?.message?.content || "";
}
export {
  rt as AskHelper
};

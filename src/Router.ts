import findMyWay, { HTTPMethod } from '@jmshal/find-my-way-dist';

type Method =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT';

const ALL_METHODS: Method[] = [
  'DELETE',
  'GET',
  'HEAD',
  'OPTIONS',
  'PATCH',
  'POST',
  'PUT',
];

interface HandlerContext {
  event: FetchEvent;
}

export interface Handler<T = void> {
  (this: HandlerContext, request: Request, params: { [key: string]: string | undefined }, store: T): Response | Promise<Response>;
}

interface HandlerOptions {
  version?: string;
}

export interface RouterOptions {
  defaultRoute?: Handler;
  ignoreTrailingSlash?: boolean;
  allowUnsafeRegex?: boolean;
  caseSensitive?: boolean;
  maxParamLength?: number;
}

export class Router {
  private _options: RouterOptions;
  private fmw: findMyWay.Instance<findMyWay.HTTPVersion.V1>;

  public constructor(options: RouterOptions = {}) {
    this._options = options;
    this.fmw = findMyWay({
      ignoreTrailingSlash: options.ignoreTrailingSlash,
      allowUnsafeRegex: options.allowUnsafeRegex,
      caseSensitive: options.caseSensitive,
      maxParamLength: options.maxParamLength,
    });
  }

  // @ts-ignore
  public on(method: Method | Method[], path: string, handler: Handler): void;
  public on<T>(method: Method | Method[], path: string, handler: Handler<T>, store: T): void;
  public on(method: Method | Method[], path: string, options: HandlerOptions, handler: Handler): void;
  public on<T>(method: Method | Method[], path: string, options: HandlerOptions, handler: Handler<T>, store: T): void;
  public on<T>(method: Method | Method[], path: string, options: HandlerOptions, handler: Handler<T>, store: T) {
    if (typeof options === 'function') {
      store = handler as unknown as T;
      handler = options;
      options = {};
    }
    if (options.version) {
      this.fmw.on(method, path, { version: options.version }, handler as any, store);
    } else {
      this.fmw.on(method, path, handler as any, store);
    }
  }

  public off(method: Method | Method[], path: string) {
    this.fmw.off(method, path);
  }

  // @ts-ignore
  public all(path: string, handler: Handler): void;
  public all<T>(path: string, handler: Handler<T>, store: T): void;
  public all(path: string, options: HandlerOptions, handler: Handler): void;
  public all<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T): void;
  public all<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T) {
    this.on(ALL_METHODS, path, options, handler, store);
  }

  // @ts-ignore
  public delete(path: string, handler: Handler): void;
  public delete<T>(path: string, handler: Handler<T>, store: T): void;
  public delete(path: string, options: HandlerOptions, handler: Handler): void;
  public delete<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T): void;
  public delete<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T) {
    this.on('DELETE', path, options, handler, store);
  }

  // @ts-ignore
  public get(path: string, handler: Handler): void;
  public get<T>(path: string, handler: Handler<T>, store: T): void;
  public get(path: string, options: HandlerOptions, handler: Handler): void;
  public get<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T): void;
  public get<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T) {
    this.on('GET', path, options, handler, store);
  }

  // @ts-ignore
  public head(path: string, handler: Handler): void;
  public head<T>(path: string, handler: Handler<T>, store: T): void;
  public head(path: string, options: HandlerOptions, handler: Handler): void;
  public head<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T): void;
  public head<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T) {
    this.on('HEAD', path, options, handler, store);
  }

  // @ts-ignore
  public options(path: string, handler: Handler): void;
  public options<T>(path: string, handler: Handler<T>, store: T): void;
  public options(path: string, options: HandlerOptions, handler: Handler): void;
  public options<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T): void;
  public options<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T) {
    this.on('OPTIONS', path, options, handler, store);
  }

  // @ts-ignore
  public patch(path: string, handler: Handler): void;
  public patch<T>(path: string, handler: Handler<T>, store: T): void;
  public patch(path: string, options: HandlerOptions, handler: Handler): void;
  public patch<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T): void;
  public patch<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T) {
    this.on('PATCH', path, options, handler, store);
  }

  // @ts-ignore
  public post(path: string, handler: Handler): void;
  public post<T>(path: string, handler: Handler<T>, store: T): void;
  public post(path: string, options: HandlerOptions, handler: Handler): void;
  public post<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T): void;
  public post<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T) {
    this.on('POST', path, options, handler, store);
  }

  // @ts-ignore
  public put(path: string, handler: Handler): void;
  public put<T>(path: string, handler: Handler<T>, store: T): void;
  public put(path: string, options: HandlerOptions, handler: Handler): void;
  public put<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T): void;
  public put<T>(path: string, options: HandlerOptions, handler: Handler<T>, store: T) {
    this.on('PUT', path, options, handler, store);
  }

  private onRequest(event: FetchEvent) {
    const request = event.request;
    const url = new URL(request.url);
    const acceptVersion = request.headers.get('accept-version') ?? undefined;
    const result = this.fmw.find(request.method as HTTPMethod, url.pathname, acceptVersion);

    const context: HandlerContext = {
      event,
    };

    let response: Response | Promise<Response>;

    if (result) {
      const handler = result.handler as unknown as Handler;
      response = handler.call(context, request, result.params, result.store);
    }

    else if (this._options.defaultRoute) {
      response = this._options.defaultRoute.call(context, request, {}, undefined);
    }

    else {
      response = new Response('Not Found', { status: 404 });
    }

    event.respondWith(response);
  }

  public listen() {
    // @ts-ignore
    addEventListener('fetch', (event: FetchEvent) => {
      this.onRequest(event);
    });
  }
}

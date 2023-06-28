import type {
  InitNearOptions,
  InitSocialOptions,
} from './types';

export function initNear({ cache, renderWidget, rpcUrl }: InitNearOptions): any {
  /* @ts-expect-error */
  const provider = new window.nearApi.providers.JsonRpcProvider(rpcUrl);
  return {
    block(blockHeightOrFinality: string) {
      const cacheKey = JSON.stringify({ blockHeightOrFinality: blockHeightOrFinality.toString(), type: 'block' });
      const block = cache[cacheKey];
      if (block || (cacheKey in cache && block === undefined)) {
        setTimeout(() => delete cache[cacheKey], 5000);
        return block;
      }
      provider.block({ finality: blockHeightOrFinality })
        .then((block: any) => {
          cache[cacheKey] = block;
          renderWidget();
        })
        .catch(console.error);
    },
    call(contractName: string, methodName: string, args: string, gas: string, deposit: number) {},
    view(contractName: string, methodName: string, args: string, blockId: string | number | object, subscribe: any) {},
    asyncView(contractName: string, methodName: string, args: string, blockId: string | number | object, subscribe: any) {
      return provider.query({
        request_type: 'call_function',
        finality: blockId,
        account_id: contractName,
        method_name: methodName,
        /* @ts-expect-error */
        args_base64: JSON.stringify(args).toString('base64')
      });
    },
  };
}

interface SocialQueryKey {
  blockHeight?: number;
  path?: string;
  type?: string;
}

interface SocialQueryOptions {
  action?: string;
  key?: SocialQueryKey | string;
  options?: any;
  keys?: string | string[];
}

export function initSocial({ cache, endpointBaseUrl, renderWidget, widgetId }: InitSocialOptions) {
  function cachedQuery({ apiEndpoint, body, cacheKey, method }: { apiEndpoint: string, body: SocialQueryOptions, cacheKey: string, method?: string }) {
    const cached = cache[cacheKey];
    if (cached || (cacheKey in cache && cached === undefined)) {
      return cached;
    }

    function deepEscape(value: any): any {
      if (typeof value === 'string') {
        return value.replace(/\n/g, '⁣');
      }

      if (Array.isArray(value)) {
        return value.map(deepEscape);
      }

      if (value?.toString() === '[object Object]') {
        return Object.entries(value)
          .reduce((escaped, [k, v]) => {
            escaped[k] = deepEscape(v);
            return escaped;
          }, {} as { [key: string]: any });
      }

      return value;
    }

    fetch(apiEndpoint, {
      body: JSON.stringify({
        ...body,
        ...(body.keys && { keys: Array.isArray(body.keys) ? body.keys : [body.keys] }),
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
      .then((res) => res.json())
      .then((json) => {
        let escapedJson = deepEscape(json);
        const { keys } = body;
        const unwrap = (result: { [key: string]: any }, path: string): object | string => {
          return path.split('/')
            .filter((p) => p !== '*' && p !== '**')
            .reduce((val, pathComponent) => {
              if (!val) {
                return val;
              }
              return val[pathComponent];
            }, result);
        };

        if (typeof keys === 'string') {
          escapedJson = unwrap(escapedJson, keys);
        }

        cache[cacheKey] = escapedJson;
        renderWidget();
      })
      .catch((e) => console.log({ apiEndpoint, body, error: e, widgetId }));

    return null;
  }

  return {
    get(patterns: string | string[]/*, finality, options*/) {
      return cachedQuery({
        apiEndpoint: `${endpointBaseUrl}/get`,
        body: { keys: patterns },
        cacheKey: JSON.stringify(patterns),
      });
    },
    getr(patterns: string | string[]/*, finality, options*/) {
      if (typeof patterns === 'string') {
        return this.get(`${patterns}/**`);
      }

      return this.get(patterns.map((p) => `${p}/**`));
    },
    index(action: string, key: string | SocialQueryKey, options: object) {
      return cachedQuery({
        apiEndpoint: `${endpointBaseUrl}/index`,
        body: { action, key, options },
        cacheKey: JSON.stringify({ action, key, options }),
      });
    },
    keys(patterns: string[]/*, finality, options*/) {
      return cachedQuery({
        apiEndpoint: `${endpointBaseUrl}/keys`,
        body: { keys: Array.isArray(patterns) ? patterns : [patterns] },
        cacheKey: JSON.stringify(patterns),
      });
    }
  };
}
